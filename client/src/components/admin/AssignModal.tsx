import React, { useState } from 'react';
import { Complaint } from '../../types';
import { api } from '../../services/api';
import { UserCheck, X, Building2, Wrench, Send } from 'lucide-react';

interface Props {
  complaint: Complaint;
  onClose: () => void;
  onAssigned: () => void;
}

const DEPARTMENTS = [
  { id: 'd1111111-1111-1111-1111-111111111111', code: 'ROADS', name: 'Roads & Infrastructure Maintenance' },
  { id: 'd2222222-2222-2222-2222-222222222222', code: 'WATER_SEWERAGE', name: 'Water Supply & Sewerage Board' },
  { id: 'd3333333-3333-3333-3333-333333333333', code: 'DRAINAGE', name: 'Stormwater & Flood Management' },
  { id: 'd4444444-4444-4444-4444-444444444444', code: 'WASTE', name: 'Solid Waste & Sanitation' },
  { id: 'd5555555-5555-5555-5555-555555555555', code: 'ELECTRICAL', name: 'Electrical Utilities & Lighting' },
  { id: 'd6666666-6666-6666-6666-666666666666', code: 'PUBLIC_SAFETY', name: 'Civil Defense & Public Safety Team' }
];

export const AssignModal: React.FC<Props> = ({ complaint, onClose, onAssigned }) => {
  const [selectedDept, setSelectedDept] = useState(
    complaint.assigned_department_id || 'd1111111-1111-1111-1111-111111111111'
  );
  const [comment, setComment] = useState('High-priority dispatch. Cordon off area and begin repair.');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setLoading(true);
      await api.assignComplaint(complaint.id, selectedDept, undefined, comment);
      onAssigned();
      onClose();
    } catch (err) {
      console.error('Assignment error:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-fade-in">
      <div className="bg-slate-900 border border-slate-700 w-full max-w-lg rounded-2xl shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center space-x-2.5">
            <UserCheck className="w-5 h-5 text-emerald-400" />
            <h3 className="font-bold text-base text-white">
              Dispatch & Assign Complaint
            </h3>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-white p-1 rounded-lg">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 text-xs space-y-1">
            <span className="font-mono text-emerald-400 font-bold">{complaint.ticket_number}</span>
            <h4 className="font-semibold text-slate-100">{complaint.title}</h4>
            <div className="text-slate-400 font-mono text-[11px]">{complaint.address}</div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1.5">
              Select Responsible Department *
            </label>
            <select
              value={selectedDept}
              onChange={(e) => setSelectedDept(e.target.value)}
              className="w-full bg-slate-950 border border-slate-700 rounded-xl px-4 py-2.5 text-xs text-slate-100 focus:outline-none focus:border-emerald-500"
            >
              {DEPARTMENTS.map((dept) => (
                <option key={dept.id} value={dept.id}>
                  {dept.name} ({dept.code})
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1.5">
              Dispatch Instructions / Work Order Notes
            </label>
            <textarea
              rows={3}
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              className="w-full bg-slate-950 border border-slate-700 rounded-xl p-3 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-emerald-500"
            />
          </div>

          <div className="flex items-center justify-end space-x-3 pt-3 border-t border-slate-800">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-lg shadow-emerald-600/30 flex items-center space-x-2 transition-all"
            >
              <Send className="w-3.5 h-3.5" />
              <span>{loading ? 'Dispatching...' : 'Confirm Field Assignment'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
