import { useState, useEffect, useCallback, useRef } from 'react';
import { TranscriptEntry } from '@/types/consultation';
import { useToast } from '@/hooks/use-toast';
import { OpenAIWhisperService, WhisperConfig, MEDICAL_CONTEXT_PROMPT } from '@/services/speech/OpenAIWhisperService';

interface UseWhisperSpeechRecognitionProps {
  apiKey: string;
  language?: string;
  onTranscriptEntry: (entry: TranscriptEntry) => void;
  chunkDuration?: number; // How often to process audio chunks (in milliseconds)
}

export const useWhisperSpeechRecognition = ({
  apiKey,
  language = 'auto',
  onTranscriptEntry,
  chunkDuration = 5000 // 5 seconds by default
}: UseWhisperSpeechRecognitionProps) => {
  const [isRecording, setIsRecording] = useState(false);
  const [isSupported, setIsSupported] = useState(false);
  const [currentSpeaker, setCurrentSpeaker] = useState<'doctor' | 'patient'>('doctor');
  const [connectionStatus, setConnectionStatus] = useState<'disconnected' | 'connecting' | 'connected'>('disconnected');
  const [transcriptCount, setTranscriptCount] = useState(0);
  
  const { toast } = useToast();
  const whisperServiceRef = useRef<OpenAIWhisperService | null>(null);
  const chunkIntervalRef = useRef<NodeJS.Timeout>();
  const recordingStartTimeRef = useRef<number>(0);

  // Initialize Whisper service
  useEffect(() => {
    if (!apiKey) {
      setIsSupported(false);
      setConnectionStatus('disconnected');
      return;
    }

    const config: WhisperConfig = {
      apiKey,
      language: language === 'auto' ? 'auto' : language,
      responseFormat: 'verbose_json',
      temperature: 0.1, // Low temperature for more consistent results
      prompt: MEDICAL_CONTEXT_PROMPT
    };

    const service = new OpenAIWhisperService(config);
    
    if (service.isSupported()) {
      setIsSupported(true);
      setConnectionStatus('connected');
      
      // Set up event handlers
      service.onResult((result) => {
        console.log('🎤 Whisper result received:', result);
        
        // Detect speaker based on content
        const speaker = detectSpeaker(result.transcript);
        setCurrentSpeaker(speaker);
        
        // Create transcript entry
        const entry: TranscriptEntry = {
          id: `whisper-${Date.now()}-${transcriptCount}`,
          speaker,
          text: result.transcript,
          timestamp: new Date().toLocaleTimeString([], { 
            hour: '2-digit', 
            minute: '2-digit', 
            second: '2-digit' 
          }),
          language: result.language || language,
          confidence: Math.round((result.confidence || 0.95) * 100),
          voiceSignature: `whisper-${speaker}-${Date.now()}`
        };

        setTranscriptCount(prev => prev + 1);
        onTranscriptEntry(entry);
      });

      service.onError((error) => {
        console.error('Whisper error:', error);
        setIsRecording(false);
        setConnectionStatus('disconnected');
        
        toast({
          title: "Speech Recognition Error",
          description: error,
          variant: "destructive"
        });
      });

      service.onEnd(() => {
        console.log('Whisper transcription completed');
      });

      whisperServiceRef.current = service;
      
    } else {
      setIsSupported(false);
      setConnectionStatus('disconnected');
      toast({
        title: "Whisper Not Supported",
        description: "Your browser doesn't support audio recording for Whisper.",
        variant: "destructive"
      });
    }

    return () => {
      if (whisperServiceRef.current) {
        whisperServiceRef.current.cleanup();
      }
    };
  }, [apiKey, language, onTranscriptEntry, toast, transcriptCount]);

  // Simple speaker detection based on content
  const detectSpeaker = (text: string): 'doctor' | 'patient' => {
    const doctorKeywords = [
      'diagnosis', 'prescription', 'treatment', 'recommend', 'examine', 'prescribe',
      'medical', 'symptoms', 'condition', 'therapy', 'medication', 'follow up',
      'test results', 'blood pressure', 'heart rate', 'temperature', 'breathing'
    ];
    
    const patientKeywords = [
      'feel', 'hurt', 'pain', 'ache', 'tired', 'dizzy', 'nausea', 'headache',
      'stomach', 'chest', 'back', 'leg', 'arm', 'throat', 'cough', 'fever',
      'sleep', 'appetite', 'worry', 'concerned', 'problem', 'issue'
    ];

    const lowerText = text.toLowerCase();
    
    const doctorScore = doctorKeywords.filter(keyword => lowerText.includes(keyword)).length;
    const patientScore = patientKeywords.filter(keyword => lowerText.includes(keyword)).length;
    
    if (doctorScore > patientScore) {
      return 'doctor';
    } else if (patientScore > doctorScore) {
      return 'patient';
    }
    
    // If no clear indication, keep current speaker
    return currentSpeaker;
  };

  // Start recording with chunked processing
  const startRecording = useCallback(async () => {
    if (!whisperServiceRef.current || !isSupported) {
      toast({
        title: "Whisper Not Available",
        description: "Please check your API key and try again.",
        variant: "destructive"
      });
      return;
    }

    try {
      setConnectionStatus('connecting');
      recordingStartTimeRef.current = Date.now();
      
      // Start continuous recording with chunked processing
      const startChunkedRecording = async () => {
        if (!whisperServiceRef.current) return;
        
        await whisperServiceRef.current.start();
        setIsRecording(true);
        setConnectionStatus('connected');
        
        // Set up interval for chunked processing
        chunkIntervalRef.current = setInterval(async () => {
          if (whisperServiceRef.current && isRecording) {
            // Stop current recording to process chunk
            await whisperServiceRef.current.stop();
            
            // Small delay to ensure processing completes
            setTimeout(async () => {
              if (whisperServiceRef.current && isRecording) {
                // Start new chunk
                await whisperServiceRef.current.start();
              }
            }, 100);
          }
        }, chunkDuration);
      };

      await startChunkedRecording();
      
      console.log('🎤 Whisper recording started with chunked processing');
      
    } catch (error) {
      console.error('Failed to start Whisper recording:', error);
      setIsRecording(false);
      setConnectionStatus('disconnected');
      
      toast({
        title: "Recording Failed",
        description: "Unable to start recording. Please check microphone permissions.",
        variant: "destructive"
      });
    }
  }, [isSupported, chunkDuration, toast, isRecording]);

  // Stop recording
  const stopRecording = useCallback(async () => {
    if (!whisperServiceRef.current || !isRecording) {
      return;
    }

    try {
      // Clear chunk interval
      if (chunkIntervalRef.current) {
        clearInterval(chunkIntervalRef.current);
        chunkIntervalRef.current = undefined;
      }

      // Stop recording
      await whisperServiceRef.current.stop();
      setIsRecording(false);
      setConnectionStatus('connected');
      
      const duration = Date.now() - recordingStartTimeRef.current;
      console.log(`🛑 Whisper recording stopped (duration: ${Math.round(duration / 1000)}s)`);
      
    } catch (error) {
      console.error('Error stopping Whisper recording:', error);
    }
  }, [isRecording]);

  // Toggle recording
  const toggleRecording = useCallback(() => {
    if (isRecording) {
      stopRecording();
    } else {
      startRecording();
    }
  }, [isRecording, startRecording, stopRecording]);

  // Update language
  const setLanguage = useCallback((newLanguage: string) => {
    if (whisperServiceRef.current) {
      whisperServiceRef.current.setLanguage(newLanguage);
    }
  }, []);

  // Update API key
  const updateApiKey = useCallback((newApiKey: string) => {
    if (!newApiKey) return;
    
    // Recreate service with new API key
    const config: WhisperConfig = {
      apiKey: newApiKey,
      language: language === 'auto' ? 'auto' : language,
      responseFormat: 'verbose_json',
      temperature: 0.1,
      prompt: MEDICAL_CONTEXT_PROMPT
    };

    if (whisperServiceRef.current) {
      whisperServiceRef.current.cleanup();
    }

    const service = new OpenAIWhisperService(config);
    whisperServiceRef.current = service;
    
    setConnectionStatus(service.isSupported() ? 'connected' : 'disconnected');
  }, [language]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (chunkIntervalRef.current) {
        clearInterval(chunkIntervalRef.current);
      }
      if (whisperServiceRef.current) {
        whisperServiceRef.current.cleanup();
      }
    };
  }, []);

  return {
    isRecording,
    isSupported,
    connectionStatus,
    currentSpeaker,
    setCurrentSpeaker,
    startRecording,
    stopRecording,
    toggleRecording,
    setLanguage,
    updateApiKey,
    totalSpeakers: 2, // Doctor and Patient
    serviceProvider: 'OpenAI Whisper'
  };
};
