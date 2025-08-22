import React, { useState } from 'react';
import { Camera, Mail, User, Wallet } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import AnimatedCard from '../components/ui/AnimatedCard';
import AnimatedButton from '../components/ui/AnimatedButton';
import AnimatedInput from '../components/ui/AnimatedInput';

const Profile = () => {
  const { user, updateProfile } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    name: user?.name || '',
    email: user?.email || '',
    avatar: user?.avatar || ''
  });

  if (!user) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 text-center">
        <h1 className="text-2xl font-bold">Please connect your wallet to view your profile</h1>
      </div>
    );
  }

  const handleSave = () => {
    updateProfile(formData);
    setIsEditing(false);
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <header className="bg-white dark:bg-gray-800/50 border-b border-gray-200 dark:border-gray-700/50">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex justify-between items-center">
            <h1 className="text-3xl font-bold tracking-tight">Profile Settings</h1>
            {!isEditing ? (
              <AnimatedButton onClick={() => setIsEditing(true)}>Edit Profile</AnimatedButton>
            ) : (
              <div className="flex space-x-2">
                <AnimatedButton variant="secondary" onClick={() => setIsEditing(false)}>Cancel</AnimatedButton>
                <AnimatedButton onClick={handleSave}>Save Changes</AnimatedButton>
              </div>
            )}
          </div>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <AnimatedCard>
          <div className="p-6 md:p-8">
            <div className="flex flex-col md:flex-row items-start space-y-6 md:space-y-0 md:space-x-8">
              <div className="flex-shrink-0">
                <div className="relative">
                  <div className="w-24 h-24 bg-blue-600 rounded-full flex items-center justify-center text-white text-3xl font-bold">
                    {formData.name ? formData.name.charAt(0).toUpperCase() : user.address ? user.address.slice(2, 4).toUpperCase() : 'A'}
                  </div>
                  {isEditing && (
                    <label className="absolute bottom-0 right-0 bg-gray-700 text-white p-2 rounded-full cursor-pointer hover:bg-gray-600">
                      <Camera className="h-4 w-4" />
                      <input type="file" className="hidden" />
                    </label>
                  )}
                </div>
              </div>
              <div className="flex-1 w-full space-y-6">
                <AnimatedInput
                  label="Display Name"
                  icon={User}
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  disabled={!isEditing}
                />
                <AnimatedInput
                  label="Email Address"
                  icon={Mail}
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  disabled={!isEditing}
                />
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Wallet Address</label>
                  <div className="flex items-center p-3 bg-gray-100 dark:bg-gray-800 rounded-lg">
                    <Wallet className="h-5 w-5 text-gray-400 mr-3" />
                    <span className="font-mono text-sm text-gray-500">{user.address}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </AnimatedCard>
      </main>
    </div>
  );
};

export default Profile;
