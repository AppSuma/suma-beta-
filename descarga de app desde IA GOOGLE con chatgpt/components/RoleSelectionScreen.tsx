
import React from 'react';
import { UserRole } from '../types';
import { SumaLogo } from './Icons';

interface RoleSelectionScreenProps {
  onRoleSelect: (role: UserRole) => void;
}

const RoleSelectionScreen: React.FC<RoleSelectionScreenProps> = ({ onRoleSelect }) => {
  const roles = Object.values(UserRole);

  return (
    <div className="flex flex-col items-center justify-center h-screen bg-white p-4 text-black">
      <div className="w-full max-w-sm text-center">
        <SumaLogo className="h-24 w-24 mx-auto mb-4" />
        <h1 className="text-2xl font-bold mb-2">Bienvenido a Suma</h1>
        <p className="text-gray-600 mb-8">Por favor, selecciona tu rol para continuar.</p>
        
        <div className="space-y-4">
          {roles.map(role => (
            <button
              key={role}
              onClick={() => onRoleSelect(role)}
              className="w-full py-4 px-6 bg-gray-100 text-lg font-semibold text-gray-800 rounded-lg border border-gray-200 hover:bg-blue-100 hover:border-blue-300 transition-all duration-300"
            >
              {role}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

export default RoleSelectionScreen;
