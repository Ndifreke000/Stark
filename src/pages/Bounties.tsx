import React, { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { Search, Tag as TagIcon, ExternalLink, Filter, Briefcase, Clock, Users } from 'lucide-react';
import { motion, AnimatePresence, Variants } from 'framer-motion';
import AnimatedCard from '../components/ui/AnimatedCard';
import AnimatedButton from '../components/ui/AnimatedButton';

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

  const filteredBounties = useMemo(() => {
    return bounties.filter((b) => {
      const statusOk = activeTab === 'all' || b.status === activeTab;
      const queryOk =
        !query.trim() ||
        [b.title, b.description, b.creator, b.tags.join(' ')].join(' ').toLowerCase().includes(query.toLowerCase());
      const tagsOk = selectedTags.length === 0 || selectedTags.every((t) => b.tags.includes(t));
      return statusOk && queryOk && tagsOk;
    });
  }, [activeTab, query, selectedTags, bounties]);

  const toggleTag = (tag: string) => {
    setSelectedTags((prev) => (prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]));
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.05,
      },
    },
  };

  const itemVariants: Variants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: {
        type: 'spring',
        stiffness: 100,
      },
    },
  };

  const difficultyColor = {
    Easy: 'text-green-500',
    Medium: 'text-yellow-500',
    Hard: 'text-red-500',
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-gray-100 font-['Inter',sans-serif]">
      {/* Header */}
      <header className="bg-white dark:bg-gray-800/50 border-b border-gray-200 dark:border-gray-700/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <h1 className="text-4xl md:text-5xl font-bold tracking-tight">Starknet Bounties</h1>
            <p className="mt-3 text-lg text-gray-600 dark:text-gray-400 max-w-3xl">
              Discover opportunities to contribute to the Starknet ecosystem and earn rewards for your analytical skills.
            </p>
          </motion.div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Filters and Search */}
        <motion.div
          className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12"
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
          <motion.div className="md:col-span-2" variants={itemVariants}>
            <div className="relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
              <input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search bounties..."
                className="w-full pl-12 pr-4 py-3 rounded-lg bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 focus:ring-2 focus:ring-blue-500 outline-none transition-all"
              />
            </div>
          </motion.div>
          <motion.div variants={itemVariants}>
            <div className="flex items-center h-full space-x-4">
              {(['all', 'live', 'completed'] as const).map((t) => (
                <button
                  key={t}
                  onClick={() => setActiveTab(t)}
                  className={`w-full py-3 rounded-lg text-sm font-semibold transition-colors ${
                    activeTab === t
                      ? 'bg-blue-600 text-white shadow-sm'
                      : 'bg-white dark:bg-gray-800 hover:bg-gray-100 dark:hover:bg-gray-700 border border-gray-300 dark:border-gray-700'
                  }`}
                >
                  {t.charAt(0).toUpperCase() + t.slice(1)}
                </button>
              ))}
            </div>
          </motion.div>
        </motion.div>

        {/* Tags */}
        <motion.div
          className="flex flex-wrap items-center gap-3 mb-8"
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
          <Filter className="h-5 w-5 text-gray-500" />
          <span className="font-semibold">Filter by tags:</span>
          {allTags.map((tag) => (
            <motion.button
              key={tag}
              onClick={() => toggleTag(tag)}
              className={`px-3 py-1.5 rounded-full text-sm font-medium transition-colors ${
                selectedTags.includes(tag)
                  ? 'bg-blue-100 text-blue-800 dark:bg-blue-900/50 dark:text-blue-200'
                  : 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'
              }`}
              variants={itemVariants}
              whileHover={{ y: -2 }}
            >
              {tag}
            </motion.button>
          ))}
          {selectedTags.length > 0 && (
            <motion.button
              onClick={() => setSelectedTags([])}
              className="text-sm text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 underline"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
            >
              Clear
            </motion.button>
          )}
        </motion.div>

        {/* Bounty List */}
        <AnimatePresence mode="wait">
          {filteredBounties.length === 0 ? (
            <motion.div
              className="text-center py-20"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
            >
              <Briefcase className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <p className="text-xl font-semibold text-gray-700 dark:text-gray-300">No bounties found</p>
              <p className="text-gray-500">Try adjusting your search or filters.</p>
            </motion.div>
          ) : (
            <motion.div
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
              variants={containerVariants}
              initial="hidden"
              animate="visible"
            >
              {filteredBounties.map((bounty) => (
                <motion.div key={bounty.id} variants={itemVariants} className="h-full">
                  <AnimatedCard
                    className="p-6 h-full flex flex-col border border-gray-200 dark:border-gray-700/50 hover:border-blue-500 dark:hover:border-blue-500 transition-colors"
                    hover={true}
                  >
                    <div className="flex-1 flex flex-col">
                      <div className="flex justify-between items-start mb-3">
                        <span
                          className={`px-2.5 py-1 rounded-full text-xs font-bold ${
                            bounty.status === 'live'
                              ? 'bg-green-100 text-green-800 dark:bg-green-900/50 dark:text-green-200'
                              : 'bg-gray-200 text-gray-800 dark:bg-gray-700 dark:text-gray-300'
                          }`}
                        >
                          {bounty.status.toUpperCase()}
                        </span>
                        <div className={`font-bold text-sm ${difficultyColor[bounty.difficulty]}`}>
                          {bounty.difficulty}
                        </div>
                      </div>

                      <h3 className="text-lg font-bold leading-tight mb-2 text-gray-900 dark:text-white">
                        {bounty.title}
                      </h3>

                      <p className="text-sm text-gray-600 dark:text-gray-400 flex-grow mb-4">
                        {bounty.description}
                      </p>

                      <div className="flex flex-wrap gap-2 mb-4">
                        {bounty.tags.map((tag) => (
                          <span
                            key={tag}
                            className="px-2 py-1 bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 text-xs font-medium rounded"
                          >
                            {tag}
                          </span>
                        ))}
                      </div>
                    </div>

                    <div className="border-t border-gray-200 dark:border-gray-700 pt-4 mt-auto">
                      <div className="flex justify-between items-end">
                        <div>
                          <div className="text-2xl font-bold text-gray-900 dark:text-white">
                            {bounty.reward} <span className="text-base font-medium">{bounty.currency}</span>
                          </div>
                          <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                            Reward
                          </div>
                        </div>
                        <Link to={`/bounty/${bounty.id}`}>
                          <AnimatedButton
                            variant="primary"
                            size="sm"
                            className="text-xs px-4 py-2"
                          >
                            View Details
                          </AnimatedButton>
                        </Link>
                      </div>
                      <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400 mt-3">
                        <div className="flex items-center gap-1.5">
                          <Clock className="w-3.5 h-3.5" />
                          <span>Deadline: {bounty.deadline}</span>
                        </div>
                        <div className="flex items-center gap-1.5">
                          <Users className="w-3.5 h-3.5" />
                          <span>{bounty.submissions} submissions</span>
                        </div>
                      </div>
                    </div>
                  </AnimatedCard>
                </motion.div>
              ))}
            </motion.div>
          )}
        </AnimatePresence>

        {/* CTA */}
        <motion.div
          className="mt-20"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          <div className="bg-white dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700/50 rounded-lg p-8">
            <div className="flex flex-col md:flex-row items-center justify-between gap-6">
              <div>
                <h2 className="text-2xl font-bold">Post a Bounty</h2>
                <p className="text-gray-600 dark:text-gray-400 mt-1">
                  Have a data challenge? Leverage the community of analysts to find the insights you need.
                </p>
              </div>
              <Link to="/create-bounty">
                <AnimatedButton
                  variant="primary"
                  size="md"
                  className="w-full md:w-auto"
                >
                  Create a Bounty
                </AnimatedButton>
              </Link>
            </div>
          </div>
        </motion.div>
      </main>
    </div>
  );
};

export default Bounties;
