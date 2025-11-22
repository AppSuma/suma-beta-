import { GoogleGenAI, Chat, Content } from "@google/genai";
import type { Case, PatientData, Message } from '../types';
import { Sender } from "../types";

const API_KEY = "AIzaSyB0B3AI5ouQglG4eueIVjakLywMd4AFmzo";

let ai: GoogleGenAI | null = null;
let chat: Chat | null = null;

const getAi = () => {
    if (!ai) {
        ai = new GoogleGenAI({ apiKey: API_KEY });
    }
    return ai;
};

const SYSTEM_INSTRUCTION = Eres Suma, un asistente de IA para profesionales de la salud en situaciones de primera respuesta. Proporciona orientación clara, concisa y priorizada basada en la información proporcionada. No reemplazas el juicio clínico profesional. Tu primera respuesta DEBE SER OBLIGATORIAMENTE una lista numerada de acciones inmediatas a considerar, citando fuentes confiables como la OMS, AHA o la Cruz Roja cuando sea apropiado. En el chat posterior, responde a preguntas específicas de forma breve y directa.;

const buildInitialPrompt = (patientData: PatientData): string => {
  return `
    DATOS DEL PACIENTE:
    - Rol del profesional: ${patientData.role}
    - Edad: ${patientData.age}
    - Sexo: ${patientData.sex}
    - Antecedentes: ${patientData.background}
    - Medicamentos actuales: ${patientData.medications}
    - Síntomas y signos principales: ${patientData.symptoms}

    PREGUNTA: ¿QUÉ DEBO HACER?

    RESPUESTA (DEBE SER UNA LISTA NUMERADA de acciones inmediatas y prioritarias):
  `;
};

export const getInitialRecommendation = async (patientData: PatientData): Promise<string> => {
  const genAI = getAi();

  chat = genAI.chats.create({
    model: 'gemini-1.5-flash',
    config: {
      systemInstruction: SYSTEM_INSTRUCTION,
    },
  });

  const prompt = buildInitialPrompt(patientData);
  const result = await chat.sendMessage({ message: prompt });
  return result.text ?? "No se pudo obtener una recomendación.";
};

export const continueChat = async (message: string): Promise<string> => {
    if (!chat) {
        throw new Error("Chat not initialized. Call getInitialRecommendation or resumeChatFromHistory first.");
    }
    const result = await chat.sendMessage({ message: message });
    return result.text ?? "No se pudo obtener una respuesta.";
};

export const resumeChatFromHistory = async (caseData: Case): Promise<void> => {
    const genAI = getAi();

    const history: Content[] = caseData.chat.map((msg: Message) => ({
        role: msg.sender === Sender.User ? 'user' : 'model',
        parts: [{ text: msg.text }],
    }));

    const initialPrompt = buildInitialPrompt(caseData);
    history.unshift({
        role: 'user',
        parts: [{ text: initialPrompt }]
    });

    chat = genAI.chats.create({
        model: 'gemini-1.5-flash',
        config: {
            systemInstruction: SYSTEM_INSTRUCTION,
        },
        history: history,
    });
};