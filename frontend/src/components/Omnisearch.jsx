import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api';
import { Search, Building2, User, Home, Loader2, Command } from 'lucide-react';
import { AnimatePresence, motion } from 'framer-motion';

const Omnisearch = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef(null);
  const navigate = useNavigate();

  // Keyboard shortcut listener
  useEffect(() => {
    const handleKeyDown = (e) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setIsOpen(prev => !prev);
      }
      if (e.key === 'Escape') {
        setIsOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Search logic
  useEffect(() => {
    if (!isOpen) {
      setQuery('');
      setResults([]);
      return;
    }
    
    const delayDebounceFn = setTimeout(async () => {
      if (query.length < 2) {
        setResults([]);
        return;
      }
      setLoading(true);
      try {
        const res = await api.get(`/search/?q=${query}`);
        setResults(res.data);
        setSelectedIndex(0);
      } catch (err) {
        console.error('Search failed', err);
      } finally {
        setLoading(false);
      }
    }, 300);

    return () => clearTimeout(delayDebounceFn);
  }, [query, isOpen]);

  // Focus input when opened
  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  }, [isOpen]);

  const handleSelect = (result) => {
    setIsOpen(false);
    navigate(result.url);
  };

  const handleKeyDown = (e) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedIndex(prev => (prev + 1) % results.length);
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedIndex(prev => (prev - 1 + results.length) % results.length);
    } else if (e.key === 'Enter' && results[selectedIndex]) {
      handleSelect(results[selectedIndex]);
    }
  };

  const getIcon = (type) => {
    switch (type) {
      case 'property': return <Building2 className="w-4 h-4" />;
      case 'unit': return <Home className="w-4 h-4" />;
      case 'tenant': return <User className="w-4 h-4" />;
      default: return <Search className="w-4 h-4" />;
    }
  };

  return (
    <>
      {/* Trigger Button (UI part) */}
      <button 
        onClick={() => setIsOpen(true)}
        className="hidden lg:flex items-center gap-3 px-4 py-2 bg-white border border-surface-200 rounded-2xl text-surface-400 hover:border-brand-500 transition-all group"
      >
        <Search className="w-4 h-4 group-hover:text-brand-600 transition-colors" />
        <span className="text-sm font-medium">Search anything...</span>
        <kbd className="ml-4 px-2 py-1 bg-surface-50 border border-surface-200 rounded-md text-[10px] font-black text-surface-400">⌘ K</kbd>
      </button>

      {/* Backdrop & Modal */}
      <AnimatePresence>
        {isOpen && (
          <div className="fixed inset-0 z-[100] flex items-start justify-center pt-[15vh] px-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsOpen(false)}
              className="fixed inset-0 bg-surface-900/40 backdrop-blur-md"
            />
            
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: -20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: -20 }}
              className="relative w-full max-w-2xl bg-white rounded-3xl shadow-2xl overflow-hidden border border-surface-100"
            >
              <div className="p-6 border-b border-surface-50 flex items-center gap-4">
                <Search className={`w-6 h-6 ${loading ? 'text-brand-600 animate-pulse' : 'text-surface-400'}`} />
                <input
                  ref={inputRef}
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder="Search properties, suites, or tenants..."
                  className="w-full bg-transparent border-none focus:ring-0 text-xl font-medium placeholder:text-surface-300"
                />
                {loading && <Loader2 className="w-5 h-5 animate-spin text-brand-600" />}
              </div>

              <div className="max-h-[60vh] overflow-y-auto">
                {results.length > 0 ? (
                  <div className="p-4 space-y-1">
                    {results.map((res, idx) => (
                      <div
                        key={`${res.type}-${res.id}`}
                        onClick={() => handleSelect(res)}
                        onMouseEnter={() => setSelectedIndex(idx)}
                        className={`p-4 rounded-2xl flex items-center justify-between cursor-pointer transition-all ${
                          idx === selectedIndex ? 'bg-brand-50' : 'hover:bg-surface-50'
                        }`}
                      >
                        <div className="flex items-center gap-4">
                          <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                            idx === selectedIndex ? 'bg-white text-brand-600' : 'bg-surface-50 text-surface-400'
                          }`}>
                            {getIcon(res.type)}
                          </div>
                          <div>
                            <p className={`font-bold ${idx === selectedIndex ? 'text-brand-900' : 'text-surface-900'}`}>{res.title}</p>
                            <p className="text-xs text-surface-500 font-medium">{res.subtitle}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                           <span className="text-[10px] font-black uppercase tracking-widest text-surface-300">{res.type}</span>
                           <ChevronRight className={`w-4 h-4 ${idx === selectedIndex ? 'text-brand-400' : 'text-surface-200'}`} />
                        </div>
                      </div>
                    ))}
                  </div>
                ) : query.length >= 2 && !loading ? (
                  <div className="p-20 text-center text-surface-400">
                    <p className="font-medium">No results found for "{query}"</p>
                  </div>
                ) : (
                  <div className="p-12 text-center text-surface-400 space-y-4">
                    <div className="flex justify-center gap-8 text-xs font-bold uppercase tracking-widest opacity-50">
                       <span className="flex items-center gap-2"><Command className="w-3 h-3" /> Search</span>
                       <span className="flex items-center gap-2">↑↓ Navigate</span>
                       <span className="flex items-center gap-2">↵ Select</span>
                    </div>
                  </div>
                )}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
};

// Simple Chevron for the list
const ChevronRight = ({ className }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M9 5l7 7-7 7" />
  </svg>
);

export default Omnisearch;