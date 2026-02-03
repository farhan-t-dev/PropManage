import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate, Outlet } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import { useNotificationStore } from '../store/notificationStore';
import { 
  LayoutDashboard, Search, Calendar, LogOut, Menu, X, Bell, Home, ShieldCheck 
} from 'lucide-react';
import { BaseButton } from '../components/BaseButton';
import { AnimatePresence, motion } from 'framer-motion';
import { twMerge } from 'tailwind-merge';
import Omnisearch from '../components/Omnisearch';

const DefaultLayout = () => {
  const { user, isAuthenticated, logout } = useAuthStore();
  const { connect, disconnect } = useNotificationStore();
  const [isSidebarOpen, setSidebarOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    if (isAuthenticated) {
      connect();
    }
    return () => disconnect();
  }, [isAuthenticated]);

  const navigation = [
    { name: 'Home', href: '/', icon: Home },
    { name: 'Discover', href: '/discover', icon: Search },
    { name: 'My Bookings', href: '/my-bookings', icon: Calendar, role: 'tenant' },
    { name: 'Landlord Dashboard', href: '/landlord-dashboard', icon: LayoutDashboard, role: 'landlord' },
  ].filter(item => !item.role || (user?.role === item.role));

  const isActive = (path) => location.pathname === path;

  return (
    <div className="min-h-screen bg-surface-50 flex">
      {/* Sidebar */}
      <aside className="hidden lg:flex flex-col w-72 bg-white border-r border-surface-200 sticky top-0 h-screen z-50">
        <div className="p-8">
          <Link to="/" className="flex items-center gap-3">
            <div className="w-10 h-10 bg-brand-600 rounded-2xl flex items-center justify-center text-white shadow-lg shadow-brand-500/30">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <span className="text-2xl font-black text-surface-900 tracking-tight">PropManage</span>
          </Link>
        </div>

        <nav className="flex-1 px-4 space-y-2">
          {navigation.map((item) => (
            <Link
              key={item.name}
              to={item.href}
              className={twMerge(
                'group flex items-center px-4 py-3.5 text-sm font-semibold rounded-2xl transition-all duration-200',
                isActive(item.href)
                  ? 'bg-brand-50 text-brand-700 shadow-sm shadow-brand-100/50'
                  : 'text-surface-500 hover:bg-surface-50 hover:text-surface-900'
              )}
            >
              <item.icon className="mr-3 w-5 h-5 transition-colors" />
              {item.name}
            </Link>
          ))}
        </nav>

        <div className="p-4 mt-auto">
          {isAuthenticated ? (
            <div className="bg-surface-50 rounded-3xl p-4 border border-surface-100">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-xl bg-brand-100 flex items-center justify-center text-brand-700 font-bold">
                  {user?.first_name?.[0]}{user?.last_name?.[0]}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-bold text-surface-900 truncate">{user?.first_name} {user?.last_name}</p>
                  <p className="text-xs text-surface-500 capitalize">{user?.role}</p>
                </div>
              </div>
              <BaseButton 
                variant="ghost" 
                size="sm" 
                className="w-full justify-start text-red-600 hover:bg-red-50 hover:text-red-700"
                onClick={() => {
                  logout();
                  navigate('/login');
                }}
              >
                <LogOut className="w-4 h-4 mr-2" />
                Logout
              </BaseButton>
            </div>
          ) : (
            <div className="space-y-2">
              <Link to="/login"><BaseButton variant="secondary" className="w-full">Sign In</BaseButton></Link>
              <Link to="/register"><BaseButton className="w-full">Join Now</BaseButton></Link>
            </div>
          )}
        </div>
      </aside>

      <div className="flex-1 flex flex-col min-w-0">
        <header className="flex items-center justify-between px-4 lg:px-10 py-6 sticky top-0 bg-surface-50/80 backdrop-blur-sm z-30">
          <div className="flex items-center gap-4">
            <button onClick={() => setSidebarOpen(true)} className="lg:hidden p-2 text-surface-500 hover:bg-white rounded-xl">
              <Menu className="w-6 h-6" />
            </button>
            <h2 className="text-lg font-bold text-surface-900 capitalize hidden sm:block">
              {location.pathname.split('/').pop()?.replace('-', ' ') || 'Overview'}
            </h2>
          </div>
          <div className="flex items-center gap-4">
             <Omnisearch />
             <div className="h-8 w-[1px] bg-surface-200 mx-2 hidden lg:block"></div>
             <button className="p-2.5 text-surface-400 hover:text-brand-600 hover:bg-white rounded-xl transition-all border border-transparent hover:border-surface-200 relative">
               <Bell className="w-5 h-5" />
             </button>
          </div>
        </header>

        <main className="flex-1 px-4 lg:px-10 pb-10">
          <Outlet />
        </main>
      </div>

      {/* Mobile Sidebar can be added later if needed */}
    </div>
  );
};

export default DefaultLayout;