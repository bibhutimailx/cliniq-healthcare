
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Languages, Users } from 'lucide-react';
import { PatientProfile } from '@/types/consultation';

interface SessionInfoProps {
  patientName: string;
  detectedLanguage: string;
  totalSpeakers: number;
  detectedSpeakers: string[];
  speakerToggle: string;
  selectedPatientProfile: PatientProfile | null;
  getLanguageLabel: (code: string) => string;
  serviceProvider?: string;
  connectionStatus?: string;
}

const SessionInfo: React.FC<SessionInfoProps> = ({
  patientName,
  detectedLanguage,
  totalSpeakers,
  detectedSpeakers,
  speakerToggle,
  selectedPatientProfile,
  getLanguageLabel,
  serviceProvider = 'browser',
  connectionStatus = 'disconnected'
}) => {
  const getProviderLabel = (provider: string) => {
    const labels = {
      'google': 'Google Cloud Speech',
      'azure': 'Azure Cognitive Services',
      'browser': 'Browser Speech API'
    };
    return labels[provider] || provider;
  };

  const getStatusColor = (status: string) => {
    const colors = {
      'connected': 'bg-green-500',
      'connecting': 'bg-yellow-500',
      'disconnected': 'bg-gray-500',
      'error': 'bg-red-500'
    };
    return colors[status] || 'bg-gray-500';
  };

  return (
    <Card className="bg-gradient-to-r from-blue-500 via-purple-500 to-green-500 text-white">
      <CardContent className="p-4">
        <div className="flex justify-between items-center">
          <div>
            <h3 className="text-xl font-semibold">🧠 ClinIQ Session: {patientName}</h3>
            <p className="opacity-90">Speech Service: {getProviderLabel(serviceProvider)}</p>
            <p className="opacity-90">Language: {getLanguageLabel(detectedLanguage)}</p>
            <p className="opacity-90 text-sm">Speakers: {totalSpeakers} ({detectedSpeakers.join(', ')})</p>
            {selectedPatientProfile && (
              <p className="opacity-90 text-sm flex items-center">
                🔄 Voice Memory Active - {selectedPatientProfile.previousVisits.length} previous visits
              </p>
            )}
          </div>
          <div className="flex items-center space-x-3">
            <Badge variant="secondary" className="bg-white/20 text-white">
              <span>
                <div className={`w-2 h-2 rounded-full mr-2 ${getStatusColor(connectionStatus)} ${connectionStatus === 'connected' ? 'animate-pulse' : ''}`}></div>
                {serviceProvider.toUpperCase()}
              </span>
            </Badge>
            <Badge variant="secondary" className="bg-white/20 text-white">
              <span><Languages className="h-3 w-3 mr-1" />Multi-Language</span>
            </Badge>
            <Badge variant="secondary" className="bg-white/20 text-white">
              <span><Users className="h-3 w-3 mr-1" />Multi-Role Ready</span>
            </Badge>
            <Badge variant="secondary" className="bg-white/20 text-white">
              <span>Current: {speakerToggle}</span>
            </Badge>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default SessionInfo;
