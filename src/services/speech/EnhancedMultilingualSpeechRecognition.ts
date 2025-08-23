import { SpeechRecognitionConfig, SpeechRecognitionResult, SpeechRecognitionService } from '@/types/speechRecognition';

interface EnhancedMultilingualConfig extends SpeechRecognitionConfig {
  apiKey?: string;
  useAdvancedAI?: boolean;
  fallbackToEnglish?: boolean;
}

interface LanguageModel {
  code: string;
  name: string;
  nativeName: string;
  model: string;
  confidence: number;
}

interface MultilingualResult {
  transcript: string;
  language: string;
  confidence: number;
  medicalEntities: string[];
  speakerRole: string;
}

export class EnhancedMultilingualSpeechRecognition implements SpeechRecognitionService {
  private config: EnhancedMultilingualConfig;
  private isRecording = false;
  private resultCallback?: (result: SpeechRecognitionResult) => void;
  private errorCallback?: (error: string) => void;
  private endCallback?: () => void;
  private languageCallback?: (language: string) => void;
  private speakerCallback?: (speaker: string) => void;
  private recognition?: any;
  private currentLanguage = 'en-US';
  private speakerMap = new Map<string, string>();
  private conversationHistory: string[] = [];
  private currentSpeaker = 'doctor';

  // Advanced language models for regional languages
  private languageModels: LanguageModel[] = [
    { code: 'en-US', name: 'English', nativeName: 'English', model: 'claude-3-sonnet-20240229', confidence: 0.95 },
    { code: 'hi-IN', name: 'Hindi', nativeName: 'हिंदी', model: 'claude-3-sonnet-20240229', confidence: 0.92 },
    { code: 'or-IN', name: 'Odia', nativeName: 'ଓଡ଼ିଆ', model: 'claude-3-sonnet-20240229', confidence: 0.90 },
    { code: 'bn-IN', name: 'Bengali', nativeName: 'বাংলা', model: 'claude-3-sonnet-20240229', confidence: 0.91 },
    { code: 'ta-IN', name: 'Tamil', nativeName: 'தமிழ்', model: 'claude-3-sonnet-20240229', confidence: 0.89 },
    { code: 'te-IN', name: 'Telugu', nativeName: 'తెలుగు', model: 'claude-3-sonnet-20240229', confidence: 0.88 },
    { code: 'ml-IN', name: 'Malayalam', nativeName: 'മലയാളം', model: 'claude-3-sonnet-20240229', confidence: 0.87 },
    { code: 'kn-IN', name: 'Kannada', nativeName: 'ಕನ್ನಡ', model: 'claude-3-sonnet-20240229', confidence: 0.86 },
    { code: 'gu-IN', name: 'Gujarati', nativeName: 'ગુજરાતી', model: 'claude-3-sonnet-20240229', confidence: 0.89 },
    { code: 'mr-IN', name: 'Marathi', nativeName: 'मराठी', model: 'claude-3-sonnet-20240229', confidence: 0.90 },
    { code: 'pa-IN', name: 'Punjabi', nativeName: 'ਪੰਜਾਬੀ', model: 'claude-3-sonnet-20240229', confidence: 0.88 },
    { code: 'ur-IN', name: 'Urdu', nativeName: 'اردو', model: 'claude-3-sonnet-20240229', confidence: 0.87 }
  ];

  constructor(config: EnhancedMultilingualConfig) {
    this.config = {
      ...config,
      useAdvancedAI: config.useAdvancedAI ?? true,
      fallbackToEnglish: config.fallbackToEnglish ?? false
    };
  }

  async start(): Promise<void> {
    try {
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      
      if (!SpeechRecognition) {
        throw new Error('SpeechRecognition not supported in this browser');
      }

      this.recognition = new SpeechRecognition();
      this.recognition.continuous = true;
      this.recognition.interimResults = true;
      this.recognition.maxAlternatives = 1;
      
      // Set language based on configuration
      const targetLanguage = this.config.language || 'en-US';
      this.recognition.lang = targetLanguage;
      this.currentLanguage = targetLanguage;
      
      console.log('Enhanced multilingual speech recognition started with language:', targetLanguage);

      this.isRecording = true;
      this.speakerMap.clear();
      this.conversationHistory = [];

      this.recognition.onresult = (event) => {
        let finalTranscript = '';
        let interimTranscript = '';

        for (let i = event.resultIndex; i < event.results.length; i++) {
          const transcript = event.results[i][0].transcript;
          const confidence = event.results[i][0].confidence;
          const isFinal = event.results[i].isFinal;

          if (isFinal) {
            finalTranscript += transcript;
          } else {
            interimTranscript += transcript;
          }

          if (isFinal && transcript.trim().length > 0) {
            this.processMultilingualTranscript(transcript, confidence, true);
          }
        }

        if (interimTranscript.trim().length > 0) {
          this.processMultilingualTranscript(interimTranscript, 0.5, false);
        }
      };

      this.recognition.onerror = (event) => {
        console.error('Enhanced speech recognition error:', event.error);
        this.errorCallback?.(`Speech recognition error: ${event.error}`);
      };

      this.recognition.onend = () => {
        console.log('Enhanced speech recognition ended');
        this.isRecording = false;
        this.endCallback?.();
      };

      this.recognition.start();
      console.log('Enhanced multilingual speech recognition started successfully');
      
    } catch (error) {
      console.error('Failed to start enhanced speech recognition:', error);
      this.errorCallback?.(`Failed to start: ${error}`);
    }
  }

  stop(): void {
    if (this.recognition && this.isRecording) {
      this.recognition.stop();
      this.isRecording = false;
    }
  }

  private async processMultilingualTranscript(transcript: string, confidence: number, isFinal: boolean): Promise<void> {
    try {
      // Detect language automatically
      const detectedLanguage = await this.detectLanguageAdvanced(transcript);
      
      // Process with AI for enhanced accuracy
      const enhancedResult = await this.enhanceWithAI(transcript, detectedLanguage);
      
      // Update language if detected
      if (detectedLanguage !== this.currentLanguage) {
        this.currentLanguage = detectedLanguage;
        this.languageCallback?.(detectedLanguage);
      }

      // Process speaker detection
      const speakerRole = this.detectSpeakerAdvanced(enhancedResult.transcript);
      
      // Call result callback
      this.resultCallback?.({
        transcript: enhancedResult.transcript,
        confidence: enhancedResult.confidence,
        isFinal,
        language: detectedLanguage,
        speaker: speakerRole,
        medicalEntities: enhancedResult.medicalEntities,
        timestamp: new Date().toISOString()
      });

      // Update conversation history
      if (isFinal) {
        this.conversationHistory.push(enhancedResult.transcript);
      }

    } catch (error) {
      console.error('Error processing multilingual transcript:', error);
      // Fallback to basic processing
      this.processBasicTranscript(transcript, confidence, isFinal);
    }
  }

  private async detectLanguageAdvanced(text: string): Promise<string> {
    // Disabled external API calls to prevent 401 errors
    // Using pattern-based detection instead
    console.log('Using pattern-based language detection (external APIs disabled)');
    return this.detectLanguageByPattern(text);
  }

  private detectLanguageByPattern(text: string): string {
    const patterns = [
      { pattern: /[ଅ-ହ]/, code: 'or-IN', name: 'Odia' },
      { pattern: /[अ-ह]/, code: 'hi-IN', name: 'Hindi' },
      { pattern: /[অ-হ]/, code: 'bn-IN', name: 'Bengali' },
      { pattern: /[அ-ஹ]/, code: 'ta-IN', name: 'Tamil' },
      { pattern: /[అ-హ]/, code: 'te-IN', name: 'Telugu' },
      { pattern: /[അ-ഹ]/, code: 'ml-IN', name: 'Malayalam' },
      { pattern: /[ಅ-ಹ]/, code: 'kn-IN', name: 'Kannada' },
      { pattern: /[અ-હ]/, code: 'gu-IN', name: 'Gujarati' },
      { pattern: /[मराठी]/, code: 'mr-IN', name: 'Marathi' },
      { pattern: /[ਅ-ਹ]/, code: 'pa-IN', name: 'Punjabi' },
      { pattern: /[ا-ی]/, code: 'ur-IN', name: 'Urdu' }
    ];

    for (const lang of patterns) {
      if (lang.pattern.test(text)) {
        console.log(`Language detected by pattern: ${lang.name} (${lang.code})`);
        return lang.code;
      }
    }

    return 'en-US'; // Default to English
  }

  private async enhanceWithAI(transcript: string, language: string): Promise<MultilingualResult> {
    // Disabled external API calls to prevent 401 errors
    // Using local processing instead
    console.log('Using local transcript processing (external APIs disabled)');
    
    const languageModel = this.languageModels.find(lm => lm.code === language);
    const medicalEntities = this.extractBasicMedicalEntities(transcript);
    const speakerRole = this.detectBasicSpeaker(transcript);
    
    return {
      transcript: transcript,
      language: language,
      confidence: 0.85,
      medicalEntities: medicalEntities,
      speakerRole: speakerRole
    };
                "speakerRole": "doctor" or "patient"
              }`
            }
          ]
        })
      });

      if (response.ok) {
        const data = await response.json();
        const content = data.content[0].text;
        
        try {
          const result = JSON.parse(content);
          return {
            transcript: result.transcript || transcript,
            language,
            confidence: result.confidence || 0.9,
            medicalEntities: result.medicalEntities || [],
            speakerRole: result.speakerRole || 'patient'
          };
        } catch (parseError) {
          console.error('Failed to parse AI response:', parseError);
        }
      }
    } catch (error) {
      console.error('AI enhancement failed:', error);
    }

    // Fallback to basic processing
    return {
      transcript,
      language,
      confidence: 0.8,
      medicalEntities: this.extractBasicMedicalEntities(transcript),
      speakerRole: this.detectBasicSpeaker(transcript)
    };
  }

  private detectSpeakerAdvanced(text: string): string {
    // Advanced speaker detection based on medical terminology and context
    const doctorIndicators = [
      'diagnosis', 'treatment', 'prescription', 'examination', 'symptoms',
      'recommend', 'advise', 'check', 'test', 'procedure',
      'मधुमेह', 'उच्च रक्तचाप', 'दिल की बीमारी', 'सांस की तकलीफ',
      'ମଧୁମେହ', 'ଉଚ୍ଚ ରକ୍ତଚାପ', 'ହୃଦୟ ରୋଗ',
      'মধুমেহ', 'উচ্চ রক্তচাপ', 'হৃদরোগ',
      'மதுமேகம்', 'உயர் இரத்த அழுத்தம்', 'இதய நோய்',
      'మధుమేహం', 'అధిక రక్తపోటు', 'గుండె జబ్బు'
    ];

    const patientIndicators = [
      'pain', 'hurt', 'ache', 'fever', 'headache', 'nausea',
      'feeling', 'experiencing', 'suffering', 'worried',
      'दर्द', 'बुखार', 'सिर दर्द', 'मुझे लगता है',
      'ଯନ୍ତ୍ରଣା', 'ଜ୍ୱର', 'ମୁଣ୍ଡବ୍ୟଥା', 'ମୋତେ ଲାଗୁଛି',
      'ব্যথা', 'জ্বর', 'মাথাব্যথা', 'আমি অনুভব করছি',
      'வலி', 'காய்ச்சல்', 'தலைவலி', 'நான் உணர்கிறேன்',
      'నొప్పి', 'జ్వరం', 'తలనొప్పి', 'నాకు అనిపిస్తోంది'
    ];

    const textLower = text.toLowerCase();
    const doctorScore = doctorIndicators.filter(indicator => 
      textLower.includes(indicator.toLowerCase())
    ).length;
    
    const patientScore = patientIndicators.filter(indicator => 
      textLower.includes(indicator.toLowerCase())
    ).length;

    return doctorScore > patientScore ? 'doctor' : 'patient';
  }

  private extractBasicMedicalEntities(text: string): string[] {
    const entities: string[] = [];
    const lowerText = text.toLowerCase();

    // Medical terms in multiple languages
    const medicalTerms = [
      // English
      'pain', 'fever', 'headache', 'diabetes', 'hypertension', 'asthma',
      // Hindi
      'दर्द', 'बुखार', 'सिर दर्द', 'मधुमेह', 'उच्च रक्तचाप', 'अस्थमा',
      // Odia
      'ଯନ୍ତ୍ରଣା', 'ଜ୍ୱର', 'ମୁଣ୍ଡବ୍ୟଥା', 'ମଧୁମେହ', 'ଉଚ୍ଚ ରକ୍ତଚାପ',
      // Bengali
      'ব্যথা', 'জ্বর', 'মাথাব্যথা', 'মধুমেহ', 'উচ্চ রক্তচাপ',
      // Tamil
      'வலி', 'காய்ச்சல்', 'தலைவலி', 'மதுமேகம்', 'உயர் இரத்த அழுத்தம்',
      // Telugu
      'నొప్పి', 'జ్వరం', 'తలనొప్పి', 'మధుమేహం', 'అధిక రక్తపోటు'
    ];

    medicalTerms.forEach(term => {
      if (lowerText.includes(term.toLowerCase())) {
        entities.push(term);
      }
    });

    return entities;
  }

  private detectBasicSpeaker(text: string): string {
    return text.toLowerCase().includes('doctor') || text.toLowerCase().includes('डॉक्टर') ? 'doctor' : 'patient';
  }

  private processBasicTranscript(transcript: string, confidence: number, isFinal: boolean): void {
    const speakerRole = this.detectBasicSpeaker(transcript);
    const medicalEntities = this.extractBasicMedicalEntities(transcript);

    this.resultCallback?.({
      transcript,
      confidence,
      isFinal,
      language: this.currentLanguage,
      speaker: speakerRole,
      medicalEntities,
      timestamp: new Date().toISOString()
    });
  }

  // Interface implementations
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
    return !!(window.SpeechRecognition || window.webkitSpeechRecognition) && 
           !!navigator.mediaDevices && 
           !!this.config.apiKey;
  }

  getCurrentLanguage(): string {
    return this.currentLanguage;
  }

  getCurrentSpeaker(): string {
    return this.currentSpeaker;
  }
} 