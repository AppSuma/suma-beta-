
import React, { useState, useRef, useEffect, useCallback } from 'react';
import type { Case, Message, PatientData } from '../types';
import { Sender, UserRole } from '../types';
import { getInitialRecommendation, continueChat, resumeChatFromHistory } from '../services/geminiService';
import { addCase, updateCase } from '../services/db';
import { generatePdf, generatePdfAsBlob } from '../utils/pdfGenerator';
import { handleEmergency } from '../utils/emergencyHelper';
import { ReportIcon, ShareIcon, HistoryIcon, SendIcon, EmergencyIcon, SumaLogo } from './Icons';
import LoadingSpinner from './LoadingSpinner';

interface CaseScreenProps {
  userRole: UserRole;
  initialCase?: Case;
  onShowHistory: () => void;
  onStartNewCase: () => void;
}

const CaseScreen: React.FC<CaseScreenProps> = ({ userRole, initialCase, onShowHistory }) => {
    const [currentCase, setCurrentCase] = useState<Case | null>(initialCase || null);
    const [patientData, setPatientData] = useState<Omit<PatientData, 'role'>>({
        age: initialCase?.age || '',
        sex: initialCase?.sex || '',
        background: initialCase?.background || '',
        medications: initialCase?.medications || '',
        symptoms: initialCase?.symptoms || '',
    });
    const [isLoading, setIsLoading] = useState(false);
    const [showInitialButton, setShowInitialButton] = useState(!initialCase);
    const [chatInput, setChatInput] = useState('');
    const chatEndRef = useRef<HTMLDivElement>(null);
    const reportContentRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [currentCase?.chat]);
    
    useEffect(() => {
        if (initialCase) {
            const setupResumedChat = async () => {
                setIsLoading(true);
                try {
                    await resumeChatFromHistory(initialCase);
                } catch (error) {
                    console.error("Failed to resume chat context:", error);
                    alert("Error al reanudar la conversación. Por favor, intente iniciar un nuevo caso.");
                } finally {
                    setIsLoading(false);
                }
            };
            setupResumedChat();
        }
    }, [initialCase]);

    const handleFormChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
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
        
        const fullPatientData: PatientData = { ...patientData, role: userRole };
        const newCase: Case = {
            ...fullPatientData,
            title: patientData.symptoms.split(',')[0].trim(),
            startTime: new Date().toISOString(),
            chat: [],
        };

        try {
            const recommendation = await getInitialRecommendation(fullPatientData);
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
    
    const handleGenerateReport = async () => {
        if (!currentCase) return;
        setIsLoading(true);
        await generatePdf(reportContentRef.current).catch(err => {
            console.error("Error generating PDF:", err);
            alert("No se pudo generar el reporte en PDF.");
        });
        setIsLoading(false);
    };
    
    const handleShareReport = async () => {
        if (!currentCase) return;
        setIsLoading(true);
        try {
            const result = await generatePdfAsBlob(reportContentRef.current);
            if (!result) throw new Error("PDF blob could not be created.");
            
            const { blob: pdfBlob, fileName } = result;
            const pdfFile = new File([pdfBlob], fileName, { type: 'application/pdf' });
            
            if (navigator.share && navigator.canShare && navigator.canShare({ files: [pdfFile] })) {
                await navigator.share({
                    title: `Reporte Suma: ${currentCase.title}`,
                    text: `Adjunto el reporte del caso: ${currentCase.title}`,
                    files: [pdfFile],
                });
            } else {
                alert('La función de compartir no es compatible. El reporte se descargará para que puedas compartirlo manualmente.');
                generatePdf(reportContentRef.current);
            }
        } catch (error) {
            if ((error as DOMException).name !== 'AbortError') {
                 console.error('Error al compartir o generar el reporte:', error);
                 alert('No se pudo compartir el reporte. Se intentará descargar en su lugar.');
                 generatePdf(reportContentRef.current);
            }
        } finally {
            setIsLoading(false);
        }
    };

    const summaryText = currentCase ? `${currentCase.role} | ${currentCase.sex} ${currentCase.age} | ${currentCase.background} | ${currentCase.medications} | ${currentCase.symptoms}` : '';

    return (
        <div className="flex flex-col h-full bg-white text-black">
            {isLoading && <LoadingSpinner />}
            {currentCase && (
                <header className="fixed top-0 left-0 right-0 bg-[#F5F5F5] p-2 border-b z-20 text-black shadow-sm">
                    <p className="text-xs text-black truncate px-2" title={summaryText}>
                        <span className="font-bold">{currentCase.role}</span> | {currentCase.sex} {currentCase.age} | {currentCase.background} | {currentCase.medications} | {currentCase.symptoms}
                    </p>
                </header>
            )}

            <main className={`flex-grow ${currentCase ? 'pt-12 pb-36' : 'pb-20'} overflow-y-auto bg-white`}>
                {!currentCase ? (
                    <div className="p-4 space-y-4">
                        <h1 className="text-2xl font-bold text-black">Nuevo Caso</h1>
                        <p className="text-gray-600">Tu rol: <span className="font-semibold">{userRole}</span></p>
                        
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700">Edad</label>
                                <input type="text" name="age" value={patientData.age} onChange={handleFormChange} className="mt-1 block w-full bg-white text-black border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm" placeholder="Ej: 45 años"/>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700">Sexo</label>
                                <input type="text" name="sex" value={patientData.sex} onChange={handleFormChange} className="mt-1 block w-full bg-white text-black border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm" placeholder="Ej: Hombre"/>
                            </div>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700">Antecedentes</label>
                            <input type="text" name="background" value={patientData.background} onChange={handleFormChange} className="mt-1 block w-full bg-white text-black border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm" placeholder="Ej: Hipertenso"/>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700">Medicamentos Relevantes</label>
                            <textarea name="medications" value={patientData.medications} onChange={handleFormChange} rows={2} className="mt-1 block w-full bg-white text-black border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm" placeholder="Ej: Losartán 50mg"/>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700">Síntomas y Signos Principales</label>
                            <textarea name="symptoms" value={patientData.symptoms} onChange={handleFormChange} rows={4} className="mt-1 block w-full bg-white text-black border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm" placeholder="Ej: Dolor abdominal agudo"/>
                        </div>
                        {showInitialButton && (
                            <button onClick={handleStartCase} disabled={isLoading} className="w-full py-4 mt-4 text-white bg-green-600 rounded-lg font-bold text-lg hover:bg-green-700 disabled:bg-gray-400 transition-colors">
                                "¿QUÉ DEBO HACER?"
                            </button>
                        )}
                    </div>
                ) : (
                    <div ref={reportContentRef} className="bg-white">
                        <div className="p-4 bg-white border-b border-gray-200">
                             <SumaLogo className="h-16 w-16 mx-auto mb-4" />
                             <h2 className="text-xl font-bold text-center mb-2 text-black">Reporte de Caso</h2>
                             <p className="text-sm text-center text-gray-600 mb-4">{new Date(currentCase.startTime).toLocaleString()}</p>
                             <div className="text-xs text-black bg-gray-50 p-3 rounded-lg border">
                                <p><span className="font-bold">Rol del Profesional:</span> {currentCase.role}</p>
                                <p><span className="font-bold">Paciente:</span> {currentCase.sex} {currentCase.age}</p>
                                <p><span className="font-bold">Antecedentes:</span> {currentCase.background}</p>
                                <p><span className="font-bold">Medicamentos:</span> {currentCase.medications}</p>
                                <p><span className="font-bold">Síntomas Principales:</span> {currentCase.symptoms}</p>
                             </div>
                        </div>
                        <div className="p-4 space-y-4">
                            {currentCase.chat.map((msg, index) => (
                                <div key={index} className={`flex ${msg.sender === Sender.User ? 'justify-end' : 'justify-start'}`}>
                                    <div className={`max-w-xs md:max-w-md lg:max-w-lg px-4 py-3 rounded-2xl whitespace-pre-wrap shadow-sm ${msg.sender === Sender.User ? 'bg-[#E8F5E8] text-black' : 'bg-[#E1F5FE] text-blue-900'}`}>
                                        {msg.text}
                                    </div>
                                </div>
                            ))}
                             <div ref={chatEndRef} />
                        </div>
                    </div>
                )}
            </main>

            {currentCase && (
                <div className="fixed bottom-20 left-0 right-0 bg-white p-2 border-t z-10">
                     <div className="flex items-center">
                        <textarea
                            value={chatInput}
                            onChange={(e) => setChatInput(e.target.value)}
                            onKeyPress={(e) => e.key === 'Enter' && !e.shiftKey && (e.preventDefault(), handleSendMessage())}
                            className="flex-grow p-3 bg-white text-black border border-gray-300 rounded-full focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                            placeholder="Escribe tu mensaje..."
                            rows={1}
                        />
                        <button onClick={handleSendMessage} disabled={isLoading || !chatInput} className="ml-2 p-3 bg-blue-600 rounded-full disabled:bg-gray-400 transition-colors">
                            <SendIcon />
                        </button>
                    </div>
                </div>
            )}
            
            <footer className="fixed bottom-0 left-0 right-0 bg-white border-t z-20 shadow-[-2px_0_10px_rgba(0,0,0,0.1)]">
                <div className="flex justify-around items-center h-20 px-1">
                    <button onClick={handleEmergency} className="flex flex-col items-center justify-center h-full px-2 text-red-600 rounded-lg w-1/4 font-semibold">
                        <EmergencyIcon />
                        <span className="text-xs text-center mt-1">LLAMAR EMERGENCIA + ENVIAR UBICACIÓN</span>
                    </button>
                    <button onClick={handleGenerateReport} disabled={!currentCase} className="flex flex-col items-center justify-center h-full px-2 text-gray-700 disabled:text-gray-400 w-1/4">
                        <ReportIcon />
                        <span className="text-xs text-center mt-1">GENERAR REPORTE PDF</span>
                    </button>
                    <button onClick={handleShareReport} disabled={!currentCase} className="flex flex-col items-center justify-center h-full px-2 text-gray-700 disabled:text-gray-400 w-1/4">
                        <ShareIcon />
                        <span className="text-xs text-center mt-1">COMPARTIR REPORTE</span>
                    </button>
                    <button onClick={onShowHistory} className="flex flex-col items-center justify-center h-full px-2 text-gray-700 w-1/4">
                        <HistoryIcon />
                        <span className="text-xs text-center mt-1">VER HISTORIAL</span>
                    </button>
                </div>
            </footer>
        </div>
    );
};

export default CaseScreen;
