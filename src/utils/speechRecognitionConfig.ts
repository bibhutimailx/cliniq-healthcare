
import { Language, SpeechRecognitionWindow } from '@/types/consultation';

export const createSpeechRecognition = (selectedLanguage: string, languages: Language[]) => {
  const windowWithSpeech = window as SpeechRecognitionWindow;
  const SpeechRecognition = windowWithSpeech.SpeechRecognition || windowWithSpeech.webkitSpeechRecognition;
  
  if (!SpeechRecognition) {
    return null;
  }

  const recognition = new SpeechRecognition();
  
  // Improved configuration based on reference code
  recognition.continuous = true;
  recognition.interimResults = false; // Only get final results for cleaner transcripts
  recognition.maxAlternatives = 1; // Simplified to avoid complexity
  
  const selectedLangCode = languages.find(l => l.value === selectedLanguage)?.code || 'en-US';
  recognition.lang = selectedLangCode;

  return recognition;
};

export const handleSpeechRecognitionError = (
  event: any,
  toast: any,
  setIsRecording: (recording: boolean) => void
) => {
  console.error('Speech recognition error:', event.error);
  
  setIsRecording(false);
  
  if (event.error === 'not-allowed') {
    toast({
      title: "Microphone Access Denied",
      description: "Please allow microphone access to use speech recognition.",
      variant: "destructive"
    });
  } else if (event.error === 'network') {
    toast({
      title: "Network Error",
      description: "Check your internet connection and try again.",
      variant: "destructive"
    });
  } else if (event.error !== 'aborted') {
    toast({
      title: "Speech Recognition Error",
      description: `Error: ${event.error}`,
      variant: "destructive"
    });
  }
};

// Browser compatibility check for speech recognition
export const checkSpeechRecognitionSupport = () => {
  const support = {
    speechRecognition: !!(window.SpeechRecognition || window.webkitSpeechRecognition),
    mediaDevices: !!navigator.mediaDevices,
    getUserMedia: !!(navigator.mediaDevices && navigator.mediaDevices.getUserMedia),
    microphone: false
  };

  // Test microphone access
  if (support.mediaDevices) {
    navigator.mediaDevices.getUserMedia({ audio: true })
      .then(() => {
        support.microphone = true;
        console.log('✅ Microphone access granted');
      })
      .catch((error) => {
        console.error('❌ Microphone access denied:', error);
        support.microphone = false;
      });
  }

  return support;
};

// Get the best available speech recognition API
export const getSpeechRecognitionAPI = () => {
  return window.SpeechRecognition || window.webkitSpeechRecognition;
};

// Check if the current browser supports speech recognition
export const isSpeechRecognitionSupported = () => {
  const SpeechRecognition = getSpeechRecognitionAPI();
  return !!SpeechRecognition;
};

// Get supported languages for speech recognition
export const getSupportedLanguages = () => {
  return [
    { code: 'en-US', name: 'English (US)' },
    { code: 'hi-IN', name: 'Hindi (India)' },
    { code: 'or-IN', name: 'Odia (India)' },
    { code: 'bn-IN', name: 'Bengali (India)' },
    { code: 'ta-IN', name: 'Tamil (India)' },
    { code: 'te-IN', name: 'Telugu (India)' },
    { code: 'ml-IN', name: 'Malayalam (India)' },
    { code: 'kn-IN', name: 'Kannada (India)' },
    { code: 'gu-IN', name: 'Gujarati (India)' },
    { code: 'mr-IN', name: 'Marathi (India)' },
    { code: 'pa-IN', name: 'Punjabi (India)' },
    { code: 'ur-IN', name: 'Urdu (India)' }
  ];
};
