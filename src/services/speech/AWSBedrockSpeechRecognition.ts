import { SpeechRecognitionConfig, SpeechRecognitionResult, SpeechRecognitionService } from '@/types/speechRecognition';

interface AWSBedrockConfig extends SpeechRecognitionConfig {
  region: string;
  accessKeyId?: string;
  secretAccessKey?: string;
  sessionToken?: string;
}

interface TranscribeResult {
  results: {
    transcripts: Array<{
      transcript: string;
    }>;
    speaker_labels?: {
      segments: Array<{
        speaker_label: string;
        start_time: number;
        end_time: number;
        items: Array<{
          speaker_label: string;
          start_time: number;
          end_time: number;
        }>;
      }>;
    };
    language_identification?: Array<{
      language_code: string;
      score: number;
    }>;
  };
}

export class AWSBedrockSpeechRecognition implements SpeechRecognitionService {
  private config: AWSBedrockConfig;
  private isRecording = false;
  private resultCallback?: (result: SpeechRecognitionResult) => void;
  private errorCallback?: (error: string) => void;
  private endCallback?: () => void;
  private languageCallback?: (language: string) => void;
  private speakerCallback?: (speaker: string) => void;
  private mediaRecorder?: MediaRecorder;
  private audioChunks: Blob[] = [];
  private transcriptionJobName?: string;
  private pollingInterval?: NodeJS.Timeout;
  private currentLanguage = 'en-US';
  private speakerMap = new Map<string, string>();

  constructor(config: AWSBedrockConfig) {
    this.config = config;
  }

  async start(): Promise<void> {
    try {
      // Get microphone access with high quality settings for medical environments
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true,
          sampleRate: 48000,
          channelCount: 1
        }
      });

      // Initialize MediaRecorder with high quality settings
      this.mediaRecorder = new MediaRecorder(stream, {
        mimeType: 'audio/webm;codecs=opus',
        audioBitsPerSecond: 128000
      });

      this.audioChunks = [];
      this.isRecording = true;
      this.speakerMap.clear();

      // Set up event handlers
      this.mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          this.audioChunks.push(event.data);
        }
      };

      this.mediaRecorder.onstop = async () => {
        await this.processAudio();
      };

      // Start recording with 2-second chunks for real-time processing
      this.mediaRecorder.start(2000);
      console.log('AWS Bedrock speech recognition started');

    } catch (error) {
      console.error('Failed to start AWS Bedrock recognition:', error);
      throw error;
    }
  }

  stop(): void {
    if (this.mediaRecorder && this.isRecording) {
      this.mediaRecorder.stop();
      this.isRecording = false;
      
      // Stop all tracks
      if (this.mediaRecorder.stream) {
        this.mediaRecorder.stream.getTracks().forEach(track => track.stop());
      }
    }

    if (this.pollingInterval) {
      clearInterval(this.pollingInterval);
    }
  }

  private async processAudio(): Promise<void> {
    try {
      // Create audio blob
      const audioBlob = new Blob(this.audioChunks, { type: 'audio/webm' });
      
      // Upload to S3 (simulated for demo)
      const s3Url = await this.uploadToS3(audioBlob);
      
      // Start Amazon Transcribe job
      const jobName = await this.startTranscribeJob(s3Url);
      this.transcriptionJobName = jobName;
      
      // Poll for results
      this.pollForResults();
      
    } catch (error) {
      console.error('Error processing audio:', error);
      this.errorCallback?.(`Failed to process audio: ${error}`);
    }
  }

  private async uploadToS3(audioBlob: Blob): Promise<string> {
    // In production, you would upload to S3
    // For demo purposes, we'll simulate this
    const fileName = `audio_${Date.now()}.webm`;
    console.log(`Simulating S3 upload: ${fileName}`);
    
    // Return S3 URL (in production, this would be actual S3 upload)
    return `s3://medical-transcriptions/${fileName}`;
  }

  private async startTranscribeJob(s3Url: string): Promise<string> {
    const jobName = `transcription_${Date.now()}`;
    
    // Simulate AWS Transcribe API call
    console.log(`Starting Transcribe job: ${jobName}`);
    
    // In production, you would make actual AWS API calls
    // For demo, we'll simulate the response
    return jobName;
  }

  private async pollForResults(): Promise<void> {
    if (!this.transcriptionJobName) return;

    this.pollingInterval = setInterval(async () => {
      try {
        // Simulate polling AWS Transcribe API
        const result = await this.getTranscribeResults();
        
        if (result) {
          this.processResults(result);
          clearInterval(this.pollingInterval);
        }
        
      } catch (error) {
        console.error('Error polling for results:', error);
        this.errorCallback?.(`Polling error: ${error}`);
        clearInterval(this.pollingInterval);
      }
    }, 1000);
  }

  private async getTranscribeResults(): Promise<TranscribeResult | null> {
    // Simulate AWS Transcribe API response
    // In production, you would make actual API calls
    
    // Simulate processing delay
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    // Return mock results for demonstration
    return {
      results: {
        transcripts: [
          {
            transcript: "Hello doctor, I have been experiencing severe headaches for the past week."
          }
        ],
        speaker_labels: {
          segments: [
            {
              speaker_label: "spk_0",
              start_time: 0,
              end_time: 5.2,
              items: [
                {
                  speaker_label: "spk_0",
                  start_time: 0,
                  end_time: 5.2
                }
              ]
            }
          ]
        },
        language_identification: [
          {
            language_code: "en-US",
            score: 0.95
          }
        ]
      }
    };
  }

  private processResults(result: TranscribeResult): void {
    // Process transcripts with speaker labels
    result.results.transcripts.forEach((transcript, index) => {
      if (transcript.transcript.trim().length > 0) {
        // Get speaker label
        const speakerLabel = this.getSpeakerLabel(index, result);
        const speakerRole = this.mapSpeakerToRole(speakerLabel, transcript.transcript);
        
        // Detect language
        const language = this.detectLanguage(result, transcript.transcript);
        
        // Call language callback if language changed
        if (language !== this.currentLanguage) {
          this.currentLanguage = language;
          this.languageCallback?.(language);
        }
        
        // Call speaker callback
        this.speakerCallback?.(speakerRole);
        
        // Create result object
        const speechResult: SpeechRecognitionResult = {
          transcript: transcript.transcript,
          confidence: 0.95, // High confidence for AWS
          isFinal: true,
          alternatives: [],
          language: language,
          speaker: speakerRole
        };
        
        this.resultCallback?.(speechResult);
      }
    });
  }

  private getSpeakerLabel(index: number, result: TranscribeResult): string {
    if (result.results.speaker_labels?.segments[index]) {
      return result.results.speaker_labels.segments[index].speaker_label;
    }
    return `spk_${index}`;
  }

  private mapSpeakerToRole(speakerLabel: string, text: string): string {
    // Check if we've already mapped this speaker
    if (this.speakerMap.has(speakerLabel)) {
      return this.speakerMap.get(speakerLabel)!;
    }

    // Analyze text for role indicators
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
    let role: string;
    if (doctorScore > patientScore) {
      role = 'doctor';
    } else if (patientScore > doctorScore) {
      role = 'patient';
    } else {
      // Use speaker label as fallback
      role = speakerLabel === 'spk_0' ? 'doctor' : 'patient';
    }

    // Map speaker to role
    this.speakerMap.set(speakerLabel, role);
    return role;
  }

  private detectLanguage(result: TranscribeResult, text: string): string {
    // Use AWS language identification if available
    if (result.results.language_identification?.length > 0) {
      const topLanguage = result.results.language_identification[0];
      if (topLanguage.score > 0.7) {
        return topLanguage.language_code;
      }
    }

    // Fallback to text-based language detection
    if (/[ଅ-ହ]/.test(text)) return 'or-IN'; // Odia
    if (/[अ-ह]/.test(text)) return 'hi-IN'; // Hindi
    if (/[অ-হ]/.test(text)) return 'bn-IN'; // Bengali
    if (/[அ-ஹ]/.test(text)) return 'ta-IN'; // Tamil
    if (/[అ-హ]/.test(text)) return 'te-IN'; // Telugu
    if (/[അ-ഹ]/.test(text)) return 'ml-IN'; // Malayalam
    if (/[ಅ-ಹ]/.test(text)) return 'kn-IN'; // Kannada
    if (/[અ-હ]/.test(text)) return 'gu-IN'; // Gujarati
    if (/[ਅ-ਹ]/.test(text)) return 'pa-IN'; // Punjabi
    if (/[ا-ی]/.test(text)) return 'ur-IN'; // Urdu
    
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
    return !!(this.config.accessKeyId && navigator.mediaDevices && MediaRecorder);
  }

  getCurrentLanguage(): string {
    return this.currentLanguage;
  }

  getCurrentSpeaker(): string {
    return this.speakerMap.size > 0 ? Array.from(this.speakerMap.values())[0] : 'doctor';
  }
} 