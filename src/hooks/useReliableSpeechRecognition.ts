import { useState, useEffect, useCallback, useRef } from 'react';
import { TranscriptEntry } from '@/types/consultation';
import { useToast } from '@/hooks/use-toast';

interface BrowserSpeechRecognition {
  continuous: boolean;
  interimResults: boolean;
  lang: string;
  start(): void;
  stop(): void;
  abort(): void;
  onstart: (() => void) | null;
  onend: (() => void) | null;
  onresult: ((event: any) => void) | null;
  onerror: ((event: any) => void) | null;
}

interface SpeechRecognitionWindow extends Window {
  SpeechRecognition?: new () => BrowserSpeechRecognition;
  webkitSpeechRecognition?: new () => BrowserSpeechRecognition;
}

interface UseReliableSpeechRecognitionProps {
  language?: string;
  onTranscriptEntry: (entry: TranscriptEntry) => void;
  onLanguageDetected?: (language: string) => void;
}

export const useReliableSpeechRecognition = ({
  language = 'en-US',
  onTranscriptEntry,
  onLanguageDetected
}: UseReliableSpeechRecognitionProps) => {
  const [isRecording, setIsRecording] = useState(false);
  const [isSupported, setIsSupported] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState<'disconnected' | 'connected' | 'error'>('disconnected');
  const [currentSpeaker, setCurrentSpeaker] = useState<'doctor' | 'patient'>('doctor');
  const [recognition, setRecognition] = useState<BrowserSpeechRecognition | null>(null);
  const [transcriptCount, setTranscriptCount] = useState(0);
  const [interimText, setInterimText] = useState('');
  const [currentLangCode, setCurrentLangCode] = useState(language);
  
  const { toast } = useToast();
  const restartTimeoutRef = useRef<NodeJS.Timeout>();
  const manuallyStoppedRef = useRef(false);

  const detectLanguageFromText = useCallback((text: string): string | null => {
    if (!text) return null;
    const codePoints = Array.from(text);

    let counts: Record<string, number> = {
      'en-US': 0,
      'hi-IN': 0,
      'mr-IN': 0,
      'bn-IN': 0,
      'pa-IN': 0,
      'gu-IN': 0,
      'or-IN': 0,
      'ta-IN': 0,
      'te-IN': 0,
      'kn-IN': 0,
      'ml-IN': 0,
      'ur-IN': 0
    };

    for (const ch of codePoints) {
      const cp = ch.codePointAt(0) || 0;
      if ((cp >= 0x0900 && cp <= 0x097F)) { counts['hi-IN']++; counts['mr-IN']++; }
      else if (cp >= 0x0980 && cp <= 0x09FF) counts['bn-IN']++;
      else if (cp >= 0x0A00 && cp <= 0x0A7F) counts['pa-IN']++;
      else if (cp >= 0x0A80 && cp <= 0x0AFF) counts['gu-IN']++;
      else if (cp >= 0x0B00 && cp <= 0x0B7F) counts['or-IN']++;
      else if (cp >= 0x0B80 && cp <= 0x0BFF) counts['ta-IN']++;
      else if (cp >= 0x0C00 && cp <= 0x0C7F) counts['te-IN']++;
      else if (cp >= 0x0C80 && cp <= 0x0CFF) counts['kn-IN']++;
      else if (cp >= 0x0D00 && cp <= 0x0D7F) counts['ml-IN']++;
      else if (cp >= 0x0600 && cp <= 0x06FF) counts['ur-IN']++;
      else if ((cp >= 0x0041 && cp <= 0x007A) || (cp >= 0x0020 && cp <= 0x007E)) counts['en-US']++;
    }

    let bestLang: string = currentLangCode;
    let bestCount = 0;
    Object.entries(counts).forEach(([lang, count]) => {
      if (count > bestCount) {
        bestCount = count;
        bestLang = lang;
      }
    });

    if (bestCount >= 6 && bestLang !== currentLangCode) {
      return bestLang;
    }
    return null;
  }, [currentLangCode]);

  useEffect(() => {
    try {
      const windowWithSpeech = window as SpeechRecognitionWindow;
      const SpeechRecognition = windowWithSpeech.SpeechRecognition || windowWithSpeech.webkitSpeechRecognition;
      
      if (!SpeechRecognition) {
        setIsSupported(false);
        setConnectionStatus('error');
        toast({
          title: "Speech Recognition Not Supported",
          description: "Please use Chrome, Edge, or Safari for speech recognition.",
          variant: "destructive"
        });
        return;
      }

      setIsSupported(true);
      const recognitionInstance = new SpeechRecognition();
      recognitionInstance.continuous = true;
      recognitionInstance.interimResults = true;
      recognitionInstance.lang = currentLangCode;

      recognitionInstance.onstart = () => {
        console.log('[SR] onstart');
        setIsRecording(true);
        setConnectionStatus('connected');
      };

      recognitionInstance.onend = () => {
        console.log('[SR] onend, manuallyStopped=', manuallyStoppedRef.current);
        setIsRecording(false);
        if (!manuallyStoppedRef.current) {
          restartTimeoutRef.current = setTimeout(() => {
            try {
              console.log('[SR] auto-restart');
              recognitionInstance.start();
            } catch (e) {
              console.warn('[SR] auto-restart failed', e);
            }
          }, 400);
        }
      };

      recognitionInstance.onresult = (event) => {
        const result = event.results[event.results.length - 1];
        if (!result || !result[0]) return;
        const transcript = result[0].transcript.trim();
        const confidence = result[0].confidence || 0.85;

        const detected = detectLanguageFromText(transcript);
        if (detected && detected !== currentLangCode) {
          console.log('[SR] language switch ->', detected);
          manuallyStoppedRef.current = true;
          try { recognitionInstance.stop(); } catch {}
          setTimeout(() => {
            if (recognitionInstance) {
              recognitionInstance.lang = detected;
              setCurrentLangCode(detected);
              onLanguageDetected?.(detected.split('-')[0]);
              manuallyStoppedRef.current = false;
              try { recognitionInstance.start(); } catch {}
            }
          }, 300);
        }

        if (result.isFinal) {
          setInterimText('');
          if (transcript.length > 0) {
            const speaker = detectSpeaker(transcript);
            setCurrentSpeaker(speaker);
            const entry: TranscriptEntry = {
              id: `reliable-${Date.now()}-${transcriptCount}`,
              speaker,
              text: transcript,
              timestamp: new Date().toLocaleTimeString([], {
                hour: '2-digit',
                minute: '2-digit',
                second: '2-digit'
              }),
              language: (currentLangCode.split('-')[0]),
              confidence: Math.round(confidence * 100),
              voiceSignature: `reliable-${speaker}-${Date.now()}`
            };
            setTranscriptCount(prev => prev + 1);
            onTranscriptEntry(entry);
          }
        } else {
          setInterimText(transcript);
        }
      };

      recognitionInstance.onerror = (event) => {
        console.warn('[SR] onerror', event?.error);
        setIsRecording(false);
        setConnectionStatus('error');
        if (event?.error === 'no-speech' || event?.error === 'aborted') return;
        toast({ title: "Speech Error", description: `Error: ${event?.error || 'unknown'}`, variant: "destructive" });
      };

      setRecognition(recognitionInstance);
      setConnectionStatus('connected');
    } catch (error) {
      setIsSupported(false);
      setConnectionStatus('error');
      toast({ title: "Initialization Failed", description: "Failed to initialize speech recognition. Please refresh the page.", variant: "destructive" });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentLangCode, onTranscriptEntry, onLanguageDetected]);

  const detectSpeaker = (text: string): 'doctor' | 'patient' => {
    const doctor = ['diagnosis','prescription','treatment','recommend','examine','prescribe','medical','symptoms','condition','therapy','medication','follow up','test results','blood pressure','heart rate','temperature','breathing'];
    const patient = ['feel','hurt','pain','ache','tired','dizzy','nausea','headache','stomach','chest','back','leg','arm','throat','cough','fever','sleep','appetite','worry','concerned','problem','issue','help'];
    const lower = text.toLowerCase();
    const d = doctor.filter(k=>lower.includes(k)).length;
    const p = patient.filter(k=>lower.includes(k)).length;
    if (d > p) return 'doctor';
    if (p > d) return 'patient';
    return currentSpeaker;
  };

  const startRecording = useCallback(async () => {
    console.log('[SR] startRecording called');
    if (!recognition || !isSupported) {
      toast({ title: "Speech Not Available", description: "Initialization incomplete.", variant: "destructive" });
      return;
    }
    try {
      manuallyStoppedRef.current = false;
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      stream.getTracks().forEach(t=>t.stop());
      recognition.start();
    } catch (error) {
      setConnectionStatus('error');
      toast({ title: "Microphone Access Required", description: "Allow mic access and try again.", variant: "destructive" });
    }
  }, [recognition, isSupported, toast]);

  const stopRecording = useCallback(() => {
    console.log('[SR] stopRecording called');
    manuallyStoppedRef.current = true;
    if (restartTimeoutRef.current) {
      clearTimeout(restartTimeoutRef.current);
      restartTimeoutRef.current = undefined;
    }
    setInterimText('');
    setIsRecording(false);
    if (recognition) {
      try { recognition.stop(); } catch (e) { console.warn('[SR] stop failed', e); }
      // Fallback to abort if stop does not fire onend
      setTimeout(() => {
        if (isRecording) return; // onend likely fired
        try { recognition.abort(); } catch {}
      }, 300);
    }
  }, [recognition, isRecording]);

  const toggleRecording = useCallback(() => {
    console.log('[SR] toggleRecording, isRecording=', isRecording);
    if (isRecording) stopRecording(); else startRecording();
  }, [isRecording, startRecording, stopRecording]);

  useEffect(() => {
    return () => {
      if (restartTimeoutRef.current) clearTimeout(restartTimeoutRef.current);
      if (recognition) {
        try { recognition.abort(); } catch {}
      }
    };
  }, [recognition]);

  return {
    isRecording,
    isSupported,
    connectionStatus,
    currentSpeaker,
    setCurrentSpeaker,
    startRecording,
    stopRecording,
    toggleRecording,
    interimText,
    totalSpeakers: 2,
    serviceProvider: 'Browser Native (Reliable)',
    speakerToggle: currentSpeaker
  };
};
