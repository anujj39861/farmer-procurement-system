import React from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import Navbar from './components/Navbar';
import LoginPage from './pages/auth/LoginPage';
import FarmerPortal from './pages/farmer/FarmerPortal';
import CentreOperatorPortal from './pages/centre/CentreOperatorPortal';
import SupervisorPortal from './pages/supervisor/SupervisorPortal';
import AdminPortal from './pages/admin/AdminPortal';

function MainContent() {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen bg-emerald-950 flex items-center justify-center text-emerald-200 font-bold text-sm">
        Authenticating session...
      </div>
    );
  }

  if (!user) {
    return <LoginPage />;
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <Navbar />
      <main className="flex-1 pb-12">
        {user.role === 'farmer' && <FarmerPortal />}
        {(user.role === 'operator' || user.role === 'quality') && <CentreOperatorPortal />}
        {user.role === 'supervisor' && <SupervisorPortal />}
        {user.role === 'admin' && <AdminPortal />}
      </main>
      <footer className="bg-white border-t border-gray-200 py-4 text-center text-xs text-gray-500">
        Farmer Procurement Issue Resolution System • Authenticated User: {user.name} ({user.role})
      </footer>
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <MainContent />
    </AuthProvider>
  );
}
