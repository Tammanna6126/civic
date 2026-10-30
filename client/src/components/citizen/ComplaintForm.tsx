import React, { useState } from 'react';
import { ComplaintCategory, Complaint } from '../../types';
import { PinPicker } from '../map/PinPicker';
import { uploadComplaintImage } from '../../services/supabaseClient';
import { api } from '../../services/api';
import {
  Send,
  Upload,
  Image as ImageIcon,
  CheckCircle,
  AlertCircle,
  Sparkles,
  MapPin,
  Loader2
} from 'lucide-react';

interface Props {
  onSuccess: (complaint: Complaint) => void;
}

export const ComplaintForm: React.FC<Props> = ({ onSuccess }) => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState<ComplaintCategory>('pothole');
  const [address, setAddress] = useState('100ft Road, Indiranagar, Ward 82');
  const [landmark, setLandmark] = useState('Near Metro Pillar 84');
  const [ward, setWard] = useState('East Zone - Indiranagar');
  const [latitude, setLatitude] = useState(12.97836);
  const [longitude, setLongitude] = useState(77.64082);

  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setImageFile(file);
      setImagePreview(URL.createObjectURL(file));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (title.trim().length < 5) {
      setError('Title must be at least 5 characters long.');
      return;
    }
    if (description.trim().length < 10) {
      setError('Please provide at least 10 characters describing the issue.');
      return;
    }

    try {
      setLoading(true);

      let uploadedUrl: string | undefined = undefined;
      if (imageFile) {
        uploadedUrl = await uploadComplaintImage(imageFile);
      }

      const res = await api.submitComplaint({
        title,
        description,
        category,
        latitude,
        longitude,
        address,
        landmark,
        ward_or_zone: ward,
        imageUrl: uploadedUrl
      });

      if (res.success && res.complaint) {
        // Reset form
        setTitle('');
        setDescription('');
        setImageFile(null);
        setImagePreview(null);
        onSuccess(res.complaint);
      }
    } catch (err: any) {
      console.error('Submission failed:', err);
      setError(err.message || 'Failed to submit complaint. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {error && (
        <div className="p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-400 text-xs flex items-center space-x-2">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Complaint Title */}
      <div>
        <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1.5">
          Issue Title *
        </label>
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="e.g., Deep dangerous pothole causing bike skids"
          required
          className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-2.5 text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-emerald-500 transition-colors"
        />
      </div>

      {/* Category Grid Selection */}
      <div>
        <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-2">
          Category (AI will verify) *
        </label>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
          {[
            { id: 'pothole', label: 'Pothole & Roads' },
            { id: 'waterlogging', label: 'Waterlogging' },
            { id: 'drainage', label: 'Drainage & Sewers' },
            { id: 'garbage', label: 'Solid Waste' },
            { id: 'streetlights', label: 'Lighting & Power' },
            { id: 'public_hazard', label: 'Critical Hazard' }
          ].map((cat) => (
            <button
              type="button"
              key={cat.id}
              onClick={() => setCategory(cat.id as ComplaintCategory)}
              className={`px-3 py-2 rounded-xl text-xs font-semibold border text-left transition-all ${
                category === cat.id
                  ? 'bg-emerald-500/15 border-emerald-500 text-emerald-300 shadow-sm shadow-emerald-500/10'
                  : 'bg-slate-900/60 border-slate-800 text-slate-400 hover:border-slate-700 hover:text-slate-200'
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>
      </div>

      {/* Description */}
      <div>
        <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1.5">
          Description *
        </label>
        <textarea
          rows={3}
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Describe what happened, any visible safety dangers, and how long the issue has persisted..."
          required
          className="w-full bg-slate-900 border border-slate-700 rounded-xl p-4 text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-emerald-500 transition-colors"
        />
      </div>

      {/* Map Location Pin Picker */}
      <div>
        <div className="flex items-center justify-between mb-1.5">
          <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider">
            Pinpoint Location on Map *
          </label>
          <span className="text-[11px] text-emerald-400 font-mono">
            GPS: {latitude.toFixed(4)}, {longitude.toFixed(4)}
          </span>
        </div>
        <PinPicker
          latitude={latitude}
          longitude={longitude}
          onChange={(lat, lng) => {
            setLatitude(lat);
            setLongitude(lng);
          }}
        />
      </div>

      {/* Address & Ward Details */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1">
            Street Address / Intersection *
          </label>
          <input
            type="text"
            value={address}
            onChange={(e) => setAddress(e.target.value)}
            required
            className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3.5 py-2 text-sm text-slate-100 focus:outline-none focus:border-emerald-500"
          />
        </div>
        <div>
          <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1">
            Zone / Ward
          </label>
          <select
            value={ward}
            onChange={(e) => setWard(e.target.value)}
            className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3.5 py-2 text-sm text-slate-100 focus:outline-none focus:border-emerald-500"
          >
            <option value="East Zone - Indiranagar">East Zone - Indiranagar</option>
            <option value="South Zone - Koramangala">South Zone - Koramangala</option>
            <option value="East Zone - Whitefield">East Zone - Whitefield</option>
            <option value="Central Zone - CBD">Central Zone - CBD</option>
            <option value="West Zone - Malleshwaram">West Zone - Malleshwaram</option>
          </select>
        </div>
      </div>

      {/* Optional Photo Upload */}
      <div>
        <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1.5">
          Evidence Photo (Optional)
        </label>
        <div className="flex items-center space-x-4">
          <label className="cursor-pointer flex items-center space-x-2 bg-slate-900 hover:bg-slate-800 border border-slate-700 rounded-xl px-4 py-2.5 text-xs font-medium text-slate-300 transition-colors">
            <Upload className="w-4 h-4 text-emerald-400" />
            <span>{imageFile ? 'Change Photo' : 'Upload Image'}</span>
            <input
              type="file"
              accept="image/*"
              onChange={handleImageChange}
              className="hidden"
            />
          </label>

          {imagePreview && (
            <div className="relative w-14 h-14 rounded-lg overflow-hidden border border-emerald-500/50 shadow-md">
              <img
                src={imagePreview}
                alt="Preview"
                className="w-full h-full object-cover"
              />
            </div>
          )}
        </div>
      </div>

      {/* Submit Button with AI Ingestion Indicator */}
      <button
        type="submit"
        disabled={loading}
        className="w-full py-3 px-6 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-500 hover:from-emerald-500 hover:to-teal-400 text-white font-bold text-sm shadow-lg shadow-emerald-600/25 flex items-center justify-center space-x-2 transition-all disabled:opacity-50"
      >
        {loading ? (
          <>
            <Loader2 className="w-4 h-4 animate-spin text-white" />
            <span>AI analyzing severity & scanning nearby duplicates...</span>
          </>
        ) : (
          <>
            <Sparkles className="w-4 h-4 text-emerald-200" />
            <span>Submit Complaint with Instant AI Triage</span>
          </>
        )}
      </button>
    </form>
  );
};
