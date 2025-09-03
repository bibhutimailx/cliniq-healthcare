
export interface SpeechRecognitionResult {
  transcript: string;
  confidence: number;
  language?: string;
  medicalEntities?: string[];
  speakerRole?: 'doctor' | 'patient' | 'unknown';
  isFinal?: boolean;
  timestamp?: number;
}

export interface SpeechRecognitionConfig {
  language: string;
  continuous: boolean;
  interimResults: boolean;
  maxAlternatives: number;
  service: string;
  apiKey?: string;
  region?: string;
  endpoint?: string;
}

export interface SpeechRecognitionService {
  start(): Promise<void>;
  stop(): Promise<void>;
  isSupported(): boolean;
  onResult(callback: (result: SpeechRecognitionResult) => void): void;
  onError(callback: (error: Error) => void): void;
  onStart(callback: () => void): void;
  onStop(callback: () => void): void;
}

export interface AudioConfig {
  sampleRate: number;
  channels: number;
  format: string;
}

export interface MedicalEntity {
  text: string;
  type: 'symptom' | 'diagnosis' | 'medication' | 'procedure' | 'body_part';
  confidence: number;
  language: string;
}

export interface SpeakerInfo {
  role: 'doctor' | 'patient' | 'unknown';
  confidence: number;
  indicators: string[];
}

export interface TranscriptionSegment {
  text: string;
  startTime: number;
  endTime: number;
  speaker?: string;
  confidence: number;
}

export interface SpeechRecognitionError {
  error: string;
  message: string;
  code?: string;
  details?: Record<string, unknown>;
}

// Generic event handler type
export type EventHandler<T = unknown> = (event: T) => void;

// Generic callback type
export type Callback<T = unknown> = (data: T) => void;

// Generic API response type
export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

// Generic configuration type
export interface GenericConfig {
  [key: string]: unknown;
}

// Audio stream type
export interface AudioStream {
  id: string;
  format: string;
  sampleRate: number;
  channels: number;
  data: ArrayBuffer | Blob;
}

// WebSocket message type
export interface WebSocketMessage {
  type: string;
  data: unknown;
  timestamp: number;
}

// Browser support interface
export interface BrowserSupport {
  speechRecognition: boolean;
  mediaDevices: boolean;
  getUserMedia: boolean;
  webkitSpeechRecognition: boolean;
  mozSpeechRecognition: boolean;
  msSpeechRecognition: boolean;
}
