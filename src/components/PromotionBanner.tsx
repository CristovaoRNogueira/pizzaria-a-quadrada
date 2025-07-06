import React from 'react';
import { X } from 'lucide-react';
import { useApp } from '../contexts/AppContext';

const PromotionBanner: React.FC = () => {
  const { state } = useApp();
  const [isVisible, setIsVisible] = React.useState(true);

  const banner = state.businessSettings.promotionBanner;

  if (!banner?.active || !isVisible) {
    return null;
  }

  return (
    <div 
      className="relative mb-6 p-4 rounded-lg shadow-lg text-white"
      style={{ backgroundColor: banner.color }}
    >
      <button
        onClick={() => setIsVisible(false)}
        className="absolute top-2 right-2 text-white hover:text-gray-200 transition-colors"
      >
        <X className="h-5 w-5" />
      </button>
      
      <div className="pr-8">
        {banner.title && (
          <h2 className="text-xl font-bold mb-2">{banner.title}</h2>
        )}
        {banner.message && (
          <p className="text-sm opacity-90">{banner.message}</p>
        )}
      </div>
    </div>
  );
};

export default PromotionBanner;