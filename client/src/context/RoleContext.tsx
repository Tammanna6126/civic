import React, { createContext, useContext, useState, useEffect } from 'react';
import { UserRole } from '../types';
import { supabase } from '../services/supabaseClient';

interface UserProfile {
  id: string;
  name: string;
  email?: string;
  role: UserRole;
  title: string;
  department?: string;
}

interface RoleContextType {
  role: UserRole;
  setRole: (role: UserRole) => void;
  user: UserProfile;
  session: any | null;
  isAuthenticated: boolean;
  signIn: (email: string, password: string) => Promise<{ error?: string }>;
  signUp: (email: string, password: string, name: string, role: UserRole) => Promise<{ error?: string }>;
  signOut: () => Promise<void>;
  quickDemoLogin: (targetRole: UserRole) => void;
  openAuthModal: boolean;
  setOpenAuthModal: (open: boolean) => void;
}

const RoleContext = createContext<RoleContextType | undefined>(undefined);

export const RoleProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [role, setRoleState] = useState<UserRole>(() => {
    return (localStorage.getItem('civic_demo_role') as UserRole) || 'citizen';
  });
  const [session, setSession] = useState<any | null>(null);
  const [authProfile, setAuthProfile] = useState<UserProfile | null>(null);
  const [openAuthModal, setOpenAuthModal] = useState(false);

  // Sync Supabase Auth session on mount and listen to changes
  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session: s } }) => {
      setSession(s);
      if (s?.user) {
        syncUserFromSupabase(s.user);
      }
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, s) => {
      setSession(s);
      if (s?.user) {
        syncUserFromSupabase(s.user);
      } else {
        setAuthProfile(null);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const syncUserFromSupabase = (user: any) => {
    const metaRole = (user.user_metadata?.role as UserRole) || 'citizen';
    const fullName = user.user_metadata?.full_name || user.email?.split('@')[0] || 'User';

    setRoleState(metaRole);
    localStorage.setItem('civic_demo_role', metaRole);

    setAuthProfile({
      id: user.id,
      name: fullName,
      email: user.email,
      role: metaRole,
      title: getRoleTitle(metaRole),
      department: getRoleDepartment(metaRole)
    });
  };

  const getRoleTitle = (r: UserRole) => {
    switch (r) {
      case 'municipal_admin':
        return 'Municipal Commissioner & Disaster Control Lead';
      case 'maintenance_worker':
        return 'Senior Field Lead & Infrastructure Technician';
      case 'citizen':
      default:
        return 'Citizen Representative';
    }
  };

  const getRoleDepartment = (r: UserRole) => {
    switch (r) {
      case 'municipal_admin':
        return 'City Operations Command';
      case 'maintenance_worker':
        return 'Roads & Infrastructure Maintenance';
      case 'citizen':
      default:
        return 'Indiranagar Ward 82 Resident';
    }
  };

  const setRole = (newRole: UserRole) => {
    setRoleState(newRole);
    localStorage.setItem('civic_demo_role', newRole);
    if (authProfile) {
      setAuthProfile({
        ...authProfile,
        role: newRole,
        title: getRoleTitle(newRole),
        department: getRoleDepartment(newRole)
      });
    }
  };

  // Sign In with Supabase
  const signIn = async (email: string, password: string) => {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password
      });
      if (error) return { error: error.message };
      if (data.user) {
        syncUserFromSupabase(data.user);
      }
      return {};
    } catch (err: any) {
      return { error: err.message || 'Login failed' };
    }
  };

  // Sign Up with Supabase
  const signUp = async (email: string, password: string, name: string, userRole: UserRole) => {
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: name,
            role: userRole
          }
        }
      });
      if (error) return { error: error.message };
      if (data.user) {
        syncUserFromSupabase(data.user);
      }
      return {};
    } catch (err: any) {
      return { error: err.message || 'Registration failed' };
    }
  };

  // Sign Out
  const signOut = async () => {
    await supabase.auth.signOut();
    setSession(null);
    setAuthProfile(null);
  };

  // 1-Click Quick Demo Login (for evaluators without needing email signup)
  const quickDemoLogin = (targetRole: UserRole) => {
    setRole(targetRole);
    let demoName = 'Arjun Mehta';
    let demoEmail = 'citizen.demo@smartcity.gov';

    if (targetRole === 'municipal_admin') {
      demoName = 'Priya Sharma (IAS)';
      demoEmail = 'admin.commissioner@smartcity.gov';
    } else if (targetRole === 'maintenance_worker') {
      demoName = 'Ramesh Gowda';
      demoEmail = 'worker.lead@smartcity.gov';
    }

    setAuthProfile({
      id: `demo-${targetRole}`,
      name: demoName,
      email: demoEmail,
      role: targetRole,
      title: getRoleTitle(targetRole),
      department: getRoleDepartment(targetRole)
    });
    setSession({ user: { id: `demo-${targetRole}`, email: demoEmail } });
    setOpenAuthModal(false);
  };

  // Effective current user profile
  const effectiveUser: UserProfile = authProfile || {
    id: `guest-${role}`,
    name: role === 'municipal_admin' ? 'Priya Sharma (IAS)' : role === 'maintenance_worker' ? 'Ramesh Gowda' : 'Arjun Mehta',
    email: undefined,
    role,
    title: getRoleTitle(role),
    department: getRoleDepartment(role)
  };

  return (
    <RoleContext.Provider
      value={{
        role,
        setRole,
        user: effectiveUser,
        session,
        isAuthenticated: !!session,
        signIn,
        signUp,
        signOut,
        quickDemoLogin,
        openAuthModal,
        setOpenAuthModal
      }}
    >
      {children}
    </RoleContext.Provider>
  );
};

export const useRole = () => {
  const context = useContext(RoleContext);
  if (!context) {
    throw new Error('useRole must be used within a RoleProvider');
  }
  return context;
};
