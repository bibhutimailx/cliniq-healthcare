import { useState, useEffect, useCallback } from 'react';
import { TranscriptEntry } from '@/types/consultation';
import { useToast } from '@/hooks/use-toast';

interface SpeechRecognitionResult {
  transcript: string;
  confidence: number;
  isFinal: boolean;
}

interface SpeechRecognitionEvent {
  results: SpeechRecognitionResult[][];
  resultIndex: number;
}

interface SpeechRecognitionErrorEvent {
  error: string;
  message?: string;
}

interface BrowserSpeechRecognition {
  continuous: boolean;
  interimResults: boolean;
  lang: string;
  maxAlternatives: number;
  start(): void;
  stop(): void;
  abort(): void;
  onstart: (() => void) | null;
  onend: (() => void) | null;
  onresult: ((event: SpeechRecognitionEvent) => void) | null;
  onerror: ((event: SpeechRecognitionErrorEvent) => void) | null;
}

interface SpeechRecognitionWindow extends Window {
  SpeechRecognition?: new () => BrowserSpeechRecognition;
  webkitSpeechRecognition?: new () => BrowserSpeechRecognition;
}

interface UseSimpleSpeechRecognitionProps {
  language?: string;
  onTranscriptEntry: (entry: TranscriptEntry) => void;
}

export const useSimpleSpeechRecognition = ({
  language = 'en-US',
  onTranscriptEntry
}: UseSimpleSpeechRecognitionProps) => {
  const [isRecording, setIsRecording] = useState(false);
  const [isSupported, setIsSupported] = useState(false);
  const [recognition, setRecognition] = useState<BrowserSpeechRecognition | null>(null);
  const [currentSpeaker, setCurrentSpeaker] = useState<'doctor' | 'patient'>('doctor');
  const { toast } = useToast();

  // Check browser support
  useEffect(() => {
    const windowWithSpeech = window as SpeechRecognitionWindow;
    const SpeechRecognition = windowWithSpeech.SpeechRecognition || windowWithSpeech.webkitSpeechRecognition;
    
    if (SpeechRecognition) {
      setIsSupported(true);
      
      const recognitionInstance = new SpeechRecognition();
      recognitionInstance.continuous = true;
      recognitionInstance.interimResults = false;
      recognitionInstance.lang = language;
      recognitionInstance.maxAlternatives = 1;

      // Set up event handlers
      recognitionInstance.onstart = () => {
        console.log('🎤 Speech recognition started');
        setIsRecording(true);
      };

      recognitionInstance.onend = () => {
        console.log('🎤 Speech recognition ended');
        setIsRecording(false);
      };

      recognitionInstance.onresult = (event) => {
        console.log('🎤 Speech recognition result received');
        
        for (let i = event.resultIndex; i < event.results.length; i++) {
          const result = event.results[i];
          if (result[0] && result[0].transcript) {
            const transcript = result[0].transcript.trim();
            const confidence = result[0].confidence || 0.8;
            
            if (transcript.length > 0) {
              // Simple speaker detection based on keywords
              const doctorKeywords = ['diagnosis', 'prescription', 'treatment', 'recommend', 'examine'];
              const patientKeywords = ['feel', 'hurt', 'pain', 'ache', 'symptoms'];
              
              const speaker = doctorKeywords.some(keyword => 
                transcript.toLowerCase().includes(keyword)
              ) ? 'doctor' : patientKeywords.some(keyword => 
                transcript.toLowerCase().includes(keyword)
              ) ? 'patient' : currentSpeaker;

              setCurrentSpeaker(speaker);

              const entry: TranscriptEntry = {
                id: `${Date.now()}-${Math.random()}`,
                speaker,
                text: transcript,
                timestamp: new Date().toLocaleTimeString([], { 
                  hour: '2-digit', 
                  minute: '2-digit', 
                  second: '2-digit' 
                }),
                language: language.split('-')[0],
                confidence: Math.round(confidence * 100),
                voiceSignature: `voice-${speaker}-${Date.now()}`
              };

              console.log('📝 New transcript entry:', entry);
              onTranscriptEntry(entry);
            }
          }
        }
      };

      recognitionInstance.onerror = (event) => {
        console.error('🎤 Speech recognition error:', event.error);
        setIsRecording(false);
        
        let errorMessage = 'Speech recognition error occurred.';
        
        switch (event.error) {
          case 'not-allowed':
            errorMessage = 'Microphone access denied. Please allow microphone access and try again.';
            break;
          case 'no-speech':
            errorMessage = 'No speech detected. Please speak more clearly.';
            return; // Don't show toast for no-speech, it's normal
          case 'audio-capture':
            errorMessage = 'Microphone not found. Please check your microphone connection.';
            break;
          case 'network':
            errorMessage = 'Network error. Please check your internet connection.';
            break;
          case 'aborted':
            return; // Don't show toast for aborted, it's intentional
          default:
            errorMessage = `Speech recognition error: ${event.error}`;
        }

        toast({
          title: "Speech Recognition Error",
          description: errorMessage,
          variant: "destructive"
        });
      };

      setRecognition(recognitionInstance);
    } else {
      setIsSupported(false);
      console.error('❌ Speech recognition not supported in this browser');
      toast({
        title: "Speech Recognition Not Supported",
        description: "Please use Chrome, Edge, or Safari for speech recognition.",
        variant: "destructive"
      });
    }
  }, [language, onTranscriptEntry, toast, currentSpeaker]);

  const startRecording = useCallback(async () => {
    if (!recognition || !isSupported) {
      toast({
        title: "Speech Recognition Not Available",
        description: "Speech recognition is not supported or not properly initialized.",
        variant: "destructive"
      });
      return;
    }

    try {
      // Request microphone permission first
      await navigator.mediaDevices.getUserMedia({ audio: true });
      
      recognition.start();
      console.log('🎤 Starting speech recognition...');
    } catch (error) {
      console.error('❌ Failed to start speech recognition:', error);
      toast({
        title: "Microphone Access Required",
        description: "Please allow microphone access to use speech recognition.",
        variant: "destructive"
      });
    }
  }, [recognition, isSupported, toast]);

  const stopRecording = useCallback(() => {
    if (recognition && isRecording) {
      recognition.stop();
      console.log('🛑 Stopping speech recognition...');
    }
  }, [recognition, isRecording]);

  const toggleRecording = useCallback(() => {
    if (isRecording) {
      stopRecording();
    } else {
      startRecording();
    }
  }, [isRecording, startRecording, stopRecording]);

  return {
    isRecording,
    isSupported,
    currentSpeaker,
    startRecording,
    stopRecording,
    toggleRecording,
    setCurrentSpeaker
  };
};
