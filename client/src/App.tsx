import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { RoleProvider, useRole } from './context/RoleContext';
import { Navbar } from './components/common/Navbar';
import { AuthModal } from './components/auth/AuthModal';
import { CitizenPortal } from './pages/CitizenPortal';
import { AdminDashboard } from './pages/AdminDashboard';
import { WorkerDashboard } from './pages/WorkerDashboard';
import { ComplaintDetailPage } from './pages/ComplaintDetailPage';

const RoleBasedHome: React.FC = () => {
  const { role } = useRole();
  switch (role) {
    case 'municipal_admin':
      return <AdminDashboard />;
    case 'maintenance_worker':
      return <WorkerDashboard />;
    case 'citizen':
    default:
      return <CitizenPortal />;
  }
};

export const App: React.FC = () => {
  return (
    <RoleProvider>
      <Router>
        <div className="min-h-screen flex flex-col bg-slate-950 text-slate-100 font-sans selection:bg-emerald-500 selection:text-white">
          <Navbar />
          <AuthModal />

          <main className="flex-1">
            <Routes>
              <Route path="/" element={<RoleBasedHome />} />
              <Route path="/citizen" element={<CitizenPortal />} />
              <Route path="/admin" element={<AdminDashboard />} />
              <Route path="/worker" element={<WorkerDashboard />} />
              <Route path="/complaints/:id" element={<ComplaintDetailPage />} />
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </main>

          <footer className="border-t border-slate-900 bg-slate-950/80 py-6 mt-16 text-center text-xs text-slate-500 space-y-1">
            <p className="font-semibold text-slate-400">
              CIVIC INTELLIGENCE — Smart City Infrastructure & Incident Response
            </p>
            <p>
              Built with React, Vite, Tailwind CSS, Leaflet, Express, Supabase PostgreSQL, and Google Gemini AI.
            </p>
          </footer>
        </div>
      </Router>
    </RoleProvider>
  );
};

export default App;
