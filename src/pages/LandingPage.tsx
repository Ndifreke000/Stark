import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Trophy, ExternalLink, Twitter, Linkedin, Code2, Users, DollarSign, TrendingUp } from 'lucide-react';
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

const LandingPage = () => {
  const [activeTab, setActiveTab] = useState<'all' | 'live' | 'completed'>('all');

  const bounties: Bounty[] = [
    {
      id: '1',
      title: 'Analyze DeFi TVL Trends on Starknet',
      description: 'Create a comprehensive analysis of Total Value Locked across top DeFi protocols on Starknet over the last 6 months.',
      reward: 500,
      currency: 'STRK',
      status: 'live',
      submissions: 12,
      deadline: '2024-02-15',
      tags: ['DeFi', 'TVL', 'Analytics'],
      difficulty: 'Medium',
      creator: 'StarkWare'
    },
    {
      id: '2',
      title: 'Bridge Activity Deep Dive',
      description: 'Examine cross-chain bridge usage patterns and identify peak usage times and user behaviors.',
      reward: 750,
      currency: 'STRK',
      status: 'live',
      submissions: 8,
      deadline: '2024-02-20',
      tags: ['Bridge', 'Cross-chain', 'User Behavior'],
      difficulty: 'Hard',
      creator: 'LayerZero'
    },
    {
      id: '3',
      title: 'NFT Trading Volume Analysis',
      description: 'Track NFT trading patterns and identify the most active collections and traders.',
      reward: 300,
      currency: 'STRK',
      status: 'completed',
      submissions: 23,
      deadline: '2024-01-30',
      tags: ['NFT', 'Trading', 'Volume'],
      difficulty: 'Easy',
      creator: 'Aspect'
    }
  ];

  const leaderboard = [
    { rank: 1, user: 'alice_dev', points: 2450, rewards: '1,200 STRK' },
    { rank: 2, user: 'crypto_analyst', points: 2180, rewards: '980 STRK' },
    { rank: 3, user: 'data_wizard', points: 1920, rewards: '750 STRK' },
    { rank: 4, user: 'stark_explorer', points: 1650, rewards: '500 STRK' },
    { rank: 5, user: 'query_master', points: 1400, rewards: '450 STRK' }
  ];

  const filteredBounties = bounties.filter(bounty => 
    activeTab === 'all' || bounty.status === activeTab
  );

  const stats = {
    activeBounties: bounties.filter(b => b.status === 'live').length,
    totalRewards: bounties.reduce((sum, b) => sum + b.reward, 0),
    totalAnalysts: 156,
    queriesExecuted: 12847
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="text-center">
            <h1 className="text-4xl md:text-6xl font-bold mb-6">
              Build Your Analytics Portfolio
            </h1>
            <p className="text-xl md:text-2xl mb-8 max-w-3xl mx-auto">
              Write SQL queries, analyze Starknet data, and earn rewards. Your GitHub for blockchain analytics.
            </p>
            
            <div className="flex flex-wrap justify-center gap-8 text-lg">
              <div className="flex items-center space-x-2">
                <Code2 className="h-6 w-6" />
                <span>Query Onchain Data</span>
              </div>
              <div className="flex items-center space-x-2">
                <Trophy className="h-6 w-6" />
                <span>Compete for Bounties</span>
              </div>
              <div className="flex items-center space-x-2">
                <TrendingUp className="h-6 w-6" />
                <span>Build Your Reputation</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Stats Section */}
      <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
            <div>
              <div className="text-3xl font-bold text-blue-600">{stats.activeBounties}</div>
              <div className="text-gray-600 dark:text-gray-400">Active Bounties</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-green-600">{stats.totalRewards.toLocaleString()}</div>
              <div className="text-gray-600 dark:text-gray-400">STRK in Rewards</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-purple-600">{stats.totalAnalysts}</div>
              <div className="text-gray-600 dark:text-gray-400">Active Analysts</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-orange-600">{stats.queriesExecuted.toLocaleString()}</div>
              <div className="text-gray-600 dark:text-gray-400">Queries Executed</div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Bounties Section */}
          <div className="lg:col-span-2">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Bounties</h2>
              <Link
                to="/create-bounty"
                className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg text-sm font-medium"
              >
                Create Bounty
              </Link>
            </div>

            {/* Bounty Tabs */}
            <div className="flex space-x-1 bg-gray-200 dark:bg-gray-700 p-1 rounded-lg mb-6">
              {(['all', 'live', 'completed'] as const).map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`flex-1 py-2 px-3 rounded-md text-sm font-medium capitalize transition-colors ${
                    activeTab === tab
                      ? 'bg-white dark:bg-gray-600 text-gray-900 dark:text-white shadow'
                      : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
                  }`}
                >
                  {tab} ({tab === 'all' ? bounties.length : bounties.filter(b => b.status === tab).length})
                </button>
              ))}
            </div>

            {/* Bounty List */}
            <div className="space-y-4">
              {filteredBounties.map((bounty) => (
                <div key={bounty.id} className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6 hover:shadow-lg transition-shadow">
                  <div className="flex justify-between items-start mb-4">
                    <div className="flex-1">
                      <div className="flex items-center space-x-3 mb-2">
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                          {bounty.title}
                        </h3>
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                          bounty.status === 'live' 
                            ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' 
                            : 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300'
                        }`}>
                          {bounty.status}
                        </span>
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                          bounty.difficulty === 'Easy' ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' :
                          bounty.difficulty === 'Medium' ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200' :
                          'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
                        }`}>
                          {bounty.difficulty}
                        </span>
                      </div>
                      <p className="text-gray-600 dark:text-gray-300 mb-3">{bounty.description}</p>
                      <div className="flex flex-wrap gap-2 mb-3">
                        {bounty.tags.map((tag) => (
                          <span key={tag} className="px-2 py-1 bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 text-xs rounded-md">
                            {tag}
                          </span>
                        ))}
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-2xl font-bold text-green-600 mb-1">
                        {bounty.reward} {bounty.currency}
                      </div>
                      <div className="text-sm text-gray-500 mb-2">
                        {bounty.submissions} submissions
                      </div>
                      <div className="text-sm text-gray-500">
                        Deadline: {new Date(bounty.deadline).toLocaleDateString()}
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-500">
                      Created by {bounty.creator}
                    </span>
                    <div className="flex items-center space-x-3">
                      <SocialShare 
                        title={bounty.title}
                        url={`/bounty/${bounty.id}`}
                      />
                      <Link
                        to={`/bounty/${bounty.id}`}
                        className="flex items-center space-x-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium"
                      >
                        <span>View Details</span>
                        <ExternalLink className="h-4 w-4" />
                      </Link>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Weekly Leaderboard */}
          <div>
            <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-6 flex items-center">
                <Trophy className="h-5 w-5 text-yellow-500 mr-2" />
                Weekly Leaderboard
              </h3>
              
              <div className="space-y-3">
                {leaderboard.map((user) => (
                  <div key={user.rank} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                    <div className="flex items-center space-x-3">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center text-white text-sm font-bold ${
                        user.rank === 1 ? 'bg-yellow-500' :
                        user.rank === 2 ? 'bg-gray-400' :
                        user.rank === 3 ? 'bg-amber-600' :
                        'bg-gray-500'
                      }`}>
                        {user.rank}
                      </div>
                      <div>
                        <div className="font-medium text-gray-900 dark:text-white">{user.user}</div>
                        <div className="text-sm text-gray-500">{user.points} points</div>
                      </div>
                    </div>
                    <div className="text-sm font-medium text-green-600">
                      {user.rewards}
                    </div>
                  </div>
                ))}
              </div>

              <div className="mt-6 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                <h4 className="font-medium text-blue-900 dark:text-blue-200 mb-2">Community Resources</h4>
                <div className="space-y-2 text-sm">
                  <a 
                    href="https://docs.starknet.io" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="flex items-center text-blue-600 hover:text-blue-700"
                  >
                    <ExternalLink className="h-4 w-4 mr-1" />
                    Starknet Documentation
                  </a>
                  <a 
                    href="https://book.starknet.io" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="flex items-center text-blue-600 hover:text-blue-700"
                  >
                    <ExternalLink className="h-4 w-4 mr-1" />
                    Starknet Book
                  </a>
                  <a 
                    href="https://community.starknet.io" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="flex items-center text-blue-600 hover:text-blue-700"
                  >
                    <ExternalLink className="h-4 w-4 mr-1" />
                    Community Forum
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LandingPage;