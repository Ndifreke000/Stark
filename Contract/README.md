# Starklytics Smart Contract Development Guide (StarkNet)

## Overview
Starklytics is a Web3 analytics and bounty platform. This document specifies the on-chain architecture for bounties on StarkNet, event shapes for indexing, and how contracts should interoperate with RPC/indexer and the backend.

## Architecture Overview

### System Architecture
```
┌──────────────────────────────────────────────────────────────┐
│                       Starklytics Platform                    │
├──────────────────────────────────────────────────────────────┤
│ Frontend (React/TS)                                          │
│  - Wallet integration (Argent X / Braavos)                    │
│  - Query editor, dashboards, bounties                         │
├──────────────────────────────────────────────────────────────┤
│ Backend (Node/TS)                                            │
│  - REST APIs, worker jobs, IPFS pinning                       │
│  - Indexer consuming StarkNet RPC events                      │
���──────────────────────────────────────────────────────────────┤
│ Smart Contracts (Cairo/StarkNet)                             │
│  - BountyFactory.cairo (single contract with structs)         │
│  - ERC20 tokens for rewards                                   │
└──────────────────────────────────────────────────────────────┘
```

### Contract Architecture
We use a factory-style single contract that tracks bounties in storage (structs) instead of deploying a new contract per bounty. This minimizes gas and simplifies indexing. Funds are escrowed within the factory using ERC20 transfers.

Core components:
1. BountyFactory.cairo (primary)
2. ERC20 (existing token contracts)

## Smart Contract Requirements

### Core Contracts

#### 1. BountyFactory.cairo
Purpose: Manage lifecycle of all bounties and escrow funds.

Key storage:
- mapping<bounty_id => Bounty>
- mapping<bounty_id => total_escrowed>
- global params: treasury_address, fee_bps

Key functions (indicative):
- create_bounty(token: felt252, total_reward: u256, deadline: u64, metadata_hash: felt252) -> bounty_id
  - requires prior ERC20 approve to factory address
  - transfers total_reward from creator to factory
  - emits BountyCreated(bounty_id, creator, token, total_reward, deadline, metadata_hash)
- submit_solution(bounty_id: u128, submission_hash: felt252)
  - emits SolutionSubmitted(bounty_id, solver, submission_id, submission_hash)
- select_winners(bounty_id: u128, winners: Array<felt252>, amounts: Array<u256>) only_creator
  - checks sum(amounts) <= total_escrowed - fee
  - transfers tokens to winners
  - emits WinnersSelected(bounty_id, winners[], amounts[])
- cancel_expired(bounty_id: u128) only_creator
  - if now > deadline and no winners selected, refund creator minus fee
  - emits BountyCancelled(bounty_id)
- set_fee_bps(new_fee_bps) only_owner
- pause/unpause (optional)

Events:
- BountyCreated(bounty_id, creator, token, total_reward, deadline, metadata_hash)
- SolutionSubmitted(bounty_id, solver, submission_id, submission_hash)
- WinnersSelected(bounty_id, winners[], amounts[])
- BountyCancelled(bounty_id)
- Refunded(bounty_id, to, amount)

Status model (off-chain derived):
- live: now < deadline and no final winners
- completed: winners selected
- expired: now > deadline and no winners
- cancelled: explicitly cancelled

Note: Actual status can remain minimal on-chain; the indexer/back-end computes derived states for UI.

#### 2. ERC20 tokens
- Standard SN/ERC20 used for rewards
- Creator calls approve(factory, total_reward) before create_bounty
- Token decimals should be obtained via RPC and cached by the backend/indexer

#### 4. Token.sol
**Purpose**: ERC20 token for rewards
- Standard ERC20 implementation
- Optional: Governance features for platform token

### Security Requirements

Access Control
- Owner: platform admin (treasury, fee params, pause)
- Creator: bounty creator (winners selection, cancel expired)
- Solver: can submit solutions
- Optional arbitrator (disputes) — out of scope for MVP

Security Features
- Reentrancy protection
- Checked arithmetic
- Pause mechanism
- Input validation (non-zero reward, valid deadline)
- Events for all state-changing actions (indexer-friendly)

### Integration Points

#### Frontend/Backend/Indexer Integration
- Wallets: Argent X / Braavos (typed data signatures for auth; txs signed client-side)
- Events: Indexer consumes BountyCreated/SolutionSubmitted/WinnersSelected/Cancelled
- IPFS: metadata_hash and submission_hash should be CIDs (stored in events)
- RPC: used for event reads, token metadata, chainId, timestamps

#### Backend Integration
- **Event indexing** for database synchronization
- **Webhook endpoints** for contract events
- **Gas optimization** for batch operations
- **Auto Swapper API** integration for stable coin conversion

## Development Environment

### Prerequisites
- Cairo toolchain
- StarkNet devnet/testnet access
- Node.js (for scripts)
- ABIs for factory and ERC20

### Setup Instructions
```bash
# Clone repository
git clone [repository-url]
cd Contract

# Install dependencies
npm install

# Create .env file
cp .env.example .env

# Build & test (placeholder – adapt to chosen tooling)
scarb build
scarb test

# Deploy (example)
# Use StarkNet CLI/tooling to deploy factory and record address
```

### Testing Strategy

Unit Tests
- create_bounty validations (approval, non-zero reward, deadline)
- submit_solution and event emission
- select_winners sums and transfers
- cancel_expired behaviour

Integration Tests
- ERC20 approve + create_bounty flow
- Multiple winners selection and partial payouts
- Indexer replay idempotency (event order/cursors)

Security Tests
- Reentrancy (especially during transfers)
- Only-creator checks
- Pause effects

## Deployment Strategy

### Networks
1. Local: StarkNet devnet
2. Testnet: StarkNet Sepolia
3. Mainnet: StarkNet mainnet

### Deployment Artifacts
- Publish factory address and ABI in a versioned JSON (consumed by frontend/backend)
- Maintain ENV pointers for RPC URLs and factory address per network

## Gas Optimization

### Optimization Techniques
- Event-first design for off-chain indexing
- Minimal on-chain storage; leverage IPFS for large metadata
- Single contract with structs to avoid per-bounty deployment cost
- Avoid loops over unbounded arrays in state changes

## Monitoring & Analytics

### Events to Track
```text
BountyCreated(bounty_id: u128, creator: felt252, token: felt252, total_reward: u256, deadline: u64, metadata_hash: felt252)
SolutionSubmitted(bounty_id: u128, solver: felt252, submission_id: u128, submission_hash: felt252)
WinnersSelected(bounty_id: u128, winners: Array<felt252>, amounts: Array<u256>)
BountyCancelled(bounty_id: u128)
Refunded(bounty_id: u128, to: felt252, amount: u256)
```

### Analytics Integration
- **The Graph** protocol for indexing
- **Dune Analytics** for on-chain metrics
- **Custom dashboards** for platform insights

## Security Audit Checklist

- [ ] Reentrancy protection on all external calls
- [ ] Access control on all state-changing functions
- [ ] Input validation on all parameters
- [ ] Overflow/underflow protection
- [ ] Gas optimization review
- [ ] Upgradeability considerations
- [ ] Emergency pause mechanism
- [ ] Comprehensive test coverage

## Next Steps

1. **Phase 1**: Core contract development (BountyFactory, Bounty)
2. **Phase 2**: Escrow and token contracts
3. **Phase 3**: Security audit and testing
4. **Phase 4**: Frontend integration
5. **Phase 5**: Mainnet deployment

## Resources

- [StarkNet Docs](https://docs.starknet.io/)
- [Cairo Book](https://book.cairo-lang.org/)
- [OpenZeppelin Cairo Contracts](https://github.com/OpenZeppelin/cairo-contracts)
- [StarkNet JS](https://www.starknetjs.com/)

## Expectations for RPC and Indexer

- Contracts emit the complete data needed for an idempotent indexer:
  - Use unique submission ids per bounty
  - Include CIDs (metadata_hash, submission_hash) in events
- Avoid implicit off-chain state; all key lifecycle transitions should be evented
- Keep functions pure in terms of side effects (only update necessary state and emit)
- Respect chain timestamps and emit deadlines in seconds

## Support

For questions or issues, please open issues or contact the team.
