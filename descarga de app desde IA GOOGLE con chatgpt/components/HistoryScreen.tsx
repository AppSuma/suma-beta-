import React, { useState, useEffect } from 'react';
import type { Case } from '../types';
import { getAllCases } from '../services/db';
import { BackIcon, NewCaseIcon } from './Icons';

interface HistoryScreenProps {
  onBack: () => void;
  onSelectCase: (caseId: number) => void;
}

const HistoryScreen: React.FC<HistoryScreenProps> = ({ onBack, onSelectCase }) => {
  const [cases, setCases] = useState<Case[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCases = async () => {
      try {
        const storedCases = await getAllCases();
        setCases(storedCases.reverse());
      } catch (error) {
        console.error("Failed to fetch cases:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchCases();
  }, []);

  return (
    <div className="flex flex-col h-screen bg-white text-black">
      <header className="fixed top-0 left-0 right-0 flex items-center justify-between bg-white p-4 border-b z-10">
        <button onClick={onBack} className="p-2 -ml-2">
            <BackIcon />
        </button>
        <h1 className="text-xl font-bold">Historial de Casos</h1>
        <button onClick={onBack} className="flex flex-col items-center text-blue-600">
            <NewCaseIcon />
            <span className="text-xs font-semibold">Nuevo</span>
        </button>
      </header>
      
      <main className="flex-grow pt-20 pb-4 overflow-y-auto">
        {loading ? (
          <p className="text-center text-gray-500">Cargando historial...</p>
        ) : cases.length === 0 ? (
          <div className="text-center text-gray-500 mt-10">
            <p className="text-lg">No hay casos guardados.</p>
            <p className="mt-2">Inicie una nueva consulta para verla aquí.</p>
          </div>
        ) : (
          <ul className="space-y-3 px-4">
            {cases.map((caseItem) => (
              <li 
                key={caseItem.id} 
                className="bg-gray-50 border border-gray-200 rounded-lg p-4 cursor-pointer hover:bg-gray-100 transition-colors"
                onClick={() => onSelectCase(caseItem.id!)}
              >
                <p className="font-semibold text-gray-900 truncate">{caseItem.title}</p>
                <p className="text-sm text-gray-600 mt-1">{new Date(caseItem.startTime).toLocaleString()}</p>
              </li>
            ))}
          </ul>
        )}
      </main>
    </div>
  );
};

export default HistoryScreen;