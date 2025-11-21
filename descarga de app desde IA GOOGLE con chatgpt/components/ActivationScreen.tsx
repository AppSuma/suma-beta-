import React, { useState } from 'react';
import { SumaLogo } from './Icons';

interface ActivationScreenProps {
  onActivate: () => void;
  isExpired?: boolean;
}

const ActivationScreen: React.FC<ActivationScreenProps> = ({ onActivate, isExpired }) => {
  const [code, setCode] = useState('');
  const [error, setError] = useState('');

  const handleActivation = () => {
    if (code.length === 6 && /^\d+$/.test(code)) {
      const expiryDate = new Date();
      expiryDate.setDate(expiryDate.getDate() + 30);
      localStorage.setItem('sumaActivationExpiry', expiryDate.toISOString());
      onActivate();
    } else {
      setError('Por favor, introduce un código de activación de 6 dígitos válido.');
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    if (/^\d*$/.test(value) && value.length <= 6) {
      setCode(value);
      setError('');
    }
  };

  const handleWhatsApp = () => {
    window.open('https://wa.me/51999999999?text=Hola,%20quisiera%20renovar%20mi%20licencia%20de%20Suma.', '_blank');
  };


  return (
    <div className="flex flex-col items-center justify-center h-screen bg-white p-4 text-black">
      <div className="w-full max-w-sm text-center">
        <SumaLogo className="h-24 w-24 mx-auto mb-4" />
        <h1 className="text-3xl font-bold">Suma (Beta)</h1>
        <p className="text-gray-600 mb-8">Asistente Médico de IA</p>
        
        <div className="p-8 bg-white rounded-lg">
          {isExpired ? (
            <div>
              <h2 className="text-xl font-semibold mb-2 text-red-600">Licencia Vencida</h2>
              <p className="text-gray-700 mb-4">
                Contacta a Ramón al WhatsApp +51 999 999 999 para renovar tu acceso.
              </p>
              <button
                onClick={handleWhatsApp}
                className="w-full py-3 bg-green-500 text-white font-semibold rounded-lg hover:bg-green-600 transition duration-300"
              >
                Contactar por WhatsApp
              </button>
            </div>
          ) : (
            <div>
              <h2 className="text-xl font-semibold mb-4">Código de Activación</h2>
              <input
                type="tel"
                value={code}
                onChange={handleInputChange}
                maxLength={6}
                className="w-full px-4 py-3 text-center text-2xl tracking-[0.5em] bg-white border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="------"
                autoComplete="off"
              />
              {error && <p className="text-red-500 text-sm mt-2">{error}</p>}
              <button
                onClick={handleActivation}
                className="w-full mt-6 py-3 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition duration-300 disabled:bg-gray-400"
                disabled={code.length !== 6}
              >
                Activar
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ActivationScreen;