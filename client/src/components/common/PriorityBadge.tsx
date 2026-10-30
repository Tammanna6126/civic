import React from 'react';
import { PriorityTier } from '../../types';
import { AlertTriangle, Flame, ShieldAlert, CheckCircle } from 'lucide-react';

interface Props {
  tier: PriorityTier;
  score?: number;
  showScore?: boolean;
  size?: 'sm' | 'md' | 'lg';
}

export const PriorityBadge: React.FC<Props> = ({
  tier,
  score,
  showScore = true,
  size = 'md'
}) => {
  const getStyles = () => {
    switch (tier) {
      case 'critical':
        return {
          bg: 'bg-rose-500/15 border-rose-500/40 text-rose-400',
          dot: 'bg-rose-500 animate-pulse',
          icon: Flame,
          label: 'CRITICAL'
        };
      case 'high':
        return {
          bg: 'bg-amber-500/15 border-amber-500/40 text-amber-400',
          dot: 'bg-amber-500',
          icon: AlertTriangle,
          label: 'HIGH'
        };
      case 'medium':
        return {
          bg: 'bg-sky-500/15 border-sky-500/40 text-sky-400',
          dot: 'bg-sky-400',
          icon: ShieldAlert,
          label: 'MEDIUM'
        };
      case 'low':
      default:
        return {
          bg: 'bg-slate-500/15 border-slate-500/40 text-slate-400',
          dot: 'bg-slate-400',
          icon: CheckCircle,
          label: 'LOW'
        };
    }
  };

  const style = getStyles();
  const Icon = style.icon;

  const sizeClasses = {
    sm: 'text-xs px-2 py-0.5 space-x-1',
    md: 'text-xs px-2.5 py-1 space-x-1.5',
    lg: 'text-sm px-3.5 py-1.5 space-x-2'
  }[size];

  return (
    <span
      className={`inline-flex items-center font-medium rounded-full border backdrop-blur-sm ${style.bg} ${sizeClasses}`}
    >
      <span className={`w-1.5 h-1.5 rounded-full ${style.dot}`} />
      <Icon className="w-3.5 h-3.5" />
      <span className="font-semibold tracking-wide">{style.label}</span>
      {showScore && typeof score === 'number' && (
        <span className="opacity-90 font-mono font-bold bg-black/30 px-1.5 py-0.2 rounded text-[11px]">
          {score}
        </span>
      )}
    </span>
  );
};
