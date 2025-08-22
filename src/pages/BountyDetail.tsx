import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Calendar, Users, DollarSign, Clock, Code, FileText, Send, ExternalLink } from 'lucide-react';
import SocialShare from '../components/SocialShare';
import { getDashboards } from '../services/dashboardStore';
import { useAuth } from '../contexts/AuthContext';
import { AutoSwapper } from '../components/Swap/AutoSwapper';
import AnimatedButton from '../components/ui/AnimatedButton';
import AnimatedCard from '../components/ui/AnimatedCard';

const BountyDetail = () => {
  const { id } = useParams();
  const { user, provider, account } = useAuth();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showWithdrawModal, setShowWithdrawModal] = useState(false);
  const [showSubmissionModal, setShowSubmissionModal] = useState(false);
  const [submissionMode, setSubmissionMode] = useState<'sql' | 'dashboard' | 'both'>('sql');
  const [submission, setSubmission] = useState({
    query: '-- Your SQL analysis query...',
    insights: '',
    methodology: '',
    dashboardLink: '',
    selectedDashboardId: ''
  });
  const [myDashboards, setMyDashboards] = useState<any[]>([]);

  useEffect(() => {
    if (showSubmissionModal) {
      setMyDashboards(getDashboards());
    }
  }, [showSubmissionModal]);

  const bounty = {
    id: '1',
    title: 'Analyze DeFi TVL Trends on Starknet',
    description: 'Create a comprehensive analysis of Total Value Locked across top DeFi protocols on Starknet over the last 6 months.',
    requirements: `1. SQL queries analyzing TVL data...\n2. Time-series analysis...\n3. Protocol comparison...`,
    reward: 500,
    currency: 'STRK',
    status: 'live' as const,
    submissions: 12,
    deadline: '2024-02-15',
    tags: ['DeFi', 'TVL', 'Analytics'],
    difficulty: 'Medium' as const,
    creator: {
      name: 'StarkWare',
      address: '0x1234...5678',
    },
    createdAt: '2024-01-10',
    contractAddress: '0xa1b2c3d4e5f6789012345678901234567890abcd'
  };

  const timeLeft = () => {
    const deadline = new Date(bounty.deadline);
    const now = new Date();
    const diff = deadline.getTime() - now.getTime();
    if (diff <= 0) return 'Expired';
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    return `${days} days remaining`;
  };

  const handleSubmission = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    // Mock submission
    setTimeout(() => {
      setIsSubmitting(false);
      setShowSubmissionModal(false);
      alert('Submission successful!');
    }, 1200);
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <header className="bg-white dark:bg-gray-800/50 border-b border-gray-200 dark:border-gray-700/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold tracking-tight">{bounty.title}</h1>
              <div className="flex items-center space-x-4 mt-2 text-sm text-gray-500 dark:text-gray-400">
                <span>Posted by {bounty.creator.name}</span>
                <span>&bull;</span>
                <span>{new Date(bounty.createdAt).toLocaleDateString()}</span>
              </div>
            </div>
            <AnimatedButton onClick={() => setShowSubmissionModal(true)} size="lg">
              Submit Solution
            </AnimatedButton>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-8">
            <AnimatedCard>
              <div className="p-6">
                <h2 className="text-xl font-semibold mb-4">Bounty Details</h2>
                <p className="text-gray-600 dark:text-gray-300">{bounty.description}</p>
              </div>
            </AnimatedCard>
            <AnimatedCard>
              <div className="p-6">
                <h2 className="text-xl font-semibold mb-4">Requirements</h2>
                <pre className="whitespace-pre-wrap text-sm text-gray-600 dark:text-gray-300">{bounty.requirements}</pre>
              </div>
            </AnimatedCard>
          </div>
          <div className="space-y-8">
            <AnimatedCard>
              <div className="p-6">
                <h3 className="text-xl font-semibold mb-4">Stats</h3>
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600 dark:text-gray-400">Reward</span>
                    <span className="font-bold text-green-500 text-lg">{bounty.reward} {bounty.currency}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600 dark:text-gray-400">Submissions</span>
                    <span className="font-semibold">{bounty.submissions}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600 dark:text-gray-400">Deadline</span>
                    <span className="font-semibold">{timeLeft()}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600 dark:text-gray-400">Difficulty</span>
                    <span className="font-semibold">{bounty.difficulty}</span>
                  </div>
                </div>
              </div>
            </AnimatedCard>
            <AnimatedCard>
              <div className="p-6">
                <h3 className="text-xl font-semibold mb-4">Contract</h3>
                <div className="flex items-center justify-between bg-gray-100 dark:bg-gray-800 p-3 rounded-lg">
                  <span className="font-mono text-sm truncate">{bounty.contractAddress}</span>
                  <a href={`https://voyager.online/contract/${bounty.contractAddress}`} target="_blank" rel="noopener noreferrer">
                    <ExternalLink className="h-4 w-4 text-blue-500" />
                  </a>
                </div>
              </div>
            </AnimatedCard>
          </div>
        </div>
      </main>

      {showSubmissionModal && (
        <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg max-w-2xl w-full">
            <div className="p-6 border-b border-gray-200 dark:border-gray-700">
              <h2 className="text-xl font-semibold">Submit Your Solution</h2>
            </div>
            <form onSubmit={handleSubmission} className="p-6 space-y-4">
              <textarea
                value={submission.query}
                onChange={(e) => setSubmission({ ...submission, query: e.target.value })}
                required
                rows={8}
                className="w-full p-2 border rounded-lg font-mono text-sm"
                placeholder="Your SQL query..."
              />
              <textarea
                value={submission.insights}
                onChange={(e) => setSubmission({ ...submission, insights: e.target.value })}
                required
                rows={4}
                className="w-full p-2 border rounded-lg text-sm"
                placeholder="Key insights..."
              />
              <div className="flex justify-end space-x-3">
                <AnimatedButton type="button" variant="secondary" onClick={() => setShowSubmissionModal(false)}>
                  Cancel
                </AnimatedButton>
                <AnimatedButton type="submit" disabled={isSubmitting} loading={isSubmitting}>
                  Submit
                </AnimatedButton>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default BountyDetail;
