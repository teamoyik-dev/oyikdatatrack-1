import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Building2, 
  CheckCircle, 
  XCircle, 
  CreditCard, 
  Eye, 
  Power,
  PowerOff,
  Download,
  TrendingUp,
  BarChart3
} from 'lucide-react';
import { 
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  BarChart, Bar, Legend
} from 'recharts';
import { fetchAdminStats, fetchAllOrgs, suspendOrg, activateOrg, fetchAllSubscriptionsWithOrgs } from '../../lib/admin-api';
import { calculateMRR, calculateTrends, calculateMRRGrowth, calculateTopClients, exportToCSV } from '../../lib/admin-analytics';
import { AdminStats, OrgWithStats } from '../../lib/admin-types';
import { Button } from '../../components/ui/button';
import {
  AlertDialog,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "../../components/ui/alert-dialog";
import { toast } from 'sonner';

const AdminOverview: React.FC = () => {
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [recentOrgs, setRecentOrgs] = useState<OrgWithStats[]>([]);
  
  // Analytics state
  const [mrr, setMrr] = useState(0);
  const [trends, setTrends] = useState<any[]>([]);
  const [growth, setGrowth] = useState<any[]>([]);
  const [topClients, setTopClients] = useState<any[]>([]);
  const [allOrgsList, setAllOrgsList] = useState<OrgWithStats[]>([]);
  const [allSubsList, setAllSubsList] = useState<any[]>([]);
  
  const [isLoading, setIsLoading] = useState(true);
  const [actionLoadingId, setActionLoadingId] = useState<string | null>(null);
  
  // Suspend modal state
  const [selectedOrg, setSelectedOrg] = useState<OrgWithStats | null>(null);
  const [isSuspendOpen, setIsSuspendOpen] = useState(false);
  
  const navigate = useNavigate();

  const loadData = async () => {
    try {
      setIsLoading(true);
      const [statsData, allOrgs, allSubs] = await Promise.all([
        fetchAdminStats(),
        fetchAllOrgs(),
        fetchAllSubscriptionsWithOrgs()
      ]);
      setStats(statsData);
      setAllOrgsList(allOrgs);
      setAllSubsList(allSubs);
      setRecentOrgs(allOrgs.slice(0, 5)); // Only show top 5

      // Calculate analytics
      setMrr(calculateMRR(allSubs));
      setTrends(calculateTrends(allSubs));
      setGrowth(calculateMRRGrowth(allSubs));
      setTopClients(calculateTopClients(allSubs, allOrgs));
      
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

  const handleExportCSV = () => {
    // We create a flattened view for export that combines orgs and their sub counts / mrr
    const exportData = allOrgsList.map(org => {
      // Find subs for this org to calculate specific MRR if we want, or just basic stats
      return {
        'Company ID': org.id,
        'Company Name': org.name,
        'Owner Email': org.owner_email || '',
        'Plan': org.plan,
        'Status': org.is_active ? 'Active' : 'Suspended',
        'Currency': org.currency.toUpperCase(),
        'Total Subscriptions': org.subscription_count || 0,
        'Signed Up': new Date(org.created_at).toISOString().split('T')[0]
      };
    });
    
    exportToCSV(exportData, `oyik_clients_export_${new Date().toISOString().split('T')[0]}.csv`);
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
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight">Admin Overview</h1>
          <p className="text-[#8b949e] text-sm mt-1">Manage all Oyik clients and view key metrics</p>
        </div>
        <Button 
          onClick={handleExportCSV}
          variant="outline"
          className="border-white/10 bg-[#161b22] text-white hover:bg-white/5"
        >
          <Download size={16} className="mr-2 text-blue-400" />
          Export CSV
        </Button>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
        {/* Total MRR */}
        <div className="bg-[#161b22] border border-white/5 rounded-xl p-6 flex flex-col justify-between group hover:border-indigo-500/30 transition-colors">
          <div className="flex justify-between items-start mb-4">
            <div className="p-2.5 rounded-lg bg-indigo-500/10 text-indigo-400 group-hover:bg-indigo-500/20 transition-colors">
              <TrendingUp size={24} />
            </div>
          </div>
          <div>
            <h3 className="text-3xl font-bold text-white tracking-tight">
              £{mrr.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </h3>
            <p className="text-sm text-[#8b949e] font-medium mt-1">Total MRR</p>
          </div>
        </div>

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

      {/* Analytics Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className="bg-[#161b22] border border-white/5 rounded-xl p-6">
          <div className="flex items-center gap-2 mb-6">
            <TrendingUp size={18} className="text-blue-400" />
            <h2 className="text-lg font-semibold text-white">MRR Growth (Cumulative)</h2>
          </div>
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={growth} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorMrr" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
                <XAxis dataKey="month" tick={{ fill: '#8b949e', fontSize: 12 }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fill: '#8b949e', fontSize: 12 }} axisLine={false} tickLine={false} tickFormatter={(v) => `£${v}`} />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#161b22', borderColor: 'rgba(255,255,255,0.1)', color: '#fff' }}
                  itemStyle={{ color: '#fff' }}
                  formatter={(value: number) => [`£${value.toFixed(2)}`, 'Cumulative MRR']}
                />
                <Area type="monotone" dataKey="mrr" stroke="#3b82f6" strokeWidth={3} fillOpacity={1} fill="url(#colorMrr)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-[#161b22] border border-white/5 rounded-xl p-6">
          <div className="flex items-center gap-2 mb-6">
            <BarChart3 size={18} className="text-purple-400" />
            <h2 className="text-lg font-semibold text-white">Subscription Trends</h2>
          </div>
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={trends} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
                <XAxis dataKey="month" tick={{ fill: '#8b949e', fontSize: 12 }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fill: '#8b949e', fontSize: 12 }} axisLine={false} tickLine={false} />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#161b22', borderColor: 'rgba(255,255,255,0.1)', color: '#fff' }}
                  cursor={{ fill: 'rgba(255,255,255,0.02)' }}
                />
                <Legend wrapperStyle={{ paddingTop: '10px' }} />
                <Bar dataKey="newSubs" name="New Subs" fill="#10b981" radius={[4, 4, 0, 0]} />
                <Bar dataKey="canceledSubs" name="Canceled Subs" fill="#ef4444" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Tables Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Recent Clients Table (Spans 2 cols) */}
        <div className="bg-[#161b22] border border-white/5 rounded-xl overflow-hidden shadow-sm lg:col-span-2">
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
                          onClick={() => {
                            if (org.is_active) {
                              setSelectedOrg(org);
                              setIsSuspendOpen(true);
                            } else {
                              handleToggleStatus(org);
                            }
                          }}
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

        {/* Top Spending Clients */}
        <div className="bg-[#161b22] border border-white/5 rounded-xl overflow-hidden shadow-sm">
          <div className="p-6 border-b border-white/5">
            <h2 className="text-lg font-semibold text-white">Top Clients by MRR</h2>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="text-xs text-[#8b949e] uppercase bg-white/[0.02] border-b border-white/5">
                <tr>
                  <th className="px-6 py-4 font-semibold">Client</th>
                  <th className="px-6 py-4 font-semibold text-right">MRR</th>
                </tr>
              </thead>
              <tbody>
                {topClients.length === 0 ? (
                  <tr>
                    <td colSpan={2} className="px-6 py-8 text-center text-[#8b949e]">
                      No active spend found.
                    </td>
                  </tr>
                ) : (
                  topClients.map((client, index) => (
                    <tr key={client.id} className="border-b border-white/5 hover:bg-white/[0.02] transition-colors">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${
                            index === 0 ? 'bg-amber-500/20 text-amber-400' :
                            index === 1 ? 'bg-slate-300/20 text-slate-300' :
                            index === 2 ? 'bg-orange-700/20 text-orange-400' :
                            'bg-white/5 text-[#8b949e]'
                          }`}>
                            {index + 1}
                          </div>
                          <div>
                            <p className="font-medium text-white">{client.name}</p>
                            <p className="text-xs text-[#8b949e] capitalize">{client.plan}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-right font-semibold text-white">
                        £{client.spend.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Suspend Confirmation Modal */}
      <AlertDialog open={isSuspendOpen} onOpenChange={setIsSuspendOpen}>
        <AlertDialogContent className="bg-[#161b22] border-white/10 text-white">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-amber-500">Suspend Organization</AlertDialogTitle>
            <AlertDialogDescription className="text-[#8b949e]">
              Are you sure you want to suspend <span className="font-bold text-white mx-1">{selectedOrg?.name}</span>? 
              They will lose access to the dashboard immediately.
            </AlertDialogDescription>
          </AlertDialogHeader>
          
          <AlertDialogFooter>
            <AlertDialogCancel className="border-white/10 text-white hover:bg-white/5 mt-0">No</AlertDialogCancel>
            <Button 
              onClick={() => {
                if (selectedOrg) {
                  handleToggleStatus(selectedOrg);
                  setIsSuspendOpen(false);
                }
              }}
              disabled={actionLoadingId === selectedOrg?.id}
              className="bg-amber-600 hover:bg-amber-700 text-white"
            >
              {actionLoadingId === selectedOrg?.id ? 'Suspending...' : 'Yes'}
            </Button>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default AdminOverview;
