import React from 'react';
import { Calendar, Code, Trophy, TrendingUp, GitBranch, Star } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import AnimatedCard from '../components/ui/AnimatedCard';

const Portfolio = () => {
  const { user } = useAuth();

  if (!user) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 text-center">
        <h1 className="text-2xl font-bold">Please connect your wallet to view your portfolio</h1>
      </div>
    );
  }

  const stats = [
    { label: 'Queries This Week', value: 12 },
    { label: 'Bounties Won', value: 3 },
    { label: 'Total STRK Earned', value: 1250 },
    { label: 'Current Streak', value: '15 days' },
  ];

  const recentQueries = [
    { id: 1, title: 'DeFi TVL Analysis', date: '2024-01-21' },
    { id: 2, title: 'Bridge Volume Trends', date: '2024-01-20' },
    { id: 3, title: 'Top Wallet Analysis', date: '2024-01-19' },
  ];

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <header className="bg-white dark:bg-gray-800/50 border-b border-gray-200 dark:border-gray-700/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex items-center space-x-4">
            <div className="h-16 w-16 bg-blue-600 rounded-full flex items-center justify-center text-white text-2xl font-bold">
              {user.name ? user.name.charAt(0).toUpperCase() : user.address ? user.address.slice(2, 4).toUpperCase() : 'A'}
            </div>
            <div>
              <h1 className="text-3xl font-bold tracking-tight">{user.name || 'Anonymous Analyst'}</h1>
              <p className="text-sm text-gray-500 dark:text-gray-400">{user.address || 'No address connected'}</p>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-8">
            <AnimatedCard>
              <div className="p-6">
                <h2 className="text-xl font-semibold mb-4">Performance Stats</h2>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {stats.map((stat, index) => (
                    <div key={index} className="bg-gray-100 dark:bg-gray-800 p-4 rounded-lg text-center">
                      <p className="text-2xl font-bold">{stat.value}</p>
                      <p className="text-sm text-gray-500 dark:text-gray-400">{stat.label}</p>
                    </div>
                  ))}
                </div>
              </div>
            </AnimatedCard>
            <AnimatedCard>
              <div className="p-6">
                <h2 className="text-xl font-semibold mb-4">Recent Queries</h2>
                <ul className="space-y-3">
                  {recentQueries.map(query => (
                    <li key={query.id} className="flex items-center justify-between p-3 bg-gray-100 dark:bg-gray-800 rounded-lg">
                      <span className="font-medium">{query.title}</span>
                      <span className="text-sm text-gray-500">{query.date}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </AnimatedCard>
          </div>
          <div className="space-y-8">
            <AnimatedCard>
              <div className="p-6">
                <h3 className="text-xl font-semibold mb-4">Query Usage</h3>
                <div className="flex justify-between text-sm mb-1">
                  <span>Monthly Queries</span>
                  <span>{user.queriesUsed} / {user.queryLimit}</span>
                </div>
                <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                  <div className="bg-blue-600 h-2 rounded-full" style={{ width: `${(user.queriesUsed / user.queryLimit) * 100}%` }} />
                </div>
              </div>
            </AnimatedCard>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Portfolio;
