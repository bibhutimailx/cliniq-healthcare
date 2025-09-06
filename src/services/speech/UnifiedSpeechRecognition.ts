import { SpeechRecognitionConfig, SpeechRecognitionResult, SpeechRecognitionService } from '@/types/speechRecognition';

// Language detection configuration
interface LanguageDetectionResult {
  language: string;
  confidence: number;
  isSupported: boolean;
}

// Enhanced speech recognition configuration
interface UnifiedSpeechConfig extends SpeechRecognitionConfig {
  autoDetectLanguage?: boolean;
  fallbackLanguage?: string;
  maxDetectionAttempts?: number;
  supportedLanguages?: string[];
  apiKeys?: {
    google?: string;
    azure?: string;
    aws?: string;
    assemblyAI?: string;
    reverie?: string;
    anthropic?: string;
  };
}

// Speech provider capabilities
interface ProviderCapabilities {
  name: string;
  languages: string[];
  accuracy: number;
  realTime: boolean;
  medicalTerms: boolean;
  autoDetection: boolean;
  cost: 'free' | 'low' | 'medium' | 'high';
}

export class UnifiedSpeechRecognition implements SpeechRecognitionService {
  private config: UnifiedSpeechConfig;
  private currentProvider: SpeechRecognitionService | null = null;
  private isRecording = false;
  private resultCallback?: (result: SpeechRecognitionResult) => void;
  private errorCallback?: (error: string) => void;
  private endCallback?: () => void;
  private languageCallback?: (language: string) => void;
  private speakerCallback?: (speaker: string) => void;
  
  private detectedLanguage = 'en-US';
  private languageConfidence = 0;
  private analysisBuffer: string[] = [];
  private readonly maxBufferSize = 10;

  // Provider capabilities matrix
  private readonly providers: ProviderCapabilities[] = [
    {
      name: 'AssemblyAI',
      languages: ['en', 'es', 'fr', 'de', 'it', 'pt', 'nl', 'hi', 'ja', 'ko', 'zh'],
      accuracy: 0.95,
      realTime: true,
      medicalTerms: true,
      autoDetection: true,
      cost: 'medium'
    },
    {
      name: 'Google Cloud Speech',
      languages: ['en-US', 'hi-IN', 'or-IN', 'bn-IN', 'ta-IN', 'te-IN', 'ml-IN', 'kn-IN', 'gu-IN', 'mr-IN', 'pa-IN'],
      accuracy: 0.92,
      realTime: true,
      medicalTerms: false,
      autoDetection: true,
      cost: 'low'
    },
    {
      name: 'Azure Cognitive Services',
      languages: ['en-US', 'hi-IN', 'or-IN', 'bn-IN', 'ta-IN', 'te-IN', 'ml-IN', 'kn-IN'],
      accuracy: 0.90,
      realTime: true,
      medicalTerms: true,
      autoDetection: true,
      cost: 'medium'
    },
    {
      name: 'Browser Speech Recognition',
      languages: ['en-US', 'hi-IN', 'es-ES', 'fr-FR', 'de-DE'],
      accuracy: 0.85,
      realTime: true,
      medicalTerms: false,
      autoDetection: false,
      cost: 'free'
    },
    {
      name: 'Reverie',
      languages: ['hi-IN', 'or-IN', 'bn-IN', 'ta-IN', 'te-IN', 'ml-IN', 'kn-IN', 'gu-IN', 'mr-IN', 'pa-IN'],
      accuracy: 0.88,
      realTime: true,
      medicalTerms: false,
      autoDetection: false,
      cost: 'low'
    }
  ];

  // Language codes and their regional mappings
  private readonly languageMap = new Map([
    ['en', 'en-US'], ['en-us', 'en-US'], ['english', 'en-US'],
    ['hi', 'hi-IN'], ['hi-in', 'hi-IN'], ['hindi', 'hi-IN'], ['हिंदी', 'hi-IN'],
    ['or', 'or-IN'], ['or-in', 'or-IN'], ['odia', 'or-IN'], ['ଓଡ଼ିଆ', 'or-IN'],
    ['bn', 'bn-IN'], ['bn-in', 'bn-IN'], ['bengali', 'bn-IN'], ['বাংলা', 'bn-IN'],
    ['ta', 'ta-IN'], ['ta-in', 'ta-IN'], ['tamil', 'ta-IN'], ['தமிழ்', 'ta-IN'],
    ['te', 'te-IN'], ['te-in', 'te-IN'], ['telugu', 'te-IN'], ['తెలుగు', 'te-IN'],
    ['ml', 'ml-IN'], ['ml-in', 'ml-IN'], ['malayalam', 'ml-IN'], ['മലയാളം', 'ml-IN'],
    ['kn', 'kn-IN'], ['kn-in', 'kn-IN'], ['kannada', 'kn-IN'], ['ಕನ್ನಡ', 'kn-IN'],
    ['gu', 'gu-IN'], ['gu-in', 'gu-IN'], ['gujarati', 'gu-IN'], ['ગુજરાતી', 'gu-IN'],
    ['mr', 'mr-IN'], ['mr-in', 'mr-IN'], ['marathi', 'mr-IN'], ['मराठी', 'mr-IN'],
    ['pa', 'pa-IN'], ['pa-in', 'pa-IN'], ['punjabi', 'pa-IN'], ['ਪੰਜਾਬੀ', 'pa-IN']
  ]);

  constructor(config: UnifiedSpeechConfig) {
    this.config = {
      autoDetectLanguage: true,
      fallbackLanguage: 'en-US',
      maxDetectionAttempts: 3,
      supportedLanguages: ['en-US', 'hi-IN', 'or-IN', 'bn-IN', 'ta-IN', 'te-IN'],
      ...config
    };
  }

  async start(): Promise<void> {
    try {
      // Select best provider based on requirements
      const selectedProvider = await this.selectBestProvider();
      
      if (!selectedProvider) {
        throw new Error('No suitable speech recognition provider available');
      }

      this.currentProvider = selectedProvider;
      
      // Set up callbacks
      this.currentProvider.onResult((result) => {
        if (this.config.autoDetectLanguage) {
          this.analyzeLanguage(result.transcript);
        }
        this.handleResult(result);
      });

      this.currentProvider.onError((error) => {
        this.handleError(error);
      });

      this.currentProvider.onEnd(() => {
        this.handleEnd();
      });

      await this.currentProvider.start();
      this.isRecording = true;

      console.log(`🎯 Started unified speech recognition with best provider`);
    } catch (error) {
      this.handleError(`Failed to start speech recognition: ${error}`);
    }
  }

  async stop(): Promise<void> {
    if (this.currentProvider) {
      await this.currentProvider.stop();
      this.isRecording = false;
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

  onSpeakerDetected(callback: (speaker: string) => void): void {
    this.speakerCallback = callback;
  }

  isSupported(): boolean {
    return this.providers.some(provider => 
      this.isProviderAvailable(provider.name)
    );
  }

  getSupportedLanguages(): string[] {
    return this.config.supportedLanguages || [];
  }

  getCurrentLanguage(): string {
    return this.detectedLanguage;
  }

  getCurrentSpeaker(): string {
    return this.currentProvider?.getCurrentSpeaker() || 'unknown';
  }

  private async selectBestProvider(): Promise<SpeechRecognitionService | null> {
    // Score providers based on capabilities and availability
    const availableProviders = this.providers.filter(provider =>
      this.isProviderAvailable(provider.name)
    );

    if (availableProviders.length === 0) {
      console.warn('No speech recognition providers available');
      return null;
    }

    // Score providers based on requirements
    const scoredProviders = availableProviders.map(provider => {
      let score = provider.accuracy * 100; // Base accuracy score
      
      // Bonus for medical terms support
      if (provider.medicalTerms) score += 20;
      
      // Bonus for auto-detection
      if (provider.autoDetection && this.config.autoDetectLanguage) score += 15;
      
      // Bonus for supporting current language
      const currentLang = this.config.language || 'en-US';
      if (provider.languages.some(lang => 
        lang.includes(currentLang.split('-')[0]) || lang === currentLang
      )) {
        score += 25;
      }
      
      // Cost factor (lower cost = higher score)
      const costBonus = { free: 10, low: 5, medium: 0, high: -10 };
      score += costBonus[provider.cost];

      return { provider, score };
    });

    // Sort by score (highest first)
    scoredProviders.sort((a, b) => b.score - a.score);
    
    const bestProvider = scoredProviders[0];
    console.log(`🏆 Selected ${bestProvider.provider.name} (score: ${bestProvider.score.toFixed(1)})`);

    // Create instance of best provider
    return await this.createProviderInstance(bestProvider.provider.name);
  }

  private async createProviderInstance(providerName: string): Promise<SpeechRecognitionService | null> {
    const { AssemblyAISpeechRecognition } = await import('./AssemblyAISpeechRecognition');
    const { GoogleSpeechRecognition } = await import('./GoogleSpeechRecognition');
    const { AzureSpeechRecognition } = await import('./AzureSpeechRecognition');
    const { EnhancedBrowserSpeechRecognition } = await import('./EnhancedBrowserSpeechRecognition');
    const { ReverieSpeechRecognition } = await import('./ReverieSpeechRecognition');

    switch (providerName) {
      case 'AssemblyAI':
        if (this.config.apiKeys?.assemblyAI) {
          return new AssemblyAISpeechRecognition({
            ...this.config,
            apiKey: this.config.apiKeys.assemblyAI
          });
        }
        break;
      
      case 'Google Cloud Speech':
        if (this.config.apiKeys?.google) {
          return new GoogleSpeechRecognition({
            ...this.config,
            apiKey: this.config.apiKeys.google
          });
        }
        break;
      
      case 'Azure Cognitive Services':
        if (this.config.apiKeys?.azure) {
          return new AzureSpeechRecognition({
            ...this.config,
            apiKey: this.config.apiKeys.azure
          });
        }
        break;
      
      case 'Reverie':
        if (this.config.apiKeys?.reverie) {
          return new ReverieSpeechRecognition({
            ...this.config,
            apiKey: this.config.apiKeys.reverie
          });
        }
        break;
      
      case 'Browser Speech Recognition':
        return new EnhancedBrowserSpeechRecognition(this.config);
      
      default:
        // Fallback to browser
        return new EnhancedBrowserSpeechRecognition(this.config);
    }

    return null;
  }

  private isProviderAvailable(providerName: string): boolean {
    switch (providerName) {
      case 'AssemblyAI':
        return !!this.config.apiKeys?.assemblyAI;
      case 'Google Cloud Speech':
        return !!this.config.apiKeys?.google;
      case 'Azure Cognitive Services':
        return !!this.config.apiKeys?.azure;
      case 'Reverie':
        return !!this.config.apiKeys?.reverie;
      case 'Browser Speech Recognition':
        return typeof window !== 'undefined' && 
               !!(window as any).SpeechRecognition || !!(window as any).webkitSpeechRecognition;
      default:
        return false;
    }
  }

  private analyzeLanguage(transcript: string): void {
    if (!this.config.autoDetectLanguage) return;

    // Add to analysis buffer
    this.analysisBuffer.push(transcript);
    if (this.analysisBuffer.length > this.maxBufferSize) {
      this.analysisBuffer.shift();
    }

    // Perform language detection on buffered text
    const combinedText = this.analysisBuffer.join(' ');
    const detection = this.detectLanguage(combinedText);

    if (detection.confidence > 0.8 && detection.isSupported) {
      if (detection.language !== this.detectedLanguage) {
        this.detectedLanguage = detection.language;
        this.languageConfidence = detection.confidence;
        
        console.log(`🌐 Language detected: ${detection.language} (confidence: ${detection.confidence.toFixed(2)})`);
        
        if (this.languageCallback) {
          this.languageCallback(detection.language);
        }

        // Switch provider if needed for better language support
        this.switchProviderForLanguage(detection.language);
      }
    }
  }

  private detectLanguage(text: string): LanguageDetectionResult {
    // Simple rule-based language detection
    // In production, you might want to use a more sophisticated library
    
    const patterns = {
      'hi-IN': /[\u0900-\u097F]/,
      'or-IN': /[\u0B00-\u0B7F]/,
      'bn-IN': /[\u0980-\u09FF]/,
      'ta-IN': /[\u0B80-\u0BFF]/,
      'te-IN': /[\u0C00-\u0C7F]/,
      'ml-IN': /[\u0D00-\u0D7F]/,
      'kn-IN': /[\u0C80-\u0CFF]/,
      'gu-IN': /[\u0A80-\u0AFF]/,
      'mr-IN': /[\u0900-\u097F]/, // Same as Hindi, need context
      'pa-IN': /[\u0A00-\u0A7F]/
    };

    for (const [lang, pattern] of Object.entries(patterns)) {
      if (pattern.test(text)) {
        const matches = text.match(pattern) || [];
        const confidence = Math.min(matches.length / text.length * 2, 1);
        
        return {
          language: lang,
          confidence,
          isSupported: this.config.supportedLanguages?.includes(lang) || false
        };
      }
    }

    // Default to English
    return {
      language: 'en-US',
      confidence: 0.9,
      isSupported: true
    };
  }

  private async switchProviderForLanguage(language: string): Promise<void> {
    // Find best provider for detected language
    const languageProviders = this.providers.filter(provider =>
      provider.languages.some(lang => 
        lang.includes(language.split('-')[0]) || lang === language
      ) && this.isProviderAvailable(provider.name)
    );

    if (languageProviders.length === 0) return;

    // Sort by accuracy for this language
    languageProviders.sort((a, b) => b.accuracy - a.accuracy);
    
    const bestProvider = languageProviders[0];
    
    // Switch if different from current
    if (this.currentProvider && bestProvider.name !== this.getCurrentProviderName()) {
      console.log(`🔄 Switching to ${bestProvider.name} for better ${language} support`);
      
      await this.currentProvider.stop();
      const newProvider = await this.createProviderInstance(bestProvider.name);
      
      if (newProvider) {
        this.currentProvider = newProvider;
        
        // Set up callbacks for new provider
        this.currentProvider.onResult((result) => this.handleResult(result));
        this.currentProvider.onError((error) => this.handleError(error));
        this.currentProvider.onEnd(() => this.handleEnd());
        
        await this.currentProvider.start();
      }
    }
  }

  private getCurrentProviderName(): string {
    // This would need to be implemented based on provider class names
    return this.currentProvider?.constructor.name || 'unknown';
  }

  private handleResult(result: SpeechRecognitionResult): void {
    // Enhance result with language and confidence info
    const enhancedResult: SpeechRecognitionResult = {
      ...result,
      language: this.detectedLanguage,
      confidence: Math.max(result.confidence * this.languageConfidence, result.confidence)
    };

    if (this.resultCallback) {
      this.resultCallback(enhancedResult);
    }
  }

  private handleError(error: string): void {
    console.error('🚨 Speech recognition error:', error);
    if (this.errorCallback) {
      this.errorCallback(error);
    }
  }

  private handleEnd(): void {
    this.isRecording = false;
    if (this.endCallback) {
      this.endCallback();
    }
  }
}

export default UnifiedSpeechRecognition;
