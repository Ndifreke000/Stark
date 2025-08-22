import React from 'react';
import { Link } from 'react-router-dom';
import { Code2, Trophy, TrendingUp, ArrowRight, Sparkles, Users, DollarSign, Database, Zap, Star, BarChart3 } from 'lucide-react';
import { motion } from 'framer-motion';
import RpcStatus from '../components/RpcStatus';

const LandingPage = () => {
  const stats = {
    activeBounties: 12,
    totalRewards: 15420,
    totalAnalysts: 156,
    queriesExecuted: 12847
  };

  const features = [
    {
      icon: Code2,
      title: 'Advanced Query Editor',
      description: 'Write SQL queries with syntax highlighting, auto-completion, and real-time schema exploration.',
      color: 'from-blue-500 to-cyan-500',
      delay: 0.1
    },
    {
      icon: Trophy,
      title: 'Bounty System',
      description: 'Earn STRK tokens by solving analytics challenges and building your reputation in the community.',
      color: 'from-yellow-500 to-orange-500',
      delay: 0.2
    },
    {
      icon: TrendingUp,
      title: 'Interactive Dashboards',
      description: 'Create beautiful visualizations and share insights with the Starknet ecosystem.',
      color: 'from-green-500 to-emerald-500',
      delay: 0.3
    }
  ];

  const recentBounties = [
    {
      id: '1',
      title: 'Analyze DeFi TVL Trends',
      reward: 500,
      submissions: 12,
      difficulty: 'Medium',
      delay: 0.1
    },
    {
      id: '2',
      title: 'Bridge Activity Analysis',
      reward: 750,
      submissions: 8,
      difficulty: 'Hard',
      delay: 0.2
    },
    {
      id: '3',
      title: 'NFT Trading Patterns',
      reward: 300,
      submissions: 23,
      difficulty: 'Easy',
      delay: 0.3
    }
  ];

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
        type: "spring" as const,
        stiffness: 100,
        damping: 10
      }
    }
  };

  const floatingAnimation = {
    y: [-10, 10, -10],
    transition: {
      duration: 6,
      repeat: Infinity,
      ease: "easeInOut" as const
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50 dark:from-gray-900 dark:via-gray-900 dark:to-blue-950 font-['Inter',sans-serif]">
      {/* Hero Section */}
      <section className="relative overflow-hidden">
        {/* Animated Background Elements */}
        <div className="absolute inset-0">
          <motion.div 
            className="absolute top-20 left-10 w-72 h-72 bg-blue-400/20 rounded-full blur-3xl"
            animate={floatingAnimation}
          />
          <motion.div 
            className="absolute bottom-20 right-10 w-96 h-96 bg-purple-400/20 rounded-full blur-3xl"
            animate={{
              y: [10, -10, 10],
              transition: {
                duration: 8,
                repeat: Infinity,
                ease: "easeInOut" as const
              }
            }}
          />
          <motion.div 
            className="absolute top-1/2 left-1/2 w-64 h-64 bg-green-400/10 rounded-full blur-3xl"
            animate={{
              scale: [1, 1.2, 1],
              rotate: [0, 180, 360],
              transition: {
                duration: 20,
                repeat: Infinity,
                ease: "linear" as const
              }
            }}
          />
        </div>
        
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-20 pb-32">
          <motion.div 
            className="text-center max-w-5xl mx-auto"
            variants={containerVariants}
            initial="hidden"
            animate="visible"
          >
            <motion.div 
              className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-100 to-purple-100 dark:from-blue-900/30 dark:to-purple-900/30 rounded-full text-blue-700 dark:text-blue-300 text-sm font-semibold mb-8 border border-blue-200/50 dark:border-blue-700/50 shadow-lg backdrop-blur-sm"
              variants={itemVariants}
              whileHover={{ 
                scale: 1.05,
                boxShadow: "0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)"
              }}
              whileTap={{ scale: 0.95 }}
            >
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 2, repeat: Infinity, ease: "linear" as const }}
              >
                <Sparkles className="w-4 h-4" />
              </motion.div>
              Powered by Starknet
            </motion.div>
            
            <motion.h1 
              className="text-6xl md:text-8xl font-black text-gray-900 dark:text-white mb-8 leading-tight tracking-tight"
              variants={itemVariants}
            >
              Analytics
              <motion.span 
                className="bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent"
                animate={{
                  backgroundPosition: ["0% 50%", "100% 50%", "0% 50%"],
                }}
                transition={{
                  duration: 5,
                  repeat: Infinity,
                  ease: "linear" as const
                }}
                style={{
                  backgroundSize: "200% 200%"
                }}
              > Reimagined</motion.span>
            </motion.h1>
            
            <motion.p 
              className="text-xl md:text-2xl text-gray-600 dark:text-gray-300 mb-12 leading-relaxed font-medium"
              variants={itemVariants}
            >
              Query Starknet data, create stunning visualizations, and earn rewards for your insights. 
              <br className="hidden md:block" />
              <motion.span 
                className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-purple-600 font-semibold"
                whileHover={{ scale: 1.05 }}
              >
                Join the future of blockchain analytics.
              </motion.span>
            </motion.p>

            <motion.div 
              className="flex flex-col sm:flex-row items-center justify-center gap-6 mb-16"
              variants={itemVariants}
            >
              <motion.div
                whileHover={{ 
                  scale: 1.05,
                  boxShadow: "0 25px 50px -12px rgba(59, 130, 246, 0.5)"
                }}
                whileTap={{ scale: 0.95 }}
              >
                <Link
                  to="/query"
                  className="group w-full sm:w-auto inline-flex items-center justify-center gap-3 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white px-8 py-4 rounded-2xl font-bold text-lg shadow-xl transition-all duration-300 border border-blue-500/20"
                >
                  <motion.div
                    animate={{ rotate: [0, 5, -5, 0] }}
                    transition={{ duration: 2, repeat: Infinity }}
                  >
                    <Code2 className="w-6 h-6" />
                  </motion.div>
                  Start Querying
                  <motion.div
                    className="group-hover:translate-x-1 transition-transform duration-200"
                  >
                    <ArrowRight className="w-5 h-5" />
                  </motion.div>
                </Link>
              </motion.div>
              
              <motion.div
                whileHover={{ 
                  scale: 1.05,
                  boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.1)"
                }}
                whileTap={{ scale: 0.95 }}
              >
                <Link
                  to="/bounties"
                  className="group w-full sm:w-auto inline-flex items-center justify-center gap-3 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 text-gray-900 dark:text-white px-8 py-4 rounded-2xl font-bold text-lg border-2 border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600 transition-all duration-300 shadow-lg backdrop-blur-sm"
                >
                  <motion.div
                    animate={{ 
                      rotate: [0, -10, 10, 0],
                      scale: [1, 1.1, 1]
                    }}
                    transition={{ duration: 3, repeat: Infinity }}
                  >
                    <Trophy className="w-6 h-6 text-yellow-500" />
                  </motion.div>
                  Explore Bounties
                </Link>
              </motion.div>
            </motion.div>

            <motion.div className="max-w-md mx-auto mb-16" variants={itemVariants}>
              <RpcStatus />
            </motion.div>

            {/* Animated Stats */}
            <motion.div 
              className="grid grid-cols-2 md:grid-cols-4 gap-8 max-w-5xl mx-auto"
              variants={containerVariants}
            >
              {[
                { value: stats.activeBounties, label: 'Active Bounties', color: 'text-blue-600', icon: Trophy },
                { value: stats.totalRewards.toLocaleString(), label: 'STRK Rewards', color: 'text-green-600', icon: DollarSign },
                { value: stats.totalAnalysts, label: 'Analysts', color: 'text-purple-600', icon: Users },
                { value: stats.queriesExecuted.toLocaleString(), label: 'Queries Run', color: 'text-orange-600', icon: BarChart3 }
              ].map((stat, index) => (
                <motion.div 
                  key={index}
                  className="text-center group"
                  variants={itemVariants}
                  whileHover={{ 
                    scale: 1.1,
                    y: -5
                  }}
                  transition={{ type: "spring" as const, stiffness: 300 }}
                >
                  <motion.div
                    className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-800 dark:to-gray-700 mb-3 group-hover:shadow-lg transition-all duration-300"
                    whileHover={{ rotate: 360 }}
                    transition={{ duration: 0.6 }}
                  >
                    <stat.icon className={`w-6 h-6 ${stat.color}`} />
                  </motion.div>
                  <motion.div 
                    className={`text-4xl md:text-5xl font-black ${stat.color} mb-2`}
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ delay: index * 0.1, type: "spring" as const, stiffness: 200 }}
                  >
                    {stat.value}
                  </motion.div>
                  <div className="text-gray-600 dark:text-gray-400 font-semibold text-sm">
                    {stat.label}
                  </div>
                </motion.div>
              ))}
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-24 bg-white dark:bg-gray-800 relative overflow-hidden">
        <motion.div 
          className="absolute inset-0 bg-gradient-to-r from-blue-50/50 to-purple-50/50 dark:from-blue-950/20 dark:to-purple-950/20"
          animate={{
            backgroundPosition: ["0% 0%", "100% 100%", "0% 0%"],
          }}
          transition={{
            duration: 20,
            repeat: Infinity,
            ease: "linear" as const
          }}
          style={{
            backgroundSize: "400% 400%"
          }}
        />
        
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div 
            className="text-center mb-20"
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
          >
            <motion.h2 
              className="text-5xl md:text-6xl font-black text-gray-900 dark:text-white mb-6"
              whileHover={{ scale: 1.02 }}
            >
              Everything you need to analyze 
              <motion.span 
                className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-purple-600"
                animate={{
                  backgroundPosition: ["0% 50%", "100% 50%", "0% 50%"],
                }}
                transition={{
                  duration: 3,
                  repeat: Infinity,
                  ease: "linear" as const
                }}
                style={{
                  backgroundSize: "200% 200%"
                }}
              > Starknet</motion.span>
            </motion.h2>
            <motion.p 
              className="text-xl text-gray-600 dark:text-gray-300 max-w-4xl mx-auto font-medium"
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              transition={{ delay: 0.3, duration: 0.8 }}
            >
              Professional-grade tools for blockchain analytics, from SQL queries to interactive dashboards.
            </motion.p>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <motion.div 
                key={index} 
                className="group relative"
                initial={{ opacity: 0, y: 50 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: feature.delay, duration: 0.8 }}
                whileHover={{ 
                  y: -10,
                  transition: { type: "spring" as const, stiffness: 300 }
                }}
              >
                <motion.div 
                  className="absolute inset-0 bg-gradient-to-r opacity-0 group-hover:opacity-20 transition-opacity duration-500 rounded-3xl blur-xl" 
                  style={{
                    background: `linear-gradient(135deg, ${feature.color.split(' ')[1]}, ${feature.color.split(' ')[3]})`
                  }}
                />
                <motion.div 
                  className="relative bg-white dark:bg-gray-900 p-8 rounded-3xl border border-gray-200 dark:border-gray-700 hover:border-transparent dark:hover:border-transparent transition-all duration-500 hover:shadow-2xl backdrop-blur-sm group-hover:shadow-[0_35px_60px_-15px_rgba(0,0,0,0.3)]"
                  whileHover={{ 
                    scale: 1.02,
                    rotateY: 5,
                    rotateX: 5
                  }}
                  style={{ transformStyle: "preserve-3d" }}
                >
                  <motion.div 
                    className={`inline-flex p-4 rounded-2xl bg-gradient-to-r ${feature.color} mb-6 shadow-lg`}
                    whileHover={{ 
                      rotate: [0, -10, 10, 0],
                      scale: 1.1
                    }}
                    transition={{ duration: 0.6 }}
                  >
                    <feature.icon className="w-8 h-8 text-white" />
                  </motion.div>
                  <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-4 group-hover:text-transparent group-hover:bg-clip-text group-hover:bg-gradient-to-r group-hover:from-blue-600 group-hover:to-purple-600 transition-all duration-300">
                    {feature.title}
                  </h3>
                  <p className="text-gray-600 dark:text-gray-300 leading-relaxed font-medium">
                    {feature.description}
                  </p>
                  
                  {/* Floating particles effect */}
                  <motion.div
                    className="absolute top-4 right-4 w-2 h-2 bg-blue-400 rounded-full opacity-0 group-hover:opacity-100"
                    animate={{
                      y: [-20, -40, -20],
                      x: [0, 10, 0],
                      scale: [0, 1, 0]
                    }}
                    transition={{
                      duration: 2,
                      repeat: Infinity,
                      delay: 0.5
                    }}
                  />
                  <motion.div
                    className="absolute bottom-4 left-4 w-1 h-1 bg-purple-400 rounded-full opacity-0 group-hover:opacity-100"
                    animate={{
                      y: [20, 40, 20],
                      x: [0, -10, 0],
                      scale: [0, 1, 0]
                    }}
                    transition={{
                      duration: 2,
                      repeat: Infinity,
                      delay: 1
                    }}
                  />
                </motion.div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Recent Bounties Preview */}
      <section className="py-24 bg-gradient-to-br from-gray-50 to-blue-50 dark:from-gray-900 dark:to-blue-950 relative overflow-hidden">
        <motion.div
          className="absolute inset-0 opacity-30"
          animate={{
            background: [
              "radial-gradient(circle at 20% 50%, rgba(59, 130, 246, 0.1) 0%, transparent 50%)",
              "radial-gradient(circle at 80% 50%, rgba(147, 51, 234, 0.1) 0%, transparent 50%)",
              "radial-gradient(circle at 20% 50%, rgba(59, 130, 246, 0.1) 0%, transparent 50%)"
            ]
          }}
          transition={{ duration: 10, repeat: Infinity }}
        />
        
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div 
            className="flex items-center justify-between mb-16"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <div>
              <motion.h2 
                className="text-5xl md:text-6xl font-black text-gray-900 dark:text-white mb-4"
                whileHover={{ scale: 1.02 }}
              >
                Latest 
                <motion.span 
                  className="text-transparent bg-clip-text bg-gradient-to-r from-yellow-500 to-orange-500"
                  animate={{ rotate: [0, 2, -2, 0] }}
                  transition={{ duration: 4, repeat: Infinity }}
                > Bounties</motion.span>
              </motion.h2>
              <p className="text-xl text-gray-600 dark:text-gray-300 font-medium">
                Earn STRK tokens by solving analytics challenges
              </p>
            </div>
            <motion.div
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <Link
                to="/bounties"
                className="group inline-flex items-center gap-2 text-blue-600 hover:text-blue-700 font-bold text-lg transition-colors duration-200"
              >
                View all bounties
                <motion.div
                  className="group-hover:translate-x-1 transition-transform duration-200"
                >
                  <ArrowRight className="w-5 h-5" />
                </motion.div>
              </Link>
            </motion.div>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-8">
            {recentBounties.map((bounty, index) => (
              <motion.div
                key={bounty.id}
                initial={{ opacity: 0, y: 50, rotateX: -15 }}
                whileInView={{ opacity: 1, y: 0, rotateX: 0 }}
                viewport={{ once: true }}
                transition={{ delay: bounty.delay, duration: 0.8 }}
                whileHover={{ 
                  y: -15,
                  rotateY: 5,
                  scale: 1.02,
                  transition: { type: "spring" as const, stiffness: 300 }
                }}
                style={{ transformStyle: "preserve-3d" }}
              >
                <Link
                  to={`/bounty/${bounty.id}`}
                  className="group block bg-white dark:bg-gray-800 p-8 rounded-3xl border border-gray-200 dark:border-gray-700 hover:border-blue-300 dark:hover:border-blue-600 hover:shadow-2xl transition-all duration-500 relative overflow-hidden"
                >
                  {/* Animated background gradient */}
                  <motion.div
                    className="absolute inset-0 bg-gradient-to-br from-blue-50/50 to-purple-50/50 dark:from-blue-950/20 dark:to-purple-950/20 opacity-0 group-hover:opacity-100 transition-opacity duration-500"
                    animate={{
                      backgroundPosition: ["0% 0%", "100% 100%", "0% 0%"],
                    }}
                transition={{
                  duration: 8,
                  repeat: Infinity,
                  ease: "linear" as const
                }}
                    style={{
                      backgroundSize: "200% 200%"
                    }}
                  />
                  
                  <div className="relative">
                    <div className="flex items-start justify-between mb-6">
                      <motion.h3 
                        className="font-bold text-xl text-gray-900 dark:text-white group-hover:text-transparent group-hover:bg-clip-text group-hover:bg-gradient-to-r group-hover:from-blue-600 group-hover:to-purple-600 transition-all duration-300"
                        whileHover={{ scale: 1.05 }}
                      >
                        {bounty.title}
                      </motion.h3>
                      <motion.span 
                        className={`px-3 py-1 rounded-full text-xs font-bold ${
                          bounty.difficulty === 'Easy' ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400' :
                          bounty.difficulty === 'Medium' ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400' :
                          'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400'
                        } shadow-sm`}
                        whileHover={{ scale: 1.1, rotate: 5 }}
                        whileTap={{ scale: 0.95 }}
                      >
                        {bounty.difficulty}
                      </motion.span>
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <motion.div 
                        className="text-3xl font-black text-transparent bg-clip-text bg-gradient-to-r from-green-600 to-emerald-600"
                        whileHover={{ scale: 1.1 }}
                        animate={{
                          backgroundPosition: ["0% 50%", "100% 50%", "0% 50%"],
                        }}
                        transition={{
                          duration: 3,
                          repeat: Infinity,
                          ease: "linear" as const
                        }}
                        style={{
                          backgroundSize: "200% 200%"
                        }}
                      >
                        {bounty.reward} STRK
                      </motion.div>
                      <motion.div 
                        className="text-sm text-gray-500 font-semibold"
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
                  </div>
                  
                  {/* Hover effect particles */}
                  <motion.div
                    className="absolute top-2 right-2 w-1 h-1 bg-blue-400 rounded-full opacity-0 group-hover:opacity-100"
                    animate={{
                      scale: [0, 1, 0],
                      y: [0, -20, -40]
                    }}
                    transition={{
                      duration: 2,
                      repeat: Infinity,
                      delay: 0.5
                    }}
                  />
                  <motion.div
                    className="absolute bottom-2 left-2 w-1 h-1 bg-purple-400 rounded-full opacity-0 group-hover:opacity-100"
                    animate={{
                      scale: [0, 1, 0],
                      y: [0, 20, 40]
                    }}
                    transition={{
                      duration: 2,
                      repeat: Infinity,
                      delay: 1
                    }}
                  />
                </Link>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 relative overflow-hidden">
        <motion.div
          className="absolute inset-0"
          animate={{
            background: [
              "linear-gradient(45deg, rgba(59, 130, 246, 0.9), rgba(147, 51, 234, 0.9), rgba(236, 72, 153, 0.9))",
              "linear-gradient(45deg, rgba(147, 51, 234, 0.9), rgba(236, 72, 153, 0.9), rgba(59, 130, 246, 0.9))",
              "linear-gradient(45deg, rgba(236, 72, 153, 0.9), rgba(59, 130, 246, 0.9), rgba(147, 51, 234, 0.9))",
              "linear-gradient(45deg, rgba(59, 130, 246, 0.9), rgba(147, 51, 234, 0.9), rgba(236, 72, 153, 0.9))"
            ]
          }}
          transition={{ duration: 8, repeat: Infinity }}
        />
        
        {/* Floating elements */}
        <motion.div
          className="absolute top-10 left-10 w-20 h-20 border border-white/20 rounded-full"
          animate={{
            rotate: 360,
            scale: [1, 1.2, 1]
          }}
          transition={{
            rotate: { duration: 20, repeat: Infinity, ease: "linear" as const },
            scale: { duration: 4, repeat: Infinity }
          }}
        />
        <motion.div
          className="absolute bottom-10 right-10 w-16 h-16 border border-white/20 rounded-full"
          animate={{
            rotate: -360,
            y: [-10, 10, -10]
          }}
          transition={{
            rotate: { duration: 15, repeat: Infinity, ease: "linear" as const },
            y: { duration: 6, repeat: Infinity }
          }}
        />
        
        <div className="relative max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <motion.h2 
            className="text-5xl md:text-6xl font-black text-white mb-8"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            whileHover={{ scale: 1.02 }}
          >
            Ready to start 
            <motion.span
              animate={{
                textShadow: [
                  "0 0 20px rgba(255,255,255,0.5)",
                  "0 0 40px rgba(255,255,255,0.8)",
                  "0 0 20px rgba(255,255,255,0.5)"
                ]
              }}
              transition={{ duration: 2, repeat: Infinity }}
            > analyzing?</motion.span>
          </motion.h2>
          <motion.p 
            className="text-xl text-blue-100 mb-12 font-medium"
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ delay: 0.3 }}
          >
            Join thousands of analysts exploring Starknet data and earning rewards.
          </motion.p>
          <motion.div 
            className="flex flex-col sm:flex-row items-center justify-center gap-6"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.5 }}
          >
            <motion.div
              whileHover={{ 
                scale: 1.05,
                boxShadow: "0 25px 50px -12px rgba(255, 255, 255, 0.3)"
              }}
              whileTap={{ scale: 0.95 }}
            >
              <Link
                to="/signup"
                className="group w-full sm:w-auto inline-flex items-center justify-center gap-3 bg-white text-blue-600 hover:bg-blue-50 px-8 py-4 rounded-2xl font-bold text-lg shadow-xl hover:shadow-2xl transition-all duration-300"
              >
                <motion.div
                  animate={{ rotate: [0, 360] }}
                  transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                >
                  <Star className="w-6 h-6" />
                </motion.div>
                Get Started Free
                <motion.div
                  className="group-hover:translate-x-1 transition-transform duration-200"
                >
                  <ArrowRight className="w-5 h-5" />
                </motion.div>
              </Link>
            </motion.div>
            <motion.div
              whileHover={{ 
                scale: 1.05,
                boxShadow: "0 25px 50px -12px rgba(255, 255, 255, 0.2)"
              }}
              whileTap={{ scale: 0.95 }}
            >
              <Link
                to="/query"
                className="group w-full sm:w-auto inline-flex items-center justify-center gap-3 bg-white/10 hover:bg-white/20 text-white px-8 py-4 rounded-2xl font-bold text-lg border border-white/20 backdrop-blur-sm transition-all duration-300"
              >
                <motion.div
                  animate={{ 
                    scale: [1, 1.2, 1],
                    rotate: [0, 5, -5, 0]
                  }}
                  transition={{ duration: 3, repeat: Infinity }}
                >
                  <Database className="w-6 h-6" />
                </motion.div>
                Try Query Editor
              </Link>
            </motion.div>
          </motion.div>
        </div>
      </section>
    </div>
  );
};

export default LandingPage;
