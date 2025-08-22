import React from 'react';
import { motion } from 'framer-motion';

interface AnimatedCardProps {
  children: React.ReactNode;
  className?: string;
  hover?: boolean;
  delay?: number;
  direction?: 'up' | 'down' | 'left' | 'right';
  onClick?: () => void;
}

const AnimatedCard: React.FC<AnimatedCardProps> = ({
  children,
  className = '',
  hover = true,
  delay = 0,
  direction = 'up',
  onClick
}) => {
  const directionVariants = {
    up: { y: 50, opacity: 0 },
    down: { y: -50, opacity: 0 },
    left: { x: 50, opacity: 0 },
    right: { x: -50, opacity: 0 }
  };

  const baseClasses = `bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 shadow-sm transition-all duration-300 ${
    onClick ? 'cursor-pointer' : ''
  }`;

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
      whileHover={hover ? { y: -5, boxShadow: "0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)" } : {}}
      whileTap={onClick ? { scale: 0.98 } : {}}
      onClick={onClick}
    >
      {children}
    </motion.div>
  );
};

export default AnimatedCard;
