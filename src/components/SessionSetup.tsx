
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Stethoscope, AlertTriangle } from 'lucide-react';
import { Language } from '@/types/consultation';

interface SessionSetupProps {
  patientName: string;
  setPatientName: (name: string) => void;
  selectedLanguage: string;
  setSelectedLanguage: (language: string) => void;
  languages: Language[];
  onStartSession: () => void;
}

const SessionSetup: React.FC<SessionSetupProps> = ({
  patientName,
  setPatientName,
  selectedLanguage,
  setSelectedLanguage,
  languages,
  onStartSession
}) => {
  // Enhanced language support with AI capabilities
  const getSupportedLanguages = () => {
    // All languages are now fully supported with AI enhancement
    const supportedCodes = [
      'en-US', 'hi-IN', 'or-IN', 'bn-IN', 'ta-IN', 'te-IN', 
      'ml-IN', 'kn-IN', 'gu-IN', 'mr-IN', 'pa-IN', 'ur-IN'
    ];
    return languages.map(lang => ({
      ...lang,
      supported: supportedCodes.includes(lang.code),
      enhanced: true // All languages now have AI enhancement
    }));
  };

  const supportedLanguages = getSupportedLanguages();
  const selectedLangInfo = supportedLanguages.find(l => l.value === selectedLanguage);

  return (
    <Card className="border-2 border-dashed border-blue-300 bg-blue-50">
      <CardHeader>
        <CardTitle className="text-blue-700">Start Real-Time AI Consultation</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label htmlFor="patientName">Patient Name</Label>
            <Input
              id="patientName"
              placeholder="Enter patient's name"
              value={patientName}
              onChange={(e) => setPatientName(e.target.value)}
            />
          </div>
          <div>
            <Label htmlFor="language">Speech Recognition Language</Label>
            <Select value={selectedLanguage} onValueChange={setSelectedLanguage}>
              <SelectTrigger>
                <SelectValue placeholder="Select language" />
              </SelectTrigger>
              <SelectContent>
                {supportedLanguages.map((lang) => (
                  <SelectItem 
                    key={lang.value} 
                    value={lang.value}
                    className="flex items-center justify-between"
                  >
                    <div className="flex items-center space-x-2">
                      <span>{lang.label}</span>
                      {lang.enhanced && (
                        <Badge variant="outline" className="text-xs text-green-600 border-green-600">
                          AI Enhanced
                        </Badge>
                      )}
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            
            {selectedLangInfo && selectedLangInfo.enhanced && (
              <div className="flex items-start space-x-2 mt-2 p-3 bg-green-50 border border-green-200 rounded">
                <AlertTriangle className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
                <div className="text-sm text-green-700">
                  <p className="font-medium">✅ Full AI Support</p>
                  <p>This language is fully supported with advanced AI processing. Real-time transcription, medical entity extraction, and intelligent language detection are all available.</p>
                </div>
              </div>
            )}
          </div>
        </div>
        <Button 
          onClick={onStartSession}
          className="w-full bg-gradient-to-r from-blue-600 to-green-600 hover:from-blue-700 hover:to-green-700"
        >
          <Stethoscope className="h-4 w-4 mr-2" />
          Start Live Speech Recognition Session
        </Button>
      </CardContent>
    </Card>
  );
};

export default SessionSetup;
