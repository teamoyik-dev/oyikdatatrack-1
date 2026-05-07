import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Building2, 
  CheckCircle, 
  XCircle, 
  CreditCard, 
  Eye, 
  Power,
  PowerOff
} from 'lucide-react';
import { fetchAdminStats, fetchAllOrgs, suspendOrg, activateOrg } from '../../lib/admin-api';
import { AdminStats, OrgWithStats } from '../../lib/admin-types';
import { Button } from '../../components/ui/button';
import { toast } from 'sonner';

const AdminOverview: React.FC = () => {
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [recentOrgs, setRecentOrgs] = useState<OrgWithStats[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [actionLoadingId, setActionLoadingId] = useState<string | null>(null);
  const navigate = useNavigate();

  const loadData = async () => {
    try {
      setIsLoading(true);
      const [statsData, allOrgs] = await Promise.all([
        fetchAdminStats(),
        fetchAllOrgs()
      ]);
      setStats(statsData);
      setRecentOrgs(allOrgs.slice(0, 5)); // Only show top 5
    } catch (err: any) {
      console.error('Error loading admin overview:', err);
      toast.error('Failed to load dashboard data');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleToggleStatus = async (org: OrgWithStats) => {
    try {
      setActionLoadingId(org.id);
      if (org.is_active) {
        await suspendOrg(org.id);
        toast.success(`Suspended ${org.name}`);
      } else {
        await activateOrg(org.id);
        toast.success(`Activated ${org.name}`);
      }
      await loadData(); // Refresh data
    } catch (err: any) {
      console.error('Error toggling status:', err);
      toast.error(err.message || 'Failed to update client status');
    } finally {
      setActionLoadingId(null);
    }
  };

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  if (isLoading && !stats) {
    return (
      <div className="space-y-6">
        <div>
          <div className="h-8 w-48 bg-white/5 rounded animate-pulse mb-2"></div>
          <div className="h-5 w-64 bg-white/5 rounded animate-pulse"></div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map(i => (
            <div key={i} className="bg-[#161b22] border border-white/5 rounded-xl p-6 h-[116px] animate-pulse"></div>
          ))}
        </div>

        <div className="bg-[#161b22] border border-white/5 rounded-xl p-6 h-[400px] animate-pulse mt-8"></div>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div>
        <h1 className="text-2xl font-bold text-white tracking-tight">Admin Overview</h1>
        <p className="text-[#8b949e] text-sm mt-1">Manage all Oyik clients</p>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Clients */}
        <div className="bg-[#161b22] border border-white/5 rounded-xl p-6 flex flex-col justify-between group hover:border-blue-500/30 transition-colors">
          <div className="flex justify-between items-start mb-4">
            <div className="p-2.5 rounded-lg bg-blue-500/10 text-blue-400 group-hover:bg-blue-500/20 transition-colors">
              <Building2 size={24} />
            </div>
          </div>
          <div>
            <h3 className="text-3xl font-bold text-white tracking-tight">
              {stats?.total_orgs || 0}
            </h3>
            <p className="text-sm text-[#8b949e] font-medium mt-1">Total Clients</p>
          </div>
        </div>

        {/* Active Clients */}
        <div className="bg-[#161b22] border border-white/5 rounded-xl p-6 flex flex-col justify-between group hover:border-emerald-500/30 transition-colors">
          <div className="flex justify-between items-start mb-4">
            <div className="p-2.5 rounded-lg bg-emerald-500/10 text-emerald-400 group-hover:bg-emerald-500/20 transition-colors">
              <CheckCircle size={24} />
            </div>
          </div>
          <div>
            <h3 className="text-3xl font-bold text-white tracking-tight">
              {stats?.active_orgs || 0}
            </h3>
            <p className="text-sm text-[#8b949e] font-medium mt-1">Active Clients</p>
          </div>
        </div>

        {/* Suspended Clients */}
        <div className="bg-[#161b22] border border-white/5 rounded-xl p-6 flex flex-col justify-between group hover:border-blue-500/30 transition-colors">
          <div className="flex justify-between items-start mb-4">
            <div className="p-2.5 rounded-lg bg-blue-500/10 text-blue-400 group-hover:bg-blue-500/20 transition-colors">
              <XCircle size={24} />
            </div>
          </div>
          <div>
            <h3 className="text-3xl font-bold text-white tracking-tight">
              {stats?.suspended_orgs || 0}
            </h3>
            <p className="text-sm text-[#8b949e] font-medium mt-1">Suspended Clients</p>
          </div>
        </div>

        {/* Total Subscriptions */}
        <div className="bg-[#161b22] border border-white/5 rounded-xl p-6 flex flex-col justify-between group hover:border-purple-500/30 transition-colors">
          <div className="flex justify-between items-start mb-4">
            <div className="p-2.5 rounded-lg bg-purple-500/10 text-purple-400 group-hover:bg-purple-500/20 transition-colors">
              <CreditCard size={24} />
            </div>
          </div>
          <div>
            <h3 className="text-3xl font-bold text-white tracking-tight">
              {stats?.total_subscriptions || 0}
            </h3>
            <p className="text-sm text-[#8b949e] font-medium mt-1">Total Subscriptions</p>
          </div>
        </div>
      </div>

      {/* Recent Clients Table */}
      <div className="bg-[#161b22] border border-white/5 rounded-xl overflow-hidden shadow-sm">
        <div className="p-6 border-b border-white/5 flex justify-between items-center">
          <h2 className="text-lg font-semibold text-white">Recent Clients</h2>
          <Button 
            variant="outline" 
            size="sm" 
            className="border-white/10 hover:bg-white/5 text-white"
            onClick={() => navigate('/admin/clients')}
          >
            View All
          </Button>
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="text-xs text-[#8b949e] uppercase bg-white/[0.02] border-b border-white/5">
              <tr>
                <th className="px-6 py-4 font-semibold">Company Name</th>
                <th className="px-6 py-4 font-semibold">Plan</th>
                <th className="px-6 py-4 font-semibold">Status</th>
                <th className="px-6 py-4 font-semibold">Signed Up</th>
                <th className="px-6 py-4 font-semibold text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {recentOrgs.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-8 text-center text-[#8b949e]">
                    No clients found.
                  </td>
                </tr>
              ) : (
                recentOrgs.map((org) => (
                  <tr key={org.id} className="border-b border-white/5 hover:bg-white/[0.02] transition-colors">
                    <td className="px-6 py-4 font-medium text-white">
                      {org.name}
                    </td>
                    <td className="px-6 py-4">
                      <span className="px-2.5 py-1 text-xs font-medium rounded-full bg-blue-500/10 text-blue-400 capitalize border border-blue-500/20">
                        {org.plan}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-2.5 py-1 text-xs font-medium rounded-full border ${
                        org.is_active 
                          ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' 
                          : 'bg-blue-500/10 text-blue-400 border-blue-500/20'
                      }`}>
                        {org.is_active ? 'Active' : 'Suspended'}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-[#8b949e]">
                      {formatDate(org.created_at)}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center justify-end gap-2">
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          className="h-8 w-8 p-0 text-[#8b949e] hover:text-white"
                          onClick={() => navigate(`/admin/clients?id=${org.id}`)}
                          title="View Client"
                        >
                          <Eye size={16} />
                        </Button>
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          className={`h-8 w-8 p-0 ${
                            org.is_active 
                              ? 'text-emerald-400 hover:text-emerald-300 hover:bg-emerald-500/10' 
                              : 'text-blue-400 hover:text-blue-300 hover:bg-blue-500/10'
                          }`}
                          onClick={() => handleToggleStatus(org)}
                          disabled={actionLoadingId === org.id}
                          title={org.is_active ? "Suspend Client" : "Activate Client"}
                        >
                          {org.is_active ? <PowerOff size={16} /> : <Power size={16} />}
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default AdminOverview;
