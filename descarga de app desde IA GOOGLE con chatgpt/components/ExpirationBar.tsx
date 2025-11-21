import React from 'react';

interface ExpirationBarProps {
  daysRemaining: number;
}

const ExpirationBar: React.FC<ExpirationBarProps> = ({ daysRemaining }) => {
  const isCritical = daysRemaining <= 3;
  const barColor = isCritical ? 'bg-red-500' : 'bg-orange-400';
  const message = daysRemaining > 1 
    ? `Tu acceso expira en ${daysRemaining} días.`
    : daysRemaining === 1
    ? `Tu acceso expira en 1 día.`
    : `Tu acceso ha expirado.`;

  if (daysRemaining < 0) return null;

  return (
    <div className={`w-full p-2 text-center text-white text-sm font-semibold ${barColor}`}>
      {message}
    </div>
  );
};

export default ExpirationBar;