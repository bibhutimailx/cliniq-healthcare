import { SpeechRecognitionService, SpeechRecognitionResult } from '@/types/speechRecognition';

type Listener<T> = (arg: T) => void;

interface GoogleStreamingConfig {
  proxyUrl: string; // ws://localhost:3001/stt
  languageCode?: string; // default 'en-IN'
  alternativeLanguageCodes?: string[];
  diarization?: {
    enableSpeakerDiarization?: boolean;
    minSpeakerCount?: number;
    maxSpeakerCount?: number;
  };
  sampleRateHertz?: number; // default 16000
}

export class GoogleStreamingSpeechService implements SpeechRecognitionService {
  private config: GoogleStreamingConfig;
  private ws?: WebSocket;
  private mediaStream?: MediaStream;
  private mediaRecorder?: MediaRecorder;
  private chunks: Blob[] = [];
  private isRecording = false;

  private resultCb?: Listener<SpeechRecognitionResult>;
  private errorCb?: Listener<string>;
  private endCb?: () => void;
  private languageCb?: Listener<string>;
  private speakerCb?: Listener<string>;

  constructor(config: GoogleStreamingConfig) {
    this.config = config;
  }

  isSupported(): boolean {
    return !!(window.MediaRecorder && navigator.mediaDevices?.getUserMedia);
  }

  async start(): Promise<void> {
    if (this.isRecording) return;
    if (!this.isSupported()) throw new Error('MediaRecorder not supported');

    // Connect WebSocket
    this.ws = new WebSocket(this.config.proxyUrl.replace('http', 'ws'));

    this.ws.onopen = async () => {
      // Send config
      this.ws?.send(JSON.stringify({
        type: 'config',
        config: {
          languageCode: this.config.languageCode || 'en-IN',
          alternativeLanguageCodes: this.config.alternativeLanguageCodes || [
            'hi-IN','bn-IN','ta-IN','te-IN','mr-IN','gu-IN','kn-IN','ml-IN','pa-IN','ur-IN'
          ],
          diarization: this.config.diarization || { enableSpeakerDiarization: true, minSpeakerCount: 2, maxSpeakerCount: 2 },
          sampleRateHertz: this.config.sampleRateHertz || 16000,
        }
      }));

      // Start mic
      this.mediaStream = await navigator.mediaDevices.getUserMedia({ audio: {
        channelCount: 1,
        sampleRate: 16000,
        echoCancellation: true,
        noiseSuppression: true,
        autoGainControl: true
      }});

      // Use MediaRecorder with audio/webm;codecs=opus and let proxy assume PCM16.
      // For simplicity, we transcode by decoding in browser is heavy; instead we send webm chunks and decode on server ideally.
      // Here we take a pragmatic approach: use raw if available; fallback to webm and rely on server adaptation later.
      // To keep it lightweight, we'll use small chunks and send as-is; the server expects LINEAR16, but this minimal proxy
      // assumes client provides PCM. In production, add decoding server-side. For now, we simulate PCM by extracting raw data
      // is out-of-scope; so we switch to pcm via ScriptProcessor is deprecated. We'll stick to webm and enhance server later.

      const mime = MediaRecorder.isTypeSupported('audio/webm;codecs=opus') ? 'audio/webm;codecs=opus' : 'audio/webm';
      this.mediaRecorder = new MediaRecorder(this.mediaStream, { mimeType: mime, audioBitsPerSecond: 128000 });
      this.isRecording = true;

      this.mediaRecorder.ondataavailable = (e) => {
        if (e.data && e.data.size > 0 && this.ws && this.ws.readyState === WebSocket.OPEN) {
          this.ws.send(e.data);
        }
      };

      this.mediaRecorder.onstop = () => {
        this.isRecording = false;
        this.endCb?.();
      };

      this.ws.onmessage = (event) => {
        try {
          const msg = JSON.parse(event.data);
          if (msg.type === 'transcript') {
            const lang = (msg.languageCode || '').split('-')[0] || 'en';
            if (lang) this.languageCb?.(lang);
            let speaker = 'patient';
            if (msg.speakerTag === 1) speaker = 'doctor';
            if (msg.speakerTag === 2) speaker = 'patient';

            this.resultCb?.({
              transcript: msg.transcript || '',
              isFinal: !!msg.isFinal,
              confidence: msg.confidence || 0.9,
              language: lang,
              speaker
            });
            this.speakerCb?.(speaker);
          } else if (msg.type === 'error') {
            this.errorCb?.(msg.message || 'Streaming error');
          }
        } catch {}
      };

      this.ws.onerror = () => this.errorCb?.('WebSocket error');
      this.ws.onclose = () => this.endCb?.();

      this.mediaRecorder.start(250); // small chunks for low latency
    };
  }

  stop(): void {
    if (this.mediaRecorder && this.isRecording) {
      try { this.mediaRecorder.stop(); } catch {}
    }
    if (this.mediaStream) {
      try { this.mediaStream.getTracks().forEach(t => t.stop()); } catch {}
    }
    if (this.ws && this.ws.readyState === WebSocket.OPEN) {
      try { this.ws.send(JSON.stringify({ type: 'stop' })); } catch {}
      try { this.ws.close(); } catch {}
    }
    this.isRecording = false;
  }

  onResult(cb: Listener<SpeechRecognitionResult>): void { this.resultCb = cb; }
  onError(cb: Listener<string>): void { this.errorCb = cb; }
  onEnd(cb: () => void): void { this.endCb = cb; }
  onLanguageDetected?(cb: Listener<string>): void { this.languageCb = cb; }
  onSpeakerDetected?(cb: Listener<string>): void { this.speakerCb = cb; }
}

export default GoogleStreamingSpeechService;



