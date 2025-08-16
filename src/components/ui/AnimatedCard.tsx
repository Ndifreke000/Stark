import React from 'react';
import { motion } from 'framer-motion';

interface AnimatedCardProps {
  children: React.ReactNode;
  className?: string;
  hover?: boolean;
  delay?: number;
  direction?: 'up' | 'down' | 'left' | 'right';
  rotation?: boolean;
  glow?: boolean;
  gradient?: boolean;
  onClick?: () => void;
}

const AnimatedCard: React.FC<AnimatedCardProps> = ({
  children,
  className = '',
  hover = true,
  delay = 0,
  direction = 'up',
  rotation = false,
  glow = false,
  gradient = false,
  onClick
}) => {
  const directionVariants = {
    up: { y: 50, opacity: 0 },
    down: { y: -50, opacity: 0 },
    left: { x: 50, opacity: 0 },
    right: { x: -50, opacity: 0 }
  };

  const baseClasses = `bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 shadow-lg transition-all duration-300 ${
    onClick ? 'cursor-pointer' : ''
  } ${gradient ? 'bg-gradient-to-br from-white to-gray-50 dark:from-gray-800 dark:to-gray-900' : ''}`;

  return (
    <motion.div
      className={`${baseClasses} ${className}`}
      initial={directionVariants[direction]}
      animate={{ x: 0, y: 0, opacity: 1 }}
      transition={{ 
        delay, 
        duration: 0.6, 
        type: "spring", 
        stiffness: 100, 
        damping: 10 
      }}
      whileHover={hover ? {
        y: -8,
        scale: 1.02,
        boxShadow: glow 
          ? "0 25px 50px -12px rgba(59, 130, 246, 0.25), 0 0 0 1px rgba(59, 130, 246, 0.1)"
          : "0 25px 50px -12px rgba(0, 0, 0, 0.25)",
        rotateY: rotation ? 5 : 0,
        rotateX: rotation ? 5 : 0,
        transition: { type: "spring", stiffness: 300, damping: 20 }
      } : {}}
      whileTap={onClick ? { scale: 0.98 } : {}}
      onClick={onClick}
      style={{ transformStyle: "preserve-3d" }}
    >
      {/* Animated border gradient */}
      {glow && (
        <motion.div
          className="absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100"
          animate={{
            background: [
              "linear-gradient(0deg, rgba(59, 130, 246, 0.1), rgba(147, 51, 234, 0.1))",
              "linear-gradient(90deg, rgba(59, 130, 246, 0.1), rgba(147, 51, 234, 0.1))",
              "linear-gradient(180deg, rgba(59, 130, 246, 0.1), rgba(147, 51, 234, 0.1))",
              "linear-gradient(270deg, rgba(59, 130, 246, 0.1), rgba(147, 51, 234, 0.1))",
              "linear-gradient(360deg, rgba(59, 130, 246, 0.1), rgba(147, 51, 234, 0.1))"
            ]
          }}
          transition={{ duration: 3, repeat: Infinity }}
        />
      )}
      
      {/* Content */}
      <div className="relative z-10">
        {children}
      </div>
      
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
  );
};

export default AnimatedCard;