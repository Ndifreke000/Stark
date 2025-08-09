import React from 'react';
import { Crown, Check, Zap, Download, Github, Infinity } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

const Premium = () => {
  const { user } = useAuth();

  const features = {
    free: [
      { text: '100 queries per month', included: true },
      { text: 'Basic SQL editor', included: true },
      { text: 'View public bounties', included: true },
      { text: 'Create bounties', included: true },
      { text: 'Save queries', included: false },
      { text: 'Export dashboards', included: false },
      { text: 'GitHub integration', included: false },
      { text: 'Unlimited queries', included: false },
      { text: 'Priority support', included: false },
    ],
    premium: [
      { text: 'Unlimited queries', included: true },
      { text: 'Advanced SQL editor', included: true },
      { text: 'Save & organize queries', included: true },
      { text: 'Export to CSV/PDF', included: true },
      { text: 'GitHub integration', included: true },
      { text: 'Custom dashboards', included: true },
      { text: 'Priority support', included: true },
      { text: 'Early access to features', included: true },
      { text: 'API access', included: true },
    ]
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      {/* Header */}
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
          Upgrade to Premium
        </h1>
        <p className="text-xl text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
          Unlock unlimited queries, advanced features, and build your analytics portfolio faster
        </p>
      </div>

      {/* Current Usage */}
      {user && (
        <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-6 mb-12">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-semibold text-blue-900 dark:text-blue-200 mb-2">Current Usage</h3>
              <div className="flex items-center space-x-4 text-sm">
                <span className="text-blue-700 dark:text-blue-300">
                  Queries: {user.queriesUsed}/{user.queryLimit} this month
                </span>
                <span className="text-blue-700 dark:text-blue-300">
                  Status: {user.isPremium ? 'Premium' : 'Free'}
                </span>
              </div>
            </div>
            <div className="text-right">
              <div className="text-2xl font-bold text-blue-600 mb-1">
                {Math.round((user.queriesUsed / user.queryLimit) * 100)}%
              </div>
              <div className="text-sm text-blue-600">Used</div>
            </div>
          </div>
          <div className="w-full bg-blue-200 dark:bg-blue-800 rounded-full h-2 mt-3">
            <div 
              className="bg-blue-600 h-2 rounded-full" 
              style={{ width: `${Math.min((user.queriesUsed / user.queryLimit) * 100, 100)}%` }}
            />
          </div>
        </div>
      )}

      {/* Pricing Cards */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-12">
        {/* Free Plan */}
        <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-8">
          <div className="text-center mb-8">
            <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Free</h3>
            <div className="text-4xl font-bold text-gray-900 dark:text-white mb-1">$0</div>
            <div className="text-gray-600 dark:text-gray-400">per month</div>
          </div>

          <ul className="space-y-3 mb-8">
            {features.free.map((feature, index) => (
              <li key={index} className="flex items-center">
                {feature.included ? (
                  <Check className="h-5 w-5 text-green-500 mr-3 flex-shrink-0" />
                ) : (
                  <div className="h-5 w-5 mr-3 flex-shrink-0" />
                )}
                <span className={`text-sm ${feature.included ? 'text-gray-900 dark:text-white' : 'text-gray-400'}`}>
                  {feature.text}
                </span>
              </li>
            ))}
          </ul>

          <button
            disabled
            className="w-full py-3 px-4 bg-gray-200 dark:bg-gray-700 text-gray-500 rounded-lg font-medium cursor-not-allowed"
          >
            Current Plan
          </button>
        </div>

        {/* Premium Plan */}
        <div className="bg-gradient-to-br from-blue-600 to-purple-600 rounded-lg p-8 text-white relative overflow-hidden">
          <div className="absolute top-4 right-4">
            <Crown className="h-8 w-8 text-yellow-300" />
          </div>
          
          <div className="text-center mb-8">
            <h3 className="text-2xl font-bold mb-2">Premium</h3>
            <div className="text-4xl font-bold mb-1">$29</div>
            <div className="text-blue-100">per month</div>
          </div>

          <ul className="space-y-3 mb-8">
            {features.premium.map((feature, index) => (
              <li key={index} className="flex items-center">
                <Check className="h-5 w-5 text-green-300 mr-3 flex-shrink-0" />
                <span className="text-sm text-white">
                  {feature.text}
                </span>
              </li>
            ))}
          </ul>

          <button className="w-full py-3 px-4 bg-white text-blue-600 rounded-lg font-medium hover:bg-gray-50 transition-colors">
            Upgrade Now
          </button>
        </div>
      </div>

      {/* Feature Highlights */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
        <div className="text-center">
          <div className="w-16 h-16 bg-blue-100 dark:bg-blue-900/20 rounded-full flex items-center justify-center mx-auto mb-4">
            <Infinity className="h-8 w-8 text-blue-600" />
          </div>
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">Unlimited Queries</h3>
          <p className="text-gray-600 dark:text-gray-300 text-sm">
            Execute unlimited SQL queries without worrying about monthly limits
          </p>
        </div>

        <div className="text-center">
          <div className="w-16 h-16 bg-green-100 dark:bg-green-900/20 rounded-full flex items-center justify-center mx-auto mb-4">
            <Download className="h-8 w-8 text-green-600" />
          </div>
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">Export Everything</h3>
          <p className="text-gray-600 dark:text-gray-300 text-sm">
            Export your dashboards, queries, and results to CSV, PDF, and more
          </p>
        </div>

        <div className="text-center">
          <div className="w-16 h-16 bg-purple-100 dark:bg-purple-900/20 rounded-full flex items-center justify-center mx-auto mb-4">
            <Github className="h-8 w-8 text-purple-600" />
          </div>
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">GitHub Integration</h3>
          <p className="text-gray-600 dark:text-gray-300 text-sm">
            Sync your analytics portfolio with GitHub and showcase your work
          </p>
        </div>
      </div>

      {/* FAQ */}
      <div className="max-w-3xl mx-auto">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white text-center mb-8">
          Frequently Asked Questions
        </h2>
        
        <div className="space-y-6">
          <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
            <h3 className="font-semibold text-gray-900 dark:text-white mb-2">
              What happens to my saved queries if I downgrade?
            </h3>
            <p className="text-gray-600 dark:text-gray-300 text-sm">
              Your saved queries remain accessible, but you won't be able to save new ones or execute more than 100 queries per month.
            </p>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
            <h3 className="font-semibold text-gray-900 dark:text-white mb-2">
              Can I cancel anytime?
            </h3>
            <p className="text-gray-600 dark:text-gray-300 text-sm">
              Yes, you can cancel your premium subscription at any time. You'll continue to have premium access until the end of your billing cycle.
            </p>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
            <h3 className="font-semibold text-gray-900 dark:text-white mb-2">
              Do you offer team plans?
            </h3>
            <p className="text-gray-600 dark:text-gray-300 text-sm">
              Team plans are coming soon! Contact us for early access and volume discounts.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Premium;