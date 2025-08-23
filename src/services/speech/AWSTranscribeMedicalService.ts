import { SpeechRecognitionConfig, SpeechRecognitionService, SpeechRecognitionResult } from '@/types/speechRecognition';

interface AWSTranscribeMedicalConfig {
  region: string;
  accessKeyId: string;
  secretAccessKey: string;
  sessionToken?: string;
  language: string;
  specialty?: 'PRIMARYCARE' | 'CARDIOLOGY' | 'NEUROLOGY' | 'ORTHOPEDICS' | 'RADIOLOGY' | 'UROLOGY' | 'DERMATOLOGY' | 'ONCOLOGY' | 'PEDIATRICS' | 'EMERGENCY';
  showSpeakerLabels?: boolean;
  maxSpeakerLabels?: number;
  vocabularyName?: string;
  vocabularyFilterName?: string;
}

interface AWSTranscribeMedicalResult {
  transcript: string;
  confidence: number;
  isFinal: boolean;
  language: string;
  speaker: string;
  medicalEntities?: string[];
  specialty?: string;
  speakerLabels?: Array<{
    speaker: string;
    startTime: number;
    endTime: number;
    confidence: number;
  }>;
}

export class AWSTranscribeMedicalService implements SpeechRecognitionService {
  private config: AWSTranscribeMedicalConfig;
  private onResultCallback?: (result: SpeechRecognitionResult) => void;
  private onErrorCallback?: (error: string) => void;
  private onEndCallback?: () => void;
  private onLanguageDetectedCallback?: (language: string) => void;
  private onSpeakerDetectedCallback?: (speaker: string) => void;
  private isRecording: boolean = false;
  private mediaRecorder?: MediaRecorder;
  private audioChunks: Blob[] = [];
  private sessionId: string = '';

  // AWS Transcribe Medical supported languages
  private supportedLanguages = {
    'en-US': 'en-US',
    'en-GB': 'en-GB',
    'es-US': 'es-US',
    'fr-CA': 'fr-CA',
    'fr-FR': 'fr-FR',
    'de-DE': 'de-DE',
    'it-IT': 'it-IT',
    'pt-BR': 'pt-BR',
    'ja-JP': 'ja-JP',
    'ko-KR': 'ko-KR',
    'zh-CN': 'zh-CN',
    'ar-SA': 'ar-SA',
    'hi-IN': 'hi-IN',
    'th-TH': 'th-TH',
    'tr-TR': 'tr-TR'
  };

  // Medical specialties mapping
  private medicalSpecialties = {
    'PRIMARYCARE': 'Primary Care',
    'CARDIOLOGY': 'Cardiology',
    'NEUROLOGY': 'Neurology',
    'ORTHOPEDICS': 'Orthopedics',
    'RADIOLOGY': 'Radiology',
    'UROLOGY': 'Urology',
    'DERMATOLOGY': 'Dermatology',
    'ONCOLOGY': 'Oncology',
    'PEDIATRICS': 'Pediatrics',
    'EMERGENCY': 'Emergency Medicine'
  };

  constructor(config: SpeechRecognitionConfig) {
    this.config = {
      region: config.region || 'us-east-1',
      accessKeyId: config.accessKeyId || '',
      secretAccessKey: config.secretAccessKey || '',
      sessionToken: config.sessionToken,
      language: this.mapLanguageCode(config.language),
      specialty: 'PRIMARYCARE',
      showSpeakerLabels: true,
      maxSpeakerLabels: 10,
      vocabularyName: 'MedicalTerms',
      vocabularyFilterName: 'MedicalFilter'
    };
  }

  private mapLanguageCode(language: string): string {
    return this.supportedLanguages[language as keyof typeof this.supportedLanguages] || 'en-US';
  }

  private async initializeAWS(): Promise<void> {
    // Initialize AWS SDK
    if (typeof window !== 'undefined' && !window.AWS) {
      // Load AWS SDK if not already loaded
      const script = document.createElement('script');
      script.src = 'https://sdk.amazonaws.com/js/aws-sdk-2.1001.0.min.js';
      document.head.appendChild(script);
      
      await new Promise((resolve) => {
        script.onload = resolve;
      });
    }

    // Configure AWS
    if (typeof window !== 'undefined' && window.AWS) {
      window.AWS.config.update({
        region: this.config.region,
        credentials: new window.AWS.Credentials({
          accessKeyId: this.config.accessKeyId,
          secretAccessKey: this.config.secretAccessKey,
          sessionToken: this.config.sessionToken
        })
      });
    }
  }

  async start(): Promise<void> {
    try {
      await this.initializeAWS();
      
      // Generate unique session ID
      this.sessionId = `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      
      // Start media recording
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      this.mediaRecorder = new MediaRecorder(stream);
      this.audioChunks = [];
      
      this.mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          this.audioChunks.push(event.data);
        }
      };

      this.mediaRecorder.onstop = async () => {
        await this.processAudioChunks();
      };

      // Start recording in chunks for real-time processing
      this.mediaRecorder.start(3000); // 3-second chunks
      this.isRecording = true;
      
      console.log('🎤 AWS Transcribe Medical started');
      
    } catch (error) {
      console.error('Error starting AWS Transcribe Medical:', error);
      if (this.onErrorCallback) {
        this.onErrorCallback('startup_error');
      }
    }
  }

  stop(): void {
    if (this.mediaRecorder && this.isRecording) {
      this.mediaRecorder.stop();
      this.isRecording = false;
      
      // Stop all tracks
      this.mediaRecorder.stream.getTracks().forEach(track => track.stop());
      
      console.log('🎤 AWS Transcribe Medical stopped');
    }
  }

  private async processAudioChunks(): Promise<void> {
    if (this.audioChunks.length === 0) return;

    try {
      // Combine audio chunks
      const audioBlob = new Blob(this.audioChunks, { type: 'audio/wav' });
      const audioBuffer = await this.blobToBuffer(audioBlob);
      
      // Send to AWS Transcribe Medical
      const result = await this.sendToAWSTranscribe(audioBuffer);
      
      if (result && this.onResultCallback) {
        this.onResultCallback(result);
      }
      
      // Clear processed chunks
      this.audioChunks = [];
      
    } catch (error) {
      console.error('Error processing audio chunks:', error);
      if (this.onErrorCallback) {
        this.onErrorCallback('processing_error');
      }
    }
  }

  private async blobToBuffer(blob: Blob): Promise<ArrayBuffer> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as ArrayBuffer);
      reader.onerror = reject;
      reader.readAsArrayBuffer(blob);
    });
  }

  private async sendToAWSTranscribe(audioBuffer: ArrayBuffer): Promise<SpeechRecognitionResult | null> {
    if (typeof window === 'undefined' || !window.AWS) {
      throw new Error('AWS SDK not available');
    }

    try {
      const transcribeService = new window.AWS.TranscribeService();
      
      // Convert audio buffer to base64
      const audioData = this.arrayBufferToBase64(audioBuffer);
      
      const params = {
        LanguageCode: this.config.language,
        MediaFormat: 'wav',
        Media: {
          MediaFileUri: `data:audio/wav;base64,${audioData}`
        },
        Specialty: this.config.specialty,
        Type: 'MEDICAL',
        ShowSpeakerLabels: this.config.showSpeakerLabels,
        MaxSpeakerLabels: this.config.maxSpeakerLabels,
        VocabularyName: this.config.vocabularyName,
        VocabularyFilterName: this.config.vocabularyFilterName,
        ContentIdentificationType: 'MEDICAL',
        ShowAlternatives: true,
        MaxAlternatives: 3
      };

      const response = await transcribeService.startMedicalTranscriptionJob(params).promise();
      
      // Poll for completion
      const jobName = response.TranscriptionJob?.TranscriptionJobName;
      if (jobName) {
        return await this.pollTranscriptionJob(jobName);
      }
      
    } catch (error) {
      console.error('AWS Transcribe Medical error:', error);
      throw error;
    }

    return null;
  }

  private async pollTranscriptionJob(jobName: string): Promise<SpeechRecognitionResult | null> {
    if (typeof window === 'undefined' || !window.AWS) {
      throw new Error('AWS SDK not available');
    }

    const transcribeService = new window.AWS.TranscribeService();
    
    // Poll every 2 seconds for up to 60 seconds
    for (let i = 0; i < 30; i++) {
      try {
        const response = await transcribeService.getMedicalTranscriptionJob({
          MedicalTranscriptionJobName: jobName
        }).promise();
        
        const job = response.MedicalTranscriptionJob;
        
        if (job?.TranscriptionJobStatus === 'COMPLETED') {
          return this.parseTranscriptionResult(job);
        } else if (job?.TranscriptionJobStatus === 'FAILED') {
          throw new Error(`Transcription failed: ${job.FailureReason}`);
        }
        
        // Wait 2 seconds before next poll
        await new Promise(resolve => setTimeout(resolve, 2000));
        
      } catch (error) {
        console.error('Error polling transcription job:', error);
        throw error;
      }
    }
    
    throw new Error('Transcription job timeout');
  }

  private parseTranscriptionResult(job: any): SpeechRecognitionResult {
    const transcript = job.Transcript?.TranscriptFileUri || '';
    const results = job.Transcript?.Results || [];
    
    let finalTranscript = '';
    let confidence = 0;
    let speaker = 'doctor';
    let language = this.config.language;
    
    // Parse results
    if (results.length > 0) {
      const finalResult = results[results.length - 1];
      finalTranscript = finalResult.Alternatives?.[0]?.Transcript || '';
      confidence = finalResult.Alternatives?.[0]?.Confidence || 0;
      
      // Parse speaker labels if available
      if (finalResult.SpeakerLabels && finalResult.SpeakerLabels.length > 0) {
        const lastSpeaker = finalResult.SpeakerLabels[finalResult.SpeakerLabels.length - 1];
        speaker = `Speaker ${lastSpeaker.Speaker}`;
      }
    }
    
    // Extract medical entities
    const medicalEntities = this.extractMedicalEntities(finalTranscript);
    
    return {
      transcript: finalTranscript,
      confidence: confidence / 100, // Convert to 0-1 scale
      isFinal: true,
      language: language,
      speaker: speaker
    };
  }

  private extractMedicalEntities(transcript: string): string[] {
    // Medical entity extraction from AWS Transcribe Medical results
    const medicalTerms = [
      'diagnosis', 'symptoms', 'treatment', 'medication', 'prescription',
      'blood pressure', 'heart rate', 'temperature', 'pulse', 'oxygen',
      'x-ray', 'mri', 'ct scan', 'ultrasound', 'ecg', 'ekg',
      'hypertension', 'diabetes', 'fever', 'pain', 'headache',
      'nausea', 'dizziness', 'fatigue', 'shortness of breath',
      'chest pain', 'abdominal pain', 'back pain', 'joint pain'
    ];
    
    return medicalTerms.filter(term => 
      transcript.toLowerCase().includes(term.toLowerCase())
    );
  }

  private arrayBufferToBase64(buffer: ArrayBuffer): string {
    const bytes = new Uint8Array(buffer);
    let binary = '';
    for (let i = 0; i < bytes.byteLength; i++) {
      binary += String.fromCharCode(bytes[i]);
    }
    return btoa(binary);
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
    return typeof window !== 'undefined' && 
           typeof window.AWS !== 'undefined' && 
           this.config.accessKeyId && 
           this.config.secretAccessKey;
  }

  getCurrentLanguage(): string {
    return this.config.language;
  }

  getCurrentSpeaker(): string {
    return 'doctor'; // Default speaker
  }

  // Get supported medical specialties
  getSupportedSpecialties(): string[] {
    return Object.keys(this.medicalSpecialties);
  }

  // Get specialty label
  getSpecialtyLabel(specialty: string): string {
    return this.medicalSpecialties[specialty as keyof typeof this.medicalSpecialties] || specialty;
  }

  // Update specialty
  updateSpecialty(specialty: string): void {
    if (this.medicalSpecialties[specialty as keyof typeof this.medicalSpecialties]) {
      this.config.specialty = specialty as any;
    }
  }
}

// Extend Window interface for AWS SDK
declare global {
  interface Window {
    AWS?: any;
  }
} 