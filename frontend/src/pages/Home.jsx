import React from 'react';
import { Link } from 'react-router-dom';
import { BaseButton } from '../components/BaseButton';
import { ShieldCheck, ArrowRight, Building2, Users2, Activity } from 'lucide-react';

const Home = () => {
  return (
    <div className="space-y-24 py-10 animate-fade-in">
      {/* Hero Section */}
      <section className="text-center max-w-4xl mx-auto space-y-8">
        <div className="inline-flex items-center gap-2 px-4 py-2 bg-brand-50 text-brand-700 rounded-full text-xs font-bold uppercase tracking-widest border border-brand-100">
          <Activity className="w-4 h-4" />
          The future of property management
        </div>
        <h1 className="text-6xl md:text-8xl font-black text-surface-900 tracking-tight leading-none">
          Manage Assets with <span className="text-brand-600">Precision.</span>
        </h1>
        <p className="text-xl text-surface-500 max-w-2xl mx-auto font-medium">
          Automated ledgers, real-time communication, and secure document vault for the modern property owner.
        </p>
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <Link to="/discover">
            <BaseButton size="lg" className="w-full sm:w-auto px-10">
              Get Started <ArrowRight className="ml-2 w-5 h-5" />
            </BaseButton>
          </Link>
          <BaseButton variant="secondary" size="lg" className="w-full sm:w-auto px-10">
            View Demo
          </BaseButton>
        </div>
      </section>

      {/* Feature Grid */}
      <div className="grid md:grid-cols-3 gap-8">
        {[
          { 
            title: 'Automated Finance', 
            desc: 'Real-time ledgers and instant invoicing for every transaction.',
            icon: Building2,
            color: 'bg-indigo-50 text-indigo-600'
          },
          { 
            title: 'Resident Portal', 
            desc: 'Seamless communication and maintenance tracking for tenants.',
            icon: Users2,
            color: 'bg-emerald-50 text-emerald-600'
          },
          { 
            title: 'Secure Vault', 
            desc: 'Enterprise-grade document encryption and secure sharing.',
            icon: ShieldCheck,
            color: 'bg-brand-50 text-brand-600'
          }
        ].map((feat) => (
          <div key={feat.title} className="p-10 bg-white border border-surface-100 rounded-4xl hover:shadow-2xl hover:shadow-brand-500/5 transition-all group">
            <div className={`w-14 h-14 ${feat.color} rounded-2xl flex items-center justify-center mb-6 transition-transform group-hover:scale-110`}>
              <feat.icon className="w-7 h-7" />
            </div>
            <h3 className="text-2xl font-bold text-surface-900 mb-4">{feat.title}</h3>
            <p className="text-surface-500 font-medium leading-relaxed">{feat.desc}</p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Home;