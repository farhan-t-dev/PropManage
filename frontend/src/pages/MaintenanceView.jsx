import React, { useState, useEffect } from 'react';
import api from '../api';
import { useAuthStore } from '../store/authStore';
import { useNotificationStore } from '../store/notificationStore';
import { 
  Wrench, Clock, CheckCircle2, AlertCircle, Plus, 
  ChevronRight, DollarSign
} from 'lucide-react';
import { BaseButton } from '../components/BaseButton';
import { BaseCard } from '../components/BaseCard';

const MaintenanceView = () => {
  const { user } = useAuthStore();
  const { showNotification } = useNotificationStore();
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [updatingId, setUpdatingId] = useState(null);
  const [costs, setCosts] = useState({}); // Track cost per item

  const fetchRequests = async () => {
    try {
      const res = await api.get('/maintenance/requests/');
      setRequests(Array.isArray(res.data) ? res.data : res.data.results || []);
    } catch (err) {
      showNotification('Failed to load tickets', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRequests();
  }, []);

  const handleStatusChange = async (id, action, data = {}) => {
    setUpdatingId(id);
    try {
      await api.post(`/maintenance/requests/${id}/${action}/`, data);
      showNotification(`Ticket updated: ${action.replace('_', ' ')}`, 'success');
      await fetchRequests();
    } catch (err) {
      showNotification('Transition not allowed or missing data', 'error');
    } finally {
      setUpdatingId(null);
    }
  };

  const handleCostChange = (id, val) => {
    setCosts(prev => ({ ...prev, [id]: val }));
  };

  return (
    <div className="space-y-8 animate-fade-in">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-4xl font-black text-surface-900 tracking-tight">Maintenance</h1>
          <p className="text-surface-500 font-medium">Manage and track property repairs</p>
        </div>
        {user?.role === 'tenant' && (
          <BaseButton icon={Plus} onClick={() => setShowCreateModal(true)}>New Request</BaseButton>
        )}
      </div>

      <div className="grid gap-6">
        {loading ? (
          <div className="py-20 text-center">Loading tickets...</div>
        ) : requests.length === 0 ? (
          <BaseCard className="py-20 text-center text-surface-400">No active maintenance requests.</BaseCard>
        ) : (
          requests.map(req => (
            <BaseCard key={req.id} padding="none" hover className="overflow-hidden">
               <div className="flex flex-col md:flex-row">
                  <div className={`w-2 md:w-3 ${
                    req.status === 'resolved' ? 'bg-emerald-500' : 
                    req.status === 'in_progress' ? 'bg-brand-500' : 'bg-amber-500'
                  }`} />
                  
                  <div className="flex-1 p-8 flex flex-col md:flex-row md:items-center justify-between gap-8">
                     <div className="space-y-2">
                        <div className="flex items-center gap-3">
                           <span className="text-[10px] font-black text-surface-400 uppercase tracking-widest">#{req.id}</span>
                           <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest ${
                             req.priority === 'high' || req.priority === 'emergency' ? 'bg-red-50 text-red-600' : 'bg-surface-50 text-surface-600'
                           }`}>{req.priority}</span>
                        </div>
                        <h3 className="text-xl font-bold text-surface-900">{req.title}</h3>
                        <p className="text-sm text-surface-500 max-w-xl">{req.description}</p>
                        <div className="flex items-center gap-4 pt-2">
                           <div className="flex items-center gap-1.5 text-xs font-bold text-surface-400 uppercase">
                              <Clock className="w-3.5 h-3.5" /> {new Date(req.created_at).toLocaleDateString()}
                           </div>
                           {req.cost && (
                             <div className="flex items-center gap-1.5 text-xs font-black text-emerald-600 uppercase">
                                <DollarSign className="w-3.5 h-3.5" /> Cost: ${req.cost}
                             </div>
                           )}
                        </div>
                     </div>

                     <div className="flex flex-wrap items-center gap-3">
                        {user?.role === 'landlord' && (
                           <>
                              {req.status === 'pending' && (
                                <BaseButton 
                                   size="sm" 
                                   loading={updatingId === req.id} 
                                   onClick={() => handleStatusChange(req.id, 'start_work')}
                                >
                                   Start Work
                                </BaseButton>
                              )}
                              {req.status === 'in_progress' && (
                                <div className="flex items-center gap-2">
                                   <input 
                                      type="number" 
                                      placeholder="Cost" 
                                      className="w-24 px-3 py-2 text-sm border border-surface-200 rounded-xl outline-none focus:border-brand-500"
                                      value={costs[req.id] || ''}
                                      onChange={(e) => handleCostChange(req.id, e.target.value)}
                                   />
                                   <BaseButton 
                                      size="sm" 
                                      loading={updatingId === req.id} 
                                      onClick={() => handleStatusChange(req.id, 'resolve', { cost: costs[req.id] })}
                                   >
                                      Resolve
                                   </BaseButton>
                                </div>
                              )}
                           </>
                        )}
                        <span className={`flex items-center gap-2 px-4 py-2 rounded-2xl text-sm font-bold ${
                          req.status === 'resolved' ? 'text-emerald-600 bg-emerald-50' : 
                          req.status === 'in_progress' ? 'text-brand-600 bg-brand-50' : 'text-amber-600 bg-amber-50'
                        }`}>
                           {req.status === 'resolved' ? <CheckCircle2 className="w-4 h-4" /> : 
                            req.status === 'in_progress' ? <Wrench className="w-4 h-4" /> : <AlertCircle className="w-4 h-4" />}
                           {req.status.replace('_', ' ')}
                        </span>
                     </div>
                  </div>
               </div>
            </BaseCard>
          ))
        )}
      </div>
    </div>
  );
};

export default MaintenanceView;