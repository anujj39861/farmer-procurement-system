import React from 'react';
import { useAuth, DEMO_PRESETS } from '../context/AuthContext';
import { Sprout, LogOut, UserCheck } from 'lucide-react';

export default function Navbar() {
  const { user, login, logout } = useAuth();

  return (
    <header className="bg-emerald-950 text-white shadow-md border-b border-emerald-800 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3 flex items-center justify-between">
        
        {/* Brand Logo & Title */}
        <div className="flex items-center space-x-3">
          <div className="p-2 bg-emerald-500 rounded-lg text-emerald-950 font-extrabold flex items-center justify-center shadow">
            <Sprout className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-lg font-bold tracking-tight text-emerald-100 flex items-center gap-2">
              Kisan Procurement System
              <span className="bg-emerald-700 text-emerald-200 text-xs px-2 py-0.5 rounded-full border border-emerald-600 font-medium">
                Authenticated
              </span>
            </h1>
            <p className="text-xs text-emerald-300">
              Delay Reduction • Anti-Fraud Workflow • AI/ML Engine
            </p>
          </div>
        </div>

        {/* User Info & Quick Demo Role Switcher Toolbar */}
        <div className="flex items-center space-x-4">
          
          {/* Quick Demo Switcher Toolbar */}
          <div className="hidden lg:flex items-center space-x-1 bg-emerald-900/80 p-1.5 rounded-xl border border-emerald-700/60 text-xs">
            <span className="text-emerald-400 font-semibold px-2 flex items-center gap-1">
              <UserCheck className="w-3.5 h-3.5" /> Switch Account:
            </span>
            {DEMO_PRESETS.map((preset) => (
              <button
                key={preset.role}
                onClick={() => login(preset.phone, preset.pass)}
                className={`px-2.5 py-1 rounded-lg transition font-medium capitalize text-[11px] ${
                  user?.role === preset.role
                    ? 'bg-emerald-500 text-emerald-950 font-bold shadow'
                    : 'text-emerald-300 hover:text-white hover:bg-emerald-800/60'
                }`}
              >
                {preset.label}
              </button>
            ))}
          </div>

          {/* Active Profile Info & Logout */}
          <div className="flex items-center space-x-3 bg-emerald-800/40 px-3 py-1.5 rounded-xl border border-emerald-700">
            <div className="w-8 h-8 rounded-full bg-emerald-600 flex items-center justify-center font-bold text-white text-xs shadow">
              {user?.name ? user.name.charAt(0) : 'U'}
            </div>
            <div className="text-left text-xs">
              <div className="font-bold text-emerald-100">{user?.name || 'Authenticated User'}</div>
              <div className="text-emerald-300 text-[10px] uppercase font-mono font-semibold">{user?.role}</div>
            </div>

            <button
              onClick={logout}
              title="Logout"
              className="p-1.5 text-emerald-300 hover:text-red-400 hover:bg-emerald-800/80 rounded-lg transition"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>

        </div>

      </div>
    </header>
  );
}
