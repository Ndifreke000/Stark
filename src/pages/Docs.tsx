import React from 'react';
import { motion } from 'framer-motion';
import { BookOpen, Database, BarChart3, ExternalLink, Zap } from 'lucide-react';
import AnimatedCard from '../components/ui/AnimatedCard';

const Docs = () => {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <header className="bg-white dark:bg-gray-800/50 border-b border-gray-200 dark:border-gray-700/50">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12 text-center">
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <BookOpen className="w-12 h-12 mx-auto mb-4 text-blue-600" />
            <h1 className="text-4xl font-bold tracking-tight">Documentation</h1>
            <p className="mt-3 text-lg text-gray-600 dark:text-gray-400">
              Your guide to analyzing the Starknet ecosystem with Stark.
            </p>
          </motion.div>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="space-y-8">
          <AnimatedCard>
            <div className="p-6">
              <h2 className="text-2xl font-semibold mb-4 flex items-center">
                <Database className="w-6 h-6 mr-3 text-blue-600" />
                Introduction
              </h2>
              <p className="text-lg text-gray-600 dark:text-gray-300 leading-relaxed">
                Starknet is a Layer 2 scaling solution for Ethereum. This documentation will guide you through using our platform to analyze on-chain data, uncover trends, and contribute to the ecosystem.
              </p>
            </div>
          </AnimatedCard>

          <AnimatedCard>
            <div className="p-6">
              <h2 className="text-2xl font-semibold mb-4 flex items-center">
                <BarChart3 className="w-6 h-6 mr-3 text-blue-600" />
                Getting Started
              </h2>
              <ol className="list-decimal list-inside space-y-3 text-lg text-gray-600 dark:text-gray-300">
                <li><span className="font-semibold">Connect Wallet:</span> Connect your ArgentX or Braavos wallet.</li>
                <li><span className="font-semibold">Query Editor:</span> Write custom SQL queries to explore data.</li>
                <li><span className="font-semibold">Dashboards:</span> Create and share interactive data visualizations.</li>
                <li><span className="font-semibold">Bounties:</span> Participate in or create data analysis bounties.</li>
              </ol>
            </div>
          </AnimatedCard>

          <AnimatedCard>
            <div className="p-6">
              <h2 className="text-2xl font-semibold mb-4 flex items-center">
                <Zap className="w-6 h-6 mr-3 text-blue-600" />
                Sepolia RPC
              </h2>
              <p className="text-lg text-gray-600 dark:text-gray-300 leading-relaxed">
                The Sepolia RPC is your gateway to the Starknet testnet. It allows you to send requests to a Starknet node to execute transactions, query data, and more.
              </p>
            </div>
          </AnimatedCard>

          <AnimatedCard>
            <div className="p-6">
              <h2 className="text-2xl font-semibold mb-4 flex items-center">
                <ExternalLink className="w-6 h-6 mr-3 text-blue-600" />
                Useful Links
              </h2>
              <ul className="space-y-3 text-lg">
                <li><a href="https://www.starknet.io/" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">Official Starknet Website</a></li>
                <li><a href="https://book.starknet.io/" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">The Starknet Book</a></li>
                <li><a href="https://voyager.online/" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">Voyager Explorer</a></li>
              </ul>
            </div>
          </AnimatedCard>
        </div>
      </main>
    </div>
  );
};

export default Docs;
