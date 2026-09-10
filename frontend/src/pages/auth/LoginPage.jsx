import React, { useState } from 'react';
import { useAuth, DEMO_PRESETS } from '../../context/AuthContext';
import { Sprout, Lock, Phone, User, ShieldCheck, ArrowRight, UserPlus, LogIn, KeyRound } from 'lucide-react';

export default function LoginPage() {
  const { login, register } = useAuth();
  const [isRegister, setIsRegister] = useState(false);
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [role, setRole] = useState("farmer");
  const [centreId, setCentreId] = useState(1);
  const [errorMsg, setErrorMsg] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const handleLoginSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg("");
    setSubmitting(true);
    try {
      await login(phone, password);
    } catch (err) {
      setErrorMsg(err.response?.data?.detail || "Invalid phone or password");
    } finally {
      setSubmitting(false);
    }
  };

  const handleRegisterSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg("");
    setSubmitting(true);
    try {
      await register({
        name,
        phone,
        password,
        role,
        centre_id: Number(centreId)
      });
    } catch (err) {
      setErrorMsg(err.response?.data?.detail || "Registration failed. Phone may already be registered.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleQuickPresetLogin = async (preset) => {
    setPhone(preset.phone);
    setPassword(preset.pass);
    setErrorMsg("");
    setSubmitting(true);
    try {
      await login(preset.phone, preset.pass);
    } catch (err) {
      setErrorMsg("Failed to login with demo credentials.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-950 via-teal-900 to-slate-950 text-white flex items-center justify-center p-4 sm:p-6">
      
      <div className="max-w-4xl w-full grid grid-cols-1 lg:grid-cols-12 bg-white/95 text-gray-900 rounded-3xl shadow-2xl overflow-hidden border border-white/20">
        
        {/* Left Branding Side (5 cols) */}
        <div className="lg:col-span-5 bg-gradient-to-b from-emerald-800 to-teal-950 p-8 text-white flex flex-col justify-between relative overflow-hidden">
          <div className="absolute right-0 bottom-0 opacity-10 pointer-events-none translate-x-12 translate-y-12">
            <Sprout className="w-80 h-80" />
          </div>

          <div className="space-y-4 relative z-10">
            <div className="w-14 h-14 bg-emerald-500 rounded-2xl flex items-center justify-center text-emerald-950 font-bold shadow-lg">
              <Sprout className="w-8 h-8 text-white" />
            </div>

            <div>
              <h2 className="text-2xl font-extrabold text-amber-300">Kisan Procurement Portal</h2>
              <p className="text-xs text-emerald-200 mt-1 leading-relaxed">
                Integrated Delay Reduction, Anti-Manipulation Scale Locks, Lot QR Tracking & AI Anomaly Detection.
              </p>
            </div>
          </div>

          {/* Quick Demo Preset Selector */}
          <div className="relative z-10 pt-6 border-t border-emerald-700/60 space-y-2">
            <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-300 block">
              ⚡ 1-Click Fast Demo Login:
            </span>
            <div className="space-y-1.5 max-h-48 overflow-y-auto pr-1">
              {DEMO_PRESETS.map((preset) => (
                <button
                  key={preset.role}
                  onClick={() => handleQuickPresetLogin(preset)}
                  className="w-full text-left p-2 rounded-xl bg-emerald-900/60 hover:bg-emerald-700/80 border border-emerald-600/40 text-xs transition flex items-center justify-between group"
                >
                  <div>
                    <span className="font-bold text-white block capitalize">{preset.label}</span>
                    <span className="text-[10px] text-emerald-300">{preset.desc}</span>
                  </div>
                  <ArrowRight className="w-4 h-4 text-emerald-400 group-hover:translate-x-1 transition-transform" />
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Right Auth Form Side (7 cols) */}
        <div className="lg:col-span-7 p-8 flex flex-col justify-center space-y-6">
          
          {/* Header Tabs */}
          <div className="flex items-center justify-between border-b border-gray-200 pb-4">
            <div>
              <h3 className="text-xl font-extrabold text-gray-900">
                {isRegister ? "Create System Account" : "Sign In to Portal"}
              </h3>
              <p className="text-xs text-gray-500 mt-0.5">
                {isRegister ? "Register new farmer or staff user" : "Enter registered phone number and password"}
              </p>
            </div>

            <button
              onClick={() => { setIsRegister(!isRegister); setErrorMsg(""); }}
              className="text-xs font-bold text-emerald-700 hover:text-emerald-800 flex items-center gap-1 bg-emerald-50 px-3 py-1.5 rounded-xl border border-emerald-200"
            >
              {isRegister ? <LogIn className="w-4 h-4" /> : <UserPlus className="w-4 h-4" />}
              {isRegister ? "Sign In" : "Register"}
            </button>
          </div>

          {errorMsg && (
            <div className="p-3 bg-red-50 text-red-800 text-xs font-semibold rounded-xl border border-red-200">
              ⚠️ {errorMsg}
            </div>
          )}

          {/* Form */}
          <form onSubmit={isRegister ? handleRegisterSubmit : handleLoginSubmit} className="space-y-4 text-xs">
            
            {isRegister && (
              <div>
                <label className="block text-gray-700 font-semibold mb-1">Full Name</label>
                <div className="relative">
                  <User className="w-4 h-4 absolute left-3 top-3 text-gray-400" />
                  <input
                    type="text"
                    required
                    placeholder="e.g. Ramesh Kumar"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-gray-300 focus:ring-2 focus:ring-emerald-500 font-medium"
                  />
                </div>
              </div>
            )}

            <div>
              <label className="block text-gray-700 font-semibold mb-1">Phone Number</label>
              <div className="relative">
                <Phone className="w-4 h-4 absolute left-3 top-3 text-gray-400" />
                <input
                  type="text"
                  required
                  placeholder="e.g. 9876543210"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-gray-300 focus:ring-2 focus:ring-emerald-500 font-mono font-medium"
                />
              </div>
            </div>

            <div>
              <label className="block text-gray-700 font-semibold mb-1">Password</label>
              <div className="relative">
                <Lock className="w-4 h-4 absolute left-3 top-3 text-gray-400" />
                <input
                  type="password"
                  required
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-gray-300 focus:ring-2 focus:ring-emerald-500 font-medium"
                />
              </div>
            </div>

            {isRegister && (
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-gray-700 font-semibold mb-1">System Role</label>
                  <select
                    value={role}
                    onChange={(e) => setRole(e.target.value)}
                    className="w-full p-2.5 rounded-xl border border-gray-300 focus:ring-2 focus:ring-emerald-500 bg-white font-medium capitalize"
                  >
                    <option value="farmer">Farmer</option>
                    <option value="operator">Scale Operator</option>
                    <option value="quality">Quality Inspector</option>
                    <option value="supervisor">Supervisor</option>
                    <option value="admin">System Admin</option>
                  </select>
                </div>

                <div>
                  <label className="block text-gray-700 font-semibold mb-1">Centre ID Assignment</label>
                  <input
                    type="number"
                    value={centreId}
                    onChange={(e) => setCentreId(e.target.value)}
                    className="w-full p-2.5 rounded-xl border border-gray-300 focus:ring-2 focus:ring-emerald-500 font-mono"
                  />
                </div>
              </div>
            )}

            <button
              type="submit"
              disabled={submitting}
              className="w-full py-3 bg-emerald-700 hover:bg-emerald-800 text-white font-bold rounded-xl shadow-lg transition flex items-center justify-center gap-2 text-sm mt-2 disabled:opacity-50"
            >
              {submitting ? (
                "Authenticating JWT..."
              ) : isRegister ? (
                <> <UserPlus className="w-4 h-4" /> Create Account & Login </>
              ) : (
                <> <LogIn className="w-4 h-4" /> Sign In to System </>
              )}
            </button>
          </form>

        </div>

      </div>

    </div>
  );
}
