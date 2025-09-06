import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Mic, Key, Globe, Zap, DollarSign, Shield } from 'lucide-react';
import { WHISPER_LANGUAGE_CODES } from '@/services/speech/OpenAIWhisperService';

interface WhisperConfigProps {
  apiKey: string;
  language: string;
  onApiKeyChange: (apiKey: string) => void;
  onLanguageChange: (language: string) => void;
  onTest?: () => void;
  isConnected?: boolean;
  isRecording?: boolean;
}

const WhisperConfig: React.FC<WhisperConfigProps> = ({
  apiKey,
  language,
  onApiKeyChange,
  onLanguageChange,
  onTest,
  isConnected = false,
  isRecording = false
}) => {
  const [showApiKey, setShowApiKey] = useState(false);
  const [tempApiKey, setTempApiKey] = useState(apiKey);

  useEffect(() => {
    setTempApiKey(apiKey);
  }, [apiKey]);

  const handleApiKeySubmit = () => {
    onApiKeyChange(tempApiKey);
  };

  const maskApiKey = (key: string) => {
    if (!key) return '';
    if (key.length <= 8) return key;
    return `${key.slice(0, 4)}...${key.slice(-4)}`;
  };

  const getConnectionStatus = () => {
    if (isRecording) {
      return <Badge className="bg-red-100 text-red-800">🔴 Recording</Badge>;
    }
    if (isConnected) {
      return <Badge className="bg-green-100 text-green-800">✅ Connected</Badge>;
    }
    return <Badge className="bg-gray-100 text-gray-800">⚪ Disconnected</Badge>;
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Mic className="h-5 w-5" />
          OpenAI Whisper Configuration
          {getConnectionStatus()}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        
        {/* API Key Configuration */}
        <div className="space-y-3">
          <Label htmlFor="whisper-api-key" className="flex items-center gap-2">
            <Key className="h-4 w-4" />
            OpenAI API Key
          </Label>
          
          <div className="flex gap-2">
            <Input
              id="whisper-api-key"
              type={showApiKey ? "text" : "password"}
              placeholder="sk-..."
              value={tempApiKey}
              onChange={(e) => setTempApiKey(e.target.value)}
              className="flex-1"
            />
            <Button
              variant="outline"
              onClick={() => setShowApiKey(!showApiKey)}
              size="sm"
            >
              {showApiKey ? 'Hide' : 'Show'}
            </Button>
            <Button onClick={handleApiKeySubmit} size="sm">
              Update
            </Button>
          </div>
          
          {apiKey && (
            <div className="text-sm text-green-600">
              ✅ API Key configured: {maskApiKey(apiKey)}
            </div>
          )}
        </div>

        <Separator />

        {/* Language Selection */}
        <div className="space-y-3">
          <Label className="flex items-center gap-2">
            <Globe className="h-4 w-4" />
            Language Detection
          </Label>
          
          <Select value={language} onValueChange={onLanguageChange}>
            <SelectTrigger>
              <SelectValue placeholder="Select language" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="auto">🌐 Auto-detect (Recommended)</SelectItem>
              <SelectItem value="en">🇺🇸 English</SelectItem>
              <SelectItem value="hi">🇮🇳 Hindi</SelectItem>
              <SelectItem value="bn">🇧🇩 Bengali</SelectItem>
              <SelectItem value="ta">🇮🇳 Tamil</SelectItem>
              <SelectItem value="te">🇮🇳 Telugu</SelectItem>
              <SelectItem value="mr">🇮🇳 Marathi</SelectItem>
              <SelectItem value="gu">🇮🇳 Gujarati</SelectItem>
              <SelectItem value="kn">🇮🇳 Kannada</SelectItem>
              <SelectItem value="ml">🇮🇳 Malayalam</SelectItem>
              <SelectItem value="pa">🇮🇳 Punjabi</SelectItem>
              <SelectItem value="or">🇮🇳 Odia</SelectItem>
              <SelectItem value="as">🇮🇳 Assamese</SelectItem>
              <SelectItem value="ur">🇵🇰 Urdu</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <Separator />

        {/* Features & Pricing */}
        <div className="grid md:grid-cols-2 gap-4">
          <div className="space-y-3">
            <h4 className="font-medium flex items-center gap-2">
              <Zap className="h-4 w-4" />
              Features
            </h4>
            <ul className="text-sm space-y-1">
              <li>✅ 99+ languages supported</li>
              <li>✅ High accuracy (90-95%)</li>
              <li>✅ Medical terminology optimized</li>
              <li>✅ Real-time chunked processing</li>
              <li>✅ Auto language detection</li>
              <li>✅ Speaker identification</li>
            </ul>
          </div>
          
          <div className="space-y-3">
            <h4 className="font-medium flex items-center gap-2">
              <DollarSign className="h-4 w-4" />
              Pricing
            </h4>
            <div className="text-sm space-y-1">
              <div className="flex justify-between">
                <span>Cost per minute:</span>
                <span className="font-medium">$0.006</span>
              </div>
              <div className="flex justify-between">
                <span>10 min session:</span>
                <span className="font-medium">$0.06</span>
              </div>
              <div className="flex justify-between">
                <span>1 hour session:</span>
                <span className="font-medium">$0.36</span>
              </div>
              <div className="text-xs text-gray-500 mt-2">
                Very cost-effective for medical consultations
              </div>
            </div>
          </div>
        </div>

        <Separator />

        {/* Security & Compliance */}
        <div className="space-y-3">
          <h4 className="font-medium flex items-center gap-2">
            <Shield className="h-4 w-4" />
            Security & Compliance
          </h4>
          <div className="text-sm space-y-1">
            <div>🔒 Enterprise-grade security</div>
            <div>🏥 Suitable for healthcare applications</div>
            <div>📋 SOC 2 Type 2 certified</div>
            <div>🌍 GDPR compliant</div>
            <div className="text-xs text-gray-500 mt-2">
              Note: Audio is processed by OpenAI servers. Ensure compliance with local regulations.
            </div>
          </div>
        </div>

        {/* Test Button */}
        {onTest && (
          <>
            <Separator />
            <div className="flex justify-center">
              <Button
                onClick={onTest}
                disabled={!apiKey || isRecording}
                className="w-full md:w-auto"
              >
                {isRecording ? (
                  <>
                    <div className="animate-pulse w-2 h-2 bg-red-500 rounded-full mr-2"></div>
                    Recording...
                  </>
                ) : (
                  <>
                    <Mic className="h-4 w-4 mr-2" />
                    Test Whisper Recognition
                  </>
                )}
              </Button>
            </div>
          </>
        )}

        {/* Setup Instructions */}
        {!apiKey && (
          <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <h4 className="font-medium text-blue-900 mb-2">🚀 Quick Setup</h4>
            <ol className="text-sm text-blue-800 space-y-1 list-decimal list-inside">
              <li>Go to <a href="https://platform.openai.com/api-keys" target="_blank" rel="noopener noreferrer" className="underline">platform.openai.com/api-keys</a></li>
              <li>Create a new API key</li>
              <li>Copy and paste it above</li>
              <li>Select your preferred language</li>
              <li>Start recording!</li>
            </ol>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default WhisperConfig;
