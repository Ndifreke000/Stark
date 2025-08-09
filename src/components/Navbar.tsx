import React from 'react';
import { Link } from 'react-router-dom';
import { Code2, User, Zap, Crown } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import ConnectWallet from './ConnectWallet';

const Navbar = () => {
  const { user } = useAuth();

  return (
    <nav className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <Link to="/" className="flex items-center space-x-2">
              <Code2 className="h-8 w-8 text-blue-600" />
              <span className="font-bold text-xl">StarkAnalytics</span>
            </Link>
          </div>

          <div className="flex items-center space-x-4">
            {user ? (
              <>
                <div className="flex items-center space-x-1 text-sm text-gray-600 dark:text-gray-300">
                  <span>{user.queriesUsed}/{user.queryLimit} queries</span>
                  {!user.isPremium && (
                    <Link to="/premium" className="text-yellow-600 hover:text-yellow-700">
                      <Crown className="h-4 w-4" />
                    </Link>
                  )}
                </div>
                
                <Link
                  to="/query"
                  className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium"
                >
                  Query Editor
                </Link>
                
                <Link
                  to="/create-bounty"
                  className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg text-sm font-medium"
                >
                  Create Bounty
                </Link>

                <Link
                  to="/portfolio"
                  className="flex items-center space-x-1 text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white"
                >
                  <User className="h-5 w-5" />
                  <span>Portfolio</span>
                </Link>
              </>
            ) : (
              <ConnectWallet />
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;