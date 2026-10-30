import React from 'react';
import { Complaint } from '../../types';
import { api } from '../../services/api';
import { Copy, Link2, X, Check, AlertCircle } from 'lucide-react';

interface Props {
  complaint: Complaint;
  duplicates: any[];
  onClose: () => void;
  onResolved: () => void;
}

export const DuplicateModal: React.FC<Props> = ({
  complaint,
  duplicates,
  onClose,
  onResolved
}) => {
  const [submitting, setSubmitting] = React.useState(false);

  const handleAction = async (possibleDupId: string, action: 'confirm_merge' | 'dismiss') => {
    try {
      setSubmitting(true);
      await api.reviewDuplicate(complaint.id, possibleDupId, action);
      onResolved();
      onClose();
    } catch (err) {
      console.error('Failed to review duplicate:', err);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-fade-in">
      <div className="bg-slate-900 border border-slate-700 w-full max-w-2xl rounded-2xl shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center space-x-2.5">
            <Copy className="w-5 h-5 text-indigo-400" />
            <h3 className="font-bold text-base text-white">
              AI Duplicate Report Review
            </h3>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white p-1 rounded-lg"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-5 max-h-[75vh] overflow-y-auto">
          {/* Target Complaint */}
          <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-1.5">
            <span className="text-[10px] font-mono text-emerald-400 font-bold uppercase">
              Current Complaint: {complaint.ticket_number}
            </span>
            <h4 className="font-semibold text-sm text-white">{complaint.title}</h4>
            <p className="text-xs text-slate-300">{complaint.description}</p>
            <div className="text-[11px] text-slate-400 mt-2 font-mono">
              Location: {complaint.address}
            </div>
          </div>

          <div className="space-y-3">
            <h5 className="text-xs font-bold text-slate-400 uppercase tracking-wider">
              Nearby Similar Reports Identified ({duplicates.length})
            </h5>

            {duplicates.length === 0 ? (
              <div className="text-xs text-slate-400 text-center py-6">
                No active duplicate pairs suggested for this ticket.
              </div>
            ) : (
              duplicates.map((dup, i) => {
                const target = dup.possible_duplicate || dup;
                return (
                  <div
                    key={dup.id || i}
                    className="p-4 rounded-xl bg-indigo-950/20 border border-indigo-500/30 space-y-3"
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-mono font-bold text-indigo-300">
                        {target.ticket_number || 'Candidate Ticket'}
                      </span>
                      <div className="flex items-center space-x-2">
                        <span className="px-2 py-0.5 rounded text-[11px] font-bold bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                          {Math.round((dup.similarity_score || 0.85) * 100)}% Match
                        </span>
                        <span className="px-2 py-0.5 rounded text-[11px] font-mono bg-slate-800 text-slate-300">
                          {Math.round(dup.distance_meters || 15)}m apart
                        </span>
                      </div>
                    </div>

                    <div>
                      <h5 className="text-xs font-semibold text-slate-100">
                        {target.title}
                      </h5>
                      <p className="text-xs text-slate-400 mt-0.5">
                        {target.description}
                      </p>
                    </div>

                    {/* Decision Buttons */}
                    <div className="flex items-center justify-end space-x-2 pt-2 border-t border-slate-800/80">
                      <button
                        type="button"
                        disabled={submitting}
                        onClick={() =>
                          handleAction(
                            dup.possible_duplicate_id || target.id,
                            'dismiss'
                          )
                        }
                        className="px-3 py-1.5 rounded-lg border border-slate-700 hover:bg-slate-800 text-xs text-slate-300 font-medium transition-colors"
                      >
                        Keep Distinct
                      </button>
                      <button
                        type="button"
                        disabled={submitting}
                        onClick={() =>
                          handleAction(
                            dup.possible_duplicate_id || target.id,
                            'confirm_merge'
                          )
                        }
                        className="px-3.5 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-xs text-white font-bold flex items-center space-x-1.5 shadow-md shadow-indigo-600/30 transition-colors"
                      >
                        <Link2 className="w-3.5 h-3.5" />
                        <span>Link as Duplicate</span>
                      </button>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
