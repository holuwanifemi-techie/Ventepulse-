import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { getAdminPlatformStats, deleteUserAdmin, ADMIN_EMAIL } from '../../lib/adminService';
import { AdminPlatformStats } from '../../types/database';
import {
  ShieldAlert,
  Users,
  Building2,
  TrendingUp,
  UserCheck,
  Search,
  Layers,
  Loader2,
  ArrowLeft,
  RefreshCw,
  Lock,
  Trash2
} from 'lucide-react';

interface AdminDashboardProps {
  onBackToApp: () => void;
}

export const AdminDashboard: React.FC<AdminDashboardProps> = ({ onBackToApp }) => {
  const { user, signOut } = useAuth();
  const [stats, setStats] = useState<AdminPlatformStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  // Strict check if current logged in email is the single admin account
  const isAuthorizedAdmin = user?.email?.toLowerCase() === ADMIN_EMAIL.toLowerCase();

  const fetchStats = async () => {
    if (!isAuthorizedAdmin) return;

    setLoading(true);
    setErrorMessage(null);
    const { data, error } = await getAdminPlatformStats();
    setLoading(false);

    if (error) {
      setErrorMessage(error.message);
    } else {
      setStats(data);
    }
  };

  useEffect(() => {
    fetchStats();
  }, [user]);

  const handleDeleteUser = async (targetUserId: string, targetEmail: string) => {
    if (targetEmail.toLowerCase() === ADMIN_EMAIL.toLowerCase()) {
      alert('Cannot delete the master administrator account.');
      return;
    }

    if (window.confirm(`Are you sure you want to permanently delete user "${targetEmail}" and all their business data and leads?`)) {
      setDeletingId(targetUserId);
      const { error } = await deleteUserAdmin(targetUserId);
      setDeletingId(null);

      if (!error) {
        fetchStats();
      } else {
        alert(`Failed to delete user: ${error.message}`);
      }
    }
  };

  if (!isAuthorizedAdmin) {
    return (
      <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center p-4">
        <div className="w-full max-w-md bg-slate-900 border border-red-500/30 rounded-3xl p-6 sm:p-8 text-center space-y-5 shadow-2xl">
          <div className="w-14 h-14 bg-red-500/10 border border-red-500/30 rounded-2xl flex items-center justify-center text-red-400 mx-auto">
            <Lock className="w-7 h-7" />
          </div>
          <div className="space-y-1">
            <h2 className="text-xl font-bold text-white">Access Denied</h2>
            <p className="text-xs text-slate-400 leading-relaxed">
              This dashboard is strictly reserved for the Administrator account.
            </p>
          </div>
          <button
            type="button"
            onClick={signOut}
            className="w-full py-3 px-4 bg-red-600 hover:bg-red-500 active:bg-red-700 text-white font-bold text-xs rounded-xl transition-all cursor-pointer"
          >
            Redirect to Login
          </button>
        </div>
      </div>
    );
  }

  const formatDate = (dateString: string) => {
    try {
      return new Date(dateString).toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
      });
    } catch {
      return dateString;
    }
  };

  // Filtered recent users
  const filteredUsers = stats?.recentUsers.filter(u => {
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    return (
      u.email.toLowerCase().includes(q) ||
      (u.full_name && u.full_name.toLowerCase().includes(q)) ||
      (u.business_name && u.business_name.toLowerCase().includes(q))
    );
  }) || [];

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 font-sans pb-20">
      
      {/* Admin Top Header */}
      <header className="sticky top-0 z-50 bg-slate-900/90 backdrop-blur-xl border-b border-slate-800 px-4 sm:px-6 py-3.5 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={onBackToApp}
            className="p-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl transition-colors cursor-pointer flex items-center gap-1.5 text-xs font-semibold"
          >
            <ArrowLeft className="w-4 h-4" />
            <span className="hidden sm:inline">Return to App</span>
          </button>

          <div>
            <div className="flex items-center gap-1.5 text-[10px] font-bold text-emerald-400 uppercase tracking-widest">
              <ShieldAlert className="w-3.5 h-3.5" /> Shared Administrator Portal
            </div>
            <h1 className="text-base sm:text-lg font-bold text-white tracking-tight">Platform Growth Dashboard</h1>
          </div>
        </div>

        <button
          type="button"
          onClick={fetchStats}
          disabled={loading}
          className="p-2 bg-slate-800 hover:bg-slate-700 active:bg-slate-800 text-slate-300 rounded-xl transition-all cursor-pointer disabled:opacity-50"
          title="Refresh Metrics"
        >
          <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin text-emerald-400' : ''}`} />
        </button>
      </header>

      {/* Main Content */}
      <main className="max-w-6xl mx-auto p-4 sm:p-6 space-y-6 sm:space-y-8">
        
        {/* Error Alert */}
        {errorMessage && (
          <div className="p-4 rounded-2xl bg-red-500/10 border border-red-500/30 text-red-400 text-xs font-medium flex items-center justify-between">
            <span>Failed to load admin metrics: {errorMessage}</span>
            <button type="button" onClick={fetchStats} className="underline text-red-300">Retry</button>
          </div>
        )}

        {loading && !stats ? (
          <div className="flex flex-col items-center justify-center py-24 gap-3">
            <Loader2 className="w-8 h-8 text-emerald-400 animate-spin" />
            <p className="text-xs text-slate-400">Loading Platform Growth Metrics...</p>
          </div>
        ) : stats ? (
          <>
            {/* KPI METRIC CARDS GRID */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-5">
              
              <div className="p-4 sm:p-5 bg-slate-900/90 border border-slate-800 rounded-2xl space-y-2 relative overflow-hidden shadow-xl">
                <div className="flex items-center justify-between text-slate-400 text-xs font-semibold">
                  <span>Registered Users</span>
                  <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                    <Users className="w-4 h-4" />
                  </div>
                </div>
                <div className="text-2xl sm:text-3xl font-extrabold text-white">
                  {stats.totalUsers}
                </div>
                <div className="text-[11px] text-emerald-400 flex items-center gap-1 font-medium">
                  <UserCheck className="w-3 h-3" /> Platform Accounts
                </div>
              </div>

              <div className="p-4 sm:p-5 bg-slate-900/90 border border-slate-800 rounded-2xl space-y-2 relative overflow-hidden shadow-xl">
                <div className="flex items-center justify-between text-slate-400 text-xs font-semibold">
                  <span>Active Businesses</span>
                  <div className="p-2 rounded-xl bg-teal-500/10 text-teal-400 border border-teal-500/20">
                    <Building2 className="w-4 h-4" />
                  </div>
                </div>
                <div className="text-2xl sm:text-3xl font-extrabold text-white">
                  {stats.totalBusinesses}
                </div>
                <div className="text-[11px] text-slate-400 font-medium">
                  Onboarded Agencies
                </div>
              </div>

              <div className="p-4 sm:p-5 bg-slate-900/90 border border-slate-800 rounded-2xl space-y-2 relative overflow-hidden shadow-xl">
                <div className="flex items-center justify-between text-slate-400 text-xs font-semibold">
                  <span>Platform Leads</span>
                  <div className="p-2 rounded-xl bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
                    <Layers className="w-4 h-4" />
                  </div>
                </div>
                <div className="text-2xl sm:text-3xl font-extrabold text-white">
                  {stats.totalLeads}
                </div>
                <div className="text-[11px] text-indigo-400 font-medium">
                  Prospects Managed
                </div>
              </div>

              <div className="p-4 sm:p-5 bg-slate-900/90 border border-slate-800 rounded-2xl space-y-2 relative overflow-hidden shadow-xl">
                <div className="flex items-center justify-between text-slate-400 text-xs font-semibold">
                  <span>Joined Today</span>
                  <div className="p-2 rounded-xl bg-purple-500/10 text-purple-400 border border-purple-500/20">
                    <TrendingUp className="w-4 h-4" />
                  </div>
                </div>
                <div className="text-2xl sm:text-3xl font-extrabold text-emerald-400">
                  +{stats.registrationsToday}
                </div>
                <div className="text-[11px] text-slate-400 font-medium">
                  New Today
                </div>
              </div>

            </div>

            {/* INDUSTRY VERTICAL BREAKDOWN */}
            <div className="p-5 sm:p-6 bg-slate-900/80 border border-slate-800 rounded-3xl space-y-4 shadow-xl">
              <h2 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
                <Building2 className="w-4 h-4 text-emerald-400" /> Business Type Distribution
              </h2>

              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
                {Object.entries(stats.businessTypeBreakdown).map(([type, count]) => (
                  <div key={type} className="p-3 bg-slate-950/70 border border-slate-800/80 rounded-2xl space-y-1">
                    <div className="text-[11px] text-slate-400 font-medium truncate">{type}</div>
                    <div className="text-lg font-bold text-white flex items-center justify-between">
                      <span>{count}</span>
                      <span className="text-[10px] text-emerald-400 bg-emerald-950/60 px-1.5 py-0.5 rounded border border-emerald-800/40">
                        {stats.totalBusinesses > 0 ? `${Math.round((count / stats.totalBusinesses) * 100)}%` : '0%'}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* RECENT USER REGISTRATIONS TABLE WITH DELETE BUTTON */}
            <div className="p-5 sm:p-6 bg-slate-900/80 border border-slate-800 rounded-3xl space-y-5 shadow-xl">
              
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <h2 className="text-sm sm:text-base font-bold text-white flex items-center gap-2">
                    <Users className="w-4 h-4 text-emerald-400" /> User Registrations Monitor
                  </h2>
                  <p className="text-xs text-slate-400">Monitoring user sign-ups and lead activity</p>
                </div>

                <div className="relative w-full sm:w-64">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search users or businesses..."
                    className="w-full pl-9 pr-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
                  />
                </div>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs text-slate-300">
                  <thead className="bg-slate-950/80 text-slate-400 uppercase text-[10px] font-semibold tracking-wider border-b border-slate-800">
                    <tr>
                      <th className="py-3 px-4">User Email</th>
                      <th className="py-3 px-4">Business Name</th>
                      <th className="py-3 px-4">Industry Type</th>
                      <th className="py-3 px-4">Registered Date</th>
                      <th className="py-3 px-4 text-center">Leads</th>
                      <th className="py-3 px-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/60">
                    {filteredUsers.length === 0 ? (
                      <tr>
                        <td colSpan={6} className="py-8 text-center text-slate-500">
                          No registered users found matching your search.
                        </td>
                      </tr>
                    ) : (
                      filteredUsers.map((userItem) => (
                        <tr key={userItem.id} className="hover:bg-slate-950/40 transition-colors">
                          <td className="py-3.5 px-4 font-semibold text-white">
                            {userItem.email}
                          </td>
                          <td className="py-3.5 px-4 text-slate-300">
                            {userItem.business_name || <span className="text-slate-600 italic">Not onboarded</span>}
                          </td>
                          <td className="py-3.5 px-4">
                            {userItem.business_type ? (
                              <span className="px-2 py-0.5 rounded-full text-[10px] font-medium bg-slate-950 text-emerald-300 border border-slate-800">
                                {userItem.business_type}
                              </span>
                            ) : (
                              '—'
                            )}
                          </td>
                          <td className="py-3.5 px-4 text-slate-400">
                            {formatDate(userItem.created_at)}
                          </td>
                          <td className="py-3.5 px-4 text-center font-mono font-semibold text-white">
                            {userItem.leads_count}
                          </td>
                          <td className="py-3.5 px-4 text-right">
                            {userItem.email.toLowerCase() !== ADMIN_EMAIL.toLowerCase() && (
                              <button
                                type="button"
                                onClick={() => handleDeleteUser(userItem.id, userItem.email)}
                                disabled={deletingId === userItem.id}
                                className="px-2.5 py-1 bg-red-950/40 hover:bg-red-900/60 text-red-400 rounded-lg border border-red-900/60 font-medium inline-flex items-center gap-1 transition-all cursor-pointer disabled:opacity-50"
                                title="Delete User Account"
                              >
                                {deletingId === userItem.id ? (
                                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                                ) : (
                                  <>
                                    <Trash2 className="w-3.5 h-3.5" />
                                    <span>Delete</span>
                                  </>
                                )}
                              </button>
                            )}
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>

            </div>

          </>
        ) : null}

      </main>
    </div>
  );
};
