
import React, { useState, useRef, useEffect, useCallback } from 'react';
import type { Case, Message, PatientData } from '../types';
import { Sender, UserRole } from '../types';
import { getInitialRecommendation, continueChat } from '../services/geminiService';
import { addCase, updateCase } from '../services/db';
import { generatePdf } from '../utils/pdfGenerator';
import { EmergencyIcon, ReportIcon, ShareIcon, HistoryIcon, SendIcon } from './Icons';

interface MainInterfaceProps {
  onShowHistory: () => void;
}

const MainInterface: React.FC<MainInterfaceProps> = ({ onShowHistory }) => {
    const [currentCase, setCurrentCase] = useState<Case | null>(null);
    const [patientData, setPatientData] = useState<PatientData>({
        role: UserRole.Medico,
        age: '',
        sex: '',
        medications: '',
        symptoms: '',
    });
    const [isLoading, setIsLoading] = useState(false);
    const [showInitialButton, setShowInitialButton] = useState(true);
    const [chatInput, setChatInput] = useState('');
    const chatEndRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [currentCase?.chat]);

    const handleFormChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setPatientData(prev => ({ ...prev, [name]: value }));
    };

    const handleStartCase = async () => {
        if (!patientData.symptoms.trim() || !patientData.age.trim()) {
            alert("Por favor, complete al menos la edad y los síntomas.");
            return;
        }
        setIsLoading(true);
        setShowInitialButton(false);
        
        const newCase: Case = {
            ...patientData,
            startTime: new Date().toISOString(),
            chat: [],
        };

        try {
            const recommendation = await getInitialRecommendation(patientData);
            const aiMessage: Message = { sender: Sender.AI, text: recommendation, timestamp: new Date().toISOString() };
            newCase.chat.push(aiMessage);
            const caseId = await addCase(newCase);
            setCurrentCase({ ...newCase, id: caseId });
        } catch (error) {
            console.error("Error getting initial recommendation:", error);
            alert("Hubo un error al contactar al asistente. Por favor, inténtelo de nuevo.");
            setShowInitialButton(true);
        } finally {
            setIsLoading(false);
        }
    };
    
    const handleSendMessage = useCallback(async () => {
        if (!chatInput.trim() || !currentCase || isLoading) return;

        const userMessage: Message = { sender: Sender.User, text: chatInput, timestamp: new Date().toISOString() };
        const updatedChat = [...currentCase.chat, userMessage];
        const updatedCase = { ...currentCase, chat: updatedChat };

        setCurrentCase(updatedCase);
        setChatInput('');
        setIsLoading(true);

        try {
            const aiResponse = await continueChat(userMessage.text);
            const aiMessage: Message = { sender: Sender.AI, text: aiResponse, timestamp: new Date().toISOString() };
            const finalCase = { ...updatedCase, chat: [...updatedCase.chat, aiMessage] };
            setCurrentCase(finalCase);
            if (finalCase.id) {
                await updateCase(finalCase);
            }
        } catch (error) {
            console.error("Error continuing chat:", error);
            const errorMessage: Message = { sender: Sender.AI, text: "Lo siento, ocurrió un error.", timestamp: new Date().toISOString() };
            const finalCase = { ...updatedCase, chat: [...updatedCase.chat, errorMessage] };
            setCurrentCase(finalCase);
        } finally {
            setIsLoading(false);
        }
    }, [chatInput, currentCase, isLoading]);

    const handleEmergency = () => {
        navigator.geolocation.getCurrentPosition(
            (position) => {
                const { latitude, longitude } = position.coords;
                alert(`Ubicación: ${latitude}, ${longitude}\nLlamando a emergencias...`);
                window.location.href = 'tel:911';
            },
            (error) => {
                alert('No se pudo obtener la ubicación. Llamando a emergencias...');
                window.location.href = 'tel:911';
            }
        );
    };

    const handleShare = () => {
        if (navigator.share && currentCase) {
            const summary = `Caso Suma:\n- Rol: ${currentCase.role}\n- Edad: ${currentCase.age}\n- Síntomas: ${currentCase.symptoms}\n\nÚltimo mensaje: ${currentCase.chat[currentCase.chat.length - 1].text}`;
            navigator.share({
                title: 'Reporte de Caso Suma',
                text: summary,
            }).catch(console.error);
        } else {
            alert('La función de compartir no está disponible en este navegador.');
        }
    };

    return (
        <div className="flex flex-col h-screen">
            {currentCase && (
                <header className="fixed top-0 left-0 right-0 bg-gray-50 p-2 border-b z-10">
                    <p className="text-xs text-gray-600 truncate">
                        <span className="font-semibold">{currentCase.role}</span> | Edad: {currentCase.age} | Sexo: {currentCase.sex} | Síntomas: {currentCase.symptoms}
                    </p>
                </header>
            )}

            <main className={`flex-grow ${currentCase ? 'pt-12 pb-32' : 'pb-16'} overflow-y-auto`}>
                {!currentCase ? (
                    <div className="p-4 space-y-4">
                        <h1 className="text-2xl font-bold">Nuevo Caso</h1>
                        <div>
                            <label className="block text-sm font-medium text-gray-700">Tu Rol</label>
                            <select name="role" value={patientData.role} onChange={handleFormChange} className="mt-1 block w-full bg-white border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm">
                                {Object.values(UserRole).map(role => <option key={role} value={role}>{role}</option>)}
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700">Edad del Paciente</label>
                            <input type="text" name="age" value={patientData.age} onChange={handleFormChange} className="mt-1 block w-full bg-white border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm" placeholder="Ej: 35 años"/>
                        </div>
                         <div>
                            <label className="block text-sm font-medium text-gray-700">Sexo</label>
                            <input type="text" name="sex" value={patientData.sex} onChange={handleFormChange} className="mt-1 block w-full bg-white border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm" placeholder="Ej: Masculino"/>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700">Medicamentos Relevantes</label>
                            <textarea name="medications" value={patientData.medications} onChange={handleFormChange} rows={2} className="mt-1 block w-full bg-white border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm" placeholder="Ej: Aspirina, losartán..."/>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700">Síntomas y Signos Principales</label>
                            <textarea name="symptoms" value={patientData.symptoms} onChange={handleFormChange} rows={4} className="mt-1 block w-full bg-white border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm" placeholder="Ej: Dolor torácico opresivo, dificultad para respirar..."/>
                        </div>
                        {showInitialButton && (
                            <button onClick={handleStartCase} disabled={isLoading} className="w-full py-3 mt-4 text-white bg-green-600 rounded-lg font-semibold hover:bg-green-700 disabled:bg-gray-400">
                                {isLoading ? "Analizando..." : "¿QUÉ DEBO HACER?"}
                            </button>
                        )}
                    </div>
                ) : (
                    <div className="p-4 space-y-4">
                        {currentCase.chat.map((msg, index) => (
                            <div key={index} className={`flex ${msg.sender === Sender.User ? 'justify-end' : 'justify-start'}`}>
                                <div className={`max-w-xs md:max-w-md lg:max-w-lg px-4 py-2 rounded-xl whitespace-pre-wrap ${msg.sender === Sender.User ? 'bg-green-100' : 'bg-blue-100'}`}>
                                    {msg.text}
                                </div>
                            </div>
                        ))}
                        {isLoading && (
                            <div className="flex justify-start">
                                <div className="max-w-xs px-4 py-2 rounded-xl bg-blue-100">
                                    <span className="animate-pulse">...</span>
                                </div>
                            </div>
                        )}
                         <div ref={chatEndRef} />
                    </div>
                )}
            </main>

            {currentCase && (
                <div className="fixed bottom-16 left-0 right-0 bg-white p-2 border-t z-10">
                     <div className="flex items-center">
                        <input 
                            type="text" 
                            value={chatInput}
                            onChange={(e) => setChatInput(e.target.value)}
                            onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                            className="flex-grow p-3 border rounded-full focus:outline-none focus:ring-2 focus:ring-blue-500"
                            placeholder="Escribe tu mensaje..."
                        />
                        <button onClick={handleSendMessage} disabled={isLoading || !chatInput} className="ml-2 p-3 bg-blue-600 rounded-full disabled:bg-gray-400">
                            <SendIcon />
                        </button>
                    </div>
                </div>
            )}
            
            <footer className="fixed bottom-0 left-0 right-0 bg-gray-100 border-t z-10">
                <div className="flex justify-around items-center h-16">
                    <button onClick={handleEmergency} className="flex flex-col items-center text-red-600">
                        <EmergencyIcon />
                        <span className="text-xs">Emergencia</span>
                    </button>
                    <button onClick={() => currentCase && generatePdf(currentCase)} disabled={!currentCase} className="flex flex-col items-center text-gray-700 disabled:text-gray-400">
                        <ReportIcon />
                        <span className="text-xs">Reporte</span>
                    </button>
                    <button onClick={handleShare} disabled={!currentCase} className="flex flex-col items-center text-gray-700 disabled:text-gray-400">
                        <ShareIcon />
                        <span className="text-xs">Compartir</span>
                    </button>
                    <button onClick={onShowHistory} className="flex flex-col items-center text-gray-700">
                        <HistoryIcon />
                        <span className="text-xs">Historial</span>
                    </button>
                </div>
            </footer>
        </div>
    );
};

export default MainInterface;
