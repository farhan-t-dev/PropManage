import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../api';
import { useNotificationStore } from '../store/notificationStore';
import { useAuthStore } from '../store/authStore';
import { 
  Calendar, MapPin, Users, Bed, Bath, 
  ChevronRight, ShieldCheck, CheckCircle2, Star
} from 'lucide-react';
import { BaseButton } from '../components/BaseButton';
import { BaseCard } from '../components/BaseCard';

const UnitDetailView = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { showNotification } = useNotificationStore();
  const { isAuthenticated, user } = useAuthStore();
  
  const [unit, setUnit] = useState(null);
  const [loading, setLoading] = useState(true);
  const [bookingLoading, setBookingLoading] = useState(false);
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  useEffect(() => {
    const fetchUnit = async () => {
      try {
        const res = await api.get(`/units/${id}/`);
        setUnit(res.data);
      } catch (err) {
        showNotification('Failed to load unit details', 'error');
        navigate('/discover');
      } finally {
        setLoading(false);
      }
    };
    fetchUnit();
  }, [id]);

  const handleBooking = async (e) => {
    e.preventDefault();
    if (!isAuthenticated) {
      showNotification('Please login to book', 'warning');
      navigate('/login');
      return;
    }

    setBookingLoading(true);
    try {
      await api.post('/bookings/', {
        unit: id,
        start_date: startDate,
        end_date: endDate
      });
      showNotification('Booking request submitted! Waiting for landlord confirmation.', 'success');
      navigate('/my-bookings');
    } catch (err) {
      const msg = err.response?.data?.detail || 'Booking failed. Check availability.';
      showNotification(msg, 'error');
    } finally {
      setBookingLoading(false);
    }
  };

  if (loading) return <div className="py-20 text-center animate-pulse text-surface-400 font-bold">Loading Suite Details...</div>;
  if (!unit) return null;

  return (
    <div className="space-y-12 pb-20 animate-fade-in">
      {/* Header & Gallery */}
      <div className="space-y-6">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div>
            <div className="flex items-center gap-2 text-brand-600 text-xs font-black uppercase tracking-widest mb-3">
               <MapPin className="w-4 h-4" /> {unit.property_title}
            </div>
            <h1 className="text-4xl md:text-5xl font-black text-surface-900 tracking-tight">{unit.title}</h1>
          </div>
          <div className="flex items-center gap-2 text-surface-500 font-bold">
            <Star className="w-5 h-5 text-amber-400 fill-amber-400" />
            4.9 <span className="text-surface-300 font-medium">/ 12 reviews</span>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 h-[600px]">
          <div className="md:col-span-2 rounded-4xl overflow-hidden shadow-2xl">
            <img 
                src={unit.images?.[0]?.image || 'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?auto=format&fit=crop&q=80&w=1200'} 
                className="w-full h-full object-cover" 
                alt="Main view"
            />
          </div>
          <div className="grid grid-rows-2 gap-4">
             <div className="rounded-3xl overflow-hidden shadow-xl">
               <img src="https://images.unsplash.com/photo-1484154218962-a197022b5858?auto=format&fit=crop&q=80&w=600" className="w-full h-full object-cover" alt="Kitchen" />
             </div>
             <div className="rounded-3xl overflow-hidden shadow-xl">
               <img src="https://images.unsplash.com/photo-1522771739844-6a9f6d5f14af?auto=format&fit=crop&q=80&w=600" className="w-full h-full object-cover" alt="Bedroom" />
             </div>
          </div>
        </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-12">
        <div className="lg:col-span-2 space-y-12">
           <section className="space-y-6">
              <h2 className="text-3xl font-black text-surface-900 tracking-tight">About this suite</h2>
              <p className="text-lg text-surface-500 leading-relaxed font-medium">
                {unit.description}
              </p>
              <div className="flex flex-wrap gap-8 pt-4">
                 <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-2xl bg-surface-50 flex items-center justify-center text-brand-600">
                       <Bed className="w-6 h-6" />
                    </div>
                    <div>
                       <div className="text-[10px] font-black text-surface-400 uppercase tracking-widest">Bedrooms</div>
                       <div className="text-sm font-bold text-surface-900">{unit.features?.bedrooms || 1} Rooms</div>
                    </div>
                 </div>
                 <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-2xl bg-surface-50 flex items-center justify-center text-brand-600">
                       <Users className="w-6 h-6" />
                    </div>
                    <div>
                       <div className="text-[10px] font-black text-surface-400 uppercase tracking-widest">Capacity</div>
                       <div className="text-sm font-bold text-surface-900">{unit.features?.guests || 2} Guests</div>
                    </div>
                 </div>
              </div>
           </section>

           <section className="space-y-6">
              <h2 className="text-2xl font-bold text-surface-900">Amenities</h2>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                 {['High-speed WiFi', 'Smart Lock', 'Full Kitchen', 'Dedicated Workspace', 'AC / Heating', 'Parking'].map(ame => (
                    <div key={ame} className="flex items-center gap-3 text-surface-600 font-medium">
                       <CheckCircle2 className="w-5 h-5 text-brand-500" />
                       {ame}
                    </div>
                 ))}
              </div>
           </section>
        </div>

        {/* Booking Sidebar */}
        <div className="relative">
          <BaseCard padding="lg" className="sticky top-28 shadow-2xl shadow-brand-500/10 border-brand-50">
             <div className="flex items-end gap-2 mb-8">
                <span className="text-4xl font-black text-surface-900">${unit.base_price}</span>
                <span className="text-surface-500 font-bold mb-1">/ night</span>
             </div>

             <form onSubmit={handleBooking} className="space-y-6">
                <div className="space-y-4">
                   <div className="space-y-2">
                      <label className="text-[10px] font-black text-surface-400 uppercase tracking-widest ml-1">Check-in</label>
                      <input 
                        type="date" 
                        required
                        value={startDate}
                        onChange={(e) => setStartDate(e.target.value)}
                        className="input-field" 
                      />
                   </div>
                   <div className="space-y-2">
                      <label className="text-[10px] font-black text-surface-400 uppercase tracking-widest ml-1">Check-out</label>
                      <input 
                        type="date" 
                        required
                        value={endDate}
                        onChange={(e) => setEndDate(e.target.value)}
                        className="input-field" 
                      />
                   </div>
                </div>

                <BaseButton 
                  type="submit" 
                  loading={bookingLoading} 
                  className="w-full py-5 text-base shadow-xl shadow-brand-500/30"
                >
                   Reserve Suite
                </BaseButton>

                <p className="text-[10px] text-center text-surface-400 font-bold uppercase tracking-widest pt-4">
                  Powered by Secure Operations Engine
                </p>
             </form>
          </BaseCard>
        </div>
      </div>
    </div>
  );
};

export default UnitDetailView;