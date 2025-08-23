
import { SpeechRecognitionConfig, SpeechRecognitionResult, SpeechRecognitionService } from '@/types/speechRecognition';

export class GoogleSpeechRecognition implements SpeechRecognitionService {
  private config: SpeechRecognitionConfig;
  private mediaRecorder: MediaRecorder | null = null;
  private audioChunks: Blob[] = [];
  private isRecording = false;
  private resultCallback?: (result: SpeechRecognitionResult) => void;
  private errorCallback?: (error: string) => void;
  private endCallback?: () => void;

  constructor(config: SpeechRecognitionConfig) {
    this.config = config;
  }

  async start(): Promise<void> {
    if (!this.config.apiKey) {
      throw new Error('Google Cloud Speech API key is required');
    }

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      this.mediaRecorder = new MediaRecorder(stream);
      this.audioChunks = [];

      this.mediaRecorder.ondataavailable = (event) => {
        this.audioChunks.push(event.data);
      };

      this.mediaRecorder.onstop = async () => {
        const audioBlob = new Blob(this.audioChunks, { type: 'audio/wav' });
        await this.processAudio(audioBlob);
      };

      this.mediaRecorder.start(1000); // Collect audio every second
      this.isRecording = true;
    } catch (error) {
      this.errorCallback?.(`Failed to start recording: ${error}`);
    }
  }

  stop(): void {
    if (this.mediaRecorder && this.isRecording) {
      this.mediaRecorder.stop();
      this.isRecording = false;
      this.endCallback?.();
    }
  }

  private async processAudio(audioBlob: Blob): Promise<void> {
    try {
      const base64Audio = await this.blobToBase64(audioBlob);
      
      const response = await fetch('https://speech.googleapis.com/v1/speech:recognize', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.config.apiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          config: {
            encoding: 'WEBM_OPUS',
            sampleRateHertz: 48000,
            languageCode: this.config.language,
            maxAlternatives: this.config.maxAlternatives || 1,
            enableAutomaticPunctuation: true,
          },
          audio: {
            content: base64Audio.split(',')[1], // Remove data:audio/wav;base64, prefix
          },
        }),
      });

      const data = await response.json();
      
      if (data.results && data.results.length > 0) {
        const result = data.results[0];
        const alternative = result.alternatives[0];
        
        this.resultCallback?.({
          transcript: alternative.transcript,
          confidence: alternative.confidence || 0.9,
          isFinal: true,
          alternatives: result.alternatives.slice(1),
        });
      }
    } catch (error) {
      this.errorCallback?.(`Speech recognition error: ${error}`);
    }
  }

  private blobToBase64(blob: Blob): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = reject;
      reader.readAsDataURL(blob);
    });
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

  isSupported(): boolean {
    return !!(navigator.mediaDevices && navigator.mediaDevices.getUserMedia);
  }
}
