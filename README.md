# Starklytics Stark

A modern analytics platform for Starknet data, featuring a powerful query editor, dashboard builder, and data visualization tools.

## 🚀 Features

- **Advanced SQL Query Editor** with schema explorer and real-time execution
- **Data Visualization** with multiple chart types (table, chart, counter, pivot)
- **Dashboard Builder** with drag-and-drop interface and responsive layouts
- **Bounty Management System** for Starknet analytics tasks
- **Real-time Updates** with WebSocket integration
- **Starknet Wallet Integration** (Argent X, Braavos)
- **Dark/Light Mode** support with theme switching
- **Role-based Access Control** with admin, analyst, and user roles

## 🏗️ System Architecture

```
┌──────────────────────────────────────────────────────────────────────────────┐
│                          Starklytics Platform                                │
├──────────────────────────────────────────────────────────────────────────────┤
│  Frontend (React/Vite)                                                       │
│  - Query Editor (CodeMirror/Monaco)                                          │
│  - Dashboard Builder (React Grid Layout)                                     │
│  - Data Visualization (Chart.js, Recharts)                                   │
│  - Wallet Integration (Starknet React)                                       │
│  - Real-time Updates (Socket.io)                                             │
├──────────────────────────────────────────────────────────────────────────────┤
│  Backend (NestJS)                                                            │
│  - REST/GraphQL APIs                                                         │
│  - Authentication (JWT + Wallet Signatures)                                  │
│  - Database Operations (Prisma + PostgreSQL)                                 │
│  - Query Execution Engine                                                    │
│  - Bounty Management System                                                  │
│  - Starknet RPC Integration                                                  │
├──────────────────────────────────────────────────────────────────────────────┤
│  Server (Express + WebSocket)                                                │
│  - Real-time Communication                                                   │
│  - WebSocket Events Handling                                                 │
│  - API Gateway                                                               │
├──────────────────────────────────────────────────────────────────────────────┤
│  Smart Contracts (Cairo)                                                     │
│  - BountyFactory: Manage bounty lifecycle and escrow                         │
│  - ERC20 Integration: Token rewards and transfers                            │
│  - Event-driven Architecture for indexing                                    │
└──────────────────────────────────────────────────────────────────────────────┘
```

## 🛠️ Technology Stack

### Frontend
- **Framework**: React 18 + TypeScript
- **Build Tool**: Vite
- **Styling**: Tailwind CSS + Framer Motion
- **UI Components**: Custom animated components
- **Query Editor**: CodeMirror, Monaco Editor
- **Charts**: Chart.js, Recharts, D3.js
- **State Management**: React Context + Zustand
- **Routing**: React Router v6
- **Wallet Integration**: @starknet-react/core
- **Real-time**: Socket.io Client

### Backend
- **Framework**: NestJS
- **Database**: PostgreSQL with Prisma ORM
- **Authentication**: JWT + Passport + bcrypt
- **Validation**: class-validator + class-transformer
- **Real-time**: Socket.io + WebSocket
- **Starknet Integration**: starknet.js
- **File Storage**: IPFS integration
- **Caching**: Redis (optional)

### Smart Contracts
- **Language**: Cairo
- **Framework**: Scarb
- **Pattern**: Factory contract with struct storage
- **Integration**: Event-driven architecture
- **Security**: Reentrancy protection, access control

## 📁 Project Structure

```
Stark/
├── src/                          # Frontend React application
│   ├── components/              # Reusable UI components
│   │   ├── ui/                  # Base UI components (AnimatedButton, etc.)
│   │   ├── QueryEditor/         # Query editor components
│   │   ├── Visuals/             # Data visualization components
│   │   ├── Dashboard/           # Dashboard builder components
│   │   └── Swap/                # Token swap components
│   ├── pages/                   # Application pages
│   │   ├── DashboardBuilder.tsx # Dashboard creation
│   │   ├── QueryEditor.tsx      # SQL query editor
│   │   ├── Bounties.tsx         # Bounty management
│   │   ├── Portfolio.tsx        # User portfolio
│   │   └── ...                  # Other pages
│   ├── services/                # Business logic and state management
│   ├── contexts/                # React contexts
│   ├── hooks/                   # Custom React hooks
│   ├── config/                  # Configuration files
│   └── spellbook/               # Query templates and utilities
├── backend/                     # NestJS backend application
│   ├── src/
│   │   ├── modules/            # Feature modules
│   │   │   ├── auth/           # Authentication
│   │   │   ├── users/          # User management
│   │   │   ├── bounties/       # Bounty system
│   │   │   ├── queries/        # Query execution
│   │   │   ├── starknet/       # Blockchain integration
│   │   │   └── submissions/    # Bounty submissions
│   │   ├── prisma/             # Database ORM
│   │   └── common/             # Shared utilities
│   ├── prisma/                 # Database schema and migrations
│   └── test/                   # Test files
├── server/                     # Express server with WebSocket
│   └── src/
│       ├── routes/             # API routes
│       ├── websocket.ts        # WebSocket handling
│       └── database/           # Database utilities
├── server-new/                 # Updated server implementation
├── Contract/                   # Smart contracts
│   └── README.md               # Contract documentation
└── ...                         # Configuration and other files
```

## 🗄️ Database Schema

### Core Tables
- **users**: User accounts with role-based access
- **bounties**: Analytics bounties with rewards
- **submissions**: Bounty submissions from analysts
- **queries**: Saved SQL queries and results
- **dashboards**: User-created dashboards
- **dashboard_widgets**: Dashboard visualization components

### Key Relationships
- Users can create multiple bounties and dashboards
- Bounties can have multiple submissions from different analysts
- Dashboards contain multiple widgets with different visualizations
- Queries can be saved and reused across dashboards

## 🔌 API Endpoints

### Authentication
- `POST /api/auth/login` - User login
- `POST /api/auth/signup` - User registration
- `POST /api/auth/nonce` - Get nonce for wallet signing
- `POST /api/auth/verify-signature` - Verify wallet signature

### Bounties
- `GET /api/bounties` - List all bounties
- `POST /api/bounties` - Create new bounty (Admin)
- `GET /api/bounties/:id` - Get bounty details
- `PATCH /api/bounties/:id` - Update bounty (Admin)
- `POST /api/bounties/:id/submissions` - Submit bounty solution

### Dashboards
- `GET /api/dashboards` - List user dashboards
- `POST /api/dashboards` - Create new dashboard
- `GET /api/dashboards/:id` - Get dashboard with widgets
- `PATCH /api/dashboards/:id` - Update dashboard
- `POST /api/dashboards/:id/export` - Export dashboard

### Queries
- `POST /api/query/execute` - Execute SQL query
- `GET /api/query/:id/status` - Check query status
- `GET /api/query/:id/results` - Get query results
- `POST /api/query/:id/export` - Export query results

## 🚀 Getting Started

### Prerequisites
- Node.js 18+
- PostgreSQL database
- Git

### Installation

1. **Clone the repository**:
   ```bash
   git clone https://github.com/Ndifreke000/Stark.git
   cd Stark
   ```

2. **Install dependencies**:
   ```bash
   # Install frontend dependencies
   npm install

   # Install backend dependencies
   cd backend && npm install && cd ..

   # Install server dependencies
   cd server && npm install && cd ..
   ```

3. **Setup database**:
   ```bash
   # Start PostgreSQL with Docker
   cd backend
   docker-compose up -d

   # Run database migrations
   npm run prisma:migrate

   # Seed initial data
   npm run prisma:seed
   ```

4. **Configure environment variables**:
   Copy `.env.example` to `.env` and update with your configuration:
   ```env
   # Database
   DATABASE_URL="postgresql://username:password@localhost:5432/starklytics"

   # JWT
   JWT_SECRET="your-jwt-secret-key"
   JWT_EXPIRES_IN="7d"

   # Starknet
   STARKNET_RPC_URL="https://starknet-mainnet.infura.io"
   BOUNTY_FACTORY_ADDRESS="0x..."

   # Server
   PORT=3000
   NODE_ENV=development
   ```

5. **Start the development servers**:
   ```bash
   # Start frontend (port 5173)
   npm run dev

   # Start backend (port 3000)
   cd backend && npm run start:dev

   # Start server (port 3001)
   cd server && npm run dev
   ```

## 📊 Deployment

### Production Deployment
The application can be deployed to various platforms:

**Railway**:
```bash
# Deploy backend
railway deploy --service backend

# Deploy frontend
railway deploy --service frontend
```

**Render**:
- Connect GitHub repository
- Set build and start commands
- Configure environment variables

**Vercel** (Frontend):
```bash
# Deploy frontend
vercel --prod
```

### Docker Deployment
```bash
# Build and start with Docker Compose
docker-compose -f docker-compose.prod.yml up -d
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/amazing-feature`
3. Commit changes: `git commit -m 'Add amazing feature'`
4. Push to branch: `git push origin feature/amazing-feature`
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🆘 Support

For support and questions:
- Open an issue on GitHub
- Check the documentation in `/docs`
- Join our community Discord

---

**Starklytics** - Powerful analytics for the Starknet ecosystem. Built with modern web technologies and blockchain integration.
