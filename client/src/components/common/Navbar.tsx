import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useRole } from '../../context/RoleContext';
import { UserRole } from '../../types';
import {
  ShieldAlert,
  Building2,
  HardHat,
  User,
  PlusCircle,
  LogIn,
  LogOut,
  ChevronDown
} from 'lucide-react';

export const Navbar: React.FC = () => {
  const { role, setRole, user, isAuthenticated, signOut, setOpenAuthModal } = useRole();
  const location = useLocation();

  const handleRoleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setRole(e.target.value as UserRole);
  };

  const getRoleBadge = () => {
    switch (role) {
      case 'municipal_admin':
        return {
          icon: Building2,
          color: 'bg-indigo-500/15 border-indigo-500/40 text-indigo-400',
          label: 'Admin Command'
        };
      case 'maintenance_worker':
        return {
          icon: HardHat,
          color: 'bg-amber-500/15 border-amber-500/40 text-amber-400',
          label: 'Field Technician'
        };
      case 'citizen':
      default:
        return {
          icon: User,
          color: 'bg-emerald-500/15 border-emerald-500/40 text-emerald-400',
          label: 'Citizen Portal'
        };
    }
  };

  const badge = getRoleBadge();
  const RoleIcon = badge.icon;

  return (
    <header className="sticky top-0 z-40 glass-panel border-b border-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo & Brand */}
          <Link to="/" className="flex items-center space-x-3 group">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-emerald-600 to-teal-400 flex items-center justify-center shadow-lg shadow-emerald-500/20 group-hover:scale-105 transition-transform">
              <ShieldAlert className="w-5 h-5 text-white" />
            </div>
            <div>
              <div className="flex items-center space-x-1.5">
                <span className="font-extrabold text-lg tracking-tight bg-gradient-to-r from-white via-slate-100 to-emerald-400 bg-clip-text text-transparent">
                  CIVIC INTELLIGENCE
                </span>
                <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-bold">
                  AI CORE
                </span>
              </div>
              <p className="text-[11px] text-slate-400 hidden sm:block">
                Smart City Infrastructure & Incident Response
              </p>
            </div>
          </Link>

          {/* Navigation Links according to persona */}
          <nav className="hidden md:flex items-center space-x-1">
            <Link
              to="/citizen"
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center space-x-1.5 transition-colors ${
                location.pathname === '/citizen' || location.pathname === '/'
                  ? 'bg-slate-800 text-white border border-slate-700'
                  : 'text-slate-400 hover:text-white hover:bg-slate-900'
              }`}
            >
              <PlusCircle className="w-3.5 h-3.5 text-emerald-400" />
              <span>Submit & Track</span>
            </Link>

            <Link
              to="/admin"
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center space-x-1.5 transition-colors ${
                location.pathname.startsWith('/admin')
                  ? 'bg-slate-800 text-white border border-slate-700'
                  : 'text-slate-400 hover:text-white hover:bg-slate-900'
              }`}
            >
              <Building2 className="w-3.5 h-3.5 text-indigo-400" />
              <span>Municipal Command</span>
            </Link>

            <Link
              to="/worker"
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center space-x-1.5 transition-colors ${
                location.pathname === '/worker'
                  ? 'bg-slate-800 text-white border border-slate-700'
                  : 'text-slate-400 hover:text-white hover:bg-slate-900'
              }`}
            >
              <HardHat className="w-3.5 h-3.5 text-amber-400" />
              <span>Field Tasks</span>
            </Link>
          </nav>

          {/* Role Switcher & Auth Section */}
          <div className="flex items-center space-x-3">
            {/* Quick Demo Role Switcher */}
            <div className="flex items-center space-x-2 bg-slate-900/90 border border-slate-700/80 px-2.5 py-1.5 rounded-xl shadow-inner">
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider hidden lg:inline">
                Role:
              </span>
              <div className="flex items-center space-x-1.5">
                <RoleIcon className="w-4 h-4 text-emerald-400 shrink-0" />
                <select
                  value={role}
                  onChange={handleRoleChange}
                  className="bg-transparent text-xs font-bold text-white focus:outline-none cursor-pointer pr-1"
                >
                  <option value="citizen" className="bg-slate-900 text-slate-100">
                    Citizen
                  </option>
                  <option value="municipal_admin" className="bg-slate-900 text-slate-100">
                    Municipal Admin
                  </option>
                  <option value="maintenance_worker" className="bg-slate-900 text-slate-100">
                    Maintenance Worker
                  </option>
                </select>
              </div>
            </div>

            {/* User Identity / Sign In Action */}
            {isAuthenticated ? (
              <div className="flex items-center space-x-2.5 pl-2 border-l border-slate-800">
                <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-emerald-600 to-teal-500 flex items-center justify-center font-bold text-xs text-white shadow-md">
                  {user.name.charAt(0)}
                </div>
                <div className="hidden xl:flex flex-col text-left">
                  <span className="text-xs font-semibold text-slate-200 leading-tight">
                    {user.name}
                  </span>
                  <span className="text-[10px] text-emerald-400 font-mono">
                    {user.email || 'Online Session'}
                  </span>
                </div>
                <button
                  onClick={signOut}
                  title="Sign Out"
                  className="p-1.5 text-slate-400 hover:text-rose-400 hover:bg-slate-800 rounded-lg transition-colors"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <button
                onClick={() => setOpenAuthModal(true)}
                className="px-3.5 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold shadow-md shadow-emerald-600/30 flex items-center space-x-1.5 transition-all"
              >
                <LogIn className="w-3.5 h-3.5" />
                <span>Sign In</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};
