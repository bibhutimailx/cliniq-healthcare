import { SpeechRecognitionConfig, SpeechRecognitionResult, SpeechRecognitionService } from '@/types/speechRecognition';

interface AssemblyAIResponse {
  text: string;
  confidence: number;
  language_code: string;
  status: string;
  error?: string;
  speaker_labels: Array<{
    speaker: string;
    start: number;
    end: number;
    confidence: number;
  }>;
  utterances: Array<{
    speaker: string;
    text: string;
    start: number;
    end: number;
    confidence: number;
  }>;
}

export class AssemblyAISpeechRecognition implements SpeechRecognitionService {
  private config: SpeechRecognitionConfig;
  private isRecording = false;
  private resultCallback?: (result: SpeechRecognitionResult) => void;
  private errorCallback?: (error: string) => void;
  private endCallback?: () => void;
  private languageCallback?: (language: string) => void;
  private speakerCallback?: (speaker: string) => void;
  private mediaRecorder?: MediaRecorder;
  private audioChunks: Blob[] = [];
  private uploadUrl?: string;
  private transcriptionId?: string;
  private pollingInterval?: NodeJS.Timeout;

  constructor(config: SpeechRecognitionConfig) {
    this.config = config;
  }

  async start(): Promise<void> {
    try {
      // Get microphone access
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      
      // Initialize MediaRecorder
      this.mediaRecorder = new MediaRecorder(stream, {
        mimeType: 'audio/webm;codecs=opus'
      });

      this.audioChunks = [];
      this.isRecording = true;

      // Set up event handlers
      this.mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          this.audioChunks.push(event.data);
        }
      };

      this.mediaRecorder.onstop = async () => {
        await this.processAudio();
      };

      // Start recording
      this.mediaRecorder.start(1000); // Collect data every second
      console.log('AssemblyAI speech recognition started');

    } catch (error) {
      console.error('Failed to start AssemblyAI recognition:', error);
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
      
      // Upload to AssemblyAI
      const uploadResponse = await this.uploadAudio(audioBlob);
      this.uploadUrl = uploadResponse.upload_url;
      
      // Start transcription
      const transcriptionResponse = await this.startTranscription();
      this.transcriptionId = transcriptionResponse.id;
      
      // Poll for results
      this.pollForResults();
      
    } catch (error) {
      console.error('Error processing audio:', error);
      this.errorCallback?.(`Failed to process audio: ${error}`);
    }
  }

  private async uploadAudio(audioBlob: Blob): Promise<{ upload_url: string }> {
    const response = await fetch('https://api.assemblyai.com/v2/upload', {
      method: 'POST',
      headers: {
        'Authorization': this.config.apiKey || '',
        'Content-Type': 'application/octet-stream'
      },
      body: audioBlob
    });

    if (!response.ok) {
      throw new Error(`Upload failed: ${response.statusText}`);
    }

    return response.json();
  }

  private async startTranscription(): Promise<{ id: string }> {
    const response = await fetch('https://api.assemblyai.com/v2/transcript', {
      method: 'POST',
      headers: {
        'Authorization': this.config.apiKey || '',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        audio_url: this.uploadUrl,
        speaker_labels: true,
        language_code: this.config.language === 'auto' ? 'auto' : this.config.language,
        auto_highlights: true,
        entity_detection: true,
        sentiment_analysis: true,
        auto_chapters: true,
        iab_categories: true,
        auto_labels: true,
        content_safety: true,
        speech_threshold: 0.5,
        language_detection: true
      })
    });

    if (!response.ok) {
      throw new Error(`Transcription failed: ${response.statusText}`);
    }

    return response.json();
  }

  private async pollForResults(): Promise<void> {
    if (!this.transcriptionId) return;

    this.pollingInterval = setInterval(async () => {
      try {
        const response = await fetch(`https://api.assemblyai.com/v2/transcript/${this.transcriptionId}`, {
          headers: {
            'Authorization': this.config.apiKey || ''
          }
        });

        if (!response.ok) {
          throw new Error(`Polling failed: ${response.statusText}`);
        }

        const result: AssemblyAIResponse = await response.json();

        if (result.status === 'completed') {
          this.processResults(result);
          clearInterval(this.pollingInterval);
        } else if (result.status === 'error') {
          this.errorCallback?.(`Transcription error: ${result.error}`);
          clearInterval(this.pollingInterval);
        }
        // Continue polling if status is 'queued' or 'processing'

      } catch (error) {
        console.error('Error polling for results:', error);
        this.errorCallback?.(`Polling error: ${error}`);
        clearInterval(this.pollingInterval);
      }
    }, 1000);
  }

  private processResults(result: AssemblyAIResponse): void {
    // Process utterances with speaker labels
    result.utterances?.forEach((utterance, index) => {
      if (utterance.text.trim().length > 0) {
        // Map speaker labels to roles
        const speakerRole = this.mapSpeakerToRole(utterance.speaker, utterance.text);
        
        // Detect language
        const language = result.language_code || 'en';
        
        // Call language callback if language changed
        this.languageCallback?.(language);
        
        // Call speaker callback
        this.speakerCallback?.(speakerRole);
        
        // Create result object
        const speechResult: SpeechRecognitionResult = {
          transcript: utterance.text,
          confidence: utterance.confidence,
          isFinal: true,
          alternatives: [],
          language: language,
          speaker: speakerRole
        };
        
        this.resultCallback?.(speechResult);
      }
    });
  }

  private mapSpeakerToRole(speaker: string, text: string): string {
    const lowerText = text.toLowerCase();
    
    // Check for role indicators in the text
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
      'treatment plan'
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
      'i need help'
    ];

    let doctorScore = 0;
    let patientScore = 0;

    doctorIndicators.forEach(phrase => {
      if (lowerText.includes(phrase)) doctorScore += 2;
    });
    
    patientIndicators.forEach(phrase => {
      if (lowerText.includes(phrase)) patientScore += 2;
    });

    // Determine role based on text content and speaker label
    if (doctorScore > patientScore) {
      return 'doctor';
    } else if (patientScore > doctorScore) {
      return 'patient';
    } else {
      // Use speaker label as fallback
      return speaker === 'A' ? 'doctor' : 'patient';
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
    return !!(this.config.apiKey && navigator.mediaDevices && MediaRecorder);
  }
} 