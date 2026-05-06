import React, { useState, useEffect } from 'react';
import { 
  Search, 
  Bot, Workflow, Phone, MessageSquare, Globe, FileText, Brain, Palette, Database, Image,
  ChevronDown, ChevronUp, CreditCard, Calendar, Tag, Clock, Building2
} from 'lucide-react';
import { fetchAllOrgs, fetchOrgSubscriptions } from '../../lib/admin-api';
import { Input } from '../../components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../../components/ui/select";
import { toast } from 'sonner';
import { getDaysRemaining } from '../../lib/subscription-utils';

const iconMap: Record<string, React.ElementType> = {
  Bot, Workflow, Phone, MessageSquare, Globe, FileText, Brain, Palette, Database, Image,
};

type AdminSubRow = {
  id: string;
  platform: string;
  icon: string;
  amount: number;
  currency: string;
  billing_cycle: string;
  status: string;
  billing_day: number;
  next_payment_date: string | null;
  payment_source: string;
  subscription_date: string;
  plan_type: string;
  
  // Attached org data
  companyName: string;
  companyPlan: string;
  orgId: string;
  daysLeft: number;
};

const AdminSubscriptions: React.FC = () => {
  const [subs, setSubs] = useState<AdminSubRow[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  
  // Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [planFilter, setPlanFilter] = useState('all');

  // Expanded rows
  const [expandedRows, setExpandedRows] = useState<Set<string>>(new Set());

  useEffect(() => {
    const loadData = async () => {
      try {
        setIsLoading(true);
        const orgs = await fetchAllOrgs();
        
        let allSubs: AdminSubRow[] = [];
        
        await Promise.all(orgs.map(async (org) => {
          const orgSubs = await fetchOrgSubscriptions(org.id);
          const mappedSubs = orgSubs.map((sub: any) => ({
            ...sub,
            companyName: org.name,
            companyPlan: org.plan,
            orgId: org.id,
            currency: org.currency || 'gbp',
            daysLeft: getDaysRemaining(sub.billing_day, sub.next_payment_date)
          }));
          allSubs = [...allSubs, ...mappedSubs];
        }));

        // Sort by days left ascending by default
        allSubs.sort((a, b) => a.daysLeft - b.daysLeft);
        
        setSubs(allSubs);
      } catch (err) {
        console.error("Failed to load subscriptions", err);
        toast.error("Failed to load subscriptions");
      } finally {
        setIsLoading(false);
      }
    };

    loadData();
  }, []);

  const toggleRow = (id: string) => {
    const newExpanded = new Set(expandedRows);
    if (newExpanded.has(id)) {
      newExpanded.delete(id);
    } else {
      newExpanded.add(id);
    }
    setExpandedRows(newExpanded);
  };

  const filteredSubs = subs.filter(sub => {
    const matchesSearch = sub.platform.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          sub.companyName.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === 'all' || sub.status === statusFilter;
    const matchesPlan = planFilter === 'all' || sub.companyPlan === planFilter;
    
    return matchesSearch && matchesStatus && matchesPlan;
  });

  const formatCurrency = (amount: number, currency: string) => {
    const symbol = currency === 'usd' ? '$' : '£';
    return `${symbol}${amount.toFixed(2)}`;
  };

  const formatDate = (dateStr: string | null) => {
    if (!dateStr) return 'N/A';
    return new Date(dateStr).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500 pb-20">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold text-white tracking-tight">All Subscriptions</h1>
            {!isLoading && (
              <span className="px-2.5 py-0.5 rounded-full bg-white/10 text-white text-xs font-medium">
                {subs.length} total
              </span>
            )}
          </div>
          <p className="text-[#8b949e] text-sm mt-1">Monitor all active and canceled subscriptions across clients</p>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="bg-[#161b22] border border-white/5 rounded-xl p-4 flex flex-col md:flex-row gap-4">
        <div className="relative flex-1">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Search className="h-4 w-4 text-[#8b949e]" />
          </div>
          <Input
            type="text"
            placeholder="Search platform or client..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9 h-10 bg-background border-white/10 text-white focus-visible:ring-1 focus-visible:ring-rose-500"
          />
        </div>
        
        <div className="flex gap-4 w-full md:w-auto">
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-full md:w-40 bg-background border-white/10 text-white">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent className="bg-[#161b22] border-white/10 text-white">
              <SelectItem value="all">All Statuses</SelectItem>
              <SelectItem value="active">Active</SelectItem>
              <SelectItem value="canceled">Canceled</SelectItem>
            </SelectContent>
          </Select>

          <Select value={planFilter} onValueChange={setPlanFilter}>
            <SelectTrigger className="w-full md:w-40 bg-background border-white/10 text-white">
              <SelectValue placeholder="Client Plan" />
            </SelectTrigger>
            <SelectContent className="bg-[#161b22] border-white/10 text-white">
              <SelectItem value="all">All Plans</SelectItem>
              <SelectItem value="free">Free</SelectItem>
              <SelectItem value="pro">Pro</SelectItem>
              <SelectItem value="enterprise">Enterprise</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Table */}
      <div className="bg-[#161b22] border border-white/5 rounded-xl shadow-sm overflow-hidden">
        <div className="overflow-x-auto min-h-[400px]">
          <table className="w-full text-sm text-left whitespace-nowrap">
            <thead className="text-xs text-[#8b949e] uppercase bg-white/[0.02] border-b border-white/5">
              <tr>
                <th className="px-6 py-4 font-semibold">Platform</th>
                <th className="px-6 py-4 font-semibold">Company</th>
                <th className="px-6 py-4 font-semibold text-right">Amount</th>
                <th className="px-6 py-4 font-semibold">Cycle</th>
                <th className="px-6 py-4 font-semibold">Status</th>
                <th className="px-6 py-4 font-semibold text-center">Days Left</th>
                <th className="px-6 py-4 font-semibold">Next Payment</th>
                <th className="px-6 py-4 font-semibold">Source</th>
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                Array.from({ length: 5 }).map((_, i) => (
                  <tr key={i} className="border-b border-white/5">
                    <td className="px-6 py-5"><div className="h-6 w-32 bg-white/5 rounded animate-pulse"></div></td>
                    <td className="px-6 py-5"><div className="h-4 w-24 bg-white/5 rounded animate-pulse"></div></td>
                    <td className="px-6 py-5"><div className="h-4 w-16 bg-white/5 rounded ml-auto animate-pulse"></div></td>
                    <td className="px-6 py-5"><div className="h-4 w-16 bg-white/5 rounded animate-pulse"></div></td>
                    <td className="px-6 py-5"><div className="h-5 w-16 bg-white/5 rounded-full animate-pulse"></div></td>
                    <td className="px-6 py-5"><div className="h-4 w-8 bg-white/5 rounded mx-auto animate-pulse"></div></td>
                    <td className="px-6 py-5"><div className="h-4 w-24 bg-white/5 rounded animate-pulse"></div></td>
                    <td className="px-6 py-5"><div className="h-4 w-20 bg-white/5 rounded animate-pulse"></div></td>
                  </tr>
                ))
              ) : filteredSubs.length === 0 ? (
                <tr>
                  <td colSpan={8} className="px-6 py-12 text-center text-[#8b949e]">
                    <div className="flex flex-col items-center justify-center">
                      <CreditCard className="h-12 w-12 text-white/10 mb-4" />
                      <p>No subscriptions found.</p>
                    </div>
                  </td>
                </tr>
              ) : (
                filteredSubs.map((sub) => {
                  const Icon = iconMap[sub.icon || ""] || Bot;
                  const isExpanded = expandedRows.has(sub.id);
                  
                  return (
                    <React.Fragment key={sub.id}>
                      <tr 
                        className={`border-b border-white/5 hover:bg-white/[0.02] transition-colors cursor-pointer ${isExpanded ? 'bg-white/[0.02]' : ''}`}
                        onClick={() => toggleRow(sub.id)}
                      >
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-lg bg-indigo-500/10 flex items-center justify-center text-indigo-400">
                              <Icon size={16} />
                            </div>
                            <span className="font-medium text-white">{sub.platform}</span>
                            {isExpanded ? <ChevronUp size={14} className="text-[#8b949e]" /> : <ChevronDown size={14} className="text-[#8b949e]" />}
                          </div>
                        </td>
                        <td className="px-6 py-4 text-[#8b949e]">
                          {sub.companyName}
                        </td>
                        <td className="px-6 py-4 font-medium text-white text-right">
                          {formatCurrency(sub.amount, sub.currency)}
                        </td>
                        <td className="px-6 py-4 capitalize text-[#8b949e]">
                          {sub.billing_cycle}
                        </td>
                        <td className="px-6 py-4">
                          <span className={`px-2.5 py-1 text-xs font-medium rounded-full border ${
                            sub.status === 'active' 
                              ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' 
                              : 'bg-rose-500/10 text-rose-400 border-rose-500/20'
                          }`}>
                            {sub.status === 'active' ? 'Active' : 'Canceled'}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-center font-medium">
                          <span className={sub.daysLeft <= 7 && sub.status === 'active' ? 'text-amber-400' : 'text-[#8b949e]'}>
                            {sub.status === 'active' ? `${sub.daysLeft}d` : '-'}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-[#8b949e]">
                          {formatDate(sub.next_payment_date)}
                        </td>
                        <td className="px-6 py-4 text-[#8b949e]">
                          {sub.payment_source || 'N/A'}
                        </td>
                      </tr>
                      {isExpanded && (
                        <tr className="border-b border-white/5 bg-background/50">
                          <td colSpan={8} className="p-0">
                            <div className="px-6 py-6 overflow-hidden">
                              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                                <div className="rounded-xl border border-white/[0.06] bg-[#161b22] p-4">
                                  <div className="flex items-center gap-2 mb-2">
                                    <Tag size={14} className="text-[#8b949e]" />
                                    <span className="text-xs text-[#8b949e]">Sub Plan Type</span>
                                  </div>
                                  <p className="text-sm font-semibold text-white capitalize">{sub.plan_type.replace('_', ' ')}</p>
                                </div>
                                <div className="rounded-xl border border-white/[0.06] bg-[#161b22] p-4">
                                  <div className="flex items-center gap-2 mb-2">
                                    <Building2 size={14} className="text-[#8b949e]" />
                                    <span className="text-xs text-[#8b949e]">Client Plan</span>
                                  </div>
                                  <p className="text-sm font-semibold text-white capitalize">{sub.companyPlan}</p>
                                </div>
                                <div className="rounded-xl border border-white/[0.06] bg-[#161b22] p-4">
                                  <div className="flex items-center gap-2 mb-2">
                                    <Calendar size={14} className="text-[#8b949e]" />
                                    <span className="text-xs text-[#8b949e]">Signed Up</span>
                                  </div>
                                  <p className="text-sm font-semibold text-white">{formatDate(sub.subscription_date)}</p>
                                </div>
                                <div className="rounded-xl border border-white/[0.06] bg-[#161b22] p-4">
                                  <div className="flex items-center gap-2 mb-2">
                                    <Clock size={14} className="text-[#8b949e]" />
                                    <span className="text-xs text-[#8b949e]">Billing Day</span>
                                  </div>
                                  <p className="text-sm font-semibold text-white">{sub.billing_day}th</p>
                                </div>
                              </div>
                            </div>
                          </td>
                        </tr>
                      )}
                    </React.Fragment>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default AdminSubscriptions;
