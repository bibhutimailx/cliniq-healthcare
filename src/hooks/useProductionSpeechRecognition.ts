
import { useState, useEffect, useCallback, useRef } from 'react';
import { TranscriptEntry } from '@/types/consultation';
import { useToast } from '@/hooks/use-toast';
import { 
  createSpeechRecognitionService, 
  SpeechRecognitionConfig, 
  SpeechRecognitionService,
  SpeechRecognitionResult 
} from '@/services/speechRecognitionService';
import { voiceSignatureDetection } from '@/utils/voiceSignatureDetection';

interface UseProductionSpeechRecognitionProps {
  config: SpeechRecognitionConfig;
  onTranscriptEntry: (entry: TranscriptEntry) => Promise<void>;
  onLanguageDetected: (language: string) => void;
}

export const useProductionSpeechRecognition = ({
  config,
  onTranscriptEntry,
  onLanguageDetected
}: UseProductionSpeechRecognitionProps) => {
  const [isRecording, setIsRecording] = useState(false);
  const [speechService, setSpeechService] = useState<SpeechRecognitionService | null>(null);
  const [connectionStatus, setConnectionStatus] = useState<'disconnected' | 'connecting' | 'connected' | 'error'>('disconnected');
  const [currentSpeaker, setCurrentSpeaker] = useState<'doctor' | 'patient' | 'guest1' | 'guest2' | 'guest3' | 'guest4'>('doctor');
  const [detectedLanguage, setDetectedLanguage] = useState<string>('en');
  const [detectedSpeaker, setDetectedSpeaker] = useState<string>('doctor');
  const transcriptCountRef = useRef(0);
  const restartTimeoutRef = useRef<NodeJS.Timeout>();
  const { toast } = useToast();

  // Initialize speech service when config changes
  useEffect(() => {
    console.log('Config changed, reinitializing speech service:', config);
    
    try {
      const service = createSpeechRecognitionService(config);
      
      if (!service.isSupported()) {
        setConnectionStatus('error');
        toast({
          title: "Speech Recognition Not Supported",
          description: "Your browser doesn't support the selected speech recognition service.",
          variant: "destructive"
        });
        return;
      }

      // Set up event handlers
      service.onResult((result: SpeechRecognitionResult) => {
        console.log('Speech recognition result received:', result);
        
        if (result.transcript.trim().length > 0) {
          const transcriptText = result.transcript.trim();
          console.log('Processing transcript:', transcriptText);
          
          // Handle speaker detection - use AssemblyAI's enhanced speaker diarization if available
          let detectedSpeaker: 'doctor' | 'patient' | 'guest1' | 'guest2' | 'guest3' | 'guest4' = 'doctor';
          if (config.provider === 'assemblyai' && result.speaker) {
            // AssemblyAI provides enhanced speaker roles (doctor, patient, guest1, guest2, etc.)
            setDetectedSpeaker(result.speaker);
            detectedSpeaker = result.speaker as any;
          } else {
            // Fallback to voice signature detection for other providers
            const detection = voiceSignatureDetection.detectSpeaker(transcriptText);
            detectedSpeaker = detection.speaker as any;
          }
          
          setCurrentSpeaker(detectedSpeaker);
          console.log('Detected speaker:', detectedSpeaker);
          
          // Handle language detection
          if (result.language && result.language !== detectedLanguage) {
            setDetectedLanguage(result.language);
            onLanguageDetected(result.language);
            console.log(`Language detected: ${result.language}`);
          }
          
          // Only create transcript entry for final results
          if (result.isFinal) {
            transcriptCountRef.current += 1;
            
            const newEntry: TranscriptEntry = {
              id: `${Date.now()}-${transcriptCountRef.current}`,
              speaker: detectedSpeaker,
              text: transcriptText,
              timestamp: new Date().toLocaleTimeString([], { 
                hour: '2-digit', 
                minute: '2-digit', 
                second: '2-digit' 
              }),
              language: result.language || detectedLanguage,
              confidence: Math.min(Math.round(Math.min(result.confidence, 0.95) * 100), 100),
              voiceSignature: config.provider === 'assemblyai' ? result.speaker : 'voice_pattern'
            };
            
            console.log('Creating transcript entry:', newEntry);
            
            // Handle async transcript entry processing
            onTranscriptEntry(newEntry).catch(error => {
              console.error('Failed to process transcript entry:', error);
            });
          }
        }
      });

      // Set up language detection callback if available
      if (service.onLanguageDetected) {
        service.onLanguageDetected((language: string) => {
          setDetectedLanguage(language);
          onLanguageDetected(language);
          toast({
            title: "Language Detected",
            description: `Switched to ${language.toUpperCase()}`,
          });
        });
      }

      // Set up enhanced speaker detection callback if available (AssemblyAI)
      if (service.onSpeakerDetected) {
        service.onSpeakerDetected((speaker: string) => {
          setDetectedSpeaker(speaker);
          const speakerLabel = getSpeakerLabel(speaker);
          console.log(`Speaker detected: ${speakerLabel} (${speaker})`);
          
          // Show toast for new speakers (except doctor and patient)
          if (speaker.startsWith('guest')) {
            toast({
              title: "New Speaker Detected",
              description: `${speakerLabel} joined the conversation`,
            });
          }
        });
      }

      service.onError((error: string) => {
        console.error('Speech recognition error:', error);
        setConnectionStatus('error');
        
        // Don't show toast for aborted errors
        if (!error.includes('aborted')) {
          toast({
            title: "Speech Recognition Error",
            description: error,
            variant: "destructive"
          });
        }
        
        // Auto-restart after error (except for permission errors)
        if (isRecording && !error.includes('not-allowed') && !error.includes('aborted')) {
          restartTimeoutRef.current = setTimeout(() => {
            if (isRecording) {
              startRecording();
            }
          }, 2000);
        } else {
          setIsRecording(false);
        }
      });

      service.onEnd(() => {
        console.log('Speech recognition ended');
        setConnectionStatus('disconnected');
        
        // Auto-restart if still recording (for continuous recognition like Zoom)
        if (isRecording && config.continuous) {
          restartTimeoutRef.current = setTimeout(() => {
            if (isRecording) {
              startRecording();
            }
          }, 500); // Faster restart for continuous recording
        } else {
          setIsRecording(false);
        }
      });

      setSpeechService(service);
      setConnectionStatus('connected');
      
    } catch (error) {
      console.error('Failed to initialize speech service:', error);
      setConnectionStatus('error');
      toast({
        title: "Speech Service Error",
        description: `Failed to initialize ${config.provider} speech recognition`,
        variant: "destructive"
      });
    }
  }, [config, onTranscriptEntry, onLanguageDetected, toast, isRecording, detectedLanguage]);

  // Restart speech recognition when language changes
  useEffect(() => {
    if (isRecording && speechService) {
      console.log('Language changed, restarting speech recognition');
      stopRecording();
      setTimeout(() => {
        startRecording();
      }, 100);
    }
  }, [config.language]);

  const getSpeakerLabel = (speaker: string): string => {
    switch (speaker) {
      case 'doctor':
        return 'Doctor';
      case 'patient':
        return 'Patient';
      case 'guest1':
        return 'Guest 1';
      case 'guest2':
        return 'Guest 2';
      case 'guest3':
        return 'Guest 3';
      case 'guest4':
        return 'Guest 4';
      default:
        return speaker;
    }
  };

  const startRecording = useCallback(async () => {
    console.log('Starting recording with provider:', config.provider);
    
    if (!speechService) {
      console.error('Speech service not available');
      toast({
        title: "Speech Service Not Ready",
        description: "Please wait for speech recognition to initialize.",
        variant: "destructive"
      });
      return;
    }

    try {
      console.log('Checking if speech service is supported...');
      if (!speechService.isSupported()) {
        console.error('Speech service not supported');
        setConnectionStatus('error');
        toast({
          title: "Speech Recognition Not Supported",
          description: "Your browser doesn't support the selected speech recognition service.",
          variant: "destructive"
        });
        return;
      }

      setConnectionStatus('connecting');
      console.log('Starting speech service...');
      await speechService.start();
      setIsRecording(true);
      setConnectionStatus('connected');
      
      console.log(`Started ${config.provider} speech recognition with advanced features`);
      
      // Show provider-specific status
      if (config.provider === 'anthropic') {
        toast({
          title: "Anthropic Claude Started",
          description: "AI-powered medical speech recognition active!",
        });
      } else if (config.provider === 'assemblyai') {
        toast({
          title: "AssemblyAI Started",
          description: "Advanced language detection and multi-speaker diarization active!",
        });
      } else if (config.provider === 'reverie') {
        toast({
          title: "Continuous Recording Started",
          description: "Automatic language detection enabled. Speak in any language!",
        });
      }
      
    } catch (error) {
      console.error('Failed to start recording:', error);
      setConnectionStatus('error');
      setIsRecording(false);
      toast({
        title: "Recording Failed",
        description: `Could not start ${config.provider} speech recognition. Please check microphone permissions.`,
        variant: "destructive"
      });
    }
  }, [speechService, config.provider, toast]);

  const stopRecording = useCallback(() => {
    if (restartTimeoutRef.current) {
      clearTimeout(restartTimeoutRef.current);
    }
    
    if (speechService && isRecording) {
      speechService.stop();
      setIsRecording(false);
      setConnectionStatus('disconnected');
      
      const speakerCount = config.provider === 'assemblyai' ? 5 : voiceSignatureDetection.getSpeakerStats().totalSpeakers;
      
      toast({
        title: "Recording Stopped",
        description: `Captured ${transcriptCountRef.current} entries in ${detectedLanguage.toUpperCase()}`,
      });
    }
  }, [speechService, isRecording, toast, detectedLanguage, config.provider]);

  const toggleRecording = useCallback(() => {
    if (isRecording) {
      stopRecording();
    } else {
      // Reset for new session
      transcriptCountRef.current = 0;
      voiceSignatureDetection.resetSpeakers();
      setDetectedLanguage('en');
      setDetectedSpeaker('doctor');
      startRecording();
    }
  }, [isRecording, startRecording, stopRecording]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (restartTimeoutRef.current) {
        clearTimeout(restartTimeoutRef.current);
      }
      // Cleanup is handled automatically by the singleton
    };
  }, []);

  return {
    isRecording,
    connectionStatus,
    toggleRecording,
    speakerToggle: currentSpeaker,
    totalSpeakers: config.provider === 'assemblyai' ? 5 : voiceSignatureDetection.getSpeakerStats().totalSpeakers,
    serviceProvider: config.provider,
    detectedLanguage,
    detectedSpeaker
  };
};
