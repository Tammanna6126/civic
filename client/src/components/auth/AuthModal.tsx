import React, { useState } from 'react';
import { useRole } from '../../context/RoleContext';
import { UserRole } from '../../types';
import {
  Lock,
  Mail,
  User,
  ShieldAlert,
  Building2,
  HardHat,
  X,
  Sparkles,
  ArrowRight,
  Loader2,
  CheckCircle2
} from 'lucide-react';

export const AuthModal: React.FC = () => {
  const { openAuthModal, setOpenAuthModal, signIn, signUp, quickDemoLogin } = useRole();

  const [tab, setTab] = useState<'signin' | 'signup' | 'demo'>('signin');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [selectedRole, setSelectedRole] = useState<UserRole>('citizen');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  if (!openAuthModal) return null;

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccessMsg(null);
    setLoading(true);

    const res = await signIn(email, password);
    setLoading(false);

    if (res.error) {
      setError(res.error);
    } else {
      setOpenAuthModal(false);
    }
  };

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccessMsg(null);

    if (fullName.trim().length < 2) {
      setError('Please provide your full name.');
      return;
    }
    if (password.length < 6) {
      setError('Password must be at least 6 characters.');
      return;
    }

    setLoading(true);
    const res = await signUp(email, password, fullName, selectedRole);
    setLoading(false);

    if (res.error) {
      setError(res.error);
    } else {
      setSuccessMsg('Account created successfully! You are now logged in.');
      setTimeout(() => {
        setOpenAuthModal(false);
      }, 1000);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fade-in">
      <div className="bg-slate-900 border border-slate-700 w-full max-w-md rounded-3xl shadow-2xl overflow-hidden relative">
        {/* Header banner */}
        <div className="p-6 bg-gradient-to-r from-slate-950 via-slate-900 to-slate-950 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-emerald-600 to-teal-400 flex items-center justify-center shadow-lg shadow-emerald-500/20">
              <ShieldAlert className="w-5 h-5 text-white" />
            </div>
            <div>
              <h3 className="font-extrabold text-base text-white">Civic Intelligence</h3>
              <p className="text-[11px] text-slate-400">Secure Municipal Access</p>
            </div>
          </div>
          <button
            onClick={() => setOpenAuthModal(false)}
            className="text-slate-400 hover:text-white p-1 rounded-lg"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Switcher */}
        <div className="flex border-b border-slate-800 bg-slate-950 text-xs font-bold">
          <button
            onClick={() => {
              setTab('signin');
              setError(null);
            }}
            className={`flex-1 py-3 border-b-2 text-center transition-colors ${
              tab === 'signin'
                ? 'border-emerald-500 text-emerald-400'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            Sign In
          </button>
          <button
            onClick={() => {
              setTab('signup');
              setError(null);
            }}
            className={`flex-1 py-3 border-b-2 text-center transition-colors ${
              tab === 'signup'
                ? 'border-emerald-500 text-emerald-400'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            Create Account
          </button>
          <button
            onClick={() => {
              setTab('demo');
              setError(null);
            }}
            className={`flex-1 py-3 border-b-2 text-center transition-colors ${
              tab === 'demo'
                ? 'border-indigo-500 text-indigo-400'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            ⚡ 1-Click Demo
          </button>
        </div>

        <div className="p-6 space-y-4">
          {error && (
            <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-400 text-xs">
              {error}
            </div>
          )}
          {successMsg && (
            <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs flex items-center space-x-2">
              <CheckCircle2 className="w-4 h-4 shrink-0" />
              <span>{successMsg}</span>
            </div>
          )}

          {/* TAB 1: SIGN IN */}
          {tab === 'signin' && (
            <form onSubmit={handleSignIn} className="space-y-4 text-xs">
              <div>
                <label className="block text-slate-300 font-bold mb-1.5 uppercase tracking-wider text-[10px]">
                  Email Address
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="citizen@smartcity.gov"
                    required
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl pl-9 pr-3.5 py-2.5 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-emerald-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-300 font-bold mb-1.5 uppercase tracking-wider text-[10px]">
                  Password
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    required
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl pl-9 pr-3.5 py-2.5 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-emerald-500"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-lg shadow-emerald-600/30 flex items-center justify-center space-x-2 transition-all mt-2"
              >
                {loading ? (
                  <Loader2 className="w-4 h-4 animate-spin text-white" />
                ) : (
                  <>
                    <span>Sign In to Platform</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </>
                )}
              </button>
            </form>
          )}

          {/* TAB 2: SIGN UP */}
          {tab === 'signup' && (
            <form onSubmit={handleSignUp} className="space-y-3.5 text-xs">
              <div>
                <label className="block text-slate-300 font-bold mb-1 uppercase tracking-wider text-[10px]">
                  Full Name
                </label>
                <div className="relative">
                  <User className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder="e.g. Ramesh Gowda"
                    required
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl pl-9 pr-3.5 py-2 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-emerald-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-300 font-bold mb-1 uppercase tracking-wider text-[10px]">
                  Email Address
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="user@smartcity.gov"
                    required
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl pl-9 pr-3.5 py-2 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-emerald-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-300 font-bold mb-1 uppercase tracking-wider text-[10px]">
                  Password (min 6 characters)
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    required
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl pl-9 pr-3.5 py-2 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-emerald-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-300 font-bold mb-1 uppercase tracking-wider text-[10px]">
                  Account Role
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { id: 'citizen', label: 'Citizen', icon: User },
                    { id: 'municipal_admin', label: 'Admin', icon: Building2 },
                    { id: 'maintenance_worker', label: 'Worker', icon: HardHat }
                  ].map((r) => {
                    const Icon = r.icon;
                    return (
                      <button
                        type="button"
                        key={r.id}
                        onClick={() => setSelectedRole(r.id as UserRole)}
                        className={`p-2 rounded-xl border text-center flex flex-col items-center justify-center space-y-1 transition-all ${
                          selectedRole === r.id
                            ? 'bg-emerald-500/15 border-emerald-500 text-emerald-300'
                            : 'bg-slate-950 border-slate-800 text-slate-400 hover:border-slate-700'
                        }`}
                      >
                        <Icon className="w-3.5 h-3.5" />
                        <span className="text-[10px] font-bold">{r.label}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-lg shadow-emerald-600/30 flex items-center justify-center space-x-2 transition-all mt-3"
              >
                {loading ? (
                  <Loader2 className="w-4 h-4 animate-spin text-white" />
                ) : (
                  <>
                    <span>Register New Profile</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </>
                )}
              </button>
            </form>
          )}

          {/* TAB 3: 1-CLICK DEMO ACCOUNTS */}
          {tab === 'demo' && (
            <div className="space-y-3">
              <p className="text-xs text-slate-400 leading-relaxed">
                Click any profile below to instantly log in and experience that role's permissions:
              </p>

              <button
                onClick={() => quickDemoLogin('citizen')}
                className="w-full p-3 rounded-2xl bg-slate-950 border border-slate-800 hover:border-emerald-500/60 text-left flex items-center justify-between group transition-all"
              >
                <div className="flex items-center space-x-3">
                  <div className="w-9 h-9 rounded-xl bg-emerald-500/15 text-emerald-400 flex items-center justify-center">
                    <User className="w-4 h-4" />
                  </div>
                  <div>
                    <h5 className="text-xs font-bold text-white group-hover:text-emerald-400 transition-colors">
                      Arjun Mehta (Citizen)
                    </h5>
                    <span className="text-[10px] text-slate-400">
                      Submit complaints, photo evidence & track resolution
                    </span>
                  </div>
                </div>
                <ArrowRight className="w-4 h-4 text-slate-500 group-hover:text-emerald-400 transition-colors" />
              </button>

              <button
                onClick={() => quickDemoLogin('municipal_admin')}
                className="w-full p-3 rounded-2xl bg-slate-950 border border-slate-800 hover:border-indigo-500/60 text-left flex items-center justify-between group transition-all"
              >
                <div className="flex items-center space-x-3">
                  <div className="w-9 h-9 rounded-xl bg-indigo-500/15 text-indigo-400 flex items-center justify-center">
                    <Building2 className="w-4 h-4" />
                  </div>
                  <div>
                    <h5 className="text-xs font-bold text-white group-hover:text-indigo-400 transition-colors">
                      Priya Sharma, IAS (Admin Command)
                    </h5>
                    <span className="text-[10px] text-slate-400">
                      City map, duplicate review, department triage & AI briefs
                    </span>
                  </div>
                </div>
                <ArrowRight className="w-4 h-4 text-slate-500 group-hover:text-indigo-400 transition-colors" />
              </button>

              <button
                onClick={() => quickDemoLogin('maintenance_worker')}
                className="w-full p-3 rounded-2xl bg-slate-950 border border-slate-800 hover:border-amber-500/60 text-left flex items-center justify-between group transition-all"
              >
                <div className="flex items-center space-x-3">
                  <div className="w-9 h-9 rounded-xl bg-amber-500/15 text-amber-400 flex items-center justify-center">
                    <HardHat className="w-4 h-4" />
                  </div>
                  <div>
                    <h5 className="text-xs font-bold text-white group-hover:text-amber-400 transition-colors">
                      Ramesh Gowda (Field Lead)
                    </h5>
                    <span className="text-[10px] text-slate-400">
                      View work orders, GPS navigation, and resolution proof
                    </span>
                  </div>
                </div>
                <ArrowRight className="w-4 h-4 text-slate-500 group-hover:text-amber-400 transition-colors" />
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
