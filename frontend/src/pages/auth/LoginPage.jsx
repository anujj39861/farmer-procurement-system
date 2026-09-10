import React, { useState } from 'react';
import { useAuth, DEMO_PRESETS } from '../../context/AuthContext';
import {
  Sprout, Lock, Phone, User, ShieldCheck, ArrowRight, UserPlus, LogIn,
  Settings, Search, Wheat, Shield, UserCog
} from 'lucide-react';

/* ───────────── Role Theme Config ───────────── */
const ROLE_THEMES = {
  farmer: {
    key: 'farmer',
    label: 'Farmer',
    tabLabel: '🌾 Farmer',
    icon: Wheat,
    title: 'Kisan Login',
    subtitle: 'Apni fasal ka token book karein, queue track karein, issue raise karein',
    bg: 'from-emerald-950 via-teal-900 to-slate-950',
    panel: 'from-emerald-800 to-teal-950',
    panelBorder: 'border-emerald-700/60',
    accent: 'bg-emerald-500',
    accentText: 'text-emerald-950',
    titleColor: 'text-amber-300',
    subtitleColor: 'text-emerald-200',
    presetBg: 'bg-emerald-900/60 hover:bg-emerald-700/80 border-emerald-600/40',
    presetLabel: 'text-emerald-300',
    btnBg: 'bg-emerald-700 hover:bg-emerald-800',
    focusRing: 'focus:ring-emerald-500',
    tabActive: 'bg-emerald-600 text-white shadow-lg',
    tabInactive: 'bg-white/10 text-white/70 hover:bg-white/20',
    switchBtn: 'text-emerald-700 bg-emerald-50 border-emerald-200',
    iconBg: 'opacity-10',
  },
  operator: {
    key: 'operator',
    label: 'Operator',
    tabLabel: '⚙️ Operator',
    icon: Settings,
    title: 'Operator Login',
    subtitle: 'Scale weighing, quality inspection aur procurement panel',
    bg: 'from-blue-950 via-blue-900 to-slate-950',
    panel: 'from-blue-800 to-blue-950',
    panelBorder: 'border-blue-700/60',
    accent: 'bg-blue-500',
    accentText: 'text-blue-950',
    titleColor: 'text-sky-300',
    subtitleColor: 'text-blue-200',
    presetBg: 'bg-blue-900/60 hover:bg-blue-700/80 border-blue-600/40',
    presetLabel: 'text-blue-300',
    btnBg: 'bg-blue-700 hover:bg-blue-800',
    focusRing: 'focus:ring-blue-500',
    tabActive: 'bg-blue-600 text-white shadow-lg',
    tabInactive: 'bg-white/10 text-white/70 hover:bg-white/20',
    switchBtn: 'text-blue-700 bg-blue-50 border-blue-200',
    iconBg: 'opacity-10',
  },
  quality: {
    key: 'quality',
    label: 'Quality Inspector',
    tabLabel: '🔍 Quality',
    icon: Search,
    title: 'Quality Inspector Login',
    subtitle: 'Crop grading, quality check aur inspection reports',
    bg: 'from-amber-950 via-amber-900 to-slate-950',
    panel: 'from-amber-800 to-amber-950',
    panelBorder: 'border-amber-700/60',
    accent: 'bg-amber-500',
    accentText: 'text-amber-950',
    titleColor: 'text-yellow-300',
    subtitleColor: 'text-amber-200',
    presetBg: 'bg-amber-900/60 hover:bg-amber-700/80 border-amber-600/40',
    presetLabel: 'text-amber-300',
    btnBg: 'bg-amber-700 hover:bg-amber-800',
    focusRing: 'focus:ring-amber-500',
    tabActive: 'bg-amber-600 text-white shadow-lg',
    tabInactive: 'bg-white/10 text-white/70 hover:bg-white/20',
    switchBtn: 'text-amber-700 bg-amber-50 border-amber-200',
    iconBg: 'opacity-10',
  },
  supervisor: {
    key: 'supervisor',
    label: 'Supervisor',
    tabLabel: '🛡️ Supervisor',
    icon: Shield,
    title: 'Supervisor Login',
    subtitle: 'Weight correction approval, fraud detection aur audit trail',
    bg: 'from-orange-950 via-orange-900 to-slate-950',
    panel: 'from-orange-800 to-orange-950',
    panelBorder: 'border-orange-700/60',
    accent: 'bg-orange-500',
    accentText: 'text-orange-950',
    titleColor: 'text-orange-300',
    subtitleColor: 'text-orange-200',
    presetBg: 'bg-orange-900/60 hover:bg-orange-700/80 border-orange-600/40',
    presetLabel: 'text-orange-300',
    btnBg: 'bg-orange-700 hover:bg-orange-800',
    focusRing: 'focus:ring-orange-500',
    tabActive: 'bg-orange-600 text-white shadow-lg',
    tabInactive: 'bg-white/10 text-white/70 hover:bg-white/20',
    switchBtn: 'text-orange-700 bg-orange-50 border-orange-200',
    iconBg: 'opacity-10',
  },
  admin: {
    key: 'admin',
    label: 'Admin',
    tabLabel: '👤 Admin',
    icon: UserCog,
    title: 'Admin Login',
    subtitle: 'System analytics, centre management aur user control',
    bg: 'from-violet-950 via-purple-900 to-slate-950',
    panel: 'from-violet-800 to-purple-950',
    panelBorder: 'border-violet-700/60',
    accent: 'bg-violet-500',
    accentText: 'text-violet-950',
    titleColor: 'text-purple-300',
    subtitleColor: 'text-violet-200',
    presetBg: 'bg-violet-900/60 hover:bg-violet-700/80 border-violet-600/40',
    presetLabel: 'text-violet-300',
    btnBg: 'bg-violet-700 hover:bg-violet-800',
    focusRing: 'focus:ring-violet-500',
    tabActive: 'bg-violet-600 text-white shadow-lg',
    tabInactive: 'bg-white/10 text-white/70 hover:bg-white/20',
    switchBtn: 'text-violet-700 bg-violet-50 border-violet-200',
    iconBg: 'opacity-10',
  },
};

const ROLE_KEYS = ['farmer', 'operator', 'quality', 'supervisor', 'admin'];

export default function LoginPage() {
  const { login, register } = useAuth();
  const [selectedRole, setSelectedRole] = useState('farmer');
  const [isRegister, setIsRegister] = useState(false);
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [centreId, setCentreId] = useState(1);
  const [errorMsg, setErrorMsg] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const theme = ROLE_THEMES[selectedRole];
  const RoleIcon = theme.icon;

  // Find demo preset matching selected role
  const matchedPreset = DEMO_PRESETS.find(
    (p) => p.role.toLowerCase() === selectedRole
  );

  const handleLoginSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg('');
    setSubmitting(true);
    try {
      await login(phone, password);
    } catch (err) {
      setErrorMsg(err.response?.data?.detail || 'Invalid phone or password');
    } finally {
      setSubmitting(false);
    }
  };

  const handleRegisterSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg('');
    setSubmitting(true);
    try {
      await register({
        name,
        phone,
        password,
        role: selectedRole,
        centre_id: Number(centreId),
      });
    } catch (err) {
      setErrorMsg(
        err.response?.data?.detail ||
          'Registration failed. Phone may already be registered.'
      );
    } finally {
      setSubmitting(false);
    }
  };

  const handleQuickPresetLogin = async (preset) => {
    setPhone(preset.phone);
    setPassword(preset.pass);
    setErrorMsg('');
    setSubmitting(true);
    try {
      await login(preset.phone, preset.pass);
    } catch (err) {
      setErrorMsg('Failed to login with demo credentials.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleRoleSwitch = (roleKey) => {
    setSelectedRole(roleKey);
    setErrorMsg('');
  };

  return (
    <div
      className={`min-h-screen bg-gradient-to-br ${theme.bg} text-white flex flex-col items-center justify-center p-4 sm:p-6 transition-all duration-500`}
    >
      {/* ──── Role Selector Tabs ──── */}
      <div className="flex flex-wrap items-center justify-center gap-2 mb-6">
        {ROLE_KEYS.map((roleKey) => {
          const t = ROLE_THEMES[roleKey];
          const isActive = roleKey === selectedRole;
          return (
            <button
              key={roleKey}
              onClick={() => handleRoleSwitch(roleKey)}
              className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all duration-300 border border-white/10 ${
                isActive ? t.tabActive : t.tabInactive
              }`}
            >
              {t.tabLabel}
            </button>
          );
        })}
      </div>

      {/* ──── Main Card ──── */}
      <div className="max-w-4xl w-full grid grid-cols-1 lg:grid-cols-12 bg-white/95 text-gray-900 rounded-3xl shadow-2xl overflow-hidden border border-white/20">
        {/* ──── Left Branding Panel ──── */}
        <div
          className={`lg:col-span-5 bg-gradient-to-b ${theme.panel} p-8 text-white flex flex-col justify-between relative overflow-hidden transition-all duration-500`}
        >
          {/* Background Icon */}
          <div
            className={`absolute right-0 bottom-0 ${theme.iconBg} pointer-events-none translate-x-12 translate-y-12`}
          >
            <RoleIcon className="w-80 h-80" />
          </div>

          <div className="space-y-4 relative z-10">
            {/* Role Icon Badge */}
            <div
              className={`w-14 h-14 ${theme.accent} rounded-2xl flex items-center justify-center shadow-lg`}
            >
              <RoleIcon className="w-8 h-8 text-white" />
            </div>

            {/* Title & Description */}
            <div>
              <h2
                className={`text-2xl font-extrabold ${theme.titleColor} transition-all duration-300`}
              >
                {theme.title}
              </h2>
              <p
                className={`text-xs ${theme.subtitleColor} mt-1 leading-relaxed`}
              >
                {theme.subtitle}
              </p>
            </div>

            <p className="text-[10px] text-white/40 mt-2">
              Farmer Procurement Issue Resolution System • SIH 2024
            </p>
          </div>

          {/* ──── Demo Preset (only matching role) ──── */}
          {matchedPreset && (
            <div
              className={`relative z-10 pt-6 border-t ${theme.panelBorder} space-y-2 mt-6`}
            >
              <span
                className={`text-[11px] font-bold uppercase tracking-wider ${theme.presetLabel} block`}
              >
                ⚡ Quick Demo Login:
              </span>
              <button
                onClick={() => handleQuickPresetLogin(matchedPreset)}
                disabled={submitting}
                className={`w-full text-left p-3 rounded-xl ${theme.presetBg} border text-xs transition flex items-center justify-between group disabled:opacity-50`}
              >
                <div>
                  <span className="font-bold text-white block capitalize">
                    {matchedPreset.label}
                  </span>
                  <span className="text-[10px] text-white/60">
                    {matchedPreset.desc}
                  </span>
                </div>
                <ArrowRight className="w-4 h-4 text-white/60 group-hover:translate-x-1 transition-transform" />
              </button>
            </div>
          )}
        </div>

        {/* ──── Right Auth Form ──── */}
        <div className="lg:col-span-7 p-8 flex flex-col justify-center space-y-6">
          {/* Header */}
          <div className="flex items-center justify-between border-b border-gray-200 pb-4">
            <div>
              <h3 className="text-xl font-extrabold text-gray-900">
                {isRegister
                  ? `Register as ${theme.label}`
                  : `Sign In as ${theme.label}`}
              </h3>
              <p className="text-xs text-gray-500 mt-0.5">
                {isRegister
                  ? `Create a new ${theme.label} account`
                  : 'Enter registered phone number and password'}
              </p>
            </div>

            <button
              onClick={() => {
                setIsRegister(!isRegister);
                setErrorMsg('');
              }}
              className={`text-xs font-bold ${theme.switchBtn} flex items-center gap-1 px-3 py-1.5 rounded-xl border`}
            >
              {isRegister ? (
                <LogIn className="w-4 h-4" />
              ) : (
                <UserPlus className="w-4 h-4" />
              )}
              {isRegister ? 'Sign In' : 'Register'}
            </button>
          </div>

          {/* Error Message */}
          {errorMsg && (
            <div className="p-3 bg-red-50 text-red-800 text-xs font-semibold rounded-xl border border-red-200">
              ⚠️ {errorMsg}
            </div>
          )}

          {/* Form */}
          <form
            onSubmit={isRegister ? handleRegisterSubmit : handleLoginSubmit}
            className="space-y-4 text-xs"
          >
            {isRegister && (
              <div>
                <label className="block text-gray-700 font-semibold mb-1">
                  Full Name
                </label>
                <div className="relative">
                  <User className="w-4 h-4 absolute left-3 top-3 text-gray-400" />
                  <input
                    type="text"
                    required
                    placeholder="e.g. Ramesh Kumar"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className={`w-full pl-9 pr-3 py-2.5 rounded-xl border border-gray-300 focus:ring-2 ${theme.focusRing} font-medium`}
                  />
                </div>
              </div>
            )}

            <div>
              <label className="block text-gray-700 font-semibold mb-1">
                Phone Number
              </label>
              <div className="relative">
                <Phone className="w-4 h-4 absolute left-3 top-3 text-gray-400" />
                <input
                  type="text"
                  required
                  placeholder="e.g. 9876543210"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className={`w-full pl-9 pr-3 py-2.5 rounded-xl border border-gray-300 focus:ring-2 ${theme.focusRing} font-mono font-medium`}
                />
              </div>
            </div>

            <div>
              <label className="block text-gray-700 font-semibold mb-1">
                Password
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 absolute left-3 top-3 text-gray-400" />
                <input
                  type="password"
                  required
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className={`w-full pl-9 pr-3 py-2.5 rounded-xl border border-gray-300 focus:ring-2 ${theme.focusRing} font-medium`}
                />
              </div>
            </div>

            {isRegister && (
              <div>
                <label className="block text-gray-700 font-semibold mb-1">
                  Centre ID Assignment
                </label>
                <input
                  type="number"
                  value={centreId}
                  onChange={(e) => setCentreId(e.target.value)}
                  className={`w-full p-2.5 rounded-xl border border-gray-300 focus:ring-2 ${theme.focusRing} font-mono`}
                />
              </div>
            )}

            <button
              type="submit"
              disabled={submitting}
              className={`w-full py-3 ${theme.btnBg} text-white font-bold rounded-xl shadow-lg transition-all duration-300 flex items-center justify-center gap-2 text-sm mt-2 disabled:opacity-50`}
            >
              {submitting ? (
                'Authenticating...'
              ) : isRegister ? (
                <>
                  <UserPlus className="w-4 h-4" /> Create {theme.label} Account
                </>
              ) : (
                <>
                  <LogIn className="w-4 h-4" /> Sign In as {theme.label}
                </>
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
