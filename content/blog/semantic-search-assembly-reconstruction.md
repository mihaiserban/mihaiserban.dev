---
slug: semantic-search-assembly-reconstruction
title: "An Example Semantic-Search Pipeline: Recall, Ranking, Freshness"
date: "2026-07-15T21:00+03:00"
hidden: false
tags: ["search", "semantic-search", "embeddings", "architecture"]
---

A search for *"how do I take money out of my account"* should find *"Withdrawal Methods"*. Keyword search can miss that connection when the indexed text has no matching words. An embedding model may retrieve it because the texts express similar intent.

This is an example knowledge-base search architecture. The candidate counts and ranking scores below are illustrative, not production measurements.

## Lexical, semantic, and hybrid search

**Lexical search** such as BM25 is useful for exact strings including product codes, error messages, and proper nouns. **Semantic search** can retrieve paraphrases, but rare names and identifiers may rank poorly. **Hybrid search** combines candidates from both methods, for example with Reciprocal Rank Fusion, before reranking.

Compare against a lexical baseline when users search for identifiers or error codes. A hybrid approach adds retrieval and tuning work, so measure whether it improves representative queries.

## Two-stage retrieval

```text
Query → Query embedding → Vector search → 30 chunks → Reranker → Article results
```

A bi-encoder embeds documents independently of queries. Store document vectors ahead of time, then embed a query and retrieve nearby vectors. A cross-encoder scores the resulting query-document pairs together. It adds work for every candidate, so the candidate set should be bounded.

For the withdrawal query, retrieval might return chunks from *Withdrawal Methods*, *Bank Transfer Limits*, *ATM Cash Withdrawal*, and *Account Closure*. The reranker can reorder those chunks, after which the API groups them into articles. It cannot recover an article that retrieval did not supply.

## Model choice includes language and input formatting

One possible embedding model is [`intfloat/multilingual-e5-small`](https://huggingface.co/intfloat/multilingual-e5-small), which produces 384-dimensional vectors. Its retrieval inputs should start with `query: ` or `passage: `, including non-English text:

```text
query: how do I take money out of my account
passage: Withdrawal Methods. You can withdraw funds by ...
```

Follow the model's pooling and normalization guidance. L2 normalization makes the dot product equal cosine similarity; it does not calibrate relevance across queries. A score of 0.8 on one query need not carry the same meaning on another.

For English, [`cross-encoder/ms-marco-TinyBERT-L2-v2`](https://huggingface.co/cross-encoder/ms-marco-TinyBERT-L2-v2) is a small reranker to evaluate. Its model card is tagged English and describes MS MARCO training. Pairing it with a multilingual embedding model does not establish multilingual ranking quality. Evaluate a multilingual knowledge base in each supported language.

Benchmark inference with your text lengths, candidate count, batch size, and expected concurrency. Model names alone do not establish a latency target or whether a GPU is economical.

## Vector storage with PostgreSQL and pgvector

If the application already uses PostgreSQL, pgvector can keep search data in the same database and transactions. Here is a starting schema for 384-dimensional vectors:

```sql
CREATE EXTENSION IF NOT EXISTS vector;

CREATE TABLE embeddings (
  id BIGSERIAL PRIMARY KEY,
  article_id TEXT NOT NULL,
  tenant TEXT NOT NULL,
  language TEXT NOT NULL,
  chunk_type TEXT NOT NULL,
  text TEXT NOT NULL,
  embedding VECTOR(384) NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX ON embeddings USING hnsw (embedding vector_cosine_ops);
CREATE INDEX ON embeddings (tenant, language);
```

```sql
SELECT article_id, chunk_type, text,
       1 - (embedding <=> $1::vector) AS similarity
FROM embeddings
WHERE tenant = $2 AND language = $3
ORDER BY embedding <=> $1::vector
LIMIT 30;
```

Ordering by the distance operator with a limit makes the query eligible to use the HNSW index, although PostgreSQL still chooses the plan. Check it with `EXPLAIN ANALYZE` on representative data.

With approximate indexes, pgvector applies filters after scanning index candidates. A selective tenant or language filter can leave fewer than 30 results. Starting with pgvector 0.8.0, iterative index scans can search further up to configured limits. Depending on the workload, exact filtered search, partitioning, or partial indexes may fit better. Measure recall as well as query time. [pgvector filtering documentation](https://github.com/pgvector/pgvector#filtering)

A tenant column is one storage design, not an authorization boundary by itself. Derive the tenant from authenticated context and enforce article access rules in retrieval. Choose shared tables, row-level security, or stronger separation according to the application's isolation requirements.

## Chunking changes what can be found

Titles, summaries, and sections are useful starting boundaries. Split oversized sections to fit the model's token limit while retaining enough context to identify the chunk. For text without useful boundaries, overlapping token windows are another option. Tune chunk size and overlap against representative questions.

Each chunk points to its parent article. After reranking, one aggregation rule is to keep the best-scoring chunk per article. This avoids rewarding long articles simply for having many paragraphs, and means 30 retrieved chunks may produce fewer than 30 articles.

Chunk-type weights are a heuristic to test. With illustrative nonnegative similarity scores, a title weight of 1.0 and paragraph weight of 0.7 gives:

```text
Article A: Reset Multi-Factor Authentication
  title = 0.78; paragraph = 0.74
  weighted maximum = max(0.78 × 1.0, 0.74 × 0.7) = 0.78

Article B: Account Security Best Practices
  title = 0.70; paragraph = 0.82
  weighted maximum = max(0.70 × 1.0, 0.82 × 0.7) = 0.70
```

Without weighting, B wins with 0.82 against A's 0.78. With these weights, A wins with 0.78 against B's 0.70. The example shows how the heuristic can change ordering; it does not establish that the changed order is better. A paragraph discount cannot guarantee that a title match wins. If applying weights to reranker outputs, account for their scale: multiplying a negative score by 0.7 increases it rather than penalizing it.

## Ingestion and caching

For bulk imports or slow embedding work, an ingestion endpoint can validate and durably enqueue an update, then return `202 Accepted` with a tracking ID. A worker chunks, embeds, and stores it separately from search traffic.

Prepare replacement embeddings before removing current ones. Replace an article's chunks in a transaction scoped by tenant and article ID, so readers see either the old set or the new set. Give updates versions and make retries idempotent; an older job finishing late must not overwrite newer content.

A result cache avoids retrieval and reranking for repeated searches. Query-embedding caching is a separate option when the same query is reused with different filters. Stored document vectors do not eliminate query-embedding work.

```text
search:{tenant}:{generation}:{model_version}:{lang}:{access_hash}:{filter_hash}:{query_hash}
```

A result-cache key must include every input that changes the answer, including tenant, language, filters, access scope, and model or index version. Hash a canonical representation of the actual search inputs.

Redis `DEL` accepts literal keys. `DEL search:{tenant}:*` does not expand the wildcard. One invalidation approach increments a tenant generation after an index update and uses that generation in subsequent cache keys. Another iterates with `SCAN MATCH` and deletes returned keys explicitly. Neither makes a database write and a Redis update atomic, so handle invalidation failures and avoid caching an in-flight result under a newer generation than the one it searched. [Redis DEL](https://redis.io/docs/latest/commands/del/), [SCAN](https://redis.io/docs/latest/commands/scan/)

Choose the TTL from the allowed staleness. Permission changes may need stronger handling than ordinary article edits; cached results must not bypass current access checks.

## Measure before splitting services

Start with a deployment you can operate. Isolate ingestion from interactive searches when they compete for resources. Split embedding and reranking into independently scaled services when measurements show different capacity or release needs.

Candidate count, text length, batching, and concurrency affect reranker cost. Record throughput and end-to-end p50, p95, and p99 latency under load. Set a budget for the full request, including network and orchestration overhead. Stage timings locate bottlenecks, but adding stage percentiles does not produce an end-to-end percentile.

## Evaluate with knowledge-base questions

Build a labeled set of queries and relevant article IDs. Include paraphrases, identifiers, supported languages, access restrictions, and queries with no relevant answer. Keep a held-out set when tuning models, chunk sizes, or weights.

Track retrieval recall at the candidate cutoff, final MRR or nDCG, end-to-end latency, and freshness after updates. These measurements overlap: changing chunking or retrieval can change both the candidate set and final ranking.

When a query fails, inspect its trace. If the relevant article never entered the candidate set, check ingestion, chunking, filters, and retrieval. If it arrived but ranked poorly, inspect reranker scores and article aggregation first. Keep the failing query as a regression example.
