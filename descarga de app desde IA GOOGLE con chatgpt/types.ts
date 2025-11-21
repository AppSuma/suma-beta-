export enum Sender {
  User = 'user',
  AI = 'ai',
}

export interface Message {
  sender: Sender;
  text: string;
  timestamp: string;
}

export enum UserRole {
  Medico = 'Médico',
  Paramedico = 'Paramédico',
  Enfermero = 'Enfermero/a',
  PrimerRespondiente = 'Primer Respondiente',
}

export interface PatientData {
  role: UserRole;
  age: string;
  sex: string;
  background: string; // Antecedentes
  medications: string;
  symptoms: string;
}

export interface Case extends PatientData {
  id?: number;
  title: string;
  startTime: string;
  chat: Message[];
}