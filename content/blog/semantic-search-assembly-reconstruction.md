---
slug: semantic-search-assembly-reconstruction
title: "Semantic Search at Production Scale: Recall, Precision, Freshness"
date: "2026-07-15T21:00+03:00"
hidden: false
tags: ["search", "semantic-search", "embeddings", "architecture"]
---

Keyword search breaks whenever users and authors describe the same concept differently. A user searching *"how do I take money out of my account"* may never find an article titled *"Withdrawal Methods"*, even though it's exactly what they want.

Semantic search fixes this by ranking documents based on meaning instead of token overlap. This post walks through a production semantic-search architecture: retrieval, reranking, chunking, ingestion, caching, evaluation, and the operational tradeoffs that matter once you go past a prototype.

---

## Lexical, Semantic, and Hybrid Search

Three retrieval approaches, each failing in different ways:

**Lexical search** (BM25) is cheap, interpretable, requires no model, and excels at exact-match recall — product codes, error strings, proper nouns. Its failure mode: when user and author describe the same concept with different words, token overlap goes to zero. *"Take money out"* and *"Withdrawal Methods"* share no tokens.

**Semantic search** embeds query and documents into a shared vector space and retrieves by similarity, so paraphrase and synonymy are handled by construction. Its weakness is the mirror image: rare tokens the embedding model never saw during training get smeared into nearby concepts. SKUs, internal API names, and version numbers retrieve poorly even when an exact copy exists in the corpus.

**Hybrid search** runs both retrievers in parallel and fuses results with Reciprocal Rank Fusion or a weighted blend. You get exact-match recall on rare tokens *and* paraphrase recall on prose, at the cost of running two retrievers and tuning a fusion step.

The selection rule: pure lexical for small structured corpora, pure semantic for prose-heavy knowledge bases, hybrid for mixed corpora where you can't predict which mode users will lean on. The rest of this post focuses on the semantic path — the harder system to get right — but the architecture extends to hybrid cleanly: lexical retrieval becomes a second candidate source feeding the same reranker.

---

## The Core Idea: Two-Stage Retrieval

No single model is both fast enough to score every document *and* accurate enough to rank the top results well. Modern semantic search uses two stages:

```
Query ──▶ Bi-encoder ──▶ Vector DB ──▶ Top 30 ──▶ Cross-encoder ──▶ Top N
         (fast, broad)   (recall)              (slow, precise)
```

**Stage 1 — Retrieval (bi-encoder).** Embeds query and documents independently into the same vector space. Document vectors are precomputed; at query time you only embed the query and ask a vector database for the *k* nearest neighbours by cosine similarity. Fast: a single forward pass plus an ANN lookup.

**Stage 2 — Reranking (cross-encoder).** Takes `(query, document)` pairs together and produces a relevance score. A bi-encoder compresses query and document independently, so token-level nuance is lost; a cross-encoder attends over both texts jointly, which is what lets it learn that *"take money out"* and *"withdrawal"* are the same intent. It can't be precomputed and is an order of magnitude slower — so you only run it over the top 30 candidates.

The split matters: you scale recall with the bi-encoder and precision with the cross-encoder, and you keep latency bounded.

For production: `intfloat/multilingual-e5-small` (384 dimensions, CPU-friendly) as bi-encoder, `cross-encoder/ms-marco-TinyBERT-L2-v2` as cross-encoder. GPU inference is rarely justified at this scale. Always **L2-normalize** bi-encoder output — cosine similarity on normalized vectors becomes a dot product, which most vector indexes optimize for.

---

## Vector Storage: PostgreSQL + pgvector

The reflexive choice is a dedicated vector database. For a lot of systems that's overkill. If you already run PostgreSQL, `pgvector` gives you vector columns alongside relational data, HNSW and IVFFlat indexes, ACID transactions, joins, filtering, and a boring, well-understood operational profile.

Multi-tenancy is best handled by a `tenant` column rather than separate databases. One HNSW index serves everyone, you filter at query time, and you don't manage N migration pipelines.

Dedicated vector databases become the right call when vector counts reach tens or hundreds of millions, when filtered ANN queries dominate and pgvector's planner struggles to combine HNSW with `WHERE` clauses, when you need multi-region replication of the index itself, or when search becomes its own platform with a dedicated team. Before that point, pgvector is operationally simpler — one database, one backup story, one set of credentials.

---

## Chunking: The Underrated Decision

A 2,000-word article embedded into a single vector is a bad vector. The signal from the introduction gets diluted by every paragraph that follows, and search recall drops on long-form content.

For a knowledge base, the natural chunks are **title** (short, dense, very high signal for direct intent matches), **summary** (captures the "what is this about" framing), and **paragraphs** (individual sections that may answer specific sub-questions). Each chunk becomes its own row, all pointing back to the same article.

At search time, deduplicate to articles by taking the **weighted max** of chunk scores — weighted by chunk type so a title match counts for more than a paragraph match. Why max and not sum? Summing rewards long articles for having many paragraphs, which is the opposite of what you want. Without weighting, an article that merely *mentions* a query in passing can beat an article that *is about* the query.

For unstructured text (long-form docs, PDFs, scraped pages), use fixed-size chunking with ~10–20% overlap so a concept straddling a boundary still appears in at least one chunk. For structured KB articles, the natural sections are almost always cleaner than fixed token windows.

---

## Ingestion: Make It Asynchronous

A naive ingestion endpoint embeds and writes synchronously inside the HTTP request. This works until an author bulk-uploads 5,000 articles and your API times out, or the embedding service goes briefly unhealthy and you lose writes.

The fix is two-phase ingestion with a queue between them: the API validates and enqueues (returning `202 Accepted` with a tracking ID), then a worker pool polls the queue, processes messages, and writes results to PostgreSQL. Worker concurrency scales on queue depth independently of HTTP traffic.

For updates, delete existing chunks and re-embed — it's simpler and safer than diffing.

---

## Caching: Search-Result Cache, Not Embedding Cache

The temptation is to cache embeddings. Don't bother — they're already in PostgreSQL, and recomputing them is rare. The high-value cache is at the **search-result** layer, where a popular query may be issued thousands of times per minute with the same answer.

Cache-aside is the right pattern: check Redis on query, return on hit, run the full pipeline on miss and store with a TTL. The cache key should encode every dimension that affects the result: tenant, language, version, filters, and query hash. A 5-minute TTL absorbs traffic spikes while stale results from edits self-heal.

**Invalidation matters more than TTL.** When the ingestion worker writes a new article, it should delete cache entries that could now be wrong. Per-tenant invalidation is usually the right granularity — finer-grained invalidation is hard to get right and rarely worth the complexity.

---

## Service Layout: Why Microservices Help Here

A single-service deployment works on day one. It fails on day 100 because the workloads scale on completely different signals:

| Service | Bottleneck | Scale on |
|---|---|---|
| Search API | HTTP/orchestration | Request rate |
| Embedding | CPU (one inference/req) | CPU % |
| Reranker | CPU (~30 inferences/req) | CPU % |
| Ingestion | Backlog | Queue depth |

The reranker is the interesting one. It receives 30 candidates *per search* and runs the cross-encoder over all of them in one batch — roughly 6–10× the CPU work of the embedding service per request. Under a 5× traffic spike, the reranker may need 8× capacity while the embedding service only needs 2×. If everything scaled together, the reranker would be the bottleneck and tail latencies would blow up.

---

## Evaluation: The System You Actually Tune Against

Without an evaluation set, every change — a new model, a different chunking strategy, tweaked weights — becomes anecdotal. *"It feels better"* is not a metric.

Build a labeled set early. 50–200 `(query, relevant_article_ids)` pairs are enough to start catching regressions. Then measure on every change:

- **Recall@30** — did the relevant article appear in the top 30? Isolates the bi-encoder + index.
- **MRR / nDCG@10** — was it ranked highly in the final result? Isolates the reranker and score-aggregation.
- **Latency p50/p95** — broken down by stage so you can see which subsystem is moving.
- **Cache hit rate** — whether your TTL and key design match real query patterns.

The diagnostic value matters more than any individual number:

- High Recall@30 but low MRR → **ranking problem**. Look at the reranker, scoring weights, or chunk selection.
- Low Recall@30 → **retrieval problem**. Look at chunking, the bi-encoder, or filters that are too aggressive.
- Both fine on the eval set but users complain → your **eval set doesn't represent real queries**. Sample from logs.

---

## Putting Numbers on It

Reasonable targets on commodity hardware (entirely CPU-only):

- **Cached search** (Redis hit): under 50ms end-to-end.
- **Fresh search** (full pipeline): under 400ms p95.
- **Ingestion**: 2–5 seconds per article, fully async. A pool of 4–8 workers handles tens of thousands of articles per hour.

The whole stack runs comfortably for a few hundred dollars a month at moderate scale. This architecture uses small transformer encoders, not an LLM — there's no generative step in the request path, which is exactly why latency and cost stay flat.

---

## A Mental Model to Keep

Semantic search at production scale has three axes — **recall, precision, freshness** — and each subsystem moves only one:

- The bi-encoder and HNSW index drive **recall**. Get the right candidates into the top 30.
- The cross-encoder drives **precision**. Order them correctly.
- The ingestion pipeline and cache invalidation drive **freshness**. Show what's true now.

Most search-quality problems are misdiagnosed because someone tries to fix a precision problem with a recall tool, or vice versa. If the right answer isn't in the top 30, no reranker can save you. If it's there but ranked 8th, no amount of bi-encoder tuning helps. Look at where in the pipeline the answer falls out, then fix that stage.

The surprising part of running production semantic search is that the hard problems are rarely model problems. They're systems problems: chunking, evaluation, cache invalidation, ingestion ordering, latency under load, and knowing whether a given failure is about recall or ranking.