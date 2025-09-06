
import { useState, useEffect, useCallback, useRef } from 'react';
import { TranscriptEntry, Language } from '@/types/consultation';
import { useToast } from '@/hooks/use-toast';
import { createSpeechRecognition, handleSpeechRecognitionError } from '@/utils/speechRecognitionConfig';
import { createSimpleSpeechRecognition, testMicrophoneAccess, checkBrowserSupport } from '@/utils/simpleSpeechConfig';
import { voiceSignatureDetection } from '@/utils/voiceSignatureDetection';

interface UseSpeechRecognitionProps {
  selectedLanguage: string;
  languages: Language[];
  onTranscriptEntry: (entry: TranscriptEntry) => void;
  onLanguageDetected: (language: string) => void;
}

export const useSpeechRecognition = ({
  selectedLanguage,
  languages,
  onTranscriptEntry,
  onLanguageDetected
}: UseSpeechRecognitionProps) => {
  const [isRecording, setIsRecording] = useState(false);
  const [speechRecognition, setSpeechRecognition] = useState<any>(null);
  const [currentSpeaker, setCurrentSpeaker] = useState<'doctor' | 'patient'>('doctor');
  const transcriptCountRef = useRef(0);
  const restartTimeoutRef = useRef<NodeJS.Timeout>();
  const { toast } = useToast();

  useEffect(() => {
    const initializeSpeechRecognition = async () => {
      // Check browser support first
      const support = checkBrowserSupport();
      if (!support.speechRecognition) {
        toast({
          title: "Speech Recognition Not Supported",
          description: "Your browser doesn't support speech recognition. Please use Chrome, Edge, or Safari.",
          variant: "destructive"
        });
        return;
      }

      // Test microphone access
      const hasAccess = await testMicrophoneAccess();
      if (!hasAccess) {
        toast({
          title: "Microphone Access Required",
          description: "Please allow microphone access to use speech recognition.",
          variant: "destructive"
        });
        return;
      }

      // Try advanced speech recognition first, fallback to simple
      let recognition = null;
      
      try {
        // Try advanced service if API key is available
        recognition = createSpeechRecognition(selectedLanguage, languages);
      } catch (error) {
        console.warn('Advanced speech recognition not available:', error);
      }
      
      // Fallback to simple browser recognition
      if (!recognition) {
        recognition = createSimpleSpeechRecognition(selectedLanguage, languages);
      }

      if (!recognition) {
        toast({
          title: "Speech Recognition Error",
          description: "Unable to initialize speech recognition service.",
          variant: "destructive"
        });
        return;
      }

      // Set up recognition event handlers
      recognition.onresult = (event: any) => {
        const lastResult = event.results[event.results.length - 1];
        if (lastResult.isFinal) {
          const text = lastResult[0].transcript.trim();
          const confidence = lastResult[0].confidence || 0.8;
          
          if (text.length > 0) {
            // Use improved speaker detection
            const detection = voiceSignatureDetection.detectSpeaker(text);
            setCurrentSpeaker(detection.speaker);
            
            transcriptCountRef.current += 1;
            
            const newEntry: TranscriptEntry = {
              id: `${Date.now()}-${transcriptCountRef.current}`,
              speaker: detection.speaker,
              text: text,
              timestamp: new Date().toLocaleTimeString([], { 
                hour: '2-digit', 
                minute: '2-digit', 
                second: '2-digit' 
              }),
              language: recognition.lang.split('-')[0],
              confidence: Math.min(Math.round(Math.min(confidence, detection.confidence) * 100), 100),
              voiceSignature: detection.voiceSignature
            };

            console.log('Browser speech recognition with smart detection:', {
              text: text,
              detectedSpeaker: detection.speaker,
              confidence: `${Math.round(detection.confidence * 100)}%`
            });
            
            onTranscriptEntry(newEntry);
            onLanguageDetected(recognition.lang.split('-')[0]);
          }
        }
      };

      recognition.onerror = (event: any) => {
        handleSpeechRecognitionError(event, toast, setIsRecording);
        
        // Auto-restart after error (except for permission errors)
        if (isRecording && event.error !== 'not-allowed' && event.error !== 'aborted') {
          restartTimeoutRef.current = setTimeout(() => {
            if (isRecording) {
              try {
                recognition.start();
              } catch (error) {
                console.error('Failed to restart recognition:', error);
                setIsRecording(false);
              }
            }
          }, 2000);
        }
      };

      recognition.onend = () => {
        console.log('Speech recognition ended');
        // Restart if still recording
        if (isRecording) {
          restartTimeoutRef.current = setTimeout(() => {
            if (isRecording) {
              try {
                recognition.start();
              } catch (error) {
                console.error('Failed to restart recognition:', error);
                setIsRecording(false);
              }
            }
          }, 500);
        }
      };

      recognition.onstart = () => {
        console.log('Speech recognition started successfully');
      };

      setSpeechRecognition(recognition);
    };

    // Initialize speech recognition
    initializeSpeechRecognition();

    // Cleanup function
    return () => {
      if (restartTimeoutRef.current) {
        clearTimeout(restartTimeoutRef.current);
      }
    };
  }, [selectedLanguage, languages, toast, onTranscriptEntry, onLanguageDetected]);

  const toggleRecording = useCallback(() => {
    if (restartTimeoutRef.current) {
      clearTimeout(restartTimeoutRef.current);
    }

    if (!speechRecognition) {
      toast({
        title: "Speech Recognition Unavailable",
        description: "Speech recognition is not supported in this browser.",
        variant: "destructive"
      });
      return;
    }

    if (isRecording) {
      console.log('Stopping speech recognition');
      try {
        speechRecognition.stop();
        setIsRecording(false);
        
        const speakerCount = voiceSignatureDetection.getSpeakerStats().totalSpeakers;
        toast({
          title: "Recording Stopped",
          description: `Captured ${transcriptCountRef.current} entries with smart speaker detection`,
        });
      } catch (error) {
        console.error('Error stopping recognition:', error);
      }
    } else {
      console.log('Starting speech recognition with smart detection');
      
      // Reset for new session
      transcriptCountRef.current = 0;
      voiceSignatureDetection.resetSpeakers();
      
      try {
        speechRecognition.start();
        setIsRecording(true);
        toast({
          title: "Smart Recording Started",
          description: "Speech recognition with intelligent speaker detection is now active",
        });
      } catch (error) {
        console.error('Failed to start speech recognition:', error);
        toast({
          title: "Recording Failed",
          description: "Could not start recording. Please check microphone permissions.",
          variant: "destructive"
        });
      }
    }
  }, [speechRecognition, isRecording, toast]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (restartTimeoutRef.current) {
        clearTimeout(restartTimeoutRef.current);
      }
    };
  }, []);

  return {
    isRecording,
    toggleRecording,
    speakerToggle: currentSpeaker,
    detectedSpeakers: ['doctor', 'patient'],
    totalSpeakers: voiceSignatureDetection.getSpeakerStats().totalSpeakers
  };
};
