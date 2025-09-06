
import { Language, SpeechRecognitionWindow } from '@/types/consultation';
import { createSpeechRecognitionService } from '@/services/speechRecognitionService';

export const createSpeechRecognition = (selectedLanguage: string, languages: Language[]) => {
  // Get API keys from configuration
  const apiKeys = {
    assemblyAI: window.getConfig?.('ASSEMBLYAI_API_KEY') || '',
    google: window.getConfig?.('GOOGLE_CLOUD_API_KEY') || '',
    azure: window.getConfig?.('AZURE_SPEECH_KEY') || '',
    reverie: window.getConfig?.('REVERIE_API_KEY') || '',
    anthropic: window.getConfig?.('ANTHROPIC_API_KEY') || ''
  };

  // Get language code
  const selectedLangCode = languages.find(l => l.value === selectedLanguage)?.code || 'en-US';
  
  // Try to create modern speech recognition service first
  if (apiKeys.assemblyAI) {
    try {
      const modernService = createSpeechRecognitionService({
        language: selectedLangCode,
        continuous: true,
        interimResults: false,
        apiKey: apiKeys.assemblyAI,
        provider: 'assemblyai'
      });
      
      if (modernService.isSupported()) {
        console.log('🚀 Using modern speech recognition service');
        return createBrowserCompatibleWrapper(modernService);
      }
    } catch (error) {
      console.warn('Modern speech service not available:', error);
    }
  }

  // Fallback to browser speech recognition
  const windowWithSpeech = window as SpeechRecognitionWindow;
  const SpeechRecognition = windowWithSpeech.SpeechRecognition || windowWithSpeech.webkitSpeechRecognition;
  
  if (!SpeechRecognition) {
    console.error('No speech recognition support available');
    return null;
  }

  const recognition = new SpeechRecognition();
  recognition.continuous = true;
  recognition.interimResults = false;
  recognition.maxAlternatives = 1;
  recognition.lang = selectedLangCode;

  console.log('🌐 Using browser speech recognition fallback');
  return recognition;
};

// Create a browser-compatible wrapper for modern speech services
const createBrowserCompatibleWrapper = (modernService: any) => {
  const wrapper = {
    continuous: true,
    interimResults: false,
    lang: modernService.getCurrentLanguage(),
    onresult: null as any,
    onerror: null as any,
    onend: null as any,
    onstart: null as any,
    
    start: async () => {
      try {
        await modernService.start();
        if (wrapper.onstart) wrapper.onstart();
      } catch (error) {
        if (wrapper.onerror) wrapper.onerror({ error: 'start-error', message: error });
      }
    },
    
    stop: async () => {
      try {
        await modernService.stop();
        if (wrapper.onend) wrapper.onend();
      } catch (error) {
        console.error('Error stopping speech recognition:', error);
      }
    },
    
    abort: async () => {
      await wrapper.stop();
    }
  };

  // Set up callbacks
  modernService.onResult((result: any) => {
    if (wrapper.onresult) {
      const event = {
        results: [{
          isFinal: result.isFinal,
          0: {
            transcript: result.transcript,
            confidence: result.confidence
          }
        }],
        resultIndex: 0
      };
      Object.defineProperty(event.results, 'length', { value: 1 });
      Object.defineProperty(event, 'results', { 
        value: Object.assign([event.results[0]], { length: 1 })
      });
      wrapper.onresult(event);
    }
  });

  modernService.onError((error: string) => {
    if (wrapper.onerror) {
      wrapper.onerror({ error: 'network', message: error });
    }
  });

  modernService.onEnd(() => {
    if (wrapper.onend) wrapper.onend();
  });

  return wrapper;
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
