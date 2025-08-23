
import { SpeechRecognitionConfig, SpeechRecognitionResult, SpeechRecognitionService } from '@/types/speechRecognition';

export class BrowserSpeechRecognition implements SpeechRecognitionService {
  private recognition: any = null;
  private config: SpeechRecognitionConfig;
  private isStarted = false;
  private restartAttempts = 0;
  private maxRestartAttempts = 3;
  private restartTimeout?: NodeJS.Timeout;
  private resultCallback?: (result: SpeechRecognitionResult) => void;
  private errorCallback?: (error: string) => void;
  private endCallback?: () => void;

  constructor(config: SpeechRecognitionConfig) {
    this.config = config;
    this.initializeRecognition();
  }

  private initializeRecognition() {
    const windowWithSpeech = window as any;
    const SpeechRecognition = windowWithSpeech.SpeechRecognition || 
                             windowWithSpeech.webkitSpeechRecognition ||
                             windowWithSpeech.mozSpeechRecognition ||
                             windowWithSpeech.msSpeechRecognition;
    
    if (SpeechRecognition) {
      this.recognition = new SpeechRecognition();
      
      // Optimized settings for better performance
      this.recognition.continuous = true;
      this.recognition.interimResults = false; // Only final results for better accuracy
      this.recognition.maxAlternatives = 1;
      this.recognition.lang = this.config.language;
      
      // Add performance optimizations
      if (this.recognition.serviceURI) {
        this.recognition.serviceURI = 'wss://www.google.com/speech-api/v2/recognize';
      }
    }
  }

  async start(): Promise<void> {
    if (!this.recognition) {
      throw new Error('Browser speech recognition not supported. Please use Chrome, Edge, or Safari.');
    }
    
    if (this.isStarted) {
      console.log('Speech recognition already started');
      return;
    }
    
    try {
      // Clear any existing restart timeout
      if (this.restartTimeout) {
        clearTimeout(this.restartTimeout);
      }

      this.recognition.start();
      this.isStarted = true;
      this.restartAttempts = 0; // Reset restart attempts on successful start
      console.log('Browser speech recognition started successfully');
    } catch (error) {
      console.error('Failed to start speech recognition:', error);
      this.isStarted = false;
      throw error;
    }
  }

  stop(): void {
    // Clear restart timeout
    if (this.restartTimeout) {
      clearTimeout(this.restartTimeout);
    }
    
    if (this.recognition && this.isStarted) {
      try {
        this.recognition.stop();
        this.isStarted = false;
        this.restartAttempts = 0;
        console.log('Browser speech recognition stopped');
      } catch (error) {
        console.error('Error stopping speech recognition:', error);
      }
    }
  }

  onResult(callback: (result: SpeechRecognitionResult) => void): void {
    this.resultCallback = callback;
    
    if (this.recognition) {
      this.recognition.onresult = (event: any) => {
        try {
          const lastResult = event.results[event.results.length - 1];
          if (lastResult.isFinal) {
            const transcript = lastResult[0].transcript.trim();
            const confidence = lastResult[0].confidence || 0.9;
            
            if (transcript.length > 0) {
              callback({
                transcript: transcript,
                confidence: confidence,
                isFinal: true,
                alternatives: Array.from(lastResult).slice(1).map((alt: any) => ({
                  transcript: alt.transcript,
                  confidence: alt.confidence || 0.8,
                })),
              });
            }
          }
        } catch (error) {
          console.error('Error processing speech result:', error);
        }
      };
    }
  }

  onError(callback: (error: string) => void): void {
    this.errorCallback = callback;
    
    if (this.recognition) {
      this.recognition.onerror = (event: any) => {
        console.error('Speech recognition error:', event.error);
        this.isStarted = false;
        
        let errorMessage = 'Speech recognition error';
        let shouldRestart = false;
        
        // Handle specific errors
        switch (event.error) {
          case 'not-allowed':
            errorMessage = 'Microphone access denied. Please allow microphone access in your browser settings.';
            shouldRestart = false;
            break;
          case 'no-speech':
            errorMessage = 'No speech detected. Please speak clearly and try again.';
            shouldRestart = true;
            break;
          case 'network':
            errorMessage = 'Network error. Please check your internet connection.';
            shouldRestart = true;
            break;
          case 'audio-capture':
            errorMessage = 'Audio capture error. Please check your microphone and try again.';
            shouldRestart = true;
            break;
          case 'aborted':
            // Don't report aborted as error - it's usually intentional
            return;
          case 'service-not-allowed':
            errorMessage = 'Speech recognition service not allowed. Please check your browser settings.';
            shouldRestart = false;
            break;
          default:
            errorMessage = `Speech recognition error: ${event.error}`;
            shouldRestart = true;
        }
        
        callback(errorMessage);
        
        // Auto-restart for recoverable errors
        if (shouldRestart && this.restartAttempts < this.maxRestartAttempts) {
          this.restartAttempts++;
          console.log(`Attempting to restart speech recognition (attempt ${this.restartAttempts}/${this.maxRestartAttempts})`);
          
          this.restartTimeout = setTimeout(() => {
            if (this.isStarted) {
              this.start().catch(error => {
                console.error('Failed to restart speech recognition:', error);
              });
            }
          }, 2000);
        }
      };
    }
  }

  onEnd(callback: () => void): void {
    this.endCallback = callback;
    
    if (this.recognition) {
      this.recognition.onend = () => {
        console.log('Speech recognition ended');
        this.isStarted = false;
        
        // Auto-restart if still supposed to be recording (for continuous recognition)
        if (this.config.continuous && this.restartAttempts < this.maxRestartAttempts) {
          this.restartAttempts++;
          console.log(`Auto-restarting speech recognition (attempt ${this.restartAttempts}/${this.maxRestartAttempts})`);
          
          this.restartTimeout = setTimeout(() => {
            if (this.isStarted) {
              this.start().catch(error => {
                console.error('Failed to auto-restart speech recognition:', error);
              });
            }
          }, 1000);
        }
        
        callback();
      };
    }
  }

  isSupported(): boolean {
    const windowWithSpeech = window as any;
    return !!(windowWithSpeech.SpeechRecognition || 
              windowWithSpeech.webkitSpeechRecognition ||
              windowWithSpeech.mozSpeechRecognition ||
              windowWithSpeech.msSpeechRecognition);
  }
}
