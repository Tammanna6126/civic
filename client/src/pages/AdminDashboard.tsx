import React, { useState, useEffect } from 'react';
import { Complaint, DashboardStats, Hotspot, ActionBrief } from '../types';
import { api } from '../services/api';
import { CivicMap } from '../components/map/CivicMap';
import { PriorityBadge } from '../components/common/PriorityBadge';
import { StatusBadge } from '../components/common/StatusBadge';
import { AssignModal } from '../components/admin/AssignModal';
import { DuplicateModal } from '../components/admin/DuplicateModal';
import { ActionBriefView } from '../components/admin/ActionBriefView';
import { Link } from 'react-router-dom';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell
} from 'recharts';
import {
  Building2,
  AlertOctagon,
  Clock,
  CheckCircle2,
  Filter,
  Search,
  Sparkles,
  Map as MapIcon,
  Table as TableIcon,
  TrendingUp,
  Copy,
  UserCheck,
  Eye,
  RefreshCw
} from 'lucide-react';

const COLORS = ['#10b981', '#f59e0b', '#0284c7', '#f43f5e', '#a855f7', '#64748b'];

export const AdminDashboard: React.FC = () => {
  const [complaints, setComplaints] = useState<Complaint[]>([]);
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [hotspots, setHotspots] = useState<Hotspot[]>([]);
  const [brief, setBrief] = useState<ActionBrief | null>(null);

  const [loading, setLoading] = useState(true);
  const [briefLoading, setBriefLoading] = useState(false);
  const [viewTab, setViewTab] = useState<'map' | 'table' | 'brief' | 'analytics'>('map');

  // Filters
  const [statusFilter, setStatusFilter] = useState('all');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [priorityFilter, setPriorityFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');

  // Modals state
  const [assignTarget, setAssignTarget] = useState<Complaint | null>(null);
  const [duplicateTarget, setDuplicateTarget] = useState<{ complaint: Complaint; list: any[] } | null>(null);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [complaintsRes, statsRes, hotspotsRes] = await Promise.all([
        api.getComplaints({
          status: statusFilter !== 'all' ? statusFilter : undefined,
          category: categoryFilter !== 'all' ? categoryFilter : undefined,
          priority_tier: priorityFilter !== 'all' ? priorityFilter : undefined,
          search: searchQuery.trim() || undefined
        }),
        api.getStats(),
        api.getHotspots()
      ]);

      if (complaintsRes.success) setComplaints(complaintsRes.complaints);
      if (statsRes.success) setStats(statsRes);
      if (hotspotsRes.success) setHotspots(hotspotsRes.hotspots);
    } catch (err) {
      console.error('Error fetching admin dashboard data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [statusFilter, categoryFilter, priorityFilter]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    fetchData();
  };

  const loadBrief = async () => {
    try {
      setBriefLoading(true);
      const res = await api.getActionBrief();
      if (res.success) {
        setBrief(res.brief);
      }
    } catch (err) {
      console.error('Failed to load action brief:', err);
    } finally {
      setBriefLoading(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 animate-fade-in">
      {/* Admin Command Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 glass-panel p-6 sm:p-8 rounded-3xl border border-slate-800 shadow-2xl">
        <div className="space-y-1.5">
          <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-indigo-500/15 border border-indigo-500/30 text-indigo-400 text-xs font-bold">
            <Building2 className="w-3.5 h-3.5" />
            <span>MUNICIPAL OPERATIONS COMMAND CENTER</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
            Smart City Infrastructure Incident Triage
          </h1>
          <p className="text-xs sm:text-sm text-slate-400">
            Real-time multi-ward dispatch, AI risk evaluation, and duplicate resolution engine.
          </p>
        </div>

        {/* View Switcher Tabs */}
        <div className="flex items-center space-x-1.5 bg-slate-900/90 border border-slate-800 p-1.5 rounded-2xl self-start md:self-center shadow-inner">
          <button
            onClick={() => setViewTab('map')}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold flex items-center space-x-1.5 transition-all ${
              viewTab === 'map'
                ? 'bg-emerald-600 text-white shadow-md shadow-emerald-600/30'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <MapIcon className="w-3.5 h-3.5" />
            <span>Map & Hotspots</span>
          </button>

          <button
            onClick={() => setViewTab('table')}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold flex items-center space-x-1.5 transition-all ${
              viewTab === 'table'
                ? 'bg-emerald-600 text-white shadow-md shadow-emerald-600/30'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <TableIcon className="w-3.5 h-3.5" />
            <span>Triage Feed ({complaints.length})</span>
          </button>

          <button
            onClick={() => {
              setViewTab('brief');
              if (!brief) loadBrief();
            }}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold flex items-center space-x-1.5 transition-all ${
              viewTab === 'brief'
                ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5 text-indigo-300" />
            <span>AI Action Brief</span>
          </button>

          <button
            onClick={() => setViewTab('analytics')}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold flex items-center space-x-1.5 transition-all ${
              viewTab === 'analytics'
                ? 'bg-emerald-600 text-white shadow-md shadow-emerald-600/30'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <TrendingUp className="w-3.5 h-3.5" />
            <span>Analytics</span>
          </button>
        </div>
      </div>

      {/* KPI Stats Counters */}
      {stats && (
        <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
          <div className="glass-panel p-4 rounded-2xl border border-slate-800 space-y-1">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
              Total Incidents
            </span>
            <div className="text-2xl font-extrabold text-white">
              {stats.kpis.totalComplaints}
            </div>
            <span className="text-[11px] text-slate-500 font-mono">City-wide monitored</span>
          </div>

          <div className="glass-panel p-4 rounded-2xl border border-rose-500/30 space-y-1 bg-rose-500/5">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold text-rose-400 uppercase tracking-wider">
                Critical Hazards
              </span>
              <AlertOctagon className="w-4 h-4 text-rose-400" />
            </div>
            <div className="text-2xl font-extrabold text-rose-400">
              {stats.kpis.criticalHazards}
            </div>
            <span className="text-[11px] text-rose-400/80 font-mono">Immediate risk &gt;85</span>
          </div>

          <div className="glass-panel p-4 rounded-2xl border border-amber-500/30 space-y-1 bg-amber-500/5">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold text-amber-400 uppercase tracking-wider">
                Pending Triage
              </span>
              <Clock className="w-4 h-4 text-amber-400" />
            </div>
            <div className="text-2xl font-extrabold text-amber-400">
              {stats.kpis.pendingTriage}
            </div>
            <span className="text-[11px] text-amber-400/80 font-mono">Awaiting dispatch</span>
          </div>

          <div className="glass-panel p-4 rounded-2xl border border-blue-500/30 space-y-1 bg-blue-500/5">
            <span className="text-[11px] font-bold text-sky-400 uppercase tracking-wider">
              Field In Progress
            </span>
            <div className="text-2xl font-extrabold text-sky-400">
              {stats.kpis.inProgress}
            </div>
            <span className="text-[11px] text-sky-400/80 font-mono">Active crews deployed</span>
          </div>

          <div className="glass-panel p-4 rounded-2xl border border-emerald-500/30 space-y-1 bg-emerald-500/5 col-span-2 lg:col-span-1">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold text-emerald-400 uppercase tracking-wider">
                Resolved Tickets
              </span>
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            </div>
            <div className="text-2xl font-extrabold text-emerald-400">
              {stats.kpis.resolved}
            </div>
            <span className="text-[11px] text-emerald-400/80 font-mono">
              {stats.kpis.resolutionRatePercent}% rate ({stats.kpis.avgResolutionHours}h avg)
            </span>
          </div>
        </div>
      )}

      {/* VIEW TAB 1: INTERACTIVE MAP & INCIDENTS */}
      {viewTab === 'map' && (
        <div className="space-y-6">
          <CivicMap
            complaints={complaints}
            hotspots={hotspots}
            height="550px"
            showHotspots={true}
          />

          {/* Quick Critical Feed below map */}
          <div className="glass-panel p-6 rounded-2xl border border-slate-800 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-bold text-white flex items-center space-x-2">
                <AlertOctagon className="w-5 h-5 text-rose-500" />
                <span>Urgent Emergency Incidents Requiring Department Dispatch</span>
              </h3>
              <button
                onClick={() => setViewTab('table')}
                className="text-xs font-semibold text-emerald-400 hover:text-emerald-300"
              >
                View all in table &rarr;
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {complaints
                .filter((c) => c.priority_tier === 'critical' || c.priority_tier === 'high')
                .slice(0, 6)
                .map((c) => (
                  <div
                    key={c.id}
                    className="p-4 rounded-xl bg-slate-900 border border-slate-800 space-y-3 flex flex-col justify-between"
                  >
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="font-mono text-xs font-bold text-slate-400">
                          {c.ticket_number}
                        </span>
                        <PriorityBadge tier={c.priority_tier} score={c.priority_score} size="sm" />
                      </div>
                      <h4 className="text-xs font-bold text-white line-clamp-2">{c.title}</h4>
                      <p className="text-[11px] text-slate-400 line-clamp-2">{c.description}</p>
                    </div>

                    <div className="pt-2 border-t border-slate-800 flex items-center justify-between">
                      <button
                        onClick={() => setAssignTarget(c)}
                        className="px-2.5 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-[11px] flex items-center space-x-1"
                      >
                        <UserCheck className="w-3 h-3" />
                        <span>Dispatch</span>
                      </button>

                      <Link
                        to={`/complaints/${c.id}`}
                        className="text-[11px] text-slate-400 hover:text-white flex items-center space-x-1 font-semibold"
                      >
                        <Eye className="w-3 h-3 text-emerald-400" />
                        <span>Inspect</span>
                      </Link>
                    </div>
                  </div>
                ))}
            </div>
          </div>
        </div>
      )}

      {/* VIEW TAB 2: TRIAGE TABLE */}
      {viewTab === 'table' && (
        <div className="glass-panel p-6 rounded-2xl border border-slate-800 space-y-6">
          {/* Filters Bar */}
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-4 border-b border-slate-800">
            <form onSubmit={handleSearchSubmit} className="relative flex-1 max-w-md">
              <Search className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search ticket number, title, or address..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-slate-900 border border-slate-700 rounded-xl pl-10 pr-4 py-2 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-emerald-500"
              />
            </form>

            <div className="flex flex-wrap items-center gap-2.5">
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-300 focus:outline-none focus:border-emerald-500"
              >
                <option value="all">All Statuses</option>
                <option value="submitted">Submitted</option>
                <option value="ai_analyzed">AI Analyzed</option>
                <option value="under_review">Under Review</option>
                <option value="assigned">Assigned</option>
                <option value="in_progress">In Progress</option>
                <option value="resolved">Resolved</option>
              </select>

              <select
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value)}
                className="bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-300 focus:outline-none focus:border-emerald-500"
              >
                <option value="all">All Categories</option>
                <option value="pothole">Pothole & Roads</option>
                <option value="waterlogging">Waterlogging</option>
                <option value="drainage">Drainage</option>
                <option value="garbage">Garbage</option>
                <option value="streetlights">Streetlights</option>
                <option value="public_hazard">Critical Hazard</option>
              </select>

              <select
                value={priorityFilter}
                onChange={(e) => setPriorityFilter(e.target.value)}
                className="bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-300 focus:outline-none focus:border-emerald-500"
              >
                <option value="all">All Priorities</option>
                <option value="critical">Critical (85–100)</option>
                <option value="high">High (65–84)</option>
                <option value="medium">Medium (35–64)</option>
                <option value="low">Low (0–34)</option>
              </select>
            </div>
          </div>

          {/* Table */}
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-950/80 text-slate-400 font-bold uppercase tracking-wider border-b border-slate-800">
                <tr>
                  <th className="py-3 px-4">Ticket</th>
                  <th className="py-3 px-4">Priority</th>
                  <th className="py-3 px-4">Issue Details</th>
                  <th className="py-3 px-4">Zone / Ward</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4">Department</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/80">
                {complaints.map((c) => (
                  <tr key={c.id} className="hover:bg-slate-850/60 transition-colors">
                    <td className="py-3.5 px-4 font-mono font-bold text-slate-300">
                      {c.ticket_number}
                      {c.is_duplicate && (
                        <span className="block mt-0.5 text-[10px] text-amber-400 font-sans font-semibold">
                          Duplicate Suggestion
                        </span>
                      )}
                    </td>
                    <td className="py-3.5 px-4">
                      <PriorityBadge tier={c.priority_tier} score={c.priority_score} size="sm" />
                    </td>
                    <td className="py-3.5 px-4 max-w-xs">
                      <div className="font-semibold text-white truncate">{c.title}</div>
                      <div className="text-slate-400 text-[11px] truncate">{c.address}</div>
                    </td>
                    <td className="py-3.5 px-4 text-slate-300">{c.ward_or_zone}</td>
                    <td className="py-3.5 px-4">
                      <StatusBadge status={c.status} size="sm" />
                    </td>
                    <td className="py-3.5 px-4 font-mono text-[11px] text-emerald-400">
                      {c.departments?.name || 'Unassigned'}
                    </td>
                    <td className="py-3.5 px-4 text-right space-x-2">
                      <button
                        onClick={() => setAssignTarget(c)}
                        className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 transition-colors inline-flex items-center"
                        title="Assign Department"
                      >
                        <UserCheck className="w-3.5 h-3.5" />
                      </button>

                      <Link
                        to={`/complaints/${c.id}`}
                        className="p-1.5 rounded-lg bg-slate-800 hover:bg-emerald-600 hover:text-white text-slate-200 transition-colors inline-flex items-center"
                        title="View Full Analysis"
                      >
                        <Eye className="w-3.5 h-3.5" />
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* VIEW TAB 3: AI ACTION BRIEF */}
      {viewTab === 'brief' && (
        <ActionBriefView brief={brief} loading={briefLoading} onRefresh={loadBrief} />
      )}

      {/* VIEW TAB 4: ANALYTICS & CHARTS */}
      {viewTab === 'analytics' && stats && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div className="glass-panel p-6 rounded-2xl border border-slate-800 space-y-4">
            <h3 className="text-sm font-bold text-white uppercase tracking-wider">
              Category Distribution
            </h3>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={stats.categoryDistribution}>
                  <XAxis dataKey="name" stroke="#64748b" fontSize={11} />
                  <YAxis stroke="#64748b" fontSize={11} />
                  <Tooltip
                    contentStyle={{ background: '#0f172a', borderColor: '#334155', borderRadius: '8px' }}
                  />
                  <Bar dataKey="value" fill="#10b981" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="glass-panel p-6 rounded-2xl border border-slate-800 space-y-4">
            <h3 className="text-sm font-bold text-white uppercase tracking-wider">
              Complaint Pipeline Statuses
            </h3>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={stats.statusDistribution}
                    dataKey="value"
                    nameKey="name"
                    cx="50%"
                    cy="50%"
                    outerRadius={80}
                    label
                  >
                    {stats.statusDistribution.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{ background: '#0f172a', borderColor: '#334155', borderRadius: '8px' }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      )}

      {/* Modals */}
      {assignTarget && (
        <AssignModal
          complaint={assignTarget}
          onClose={() => setAssignTarget(null)}
          onAssigned={() => {
            setAssignTarget(null);
            fetchData();
          }}
        />
      )}

      {duplicateTarget && (
        <DuplicateModal
          complaint={duplicateTarget.complaint}
          duplicates={duplicateTarget.list}
          onClose={() => setDuplicateTarget(null)}
          onResolved={() => {
            setDuplicateTarget(null);
            fetchData();
          }}
        />
      )}
    </div>
  );
};
