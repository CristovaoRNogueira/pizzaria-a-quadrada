import React, { useEffect } from 'react';
import { X } from 'lucide-react';
import { useApp } from '../contexts/AppContext';

const Notifications: React.FC = () => {
  const { state, dispatch } = useApp();
  
  useEffect(() => {
    state.notifications.forEach((_, index) => {
      const timer = setTimeout(() => {
        dispatch({ type: 'REMOVE_NOTIFICATION', payload: index });
      }, 5000);
      
      return () => clearTimeout(timer);
    });
  }, [state.notifications, dispatch]);
  
  return (
    <div className="fixed top-20 right-4 z-50 space-y-2">
      {state.notifications.map((notification, index) => (
        <div
          key={index}
          className="bg-white border border-gray-200 rounded-lg shadow-lg p-4 max-w-sm animate-slide-in"
        >
          <div className="flex items-center justify-between">
            <p className="text-sm text-gray-800">{notification}</p>
            <button
              onClick={() => dispatch({ type: 'REMOVE_NOTIFICATION', payload: index })}
              className="ml-2 text-gray-400 hover:text-gray-600 transition-colors"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>
      ))}
    </div>
  );
};

export default Notifications;