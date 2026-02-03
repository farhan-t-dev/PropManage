import React, { useState, useEffect } from 'react';
import api from '../api';
import PropertyCard from '../components/PropertyCard';
import { BaseButton } from '../components/BaseButton';
import { BaseCard } from '../components/BaseCard';
import { Search, SlidersHorizontal, X } from 'lucide-react';

const Discover = () => {
  const [units, setUnits] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [minPrice, setMinPrice] = useState('');
  const [maxPrice, setMaxPrice] = useState('');
  const [showFilters, setShowFilters] = useState(false);

  const fetchUnits = async () => {
    setLoading(true);
    try {
      const params = {
        search,
        min_price: minPrice,
        max_price: maxPrice
      };
      const res = await api.get('/units/', { params });
      setUnits(res.data.results || res.data);
    } catch (err) {
      console.error('Failed to load units.', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUnits();
  }, [minPrice, maxPrice]);

  return (
    <div className="space-y-10">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-8">
        <div className="max-w-xl">
          <h1 className="text-5xl font-black text-surface-900 tracking-tight mb-3">Discover Suites</h1>
          <p className="text-lg text-surface-500">Premium living spaces curated for the modern professional.</p>
        </div>
        
        <div className="flex items-center gap-3 w-full md:w-auto">
          <div className="relative flex-1 md:w-80 group">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-surface-400 group-focus-within:text-brand-500 transition-colors" />
            <input 
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              onKeyUp={(e) => e.key === 'Enter' && fetchUnits()}
              type="text" 
              placeholder="Search city, area or suite..." 
              className="input-field pl-12"
            />
          </div>
          <BaseButton variant="secondary" onClick={() => setShowFilters(!showFilters)}>
            <SlidersHorizontal className="w-4 h-4 mr-2" />
            Filters
          </BaseButton>
        </div>
      </div>

      <div className="flex flex-col lg:flex-row gap-10">
        {showFilters && (
          <aside className="w-full lg:w-72 space-y-6 animate-fade-in">
            <BaseCard className="sticky top-28">
              <div className="flex items-center justify-between mb-8">
                <h3 className="text-xl font-bold text-surface-900">Filters</h3>
                <button onClick={() => setShowFilters(false)} className="lg:hidden p-2 text-surface-400">
                   <X className="w-5 h-5" />
                </button>
              </div>

              <div className="space-y-8">
                <div>
                  <label className="block text-sm font-bold text-surface-700 mb-4">Price per Night</label>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="relative">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-surface-400 text-xs">$</span>
                      <input 
                        value={minPrice} 
                        onChange={(e) => setMinPrice(e.target.value)} 
                        type="number" 
                        placeholder="Min" 
                        className="w-full pl-7 pr-3 py-2.5 bg-surface-50 border border-surface-200 rounded-xl text-sm outline-none focus:border-brand-500 transition-colors"
                      />
                    </div>
                    <div className="relative">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-surface-400 text-xs">$</span>
                      <input 
                        value={maxPrice} 
                        onChange={(e) => setMaxPrice(e.target.value)} 
                        type="number" 
                        placeholder="Max" 
                        className="w-full pl-7 pr-3 py-2.5 bg-surface-50 border border-surface-200 rounded-xl text-sm outline-none focus:border-brand-500 transition-colors"
                      />
                    </div>
                  </div>
                </div>
              </div>

              <BaseButton onClick={fetchUnits} className="w-full mt-10">Apply Filters</BaseButton>
              <BaseButton variant="ghost" onClick={() => { setMinPrice(''); setMaxPrice(''); setSearch(''); }} className="w-full mt-2 text-surface-400">Clear All</BaseButton>
            </BaseCard>
          </aside>
        )}

        <div className="flex-1">
          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8">
               {[1,2,3,4,5,6].map(n => (
                 <div key={n} className="h-[420px] bg-white border border-surface-100 rounded-[2.5rem] p-4 space-y-4 animate-pulse">
                    <div className="w-full h-56 bg-surface-50 rounded-3xl"></div>
                    <div className="h-6 w-2/3 bg-surface-50 rounded-full"></div>
                    <div className="h-4 w-full bg-surface-50 rounded-full"></div>
                 </div>
               ))}
            </div>
          ) : units.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-32 text-center bg-white rounded-4xl border border-surface-100 border-dashed">
                <h3 className="text-2xl font-bold text-surface-900 mb-2">No units found</h3>
                <p className="text-surface-500 max-w-sm mx-auto">Try adjusting your filters.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8">
              {units.map(unit => <PropertyCard key={unit.id} property={unit} />)}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Discover;