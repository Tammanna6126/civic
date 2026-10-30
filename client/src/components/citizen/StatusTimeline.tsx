import React from 'react';
import { ComplaintStatus, StatusHistory } from '../../types';
import { CheckCircle2, Clock, Cpu, Eye, UserCheck, Wrench, ShieldCheck } from 'lucide-react';

interface Props {
  currentStatus: ComplaintStatus;
  history?: StatusHistory[];
}

const STEPS: { status: ComplaintStatus; label: string; icon: any }[] = [
  { status: 'submitted', label: 'Submitted', icon: Clock },
  { status: 'ai_analyzed', label: 'AI Analyzed', icon: Cpu },
  { status: 'under_review', label: 'Under Review', icon: Eye },
  { status: 'assigned', label: 'Assigned', icon: UserCheck },
  { status: 'in_progress', label: 'In Progress', icon: Wrench },
  { status: 'resolved', label: 'Resolved', icon: ShieldCheck }
];

export const StatusTimeline: React.FC<Props> = ({ currentStatus, history = [] }) => {
  const currentIndex = STEPS.findIndex((s) => s.status === currentStatus);

  return (
    <div className="space-y-6">
      {/* Horizontal Pipeline Steps */}
      <div className="relative flex items-center justify-between">
        {/* Connecting Line */}
        <div className="absolute top-1/2 left-0 right-0 h-1 bg-slate-800 -translate-y-1/2 z-0" />
        <div
          className="absolute top-1/2 left-0 h-1 bg-gradient-to-r from-emerald-500 to-teal-400 -translate-y-1/2 z-0 transition-all duration-500"
          style={{
            width: `${Math.max(0, Math.min(100, (currentIndex / (STEPS.length - 1)) * 100))}%`
          }}
        />

        {STEPS.map((step, idx) => {
          const Icon = step.icon;
          const isCompleted = idx <= currentIndex;
          const isCurrent = idx === currentIndex;

          return (
            <div
              key={step.status}
              className="relative z-10 flex flex-col items-center group cursor-default"
            >
              <div
                className={`w-9 h-9 rounded-full flex items-center justify-center border-2 transition-all ${
                  isCurrent
                    ? 'bg-emerald-500 border-white text-slate-950 scale-110 shadow-lg shadow-emerald-500/40 ring-4 ring-emerald-500/20'
                    : isCompleted
                    ? 'bg-slate-900 border-emerald-500 text-emerald-400'
                    : 'bg-slate-950 border-slate-700 text-slate-600'
                }`}
              >
                <Icon className="w-4 h-4" />
              </div>
              <span
                className={`mt-2 text-[11px] font-semibold tracking-wide hidden sm:block ${
                  isCurrent
                    ? 'text-emerald-400 font-bold'
                    : isCompleted
                    ? 'text-slate-200'
                    : 'text-slate-500'
                }`}
              >
                {step.label}
              </span>
            </div>
          );
        })}
      </div>

      {/* Audit History Log */}
      {history.length > 0 && (
        <div className="pt-4 border-t border-slate-800 space-y-2.5">
          <h5 className="text-xs font-bold text-slate-400 uppercase tracking-wider">
            Verified Resolution Audit Trail
          </h5>
          <div className="space-y-2">
            {history.map((h, i) => (
              <div
                key={h.id || i}
                className="p-2.5 rounded-lg bg-slate-900/60 border border-slate-800/80 text-xs flex items-start justify-between gap-3"
              >
                <div>
                  <span className="font-semibold text-emerald-400 capitalize">
                    {h.to_status.replace('_', ' ')}
                  </span>
                  {h.comment && <p className="text-slate-300 mt-0.5">{h.comment}</p>}
                </div>
                <span className="text-[10px] font-mono text-slate-500 shrink-0">
                  {new Date(h.created_at).toLocaleTimeString([], {
                    hour: '2-digit',
                    minute: '2-digit'
                  })}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
