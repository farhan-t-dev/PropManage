import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import { useNotificationStore } from '../store/notificationStore';
import { BaseButton } from '../components/BaseButton';
import { BaseCard } from '../components/BaseCard';
import { ShieldCheck, User, Mail, Lock, UserCircle } from 'lucide-react';

const Register = () => {
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    first_name: '',
    last_name: '',
    role: 'tenant', // Default
  });
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  
  const { register } = useAuthStore();
  const { showNotification } = useNotificationStore();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setErrors({});
    
    try {
      await register(formData);
      showNotification('Account created successfully! Welcome to PropManage.', 'success');
      const target = formData.role === 'landlord' ? '/landlord-dashboard' : '/my-bookings';
      navigate(target);
    } catch (err) {
      if (err.response?.data) {
        setErrors(err.response.data);
        showNotification('Please correct the errors in the form.', 'error');
      } else {
        showNotification('Registration failed. Please try again.', 'error');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  return (
    <div className="flex items-center justify-center py-10">
      <div className="w-full max-w-2xl animate-fade-in">
        <div className="text-center mb-10">
          <div className="w-16 h-16 bg-brand-600 rounded-3xl flex items-center justify-center text-white mx-auto mb-6 shadow-xl shadow-brand-500/20">
            <ShieldCheck className="w-8 h-8" />
          </div>
          <h1 className="text-3xl font-black text-surface-900 tracking-tight mb-2">Create your account</h1>
          <p className="text-surface-500 font-medium">Join the next generation of property management</p>
        </div>

        <BaseCard padding="lg">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-sm font-bold text-surface-700 ml-1">First Name</label>
                <input
                  name="first_name"
                  type="text"
                  required
                  className="input-field"
                  value={formData.first_name}
                  onChange={handleChange}
                  placeholder="John"
                />
                {errors.first_name && <p className="text-red-500 text-xs mt-1">{errors.first_name[0]}</p>}
              </div>
              <div className="space-y-2">
                <label className="text-sm font-bold text-surface-700 ml-1">Last Name</label>
                <input
                  name="last_name"
                  type="text"
                  required
                  className="input-field"
                  value={formData.last_name}
                  onChange={handleChange}
                  placeholder="Doe"
                />
                {errors.last_name && <p className="text-red-500 text-xs mt-1">{errors.last_name[0]}</p>}
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-bold text-surface-700 ml-1">Username</label>
              <div className="relative group">
                <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-surface-400 group-focus-within:text-brand-600 transition-colors" />
                <input
                  name="username"
                  type="text"
                  required
                  className="input-field pl-12"
                  value={formData.username}
                  onChange={handleChange}
                  placeholder="johndoe"
                />
              </div>
              {errors.username && <p className="text-red-500 text-xs mt-1">{errors.username[0]}</p>}
            </div>

            <div className="space-y-2">
              <label className="text-sm font-bold text-surface-700 ml-1">Email</label>
              <div className="relative group">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-surface-400 group-focus-within:text-brand-600 transition-colors" />
                <input
                  name="email"
                  type="email"
                  required
                  className="input-field pl-12"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="john@example.com"
                />
              </div>
              {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email[0]}</p>}
            </div>

            <div className="space-y-2">
              <label className="text-sm font-bold text-surface-700 ml-1">Password</label>
              <div className="relative group">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-surface-400 group-focus-within:text-brand-600 transition-colors" />
                <input
                  name="password"
                  type="password"
                  required
                  className="input-field pl-12"
                  value={formData.password}
                  onChange={handleChange}
                  placeholder="••••••••"
                />
              </div>
              {errors.password && <p className="text-red-500 text-xs mt-1">{errors.password[0]}</p>}
            </div>

            <div className="space-y-4">
              <label className="text-sm font-bold text-surface-700 ml-1">I am a...</label>
              <div className="grid grid-cols-2 gap-4">
                <button
                  type="button"
                  onClick={() => setFormData({...formData, role: 'tenant'})}
                  className={`p-4 rounded-2xl border-2 transition-all flex flex-col items-center gap-2 ${
                    formData.role === 'tenant' 
                    ? 'border-brand-600 bg-brand-50 text-brand-700' 
                    : 'border-surface-100 hover:border-surface-200 text-surface-500'
                  }`}
                >
                  <UserCircle className="w-6 h-6" />
                  <span className="font-bold">Resident</span>
                </button>
                <button
                  type="button"
                  onClick={() => setFormData({...formData, role: 'landlord'})}
                  className={`p-4 rounded-2xl border-2 transition-all flex flex-col items-center gap-2 ${
                    formData.role === 'landlord' 
                    ? 'border-brand-600 bg-brand-50 text-brand-700' 
                    : 'border-surface-100 hover:border-surface-200 text-surface-500'
                  }`}
                >
                  <ShieldCheck className="w-6 h-6" />
                  <span className="font-bold">Landlord</span>
                </button>
              </div>
            </div>

            <BaseButton type="submit" loading={loading} className="w-full py-4 text-base">
              Create Account
            </BaseButton>
          </form>
        </BaseCard>

        <p className="text-center mt-8 text-surface-500 text-sm font-medium">
          Already have an account? <Link to="/login" className="text-brand-600 font-bold hover:underline">Sign In</Link>
        </p>
      </div>
    </div>
  );
};

export default Register;