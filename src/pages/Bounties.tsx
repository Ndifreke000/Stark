import React, { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { Search, Tag as TagIcon, ExternalLink, Trophy, Filter, Sparkles, Zap, Star, Target } from 'lucide-react';
import SocialShare from '../components/SocialShare';
import { motion, AnimatePresence } from 'framer-motion';
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

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.2
      }
    }
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: {
        type: "spring",
        stiffness: 100,
        damping: 10
      }
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50 dark:from-gray-900 dark:via-gray-900 dark:to-blue-950 font-['Inter',sans-serif]">
      {/* Hero Section */}
      <div className="relative bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 text-white overflow-hidden">
        {/* Animated Background Elements */}
        <motion.div 
          className="absolute top-10 left-10 w-32 h-32 border border-white/20 rounded-full"
          animate={{
            rotate: 360,
            scale: [1, 1.2, 1]
          }}
          transition={{
            rotate: { duration: 20, repeat: Infinity, ease: "linear" },
            scale: { duration: 4, repeat: Infinity }
          }}
        />
        <motion.div 
          className="absolute bottom-10 right-10 w-24 h-24 border border-white/20 rounded-full"
          animate={{
            rotate: -360,
            y: [-10, 10, -10]
          }}
          transition={{
            rotate: { duration: 15, repeat: Infinity, ease: "linear" },
            y: { duration: 6, repeat: Infinity }
          }}
        />
        
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <motion.div 
            className="flex items-center justify-between gap-4"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <div>
              <motion.h1 
                className="text-4xl md:text-6xl font-black tracking-tight mb-4"
                initial={{ opacity: 0, x: -50 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.2, duration: 0.8 }}
              >
                Explore 
                <motion.span
                  className="inline-block ml-3"
                  animate={{
                    rotate: [0, 5, -5, 0],
                    scale: [1, 1.1, 1]
                  }}
                  transition={{ duration: 3, repeat: Infinity }}
                >
                  <Trophy className="inline w-12 h-12 md:w-16 md:h-16 text-yellow-300" />
                </motion.span>
                <br />
                <motion.span
                  animate={{
                    textShadow: [
                      "0 0 20px rgba(255,255,255,0.5)",
                      "0 0 40px rgba(255,255,255,0.8)",
                      "0 0 20px rgba(255,255,255,0.5)"
                    ]
                  }}
                  transition={{ duration: 2, repeat: Infinity }}
                >
                  Bounties
                </motion.span>
              </motion.h1>
              <motion.p 
                className="text-xl md:text-2xl text-blue-100 max-w-3xl font-medium"
                initial={{ opacity: 0, x: -50 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.4, duration: 0.8 }}
              >
                Find challenges, write powerful queries, and earn rewards for insightful analytics on Starknet.
              </motion.p>
            </div>
            <motion.div
              initial={{ opacity: 0, scale: 0 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.6, type: "spring", stiffness: 200 }}
              whileHover={{ scale: 1.05 }}
            >
              <Link
                to="/create-bounty"
                className="hidden sm:inline-flex items-center gap-2 bg-white/90 hover:bg-white text-blue-700 px-6 py-3 rounded-2xl font-bold shadow-xl hover:shadow-2xl transition-all duration-300 relative overflow-hidden group"
              >
                <motion.div
                  animate={{ rotate: [0, 360] }}
                  transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
                >
                  <Sparkles className="w-5 h-5" />
                </motion.div>
                Create Bounty
                <motion.div
                  className="absolute inset-0 bg-gradient-to-r from-blue-400/20 to-purple-400/20 opacity-0 group-hover:opacity-100"
                  animate={{
                    x: ["-100%", "100%"],
                  }}
                  transition={{
                    duration: 1.5,
                    repeat: Infinity,
                    ease: "linear"
                  }}
                />
              </Link>
            </motion.div>
          </motion.div>

          {/* Search & Filters */}
          <motion.div 
            className="mt-12 grid grid-cols-1 lg:grid-cols-4 gap-6"
            variants={containerVariants}
            initial="hidden"
            animate="visible"
          >
            <motion.div className="lg:col-span-3" variants={itemVariants}>
              <div className="relative">
                <motion.div
                  className="absolute left-4 top-1/2 -translate-y-1/2"
                  animate={{ rotate: [0, 360] }}
                  transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                >
                  <Search className="h-6 w-6 text-blue-200" />
                </motion.div>
                <motion.input
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Search by title, tag, or creator..."
                  className="w-full pl-14 pr-6 py-4 rounded-2xl bg-white/10 placeholder:text-blue-100/70 text-white text-lg font-medium outline-none ring-2 ring-white/20 focus:ring-white/50 backdrop-blur-sm transition-all duration-300"
                  whileFocus={{ scale: 1.01 }}
                />
              </div>
              <motion.div 
                className="mt-4 flex flex-wrap gap-3"
                variants={containerVariants}
              >
                {allTags.map((tag, index) => (
                  <motion.button
                    key={tag}
                    onClick={() => toggleTag(tag)}
                    className={`inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-bold transition-all duration-300 ${
                      selectedTags.includes(tag)
                        ? 'bg-white text-blue-700 border-2 border-white shadow-lg scale-105'
                        : 'bg-white/10 text-white border-2 border-white/20 hover:bg-white/20 hover:scale-105'
                    }`}
                    variants={itemVariants}
                    whileHover={{ scale: 1.1, y: -2 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <motion.div
                      animate={selectedTags.includes(tag) ? { rotate: 360 } : {}}
                      transition={{ duration: 0.5 }}
                    >
                      <TagIcon className="h-4 w-4" />
                    </motion.div>
                    {tag}
                  </motion.button>
                ))}
                <AnimatePresence>
                  {selectedTags.length > 0 && (
                    <motion.button
                      onClick={() => setSelectedTags([])}
                      className="ml-2 text-sm underline underline-offset-4 text-white/90 hover:text-white font-bold"
                      initial={{ opacity: 0, scale: 0 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0 }}
                      whileHover={{ scale: 1.05 }}
                    >
                      Clear filters
                    </motion.button>
                  )}
                </AnimatePresence>
              </motion.div>
            </motion.div>
            
            <motion.div 
              className="bg-white/10 rounded-2xl p-6 text-white/90 border-2 border-white/20 backdrop-blur-sm"
              variants={itemVariants}
              whileHover={{ scale: 1.02, boxShadow: "0 25px 50px -12px rgba(255, 255, 255, 0.25)" }}
            >
              <div className="flex items-center gap-2 font-bold text-lg mb-4">
                <motion.div
                  animate={{ rotate: [0, 360] }}
                  transition={{ duration: 4, repeat: Infinity, ease: "linear" }}
                >
                  <Filter className="h-5 w-5" />
                </motion.div>
                Status
              </div>
              <div className="grid grid-cols-1 gap-3">
                {(['all', 'live', 'completed'] as const).map((t, index) => (
                  <motion.button
                    key={t}
                    onClick={() => setActiveTab(t)}
                    className={`py-3 rounded-xl text-sm font-bold border-2 transition-all duration-300 ${
                      activeTab === t 
                        ? 'bg-white text-blue-700 border-white shadow-lg' 
                        : 'bg-transparent text-white border-white/30 hover:border-white/50 hover:bg-white/10'
                    }`}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.1 }}
                  >
                    {t.charAt(0).toUpperCase() + t.slice(1)}
                  </motion.button>
                ))}
              </div>
            </motion.div>
          </motion.div>
        </div>
      </div>

      {/* Results */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <AnimatePresence mode="wait">
          {filtered.length === 0 ? (
            <motion.div 
              className="text-center py-20 bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl rounded-3xl border-2 border-gray-200 dark:border-gray-700"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
            >
              <motion.div
                animate={{ rotate: [0, 10, -10, 0] }}
                transition={{ duration: 2, repeat: Infinity }}
                className="inline-block mb-4"
              >
                <Target className="w-16 h-16 text-gray-400 mx-auto" />
              </motion.div>
              <p className="text-2xl font-bold text-gray-600 dark:text-gray-300 mb-2">No bounties match your filters</p>
              <p className="text-lg text-gray-500">Try adjusting the search or selecting fewer tags.</p>
            </motion.div>
          ) : (
            <motion.div 
              className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8"
              variants={containerVariants}
              initial="hidden"
              animate="visible"
            >
              {filtered.map((bounty, index) => (
                <motion.div
                  key={bounty.id}
                  variants={itemVariants}
                  whileHover={{ y: -10, scale: 1.02 }}
                  transition={{ type: "spring", stiffness: 300 }}
                  className="h-full"
                >
                  <AnimatedCard
                    className="p-6 h-full group relative overflow-hidden flex flex-col"
                    hover={true}
                    delay={index * 0.1}
                    glow={true}
                    gradient={true}
                  >
                    {/* Status Badge */}
                    <motion.div
                      className="absolute top-3 right-3 z-10"
                      whileHover={{ scale: 1.1, rotate: 5 }}
                    >
                      <span
                        className={`px-2 py-1 rounded-full text-xs font-bold shadow-lg ${
                          bounty.status === 'live'
                            ? 'bg-gradient-to-r from-green-500 to-emerald-500 text-white'
                            : 'bg-gradient-to-r from-gray-500 to-gray-600 text-white'
                        }`}
                      >
                        {bounty.status}
                      </span>
                    </motion.div>

                    {/* Difficulty Badge */}
                    <motion.div
                      className="absolute top-3 left-3 z-10"
                      whileHover={{ scale: 1.1, rotate: -5 }}
                    >
                      <span
                        className={`px-2 py-1 rounded-full text-xs font-bold shadow-lg ${
                          bounty.difficulty === 'Easy' ? 'bg-gradient-to-r from-green-400 to-green-500 text-white' :
                          bounty.difficulty === 'Medium' ? 'bg-gradient-to-r from-yellow-400 to-orange-500 text-white' :
                          'bg-gradient-to-r from-red-500 to-pink-500 text-white'
                        }`}
                      >
                        {bounty.difficulty}
                      </span>
                    </motion.div>

                    <div className="mt-8 flex-1 flex flex-col">
                      <motion.h3 
                        className="text-lg font-black text-gray-900 dark:text-white leading-tight mb-3 group-hover:text-transparent group-hover:bg-clip-text group-hover:bg-gradient-to-r group-hover:from-blue-600 group-hover:to-purple-600 transition-all duration-300 min-h-[3.5rem] flex items-start"
                        whileHover={{ scale: 1.02 }}
                        title={bounty.title}
                      >
                        <span className="line-clamp-2 break-words">
                          {bounty.title}
                        </span>
                      </motion.h3>

                      <p className="text-gray-600 dark:text-gray-300 mb-4 font-medium leading-relaxed text-sm flex-1 min-h-[4.5rem]"
                         title={bounty.description}>
                        <span className="line-clamp-3 break-words">
                          {bounty.description}
                        </span>
                      </p>

                      <motion.div 
                        className="flex flex-wrap gap-1.5 mb-4 min-h-[2rem]"
                        variants={containerVariants}
                      >
                        {bounty.tags.slice(0, 3).map((tag, tagIndex) => (
                          <motion.span
                            key={tag}
                            className="px-2 py-1 bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/40 dark:to-purple-900/40 text-blue-700 dark:text-blue-200 text-xs font-bold rounded-full border border-blue-200 dark:border-blue-700 truncate max-w-[80px]"
                            variants={itemVariants}
                            whileHover={{ scale: 1.05, y: -1 }}
                            initial={{ opacity: 0, scale: 0 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ delay: tagIndex * 0.1 }}
                            title={tag}
                          >
                            {tag}
                          </motion.span>
                        ))}
                        {bounty.tags.length > 3 && (
                          <span className="px-2 py-1 bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 text-xs font-bold rounded-full">
                            +{bounty.tags.length - 3}
                          </span>
                        )}
                      </motion.div>

                      <div className="flex items-end justify-between mt-auto">
                        <div className="flex-1 min-w-0">
                          <motion.div 
                            className="text-2xl font-black text-transparent bg-clip-text bg-gradient-to-r from-green-600 to-emerald-600 truncate"
                            whileHover={{ scale: 1.05 }}
                            animate={{
                              backgroundPosition: ["0% 50%", "100% 50%", "0% 50%"],
                            }}
                            transition={{
                              duration: 3,
                              repeat: Infinity,
                              ease: "linear"
                            }}
                            style={{
                              backgroundSize: "200% 200%"
                            }}
                          >
                            {bounty.reward} {bounty.currency}
                          </motion.div>
                          <motion.div 
                            className="text-xs text-gray-500 font-semibold mt-1"
                            whileHover={{ scale: 1.05 }}
                          >
                            <motion.span
                              animate={{ scale: [1, 1.1, 1] }}
                              transition={{ duration: 2, repeat: Infinity }}
                            >
                              {bounty.submissions}
                            </motion.span> submissions
                          </motion.div>
                        </div>
                        
                        <div className="flex items-center gap-2 ml-2">
                          <motion.div whileHover={{ scale: 1.1 }}>
                            <SocialShare title={bounty.title} url={`/bounty/${bounty.id}`} />
                          </motion.div>
                          <Link to={`/bounty/${bounty.id}`}>
                            <AnimatedButton
                              variant="primary"
                              size="sm"
                              icon={ExternalLink}
                              iconPosition="right"
                              className="text-xs px-3 py-2"
                            >
                              View
                            </AnimatedButton>
                          </Link>
                        </div>
                      </div>
                    </div>

                    {/* Creator Badge */}
                    <motion.div 
                      className="absolute bottom-3 left-3 text-xs text-gray-500 font-semibold max-w-[120px] truncate"
                      whileHover={{ scale: 1.05 }}
                      title={`by ${bounty.creator}`}
                    >
                      by {bounty.creator}
                    </motion.div>
                  </AnimatedCard>
                </motion.div>
              ))}
            </motion.div>
          )}
        </AnimatePresence>

        {/* CTA Section */}
        <motion.div 
          className="mt-16"
          initial={{ opacity: 0, y: 50 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
        >
          <AnimatedCard className="p-8 bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 text-white border-0" glow={true}>
            <div className="flex flex-col sm:flex-row items-center justify-between gap-6">
              <div className="flex items-center gap-4">
                <motion.div
                  animate={{ 
                    rotate: [0, -10, 10, 0],
                    scale: [1, 1.1, 1]
                  }}
                  transition={{ duration: 3, repeat: Infinity }}
                >
                  <Trophy className="h-12 w-12 text-yellow-300" />
                </motion.div>
                <div>
                  <motion.div 
                    className="text-2xl font-black mb-2"
                    whileHover={{ scale: 1.02 }}
                  >
                    Have a problem others can solve?
                  </motion.div>
                  <div className="text-white/90 text-lg font-medium">
                    Create a bounty and tap into the Starknet analyst community.
                  </div>
                </div>
              </div>
              <Link to="/create-bounty">
                <AnimatedButton
                  variant="secondary"
                  size="lg"
                  icon={Zap}
                  className="bg-white text-blue-700 hover:bg-blue-50 shadow-xl"
                >
                  Create Bounty
                </AnimatedButton>
              </Link>
            </div>
          </AnimatedCard>
        </motion.div>
      </div>
    </div>
  );
};

export default Bounties;