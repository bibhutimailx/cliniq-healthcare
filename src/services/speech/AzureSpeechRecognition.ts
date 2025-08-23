
import { SpeechRecognitionConfig, SpeechRecognitionResult, SpeechRecognitionService } from '@/types/speechRecognition';

export class AzureSpeechRecognition implements SpeechRecognitionService {
  private config: SpeechRecognitionConfig;
  private recognizer: any = null;
  private resultCallback?: (result: SpeechRecognitionResult) => void;
  private errorCallback?: (error: string) => void;
  private endCallback?: () => void;

  constructor(config: SpeechRecognitionConfig) {
    this.config = config;
  }

  async start(): Promise<void> {
    if (!this.config.apiKey || !this.config.region) {
      throw new Error('Azure Speech API key and region are required');
    }

    try {
      // Note: In production, you'd import the Azure Speech SDK
      // import * as sdk from 'microsoft-cognitiveservices-speech-sdk';
      
      // For now, we'll use a REST API approach
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      this.startAzureRecognition(stream);
    } catch (error) {
      this.errorCallback?.(`Failed to start Azure recognition: ${error}`);
    }
  }

  private async startAzureRecognition(stream: MediaStream): Promise<void> {
    // This is a simplified implementation
    // In production, use the Azure Speech SDK for real-time recognition
    const mediaRecorder = new MediaRecorder(stream);
    const audioChunks: Blob[] = [];

    mediaRecorder.ondataavailable = (event) => {
      audioChunks.push(event.data);
    };

    mediaRecorder.onstop = async () => {
      const audioBlob = new Blob(audioChunks, { type: 'audio/wav' });
      await this.processAzureAudio(audioBlob);
    };

    mediaRecorder.start();
    
    // Stop after a few seconds for demo purposes
    setTimeout(() => {
      mediaRecorder.stop();
    }, 5000);
  }

  private async processAzureAudio(audioBlob: Blob): Promise<void> {
    try {
      // Construct URL with query parameters
      const params = new URLSearchParams({
        language: this.config.language,
        format: 'detailed',
      });
      
      const url = `https://${this.config.region}.stt.speech.microsoft.com/speech/recognition/conversation/cognitiveservices/v1?${params.toString()}`;
      
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Ocp-Apim-Subscription-Key': this.config.apiKey!,
          'Content-Type': 'audio/wav',
        },
        body: audioBlob,
      });

      const data = await response.json();
      
      if (data.NBest && data.NBest.length > 0) {
        const result = data.NBest[0];
        
        this.resultCallback?.({
          transcript: result.Display,
          confidence: result.Confidence,
          isFinal: true,
          alternatives: data.NBest.slice(1),
        });
      }
    } catch (error) {
      this.errorCallback?.(`Azure speech recognition error: ${error}`);
    }
  }

  stop(): void {
    if (this.recognizer) {
      this.recognizer.close();
      this.recognizer = null;
    }
    this.endCallback?.();
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
