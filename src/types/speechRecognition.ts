
export interface SpeechRecognitionConfig {
  provider: 'google' | 'azure' | 'browser' | 'reverie' | 'assemblyai' | 'enhanced-browser' | 'aws-bedrock' | 'anthropic' | 'enhanced-multilingual' | 'basic' | 'aws-medical';
  language: string;
  continuous?: boolean;
  interimResults?: boolean;
  apiKey?: string;
  region?: string;
  endpoint?: string;
  accessKeyId?: string;
  secretAccessKey?: string;
  sessionToken?: string;
}

export interface SpeechRecognitionResult {
  transcript: string;
  confidence: number;
  isFinal: boolean;
  alternatives?: string[];
  language?: string; // Add language field for automatic detection
  speaker?: string; // Add speaker field for speaker diarization
}

export interface SpeechRecognitionService {
  start(): Promise<void>;
  stop(): void;
  onResult(callback: (result: SpeechRecognitionResult) => void): void;
  onError(callback: (error: string) => void): void;
  onEnd(callback: () => void): void;
  onLanguageDetected?(callback: (language: string) => void): void; // Add optional language detection callback
  onSpeakerDetected?(callback: (speaker: string) => void): void; // Add optional speaker detection callback
  isSupported(): boolean;
  getCurrentLanguage?(): string; // Add optional method to get current language
  getCurrentSpeaker?(): string; // Add optional method to get current speaker
}
