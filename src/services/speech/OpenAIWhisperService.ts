import { SpeechRecognitionResult } from '@/types/speechRecognition';

export interface WhisperConfig {
  apiKey: string;
  model?: 'whisper-1';
  language?: string; // 'auto' for auto-detection or ISO codes like 'en', 'hi', 'ta'
  responseFormat?: 'json' | 'text' | 'srt' | 'verbose_json' | 'vtt';
  temperature?: number; // 0-1, controls randomness
  prompt?: string; // Optional context for better accuracy
}

export interface WhisperTranscriptionResponse {
  text: string;
  language?: string;
  duration?: number;
  segments?: Array<{
    start: number;
    end: number;
    text: string;
    confidence?: number;
  }>;
}

export class OpenAIWhisperService {
  private config: WhisperConfig;
  private isRecording = false;
  private mediaRecorder: MediaRecorder | null = null;
  private audioChunks: Blob[] = [];
  private stream: MediaStream | null = null;
  
  // Event handlers
  private onResultCallback?: (result: SpeechRecognitionResult) => void;
  private onErrorCallback?: (error: string) => void;
  private onEndCallback?: () => void;

  constructor(config: WhisperConfig) {
    this.config = {
      model: 'whisper-1',
      language: 'auto', // Auto-detect language
      responseFormat: 'verbose_json',
      temperature: 0,
      ...config
    };
  }

  // Check if browser supports MediaRecorder
  isSupported(): boolean {
    return !!(navigator.mediaDevices && navigator.mediaDevices.getUserMedia && window.MediaRecorder);
  }

  // Set up event handlers
  onResult(callback: (result: SpeechRecognitionResult) => void): void {
    this.onResultCallback = callback;
  }

  onError(callback: (error: string) => void): void {
    this.onErrorCallback = callback;
  }

  onEnd(callback: () => void): void {
    this.onEndCallback = callback;
  }

  // Start recording
  async start(): Promise<void> {
    if (this.isRecording) {
      throw new Error('Recording already in progress');
    }

    try {
      // Request microphone access
      this.stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          sampleRate: 16000, // Optimal for Whisper
          channelCount: 1,
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true
        }
      });

      // Set up MediaRecorder
      const options = {
        mimeType: this.getSupportedMimeType(),
        audioBitsPerSecond: 128000
      };

      this.mediaRecorder = new MediaRecorder(this.stream, options);
      this.audioChunks = [];

      // Handle data available
      this.mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          this.audioChunks.push(event.data);
        }
      };

      // Handle recording stop
      this.mediaRecorder.onstop = async () => {
        await this.processRecording();
      };

      // Handle errors
      this.mediaRecorder.onerror = (event) => {
        console.error('MediaRecorder error:', event);
        this.onErrorCallback?.('Recording failed');
      };

      // Start recording
      this.mediaRecorder.start();
      this.isRecording = true;
      
      console.log('🎤 Whisper recording started');

    } catch (error) {
      console.error('Failed to start Whisper recording:', error);
      this.onErrorCallback?.(`Failed to start recording: ${error}`);
      throw error;
    }
  }

  // Stop recording
  async stop(): Promise<void> {
    if (!this.isRecording || !this.mediaRecorder) {
      return;
    }

    this.mediaRecorder.stop();
    this.isRecording = false;

    // Clean up stream
    if (this.stream) {
      this.stream.getTracks().forEach(track => track.stop());
      this.stream = null;
    }

    console.log('🛑 Whisper recording stopped');
  }

  // Process the recorded audio
  private async processRecording(): Promise<void> {
    if (this.audioChunks.length === 0) {
      this.onErrorCallback?.('No audio data recorded');
      return;
    }

    try {
      // Create audio blob
      const audioBlob = new Blob(this.audioChunks, { 
        type: this.getSupportedMimeType() 
      });

      // Check minimum duration (Whisper needs at least 0.1s)
      if (audioBlob.size < 1000) {
        console.warn('Audio too short, skipping transcription');
        return;
      }

      console.log('📤 Sending audio to Whisper API...');
      
      // Send to Whisper API
      const transcription = await this.transcribeAudio(audioBlob);
      
      if (transcription.text.trim()) {
        // Create result object
        const result: SpeechRecognitionResult = {
          transcript: transcription.text.trim(),
          confidence: 0.95, // Whisper typically has high confidence
          isFinal: true,
          language: transcription.language || this.config.language || 'auto',
          timestamp: Date.now(),
          duration: transcription.duration,
          segments: transcription.segments
        };

        console.log('✅ Whisper transcription result:', result);
        this.onResultCallback?.(result);
      }

    } catch (error) {
      console.error('Whisper transcription error:', error);
      this.onErrorCallback?.(`Transcription failed: ${error}`);
    } finally {
      this.onEndCallback?.();
    }
  }

  // Send audio to OpenAI Whisper API
  private async transcribeAudio(audioBlob: Blob): Promise<WhisperTranscriptionResponse> {
    const formData = new FormData();
    
    // Convert blob to proper audio file
    const audioFile = new File([audioBlob], 'audio.webm', { 
      type: audioBlob.type 
    });
    
    formData.append('file', audioFile);
    formData.append('model', this.config.model!);
    formData.append('response_format', this.config.responseFormat!);
    formData.append('temperature', this.config.temperature!.toString());
    
    // Add language if specified (not 'auto')
    if (this.config.language && this.config.language !== 'auto') {
      formData.append('language', this.config.language);
    }
    
    // Add medical context for better accuracy
    if (this.config.prompt) {
      formData.append('prompt', this.config.prompt);
    }

    const response = await fetch('https://api.openai.com/v1/audio/transcriptions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${this.config.apiKey}`,
      },
      body: formData
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ error: 'Unknown error' }));
      throw new Error(`Whisper API error: ${response.status} - ${errorData.error?.message || 'Unknown error'}`);
    }

    const result = await response.json();
    
    // Handle different response formats
    if (this.config.responseFormat === 'verbose_json') {
      return {
        text: result.text,
        language: result.language,
        duration: result.duration,
        segments: result.segments
      };
    } else {
      return {
        text: typeof result === 'string' ? result : result.text
      };
    }
  }

  // Get supported MIME type for recording
  private getSupportedMimeType(): string {
    const types = [
      'audio/webm;codecs=opus',
      'audio/webm',
      'audio/mp4',
      'audio/mpeg'
    ];

    for (const type of types) {
      if (MediaRecorder.isTypeSupported(type)) {
        return type;
      }
    }
    
    return 'audio/webm'; // Fallback
  }

  // Update configuration
  updateConfig(newConfig: Partial<WhisperConfig>): void {
    this.config = { ...this.config, ...newConfig };
  }

  // Get current language
  getCurrentLanguage(): string {
    return this.config.language || 'auto';
  }

  // Set language
  setLanguage(language: string): void {
    this.config.language = language;
  }

  // Check if currently recording
  getIsRecording(): boolean {
    return this.isRecording;
  }

  // Clean up resources
  cleanup(): void {
    if (this.isRecording) {
      this.stop();
    }
    
    if (this.stream) {
      this.stream.getTracks().forEach(track => track.stop());
      this.stream = null;
    }
  }
}

// Medical context prompt for better accuracy
export const MEDICAL_CONTEXT_PROMPT = `
This is a medical consultation transcript. Please transcribe accurately including medical terms, symptoms, diagnoses, medications, and anatomical references. Common terms include: chest pain, shortness of breath, blood pressure, diabetes, hypertension, medication, prescription, symptoms, diagnosis, treatment, examination, patient, doctor.
`;

// Language codes for Indian languages
export const WHISPER_LANGUAGE_CODES = {
  'english': 'en',
  'hindi': 'hi',
  'bengali': 'bn',
  'tamil': 'ta',
  'telugu': 'te',
  'marathi': 'mr',
  'gujarati': 'gu',
  'kannada': 'kn',
  'malayalam': 'ml',
  'punjabi': 'pa',
  'odia': 'or',
  'assamese': 'as',
  'urdu': 'ur',
  'auto': 'auto'
};

export default OpenAIWhisperService;
