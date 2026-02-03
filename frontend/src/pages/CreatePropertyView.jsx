import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api';
import { useNotificationStore } from '../store/notificationStore';
import { Building2, MapPin, AlignLeft, CheckCircle2, Save } from 'lucide-react';
import { BaseButton } from '../components/BaseButton';
import { BaseCard } from '../components/BaseCard';

const CreatePropertyView = () => {
  const navigate = useNavigate();
  const { showNotification } = useNotificationStore();
  const [loading, setLoading] = useState(false);
  
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    address: '',
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await api.post('/properties/', formData);
      showNotification('Property added successfully!', 'success');
      navigate('/landlord-dashboard');
    } catch (err) {
      showNotification('Failed to add property', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto space-y-10 animate-fade-in py-10">
      <div>
        <h1 className="text-4xl font-black text-surface-900 tracking-tight">Expand Portfolio</h1>
        <p className="text-surface-500 font-medium">Add a new property to your operations engine</p>
      </div>

      <BaseCard padding="lg">
        <form onSubmit={handleSubmit} className="space-y-8">
           <div className="space-y-6">
              <div className="space-y-2">
                 <label className="text-sm font-bold text-surface-700 ml-1 flex items-center gap-2">
                    <Building2 className="w-4 h-4 text-brand-600" /> Property Title
                 </label>
                 <input 
                    type="text" 
                    required 
                    placeholder="e.g. Sunset Heights Apartment"
                    className="input-field"
                    value={formData.title}
                    onChange={(e) => setFormData({...formData, title: e.target.value})}
                 />
              </div>

              <div className="space-y-2">
                 <label className="text-sm font-bold text-surface-700 ml-1 flex items-center gap-2">
                    <MapPin className="w-4 h-4 text-brand-600" /> Address
                 </label>
                 <input 
                    type="text" 
                    required 
                    placeholder="Full physical address"
                    className="input-field"
                    value={formData.address}
                    onChange={(e) => setFormData({...formData, address: e.target.value})}
                 />
              </div>

              <div className="space-y-2">
                 <label className="text-sm font-bold text-surface-700 ml-1 flex items-center gap-2">
                    <AlignLeft className="w-4 h-4 text-brand-600" /> Description
                 </label>
                 <textarea 
                    required 
                    rows="4"
                    placeholder="Describe the property and its features..."
                    className="input-field resize-none"
                    value={formData.description}
                    onChange={(e) => setFormData({...formData, description: e.target.value})}
                 />
              </div>
           </div>

           <div className="pt-6 border-t border-surface-50 flex items-center justify-between">
              <p className="text-xs text-surface-400 font-medium max-w-xs">
                Your properties are automatically tracked in the financial ledger once added.
              </p>
              <div className="flex gap-4">
                 <BaseButton variant="ghost" onClick={() => navigate(-1)}>Cancel</BaseButton>
                 <BaseButton type="submit" loading={loading} icon={Save}>Register Property</BaseButton>
              </div>
           </div>
        </form>
      </BaseCard>
    </div>
  );
};

export default CreatePropertyView;