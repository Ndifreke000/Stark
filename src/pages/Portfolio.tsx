import React from 'react';
import { Calendar, Code, Trophy, TrendingUp, GitBranch, Star, Clock } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

const Portfolio = () => {
  const { user } = useAuth();

  if (!user) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Please connect your wallet to view your portfolio</h1>
        </div>
      </div>
    );
  }

  const activityData = {
    queriesThisWeek: 12,
    bountiesWon: 3,
    totalEarnings: 1250,
    streakDays: 15,
    contributions: [
      { date: '2024-01-15', queries: 3, bounties: 1 },
      { date: '2024-01-16', queries: 5, bounties: 0 },
      { date: '2024-01-17', queries: 2, bounties: 1 },
      { date: '2024-01-18', queries: 4, bounties: 0 },
      { date: '2024-01-19', queries: 1, bounties: 0 },
      { date: '2024-01-20', queries: 7, bounties: 2 },
      { date: '2024-01-21', queries: 3, bounties: 0 },
    ]
  };

  const recentQueries = [
    { id: 1, title: 'DeFi TVL Analysis', date: '2024-01-21', complexity: 'Medium', shares: 24 },
    { id: 2, title: 'Bridge Volume Trends', date: '2024-01-20', complexity: 'Hard', shares: 18 },
    { id: 3, title: 'Top Wallet Analysis', date: '2024-01-19', complexity: 'Easy', shares: 35 },
    { id: 4, title: 'Gas Fee Optimization Study', date: '2024-01-18', complexity: 'Hard', shares: 12 },
  ];

  const achievements = [
    { title: 'Query Master', description: '100+ queries executed', icon: Code, earned: true },
    { title: 'Bounty Hunter', description: 'Won 5+ bounties', icon: Trophy, earned: true },
    { title: 'Streak Legend', description: '30-day activity streak', icon: TrendingUp, earned: false },
    { title: 'Community Star', description: '1000+ query shares', icon: Star, earned: false },
  ];

  // Generate GitHub-style activity graph
  const generateActivityGraph = () => {
    const weeks = 20;
    const days = [];
    const today = new Date();
    
    for (let i = weeks * 7; i >= 0; i--) {
      const date = new Date(today);
      date.setDate(date.getDate() - i);
      const activity = Math.floor(Math.random() * 5); // 0-4 activity level
      days.push({
        date: date.toISOString().split('T')[0],
        activity
      });
    }
    
    return days;
  };

  const activityGraph = generateActivityGraph();

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Profile Header */}
      <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6 mb-8">
        <div className="flex items-start justify-between">
          <div className="flex items-center space-x-4">
            <div className="h-20 w-20 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
              <span className="text-2xl font-bold text-white">
                {user.name ? user.name.charAt(0).toUpperCase() : user.address.slice(2, 4).toUpperCase()}
              </span>
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                {user.name || 'Anonymous Analyst'}
              </h1>
              <p className="text-gray-600 dark:text-gray-300">{user.address}</p>
              {user.email && (
                <p className="text-gray-500 dark:text-gray-400 text-sm">{user.email}</p>
              )}
            </div>
          </div>
          
          <div className="text-right">
            <div className="flex items-center space-x-4 mb-2">
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-600">{activityData.queriesThisWeek}</div>
                <div className="text-xs text-gray-500">Queries this week</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600">{activityData.bountiesWon}</div>
                <div className="text-xs text-gray-500">Bounties won</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-purple-600">{activityData.totalEarnings}</div>
                <div className="text-xs text-gray-500">STRK earned</div>
              </div>
            </div>
            <div className="flex items-center space-x-2 text-sm text-gray-600 dark:text-gray-300">
              <TrendingUp className="h-4 w-4" />
              <span>{activityData.streakDays} day streak</span>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Activity Graph */}
        <div className="lg:col-span-2">
          <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
              <GitBranch className="h-5 w-5 mr-2" />
              Activity Graph
            </h2>
            
            <div className="mb-4">
              <div className="text-sm text-gray-600 dark:text-gray-300 mb-2">
                {user.queriesUsed} queries in the last year
              </div>
              
              {/* GitHub-style activity graph */}
              <div className="flex flex-wrap gap-1">
                {activityGraph.map((day, index) => (
                  <div
                    key={index}
                    className={`w-3 h-3 rounded-sm ${
                      day.activity === 0 ? 'bg-gray-200 dark:bg-gray-700' :
                      day.activity === 1 ? 'bg-green-200 dark:bg-green-900' :
                      day.activity === 2 ? 'bg-green-300 dark:bg-green-800' :
                      day.activity === 3 ? 'bg-green-400 dark:bg-green-700' :
                      'bg-green-500 dark:bg-green-600'
                    }`}
                    title={`${day.date}: ${day.activity} queries`}
                  />
                ))}
              </div>
              
              <div className="flex items-center justify-between text-xs text-gray-500 mt-2">
                <span>Less active</span>
                <div className="flex items-center space-x-1">
                  {[0, 1, 2, 3, 4].map(level => (
                    <div
                      key={level}
                      className={`w-3 h-3 rounded-sm ${
                        level === 0 ? 'bg-gray-200 dark:bg-gray-700' :
                        level === 1 ? 'bg-green-200 dark:bg-green-900' :
                        level === 2 ? 'bg-green-300 dark:bg-green-800' :
                        level === 3 ? 'bg-green-400 dark:bg-green-700' :
                        'bg-green-500 dark:bg-green-600'
                      }`}
                    />
                  ))}
                </div>
                <span>More active</span>
              </div>
            </div>

            {/* Recent Queries */}
            <h3 className="text-md font-medium text-gray-900 dark:text-white mb-3">Recent Queries</h3>
            <div className="space-y-3">
              {recentQueries.map((query) => (
                <div key={query.id} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                  <div>
                    <h4 className="font-medium text-gray-900 dark:text-white">{query.title}</h4>
                    <div className="flex items-center space-x-2 text-sm text-gray-500">
                      <Calendar className="h-4 w-4" />
                      <span>{query.date}</span>
                      <span className={`px-2 py-1 rounded-full text-xs ${
                        query.complexity === 'Easy' ? 'bg-green-100 text-green-800' :
                        query.complexity === 'Medium' ? 'bg-yellow-100 text-yellow-800' :
                        'bg-red-100 text-red-800'
                      }`}>
                        {query.complexity}
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2 text-sm text-gray-500">
                    <Star className="h-4 w-4" />
                    <span>{query.shares} shares</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Achievements & Stats */}
        <div className="space-y-6">
          {/* Query Limits */}
          <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Query Usage</h3>
            
            <div className="mb-4">
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm text-gray-600 dark:text-gray-300">Monthly Queries</span>
                <span className="text-sm font-medium">{user.queriesUsed}/{user.queryLimit}</span>
              </div>
              <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                <div 
                  className="bg-blue-600 h-2 rounded-full" 
                  style={{ width: `${(user.queriesUsed / user.queryLimit) * 100}%` }}
                />
              </div>
            </div>
            
            {!user.isPremium && (
              <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-3">
                <p className="text-sm text-yellow-800 dark:text-yellow-200 mb-2">
                  Limited queries remaining. Upgrade for unlimited access!
                </p>
                <button className="text-sm font-medium text-yellow-600 hover:text-yellow-700">
                  Upgrade to Premium →
                </button>
              </div>
            )}
          </div>

          {/* Achievements */}
          <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Achievements</h3>
            
            <div className="space-y-3">
              {achievements.map((achievement, index) => (
                <div key={index} className={`flex items-center space-x-3 p-3 rounded-lg ${
                  achievement.earned 
                    ? 'bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800' 
                    : 'bg-gray-50 dark:bg-gray-700 opacity-60'
                }`}>
                  <achievement.icon className={`h-6 w-6 ${
                    achievement.earned ? 'text-green-600' : 'text-gray-400'
                  }`} />
                  <div>
                    <h4 className="font-medium text-gray-900 dark:text-white">{achievement.title}</h4>
                    <p className="text-sm text-gray-600 dark:text-gray-300">{achievement.description}</p>
                  </div>
                  {achievement.earned && (
                    <div className="text-green-600">
                      <Trophy className="h-5 w-5" />
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Portfolio;