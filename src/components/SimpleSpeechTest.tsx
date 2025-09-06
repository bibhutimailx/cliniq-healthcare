import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Mic, MicOff, AlertCircle, CheckCircle } from 'lucide-react';

interface BrowserSpeechRecognition {
  continuous: boolean;
  interimResults: boolean;
  lang: string;
  start(): void;
  stop(): void;
  onstart: (() => void) | null;
  onend: (() => void) | null;
  onresult: ((event: any) => void) | null;
  onerror: ((event: any) => void) | null;
}

interface SpeechRecognitionWindow extends Window {
  SpeechRecognition?: new () => BrowserSpeechRecognition;
  webkitSpeechRecognition?: new () => BrowserSpeechRecognition;
}

const SimpleSpeechTest: React.FC = () => {
  const [isSupported, setIsSupported] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [error, setError] = useState('');
  const [recognition, setRecognition] = useState<BrowserSpeechRecognition | null>(null);
  const [micPermission, setMicPermission] = useState<'unknown' | 'granted' | 'denied'>('unknown');

  // Check browser support on mount
  useEffect(() => {
    const windowWithSpeech = window as SpeechRecognitionWindow;
    const SpeechRecognition = windowWithSpeech.SpeechRecognition || windowWithSpeech.webkitSpeechRecognition;
    
    if (SpeechRecognition) {
      setIsSupported(true);
      console.log('✅ Speech Recognition API found');
      
      // Create recognition instance
      const recognitionInstance = new SpeechRecognition();
      recognitionInstance.continuous = false;
      recognitionInstance.interimResults = false;
      recognitionInstance.lang = 'en-US';
      
      // Set up event handlers
      recognitionInstance.onstart = () => {
        console.log('🎤 Speech recognition started');
        setIsRecording(true);
        setError('');
      };

      recognitionInstance.onend = () => {
        console.log('🎤 Speech recognition ended');
        setIsRecording(false);
      };

      recognitionInstance.onresult = (event) => {
        console.log('📝 Speech recognition result:', event);
        const result = event.results[0][0];
        setTranscript(result.transcript);
        console.log('Transcript:', result.transcript);
      };

      recognitionInstance.onerror = (event) => {
        console.error('❌ Speech recognition error:', event.error);
        setIsRecording(false);
        
        const errorMessages: Record<string, string> = {
          'not-allowed': 'Microphone access denied. Please allow microphone access and try again.',
          'service-not-allowed': 'Speech recognition blocked. This might be due to browser security settings. Try using Chrome or enabling secure context.',
          'audio-capture': 'No microphone found. Please check your microphone connection.',
          'network': 'Network error. Please check your internet connection.',
          'no-speech': 'No speech detected. Please speak more clearly.',
          'aborted': 'Speech recognition was aborted.',
          'language-not-supported': 'Language not supported. Using English (US).'
        };
        
        const errorMsg = errorMessages[event.error] || `Unknown error: ${event.error}`;
        setError(errorMsg);
      };

      setRecognition(recognitionInstance);
    } else {
      setIsSupported(false);
      setError('Speech Recognition not supported in this browser. Please use Chrome, Edge, or Safari.');
      console.log('❌ Speech Recognition API not found');
    }
  }, []);

  // Test microphone permission
  const testMicrophone = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      setMicPermission('granted');
      setError('');
      console.log('✅ Microphone access granted');
      // Stop tracks immediately
      stream.getTracks().forEach(track => track.stop());
    } catch (err) {
      setMicPermission('denied');
      setError('Microphone access denied. Please allow microphone access in your browser settings.');
      console.error('❌ Microphone access denied:', err);
    }
  };

  // Start speech recognition
  const startRecording = async () => {
    if (!recognition || !isSupported) {
      setError('Speech recognition not available');
      return;
    }

    try {
      // Test microphone first if we haven't already
      if (micPermission === 'unknown') {
        await testMicrophone();
      }
      
      if (micPermission === 'denied') {
        setError('Microphone access required. Please grant permission and try again.');
        return;
      }

      // Clear previous results
      setTranscript('');
      setError('');
      
      // Start recognition with delay to ensure microphone is ready
      setTimeout(() => {
        try {
          recognition.start();
          console.log('🎤 Starting speech recognition...');
        } catch (startErr) {
          console.error('❌ Failed to start recognition:', startErr);
          setError('Failed to start speech recognition. Try refreshing the page.');
        }
      }, 100);
      
    } catch (err) {
      console.error('❌ Error starting recording:', err);
      setError('Failed to start recording. Please try again.');
    }
  };

  // Stop speech recognition
  const stopRecording = () => {
    if (recognition && isRecording) {
      recognition.stop();
      console.log('🛑 Stopping speech recognition...');
    }
  };

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Mic className="h-5 w-5" />
          Simple Speech Recognition Test
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Browser Support Status */}
        <div className="flex items-center gap-2">
          {isSupported ? (
            <Badge className="bg-green-100 text-green-800">
              <CheckCircle className="h-4 w-4 mr-1" />
              Browser Supported
            </Badge>
          ) : (
            <Badge className="bg-red-100 text-red-800">
              <AlertCircle className="h-4 w-4 mr-1" />
              Not Supported
            </Badge>
          )}
        </div>

        {/* Microphone Permission Status */}
        <div className="flex items-center gap-2">
          <Badge className={
            micPermission === 'granted' ? 'bg-green-100 text-green-800' :
            micPermission === 'denied' ? 'bg-red-100 text-red-800' :
            'bg-gray-100 text-gray-800'
          }>
            {micPermission === 'granted' && <CheckCircle className="h-4 w-4 mr-1" />}
            {micPermission === 'denied' && <AlertCircle className="h-4 w-4 mr-1" />}
            Microphone: {micPermission}
          </Badge>
        </div>

        {/* Controls */}
        <div className="flex gap-2">
          <Button 
            onClick={testMicrophone}
            variant="outline"
            disabled={micPermission === 'granted'}
          >
            Test Microphone
          </Button>
          
          <Button 
            onClick={isRecording ? stopRecording : startRecording}
            disabled={!isSupported}
            className={isRecording ? 'bg-red-500 hover:bg-red-600' : ''}
          >
            {isRecording ? (
              <>
                <MicOff className="h-4 w-4 mr-2" />
                Stop Recording
              </>
            ) : (
              <>
                <Mic className="h-4 w-4 mr-2" />
                Start Recording
              </>
            )}
          </Button>
        </div>

        {/* Error Display */}
        {error && (
          <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-red-800">
            <AlertCircle className="h-4 w-4 inline mr-2" />
            {error}
          </div>
        )}

        {/* Recording Status */}
        {isRecording && (
          <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg text-blue-800">
            <div className="flex items-center gap-2">
              <div className="animate-pulse w-2 h-2 bg-red-500 rounded-full"></div>
              Recording... Speak now!
            </div>
          </div>
        )}

        {/* Transcript Display */}
        {transcript && (
          <div className="p-3 bg-green-50 border border-green-200 rounded-lg">
            <div className="font-semibold text-green-800 mb-1">Transcript:</div>
            <div className="text-green-700">{transcript}</div>
          </div>
        )}

        {/* Instructions */}
        <div className="text-sm text-gray-600">
          <p><strong>Instructions:</strong></p>
          <ol className="list-decimal list-inside space-y-1 mt-2">
            <li>First, test your microphone permission</li>
            <li>Click "Start Recording" and allow microphone access if prompted</li>
            <li>Speak clearly into your microphone</li>
            <li>The transcript should appear below</li>
          </ol>
        </div>

        {/* Browser Info */}
        <div className="text-xs text-gray-500 p-2 bg-gray-50 rounded">
          <div>Browser: {navigator.userAgent.includes('Chrome') ? 'Chrome' : 
                        navigator.userAgent.includes('Safari') ? 'Safari' : 
                        navigator.userAgent.includes('Edge') ? 'Edge' : 'Other'}</div>
          <div>Protocol: {window.location.protocol}</div>
          <div>Host: {window.location.host}</div>
        </div>
      </CardContent>
    </Card>
  );
};

export default SimpleSpeechTest;
