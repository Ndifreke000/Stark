// LocalStorage-backed store for bounties and submissions (development mode)
// Later this can be replaced with on-chain events + indexer.

export type BountyStatus = 'live' | 'completed' | 'expired' | 'cancelled';

export interface BountyMetadata {
  title: string;
  description: string;
  requirements: string;
  tags: string[];
  difficulty: 'Easy' | 'Medium' | 'Hard';
  createdAt: string; // ISO date
  contractAddress?: string; // optional related contract
}

export interface Bounty {
  id: string; // pseudo on-chain id in dev
  token: string; // token address or symbol in dev
  totalReward: string; // keep as string for big numbers
  deadline: number; // epoch ms
  creator: string; // address or user id
  status: BountyStatus;
  metadata: BountyMetadata;
  created_at: string;
  updated_at: string;
}

export interface SubmissionMetadata {
  query?: string;
  insights: string;
  methodology?: string;
  attachments?: {
    dashboardId?: string;
    vizIds?: string[];
  };
  dashboardLink?: string; // public viewer link
}

export interface Submission {
  id: string;
  bountyId: string;
  solver: string; // address or user id
  submittedAt: number;
  metadata: SubmissionMetadata;
}

export interface WinnerSelection {
  bountyId: string;
  selections: Array<{ solver: string; amount: string }>;
  txHash?: string; // placeholder in dev
  selectedAt: number;
}

const BOUNTIES_KEY = 'starklytics_bounties';
const SUBMISSIONS_KEY = 'starklytics_submissions';
const WINNERS_KEY = 'starklytics_bounty_winners';

function read<T>(key: string): T[] {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch (e) {
    console.warn('Failed to read', key, e);
    return [] as T[];
  }
}

function write<T>(key: string, arr: T[]) {
  try {
    localStorage.setItem(key, JSON.stringify(arr));
  } catch (e) {
    console.warn('Failed to write', key, e);
  }
}

// Bounties
export function getBounties(): Bounty[] {
  // Auto-expire bounties whose deadline has passed and are still live
  const now = Date.now();
  const b = read<Bounty>(BOUNTIES_KEY).map((x) =>
    x.status === 'live' && x.deadline < now ? { ...x, status: 'expired', updated_at: new Date().toISOString() } : x
  );
  if (b.length) write(BOUNTIES_KEY, b);
  return b;
}

export function getBountyById(id: string): Bounty | undefined {
  return getBounties().find((b) => b.id === id);
}

export function upsertBounty(b: Bounty) {
  const all = getBounties();
  const idx = all.findIndex((x) => x.id === b.id);
  if (idx >= 0) all[idx] = b;
  else all.unshift(b);
  write(BOUNTIES_KEY, all);
}

export function setBountyStatus(id: string, status: BountyStatus) {
  const all = getBounties();
  const idx = all.findIndex((x) => x.id === id);
  if (idx >= 0) {
    all[idx].status = status;
    all[idx].updated_at = new Date().toISOString();
    write(BOUNTIES_KEY, all);
  }
}

export function createBounty(input: {
  token: string;
  totalReward: string;
  deadline: number;
  creator: string;
  metadata: Omit<BountyMetadata, 'createdAt'> & { createdAt?: string };
}): Bounty {
  const nowIso = new Date().toISOString();
  const bounty: Bounty = {
    id: `b_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
    token: input.token,
    totalReward: input.totalReward,
    deadline: input.deadline,
    creator: input.creator,
    status: 'live',
    metadata: {
      ...input.metadata,
      createdAt: input.metadata.createdAt || nowIso,
    },
    created_at: nowIso,
    updated_at: nowIso,
  };
  upsertBounty(bounty);
  return bounty;
}

// Submissions
export function getSubmissions(bountyId: string): Submission[] {
  return read<Submission>(SUBMISSIONS_KEY).filter((s) => s.bountyId === bountyId);
}

export function addSubmission(input: {
  bountyId: string;
  solver: string;
  metadata: SubmissionMetadata;
}): Submission {
  const all = read<Submission>(SUBMISSIONS_KEY);
  const sub: Submission = {
    id: `s_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
    bountyId: input.bountyId,
    solver: input.solver,
    submittedAt: Date.now(),
    metadata: input.metadata,
  };
  all.unshift(sub);
  write(SUBMISSIONS_KEY, all);
  return sub;
}

export function deleteSubmission(submissionId: string) {
  const all = read<Submission>(SUBMISSIONS_KEY);
  write(SUBMISSIONS_KEY, all.filter((s) => s.id !== submissionId));
}

// Winner selections (mock)
export function getWinnerSelections(bountyId: string): WinnerSelection[] {
  return read<WinnerSelection>(WINNERS_KEY).filter((w) => w.bountyId === bountyId);
}

export function selectWinners(bountyId: string, selections: Array<{ solver: string; amount: string }>): WinnerSelection {
  const all = read<WinnerSelection>(WINNERS_KEY);
  const sel: WinnerSelection = {
    bountyId,
    selections,
    txHash: `0x${Math.random().toString(16).slice(2, 10)}...${Math.random().toString(16).slice(2, 10)}`,
    selectedAt: Date.now(),
  };
  all.push(sel);
  write(WINNERS_KEY, all);
  // Mark bounty completed
  setBountyStatus(bountyId, 'completed');
  return sel;
}

// Utilities for development/testing
export function seedDemoBounties(creator = '0xDEMO') {
  if (getBounties().length) return;
  const now = Date.now();
  const mk = (title: string, days: number, reward = '500', currencySymbol = 'STRK') =>
    createBounty({
      token: currencySymbol,
      totalReward: reward,
      deadline: now + days * 86400000,
      creator,
      metadata: {
        title,
        description: `Demo bounty: ${title}`,
        requirements: 'Provide SQL, visuals, and insights. Link to your dashboard.',
        tags: ['Demo', 'Analytics'],
        difficulty: 'Medium',
      },
    });
  mk('Analyze DeFi TVL Trends on Starknet', 20);
  mk('Bridge Activity Deep Dive', 25, '750');
  mk('NFT Trading Volume Analysis', -10, '300'); // expired
}
