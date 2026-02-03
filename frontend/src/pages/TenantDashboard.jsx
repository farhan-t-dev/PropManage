import React, { useState, useEffect, useMemo } from 'react';
import api from '../api';
import { useAuthStore } from '../store/authStore';
import { useNotificationStore } from '../store/notificationStore';
import { Calendar, DollarSign, CheckCircle2, Home, Wrench } from 'lucide-react';
import { BaseButton } from '../components/BaseButton';
import { BaseCard } from '../components/BaseCard';
import { Link } from 'react-router-dom';

const TenantDashboard = () => {
  const { user } = useAuthStore();
  const { showNotification } = useNotificationStore();
  const [bookings, setBookings] = useState([]);
  const [maintenanceRequests, setMaintenanceRequests] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchData = async () => {
    try {
      const [bRes, mRes] = await Promise.all([
        api.get('/bookings/'),
        api.get('/maintenance/requests/')
      ]);
      setBookings(bRes.data.results || bRes.data);
      setMaintenanceRequests(mRes.data.results || mRes.data);
    } catch (err) {
      showNotification('Failed to load portal data', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const stats = useMemo(() => {
    const active = bookings.filter(b => b.status === 'confirmed').length;
    const totalSpent = bookings.filter(b => b.invoice?.status === 'paid')
      .reduce((acc, curr) => acc + parseFloat(curr.total_price), 0);
    return { active, totalSpent };
  }, [bookings]);

  const payInvoice = async (invoiceId) => {
    try {
      await api.post(`/billing/invoices/${invoiceId}/pay/`);
      showNotification('Payment successful!', 'success');
      fetchData();
    } catch (err) {
      showNotification('Payment failed', 'error');
    }
  };

  return (
    <div className="space-y-10 animate-fade-in">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-4xl font-black text-surface-900 tracking-tight">Resident Portal</h1>
          <p className="text-surface-500 font-medium">Welcome back, {user?.first_name}.</p>
        </div>
        <Link to="/discover">
          <BaseButton size="lg">Book New Stay</BaseButton>
        </Link>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
         <BaseCard padding="lg" className="flex items-center gap-6">
            <div className="w-16 h-16 bg-brand-50 rounded-2xl flex items-center justify-center text-brand-600">
               <Calendar className="w-8 h-8" />
            </div>
            <div>
               <div className="text-[10px] font-black text-surface-400 uppercase tracking-widest mb-1">Active Stays</div>
               <div className="text-3xl font-black text-surface-900">{stats.active}</div>
            </div>
         </BaseCard>
         <BaseCard padding="lg" className="flex items-center gap-6">
            <div className="w-16 h-16 bg-emerald-50 rounded-2xl flex items-center justify-center text-emerald-600">
               <DollarSign className="w-8 h-8" />
            </div>
            <div>
               <div className="text-[10px] font-black text-surface-400 uppercase tracking-widest mb-1">Total Investment</div>
               <div className="text-3xl font-black text-surface-900">${stats.totalSpent.toLocaleString()}</div>
            </div>
         </BaseCard>
      </div>

      <div className="grid lg:grid-cols-3 gap-8">
         <div className="lg:col-span-2 space-y-6">
            <h2 className="text-xl font-bold text-surface-900 px-2">Active Reservations</h2>
            {bookings.length === 0 ? (
              <BaseCard className="py-20 text-center text-surface-400">No bookings found.</BaseCard>
            ) : (
              <div className="space-y-4">
                {bookings.map(b => (
                  <BaseCard key={b.id} padding="lg" hover>
                    <div className="flex justify-between items-start mb-6">
                       <div>
                          <div className="text-[10px] font-black text-brand-500 uppercase tracking-widest mb-1">{b.unit_details.property_title}</div>
                          <h3 className="text-xl font-bold text-surface-900">{b.unit_details.title}</h3>
                       </div>
                       <span className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest ${
                         b.status === 'confirmed' ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'
                       }`}>{b.status}</span>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4 mb-8">
                       <div className="p-4 bg-surface-50 rounded-2xl">
                          <div className="text-[10px] font-black text-surface-400 uppercase tracking-widest mb-1">Check-in</div>
                          <div className="text-sm font-bold text-surface-900">{b.start_date}</div>
                       </div>
                       <div className="p-4 bg-surface-50 rounded-2xl">
                          <div className="text-[10px] font-black text-surface-400 uppercase tracking-widest mb-1">Check-out</div>
                          <div className="text-sm font-bold text-surface-900">{b.end_date}</div>
                       </div>
                    </div>

                    {b.invoice && (
                      <div className="flex items-center justify-between pt-6 border-t border-surface-50">
                         <div>
                            <div className="text-xs font-bold text-surface-400 mb-1">Total Stay Value</div>
                            <div className="text-xl font-black text-surface-900">${b.total_price}</div>
                         </div>
                         {b.invoice.status === 'paid' ? (
                           <div className="text-emerald-600 font-bold text-sm flex items-center gap-2">
                              <CheckCircle2 className="w-5 h-5" /> Payment Verified
                           </div>
                         ) : (
                           <BaseButton onClick={() => payInvoice(b.invoice.id)}>Pay Invoice</BaseButton>
                         )}
                      </div>
                    )}
                  </BaseCard>
                ))}
              </div>
            )}
         </div>

         <div className="space-y-6">
            <h2 className="text-xl font-bold text-surface-900 px-2">Maintenance</h2>
            <BaseCard className="space-y-6">
               {maintenanceRequests.length === 0 ? (
                 <p className="text-center text-surface-400 text-sm py-4">No active requests.</p>
               ) : (
                 maintenanceRequests.slice(0, 3).map(req => (
                   <div key={req.id} className="flex items-center gap-4">
                      <div className="w-10 h-10 bg-surface-50 rounded-xl flex items-center justify-center text-surface-400">
                         <Wrench className="w-5 h-5" />
                      </div>
                      <div className="flex-1">
                         <div className="text-sm font-bold text-surface-900 line-clamp-1">{req.title}</div>
                         <div className="text-[10px] font-black text-amber-600 uppercase tracking-widest">{req.status}</div>
                      </div>
                   </div>
                 ))
               )}
               <BaseButton variant="secondary" className="w-full text-sm">View All Tickets</BaseButton>
            </BaseCard>
         </div>
      </div>
    </div>
  );
};

export default TenantDashboard;