
export interface TranscriptEntry {
  id: string;
  speaker: 'doctor' | 'patient' | 'guest1' | 'guest2' | 'guest3' | 'guest4';
  text: string;
  timestamp: string;
  language: string;
  confidence?: number;
  mood?: 'neutral' | 'stressed' | 'confused' | 'happy' | 'concerned' | 'anxious' | 'calm';
  empathyScore?: number;
  clarityScore?: number;
  voiceSignature?: string;
}

export interface MedicalEntity {
  text: string;
  type: 'symptom' | 'condition' | 'medication' | 'date' | 'location' | 'modifier';
  confidence?: number;
  severity?: 'low' | 'medium' | 'high';
}

export interface Language {
  value: string;
  label: string;
  code: string;
}

export interface SpeechRecognitionWindow extends Window {
  SpeechRecognition?: any;
  webkitSpeechRecognition?: any;
}

export interface PatientProfile {
  id: string;
  name: string;
  voiceSignature?: string;
  previousVisits: ConsultationSession[];
  preferences: {
    language: string;
    communicationStyle: string;
  };
  medicalHistory: {
    recurringSymptoms: string[];
    chronicConditions: string[];
    medications: string[];
    lastMentioned: { [key: string]: string };
  };
}

export interface ConsultationSession {
  id: string;
  patientId: string;
  date: string;
  transcript: TranscriptEntry[];
  medicalEntities: MedicalEntity[];
  clarityScore: number;
  empathyScore: number;
  summary: string;
  qrCode?: string;
  templates?: MedicalTemplate[];
}

export interface ClarityAnalysis {
  score: number;
  issues: string[];
  suggestions: string[];
  completeness: number;
  followUpQuestions: number;
  medicalJargonUsed: boolean;
  patientUnderstanding: 'high' | 'medium' | 'low';
}

export interface MedicalTemplate {
  id: string;
  name: string;
  category: 'pediatric' | 'geriatric' | 'general' | 'emergency' | 'followup';
  voiceTrigger: string;
  template: string;
  adaptiveFields: string[];
}

export interface MultiRoleSummary {
  doctor: string;
  nurse: string;
  receptionist: string;
  patient: string;
  translated?: { [language: string]: string };
}

export interface EmpathyAnalysis {
  overallScore: number;
  empathyMoments: Array<{
    timestamp: string;
    speaker: 'doctor' | 'patient' | 'guest1' | 'guest2' | 'guest3' | 'guest4';
    text: string;
    empathyLevel: number;
    emotional_state: string;
  }>;
  recommendations: string[];
}
