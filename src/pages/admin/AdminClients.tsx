import React, { useState, useEffect } from 'react';
import { 
  Search, 
  MoreHorizontal, 
  Eye, 
  Settings, 
  Power, 
  PowerOff, 
  Trash2,
  Building2
} from 'lucide-react';
import { fetchAllOrgs, fetchOrgSubscriptions, suspendOrg, activateOrg, updateOrgPlan, deleteOrg } from '../../lib/admin-api';
import { OrgWithStats } from '../../lib/admin-types';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { toast } from 'sonner';

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "../../components/ui/dropdown-menu";

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "../../components/ui/alert-dialog";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "../../components/ui/dialog";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../../components/ui/select";

const AdminClients: React.FC = () => {
  const [orgs, setOrgs] = useState<OrgWithStats[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  
  // Modals state
  const [selectedOrg, setSelectedOrg] = useState<OrgWithStats | null>(null);
  
  // View Subs state
  const [isSubsOpen, setIsSubsOpen] = useState(false);
  const [subsData, setSubsData] = useState<any[]>([]);
  const [isSubsLoading, setIsSubsLoading] = useState(false);

  // Change Plan state
  const [isPlanOpen, setIsPlanOpen] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState<string>('');
  const [isPlanUpdating, setIsPlanUpdating] = useState(false);

  // Delete state
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [deleteConfirmText, setDeleteConfirmText] = useState('');
  const [isDeleting, setIsDeleting] = useState(false);

  // General action loading state for suspend/activate
  const [isActionLoading, setIsActionLoading] = useState<string | null>(null);

  const loadData = async () => {
    try {
      setIsLoading(true);
      const data = await fetchAllOrgs();
      setOrgs(data);
    } catch (err: any) {
      console.error('Error loading clients:', err);
      toast.error('Failed to load clients');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const filteredOrgs = orgs.filter(org => 
    org.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleToggleStatus = async (org: OrgWithStats) => {
    try {
      setIsActionLoading(org.id);
      if (org.is_active) {
        await suspendOrg(org.id);
        toast.success(`Suspended ${org.name}`);
      } else {
        await activateOrg(org.id);
        toast.success(`Activated ${org.name}`);
      }
      await loadData();
    } catch (err: any) {
      console.error('Status toggle error:', err);
      toast.error(err.message || 'Failed to update status');
    } finally {
      setIsActionLoading(null);
    }
  };

  const openSubsModal = async (org: OrgWithStats) => {
    setSelectedOrg(org);
    setIsSubsOpen(true);
    setIsSubsLoading(true);
    try {
      const subs = await fetchOrgSubscriptions(org.id);
      setSubsData(subs);
    } catch (err: any) {
      toast.error('Failed to load subscriptions');
    } finally {
      setIsSubsLoading(false);
    }
  };

  const openPlanModal = (org: OrgWithStats) => {
    setSelectedOrg(org);
    setSelectedPlan(org.plan);
    setIsPlanOpen(true);
  };

  const handleUpdatePlan = async () => {
    if (!selectedOrg || !selectedPlan || selectedPlan === selectedOrg.plan) {
      setIsPlanOpen(false);
      return;
    }
    
    setIsPlanUpdating(true);
    try {
      await updateOrgPlan(selectedOrg.id, selectedPlan);
      toast.success('Plan updated successfully');
      await loadData();
      setIsPlanOpen(false);
    } catch (err: any) {
      toast.error(err.message || 'Failed to update plan');
    } finally {
      setIsPlanUpdating(false);
    }
  };

  const openDeleteModal = (org: OrgWithStats) => {
    setSelectedOrg(org);
    setDeleteConfirmText('');
    setIsDeleteOpen(true);
  };

  const handleDelete = async () => {
    if (!selectedOrg) return;
    
    setIsDeleting(true);
    try {
      await deleteOrg(selectedOrg.id);
      toast.success(`${selectedOrg.name} deleted successfully`);
      await loadData();
      setIsDeleteOpen(false);
    } catch (err: any) {
      toast.error(err.message || 'Failed to delete client');
    } finally {
      setIsDeleting(false);
    }
  };

  const getPlanBadgeClasses = (plan: string) => {
    switch(plan) {
      case 'pro': return 'bg-blue-500/10 text-blue-400 border-blue-500/20';
      case 'enterprise': return 'bg-purple-500/10 text-purple-400 border-purple-500/20';
      default: return 'bg-slate-500/10 text-slate-400 border-slate-500/20';
    }
  };

  const formatDate = (dateStr: string) => {
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
            <h1 className="text-2xl font-bold text-white tracking-tight">All Clients</h1>
            {!isLoading && (
              <span className="px-2.5 py-0.5 rounded-full bg-white/10 text-white text-xs font-medium">
                {orgs.length} total
              </span>
            )}
          </div>
          <p className="text-[#8b949e] text-sm mt-1">Manage and monitor all organizations</p>
        </div>
        
        <div className="relative w-full sm:w-72">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Search className="h-4 w-4 text-[#8b949e]" />
          </div>
          <Input
            type="text"
            placeholder="Search by company name..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9 h-10 bg-[#161b22] border-white/10 text-white placeholder:text-[#8b949e] focus-visible:ring-1 focus-visible:ring-rose-500"
          />
        </div>
      </div>

      <div className="bg-[#161b22] border border-white/5 rounded-xl shadow-sm overflow-hidden">
        <div className="overflow-x-auto min-h-[400px]">
          <table className="w-full text-sm text-left whitespace-nowrap">
            <thead className="text-xs text-[#8b949e] uppercase bg-white/[0.02] border-b border-white/5">
              <tr>
                <th className="px-6 py-4 font-semibold">Company Name</th>
                <th className="px-6 py-4 font-semibold">Owner Email</th>
                <th className="px-6 py-4 font-semibold">Plan</th>
                <th className="px-6 py-4 font-semibold">Status</th>
                <th className="px-6 py-4 font-semibold text-center">Subs</th>
                <th className="px-6 py-4 font-semibold">Signed Up</th>
                <th className="px-6 py-4 font-semibold text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                Array.from({ length: 5 }).map((_, i) => (
                  <tr key={i} className="border-b border-white/5">
                    <td className="px-6 py-5"><div className="h-4 w-32 bg-white/5 rounded animate-pulse"></div></td>
                    <td className="px-6 py-5"><div className="h-4 w-48 bg-white/5 rounded animate-pulse"></div></td>
                    <td className="px-6 py-5"><div className="h-5 w-16 bg-white/5 rounded-full animate-pulse"></div></td>
                    <td className="px-6 py-5"><div className="h-5 w-16 bg-white/5 rounded-full animate-pulse"></div></td>
                    <td className="px-6 py-5"><div className="h-4 w-8 bg-white/5 rounded mx-auto animate-pulse"></div></td>
                    <td className="px-6 py-5"><div className="h-4 w-24 bg-white/5 rounded animate-pulse"></div></td>
                    <td className="px-6 py-5"><div className="h-8 w-8 bg-white/5 rounded ml-auto animate-pulse"></div></td>
                  </tr>
                ))
              ) : filteredOrgs.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-6 py-12 text-center text-[#8b949e]">
                    <div className="flex flex-col items-center justify-center">
                      <Building2 className="h-12 w-12 text-white/10 mb-4" />
                      <p>No clients found matching "{searchQuery}"</p>
                    </div>
                  </td>
                </tr>
              ) : (
                filteredOrgs.map((org) => (
                  <tr key={org.id} className="border-b border-white/5 hover:bg-white/[0.02] transition-colors">
                    <td className="px-6 py-4 font-medium text-white">
                      {org.name}
                    </td>
                    <td className="px-6 py-4 text-[#8b949e]">
                      {org.owner_email || 'N/A'}
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-2.5 py-1 text-xs font-medium rounded-full border capitalize ${getPlanBadgeClasses(org.plan)}`}>
                        {org.plan}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-2.5 py-1 text-xs font-medium rounded-full border ${
                        org.is_active 
                          ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' 
                          : 'bg-rose-500/10 text-rose-400 border-rose-500/20'
                      }`}>
                        {org.is_active ? 'Active' : 'Suspended'}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-center font-medium text-white">
                      {org.subscription_count || 0}
                    </td>
                    <td className="px-6 py-4 text-[#8b949e]">
                      {formatDate(org.created_at)}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="sm" className="h-8 w-8 p-0 text-[#8b949e] hover:text-white">
                            <span className="sr-only">Open menu</span>
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-48 bg-[#161b22] border-white/10 text-white">
                          <DropdownMenuItem className="cursor-pointer hover:bg-white/10" onClick={() => openSubsModal(org)}>
                            <Eye className="mr-2 h-4 w-4" />
                            View Subscriptions
                          </DropdownMenuItem>
                          <DropdownMenuItem className="cursor-pointer hover:bg-white/10" onClick={() => openPlanModal(org)}>
                            <Settings className="mr-2 h-4 w-4" />
                            Change Plan
                          </DropdownMenuItem>
                          
                          <DropdownMenuSeparator className="bg-white/10" />
                          
                          {org.is_active ? (
                            <DropdownMenuItem 
                              className="cursor-pointer text-amber-400 hover:bg-amber-500/10 focus:text-amber-400 focus:bg-amber-500/10"
                              onClick={() => {
                                if (window.confirm(`Are you sure you want to suspend ${org.name}? They will lose access immediately.`)) {
                                  handleToggleStatus(org);
                                }
                              }}
                              disabled={isActionLoading === org.id}
                            >
                              <PowerOff className="mr-2 h-4 w-4" />
                              Suspend Account
                            </DropdownMenuItem>
                          ) : (
                            <DropdownMenuItem 
                              className="cursor-pointer text-emerald-400 hover:bg-emerald-500/10 focus:text-emerald-400 focus:bg-emerald-500/10"
                              onClick={() => handleToggleStatus(org)}
                              disabled={isActionLoading === org.id}
                            >
                              <Power className="mr-2 h-4 w-4" />
                              Activate Account
                            </DropdownMenuItem>
                          )}
                          
                          <DropdownMenuSeparator className="bg-white/10" />
                          
                          <DropdownMenuItem 
                            className="cursor-pointer text-rose-400 hover:bg-rose-500/10 focus:text-rose-400 focus:bg-rose-500/10"
                            onClick={() => openDeleteModal(org)}
                          >
                            <Trash2 className="mr-2 h-4 w-4" />
                            Delete Client
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Subscriptions Modal */}
      <Dialog open={isSubsOpen} onOpenChange={setIsSubsOpen}>
        <DialogContent className="bg-[#161b22] border-white/10 text-white max-w-3xl">
          <DialogHeader>
            <DialogTitle>Subscriptions for {selectedOrg?.name}</DialogTitle>
          </DialogHeader>
          <div className="max-h-[60vh] overflow-y-auto mt-4">
            {isSubsLoading ? (
              <div className="flex justify-center p-8"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-rose-500"></div></div>
            ) : subsData.length === 0 ? (
              <p className="text-center text-[#8b949e] py-8">No subscriptions found for this client.</p>
            ) : (
              <table className="w-full text-sm text-left">
                <thead className="text-xs text-[#8b949e] uppercase border-b border-white/10">
                  <tr>
                    <th className="pb-3 font-medium">Platform</th>
                    <th className="pb-3 font-medium">Status</th>
                    <th className="pb-3 font-medium text-right">Cost</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {subsData.map(sub => (
                    <tr key={sub.id}>
                      <td className="py-3 font-medium">{sub.platform}</td>
                      <td className="py-3">
                        <span className={`px-2 py-0.5 text-[10px] uppercase font-bold rounded ${
                          sub.status === 'active' ? 'bg-emerald-500/10 text-emerald-400' : 
                          sub.status === 'canceled' ? 'bg-rose-500/10 text-rose-400' : 
                          'bg-amber-500/10 text-amber-400'
                        }`}>
                          {sub.status}
                        </span>
                      </td>
                      <td className="py-3 text-right">{selectedOrg?.currency === 'usd' ? '$' : '£'}{sub.amount}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </DialogContent>
      </Dialog>

      {/* Change Plan Modal */}
      <Dialog open={isPlanOpen} onOpenChange={setIsPlanOpen}>
        <DialogContent className="bg-[#161b22] border-white/10 text-white sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Change Plan: {selectedOrg?.name}</DialogTitle>
          </DialogHeader>
          <div className="py-4">
            <Select value={selectedPlan} onValueChange={setSelectedPlan}>
              <SelectTrigger className="w-full bg-background border-white/10 text-white">
                <SelectValue placeholder="Select a plan" />
              </SelectTrigger>
              <SelectContent className="bg-[#161b22] border-white/10 text-white">
                <SelectItem value="free">Free Plan</SelectItem>
                <SelectItem value="pro">Pro Plan</SelectItem>
                <SelectItem value="enterprise">Enterprise Plan</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsPlanOpen(false)} className="border-white/10 text-white hover:bg-white/5">Cancel</Button>
            <Button onClick={handleUpdatePlan} disabled={isPlanUpdating || selectedPlan === selectedOrg?.plan} className="bg-rose-600 hover:bg-rose-700 text-white">
              {isPlanUpdating ? 'Saving...' : 'Save Changes'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Modal */}
      <AlertDialog open={isDeleteOpen} onOpenChange={setIsDeleteOpen}>
        <AlertDialogContent className="bg-[#161b22] border-white/10 text-white">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-rose-500">Delete Organization</AlertDialogTitle>
            <AlertDialogDescription className="text-[#8b949e]">
              This action cannot be undone. This will permanently delete 
              <span className="font-bold text-white mx-1">{selectedOrg?.name}</span> 
              and remove all of their data, subscriptions, and billing history from our servers.
            </AlertDialogDescription>
          </AlertDialogHeader>
          
          <div className="my-4 space-y-2">
            <label className="text-sm font-medium text-white">
              Please type <span className="font-bold font-mono bg-white/10 px-1 py-0.5 rounded select-all">{selectedOrg?.name}</span> to confirm.
            </label>
            <Input
              value={deleteConfirmText}
              onChange={(e) => setDeleteConfirmText(e.target.value)}
              className="bg-background border-rose-500/30 focus-visible:ring-rose-500"
              placeholder={selectedOrg?.name}
            />
          </div>

          <AlertDialogFooter>
            <AlertDialogCancel className="border-white/10 text-white hover:bg-white/5 mt-0">Cancel</AlertDialogCancel>
            <Button 
              variant="destructive" 
              onClick={handleDelete}
              disabled={isDeleting || deleteConfirmText !== selectedOrg?.name}
              className="bg-rose-600 hover:bg-rose-700 text-white"
            >
              {isDeleting ? 'Deleting...' : 'Permanently Delete'}
            </Button>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default AdminClients;
