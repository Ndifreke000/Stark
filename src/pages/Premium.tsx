import React from 'react';
import { Check, Crown } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import AnimatedCard from '../components/ui/AnimatedCard';
import AnimatedButton from '../components/ui/AnimatedButton';

const Premium = () => {
  const { user } = useAuth();

  const features = {
    free: [
      '100 queries per month',
      'Basic SQL editor',
      'View public bounties',
    ],
    premium: [
      'Unlimited queries',
      'Advanced SQL editor',
      'Save & organize queries',
      'Export to CSV/PDF',
      'GitHub integration',
      'Priority support',
    ],
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <header className="bg-white dark:bg-gray-800/50 border-b border-gray-200 dark:border-gray-700/50">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12 text-center">
          <Crown className="w-12 h-12 mx-auto mb-4 text-yellow-500" />
          <h1 className="text-4xl font-bold tracking-tight">Premium Membership</h1>
          <p className="mt-3 text-lg text-gray-600 dark:text-gray-400">
            Unlock the full power of Stark for your analytics needs.
          </p>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Free Plan */}
          <AnimatedCard>
            <div className="p-8">
              <h3 className="text-2xl font-semibold mb-4">Free</h3>
              <p className="text-4xl font-bold mb-6">$0<span className="text-lg font-medium text-gray-500">/month</span></p>
              <ul className="space-y-3 mb-8">
                {features.free.map((text, i) => (
                  <li key={i} className="flex items-center">
                    <Check className="h-5 w-5 text-green-500 mr-3" />
                    <span>{text}</span>
                  </li>
                ))}
              </ul>
              <AnimatedButton variant="secondary" className="w-full" disabled>
                Your Current Plan
              </AnimatedButton>
            </div>
          </AnimatedCard>

          {/* Premium Plan */}
          <AnimatedCard className="border-blue-500">
            <div className="p-8">
              <h3 className="text-2xl font-semibold text-blue-600 mb-4">Premium</h3>
              <p className="text-4xl font-bold mb-6">$29<span className="text-lg font-medium text-gray-500">/month</span></p>
              <ul className="space-y-3 mb-8">
                {features.premium.map((text, i) => (
                  <li key={i} className="flex items-center">
                    <Check className="h-5 w-5 text-green-500 mr-3" />
                    <span>{text}</span>
                  </li>
                ))}
              </ul>
              <AnimatedButton variant="primary" className="w-full">
                Upgrade to Premium
              </AnimatedButton>
            </div>
          </AnimatedCard>
        </div>
      </main>
    </div>
  );
};

export default Premium;
