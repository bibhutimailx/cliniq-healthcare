
import React, { useEffect, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Globe, User, Stethoscope, Mic } from 'lucide-react';

interface TranscriptEntry {
  id: string;
  speaker: string; // Now supports multiple speakers (A, B, C, etc.)
  text: string;
  timestamp: string;
  language: string;
  confidence?: number;
  voiceSignature?: string;
}

interface LiveTranscriptProps {
  entries: TranscriptEntry[];
  detectedLanguage: string;
  isListening: boolean;
}

const LiveTranscript: React.FC<LiveTranscriptProps> = ({ 
  entries, 
  detectedLanguage, 
  isListening 
}) => {
  const transcriptRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom when new entries are added
  useEffect(() => {
    if (transcriptRef.current) {
      transcriptRef.current.scrollTop = transcriptRef.current.scrollHeight;
    }
  }, [entries]);
  const getLanguageLabel = (code: string) => {
    const languages = {
      'en': 'English',
      'hi': 'हिंदी (Hindi)',
      'or': 'ଓଡ଼ିଆ (Odia)',
      'bn': 'বাংলা (Bengali)',
      'ta': 'தமிழ் (Tamil)',
      'te': 'తెలుగు (Telugu)',
      'ml': 'മലയാളം (Malayalam)',
      'kn': 'ಕನ್ನಡ (Kannada)',
      'gu': 'ગુજરાતી (Gujarati)',
      'mr': 'मराठी (Marathi)',
      'pa': 'ਪੰਜਾਬੀ (Punjabi)',
      'ur': 'اردو (Urdu)'
    };
    return languages[code] || code;
  };

  const getSpeakerIcon = (speaker: string) => {
    if (speaker.toLowerCase().includes('dr.') || speaker.toLowerCase().includes('doctor')) {
      return Stethoscope;
    }
    return User;
  };

  const getSpeakerColor = (speaker: string) => {
    if (speaker.toLowerCase().includes('dr.') || speaker.toLowerCase().includes('doctor')) {
      return 'text-blue-600';
    } else if (speaker.toLowerCase().includes('guest')) {
      return 'text-purple-600';
    } else {
      return 'text-green-600';
    }
  };

  const getVoiceSignatureDisplay = (signature?: string) => {
    if (!signature) return null;
    
    const isTextBased = signature.startsWith('text_');
    const isFallback = signature.startsWith('fallback_');
    
    if (isFallback) {
      return { type: 'fallback', label: 'Auto-detected' };
    } else if (isTextBased) {
      return { type: 'text', label: 'Text Analysis' };
    } else {
      return { type: 'voice', label: 'Voice Pattern' };
    }
  };

  return (
    <Card className="h-full">
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span>Live Transcript with Speaker Detection</span>
          <div className="flex items-center space-x-2">
            <Badge variant="outline" className="flex items-center space-x-1">
              <Globe className="h-3 w-3" />
              <span>{getLanguageLabel(detectedLanguage)}</span>
            </Badge>
            {isListening && (
              <Badge className="bg-red-500 text-white animate-pulse">
                <div className="w-2 h-2 bg-white rounded-full mr-1"></div>
                SMART DETECTION
              </Badge>
            )}
          </div>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div ref={transcriptRef} className="space-y-3 max-h-96 overflow-y-auto">
          {entries.length === 0 ? (
            <div className="text-center text-gray-500 py-8">
              {isListening ? "Listening and analyzing voice patterns..." : "Start recording to see intelligent transcript"}
            </div>
          ) : (
            entries.map((entry) => {
              const IconComponent = getSpeakerIcon(entry.speaker);
              const voiceInfo = getVoiceSignatureDisplay(entry.voiceSignature);
              
              return (
                <div key={entry.id} className="flex space-x-3 p-3 bg-gray-50 rounded-lg">
                  <div className={`${getSpeakerColor(entry.speaker)} mt-1`}>
                    <IconComponent className="h-4 w-4" />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center space-x-2 mb-1 flex-wrap">
                      <span className={`font-medium text-sm ${getSpeakerColor(entry.speaker)}`}>
                        {entry.speaker}
                      </span>
                      <span className="text-xs text-gray-500">{entry.timestamp}</span>
                      {entry.confidence && (
                        <Badge variant="outline" className="text-xs">
                          {Math.round(entry.confidence * 100)}%
                        </Badge>
                      )}
                      {voiceInfo && (
                        <Badge 
                          variant="outline" 
                          className={`text-xs flex items-center space-x-1 ${
                            voiceInfo.type === 'voice' ? 'bg-green-50 text-green-700 border-green-200' :
                            voiceInfo.type === 'text' ? 'bg-blue-50 text-blue-700 border-blue-200' :
                            'bg-gray-50 text-gray-600 border-gray-200'
                          }`}
                        >
                          <Mic className="h-3 w-3" />
                          <span>{voiceInfo.label}</span>
                        </Badge>
                      )}
                    </div>
                    <p className="text-sm text-gray-700">{entry.text}</p>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default LiveTranscript;
