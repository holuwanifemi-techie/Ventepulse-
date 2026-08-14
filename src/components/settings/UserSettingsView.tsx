import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../../context/AuthContext';
import { getUserProfile, updateUserProfile, uploadAvatarImage, deleteOwnAccount } from '../../lib/profileService';
import { Profile } from '../../types/database';
import { User, Mail, Camera, Save, Trash2, AlertTriangle, CheckCircle, Loader2, Calendar, Lock } from 'lucide-react';

interface UserSettingsViewProps {
  onProfileUpdated?: () => void;
}

export const UserSettingsView: React.FC<UserSettingsViewProps> = ({ onProfileUpdated }) => {
  const { user } = useAuth();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [fullName, setFullName] = useState('');
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [deletingAccount, setDeletingAccount] = useState(false);

  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  const fileInputRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    if (user) {
      fetchProfile();
    }
  }, [user]);

  const fetchProfile = async () => {
    if (!user) return;
    setLoading(true);
    const { data, error } = await getUserProfile(user.id);
    setLoading(false);

    if (data) {
      setProfile(data);
      setFullName(data.full_name || user.email?.split('@')[0] || '');
      setAvatarUrl(data.avatar_url || null);
    } else if (error) {
      console.warn('Profile fetch notice:', error.message);
      setFullName(user.email?.split('@')[0] || '');
    }
  };

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    if (!fullName.trim()) {
      setErrorMessage('Full Name cannot be empty.');
      return;
    }

    setSaving(true);
    setSuccessMessage(null);
    setErrorMessage(null);

    const { error } = await updateUserProfile(user.id, {
      full_name: fullName.trim(),
      avatar_url: avatarUrl || undefined,
    });

    setSaving(false);

    if (error) {
      setErrorMessage(error.message);
    } else {
      setSuccessMessage('Profile updated successfully.');
      fetchProfile();
      if (onProfileUpdated) onProfileUpdated();
      setTimeout(() => setSuccessMessage(null), 4000);
    }
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0 || !user) return;

    const file = files[0];
    setUploadingImage(true);
    setErrorMessage(null);
    setSuccessMessage(null);

    const { url, error } = await uploadAvatarImage(user.id, file);
    setUploadingImage(false);

    if (error) {
      setErrorMessage(error.message);
    } else if (url) {
      setAvatarUrl(url);
      await updateUserProfile(user.id, { avatar_url: url });
      setSuccessMessage('Profile picture updated successfully.');
      if (onProfileUpdated) onProfileUpdated();
      setTimeout(() => setSuccessMessage(null), 4000);
    }
  };

  const handleDeleteAccountConfirm = async () => {
    if (!user) return;

    setDeletingAccount(true);
    setErrorMessage(null);

    const { error } = await deleteOwnAccount(user.id);
    setDeletingAccount(false);

    if (error) {
      setErrorMessage(`Failed to delete account: ${error.message}`);
      setShowDeleteConfirm(false);
    } else {
      window.location.reload();
    }
  };

  const formatDate = (dateStr?: string) => {
    if (!dateStr) return 'N/A';
    try {
      return new Date(dateStr).toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
      });
    } catch {
      return dateStr;
    }
  };

  const getInitial = () => {
    if (fullName.trim()) return fullName.trim().charAt(0).toUpperCase();
    if (user?.email) return user.email.charAt(0).toUpperCase();
    return 'U';
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-20 gap-3">
        <Loader2 className="w-8 h-8 text-emerald-500 animate-spin" />
        <p className="text-xs text-slate-400">Loading settings...</p>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      
      {/* Header Title */}
      <div className="space-y-1">
        <h2 className="text-xl sm:text-2xl font-bold text-white tracking-tight">Account Settings</h2>
        <p className="text-xs text-slate-400">Manage your profile, preferences, and account security</p>
      </div>

      {/* Success Alert */}
      {successMessage && (
        <div className="p-3.5 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-semibold flex items-center gap-2 animate-fadeIn">
          <CheckCircle className="w-4 h-4 shrink-0" />
          <span>{successMessage}</span>
        </div>
      )}

      {/* Error Alert */}
      {errorMessage && (
        <div className="p-3.5 rounded-2xl bg-red-500/10 border border-red-500/30 text-red-400 text-xs font-semibold flex items-center gap-2 animate-fadeIn">
          <AlertTriangle className="w-4 h-4 shrink-0" />
          <span>{errorMessage}</span>
        </div>
      )}

      {/* 1. PROFILE SECTION */}
      <section className="bg-slate-900/90 border border-slate-800 rounded-3xl p-5 sm:p-6 space-y-6 shadow-xl">
        <div className="flex items-center gap-2 border-b border-slate-800 pb-3">
          <User className="w-4 h-4 text-emerald-400" />
          <h3 className="text-sm sm:text-base font-bold text-white">Profile</h3>
        </div>

        {/* Profile Picture Upload */}
        <div className="flex flex-col sm:flex-row items-center gap-5">
          <div className="relative group shrink-0">
            <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-2xl bg-slate-950 border-2 border-slate-800 overflow-hidden flex items-center justify-center shadow-lg">
              {avatarUrl ? (
                <img src={avatarUrl} alt="User Avatar" className="w-full h-full object-cover" />
              ) : (
                <span className="text-2xl sm:text-3xl font-extrabold text-emerald-400">
                  {getInitial()}
                </span>
              )}
            </div>

            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              disabled={uploadingImage}
              className="absolute -bottom-1 -right-1 p-2 bg-emerald-500 hover:bg-emerald-400 text-slate-950 rounded-xl shadow-lg transition-all cursor-pointer disabled:opacity-50"
              title="Change Profile Picture"
            >
              {uploadingImage ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Camera className="w-4 h-4" />
              )}
            </button>

            <input
              ref={fileInputRef}
              type="file"
              accept="image/jpeg,image/png,image/webp"
              onChange={handleFileChange}
              className="hidden"
            />
          </div>

          <div className="space-y-2 text-center sm:text-left">
            <div>
              <h4 className="text-sm font-bold text-white">Profile Photo</h4>
              <p className="text-xs text-slate-400">
                Upload a JPG, PNG, or WEBP image. Max 5MB.
              </p>
            </div>

            <div className="flex items-center justify-center sm:justify-start gap-2">
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                disabled={uploadingImage}
                className="py-1.5 px-3 bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold text-xs rounded-xl border border-slate-700 transition-all cursor-pointer disabled:opacity-50"
              >
                {uploadingImage ? 'Uploading...' : 'Upload Photo'}
              </button>

              {avatarUrl && (
                <button
                  type="button"
                  onClick={async () => {
                    setAvatarUrl(null);
                    if (user) await updateUserProfile(user.id, { avatar_url: '' });
                    if (onProfileUpdated) onProfileUpdated();
                  }}
                  className="py-1.5 px-3 text-slate-400 hover:text-rose-400 font-medium text-xs transition-colors cursor-pointer"
                >
                  Remove
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Edit Name Form */}
        <form onSubmit={handleSaveProfile} className="space-y-4 pt-2">
          <div className="space-y-1.5">
            <label className="block text-xs font-semibold text-slate-300">
              Full Name <span className="text-emerald-400">*</span>
            </label>
            <div className="relative">
              <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
              <input
                type="text"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="Enter your full name"
                required
                className="w-full pl-9 pr-4 py-2.5 bg-slate-950/70 border border-slate-800 rounded-xl text-sm text-slate-100 placeholder-slate-600 focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
              />
            </div>
          </div>

          <div className="pt-2 text-right">
            <button
              type="submit"
              disabled={saving}
              className="py-2.5 px-5 bg-emerald-500 hover:bg-emerald-400 active:bg-emerald-600 disabled:opacity-50 text-slate-950 font-bold text-xs rounded-xl shadow-lg shadow-emerald-500/20 inline-flex items-center gap-1.5 transition-all cursor-pointer"
            >
              {saving ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Saving...</span>
                </>
              ) : (
                <>
                  <Save className="w-4 h-4" />
                  <span>Save Changes</span>
                </>
              )}
            </button>
          </div>
        </form>
      </section>

      {/* 2. ACCOUNT INFORMATION SECTION */}
      <section className="bg-slate-900/90 border border-slate-800 rounded-3xl p-5 sm:p-6 space-y-4 shadow-xl">
        <div className="flex items-center gap-2 border-b border-slate-800 pb-3">
          <Mail className="w-4 h-4 text-emerald-400" />
          <h3 className="text-sm sm:text-base font-bold text-white">Account Information</h3>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
          <div className="space-y-1">
            <span className="text-slate-400 font-medium">Account Email</span>
            <div className="p-2.5 bg-slate-950/80 border border-slate-800 rounded-xl text-slate-200 font-mono font-medium flex items-center justify-between">
              <span>{user?.email}</span>
              <Lock className="w-3.5 h-3.5 text-slate-600" />
            </div>
          </div>

          <div className="space-y-1">
            <span className="text-slate-400 font-medium">Member Since</span>
            <div className="p-2.5 bg-slate-950/80 border border-slate-800 rounded-xl text-slate-300 flex items-center gap-2">
              <Calendar className="w-3.5 h-3.5 text-slate-500" />
              <span>{formatDate(profile?.created_at || user?.created_at)}</span>
            </div>
          </div>
        </div>
      </section>

      {/* 3. DANGER ZONE: DELETE ACCOUNT */}
      <section className="bg-slate-950 border border-red-500/30 rounded-3xl p-5 sm:p-6 space-y-4 shadow-xl">
        <div className="flex items-center gap-2 border-b border-red-900/40 pb-3">
          <AlertTriangle className="w-4 h-4 text-red-400" />
          <h3 className="text-sm sm:text-base font-bold text-red-400">Danger Zone</h3>
        </div>

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <h4 className="text-sm font-bold text-white">Delete Account</h4>
            <p className="text-xs text-slate-400 leading-relaxed max-w-md">
              Permanently remove your Ventepulse account, business profile, leads, and all associated follow-up data.
            </p>
          </div>

          <button
            type="button"
            onClick={() => setShowDeleteConfirm(true)}
            className="py-2.5 px-4 bg-red-950/50 hover:bg-red-900/80 text-red-400 border border-red-900/60 font-bold text-xs rounded-xl transition-all cursor-pointer shrink-0 inline-flex items-center gap-1.5"
          >
            <Trash2 className="w-4 h-4" />
            <span>Delete Account</span>
          </button>
        </div>
      </section>

      {/* DELETE ACCOUNT CONFIRMATION MODAL */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-md bg-slate-900 border border-red-500/40 rounded-3xl p-6 shadow-2xl space-y-5 animate-scaleUp">
            
            <div className="w-12 h-12 bg-red-500/10 border border-red-500/30 rounded-2xl flex items-center justify-center text-red-400 mx-auto">
              <AlertTriangle className="w-6 h-6" />
            </div>

            <div className="text-center space-y-2">
              <h3 className="text-lg font-bold text-white">Delete your account permanently?</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                This action is irreversible. Deleting your account will remove your business workspace, all leads, follow-up logs, and login credentials from Ventepulse.
              </p>
            </div>

            <div className="grid grid-cols-2 gap-3 pt-2">
              <button
                type="button"
                onClick={() => setShowDeleteConfirm(false)}
                disabled={deletingAccount}
                className="py-2.5 px-4 bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold text-xs rounded-xl transition-all cursor-pointer disabled:opacity-50"
              >
                Cancel
              </button>

              <button
                type="button"
                onClick={handleDeleteAccountConfirm}
                disabled={deletingAccount}
                className="py-2.5 px-4 bg-red-600 hover:bg-red-500 active:bg-red-700 text-white font-bold text-xs rounded-xl shadow-lg shadow-red-600/20 flex items-center justify-center gap-1.5 transition-all cursor-pointer disabled:opacity-50"
              >
                {deletingAccount ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Deleting...</span>
                  </>
                ) : (
                  <span>Yes, Delete Account</span>
                )}
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
};
