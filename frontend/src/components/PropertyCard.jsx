import React from 'react';
import { Link } from 'react-router-dom';
import { BaseCard } from './BaseCard';
import { MapPin, Users, Bed, Bath, ArrowRight } from 'lucide-react';

const PropertyCard = ({ property }) => {
  return (
    <BaseCard padding="none" hover className="group overflow-hidden flex flex-col h-full">
      <div className="relative h-64 overflow-hidden">
        <img 
          src={property.images?.[0]?.image || 'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?auto=format&fit=crop&q=80&w=800'} 
          alt={property.title}
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
        />
        <div className="absolute top-4 right-4 px-4 py-2 bg-white/90 backdrop-blur-md rounded-xl text-sm font-black text-surface-900 shadow-sm">
          ${property.base_price}<span className="text-[10px] text-surface-500 font-bold">/night</span>
        </div>
      </div>

      <div className="p-6 flex-1 flex flex-col">
        <div className="flex items-center gap-1.5 text-brand-600 text-[10px] font-black uppercase tracking-widest mb-2">
          <MapPin className="w-3 h-3" />
          {property.property_title}
        </div>
        
        <h3 className="text-xl font-bold text-surface-900 mb-2 line-clamp-1 group-hover:text-brand-600 transition-colors">
          {property.title}
        </h3>
        
        <p className="text-sm text-surface-500 font-medium mb-6 line-clamp-2">
          {property.description}
        </p>

        <div className="mt-auto flex items-center justify-between pt-6 border-t border-surface-50">
          <div className="flex items-center gap-4 text-surface-400">
            <div className="flex items-center gap-1.5">
              <Bed className="w-4 h-4" />
              <span className="text-xs font-bold text-surface-700">{property.features?.bedrooms || 1}</span>
            </div>
            <div className="flex items-center gap-1.5">
              <Users className="w-4 h-4" />
              <span className="text-xs font-bold text-surface-700">{property.features?.guests || 2}</span>
            </div>
          </div>
          
          <Link 
            to={`/unit/${property.id}`}
            className="flex items-center gap-2 text-sm font-black text-surface-900 group-hover:text-brand-600 transition-all"
          >
            View Details
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>
      </div>
    </BaseCard>
  );
};

export default PropertyCard;