import { Language, SpeechRecognitionWindow } from '@/types/consultation';

// Simple speech recognition configuration for immediate use
export const createSimpleSpeechRecognition = (selectedLanguage: string, languages: Language[]) => {
  const windowWithSpeech = window as SpeechRecognitionWindow;
  const SpeechRecognition = windowWithSpeech.SpeechRecognition || windowWithSpeech.webkitSpeechRecognition;
  
  if (!SpeechRecognition) {
    console.error('Browser speech recognition not supported');
    return null;
  }

  const recognition = new SpeechRecognition();
  
  // Get language code
  const selectedLangCode = languages.find(l => l.value === selectedLanguage)?.code || 'en-US';
  
  // Configure for optimal performance
  recognition.continuous = true;
  recognition.interimResults = false; // Get only final results
  recognition.maxAlternatives = 1;
  recognition.lang = selectedLangCode;
  
  // Add error handling
  recognition.onerror = (event: any) => {
    console.error('Speech recognition error:', event.error);
    
    if (event.error === 'not-allowed') {
      console.error('Microphone access denied');
    } else if (event.error === 'network') {
      console.error('Network error - check internet connection');
    } else if (event.error === 'no-speech') {
      console.warn('No speech detected');
    } else if (event.error === 'audio-capture') {
      console.error('Audio capture failed - check microphone');
    }
  };

  recognition.onstart = () => {
    console.log('🎤 Speech recognition started');
  };

  recognition.onend = () => {
    console.log('🎤 Speech recognition ended');
  };

  console.log(`🌐 Browser speech recognition initialized for ${selectedLangCode}`);
  return recognition;
};

// Test microphone access
export const testMicrophoneAccess = async (): Promise<boolean> => {
  try {
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    stream.getTracks().forEach(track => track.stop()); // Clean up
    console.log('✅ Microphone access granted');
    return true;
  } catch (error) {
    console.error('❌ Microphone access denied:', error);
    return false;
  }
};

// Check browser support
export const checkBrowserSupport = () => {
  const windowWithSpeech = window as SpeechRecognitionWindow;
  const support = {
    speechRecognition: !!(windowWithSpeech.SpeechRecognition || windowWithSpeech.webkitSpeechRecognition),
    mediaDevices: !!navigator.mediaDevices,
    getUserMedia: !!navigator.mediaDevices?.getUserMedia
  };
  
  console.log('Browser support check:', support);
  return support;
};
