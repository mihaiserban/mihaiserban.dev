---
slug: building-semantic-search-over-a-knowledge-base
title: Building Semantic Search Over a Knowledge Base
description: "Semantic search embeds query and documents into a shared vector space and retrieves by similarity, so paraphrase and synonymy are handled by construction. This is what the rest of this post is about."
date: "2026-05-07T00:00+03:00"
hidden: false
tags: []
---

# Building Semantic Search Over a Knowledge Base

Keyword search breaks whenever users and authors describe the same concept differently. A user searching *"how do I take money out of my account"* may never find an article titled *"Withdrawal Methods"*, even though it's exactly what they want.

Semantic search fixes this by ranking documents based on meaning instead of token overlap. This post walks through a production semantic-search architecture for knowledge bases: retrieval, reranking, chunking, ingestion, caching, evaluation, and the operational tradeoffs that matter once you go past a prototype.

---

## Lexical, Semantic, and Hybrid Search

Before going deeper, it's worth being precise about the three retrieval approaches you'll see compared in any serious search project, because they fail in different ways and the right choice depends on what your corpus and your users look like.

**Lexical search** is the classical approach: tokenize the query and the documents, then score on token overlap with something like BM25. It's cheap, interpretable, requires no model, and is excellent at *exact-match* recall — product codes, error codes, version strings, proper nouns. If a user pastes `ERR_QUOTA_EXCEEDED` into the search box, lexical search will find it in milliseconds with no training data. Its failure mode is the one in the intro: when the user and the author describe the same concept with different words, token overlap goes to zero and recall collapses. *"Take money out"* and *"Withdrawal Methods"* share no tokens.

**Semantic search** embeds query and documents into a shared vector space and retrieves by similarity, so paraphrase and synonymy are handled by construction. This is what the rest of this post is about. Its weakness is the mirror image of lexical's strength: rare tokens the embedding model never saw during training have nowhere meaningful to live in vector space, so they get smeared into nearby concepts. SKUs, internal API names, version numbers, and obscure proper nouns retrieve poorly even when an exact copy of the string exists in the corpus.

**Hybrid search** runs both retrievers in parallel and fuses the results, usually with Reciprocal Rank Fusion (RRF) or a weighted blend of the two normalized score lists. You get exact-match recall on rare tokens *and* paraphrase recall on prose, at the cost of running two retrievers and tuning a fusion step.

The selection rule, in practice:

- **Pure lexical** — small or mostly-structured corpora, search-by-identifier workloads, environments where you don't want the operational weight of embeddings at all.
- **Pure semantic** — prose-heavy knowledge bases, FAQ-style queries, traffic dominated by paraphrase. This is the assumption the rest of this post runs with.
- **Hybrid** — mixed corpora with both prose and rare-token content: developer docs that include API names, e-commerce catalogs with SKUs, support content where users will happily paste error codes alongside natural-language questions. When you don't know in advance which mode your users will lean on, hybrid is the safe default.

The rest of this post focuses on the semantic path because that's the harder system to get right — but the architecture below extends to hybrid cleanly: lexical retrieval becomes a second candidate source feeding the same reranker, and everything downstream stays the same.

---

## The Core Idea: Two-Stage Retrieval

Modern semantic search almost universally uses two stages, because no single model is both fast enough to score every document *and* accurate enough to rank the top results well.

```
Query ──▶ Bi-encoder ──▶ Vector DB ──▶ Top 30 ──▶ Cross-encoder ──▶ Top N
         (fast, broad)   (recall)              (slow, precise)
```

**Stage 1 — Retrieval (bi-encoder).** A bi-encoder embeds the query and every document independently into the same vector space. At query time you only embed the query; document vectors are precomputed. You then ask a vector database for the *k* nearest neighbours by cosine similarity. This is fast because it's a single forward pass plus an ANN lookup.

**Stage 2 — Reranking (cross-encoder).** A cross-encoder takes `(query, document)` pairs together and produces a relevance score. A bi-encoder compresses query and document independently into fixed vectors, so token-level nuance is lost; a cross-encoder attends over both texts jointly, which is what lets it learn that *"take money out"* and *"withdrawal"* are the same intent. The cost is that it can't be precomputed, and it's an order of magnitude slower per document — so you only run it over the top 30 candidates from stage 1.

The split matters: you scale recall with the bi-encoder and precision with the cross-encoder, and you keep latency bounded.

To make this concrete, take the query *"how do I take money out of my account"* through the pipeline:

```
Query: "how do I take money out of my account"

Stage 1 — bi-encoder retrieves top candidates:
  1. "Withdrawal Methods"
  2. "Bank Transfer Limits"
  3. "ATM Cash Withdrawal"
  4. "Account Closure"
  ... (30 total)

Stage 2 — cross-encoder reranks:
  1. "Withdrawal Methods"        (0.94)
  2. "ATM Cash Withdrawal"       (0.81)
  3. "Bank Transfer Limits"      (0.62)
  ...
```

The bi-encoder gets the right cluster of articles into the candidate set; the cross-encoder figures out that *"Withdrawal Methods"* is what the user actually wanted, even though *"Bank Transfer Limits"* shares more vocabulary with everyday banking language.

### Choosing models

For most production workloads you don't need state-of-the-art research models. CPU-friendly small models are usually enough:

- **Bi-encoder:** `intfloat/multilingual-e5-small` — 384 dimensions, multilingual, ~50–100ms per query on CPU.
- **Cross-encoder:** `cross-encoder/ms-marco-TinyBERT-L2-v2` — small enough that scoring 30 candidates takes ~300–800ms on CPU.

These run comfortably on commodity hardware. GPU inference is rarely justified at this scale: model size and batch sizes are small, CPU latency is well under your typical p99 budget, and CPU instances are dramatically cheaper.

Always **L2-normalize** bi-encoder output. Cosine similarity on normalized vectors becomes a dot product, which most vector indexes optimize for, and it makes scores comparable across queries.

---

## Vector Storage: Why PostgreSQL + pgvector

The reflexive choice is a dedicated vector database (Pinecone, Weaviate, Qdrant, Milvus). For a lot of systems that's overkill.

If you already run PostgreSQL, the `pgvector` extension gives you:

- Vectors as a column type alongside your normal relational data.
- HNSW and IVFFlat indexes with cosine, L2, and inner-product distance.
- ACID transactions, joins, filtering by `WHERE` clauses, real backups.
- A boring, well-understood operational profile.

A typical schema looks like this:

```sql
CREATE EXTENSION vector;

CREATE TABLE embeddings (
  id           BIGSERIAL PRIMARY KEY,
  article_id   TEXT NOT NULL,
  tenant       TEXT NOT NULL,
  language     TEXT NOT NULL,
  chunk_type   TEXT NOT NULL,        -- 'title' | 'summary' | 'paragraph'
  text         TEXT NOT NULL,
  embedding    VECTOR(384) NOT NULL,
  metadata     JSONB,
  created_at   TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX ON embeddings
  USING hnsw (embedding vector_cosine_ops)
  WITH (m = 16, ef_construction = 64);

CREATE INDEX ON embeddings (tenant, language);
```

Multi-tenancy is best handled by a `tenant` column rather than separate databases. One HNSW index serves everyone, you filter at query time, and you don't have to manage N migration pipelines.

The query at retrieval time:

```sql
SELECT article_id, chunk_type, text,
       1 - (embedding <=> $query_vector) AS similarity
FROM embeddings
WHERE tenant = $tenant
  AND language = $lang
ORDER BY embedding <=> $query_vector
LIMIT 30;
```

The `<=>` operator is cosine distance under `vector_cosine_ops`. Using it in `ORDER BY` with `LIMIT` is what triggers HNSW; selecting it as a column for the score does not.

Dedicated vector databases become the right call when:

- Vector counts reach tens or hundreds of millions.
- Filtered ANN queries dominate and pgvector's planner struggles to combine HNSW with `WHERE` clauses efficiently.
- You need multi-region replication of the index itself, not just the source data.
- Search becomes its own platform with a dedicated team behind it.

Before that point, pgvector is usually operationally simpler — one database, one backup story, one set of credentials.

---

## Chunking: The Underrated Decision

A 2,000-word article embedded into a single vector is a bad vector. The signal from the introduction gets diluted by every paragraph that follows, and search recall drops on long-form content.

The fix is to embed chunks. For a knowledge base, the natural chunks are:

- **Title** — short, dense, very high signal for direct intent matches.
- **Summary** — slightly longer, captures the "what is this about" framing.
- **Paragraphs** — individual sections that may answer specific sub-questions.

Each chunk becomes its own row in the embeddings table, all pointing back to the same `article_id`. At search time you retrieve chunks, then deduplicate to articles by taking the best-scoring chunk per article — weighted by chunk type so a title match counts for more than a paragraph match.

Why max-with-weight rather than sum? Summing rewards long articles for having many paragraphs, which is exactly the opposite of what you want. The weight prevents a paragraph match from beating a title match on the same query, since title matches usually mean the article is *about* the query, not just *mentions* it. Reasonable starting weights are roughly 1.0 for titles, ~0.85 for summaries, and ~0.7 for paragraphs — tune from there against your evaluation set.

A toy example makes the effect obvious. Query: *"reset MFA"*.

```
Article A — "Reset Multi-Factor Authentication"
  title    similarity = 0.91
  paragraph similarity = 0.74

Article B — "Account Security Best Practices"
  title    similarity = 0.70
  paragraph similarity = 0.82   (mentions MFA reset in passing)

Weighted max:
  A = 0.91 × 1.0  = 0.91
  B = 0.82 × 0.7  = 0.57
```

Article A wins because the title strongly matches the intent, even though Article B has a higher raw paragraph similarity. Without weighting, B would beat A — and the user would land on the wrong article.

For arbitrary text (long-form documentation, PDFs, scraped pages) you don't have natural title/summary/paragraph boundaries. There you need fixed-size chunking with a small overlap (~10–20%) so a concept that straddles a chunk boundary still appears in at least one chunk. For structured KB articles, the natural sections are almost always cleaner than fixed token windows — don't cargo-cult overlap into a domain that doesn't need it.

---

## Ingestion: Make It Asynchronous

A naive ingestion endpoint embeds and writes synchronously inside the HTTP request. This works until:

- An author bulk-uploads 5,000 articles and your API times out.
- The embedding service goes briefly unhealthy and you lose writes.
- A burst of updates pegs CPU and search latency goes through the roof.

The fix is two-phase ingestion with a queue between them:

```
                 ┌─────────────────┐
HTTP POST  ──▶  │ Ingestion API   │ ──▶ FIFO Queue ──▶ Worker pool
                 │ (validate +     │                    (chunk → embed
                 │  enqueue)       │                     → store →
                 └─────────────────┘                     invalidate cache)
                         │
                  HTTP 202 Accepted
```

**Phase A — synchronous.** Validate the payload (required fields, schema, size limits), enqueue a message, return `202 Accepted` with a tracking ID. This should take a few milliseconds.

**Phase B — asynchronous.** A worker pool polls the queue, processes messages with long-polling and parallelism, and writes results to PostgreSQL.

A FIFO queue (e.g. SQS FIFO) buys you ordering guarantees per message group — important for `CREATE` followed by `UPDATE` on the same article landing in the right order — plus a dead-letter queue for poison messages. Worker concurrency can scale on queue depth independently of HTTP traffic.

Message actions worth supporting from day one:

- `CREATE` — embed and insert chunks.
- `UPDATE` — delete existing chunks for the article, then re-embed (it's simpler and safer than diffing).
- `DELETE` — remove all chunks for an article.
- `DELETE_ALL` — clear a tenant. Useful for re-indexing.

---

## Caching: Search-Result Cache, Not Embedding Cache

The temptation is to cache embeddings. Don't bother — they're already in PostgreSQL, and recomputing them is rare. The high-value cache is at the **search-result** layer, where a popular query may be issued thousands of times per minute with the same exact answer.

Cache-aside is the right pattern:

1. Search API receives a query, builds a cache key, checks Redis.
2. **Hit**: return immediately. Total latency is a single Redis round-trip.
3. **Miss**: run the full pipeline (embed → retrieve → rerank), store the result with a TTL, return.

The cache key should encode every dimension that affects the result:

```
search:{tenant}:{lang}:{version}:{filter_hash}:{query_hash}
```

- `tenant`, `lang`, `version` are namespaces — they let you invalidate by prefix.
- `filter_hash` covers any structured filters (categories, product IDs).
- `query_hash` is a hash of the normalized query string (lowercased, trimmed, collapsed whitespace).

A 5-minute TTL is a good starting point. Long enough to absorb traffic spikes from trending queries; short enough that stale results from edits self-heal even if invalidation fails.

**Invalidation matters more than TTL.** When the ingestion worker writes a new article, it should delete cache entries that could now be wrong. The structured key prefix makes this a single pattern delete:

```
DEL search:{tenant}:*
```

You're trading freshness against efficiency. Per-tenant invalidation is usually the right granularity — finer-grained invalidation is hard to get right and rarely worth the complexity.

---

## Service Layout: Why Microservices Help Here

The naive single-service deployment puts API handling, embedding, reranking, and ingestion in one process. This works on day one. It fails on day 100 because the workloads scale on completely different signals.

A four-service split — search API, embedding service, reranker service, ingestion worker — lets each scale on what actually drives its load:

| Service        | Bottleneck                | Scale on       |
|----------------|---------------------------|----------------|
| Search API     | HTTP/orchestration        | Request rate   |
| Embedding      | CPU (one inference/req)   | CPU %          |
| Reranker       | CPU (~30 inferences/req)  | CPU %          |
| Ingestion      | Backlog                   | Queue depth    |

The reranker is the interesting one. It receives 30 candidates *per single search* and runs the cross-encoder over all of them in one batch. That's roughly 6–10× the CPU work of the embedding service per request, so under a 5× traffic spike the reranker may need 8× capacity while the embedding service only needs 2×. If everything scaled together on a single signal, the reranker would be the bottleneck and your tail latencies would blow up.

---

## Evaluation: The System You Actually Tune Against

This is the section that separates demos from production systems, and it's the one most teams skip until they regret it. Without an evaluation set, every change you make to the pipeline — a new model, a different chunking strategy, tweaked weights — becomes anecdotal. *"It feels better"* is not a metric.

Build a labeled set early. It doesn't need to be huge; 50–200 `(query, relevant_article_ids)` pairs are enough to start catching regressions:

| Query                  | Expected article         |
|------------------------|--------------------------|
| "take money out"       | `withdrawal-methods`     |
| "change my password"   | `reset-password`         |
| "cancel subscription"  | `billing-cancellation`   |
| "two factor reset"     | `reset-mfa`              |

Then measure on every change:

- **Recall@30** — did the relevant article appear in the top 30 candidates? This isolates the bi-encoder + index.
- **MRR / nDCG@10** — was it ranked highly in the final result? This isolates the reranker and the score-aggregation logic.
- **Latency p50/p95** — broken down by stage so you can see which subsystem is moving.
- **Cache hit rate** — telling you whether your TTL and key design match real query patterns.

The diagnostic value is what matters more than any individual number:

- High Recall@30 but low MRR → ranking problem. Look at the reranker, scoring weights, or chunk selection.
- Low Recall@30 → retrieval problem. Look at chunking, the bi-encoder, or filters that are too aggressive.
- Both fine on the eval set but users complain → your eval set doesn't represent real queries. Sample from logs.

---

## Putting Numbers on It

A reasonable target for a system like this on commodity hardware:

- **Cached search** (Redis hit): under 50ms end-to-end.
- **Fresh search** (full pipeline): under 400ms p95.
  - Embedding: 50–100ms
  - Vector retrieval (HNSW over millions of rows): 20–50ms
  - Reranking 30 candidates: 300–500ms
- **Ingestion**: 2–5 seconds per article end-to-end, fully async. A worker pool of 4–8 processes handles tens of thousands of articles per hour.

These numbers are entirely CPU-only. The whole stack — Postgres, Redis, queue, four services on Kubernetes — runs comfortably for a few hundred dollars a month at moderate scale, which is far cheaper than most managed vector-DB offerings or GPU-backed inference setups. Worth being explicit: this architecture uses small transformer encoders (bi-encoder for retrieval, cross-encoder for reranking), not an LLM. There's no generative step in the request path, which is exactly why latency and cost stay flat.

---

## A Mental Model to Keep

Semantic search at production scale is mostly about recognizing that the system has three axes — **recall, precision, freshness** — and each subsystem moves only one of them:

- The bi-encoder and HNSW index drive **recall**. Get the right candidates into the top 30.
- The cross-encoder drives **precision**. Order them correctly.
- The ingestion pipeline and cache invalidation drive **freshness**. Show what's true now.

Most search-quality problems are misdiagnosed because someone tries to fix a precision problem with a recall tool, or vice versa. If the right answer isn't in the top 30 candidates, no reranker can save you. If it's there but ranked 8th, no amount of bi-encoder tuning helps. Look at where in the pipeline the answer falls out, then fix that stage.

The surprising part of running production semantic search is that the hard problems are rarely model problems. They're systems problems: chunking, evaluation, cache invalidation, ingestion ordering, latency under load, and knowing whether a given failure is about recall or ranking.
