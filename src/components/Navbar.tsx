import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Code2, User, Crown, LogOut, ChevronDown, Trophy, BarChart3, Database, BookOpen, Zap } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import ConnectWallet from './ConnectWallet';
import { motion, AnimatePresence } from 'framer-motion';
import AnimatedButton from './ui/AnimatedButton';

const Navbar = () => {
  const { user, signOut, disconnect } = useAuth();
  const [showUserMenu, setShowUserMenu] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  const handleSignOut = async () => {
    if (user?.authMethod === 'wallet') {
      await disconnect();
    } else {
      signOut();
    }
    setShowUserMenu(false);
    navigate('/');
  };

  const isActive = (path: string) => location.pathname.startsWith(path);

  const navLinks = [
    { to: '/query', label: 'Query', icon: Code2 },
    { to: '/dashboard', label: 'Dashboards', icon: BarChart3 },
    { to: '/bounties', label: 'Bounties', icon: Trophy },
    { to: '/docs', label: 'Docs', icon: BookOpen },
  ];

  return (
    <nav className="sticky top-0 z-50 bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo and Nav Links */}
          <div className="flex items-center space-x-8">
            <Link to="/" className="flex items-center space-x-2">
              <Database className="h-6 w-6 text-blue-600" />
              <span className="font-bold text-xl text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-purple-600">Starklytics</span>
            </Link>
            <div className="hidden md:flex items-center space-x-6">
              {user && navLinks.map(({ to, label }) => (
                <Link
                  key={to}
                  to={to}
                  className={`text-sm font-medium transition-colors ${
                    isActive(to)
                      ? 'text-blue-600 dark:text-blue-400'
                      : 'text-gray-500 hover:text-gray-900 dark:hover:text-white'
                  }`}
                >
                  {label}
                </Link>
              ))}
            </div>
          </div>

          {/* Right Side */}
          <div className="flex items-center space-x-4">
            {user ? (
              <>
                <div className="hidden sm:block">
                  <Link to="/create-bounty">
                    <AnimatedButton size="sm" variant="primary">
                      Create Bounty
                    </AnimatedButton>
                  </Link>
                </div>
                <div className="relative">
                  <button
                    onClick={() => setShowUserMenu(!showUserMenu)}
                    className="flex items-center space-x-2 p-1 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800"
                  >
                    <div className="h-8 w-8 bg-gray-200 dark:bg-gray-700 rounded-full flex items-center justify-center">
                      <span className="font-semibold text-sm">
                        {user.name ? user.name.charAt(0).toUpperCase() :
                         user.address ? user.address.slice(2, 4).toUpperCase() :
                         user.email ? user.email.charAt(0).toUpperCase() : 'U'}
                      </span>
                    </div>
                    <ChevronDown className={`h-4 w-4 text-gray-500 transition-transform ${showUserMenu ? 'rotate-180' : ''}`} />
                  </button>
                  <AnimatePresence>
                    {showUserMenu && (
                      <motion.div
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        className="absolute right-0 mt-2 w-56 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 py-1"
                      >
                        <div className="px-3 py-2 border-b border-gray-200 dark:border-gray-700">
                          <p className="text-sm font-semibold truncate">{user.name || user.email || `${user.address?.slice(0, 6)}...${user.address?.slice(-4)}`}</p>
                        </div>
                        <Link to="/profile" className="block px-3 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700" onClick={() => setShowUserMenu(false)}>Profile</Link>
                        <Link to="/portfolio" className="block px-3 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700" onClick={() => setShowUserMenu(false)}>Portfolio</Link>
                        {!user.isPremium && <Link to="/premium" className="block px-3 py-2 text-sm text-blue-600 font-semibold hover:bg-gray-100 dark:hover:bg-gray-700" onClick={() => setShowUserMenu(false)}>Upgrade</Link>}
                        <button onClick={handleSignOut} className="w-full text-left block px-3 py-2 text-sm text-red-600 hover:bg-gray-100 dark:hover:bg-gray-700">
                          Sign Out
                        </button>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </>
            ) : (
              <div className="flex items-center space-x-2">
                <Link to="/signin">
                  <AnimatedButton size="sm" variant="secondary">Sign In</AnimatedButton>
                </Link>
                <Link to="/signup">
                  <AnimatedButton size="sm" variant="primary">Sign Up</AnimatedButton>
                </Link>
                <ConnectWallet />
              </div>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
