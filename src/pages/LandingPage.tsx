import React from 'react';
import { Link } from 'react-router-dom';
import { Code2, Trophy, TrendingUp, ArrowRight, Database, BarChart3, Users, DollarSign } from 'lucide-react';
import { motion } from 'framer-motion';
import AnimatedButton from '../components/ui/AnimatedButton';
import AnimatedCard from '../components/ui/AnimatedCard';

const LandingPage = () => {
  const stats = [
    { icon: Trophy, value: '12+', label: 'Active Bounties' },
    { icon: DollarSign, value: '$15K+', label: 'in Rewards' },
    { icon: Users, value: '150+', label: 'Analysts' },
    { icon: BarChart3, value: '12K+', label: 'Queries Run' },
  ];

  const features = [
    {
      icon: Code2,
      title: 'Advanced Query Editor',
      description: 'Write, run, and analyze complex SQL queries on Starknet data with a powerful and intuitive editor.',
    },
    {
      icon: Trophy,
      title: 'Bounty System',
      description: 'Earn STRK tokens by solving analytics challenges and contributing to the ecosystem.',
    },
    {
      icon: TrendingUp,
      title: 'Interactive Dashboards',
      description: 'Build and share dynamic, real-time visualizations to uncover trends and insights.',
    },
  ];

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-gray-100 font-['Inter',sans-serif]">
      {/* Hero Section */}
      <section className="relative bg-white dark:bg-gray-900">
        <div className="absolute inset-0 bg-gradient-to-b from-blue-50 dark:from-blue-900/20 to-transparent" />
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-24 pb-20 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <h1 className="text-5xl md:text-7xl font-bold tracking-tighter mb-6">
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-purple-600">Starklytics:</span> The Analytics Hub for Starknet
            </h1>
            <p className="text-lg md:text-xl text-gray-600 dark:text-gray-400 max-w-3xl mx-auto mb-10">
              Unlock on-chain intelligence. Query, visualize, and collaborate on Starknet data analysis like never before.
            </p>
            <div className="flex justify-center gap-4">
              <Link to="/query">
                <AnimatedButton size="lg" variant="primary">
                  Start Querying <ArrowRight className="w-5 h-5 ml-2" />
                </AnimatedButton>
              </Link>
              <Link to="/bounties">
                <AnimatedButton size="lg" variant="secondary">
                  Explore Bounties
                </AnimatedButton>
              </Link>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="bg-white dark:bg-gray-800/50 border-y border-gray-200 dark:border-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {stats.map((stat, index) => (
              <motion.div
                key={index}
                className="text-center"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
              >
                <stat.icon className="w-8 h-8 mx-auto mb-3 text-blue-600" />
                <div className="text-3xl font-bold">{stat.value}</div>
                <div className="text-gray-500 dark:text-gray-400">{stat.label}</div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold tracking-tighter">A Powerful Toolkit for On-Chain Analysis</h2>
            <p className="mt-4 text-lg text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
              Everything you need to go from raw data to actionable insights.
            </p>
          </div>
          <div className="grid md:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
              >
                <AnimatedCard className="p-8 h-full text-center">
                  <div className="inline-flex items-center justify-center w-12 h-12 bg-blue-100 dark:bg-blue-900/50 text-blue-600 rounded-lg mb-6">
                    <feature.icon className="w-6 h-6" />
                  </div>
                  <h3 className="text-xl font-bold mb-3">{feature.title}</h3>
                  <p className="text-gray-600 dark:text-gray-400">{feature.description}</p>
                </AnimatedCard>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="bg-white dark:bg-gray-800/50">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
          <div className="text-center">
            <h2 className="text-4xl font-bold tracking-tighter">Ready to Dive In?</h2>
            <p className="mt-3 text-lg text-gray-600 dark:text-gray-400">
              Create an account and start exploring the Starknet data ecosystem today.
            </p>
            <div className="mt-8">
              <Link to="/signup">
                <AnimatedButton size="lg" variant="primary">
                  Sign Up for Free
                  <ArrowRight className="w-5 h-5 ml-2" />
                </AnimatedButton>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-gray-200 dark:border-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex justify-between items-center">
            <p className="text-gray-500">&copy; {new Date().getFullYear()} Starklytics. All rights reserved.</p>
            <div className="flex gap-6">
              <Link to="/about" className="text-gray-500 hover:text-gray-700 dark:hover:text-gray-300">About</Link>
              <Link to="/docs" className="text-gray-500 hover:text-gray-700 dark:hover:text-gray-300">Docs</Link>
              <Link to="/contact" className="text-gray-500 hover:text-gray-700 dark:hover:text-gray-300">Contact</Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;
