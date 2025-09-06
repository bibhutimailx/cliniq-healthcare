
import { SpeechRecognitionConfig, SpeechRecognitionService, SpeechRecognitionResult } from '@/types/speechRecognition';
import { EnhancedRegionalSpeechRecognition } from './speech/EnhancedRegionalSpeechRecognition';
import { AWSTranscribeMedicalService } from './speech/AWSTranscribeMedicalService';

// Extend Window interface for speech recognition
declare global {
  interface Window {
    SpeechRecognition?: any;
    webkitSpeechRecognition?: any;
    getConfig?: (key: string) => string;
    APP_CONFIG?: Record<string, any>;
  }
}

// Basic browser speech recognition service implementation
class BrowserSpeechRecognitionService implements SpeechRecognitionService {
  private recognition: any;
  private onResultCallback?: (result: SpeechRecognitionResult) => void;
  private onErrorCallback?: (error: string) => void;
  private onEndCallback?: () => void;
  private onLanguageDetectedCallback?: (language: string) => void;
  private onSpeakerDetectedCallback?: (speaker: string) => void;

  constructor(private config: SpeechRecognitionConfig) {
    this.initializeRecognition();
  }

  private initializeRecognition() {
    if (typeof window === 'undefined') return;

    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) return;

    this.recognition = new SpeechRecognition();
    this.recognition.continuous = this.config.continuous || true;
    this.recognition.interimResults = this.config.interimResults || false;
    this.recognition.lang = this.config.language || 'en-US';

    this.recognition.onresult = (event: any) => {
      const result = event.results[event.results.length - 1];
      if (this.onResultCallback) {
        this.onResultCallback({
          transcript: result[0].transcript,
          confidence: result[0].confidence,
          isFinal: result.isFinal,
          language: this.config.language,
          speaker: 'doctor' // Default speaker
        });
      }
    };

    this.recognition.onerror = (event: any) => {
      if (this.onErrorCallback) {
        this.onErrorCallback(event.error);
      }
    };

    this.recognition.onend = () => {
      if (this.onEndCallback) {
        this.onEndCallback();
      }
    };
  }

  async start(): Promise<void> {
    if (this.recognition) {
      this.recognition.start();
    }
  }

  stop(): void {
    if (this.recognition) {
      this.recognition.stop();
    }
  }

  onResult(callback: (result: SpeechRecognitionResult) => void): void {
    this.onResultCallback = callback;
  }

  onError(callback: (error: string) => void): void {
    this.onErrorCallback = callback;
  }

  onEnd(callback: () => void): void {
    this.onEndCallback = callback;
  }

  onLanguageDetected(callback: (language: string) => void): void {
    this.onLanguageDetectedCallback = callback;
  }

  onSpeakerDetected(callback: (speaker: string) => void): void {
    this.onSpeakerDetectedCallback = callback;
  }

  isSupported(): boolean {
    return typeof window !== 'undefined' && !!(window.SpeechRecognition || window.webkitSpeechRecognition);
  }

  getCurrentLanguage(): string {
    return this.config.language;
  }

  getCurrentSpeaker(): string {
    return 'doctor'; // Default speaker
  }
}

// Create speech recognition service with priority for medical applications
export const createSpeechRecognitionService = (config: SpeechRecognitionConfig): SpeechRecognitionService => {
  // Get API keys from environment or config
  const apiKeys = {
    assemblyAI: process.env.ASSEMBLYAI_API_KEY || window.getConfig?.('ASSEMBLYAI_API_KEY') || config.apiKey,
    google: process.env.GOOGLE_CLOUD_API_KEY || window.getConfig?.('GOOGLE_CLOUD_API_KEY'),
    azure: process.env.AZURE_SPEECH_KEY || window.getConfig?.('AZURE_SPEECH_KEY'),
    reverie: process.env.REVERIE_API_KEY || window.getConfig?.('REVERIE_API_KEY'),
    anthropic: process.env.ANTHROPIC_API_KEY || window.getConfig?.('ANTHROPIC_API_KEY')
  };

  // Enhanced configuration for unified service
  const unifiedConfig = {
    ...config,
    autoDetectLanguage: true,
    supportedLanguages: ['en-US', 'hi-IN', 'or-IN', 'bn-IN', 'ta-IN', 'te-IN', 'ml-IN', 'kn-IN', 'gu-IN', 'mr-IN', 'pa-IN'],
    apiKeys
  };

  // Try to use UnifiedSpeechRecognition if available
  try {
    // Check if we have any API keys available
    const hasApiKeys = Object.values(apiKeys).some(key => key && key.length > 0);
    
    if (hasApiKeys) {
      // Dynamic import for UnifiedSpeechRecognition
      // This will be loaded asynchronously, so we'll fall back for now
      console.log('🚀 API keys available - Unified Speech Recognition will be used when available');
    }
  } catch (error) {
    console.warn('Unified Speech Recognition not available, using legacy services');
  }

  // Fallback to legacy services
  
  // Priority 1: AWS Transcribe Medical (best for medical applications)
  if (config.accessKeyId && config.secretAccessKey) {
    try {
      const awsService = new AWSTranscribeMedicalService(config);
      if (awsService.isSupported()) {
        console.log('🏥 Using AWS Transcribe Medical (highest accuracy for medical terminology)');
        return awsService;
      }
    } catch (error) {
      console.warn('AWS Transcribe Medical not available, falling back to browser speech recognition:', error);
    }
  }

  // Priority 2: Enhanced Regional Speech Recognition (for regional languages)
  const regionalLanguages = ['or-IN', 'hi-IN', 'bn-IN', 'ta-IN', 'te-IN', 'ml-IN', 'kn-IN', 'gu-IN', 'mr-IN', 'pa-IN', 'ur-IN'];
  if (regionalLanguages.includes(config.language)) {
    console.log(`🎯 Using Enhanced Regional Speech Recognition for ${config.language}`);
    return new EnhancedRegionalSpeechRecognition(config);
  }
  
  // Priority 3: Browser Speech Recognition (fallback - most reliable)
  console.log(`🌐 Using Browser Speech Recognition for ${config.language} (no external API required)`);
  return new BrowserSpeechRecognitionService(config);
};

// Get the best available speech recognition provider
export const getBestAvailableProvider = (): 'aws-medical' | 'enhanced-multilingual' | 'browser' | 'basic' => {
  // Check for basic browser support first (most reliable, no external APIs)
  if (typeof window !== 'undefined' && (window.SpeechRecognition || window.webkitSpeechRecognition)) {
    return 'browser';
  }
  
  // Check for AWS Transcribe Medical (requires credentials)
  if (typeof window !== 'undefined' && window.AWS) {
    return 'aws-medical';
  }
  
  // Check for enhanced multilingual support
  if (typeof window !== 'undefined' && window.SpeechRecognition) {
    return 'enhanced-multilingual';
  }
  
  // Fallback to basic support
  return 'basic';
};

// Create speech recognition configuration
export const createSpeechRecognitionConfig = (language: string = 'en-US'): SpeechRecognitionConfig => {
  return {
    provider: 'browser', // Default to browser speech recognition (no external APIs)
    language,
    continuous: true,
    interimResults: false
  };
};

// Check if speech recognition is supported
export const isSpeechRecognitionSupported = (): boolean => {
  if (typeof window === 'undefined') return false;
  
  const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
  return !!SpeechRecognition;
};

// Get supported languages
export const getSupportedLanguages = () => {
  return [
    { code: 'en-US', name: 'English (US)' },
    { code: 'hi-IN', name: 'Hindi (India)' },
    { code: 'or-IN', name: 'Odia (India)' },
    { code: 'bn-IN', name: 'Bengali (India)' },
    { code: 'ta-IN', name: 'Tamil (India)' },
    { code: 'te-IN', name: 'Telugu (India)' },
    { code: 'ml-IN', name: 'Malayalam (India)' },
    { code: 'kn-IN', name: 'Kannada (India)' },
    { code: 'gu-IN', name: 'Gujarati (India)' },
    { code: 'mr-IN', name: 'Marathi (India)' },
    { code: 'pa-IN', name: 'Punjabi (India)' },
    { code: 'ur-IN', name: 'Urdu (India)' }
  ];
};

// Get service capabilities
export const getServiceCapabilities = () => {
  const provider = getBestAvailableProvider();
  
  return {
    provider,
    enhanced: provider === 'aws-medical' || provider === 'enhanced-multilingual',
    multilingual: provider === 'enhanced-multilingual',
    medicalEntityExtraction: provider === 'aws-medical',
    speakerDetection: provider === 'aws-medical' || provider === 'enhanced-multilingual',
    realTimeProcessing: true,
    medicalSpecialty: provider === 'aws-medical'
  };
};

// Get AWS Transcribe Medical specialties
export const getMedicalSpecialties = () => {
  return [
    { code: 'PRIMARYCARE', name: 'Primary Care' },
    { code: 'CARDIOLOGY', name: 'Cardiology' },
    { code: 'NEUROLOGY', name: 'Neurology' },
    { code: 'ORTHOPEDICS', name: 'Orthopedics' },
    { code: 'RADIOLOGY', name: 'Radiology' },
    { code: 'UROLOGY', name: 'Urology' },
    { code: 'DERMATOLOGY', name: 'Dermatology' },
    { code: 'ONCOLOGY', name: 'Oncology' },
    { code: 'PEDIATRICS', name: 'Pediatrics' },
    { code: 'EMERGENCY', name: 'Emergency Medicine' }
  ];
};
