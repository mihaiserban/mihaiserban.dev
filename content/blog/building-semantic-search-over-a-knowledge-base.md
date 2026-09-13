---
slug: building-semantic-search-over-a-knowledge-base
title: A Two-Stage Search Pipeline for a Knowledge Base
description: "An example search pipeline using embeddings, pgvector and reranking, with the chunking, filtering and evaluation decisions that affect its results."
date: "2026-05-07T00:00+03:00"
hidden: false
tags: []
---

A search for *"how do I take money out of my account"* should find an article called *"Withdrawal Methods"*. A keyword retriever can miss that connection when the indexed text lacks matching words or synonyms. An embedding model may retrieve it because the two texts express a similar intent.

This is an example architecture for that kind of knowledge-base search. The candidate counts and ranking scores below are illustrative, not measurements from a deployed system.

## Retrieve candidates, then rerank them

A bi-encoder embeds documents independently of queries. Store the document vectors ahead of time, then embed each query and retrieve nearby vectors. A cross-encoder can score the resulting query-document pairs together, using both texts to decide their relevance. That second step adds work for every candidate, so keep the candidate set bounded.

```text
Query → Query embedding → Vector search → 30 chunks → Reranker → Article results
```

For the withdrawal query, retrieval might return chunks from *Withdrawal Methods*, *Bank Transfer Limits*, *ATM Cash Withdrawal* and *Account Closure*. The reranker can reorder those chunks, after which the API groups them into article results. It cannot recover an article that retrieval never supplied.

Two stages are an option to evaluate, not a requirement for every search feature. Compare against a lexical baseline such as BM25, especially when users paste error codes, product identifiers or API names. A hybrid retriever can combine lexical and vector candidates using a method such as Reciprocal Rank Fusion before reranking. Measure whether the extra retrieval and inference improve your own queries. [pgvector's hybrid-search examples](https://github.com/pgvector/pgvector#hybrid-search) show how these pieces can fit together.

## Model choice includes language and input formatting

One possible embedding model is [`intfloat/multilingual-e5-small`](https://huggingface.co/intfloat/multilingual-e5-small), which produces 384-dimensional vectors. For retrieval, its inputs should start with `query: ` or `passage: `, including non-English text:

```text
query: how do I take money out of my account
passage: Withdrawal Methods. You can withdraw funds by ...
```

Follow the model's pooling and normalization instructions. L2 normalization makes the dot product equal cosine similarity; it does not calibrate relevance across queries. A score of 0.8 on one query need not mean the same thing as 0.8 on another.

For English, [`cross-encoder/ms-marco-TinyBERT-L2-v2`](https://huggingface.co/cross-encoder/ms-marco-TinyBERT-L2-v2) is a small reranker to evaluate. Its model card is tagged English and describes MS MARCO training. Pairing it with a multilingual embedding model does not establish multilingual ranking quality. A multilingual knowledge base needs reranker evaluation in its supported languages too.

Benchmark inference with your text lengths, candidate count, batch size and expected concurrency. A CPU deployment may be sufficient; these model names alone do not establish a latency target or whether a GPU is economical.

## Store chunks in PostgreSQL

If the application already uses PostgreSQL, pgvector lets the search data share its database and transactions. Here is a starting schema for the 384-dimensional model:

```sql
CREATE EXTENSION IF NOT EXISTS vector;

CREATE TABLE embeddings (
  id           BIGSERIAL PRIMARY KEY,
  article_id   TEXT NOT NULL,
  tenant       TEXT NOT NULL,
  language     TEXT NOT NULL,
  chunk_type   TEXT NOT NULL,
  text         TEXT NOT NULL,
  embedding    VECTOR(384) NOT NULL,
  created_at   TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX ON embeddings
  USING hnsw (embedding vector_cosine_ops);

CREATE INDEX ON embeddings (tenant, language);
```

The following parameterized query uses `$1` for the query vector, `$2` for the tenant and `$3` for the language:

```sql
SELECT article_id, chunk_type, text,
       1 - (embedding <=> $1::vector) AS similarity
FROM embeddings
WHERE tenant = $2
  AND language = $3
ORDER BY embedding <=> $1::vector
LIMIT 30;
```

Ordering by the distance operator with a limit makes the query eligible to use the HNSW index; PostgreSQL still chooses the plan. Check it with `EXPLAIN ANALYZE` on representative data.

There is a filtering catch: with approximate indexes, pgvector applies filters after scanning index candidates. A selective tenant or language filter can therefore leave fewer than 30 results. Starting with pgvector 0.8.0, iterative index scans can search further, up to their configured limits. Depending on the workload, exact search over filtered rows, partitioning or partial indexes may be appropriate. Measure recall as well as query time. [pgvector filtering documentation](https://github.com/pgvector/pgvector#filtering)

A tenant column is one storage design, not an authorization boundary by itself. Derive the tenant from authenticated context and enforce article access rules in retrieval. Choose shared tables, row-level security or stronger separation according to the application's isolation requirements.

## Chunking changes what can be found

A long article can exceed the embedding model's input limit or contain several topics that fit poorly into one vector. Titles, summaries and sections are useful starting boundaries. Split oversized sections to fit the model's token limit, retaining enough context to identify what each chunk describes.

For text without useful boundaries, overlapping token windows are another option. Tune chunk size and overlap against representative questions rather than assuming every document needs the same split.

Each chunk points to its parent article. After reranking, one simple aggregation rule is to keep the best-scoring chunk per article. This avoids adding up many weak matches merely because an article is long. It also means 30 retrieved chunks may produce fewer than 30 distinct articles.

Chunk-type weights are a further heuristic to test. For example, using illustrative nonnegative similarity scores, a title weight of 1.0 and paragraph weight of 0.7 gives:

```text
Article A: Reset Multi-Factor Authentication
  title = 0.78; paragraph = 0.74
  weighted maximum = max(0.78 × 1.0, 0.74 × 0.7) = 0.78

Article B: Account Security Best Practices
  title = 0.70; paragraph = 0.82
  weighted maximum = max(0.70 × 1.0, 0.82 × 0.7) = 0.70
```

Without weighting, B wins with 0.82 against A's 0.78. With these weights, A wins with 0.78 against B's 0.70. This constructed example shows how the heuristic can change the order; it does not establish that the new order is better for real queries. A paragraph discount cannot guarantee that every title match wins. If applying weights to reranker outputs, account for their scale: multiplying a negative score by 0.7 increases it rather than penalizing it.

## Keep ingestion out of the search request

For bulk imports or slow embedding work, an ingestion endpoint can validate and durably enqueue an update, then return `202 Accepted` with a tracking ID. A worker chunks, embeds and stores it separately from search traffic.

Prepare replacement embeddings before removing the current ones. Replace an article's chunks in a transaction, scoped by tenant and article ID, so readers see either the old set or the new set. Give updates versions and make retries idempotent; an older job finishing late must not overwrite newer content.

A FIFO queue can preserve message order within a group, but that is only one part of processing order. Worker writes still need retry handling and version checks. Expose ingestion status so an accepted update is not mistaken for an already-searchable article. [SQS FIFO ordering](https://docs.aws.amazon.com/AWSSimpleQueueService/latest/SQSDeveloperGuide/FIFO-queues-understanding-logic.html)

## Cache results with an explicit freshness policy

A result cache avoids retrieval and reranking for repeated searches. Query-embedding caching is a separate option: it can save embedding work when the same query is reused with different filters. Stored document vectors do not eliminate query-embedding work.

A result-cache key must include everything that changes the answer, including the tenant, language, filters, access scope and model/index version. For example:

```text
search:{tenant}:{generation}:{model_version}:{lang}:{access_hash}:{filter_hash}:{query_hash}
```

Hash a canonical representation of the actual search inputs. Do not lowercase an identifier-sensitive query only for caching while sending its original case to retrieval.

Redis `DEL` accepts literal keys. `DEL search:{tenant}:*` does not expand the wildcard. One invalidation approach is to increment a tenant generation after an index update and use that generation in subsequent cache keys. Old entries expire through a TTL. Another is to iterate with `SCAN MATCH` and delete the returned keys explicitly. Neither approach makes a database write and a Redis update atomic: handle invalidation failures, and avoid caching an in-flight result under a newer generation than the one it searched. [Redis DEL](https://redis.io/docs/latest/commands/del/), [SCAN](https://redis.io/docs/latest/commands/scan/)

Choose the TTL from the allowed staleness. Permission changes may need stronger handling than ordinary article edits; stale cached results must not bypass current access checks.

## Measure before splitting services

Start with a deployment you can operate. Isolate ingestion work from interactive searches when it competes for the same resources. Split embedding and reranking into independently scaled services when measurements show that they need different capacity or release schedules.

Candidate count, text length, batching and concurrency all affect reranker cost. Record throughput and end-to-end p50, p95 and p99 latency under load before choosing a service layout.

Set a latency budget for the full request, including network and orchestration overhead. Measure stage durations to locate bottlenecks, but use the full request distribution to check the budget: adding stage percentiles does not produce an end-to-end percentile.

## Evaluate with questions from the knowledge base

Build a labeled set of queries and relevant article IDs. Include paraphrases, identifiers, supported languages, access restrictions and queries with no relevant answer. Keep a held-out set when tuning models, chunk sizes or weights.

Track retrieval recall at the candidate cutoff, final MRR or nDCG, end-to-end latency and freshness after updates. These measurements overlap: changing chunking or retrieval can change both the candidate set and its final ranking.

When a query fails, inspect its trace. If the relevant article never entered the candidate set, check ingestion, chunking, filters and retrieval. If it arrived but ranked poorly, inspect reranker scores and article aggregation first. Keep the failing query as a regression example so the next change can be judged against it.
