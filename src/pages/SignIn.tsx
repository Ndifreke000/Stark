import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Mail, Lock, Eye, EyeOff, Wallet, AlertCircle, Sparkles, Zap, Star, Database } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import toast from 'react-hot-toast';
import { motion, AnimatePresence } from 'framer-motion';

const signInSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
});

type SignInForm = z.infer<typeof signInSchema>;

const SignIn = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const { signInWithEmail, connectWallet, isConnecting } = useAuth();
  const navigate = useNavigate();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<SignInForm>({
    resolver: zodResolver(signInSchema),
  });

  const onSubmit = async (data: SignInForm) => {
    setIsLoading(true);
    try {
      await signInWithEmail(data.email, data.password);
      toast.success('Successfully signed in!');
      navigate('/');
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to sign in');
    } finally {
      setIsLoading(false);
    }
  };

  const handleWalletConnect = async () => {
    try {
      await connectWallet();
      toast.success('Wallet connected successfully!');
      navigate('/');
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to connect wallet');
    }
  };

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
        type: "spring",
        stiffness: 100,
        damping: 10
      }
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50 dark:from-gray-900 dark:via-gray-900 dark:to-blue-950 flex flex-col justify-center py-12 sm:px-6 lg:px-8 relative overflow-hidden font-['Inter',sans-serif]">
      {/* Animated Background Elements */}
      <motion.div 
        className="absolute top-20 left-10 w-72 h-72 bg-blue-400/10 rounded-full blur-3xl"
        animate={{
          y: [-20, 20, -20],
          x: [-10, 10, -10],
          scale: [1, 1.1, 1]
        }}
        transition={{
          duration: 8,
          repeat: Infinity,
          ease: "easeInOut"
        }}
      />
      <motion.div 
        className="absolute bottom-20 right-10 w-96 h-96 bg-purple-400/10 rounded-full blur-3xl"
        animate={{
          y: [20, -20, 20],
          x: [10, -10, 10],
          scale: [1.1, 1, 1.1]
        }}
        transition={{
          duration: 10,
          repeat: Infinity,
          ease: "easeInOut"
        }}
      />
      <motion.div 
        className="absolute top-1/2 left-1/2 w-64 h-64 bg-green-400/5 rounded-full blur-3xl"
        animate={{
          rotate: [0, 360],
          scale: [1, 1.3, 1]
        }}
        transition={{
          rotate: { duration: 20, repeat: Infinity, ease: "linear" },
          scale: { duration: 6, repeat: Infinity }
        }}
      />

      <motion.div 
        className="sm:mx-auto sm:w-full sm:max-w-md relative z-10"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        <motion.div 
          className="flex justify-center mb-8"
          variants={itemVariants}
        >
          <motion.div 
            className="flex items-center space-x-3 group"
            whileHover={{ scale: 1.05 }}
          >
            <motion.div 
              className="h-12 w-12 bg-gradient-to-br from-blue-600 via-purple-600 to-pink-600 rounded-2xl flex items-center justify-center shadow-xl"
              whileHover={{ 
                rotate: 360,
                boxShadow: "0 25px 50px -12px rgba(59, 130, 246, 0.5)"
              }}
              transition={{ duration: 0.6 }}
            >
              <Database className="h-7 w-7 text-white" />
            </motion.div>
            <motion.span 
              className="text-3xl font-black bg-gradient-to-r from-gray-900 to-gray-700 dark:from-white dark:to-gray-300 bg-clip-text text-transparent"
              whileHover={{
                backgroundImage: "linear-gradient(45deg, #3B82F6, #8B5CF6, #EC4899)",
              }}
            >
              Starklytics
            </motion.span>
          </motion.div>
        </motion.div>

        <motion.h2 
          className="text-center text-4xl font-black text-gray-900 dark:text-white mb-4"
          variants={itemVariants}
        >
          Welcome back
        </motion.h2>
        <motion.p 
          className="text-center text-lg text-gray-600 dark:text-gray-400 mb-8"
          variants={itemVariants}
        >
          Sign in to continue your analytics journey
        </motion.p>
      </motion.div>

      <motion.div 
        className="mt-8 sm:mx-auto sm:w-full sm:max-w-md relative z-10"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        <motion.div 
          className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl py-10 px-8 shadow-2xl sm:rounded-3xl border border-gray-200/50 dark:border-gray-700/50"
          variants={itemVariants}
          whileHover={{ 
            boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.25)",
            scale: 1.01
          }}
          transition={{ duration: 0.3 }}
        >
          {/* Wallet Connect Section */}
          <motion.div 
            className="mb-8"
            variants={itemVariants}
          >
            <motion.button
              onClick={handleWalletConnect}
              disabled={isConnecting}
              className="w-full flex justify-center items-center px-6 py-4 border-2 border-gray-300 dark:border-gray-600 rounded-2xl shadow-sm bg-white dark:bg-gray-700 text-lg font-bold text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 relative overflow-hidden group"
              whileHover={{ 
                scale: 1.02,
                boxShadow: "0 20px 25px -5px rgba(0, 0, 0, 0.1)"
              }}
              whileTap={{ scale: 0.98 }}
            >
              <motion.div
                animate={isConnecting ? { rotate: 360 } : { rotate: [0, 5, -5, 0] }}
                transition={isConnecting ? { duration: 1, repeat: Infinity, ease: "linear" } : { duration: 2, repeat: Infinity }}
                className="mr-3"
              >
                <Wallet className="h-6 w-6" />
              </motion.div>
              {isConnecting ? 'Connecting...' : 'Connect with Wallet'}
              <motion.div
                className="absolute inset-0 bg-gradient-to-r from-blue-400/20 to-purple-400/20 opacity-0 group-hover:opacity-100"
                animate={{
                  x: ["-100%", "100%"],
                }}
                transition={{
                  duration: 1.5,
                  repeat: Infinity,
                  ease: "linear"
                }}
              />
            </motion.button>
            
            <motion.div 
              className="mt-6 relative"
              variants={itemVariants}
            >
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-300 dark:border-gray-600" />
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-4 bg-white dark:bg-gray-800 text-gray-500 font-semibold">Or continue with email</span>
              </div>
            </motion.div>
          </motion.div>

          {/* Email/Password Form */}
          <motion.form 
            className="space-y-6" 
            onSubmit={handleSubmit(onSubmit)}
            variants={containerVariants}
          >
            <motion.div variants={itemVariants}>
              <label htmlFor="email" className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">
                Email address
              </label>
              <div className="relative">
                <motion.div 
                  className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none"
                  animate={{ x: errors.email ? [0, -5, 5, 0] : 0 }}
                  transition={{ duration: 0.4 }}
                >
                  <Mail className={`h-5 w-5 ${errors.email ? 'text-red-400' : 'text-gray-400'}`} />
                </motion.div>
                <motion.input
                  {...register('email')}
                  type="email"
                  autoComplete="email"
                  className={`appearance-none block w-full pl-12 pr-4 py-4 border-2 rounded-2xl placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white text-lg font-medium transition-all duration-300 ${
                    errors.email 
                      ? 'border-red-300 dark:border-red-600 bg-red-50 dark:bg-red-950/20' 
                      : 'border-gray-300 dark:border-gray-600 hover:border-gray-400 dark:hover:border-gray-500'
                  }`}
                  placeholder="Enter your email"
                  whileFocus={{ scale: 1.01 }}
                />
              </div>
              <AnimatePresence>
                {errors.email && (
                  <motion.div 
                    className="mt-2 flex items-center text-sm text-red-600 font-medium"
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                  >
                    <motion.div
                      animate={{ rotate: [0, 10, -10, 0] }}
                      transition={{ duration: 0.5 }}
                    >
                      <AlertCircle className="h-4 w-4 mr-2" />
                    </motion.div>
                    {errors.email.message}
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>

            <motion.div variants={itemVariants}>
              <label htmlFor="password" className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">
                Password
              </label>
              <div className="relative">
                <motion.div 
                  className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none"
                  animate={{ x: errors.password ? [0, -5, 5, 0] : 0 }}
                  transition={{ duration: 0.4 }}
                >
                  <Lock className={`h-5 w-5 ${errors.password ? 'text-red-400' : 'text-gray-400'}`} />
                </motion.div>
                <motion.input
                  {...register('password')}
                  type={showPassword ? 'text' : 'password'}
                  autoComplete="current-password"
                  className={`appearance-none block w-full pl-12 pr-12 py-4 border-2 rounded-2xl placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white text-lg font-medium transition-all duration-300 ${
                    errors.password 
                      ? 'border-red-300 dark:border-red-600 bg-red-50 dark:bg-red-950/20' 
                      : 'border-gray-300 dark:border-gray-600 hover:border-gray-400 dark:hover:border-gray-500'
                  }`}
                  placeholder="Enter your password"
                  whileFocus={{ scale: 1.01 }}
                />
                <motion.button
                  type="button"
                  className="absolute inset-y-0 right-0 pr-4 flex items-center"
                  onClick={() => setShowPassword(!showPassword)}
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                >
                  <motion.div
                    animate={{ rotate: showPassword ? 180 : 0 }}
                    transition={{ duration: 0.3 }}
                  >
                    {showPassword ? (
                      <EyeOff className="h-5 w-5 text-gray-400 hover:text-gray-600" />
                    ) : (
                      <Eye className="h-5 w-5 text-gray-400 hover:text-gray-600" />
                    )}
                  </motion.div>
                </motion.button>
              </div>
              <AnimatePresence>
                {errors.password && (
                  <motion.div 
                    className="mt-2 flex items-center text-sm text-red-600 font-medium"
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                  >
                    <motion.div
                      animate={{ rotate: [0, 10, -10, 0] }}
                      transition={{ duration: 0.5 }}
                    >
                      <AlertCircle className="h-4 w-4 mr-2" />
                    </motion.div>
                    {errors.password.message}
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>

            <motion.div 
              className="flex items-center justify-between"
              variants={itemVariants}
            >
              <motion.div 
                className="flex items-center"
                whileHover={{ scale: 1.02 }}
              >
                <input
                  id="remember-me"
                  name="remember-me"
                  type="checkbox"
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <label htmlFor="remember-me" className="ml-2 block text-sm text-gray-900 dark:text-gray-300 font-medium">
                  Remember me
                </label>
              </motion.div>

              <motion.div 
                className="text-sm"
                whileHover={{ scale: 1.05 }}
              >
                <Link
                  to="/forgot-password"
                  className="font-bold text-blue-600 hover:text-blue-500 transition-colors duration-200"
                >
                  Forgot your password?
                </Link>
              </motion.div>
            </motion.div>

            <motion.div variants={itemVariants}>
              <motion.button
                type="submit"
                disabled={isLoading}
                className="w-full flex justify-center py-4 px-6 border border-transparent rounded-2xl shadow-lg text-lg font-bold text-white bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 relative overflow-hidden group"
                whileHover={{ 
                  scale: 1.02,
                  boxShadow: "0 25px 50px -12px rgba(59, 130, 246, 0.5)"
                }}
                whileTap={{ scale: 0.98 }}
              >
                <AnimatePresence mode="wait">
                  {isLoading ? (
                    <motion.div
                      key="loading"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      className="flex items-center"
                    >
                      <motion.div
                        animate={{ rotate: 360 }}
                        transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                        className="mr-2"
                      >
                        <Zap className="h-5 w-5" />
                      </motion.div>
                      Signing in...
                    </motion.div>
                  ) : (
                    <motion.div
                      key="signin"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      className="flex items-center"
                    >
                      <motion.div
                        animate={{ x: [0, 2, 0] }}
                        transition={{ duration: 2, repeat: Infinity }}
                        className="mr-2"
                      >
                        <Star className="h-5 w-5" />
                      </motion.div>
                      Sign in
                    </motion.div>
                  )}
                </AnimatePresence>
                <motion.div
                  className="absolute inset-0 bg-gradient-to-r from-blue-400 to-purple-400 opacity-0 group-hover:opacity-20"
                  animate={{
                    x: ["-100%", "100%"],
                  }}
                  transition={{
                    duration: 1.5,
                    repeat: Infinity,
                    ease: "linear"
                  }}
                />
              </motion.button>
            </motion.div>
          </motion.form>

          <motion.div 
            className="mt-8"
            variants={itemVariants}
          >
            <div className="text-center text-lg text-gray-600 dark:text-gray-400">
              Don't have an account?{' '}
              <motion.div
                className="inline-block"
                whileHover={{ scale: 1.05 }}
              >
                <Link
                  to="/signup"
                  className="font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 transition-all duration-200"
                >
                  Sign up here
                </Link>
              </motion.div>
            </div>
          </motion.div>
        </motion.div>
      </motion.div>

      {/* Floating particles */}
      <motion.div
        className="absolute top-1/4 left-1/4 w-2 h-2 bg-blue-400 rounded-full"
        animate={{
          y: [-20, -40, -20],
          x: [0, 10, 0],
          scale: [0, 1, 0],
          opacity: [0, 1, 0]
        }}
        transition={{
          duration: 4,
          repeat: Infinity,
          delay: 1
        }}
      />
      <motion.div
        className="absolute top-3/4 right-1/4 w-1 h-1 bg-purple-400 rounded-full"
        animate={{
          y: [20, 40, 20],
          x: [0, -10, 0],
          scale: [0, 1, 0],
          opacity: [0, 1, 0]
        }}
        transition={{
          duration: 3,
          repeat: Infinity,
          delay: 2
        }}
      />
      <motion.div
        className="absolute top-1/2 right-1/3 w-1.5 h-1.5 bg-green-400 rounded-full"
        animate={{
          y: [-15, 15, -15],
          x: [-5, 5, -5],
          scale: [0, 1, 0],
          opacity: [0, 0.8, 0]
        }}
        transition={{
          duration: 5,
          repeat: Infinity,
          delay: 0.5
        }}
      />
    </div>
  );
};

export default SignIn;