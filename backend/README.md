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

# Starknet Analyst Bounty Platform Backend

A complete NestJS backend application for managing bounty submissions and analyst rewards on the Starknet ecosystem.

## 🏗️ Tech Stack

- **Framework**: NestJS (TypeScript)
- **Database**: PostgreSQL with Prisma ORM
- **Authentication**: JWT with bcrypt password hashing
- **Validation**: class-validator
- **Authorization**: Role-based access control (Admin, Analyst, User)

## 📊 Database Schema

### Tables:
- **users**: id, name, email, password_hash, role, created_at
- **bounties**: id, title, description, reward_amount, status (open, closed, reviewing), created_by (admin id), created_at
- **submissions**: id, bounty_id, analyst_id, link_to_work, status (pending, approved, rejected), submitted_at

## 🚀 Setup Instructions

### 1. Install Dependencies

```bash
npm install
```

### 2. Environment Setup

Copy the environment template:

```bash
cp .env.example .env
```

Update the `.env` file with your configuration:

```env
# Database
DATABASE_URL="postgresql://bounty_user:bounty_password@localhost:5432/starknet_bounty?schema=public"

# JWT Configuration
JWT_SECRET="your-super-secret-jwt-key-change-this-in-production"
JWT_EXPIRES_IN="7d"

# Server Configuration
PORT=3000
NODE_ENV="development"
```

### 3. Start PostgreSQL Database

Start the PostgreSQL database using Docker Compose:

```bash
docker-compose up -d
```

Wait for the database to be ready (check health status):

```bash
docker-compose ps
```

### 4. Run Database Migrations

Generate Prisma client and run migrations:

```bash
npm run prisma:generate
npm run prisma:migrate
```

### 5. Seed the Database

Create initial admin, analyst, and user accounts with sample data:

```bash
npm run prisma:seed
```

**Default accounts created:**
- **Admin**: admin@starknet.io / admin123
- **Analyst**: analyst@starknet.io / analyst123
- **User**: user@starknet.io / user123

### 6. Start the NestJS Server

Start the development server:

```bash
npm run start:dev
```

The server will start on `http://localhost:3000`

## 🧪 Testing with Postman

### 7. Import Postman Collection

1. Open Postman
2. Click "Import" in the top left
3. Select the `postman_collection.json` file from the project root
4. The collection "Starknet Bounty Platform API" will be imported

### 8. Test All Endpoints

The Postman collection includes:

#### Authentication Endpoints:
- **POST** `/api/auth/login` - Login with email/password
- **POST** `/api/auth/signup` - Register new user

#### User Endpoints:
- **GET** `/api/users/profile` - Get current user profile
- **GET** `/api/users` - Get all users (Admin only)
- **GET** `/api/users/stats` - Get user statistics (Admin only)

#### Bounty Endpoints:
- **POST** `/api/bounties` - Create new bounty (Admin only)
- **GET** `/api/bounties` - Get all bounties
- **GET** `/api/bounties?status=OPEN` - Filter bounties by status
- **GET** `/api/bounties/:id` - Get specific bounty with submissions
- **PATCH** `/api/bounties/:id` - Update bounty (Admin only)
- **DELETE** `/api/bounties/:id` - Delete bounty (Admin only)
- **GET** `/api/bounties/stats` - Get bounty statistics (Admin only)

#### Submission Endpoints:
- **POST** `/api/submissions` - Submit work for a bounty
- **GET** `/api/submissions` - Get all submissions (Admin only)
- **GET** `/api/submissions/my-submissions` - Get user's submissions
- **GET** `/api/submissions/:id` - Get specific submission
- **PATCH** `/api/submissions/:id/status` - Approve/reject submission (Admin only)
- **GET** `/api/submissions/stats` - Get submission statistics (Admin only)

### Testing Flow:

1. **Login as Admin**: Run "Admin Login" to get admin token
2. **Create Bounty**: Use "Create Bounty (Admin Only)" 
3. **Login as Analyst**: Run "Analyst Login" to get analyst token
4. **View Bounties**: Use "Get All Bounties" as analyst
5. **Submit Work**: Use "Create Submission" for the bounty
6. **Switch to Admin**: Use admin token to approve/reject submissions

The collection automatically stores tokens and IDs for seamless testing.

## 🌐 Deployment

### Deploy to Railway

1. **Create Railway Account**: Sign up at [railway.app](https://railway.app)

2. **Install Railway CLI**:
```bash
npm install -g @railway/cli
railway login
```

3. **Deploy the Application**:
```bash
railway init
railway add postgresql
railway deploy
```

4. **Set Environment Variables** in Railway dashboard:
```env
JWT_SECRET=your-production-jwt-secret-key
NODE_ENV=production
```

The `DATABASE_URL` will be automatically provided by Railway's PostgreSQL service.

5. **Run Production Migrations**:
```bash
railway run npm run prisma:deploy
railway run npm run prisma:seed
```

### Deploy to Render

1. **Create Render Account**: Sign up at [render.com](https://render.com)

2. **Create PostgreSQL Database**:
   - Go to Dashboard → New → PostgreSQL
   - Note the connection string

3. **Create Web Service**:
   - Connect your GitHub repository
   - Set build command: `npm install && npm run build`
   - Set start command: `npm run start:prod`

4. **Set Environment Variables**:
```env
DATABASE_URL=your-render-postgresql-url
JWT_SECRET=your-production-jwt-secret-key
NODE_ENV=production
```

5. **Deploy and Run Migrations**:
   - The app will auto-deploy on code changes
   - Run migrations via Render shell or locally with production DB URL

## 📁 Project Structure

```
src/
├── common/
│   ├── decorators/          # Custom decorators (roles)
│   └── guards/              # Auth guards (JWT, roles)
├── modules/
│   ├── auth/                # Authentication module
│   │   ├── dto/            # Auth DTOs
│   │   ├── guards/         # Auth guards
│   │   ├── strategies/     # Passport strategies
│   │   ├── auth.controller.ts
│   │   ├── auth.service.ts
│   │   └── auth.module.ts
│   ├── users/              # Users module
│   │   ├── dto/
│   │   ├── users.controller.ts
│   │   ├── users.service.ts
│   │   └── users.module.ts
│   ├── bounties/           # Bounties module
│   │   ├── dto/
│   │   ├── bounties.controller.ts
│   │   ├── bounties.service.ts
│   │   └── bounties.module.ts
│   └── submissions/        # Submissions module
│       ├── dto/
│       ├── submissions.controller.ts
│       ├── submissions.service.ts
│       └── submissions.module.ts
├── prisma/
│   ├── prisma.service.ts
│   └── prisma.module.ts
├── app.module.ts
└── main.ts
```

## 🔐 API Authentication

All protected routes require a JWT token in the Authorization header:

```
Authorization: Bearer <jwt_token>
```

### Role-based Access:

- **Admin**: Can create/update/delete bounties, approve/reject submissions, view all users and platform stats
- **Analyst/User**: Can view bounties, submit work, view their own submissions
- **Public**: Can register and login

## 🐛 Troubleshooting

### Database Connection Issues:

1. Ensure PostgreSQL is running: `docker-compose ps`
2. Check connection string in `.env`
3. Verify database exists: `docker-compose logs postgres`

### Migration Issues:

```bash
# Reset database and migrations
npm run prisma:migrate reset
npm run prisma:seed
```

### JWT Token Issues:

1. Ensure `JWT_SECRET` is set in `.env`
2. Check token expiry (default: 7 days)
3. Verify Authorization header format

### Permission Denied Errors:

1. Check user role in JWT payload
2. Ensure proper role decorators on controllers
3. Verify RolesGuard is applied

## 📝 API Response Examples

### Successful Login Response:
```json
{
  "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "clp8f2b3h0000...",
    "name": "Admin User",
    "email": "admin@starknet.io",
    "role": "ADMIN"
  }
}
```

### Bounty Response:
```json
{
  "id": "clp8f2b3h0001...",
  "title": "Starknet Transaction Analysis",
  "description": "Analyze transaction patterns...",
  "reward_amount": 500.0,
  "status": "OPEN",
  "created_at": "2024-01-15T10:30:00.000Z",
  "creator": {
    "id": "clp8f2b3h0000...",
    "name": "Admin User",
    "email": "admin@starknet.io"
  },
  "_count": {
    "submissions": 2
  }
}
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/new-feature`
3. Commit changes: `git commit -m 'Add new feature'`
4. Push to branch: `git push origin feature/new-feature`
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License.