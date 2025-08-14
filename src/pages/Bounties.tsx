import React, { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { Search, Tag as TagIcon, ExternalLink, Trophy, Filter } from 'lucide-react';
import SocialShare from '../components/SocialShare';

interface Bounty {
  id: string;
  title: string;
  description: string;
  reward: number;
  currency: string;
  status: 'live' | 'completed';
  submissions: number;
  deadline: string;
  tags: string[];
  difficulty: 'Easy' | 'Medium' | 'Hard';
  creator: string;
}

const Bounties: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'all' | 'live' | 'completed'>('all');
  const [query, setQuery] = useState('');
  const [selectedTags, setSelectedTags] = useState<string[]>([]);

  const bounties: Bounty[] = [
    {
      id: '1',
      title: 'Analyze DeFi TVL Trends on Starknet',
      description:
        'Create a comprehensive analysis of Total Value Locked across top DeFi protocols on Starknet over the last 6 months.',
      reward: 500,
      currency: 'STRK',
      status: 'live',
      submissions: 12,
      deadline: '2024-12-15',
      tags: ['DeFi', 'TVL', 'Analytics'],
      difficulty: 'Medium',
      creator: 'StarkWare',
    },
    {
      id: '2',
      title: 'Bridge Activity Deep Dive',
      description:
        'Examine cross-chain bridge usage patterns and identify peak usage times and user behaviors.',
      reward: 750,
      currency: 'STRK',
      status: 'live',
      submissions: 8,
      deadline: '2024-12-20',
      tags: ['Bridge', 'Cross-chain', 'User Behavior'],
      difficulty: 'Hard',
      creator: 'LayerZero',
    },
    {
      id: '3',
      title: 'NFT Trading Volume Analysis',
      description:
        'Track NFT trading patterns and identify the most active collections and traders.',
      reward: 300,
      currency: 'STRK',
      status: 'completed',
      submissions: 23,
      deadline: '2024-10-30',
      tags: ['NFT', 'Trading', 'Volume'],
      difficulty: 'Easy',
      creator: 'Aspect',
    },
    {
      id: '4',
      title: 'DEX Liquidity Fragmentation Study',
      description:
        'Measure liquidity fragmentation across Starknet DEXs and propose an aggregation strategy.',
      reward: 600,
      currency: 'STRK',
      status: 'live',
      submissions: 5,
      deadline: '2025-01-12',
      tags: ['DeFi', 'DEX', 'Liquidity'],
      difficulty: 'Medium',
      creator: 'JediSwap',
    },
  ];

  const allTags = useMemo(() => {
    const t = new Set<string>();
    bounties.forEach((b) => b.tags.forEach((tag) => t.add(tag)));
    return Array.from(t).sort();
  }, [bounties]);

  const filtered = useMemo(() => {
    return bounties.filter((b) => {
      const statusOk = activeTab === 'all' || b.status === activeTab;
      const queryOk =
        !query.trim() ||
        [b.title, b.description, b.creator, b.tags.join(' ')].join(' ').toLowerCase().includes(query.toLowerCase());
      const tagsOk = selectedTags.length === 0 || selectedTags.every((t) => b.tags.includes(t));
      return statusOk && queryOk && tagsOk;
    });
  }, [activeTab, query, selectedTags]);

  const toggleTag = (tag: string) => {
    setSelectedTags((prev) => (prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]));
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="flex items-center justify-between gap-4">
            <div>
              <h1 className="text-3xl md:text-5xl font-bold tracking-tight">Explore Bounties</h1>
              <p className="mt-3 text-lg text-blue-100 max-w-2xl">
                Find challenges, write powerful queries, and earn rewards for insightful analytics on Starknet.
              </p>
            </div>
            <Link
              to="/create-bounty"
              className="hidden sm:inline-flex bg-white/90 hover:bg-white text-blue-700 px-5 py-3 rounded-xl font-semibold shadow-sm"
            >
              Create Bounty
            </Link>
          </div>

          {/* Search & Filters */}
          <div className="mt-8 grid grid-cols-1 lg:grid-cols-4 gap-4">
            <div className="lg:col-span-3">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-blue-200" />
                <input
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Search by title, tag, or creator..."
                  className="w-full pl-11 pr-4 py-3 rounded-xl bg-white/10 placeholder:text-blue-100/70 text-white outline-none ring-2 ring-white/20 focus:ring-white/50"
                />
              </div>
              <div className="mt-3 flex flex-wrap gap-2">
                {allTags.map((tag) => (
                  <button
                    key={tag}
                    onClick={() => toggleTag(tag)}
                    className={`inline-flex items-center gap-1 px-3 py-1.5 rounded-full text-sm transition border ${
                      selectedTags.includes(tag)
                        ? 'bg-white text-blue-700 border-white'
                        : 'bg-white/10 text-white border-white/20 hover:bg-white/20'
                    }`}
                  >
                    <TagIcon className="h-4 w-4" /> {tag}
                  </button>
                ))}
                {selectedTags.length > 0 && (
                  <button
                    onClick={() => setSelectedTags([])}
                    className="ml-1 text-sm underline underline-offset-4 text-white/90 hover:text-white"
                  >
                    Clear filters
                  </button>
                )}
              </div>
            </div>
            <div className="bg-white/10 rounded-xl p-4 text-white/90 border border-white/20">
              <div className="flex items-center gap-2 font-semibold">
                <Filter className="h-4 w-4" /> Status
              </div>
              <div className="mt-3 grid grid-cols-3 gap-2">
                {(['all', 'live', 'completed'] as const).map((t) => (
                  <button
                    key={t}
                    onClick={() => setActiveTab(t)}
                    className={`py-2 rounded-lg text-sm font-medium border transition ${
                      activeTab === t ? 'bg-white text-blue-700 border-white' : 'bg-transparent text-white border-white/30'
                    }`}
                  >
                    {t.charAt(0).toUpperCase() + t.slice(1)}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Results */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        {filtered.length === 0 ? (
          <div className="text-center py-16 bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700">
            <p className="text-lg text-gray-600 dark:text-gray-300">No bounties match your filters.</p>
            <p className="text-sm text-gray-500 mt-2">Try adjusting the search or selecting fewer tags.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
            {filtered.map((bounty) => (
              <div
                key={bounty.id}
                className="group bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6 hover:shadow-xl transition shadow-sm"
              >
                <div className="flex items-start justify-between gap-3">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white leading-tight">
                    {bounty.title}
                  </h3>
                  <span
                    className={`shrink-0 px-2 py-1 rounded-full text-xs font-medium ${
                      bounty.status === 'live'
                        ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                        : 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300'
                    }`}
                  >
                    {bounty.status}
                  </span>
                </div>

                <p className="mt-2 text-gray-600 dark:text-gray-300 line-clamp-3">{bounty.description}</p>

                <div className="mt-3 flex flex-wrap gap-2">
                  {bounty.tags.map((tag) => (
                    <span
                      key={tag}
                      className="px-2 py-1 bg-blue-50 dark:bg-blue-900/40 text-blue-700 dark:text-blue-200 text-xs rounded-md"
                    >
                      {tag}
                    </span>
                  ))}
                </div>

                <div className="mt-4 flex items-center justify-between">
                  <div>
                    <div className="text-2xl font-bold text-green-600">
                      {bounty.reward} {bounty.currency}
                    </div>
                    <div className="text-xs text-gray-500 mt-1">{bounty.submissions} submissions</div>
                  </div>
                  <div className="flex items-center gap-2">
                    <SocialShare title={bounty.title} url={`/bounty/${bounty.id}`} />
                    <Link
                      to={`/bounty/${bounty.id}`}
                      className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium"
                    >
                      View Details <ExternalLink className="h-4 w-4" />
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* CTA */}
        <div className="mt-10 flex flex-col sm:flex-row items-center justify-between gap-4 bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl p-6 text-white">
          <div className="flex items-center gap-3">
            <Trophy className="h-6 w-6" />
            <div>
              <div className="font-semibold">Have a problem others can solve?</div>
              <div className="text-white/90 text-sm">Create a bounty and tap into the Starknet analyst community.</div>
            </div>
          </div>
          <Link
            to="/create-bounty"
            className="bg-white text-blue-700 hover:bg-blue-50 px-5 py-2.5 rounded-xl font-semibold shadow"
          >
            Create Bounty
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Bounties;
