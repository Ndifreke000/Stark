# Starklytics Backend Architecture and Implementation Guide

This document describes the backend architecture, core responsibilities, API surface, storage model, and the role of StarkNet RPC. It is intended to guide backend implementation now and align with the on-chain/Indexer roadmap.

## Goals

- Provide secure, scalable APIs for:
  - Authentication (wallet/email)
  - Dashboards (CRUD, public links, export)
  - Query execution (SQL over StarkNet datasets; future: RPC-backed data access)
  - Bounties (create/list/detail; submissions; judging/payout with on-chain integration)
- Handle async workloads (long-running queries, indexing, exports)
- Persist data in a relational DB and object storage
- Integrate with StarkNet RPC for chain reads/indexing; leave transaction signing to the client wallets when possible

## High-Level Architecture

```
┌────────────────────────────────────────────────────────────────┐
│                         Backend (Node/TS)                      │
├────────────────────────────────────────────────────────────────┤
│  API Gateway (REST/GraphQL)                                    │
│  - Auth (wallet/email)                                         │
│  - Dashboards (CRUD, publish, export)                          │
│  - Queries (execute, status, results)                          │
│  - Bounties (create, list, submissions)                        │
│  - Indexer webhooks/internal endpoints                         │
├────────────────────────────────────────────────────────────────┤
│  Services                                                       │
│  - Indexer (StarkNet RPC event ingestion → DB)                 │
│  - Worker/Queue (queries, exports, IPFS pinning)               │
│  - IPFS client (pinning, fetching)                             │
│  - RPC client (StarkNet reads, optional tx relay)              │
│  - Cache (Redis)                                               │
├────────────────────────────���───────────────────────────────────┤
│  Storage                                                       │
│  - PostgreSQL (relational source of truth)                     │
│  - S3-compatible object storage (artifacts/exports)            │
│  - IPFS (bounty metadata, submissions)                         │
└────────────────────────────────────────────────────────────────┘
```

## Role of StarkNet RPC

- Read chain state and events for bounties:
  - BountyCreated, Submission, WinnersSelected, Cancelled/Refunded
- Index events into DB for fast filtering/sorting in the UI
- Provide chain context: chainId, contract metadata, token decimals
- Verify wallet signatures for authentication (typed data domain chainId)
- Transaction flow (recommended):
  - Client signs and sends transactions via wallet (Argent X/Braavos)
  - Backend does NOT custody keys
- Optional: 
  - Backend may send read-only calls or simulate transactions
  - If a relayer pattern is adopted later, secure key management becomes required

## Services and Responsibilities

1) API (REST/GraphQL)
- Auth
  - Wallet login via StarkNet typed data signatures (verify server-side)
  - Email/password (optional) with JWT
- Dashboards
  - CRUD, publish/unpublish, list by owner, public read via slug/id
  - Export PNG/CSV: trigger worker job; respond with artifact URL
- Queries
  - Submit query → enqueue job → polling/status API → fetch results
  - Result pagination, retention policy, rate limiting
- Bounties
  - Create bounty metadata → PIN to IPFS → return CID
  - List bounties: resolve on-chain + off-chain metadata
  - Submissions: store to IPFS, push submitSolution tx (client) or return CID
  - Winner selection: record selection off-chain and via on-chain tx (client)

2) Indexer
- Poll StarkNet RPC for events from BountyFactory (and related contracts)
- Maintain cursors (from_block) for reliable progress
- Idempotent ingestion (dedupe by tx_hash + event_index)
- Backfill support and reorg handling strategy

3) Worker/Queue
- Query execution (long-running jobs)
- IPFS pinning and fetch
- Image/CSV export generation
- Retry policy, DLQ, observability (metrics/logs)

4) Storage
- PostgreSQL schemas
  - users(id, address, email, name, created_at, ...)
  - dashboards(id, owner_id, name, description, is_public, created_at, updated_at)
  - dashboard_widgets(id, dashboard_id, type, config_json, data_ref, position)
  - queries(id, owner_id, sql, dataset, status, started_at, finished_at)
  - query_results(id, query_id, columns_json, rows_ref, row_count, bytes, ttl)
  - bounties(id, onchain_id, factory_addr, creator_addr, token_addr, total_reward, deadline, status, metadata_cid, created_at, updated_at)
  - submissions(id, bounty_id, solver_addr, metadata_cid, submitted_at)
  - winner_selections(id, bounty_id, selections_json, tx_hash, selected_at)
  - indexer_cursors(id, contract_addr, last_block, last_tx_hash)
- Object storage
  - Export artifacts (CSV/PNG), large query results
- IPFS
  - Bounty metadata JSON
  - Submission metadata (SQL, insights, links)

## API Surface (Illustrative)

- Auth
  - POST /api/auth/nonce → { nonce }
  - POST /api/auth/verify-signature { address, signature, nonce } → { jwt }
  - POST /api/auth/signin { email, password } → { jwt }
- Dashboards
  - GET /api/dashboards?owner=me
  - POST /api/dashboards
  - GET /api/dashboards/:id (public respects is_public)
  - PATCH /api/dashboards/:id { name, description, is_public }
  - POST /api/dashboards/:id/export/png → { job_id }
- Queries
  - POST /api/query/execute { sql, dataset } → { query_id }
  - GET /api/query/:id/status → { status, progress }
  - GET /api/query/:id/results?offset=&limit= → { columns, rows, row_count }
  - POST /api/query/:id/export/csv → { job_id }
- Bounties
  - GET /api/bounties?status=&creator=&tag=
  - GET /api/bounties/:id
  - POST /api/bounties { metadata, token, total_reward, deadline } → { metadata_cid } (client sends tx)
  - POST /api/bounties/:id/submissions { metadata } → { metadata_cid } (client sends tx)
  - POST /api/bounties/:id/winners { selections } → optional recording + return prepared payload
- Indexer (internal)
  - POST /internal/indexer/run?from_block=
  - POST /internal/ipfs/pin { json } → { cid }

## Authentication and Authorization

- Wallet auth: verify StarkNet typed data signatures against expected domain (name/version/chainId)
- JWT for session; store short-lived; refresh tokens optional
- RBAC: creator vs solver privileges for bounty actions
- CSRF for web sessions (if cookie-based)

## StarkNet RPC Integration Details

- Providers: Sepolia (testnet), Mainnet
- Use getEvents with proper chunking and pagination
- Store contract addresses and ABIs; generate event keys selectively for efficient filtering
- Deadlines stored as unix timestamp (seconds) on-chain; convert to ms in API
- Token decimals: cache ERC20 metadata for display/validation

## Query Execution (Placeholder → Future)

- Initial dev: mock datasets/local DB
- Next: connect to analytics warehouse (e.g., ClickHouse/Postgres/BigQuery) that is populated by an indexer pipeline of StarkNet data
- Enforce quotas and limits per plan
- Materialize results for caching and reuse (TTL policy)

## Exports

- Image (PNG): render headless (HTML → image) or accept client-generated data URL → store and return URL
- CSV: stream results from DB → object storage; avoid loading all rows in memory

## Observability and Ops

- Metrics: request latency, queue depth, indexer lag, RPC errors
- Structured logging with request ids, job ids
- Tracing (optional)
- Health endpoints: /health, /ready

## Security and Compliance

- Input validation/sanitization everywhere (zod/joi class-validator)
- Rate limiting by IP/user
- CORS policy to match frontend domains
- Encrypted secrets; rotate keys
- DoS protection on heavy endpoints (queries, exports)

## Environment Configuration

- DATABASE_URL
- REDIS_URL
- S3_ENDPOINT/S3_BUCKET/S3_ACCESS_KEY/S3_SECRET_KEY
- IPFS_API, IPFS_GATEWAY
- STARKNET_RPC_URL (Sepolia/Mainnet)
- BOUNTY_FACTORY_ADDRESS
- JWT_SECRET, COOKIE_SECRET

## Local Development

- docker-compose (optional) for Postgres + Redis + MinIO
- Seed scripts for demo data
- npm run dev for API; worker process for queue

## Migration to On-Chain MVP

- Replace bounty creation/submission endpoints to return prepared payloads (metadata CIDs) and rely on client wallets to send transactions
- Indexer becomes the source of truth for bounty lifecycle; API augments with metadata joins
- Carefully migrate existing local IDs to on-chain ids mapping table

---

This backend plan enables immediate development with local mocks and a clean path toward full on-chain integration using StarkNet RPC and an indexing pipeline.