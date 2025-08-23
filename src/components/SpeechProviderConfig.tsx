
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Mic, MicOff, Settings, TestTube, AlertCircle, CheckCircle } from 'lucide-react';
import { SpeechRecognitionConfig } from '@/services/speechRecognitionService';
import { useToast } from '@/hooks/use-toast';

interface SpeechProviderConfigProps {
  currentConfig: SpeechRecognitionConfig;
  onConfigUpdate: (config: SpeechRecognitionConfig) => void;
}

const SpeechProviderConfig: React.FC<SpeechProviderConfigProps> = ({
  currentConfig,
  onConfigUpdate
}) => {
  const [isTesting, setIsTesting] = useState(false);
  const [testResults, setTestResults] = useState<string[]>([]);
  const [browserSupport, setBrowserSupport] = useState<{[key: string]: boolean}>({});
  const { toast } = useToast();

  const providers = [
    { value: 'browser', label: 'Browser Native', description: 'Built-in browser speech recognition (Recommended - No API key required)' },
    { value: 'enhanced-browser', label: 'Enhanced Browser', description: 'Improved browser recognition with fallbacks' },
    { value: 'anthropic', label: 'Anthropic Claude', description: 'Best AI model for medical understanding and multilingual support' },
    { value: 'aws-bedrock', label: 'AWS Bedrock', description: 'Enterprise-grade, HIPAA compliant, production ready' },
    { value: 'assemblyai', label: 'AssemblyAI', description: 'Advanced AI-powered recognition' },
    { value: 'google', label: 'Google Cloud', description: 'Google Cloud Speech-to-Text' },
    { value: 'azure', label: 'Azure Speech', description: 'Microsoft Azure Speech Services' },
    { value: 'reverie', label: 'Reverie', description: 'Indian language optimized' }
  ];

  const languages = [
    { value: 'en-US', label: 'English (US)' },
    { value: 'hi-IN', label: 'Hindi (India)' },
    { value: 'or-IN', label: 'Odia (India)' },
    { value: 'bn-IN', label: 'Bengali (India)' },
    { value: 'ta-IN', label: 'Tamil (India)' },
    { value: 'te-IN', label: 'Telugu (India)' },
    { value: 'ml-IN', label: 'Malayalam (India)' },
    { value: 'kn-IN', label: 'Kannada (India)' },
    { value: 'gu-IN', label: 'Gujarati (India)' },
    { value: 'mr-IN', label: 'Marathi (India)' },
    { value: 'pa-IN', label: 'Punjabi (India)' },
    { value: 'ur-IN', label: 'Urdu (India)' },
    { value: 'auto', label: 'Auto Detect', description: 'Automatically detect language' }
  ];

  useEffect(() => {
    checkBrowserSupport();
  }, []);

  const checkBrowserSupport = () => {
    const windowWithSpeech = window as any;
    const support = {
      'SpeechRecognition': !!windowWithSpeech.SpeechRecognition,
      'webkitSpeechRecognition': !!windowWithSpeech.webkitSpeechRecognition,
      'mozSpeechRecognition': !!windowWithSpeech.mozSpeechRecognition,
      'msSpeechRecognition': !!windowWithSpeech.msSpeechRecognition
    };
    setBrowserSupport(support);
  };

  const testSpeechRecognition = async () => {
    setIsTesting(true);
    setTestResults([]);
    
    const addResult = (message: string) => {
      setTestResults(prev => [...prev, `${new Date().toLocaleTimeString()}: ${message}`]);
    };

    try {
      addResult('Starting speech recognition test...');
      
      // Check browser support
      const windowWithSpeech = window as any;
      const SpeechRecognition = windowWithSpeech.SpeechRecognition || 
                               windowWithSpeech.webkitSpeechRecognition ||
                               windowWithSpeech.mozSpeechRecognition ||
                               windowWithSpeech.msSpeechRecognition;
      
      if (!SpeechRecognition) {
        addResult('❌ Speech recognition not supported in this browser');
        toast({
          title: "Browser Not Supported",
          description: "Please use Chrome, Edge, or Safari for speech recognition.",
          variant: "destructive"
        });
        return;
      }
      
      addResult('✅ Speech recognition API available');
      
      // Test microphone access
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        addResult('✅ Microphone access granted');
        stream.getTracks().forEach(track => track.stop());
      } catch (error) {
        addResult('❌ Microphone access denied');
        toast({
          title: "Microphone Access Required",
          description: "Please allow microphone access to use speech recognition.",
          variant: "destructive"
        });
        return;
      }
      
      // Test speech recognition initialization
      const recognition = new SpeechRecognition();
      recognition.continuous = false;
      recognition.interimResults = false;
      recognition.maxAlternatives = 1;
      recognition.lang = currentConfig.language;
      
      addResult(`✅ Speech recognition initialized with language: ${currentConfig.language}`);
      
      // Test speech recognition start
      recognition.start();
      addResult('✅ Speech recognition started - please speak something...');
      
      // Set up event handlers for testing
      recognition.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript;
        const confidence = event.results[0][0].confidence;
        addResult(`✅ Speech detected: "${transcript}" (confidence: ${Math.round(confidence * 100)}%)`);
        recognition.stop();
      };
      
      recognition.onerror = (event: any) => {
        addResult(`❌ Speech recognition error: ${event.error}`);
        toast({
          title: "Speech Recognition Error",
          description: `Error: ${event.error}`,
          variant: "destructive"
        });
      };
      
      recognition.onend = () => {
        addResult('✅ Speech recognition test completed');
        setIsTesting(false);
        toast({
          title: "Test Completed",
          description: "Speech recognition test finished. Check results above.",
        });
      };
      
      // Auto-stop after 10 seconds if no speech detected
      setTimeout(() => {
        if (isTesting) {
          recognition.stop();
          addResult('⏰ Test timeout - no speech detected');
          setIsTesting(false);
        }
      }, 10000);
      
    } catch (error) {
      addResult(`❌ Test failed: ${error}`);
      setIsTesting(false);
      toast({
        title: "Test Failed",
        description: `Speech recognition test failed: ${error}`,
        variant: "destructive"
      });
    }
  };

  return (
    <Card className="mb-6">
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <Settings className="h-5 w-5" />
          <span>Speech Recognition Configuration</span>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Provider Selection */}
        <div className="space-y-2">
          <Label htmlFor="provider">Speech Recognition Provider</Label>
          <Select
            value={currentConfig.provider}
            onValueChange={(value) => onConfigUpdate({ ...currentConfig, provider: value as any })}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select provider" />
            </SelectTrigger>
            <SelectContent>
              {providers.map((provider) => (
                <SelectItem key={provider.value} value={provider.value}>
                  <div className="flex flex-col">
                    <span className="font-medium">{provider.label}</span>
                    <span className="text-sm text-gray-500">{provider.description}</span>
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Language Selection */}
        <div className="space-y-2">
          <Label htmlFor="language">Language</Label>
          <Select
            value={currentConfig.language}
            onValueChange={(value) => onConfigUpdate({ ...currentConfig, language: value })}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select language" />
            </SelectTrigger>
            <SelectContent>
              {languages.map((language) => (
                <SelectItem key={language.value} value={language.value}>
                  <div className="flex flex-col">
                    <span className="font-medium">{language.label}</span>
                    {language.description && (
                      <span className="text-sm text-gray-500">{language.description}</span>
                    )}
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* API Key (for cloud providers) */}
        {(currentConfig.provider === 'assemblyai' || 
          currentConfig.provider === 'reverie' || 
          currentConfig.provider === 'google' || 
          currentConfig.provider === 'azure' ||
          currentConfig.provider === 'aws-bedrock' ||
          currentConfig.provider === 'anthropic') && (
          <div className="space-y-2">
            <Label htmlFor="apiKey">API Key</Label>
            <Input
              id="apiKey"
              type="password"
              placeholder="Enter API key"
              value={currentConfig.apiKey || ''}
              onChange={(e) => onConfigUpdate({ ...currentConfig, apiKey: e.target.value })}
            />
          </div>
        )}

        {/* Azure Region */}
        {currentConfig.provider === 'azure' && (
          <div className="space-y-2">
            <Label htmlFor="region">Azure Region</Label>
            <Input
              id="region"
              placeholder="e.g., eastus, westus2"
              value={currentConfig.region || ''}
              onChange={(e) => onConfigUpdate({ ...currentConfig, region: e.target.value })}
            />
          </div>
        )}

        {/* Browser Support Status */}
        <div className="space-y-2">
          <Label>Browser Support</Label>
          <div className="grid grid-cols-2 gap-2">
            {Object.entries(browserSupport).map(([api, supported]) => (
              <div key={api} className="flex items-center space-x-2">
                {supported ? (
                  <CheckCircle className="h-4 w-4 text-green-500" />
                ) : (
                  <AlertCircle className="h-4 w-4 text-red-500" />
                )}
                <span className="text-sm">{api}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Test Button */}
        <div className="flex items-center space-x-4">
          <Button
            onClick={testSpeechRecognition}
            disabled={isTesting}
            className="flex items-center space-x-2"
          >
            {isTesting ? (
              <>
                <TestTube className="h-4 w-4 animate-spin" />
                <span>Testing...</span>
              </>
            ) : (
              <>
                <TestTube className="h-4 w-4" />
                <span>Test Speech Recognition</span>
              </>
            )}
          </Button>
          
          {currentConfig.provider === 'browser' || currentConfig.provider === 'enhanced-browser' ? (
            <Badge variant="outline" className="bg-green-50 text-green-700">
              <CheckCircle className="h-3 w-3 mr-1" />
              No API Key Required
            </Badge>
          ) : (
            <Badge variant="outline" className="bg-yellow-50 text-yellow-700">
              <AlertCircle className="h-3 w-3 mr-1" />
              API Key Required
            </Badge>
          )}
        </div>

        {/* Warning for external APIs */}
        {currentConfig.provider !== 'browser' && currentConfig.provider !== 'enhanced-browser' && (
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
            <div className="flex items-center space-x-2 mb-2">
              <AlertCircle className="h-5 w-5 text-yellow-600" />
              <span className="font-medium text-yellow-800">External API Required</span>
            </div>
            <p className="text-sm text-yellow-700">
              This provider requires an API key and may have usage limits. For immediate testing, 
              switch to "Browser Native" which works without any external dependencies.
            </p>
          </div>
        )}

        {/* Test Results */}
        {testResults.length > 0 && (
          <div className="space-y-2">
            <Label>Test Results</Label>
            <div className="bg-gray-50 p-3 rounded-md max-h-40 overflow-y-auto">
              {testResults.map((result, index) => (
                <div key={index} className="text-sm font-mono">
                  {result}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Configuration Summary */}
        <div className="bg-blue-50 p-4 rounded-lg">
          <h4 className="font-medium text-blue-900 mb-2">Current Configuration</h4>
          <div className="space-y-1 text-sm text-blue-800">
            <div><strong>Provider:</strong> {providers.find(p => p.value === currentConfig.provider)?.label}</div>
            <div><strong>Language:</strong> {languages.find(l => l.value === currentConfig.language)?.label}</div>
            <div><strong>Continuous:</strong> {currentConfig.continuous ? 'Yes' : 'No'}</div>
            <div><strong>Interim Results:</strong> {currentConfig.interimResults ? 'Yes' : 'No'}</div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default SpeechProviderConfig;
