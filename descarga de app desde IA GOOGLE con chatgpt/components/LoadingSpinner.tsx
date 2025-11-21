
import React from 'react';

const LoadingSpinner: React.FC = () => {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-60 flex flex-col items-center justify-center z-50 transition-opacity duration-300">
      <div className="w-20 h-20 border-8 border-t-8 border-gray-200 border-t-red-600 rounded-full animate-spin"></div>
      <p className="text-white text-xl mt-6 font-semibold">Suma está pensando… Por favor espera</p>
    </div>
  );
};

export default LoadingSpinner;
