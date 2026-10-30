import React from 'react';
import { ComplaintStatus } from '../../types';
import { Clock, Cpu, Eye, UserCheck, Wrench, CheckCircle2, XCircle } from 'lucide-react';

interface Props {
  status: ComplaintStatus;
  size?: 'sm' | 'md';
}

export const StatusBadge: React.FC<Props> = ({ status, size = 'md' }) => {
  const getMeta = () => {
    switch (status) {
      case 'submitted':
        return {
          bg: 'bg-slate-800 text-slate-300 border-slate-700',
          label: 'Submitted',
          icon: Clock
        };
      case 'ai_analyzed':
        return {
          bg: 'bg-purple-950/60 text-purple-300 border-purple-800/60',
          label: 'AI Analyzed',
          icon: Cpu
        };
      case 'under_review':
        return {
          bg: 'bg-blue-950/60 text-blue-300 border-blue-800/60',
          label: 'Under Review',
          icon: Eye
        };
      case 'assigned':
        return {
          bg: 'bg-amber-950/60 text-amber-300 border-amber-800/60',
          label: 'Assigned',
          icon: UserCheck
        };
      case 'in_progress':
        return {
          bg: 'bg-orange-950/60 text-orange-300 border-orange-800/60',
          label: 'In Progress',
          icon: Wrench
        };
      case 'resolved':
        return {
          bg: 'bg-emerald-950/60 text-emerald-300 border-emerald-800/60',
          label: 'Resolved',
          icon: CheckCircle2
        };
      case 'closed':
      case 'rejected':
      default:
        return {
          bg: 'bg-slate-900 text-slate-400 border-slate-800',
          label: status,
          icon: XCircle
        };
    }
  };

  const meta = getMeta();
  const Icon = meta.icon;
  const padding = size === 'sm' ? 'px-2 py-0.5 text-xs' : 'px-2.5 py-1 text-xs';

  return (
    <span
      className={`inline-flex items-center space-x-1.5 font-medium rounded-full border ${meta.bg} ${padding}`}
    >
      <Icon className="w-3.5 h-3.5" />
      <span>{meta.label}</span>
    </span>
  );
};
