import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import Navbar from './components/Navbar';
import LandingPage from './pages/LandingPage';
import Portfolio from './pages/Portfolio';
import QueryEditor from './pages/QueryEditor';
import BountyDetail from './pages/BountyDetail';
import CreateBounty from './pages/CreateBounty';
import Profile from './pages/Profile';
import Premium from './pages/Premium';
import { AuthProvider } from './contexts/AuthContext';

function App() {
  return (
    <AuthProvider>
      <Router>
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
          <Navbar />
          <main>
            <Routes>
              <Route path="/" element={<LandingPage />} />
              <Route path="/portfolio" element={<Portfolio />} />
              <Route path="/query" element={<QueryEditor />} />
              <Route path="/bounty/:id" element={<BountyDetail />} />
              <Route path="/create-bounty" element={<CreateBounty />} />
              <Route path="/profile" element={<Profile />} />
              <Route path="/premium" element={<Premium />} />
            </Routes>
          </main>
          <Toaster position="top-right" />
        </div>
      </Router>
    </AuthProvider>
  );
}

export default App;