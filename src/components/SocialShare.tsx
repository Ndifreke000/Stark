import React from 'react';
import { Twitter, Linkedin, Share2 } from 'lucide-react';

interface SocialShareProps {
  title: string;
  url: string;
}

const SocialShare: React.FC<SocialShareProps> = ({ title, url }) => {
  const fullUrl = `${window.location.origin}${url}`;
  
  const shareOnTwitter = () => {
    const text = `Check out this bounty: ${title}`;
    const twitterUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(fullUrl)}`;
    window.open(twitterUrl, '_blank');
  };

  const shareOnLinkedIn = () => {
    const linkedInUrl = `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(fullUrl)}`;
    window.open(linkedInUrl, '_blank');
  };

  const copyLink = async () => {
    try {
      await navigator.clipboard.writeText(fullUrl);
      // You could add a toast notification here
    } catch (err) {
      console.error('Failed to copy link:', err);
    }
  };

  return (
    <div className="flex items-center space-x-2">
      <button
        onClick={shareOnTwitter}
        className="p-2 text-gray-400 hover:text-blue-400 transition-colors"
        title="Share on Twitter"
      >
        <Twitter className="h-4 w-4" />
      </button>
      <button
        onClick={shareOnLinkedIn}
        className="p-2 text-gray-400 hover:text-blue-600 transition-colors"
        title="Share on LinkedIn"
      >
        <Linkedin className="h-4 w-4" />
      </button>
      <button
        onClick={copyLink}
        className="p-2 text-gray-400 hover:text-gray-600 transition-colors"
        title="Copy link"
      >
        <Share2 className="h-4 w-4" />
      </button>
    </div>
  );
};

export default SocialShare;