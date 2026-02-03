import React, { useState, useEffect, useMemo } from 'react';
import api from '../api';
import { useAuthStore } from '../store/authStore';
import { useNotificationStore } from '../store/notificationStore';
import { Line } from 'react-chartjs-2';
import { 
  TrendingUp, Users, Wrench, Plus, Download, MoreVertical, 
  ArrowUpRight, Calendar, DollarSign, Home as HomeIcon
} from 'lucide-react';
import { BaseButton } from '../components/BaseButton';
import { BaseCard } from '../components/BaseCard';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
} from 'chart.js';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

import DocumentVault from '../components/DocumentVault';

const LandlordDashboard = () => {
  const { user } = useAuthStore();
  const { showNotification } = useNotificationStore();
  const [bookings, setBookings] = useState([]);
  const [units, setUnits] = useState([]);
  const [maintenanceCount, setMaintenanceCount] = useState(0);
  const [revenueData, setRevenueData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [processingId, setProcessingId] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [bookingsRes, unitsRes, revRes, maintRes] = await Promise.all([
          api.get('/bookings/my_properties_bookings/'),
          api.get('/units/'),
          api.get('/bookings/monthly_revenue/'),
          api.get('/maintenance/requests/')
        ]);
        
        setBookings(Array.isArray(bookingsRes.data) ? bookingsRes.data : bookingsRes.data.results || []);
        setUnits(Array.isArray(unitsRes.data) ? unitsRes.data : unitsRes.data.results || []);
        setRevenueData(Array.isArray(revRes.data) ? revRes.data : []);
        
        const maintData = Array.isArray(maintRes.data) ? maintRes.data : maintRes.data.results || [];
        setMaintenanceCount(maintData.filter(r => r.status !== 'resolved').length);
      } catch (err) {
        console.error('Dashboard Fetch Error:', err);
        showNotification('Failed to load dashboard data', 'error');
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const stats = useMemo(() => {
    const totalEarned = (revenueData || []).reduce((acc, curr) => acc + parseFloat(curr.revenue || 0), 0);
    const occupancy = units.length > 0 
      ? Math.round((bookings.filter(b => b.status === 'confirmed').length / units.length) * 100) 
      : 0;
    return { totalEarned, occupancy, pendingTickets: maintenanceCount };
  }, [revenueData, units, bookings, maintenanceCount]);

  const chartData = {
    labels: revenueData.length > 0 ? revenueData.map(d => d.label) : ['No Data'],
    datasets: [{
      label: 'Revenue',
      data: revenueData.length > 0 ? revenueData.map(d => d.revenue) : [0],
      borderColor: '#2565fa',
      borderWidth: 3,
      backgroundColor: 'rgba(37, 101, 250, 0.1)',
      fill: true,
      tension: 0.4,
      pointRadius: 0,
      pointHoverRadius: 6,
    }]
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: { legend: { display: false } },
    scales: {
      y: { grid: { color: '#f1f5f9' }, ticks: { callback: (v) => '$' + v }, beginAtZero: true },
      x: { grid: { display: false } }
    }
  };

  const confirmBooking = async (id) => {
    setProcessingId(id);
    try {
      await api.post(`/bookings/${id}/confirm/`);
      showNotification('Booking confirmed!', 'success');
      const res = await api.get('/bookings/my_properties_bookings/');
      setBookings(Array.isArray(res.data) ? res.data : res.data.results || []);
    } catch (err) {
      showNotification('Action failed', 'error');
    } finally {
      setProcessingId(null);
    }
  };

  return (
    <div className="space-y-8 pb-10 animate-fade-in">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="text-4xl font-black text-surface-900 tracking-tight mb-2">Portfolio Overview</h1>
          <p className="text-surface-500 font-medium flex items-center gap-2">
            <Calendar className="w-4 h-4" />
            Real-time metrics for {new Date().toLocaleString('default', { month: 'long', year: 'numeric' })}
          </p>
        </div>
        <div className="flex items-center gap-3">
          <BaseButton variant="secondary" icon={Download}>Export</BaseButton>
          <BaseButton icon={Plus}>New Property</BaseButton>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
         <BaseCard padding="lg" hover className="relative overflow-hidden group">
            <div className="flex justify-between items-start mb-4">
               <div className="w-12 h-12 rounded-2xl bg-brand-50 text-brand-600 flex items-center justify-center">
                  <DollarSign className="w-6 h-6" />
               </div>
               <div className="flex items-center gap-1 text-emerald-600 bg-emerald-50 px-2 py-1 rounded-lg text-xs font-bold">
                  <ArrowUpRight className="w-3 h-3" /> 12%
               </div>
            </div>
            <div className="text-sm font-bold text-surface-400 uppercase tracking-widest mb-1">Total Revenue</div>
            <div className="text-3xl font-black text-surface-900">${stats.totalEarned.toLocaleString()}</div>
         </BaseCard>

         <BaseCard padding="lg" hover className="relative overflow-hidden group">
            <div className="flex justify-between items-start mb-4">
               <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
                  <TrendingUp className="w-6 h-6" />
               </div>
               <div className="flex items-center gap-1 text-emerald-600 bg-emerald-50 px-2 py-1 rounded-lg text-xs font-bold">
                  <ArrowUpRight className="w-3 h-3" /> 4%
               </div>
            </div>
            <div className="text-sm font-bold text-surface-400 uppercase tracking-widest mb-1">Portfolio Occupancy</div>
            <div className="text-3xl font-black text-surface-900">{stats.occupancy}%</div>
         </BaseCard>

         <BaseCard padding="lg" hover className="relative overflow-hidden group">
            <div className="flex justify-between items-start mb-4">
               <div className="w-12 h-12 rounded-2xl bg-rose-50 text-rose-600 flex items-center justify-center">
                  <Wrench className="w-6 h-6" />
               </div>
               {stats.pendingTickets > 0 && <div className="text-rose-600 bg-rose-50 px-2 py-1 rounded-lg text-xs font-bold">Action Required</div>}
            </div>
            <div className="text-sm font-bold text-surface-400 uppercase tracking-widest mb-1">Active Tickets</div>
            <div className={`text-3xl font-black ${stats.pendingTickets > 0 ? 'text-rose-600' : 'text-surface-900'}`}>{stats.pendingTickets}</div>
         </BaseCard>
      </div>

      <div className="grid lg:grid-cols-3 gap-8">
         <BaseCard className="lg:col-span-2" padding="lg">
            <h3 className="text-xl font-bold text-surface-900 mb-8">Revenue Trends</h3>
            <div className="h-80 relative">
               {loading ? (
                 <div className="absolute inset-0 flex items-center justify-center">
                    <div className="w-10 h-10 border-4 border-brand-100 border-t-brand-600 rounded-full animate-spin" />
                 </div>
               ) : (
                 <Line data={chartData} options={chartOptions} />
               )}
            </div>
         </BaseCard>
         
         <BaseCard padding="none" className="flex flex-col">
            <div className="p-8 border-b border-surface-100">
               <h3 className="text-xl font-bold text-surface-900">Recent Units</h3>
            </div>
            <div className="flex-1 overflow-y-auto max-h-[400px]">
               {units.slice(0, 5).map(unit => (
                  <div key={unit.id} className="p-6 flex items-center gap-4 hover:bg-surface-50 border-b border-surface-50 last:border-0">
                     <div className="w-12 h-12 rounded-xl bg-surface-100 flex items-center justify-center text-brand-600">
                        <HomeIcon className="w-6 h-6" />
                     </div>
                     <div className="flex-1 min-w-0">
                        <div className="text-sm font-bold text-surface-900 truncate">{unit.title}</div>
                        <div className="text-xs text-surface-500">{unit.unit_number}</div>
                     </div>
                     <div className="text-right">
                        <div className="text-sm font-black text-surface-900">${unit.base_price}</div>
                     </div>
                  </div>
               ))}
            </div>
         </BaseCard>

         <DocumentVault />
      </div>

      <BaseCard padding="none" className="overflow-hidden">
         <div className="p-8 border-b border-surface-100 flex items-center justify-between">
            <h3 className="text-xl font-bold text-surface-900">Upcoming Reservations</h3>
         </div>
         <div className="overflow-x-auto">
            <table className="w-full text-left">
               <thead>
                  <tr className="bg-surface-50/50">
                     <th className="px-8 py-4 text-[10px] font-black text-surface-400 uppercase tracking-widest">Unit</th>
                     <th className="px-8 py-4 text-[10px] font-black text-surface-400 uppercase tracking-widest">Guest</th>
                     <th className="px-8 py-4 text-[10px] font-black text-surface-400 uppercase tracking-widest">Status</th>
                     <th className="px-8 py-4 text-[10px] font-black text-surface-400 uppercase tracking-widest text-right">Actions</th>
                  </tr>
               </thead>
               <tbody className="divide-y divide-surface-100">
                  {bookings.length > 0 ? bookings.map(b => (
                     <tr key={b.id} className="hover:bg-surface-50/50 group transition-colors">
                        <td className="px-8 py-6">
                           <div className="text-sm font-bold text-surface-900">{b.unit_details?.title || 'Unknown Unit'}</div>
                           <div className="text-[10px] text-surface-400 font-bold uppercase">{b.unit_details?.unit_number || 'N/A'}</div>
                        </td>
                        <td className="px-8 py-6 text-sm text-surface-700 font-semibold">{b.tenant_details?.username || 'Unknown Guest'}</td>
                        <td className="px-8 py-6">
                           <span className={`px-3 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-widest border ${
                             b.status === 'confirmed' ? 'bg-emerald-50 text-emerald-700 border-emerald-100' : 'bg-amber-50 text-amber-700 border-amber-100'
                           }`}>{b.status}</span>
                        </td>
                        <td className="px-8 py-6 text-right">
                           {b.status === 'pending' && (
                             <BaseButton 
                                size="sm" 
                                loading={processingId === b.id} 
                                onClick={() => confirmBooking(b.id)}
                             >
                                Confirm
                             </BaseButton>
                           )}
                        </td>
                     </tr>
                  )) : (
                    <tr>
                      <td colSpan="4" className="px-8 py-20 text-center">
                        <div className="flex flex-col items-center">
                          <Calendar className="w-12 h-12 text-surface-200 mb-4" />
                          <p className="text-surface-500 font-medium">No reservations found.</p>
                        </div>
                      </td>
                    </tr>
                  )}
               </tbody>
            </table>
         </div>
      </BaseCard>
    </div>
  );
};

export default LandlordDashboard;