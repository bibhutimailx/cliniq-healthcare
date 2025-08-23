import { SpeechRecognitionConfig, SpeechRecognitionResult, SpeechRecognitionService } from '@/types/speechRecognition';

interface AnthropicConfig extends SpeechRecognitionConfig {
  apiKey?: string;
  model?: string;
}

interface ClaudeResponse {
  content: Array<{
    type: string;
    text?: string;
    source?: {
      type: string;
      media_type: string;
      data: string;
    };
  }>;
  usage: {
    input_tokens: number;
    output_tokens: number;
  };
}

export class AnthropicSpeechRecognition implements SpeechRecognitionService {
  private config: AnthropicConfig;
  private isRecording = false;
  private resultCallback?: (result: SpeechRecognitionResult) => void;
  private errorCallback?: (error: string) => void;
  private endCallback?: () => void;
  private languageCallback?: (language: string) => void;
  private speakerCallback?: (speaker: string) => void;
  private recognition?: any; // Browser SpeechRecognition
  private currentLanguage = 'en-US';
  private speakerMap = new Map<string, string>();
  private conversationHistory: string[] = [];
  private currentSpeaker = 'doctor';

  constructor(config: AnthropicConfig) {
    this.config = {
      ...config,
      model: config.model || 'claude-3-sonnet-20240229'
    };
  }

  async start(): Promise<void> {
    try {
      // Use browser's native SpeechRecognition API for real-time processing
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      
      if (!SpeechRecognition) {
        throw new Error('SpeechRecognition not supported in this browser');
      }

      this.recognition = new SpeechRecognition();
      this.recognition.continuous = true;
      this.recognition.interimResults = true;
      this.recognition.maxAlternatives = 1;
      this.recognition.lang = this.config.language || this.currentLanguage;
      
      console.log('Speech recognition initialized with language:', this.recognition.lang);

      this.isRecording = true;
      this.speakerMap.clear();
      this.conversationHistory = [];

      // Set up event handlers
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

          // Process final results
          if (isFinal && transcript.trim().length > 0) {
            this.processTranscript(transcript, confidence, true);
          }
        }

        // Process interim results for real-time feedback
        if (interimTranscript.trim().length > 0) {
          this.processTranscript(interimTranscript, 0.5, false);
        }
      };

      this.recognition.onerror = (event) => {
        console.error('Speech recognition error:', event.error);
        this.errorCallback?.(`Speech recognition error: ${event.error}`);
      };

      this.recognition.onend = () => {
        console.log('Speech recognition ended');
        this.isRecording = false;
        this.endCallback?.();
      };

      this.recognition.start();
      console.log('Anthropic Claude speech recognition started with browser API');

    } catch (error) {
      console.error('Failed to start Anthropic recognition:', error);
      throw error;
    }
  }

  stop(): void {
    if (this.recognition && this.isRecording) {
      this.recognition.stop();
      this.isRecording = false;
    }
  }

  private processTranscript(transcript: string, confidence: number, isFinal: boolean): void {
    if (transcript.trim().length === 0) return;

    // Analyze the transcript for medical context and speaker role
    const analysis = this.analyzeMedicalContext(transcript);
    
    // Detect language
    const language = this.detectLanguage(analysis.language, transcript);
    
    // Call language callback if language changed
    if (language !== this.currentLanguage) {
      this.currentLanguage = language;
      this.languageCallback?.(language);
    }
    
    // Call speaker callback
    this.speakerCallback?.(analysis.speakerRole);
    
    // Create result object
    const speechResult: SpeechRecognitionResult = {
      transcript: transcript,
      confidence: confidence,
      isFinal: isFinal,
      alternatives: [],
      language: language,
      speaker: analysis.speakerRole
    };
    
    this.resultCallback?.(speechResult);
    
    // Update current speaker
    this.currentSpeaker = analysis.speakerRole;
    
    // Update conversation history for context
    if (isFinal) {
      this.conversationHistory.push(`${analysis.speakerRole}: ${transcript}`);
      if (this.conversationHistory.length > 10) {
        this.conversationHistory.shift(); // Keep last 10 exchanges
      }
    }
  }



  private async analyzeWithClaude(base64Audio: string): Promise<any> {
    try {
      // If API key is provided, use Anthropic API
      if (this.config.apiKey) {
        const response = await fetch('https://api.anthropic.com/v1/messages', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'x-api-key': this.config.apiKey,
            'anthropic-version': '2023-06-01'
          },
          body: JSON.stringify({
            model: this.config.model,
            max_tokens: 1000,
            messages: [
              {
                role: 'user',
                content: [
                  {
                    type: 'text',
                    text: `You are a medical transcription assistant. Analyze this audio and provide:

1. **Transcription**: The exact words spoken
2. **Speaker Role**: Determine if this is a doctor, patient, or family member based on:
   - Medical terminology usage
   - Question patterns (doctors ask questions, patients answer)
   - Professional language vs casual language
   - Context clues
3. **Language**: Detect the language (English, Hindi, Odia, Bengali, Tamil, Telugu, etc.)
4. **Medical Entities**: Extract any medical terms, symptoms, medications mentioned
5. **Confidence**: Rate your confidence (0-1) in the transcription and speaker identification

Format your response as JSON:
{
  "transcription": "exact words spoken",
  "speaker_role": "doctor|patient|family",
  "language": "en-US|hi-IN|or-IN|bn-IN|ta-IN|te-IN|ml-IN|kn-IN|gu-IN|pa-IN|ur-IN",
  "medical_entities": ["symptom1", "medication1", "condition1"],
  "confidence": 0.95,
  "reasoning": "brief explanation of speaker role determination"
}

Previous conversation context: ${this.conversationHistory.join(' | ')}`
                  },
                  {
                    type: 'image',
                    source: {
                      type: 'base64',
                      media_type: 'audio/webm',
                      data: base64Audio
                    }
                  }
                ]
              }
            ]
          })
        });

        if (!response.ok) {
          throw new Error(`Claude API error: ${response.status} ${response.statusText}`);
        }

        const data: ClaudeResponse = await response.json();
        const textContent = data.content.find(c => c.type === 'text')?.text;
        
        if (!textContent) {
          throw new Error('No text response from Claude');
        }

        // Parse Claude's JSON response
        try {
          return JSON.parse(textContent);
        } catch (parseError) {
          console.error('Failed to parse Claude response as JSON:', textContent);
          // Fallback: extract transcription from text
          return {
            transcription: textContent,
            speaker_role: this.currentSpeaker,
            language: 'en-US',
            confidence: 0.7
          };
        }
      } else {
        // Browser-based approach: Use enhanced browser speech recognition with medical context
        return await this.processWithBrowserRecognition();
      }

    } catch (error) {
      console.error('Anthropic Claude error:', error);
      // Fallback to browser recognition
      return await this.processWithBrowserRecognition();
    }
  }



  private analyzeMedicalContext(transcript: string): {
    speakerRole: string;
    medicalEntities: string[];
    reasoning: string;
  } {
    const lowerText = transcript.toLowerCase();
    
    // Medical terminology patterns
    const medicalTerms = [
      'hypertension', 'diabetes', 'cardiac', 'arrhythmia', 'myocardial', 'infarction',
      'angina', 'dyspnea', 'edema', 'tachycardia', 'bradycardia', 'hypertension',
      'hyperglycemia', 'hypoglycemia', 'diabetic', 'cardiac', 'respiratory',
      'pneumonia', 'bronchitis', 'asthma', 'copd', 'emphysema', 'tuberculosis',
      'fever', 'cough', 'sore throat', 'headache', 'migraine', 'dizziness',
      'nausea', 'vomiting', 'diarrhea', 'constipation', 'abdominal pain',
      'chest pain', 'back pain', 'joint pain', 'arthritis', 'osteoporosis',
      'blood pressure', 'heart rate', 'temperature', 'pulse', 'oxygen',
      'medication', 'prescription', 'dosage', 'side effects', 'allergic',
      'treatment', 'therapy', 'surgery', 'procedure', 'diagnosis', 'symptoms'
    ];

    // Hindi medical terms
    const hindiMedicalTerms = [
      'मधुमेह', 'उच्च रक्तचाप', 'दिल की बीमारी', 'सांस की तकलीफ', 'बुखार',
      'खांसी', 'सिरदर्द', 'दर्द', 'दवा', 'इलाज', 'जांच', 'लक्षण',
      'रक्तचाप', 'हृदय गति', 'तापमान', 'नाड़ी', 'ऑक्सीजन'
    ];

    // Odia medical terms
    const odiaMedicalTerms = [
      'ମଧୁମେହ', 'ଉଚ୍ଚ ରକ୍ତଚାପ', 'ହୃଦୟ ରୋଗ', 'ଶ୍ୱାସ କଷ୍ଟ', 'ଜ୍ୱର',
      'କାଶ', 'ମୁଣ୍ଡବ୍ୟଥା', 'ଯନ୍ତ୍ରଣା', 'ଔଷଧ', 'ଚିକିତ୍ସା', 'ପରୀକ୍ଷା'
    ];

    // Find medical entities
    const medicalEntities: string[] = [];
    [...medicalTerms, ...hindiMedicalTerms, ...odiaMedicalTerms].forEach(term => {
      if (lowerText.includes(term.toLowerCase())) {
        medicalEntities.push(term);
      }
    });

    // Speaker role detection
    const doctorIndicators = [
      'may i know your name', 'what brings you here', 'how are you feeling',
      'can you describe', 'let me check', 'i need to examine', 'take this medication',
      'come back in', 'any other symptoms', 'how long', 'when did this start',
      'please tell me', 'excuse me', 'let me examine', 'i will prescribe',
      'follow up', 'treatment plan', 'medical history', 'vital signs'
    ];

    const patientIndicators = [
      'hello doctor', 'my name is', 'i am feeling', 'i have pain', 'it hurts',
      'i am experiencing', 'thank you doctor', 'since yesterday', 'since last week',
      'yes doctor', 'no doctor', 'i think', 'i feel', 'my symptoms', 'the pain'
    ];

    let doctorScore = 0;
    let patientScore = 0;

    doctorIndicators.forEach(phrase => {
      if (lowerText.includes(phrase)) doctorScore += 2;
    });
    
    patientIndicators.forEach(phrase => {
      if (lowerText.includes(phrase)) patientScore += 2;
    });

    // Medical terminology usage increases doctor score
    if (medicalEntities.length > 0) {
      doctorScore += medicalEntities.length;
    }

    let speakerRole = 'patient'; // Default
    let reasoning = '';

    if (doctorScore > patientScore) {
      speakerRole = 'doctor';
      reasoning = `High medical terminology usage (${medicalEntities.length} terms) and professional language patterns`;
    } else if (patientScore > doctorScore) {
      speakerRole = 'patient';
      reasoning = 'Patient-like language patterns and symptom descriptions';
    } else {
      speakerRole = this.currentSpeaker;
      reasoning = 'Using current speaker as fallback';
    }

    return {
      speakerRole,
      medicalEntities,
      reasoning
    };
  }

  private processClaudeResult(result: any): void {
    if (!result.transcription || result.transcription.trim().length === 0) {
      return;
    }

    // Update conversation history
    this.conversationHistory.push(`${result.speaker_role}: ${result.transcription}`);
    if (this.conversationHistory.length > 10) {
      this.conversationHistory.shift(); // Keep last 10 exchanges
    }

    // Determine speaker role
    const speakerRole = this.mapSpeakerToRole(result.speaker_role, result.transcription);
    
    // Detect language
    const language = this.detectLanguage(result.language, result.transcription);
    
    // Call language callback if language changed
    if (language !== this.currentLanguage) {
      this.currentLanguage = language;
      this.languageCallback?.(language);
    }
    
    // Call speaker callback
    this.speakerCallback?.(speakerRole);
    
    // Create result object
    const speechResult: SpeechRecognitionResult = {
      transcript: result.transcription,
      confidence: result.confidence || 0.9,
      isFinal: true,
      alternatives: [],
      language: language,
      speaker: speakerRole
    };
    
    this.resultCallback?.(speechResult);
    
    // Update current speaker
    this.currentSpeaker = speakerRole;
  }

  private mapSpeakerToRole(claudeRole: string, text: string): string {
    // Use Claude's analysis as primary, with fallback logic
    if (claudeRole && ['doctor', 'patient', 'family'].includes(claudeRole)) {
      return claudeRole;
    }

    // Fallback: analyze text for role indicators
    const lowerText = text.toLowerCase();
    
    const doctorIndicators = [
      'may i know your name',
      'what brings you here',
      'how are you feeling',
      'can you describe',
      'let me check',
      'i need to examine',
      'take this medication',
      'come back in',
      'any other symptoms',
      'how long',
      'when did this start',
      'please tell me',
      'excuse me',
      'let me examine',
      'i will prescribe',
      'follow up',
      'treatment plan',
      'medical history',
      'vital signs',
      'blood pressure',
      'temperature',
      'heart rate'
    ];
    
    const patientIndicators = [
      'hello doctor',
      'my name is',
      'i am feeling',
      'i have pain',
      'it hurts',
      'i am experiencing',
      'thank you doctor',
      'since yesterday',
      'since last week',
      'yes doctor',
      'no doctor',
      'i think',
      'i feel',
      'my symptoms',
      'the pain',
      'i cannot',
      'i need help',
      'my condition',
      'the medication',
      'side effects',
      'allergic reaction'
    ];

    let doctorScore = 0;
    let patientScore = 0;

    doctorIndicators.forEach(phrase => {
      if (lowerText.includes(phrase)) doctorScore += 2;
    });
    
    patientIndicators.forEach(phrase => {
      if (lowerText.includes(phrase)) patientScore += 2;
    });

    // Determine role based on text content
    if (doctorScore > patientScore) {
      return 'doctor';
    } else if (patientScore > doctorScore) {
      return 'patient';
    } else {
      // Use current speaker as fallback
      return this.currentSpeaker;
    }
  }

  private detectLanguage(claudeLanguage: string, text: string): string {
    // Use Claude's language detection if available
    if (claudeLanguage && claudeLanguage !== 'en-US') {
      return claudeLanguage;
    }

    // Enhanced text-based language detection with more comprehensive patterns
    const languagePatterns = [
      { pattern: /[ଅ-ହ]/, code: 'or-IN', name: 'Odia' },
      { pattern: /[अ-ह]/, code: 'hi-IN', name: 'Hindi' },
      { pattern: /[অ-হ]/, code: 'bn-IN', name: 'Bengali' },
      { pattern: /[அ-ஹ]/, code: 'ta-IN', name: 'Tamil' },
      { pattern: /[అ-హ]/, code: 'te-IN', name: 'Telugu' },
      { pattern: /[അ-ഹ]/, code: 'ml-IN', name: 'Malayalam' },
      { pattern: /[ಅ-ಹ]/, code: 'kn-IN', name: 'Kannada' },
      { pattern: /[અ-હ]/, code: 'gu-IN', name: 'Gujarati' },
      { pattern: /[ਅ-ਹ]/, code: 'pa-IN', name: 'Punjabi' },
      { pattern: /[ا-ی]/, code: 'ur-IN', name: 'Urdu' }
    ];

    for (const lang of languagePatterns) {
      if (lang.pattern.test(text)) {
        console.log(`Language detected: ${lang.name} (${lang.code})`);
        return lang.code;
      }
    }
    
    console.log('Language not detected, defaulting to English');
    return 'en-US'; // Default to English
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
    // Check for browser SpeechRecognition support
    const hasSpeechRecognition = !!(window.SpeechRecognition || window.webkitSpeechRecognition);
    const hasMediaDevices = !!navigator.mediaDevices;
    
    return hasSpeechRecognition && hasMediaDevices;
  }

  getCurrentLanguage(): string {
    return this.currentLanguage;
  }

  getCurrentSpeaker(): string {
    return this.currentSpeaker;
  }
} 