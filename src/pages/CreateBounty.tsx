import React, { useState } from 'react';
import { DollarSign, Info, AlertCircle, Coins, Trophy, Sparkles, Target, Zap, Star } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { motion, AnimatePresence } from 'framer-motion';
import AnimatedCard from '../components/ui/AnimatedCard';
import AnimatedButton from '../components/ui/AnimatedButton';
import AnimatedInput from '../components/ui/AnimatedInput';
import { AutoSwapper } from '../components/Swap/AutoSwapper';

const CreateBounty = () => {
  const { user, provider, account } = useAuth();
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    requirements: '',
    reward: '',
    currency: 'STRK',
    deadline: '',
    difficulty: 'Medium',
    tags: '',
  });
  const [isCreating, setIsCreating] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <AnimatedCard className="p-8 text-center">
          <Trophy className="w-12 h-12 mx-auto mb-4 text-blue-600" />
          <h1 className="text-2xl font-bold mb-2">Connect Your Wallet</h1>
          <p className="text-gray-600 dark:text-gray-300 mb-6">
            Please connect your wallet to create a bounty.
          </p>
          <AnimatedButton variant="primary" size="lg">
            Connect Wallet
          </AnimatedButton>
        </AnimatedCard>
      </div>
    );
  }

  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    if (!formData.title.trim()) newErrors.title = 'Title is required';
    if (!formData.description.trim()) newErrors.description = 'Description is required';
    if (!formData.reward || parseFloat(formData.reward) <= 0) newErrors.reward = 'Valid reward is required';
    if (!formData.deadline) newErrors.deadline = 'Deadline is required';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;
    setIsCreating(true);
    // Mock API call
    setTimeout(() => {
      setIsCreating(false);
      alert('Bounty created successfully!');
    }, 1500);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <header className="bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 border-b border-gray-200 dark:border-gray-700/50">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 text-center">
          <Trophy className="w-12 h-12 mx-auto mb-4 text-blue-600" />
          <h1 className="text-4xl font-bold tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-purple-600">Create a New Bounty</h1>
          <p className="mt-3 text-lg text-gray-600 dark:text-gray-400">
            Incentivize the community to analyze Starknet data for you.
          </p>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <form onSubmit={handleSubmit} className="space-y-8">
          <AnimatedCard>
            <div className="p-8 space-y-6">
              <h3 className="text-xl font-semibold">Bounty Details</h3>
              <AnimatedInput
                label="Bounty Title"
                name="title"
                value={formData.title}
                onChange={handleInputChange}
                error={errors.title}
                placeholder="e.g., Analyze DeFi TVL trends"
                required
              />
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Description</label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  rows={4}
                  className="w-full p-2 border rounded-lg bg-gray-50 dark:bg-gray-700"
                  placeholder="Describe the bounty in detail..."
                />
              </div>
            </div>
          </AnimatedCard>
          <AnimatedCard>
            <div className="p-8 space-y-6">
              <h3 className="text-xl font-semibold">Reward & Deadline</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <AnimatedInput
                  label="Reward Amount"
                  name="reward"
                  type="number"
                  value={formData.reward}
                  onChange={handleInputChange}
                  error={errors.reward}
                  placeholder="500"
                  required
                />
                <AnimatedInput
                  label="Submission Deadline"
                  name="deadline"
                  type="date"
                  value={formData.deadline}
                  onChange={handleInputChange}
                  error={errors.deadline}
                  required
                />
              </div>
            </div>
          </AnimatedCard>
          <div className="flex justify-end">
            <AnimatedButton type="submit" size="lg" loading={isCreating} disabled={isCreating}>
              Create Bounty
            </AnimatedButton>
          </div>
        </form>
      </main>
    </div>
  );
};

export default CreateBounty;
