import { SpeechRecognitionConfig, SpeechRecognitionResult, SpeechRecognitionService } from '@/types/speechRecognition';
import { voiceSignatureDetection } from '@/utils/voiceSignatureDetection';

// Enhanced Browser Speech Recognition with Multi-Language Support and Fallback
export class EnhancedBrowserSpeechRecognition implements SpeechRecognitionService {
  private config: SpeechRecognitionConfig;
  private recognition: any = null;
  private isRecording = false;
  private resultCallback?: (result: SpeechRecognitionResult) => void;
  private errorCallback?: (error: string) => void;
  private endCallback?: () => void;
  private languageCallback?: (language: string) => void;
  private speakerCallback?: (speaker: string) => void;
  private currentLanguage = 'en';
  private restartAttempts = 0;
  private maxRestartAttempts = 3;
  private restartTimeout?: NodeJS.Timeout;

  constructor(config: SpeechRecognitionConfig) {
    this.config = config;
  }

  async start(): Promise<void> {
    try {
      // Clear any existing restart timeout
      if (this.restartTimeout) {
        clearTimeout(this.restartTimeout);
      }

      // Initialize browser speech recognition with fallback
      const SpeechRecognition = (window as any).SpeechRecognition || 
                               (window as any).webkitSpeechRecognition ||
                               (window as any).mozSpeechRecognition ||
                               (window as any).msSpeechRecognition;
      
      if (!SpeechRecognition) {
        throw new Error('Speech recognition not supported in this browser. Please use Chrome, Edge, or Safari.');
      }

      this.recognition = new SpeechRecognition();
      this.isRecording = true;

      // Configure recognition settings for better performance
      this.recognition.continuous = true;
      this.recognition.interimResults = false; // Only final results for better accuracy
      this.recognition.maxAlternatives = 1;
      
      // Set language - try to detect automatically or use specified language
      if (this.config.language === 'auto') {
        this.recognition.lang = 'en-US'; // Start with English
      } else {
        this.recognition.lang = this.config.language;
      }

      // Set up event handlers
      this.recognition.onstart = () => {
        console.log('Enhanced browser speech recognition started successfully');
        this.currentLanguage = this.recognition.lang.split('-')[0];
        this.restartAttempts = 0; // Reset restart attempts on successful start
      };

      this.recognition.onresult = (event: any) => {
        try {
          const lastResult = event.results[event.results.length - 1];
          
          if (lastResult.isFinal) {
            const transcript = lastResult[0].transcript.trim();
            const confidence = lastResult[0].confidence || 0.8;
            
            if (transcript.length > 0) {
              // Detect language based on content
              const detectedLanguage = this.detectLanguage(transcript);
              if (detectedLanguage && detectedLanguage !== this.currentLanguage) {
                this.currentLanguage = detectedLanguage;
                this.languageCallback?.(detectedLanguage);
                console.log(`Language detected: ${detectedLanguage}`);
              }

              // Use advanced voice signature detection
              const speakerDetection = voiceSignatureDetection.detectSpeaker(transcript);
              const detectedSpeaker = speakerDetection.speaker;
              
              // Call speaker callback if available
              this.speakerCallback?.(detectedSpeaker);
              
              this.resultCallback?.({
                transcript: transcript,
                confidence: confidence,
                isFinal: true,
                alternatives: [],
                language: this.currentLanguage,
                speaker: detectedSpeaker
              });
            }
          }
        } catch (error) {
          console.error('Error processing speech result:', error);
        }
      };

      this.recognition.onerror = (event: any) => {
        console.error('Speech recognition error:', event.error);
        this.isRecording = false;
        
        let errorMessage = 'Speech recognition error';
        let shouldRestart = false;
        
        switch (event.error) {
          case 'not-allowed':
            errorMessage = 'Microphone access denied. Please allow microphone access in your browser settings.';
            shouldRestart = false;
            break;
          case 'no-speech':
            errorMessage = 'No speech detected. Please speak clearly and try again.';
            shouldRestart = true;
            break;
          case 'audio-capture':
            errorMessage = 'Audio capture error. Please check your microphone and try again.';
            shouldRestart = true;
            break;
          case 'network':
            errorMessage = 'Network error. Please check your internet connection.';
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
        
        this.errorCallback?.(errorMessage);
        
        // Auto-restart for recoverable errors
        if (shouldRestart && this.restartAttempts < this.maxRestartAttempts) {
          this.restartAttempts++;
          console.log(`Attempting to restart speech recognition (attempt ${this.restartAttempts}/${this.maxRestartAttempts})`);
          
          this.restartTimeout = setTimeout(() => {
            if (this.isRecording) {
              this.start().catch(error => {
                console.error('Failed to restart speech recognition:', error);
              });
            }
          }, 2000);
        }
      };

      this.recognition.onend = () => {
        console.log('Speech recognition ended');
        this.isRecording = false;
        
        // Auto-restart if still supposed to be recording (for continuous recognition)
        if (this.config.continuous && this.restartAttempts < this.maxRestartAttempts) {
          this.restartAttempts++;
          console.log(`Auto-restarting speech recognition (attempt ${this.restartAttempts}/${this.maxRestartAttempts})`);
          
          this.restartTimeout = setTimeout(() => {
            if (this.isRecording) {
              this.start().catch(error => {
                console.error('Failed to auto-restart speech recognition:', error);
              });
            }
          }, 1000);
        }
        
        this.endCallback?.();
      };

      // Start recognition
      this.recognition.start();
      
    } catch (error) {
      console.error('Failed to start enhanced browser recognition:', error);
      this.errorCallback?.(`Failed to start speech recognition: ${error}`);
      throw error;
    }
  }

  stop(): void {
    // Clear restart timeout
    if (this.restartTimeout) {
      clearTimeout(this.restartTimeout);
    }
    
    if (this.recognition) {
      try {
        this.recognition.stop();
      } catch (error) {
        console.error('Error stopping speech recognition:', error);
      }
    }
    this.isRecording = false;
    this.restartAttempts = 0;
  }

  // Enhanced language detection with more Indian languages
  private detectLanguage(text: string): string | null {
    const textLower = text.toLowerCase();
    
    // Odia detection patterns
    if (/[ଅ-ହ]/.test(text)) {
      return 'or';
    }
    
    // Hindi detection patterns
    if (/[अ-ह]/.test(text)) {
      return 'hi';
    }
    
    // Bengali detection patterns
    if (/[অ-হ]/.test(text)) {
      return 'bn';
    }
    
    // Tamil detection patterns
    if (/[அ-ஹ]/.test(text)) {
      return 'ta';
    }
    
    // Telugu detection patterns
    if (/[అ-హ]/.test(text)) {
      return 'te';
    }
    
    // Malayalam detection patterns
    if (/[അ-ഹ]/.test(text)) {
      return 'ml';
    }
    
    // Kannada detection patterns
    if (/[ಅ-ಹ]/.test(text)) {
      return 'kn';
    }
    
    // Gujarati detection patterns
    if (/[અ-હ]/.test(text)) {
      return 'gu';
    }
    
    // Marathi detection patterns
    if (/[अ-ह]/.test(text) && /[मराठी]/.test(text)) {
      return 'mr';
    }
    
    // Punjabi detection patterns
    if (/[ਅ-ਹ]/.test(text)) {
      return 'pa';
    }
    
    // Urdu detection patterns
    if (/[ا-ی]/.test(text)) {
      return 'ur';
    }
    
    // English (default) - check for English words
    if (/^[a-zA-Z\s.,!?]+$/.test(text) || 
        /\b(the|and|or|but|in|on|at|to|for|of|with|by|is|are|was|were|have|has|had|will|would|could|should|can|may|might)\b/i.test(textLower)) {
      return 'en';
    }
    
    return null;
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

  onSpeakerDetected(callback: (speaker: string) => void): void {
    this.speakerCallback = callback;
  }

  isSupported(): boolean {
    return !!(window as any).SpeechRecognition || 
           !!(window as any).webkitSpeechRecognition ||
           !!(window as any).mozSpeechRecognition ||
           !!(window as any).msSpeechRecognition;
  }

  getCurrentLanguage(): string {
    return this.currentLanguage;
  }

  getCurrentSpeaker(): string {
    return voiceSignatureDetection.getCurrentSpeaker();
  }

  // Debug method to show current speaker profiles
  debugSpeakers(): void {
    // Debug speakers - use getDetectedSpeakers instead
console.log('Detected speakers:', voiceSignatureDetection.getDetectedSpeakers());
  }
} 