import React from 'react';
import { useAuth } from '../context/AuthContext';
import { Sprout, LogOut, Wheat, Settings, Search, Shield, UserCog } from 'lucide-react';

/* ───── Role-based Navbar Themes ───── */
const NAV_THEMES = {
  farmer: {
    bg: 'bg-emerald-950',
    border: 'border-emerald-800',
    badge: 'bg-emerald-700 text-emerald-200 border-emerald-600',
    subtitle: 'text-emerald-300',
    iconBg: 'bg-emerald-500',
    profileBg: 'bg-emerald-800/40 border-emerald-700',
    avatar: 'bg-emerald-600',
    nameColor: 'text-emerald-100',
    roleColor: 'text-emerald-300',
    logoutHover: 'hover:text-red-400 hover:bg-emerald-800/80 text-emerald-300',
    icon: Wheat,
    roleLabel: 'Farmer Portal',
    tagline: 'Token Booking • Queue Tracking • Issue Desk',
  },
  operator: {
    bg: 'bg-blue-950',
    border: 'border-blue-800',
    badge: 'bg-blue-700 text-blue-200 border-blue-600',
    subtitle: 'text-blue-300',
    iconBg: 'bg-blue-500',
    profileBg: 'bg-blue-800/40 border-blue-700',
    avatar: 'bg-blue-600',
    nameColor: 'text-blue-100',
    roleColor: 'text-blue-300',
    logoutHover: 'hover:text-red-400 hover:bg-blue-800/80 text-blue-300',
    icon: Settings,
    roleLabel: 'Operator Panel',
    tagline: 'Weighing • Quality Check • Procurement',
  },
  quality: {
    bg: 'bg-amber-950',
    border: 'border-amber-800',
    badge: 'bg-amber-700 text-amber-200 border-amber-600',
    subtitle: 'text-amber-300',
    iconBg: 'bg-amber-500',
    profileBg: 'bg-amber-800/40 border-amber-700',
    avatar: 'bg-amber-600',
    nameColor: 'text-amber-100',
    roleColor: 'text-amber-300',
    logoutHover: 'hover:text-red-400 hover:bg-amber-800/80 text-amber-300',
    icon: Search,
    roleLabel: 'Quality Inspector',
    tagline: 'Crop Grading • Inspection Reports',
  },
  supervisor: {
    bg: 'bg-orange-950',
    border: 'border-orange-800',
    badge: 'bg-orange-700 text-orange-200 border-orange-600',
    subtitle: 'text-orange-300',
    iconBg: 'bg-orange-500',
    profileBg: 'bg-orange-800/40 border-orange-700',
    avatar: 'bg-orange-600',
    nameColor: 'text-orange-100',
    roleColor: 'text-orange-300',
    logoutHover: 'hover:text-red-400 hover:bg-orange-800/80 text-orange-300',
    icon: Shield,
    roleLabel: 'Supervisor Panel',
    tagline: 'Correction Approval • Fraud Detection • Audit',
  },
  admin: {
    bg: 'bg-violet-950',
    border: 'border-violet-800',
    badge: 'bg-violet-700 text-violet-200 border-violet-600',
    subtitle: 'text-violet-300',
    iconBg: 'bg-violet-500',
    profileBg: 'bg-violet-800/40 border-violet-700',
    avatar: 'bg-violet-600',
    nameColor: 'text-violet-100',
    roleColor: 'text-violet-300',
    logoutHover: 'hover:text-red-400 hover:bg-violet-800/80 text-violet-300',
    icon: UserCog,
    roleLabel: 'Admin Dashboard',
    tagline: 'System Analytics • Centre Management • Users',
  },
};

export default function Navbar() {
  const { user, logout } = useAuth();

  const theme = NAV_THEMES[user?.role] || NAV_THEMES.farmer;
  const RoleIcon = theme.icon;

  return (
    <header className={`${theme.bg} text-white shadow-md border-b ${theme.border} sticky top-0 z-50`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3 flex items-center justify-between">
        
        {/* Brand Logo & Role Title */}
        <div className="flex items-center space-x-3">
          <div className={`p-2 ${theme.iconBg} rounded-lg font-extrabold flex items-center justify-center shadow`}>
            <RoleIcon className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-lg font-bold tracking-tight text-white flex items-center gap-2">
              {theme.roleLabel}
              <span className={`${theme.badge} text-xs px-2 py-0.5 rounded-full border font-medium`}>
                Active
              </span>
            </h1>
            <p className={`text-xs ${theme.subtitle}`}>
              {theme.tagline}
            </p>
          </div>
        </div>

        {/* User Profile & Logout */}
        <div className="flex items-center space-x-3">
          <div className={`flex items-center space-x-3 ${theme.profileBg} px-3 py-1.5 rounded-xl border`}>
            <div className={`w-8 h-8 rounded-full ${theme.avatar} flex items-center justify-center font-bold text-white text-xs shadow`}>
              {user?.name ? user.name.charAt(0) : 'U'}
            </div>
            <div className="text-left text-xs">
              <div className={`font-bold ${theme.nameColor}`}>{user?.name || 'User'}</div>
              <div className={`${theme.roleColor} text-[10px] uppercase font-mono font-semibold`}>{user?.role}</div>
            </div>

            <button
              onClick={logout}
              title="Logout"
              className={`p-1.5 ${theme.logoutHover} rounded-lg transition`}
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>

      </div>
    </header>
  );
}
