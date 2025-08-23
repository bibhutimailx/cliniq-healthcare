import { SpeechRecognitionConfig, SpeechRecognitionResult, SpeechRecognitionService } from '@/types/speechRecognition';

// Enhanced Reverie Speech-to-Text with Automatic Language Detection
export class ReverieSpeechRecognition implements SpeechRecognitionService {
  private config: SpeechRecognitionConfig;
  private ws: WebSocket | null = null;
  private isRecording = false;
  private mediaRecorder: MediaRecorder | null = null;
  private audioStream: MediaStream | null = null;
  private resultCallback?: (result: SpeechRecognitionResult) => void;
  private errorCallback?: (error: string) => void;
  private endCallback?: () => void;
  private languageCallback?: (language: string) => void;
  private currentLanguage = 'en';

  constructor(config: SpeechRecognitionConfig) {
    this.config = config;
  }

  async start(): Promise<void> {
    if (!this.config.apiKey) {
      throw new Error('Reverie API key is required');
    }

    try {
      // Initialize audio stream with enhanced quality
      this.audioStream = await navigator.mediaDevices.getUserMedia({ 
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true,
          sampleRate: 48000,
          channelCount: 1
        } 
      });

      // Initialize WebSocket connection
      const endpoint = 'wss://api.reverieinc.com/speech-to-text/stream';
      this.ws = new WebSocket(endpoint);
      this.isRecording = true;

      this.ws.onopen = async () => {
        // Send authentication and config with language detection
        this.ws?.send(JSON.stringify({
          apiId: 'dev.bibhutimailx',
          apiKey: this.config.apiKey,
          language: 'auto', // Enable automatic language detection
          enableLanguageDetection: true,
          enableContinuousRecognition: true,
          enableInterimResults: true,
          enablePunctuation: true,
          audioFormat: 'opus',
          sampleRate: 48000
        }));

        // Start continuous audio streaming
        await this.startAudioStreaming();
      };

      this.ws.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          
          // Handle language detection
          if (data.detectedLanguage && data.detectedLanguage !== this.currentLanguage) {
            this.currentLanguage = data.detectedLanguage;
            this.languageCallback?.(data.detectedLanguage);
            console.log(`Language detected: ${data.detectedLanguage}`);
          }

          // Handle transcript results
          if (data.transcript) {
            this.resultCallback?.({
              transcript: data.transcript,
              confidence: data.confidence || 0.9,
              isFinal: data.isFinal ?? true,
              alternatives: data.alternatives || [],
              language: this.currentLanguage
            });
          }

          // Handle interim results for real-time feedback
          if (data.interimTranscript) {
            this.resultCallback?.({
              transcript: data.interimTranscript,
              confidence: data.confidence || 0.7,
              isFinal: false,
              alternatives: data.alternatives || [],
              language: this.currentLanguage
            });
          }
        } catch (err) {
          this.errorCallback?.('Failed to parse Reverie response');
        }
      };

      this.ws.onerror = (event: any) => {
        this.isRecording = false;
        this.errorCallback?.('Reverie WebSocket error');
        this.cleanup();
      };

      this.ws.onclose = () => {
        this.isRecording = false;
        this.cleanup();
        this.endCallback?.();
      };
      
    } catch (error) {
      this.errorCallback?.(`Failed to start Reverie recognition: ${error}`);
      throw error;
    }
  }

  private async startAudioStreaming(): Promise<void> {
    if (!this.audioStream) return;

    try {
      this.mediaRecorder = new MediaRecorder(this.audioStream, { 
        mimeType: 'audio/webm;codecs=opus',
        audioBitsPerSecond: 128000
      });

      this.mediaRecorder.ondataavailable = (event) => {
        if (event.data && event.data.size > 0 && this.ws?.readyState === WebSocket.OPEN) {
          this.ws.send(event.data);
        }
      };

      // Continuous streaming like Zoom - smaller chunks for real-time
      this.mediaRecorder.start(100); // Send audio every 100ms for continuous recognition
    } catch (err) {
      this.errorCallback?.('Microphone access denied or not available');
      this.stop();
    }
  }

  stop(): void {
    if (this.mediaRecorder && this.mediaRecorder.state !== 'inactive') {
      this.mediaRecorder.stop();
    }
    
    if (this.audioStream) {
      this.audioStream.getTracks().forEach(track => track.stop());
      this.audioStream = null;
    }
    
    if (this.ws && this.ws.readyState === WebSocket.OPEN) {
      this.ws.close();
    }
    
    this.isRecording = false;
    this.cleanup();
    this.endCallback?.();
  }

  private cleanup() {
    if (this.mediaRecorder) {
      this.mediaRecorder = null;
    }
    if (this.audioStream) {
      this.audioStream.getTracks().forEach(track => track.stop());
      this.audioStream = null;
    }
    if (this.ws) {
      this.ws = null;
    }
  }

  onResult(callback: (result: SpeechRecognitionResult) => void): void {
    this.resultCallback = callback;
  }

  onError(callback: (error: string) => void): void {
    this.errorCallback = callback;
  }

  onEnd(callback: () => void): void {
    this.endCallback = callback;
  }

  onLanguageDetected(callback: (language: string) => void): void {
    this.languageCallback = callback;
  }

  isSupported(): boolean {
    return typeof WebSocket !== 'undefined' && !!(navigator.mediaDevices && navigator.mediaDevices.getUserMedia);
  }

  getCurrentLanguage(): string {
    return this.currentLanguage;
  }
} 