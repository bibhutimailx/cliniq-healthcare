
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Mic, MicOff, Settings, AlertCircle, CheckCircle, Wifi, WifiOff } from 'lucide-react';

interface RecordingControlsProps {
  isRecording: boolean;
  onToggleRecording: () => void;
  speakerToggle: string;
  totalSpeakers: number;
  serviceProvider: string;
  connectionStatus: 'disconnected' | 'connecting' | 'connected' | 'error';
}

const RecordingControls: React.FC<RecordingControlsProps> = ({
  isRecording,
  onToggleRecording,
  speakerToggle,
  totalSpeakers,
  serviceProvider,
  connectionStatus
}) => {
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'connected':
        return 'bg-green-100 text-green-800';
      case 'connecting':
        return 'bg-yellow-100 text-yellow-800';
      case 'error':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'connected':
        return <CheckCircle className="h-4 w-4" />;
      case 'connecting':
        return <Wifi className="h-4 w-4 animate-pulse" />;
      case 'error':
        return <AlertCircle className="h-4 w-4" />;
      default:
        return <WifiOff className="h-4 w-4" />;
    }
  };

  const getProviderLabel = (provider: string) => {
    switch (provider) {
      case 'browser':
        return 'Browser Native';
      case 'enhanced-browser':
        return 'Enhanced Browser';
      case 'assemblyai':
        return 'AssemblyAI';
      case 'reverie':
        return 'Reverie AI';
      case 'google':
        return 'Google Cloud';
      case 'azure':
        return 'Azure Speech';
      default:
        return provider;
    }
  };

  return (
    <Card className="mb-6">
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            {isRecording ? (
              <Mic className="h-5 w-5 text-red-500 animate-pulse" />
            ) : (
              <MicOff className="h-5 w-5 text-gray-500" />
            )}
            <span>Recording Controls</span>
          </div>
          <div className="flex items-center space-x-2">
            <Badge className={getStatusColor(connectionStatus)}>
              <div className="flex items-center space-x-1">
                {getStatusIcon(connectionStatus)}
                <span className="capitalize">{connectionStatus}</span>
              </div>
            </Badge>
          </div>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Main Recording Button */}
        <div className="flex justify-center">
          <Button
            onClick={onToggleRecording}
            size="lg"
            className={`px-8 py-4 text-lg font-semibold transition-all duration-300 ${
              isRecording
                ? 'bg-red-500 hover:bg-red-600 text-white animate-pulse'
                : 'bg-green-500 hover:bg-green-600 text-white'
            }`}
          >
            <div className="flex items-center space-x-2">
              {isRecording ? (
                <>
                  <MicOff className="h-6 w-6" />
                  <span>Stop Recording</span>
                </>
              ) : (
                <>
                  <Mic className="h-6 w-6" />
                  <span>Live Transcription</span>
                </>
              )}
            </div>
          </Button>
        </div>

        {/* Status Information */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="text-center p-3 bg-gray-50 rounded-lg">
            <div className="text-2xl font-bold text-gray-900">
              {isRecording ? '🔴' : '⚪'}
            </div>
            <div className="text-sm text-gray-600">
              {isRecording ? 'Recording Active' : 'Inactive'}
            </div>
          </div>

          <div className="text-center p-3 bg-gray-50 rounded-lg">
            <div className="text-2xl font-bold text-blue-600">
              {totalSpeakers}
            </div>
            <div className="text-sm text-gray-600">
              Speakers Detected
            </div>
          </div>

          <div className="text-center p-3 bg-gray-50 rounded-lg">
            <div className="text-sm font-medium text-gray-900 capitalize">
              {speakerToggle}
            </div>
            <div className="text-sm text-gray-600">
              Current Speaker
            </div>
          </div>
        </div>

        {/* Service Provider Info */}
        <div className="bg-blue-50 p-4 rounded-lg">
          <div className="flex items-center justify-between">
            <div>
              <h4 className="font-medium text-blue-900">Speech Recognition Service</h4>
              <p className="text-sm text-blue-700">{getProviderLabel(serviceProvider)}</p>
            </div>
            <div className="flex items-center space-x-2">
              {serviceProvider === 'browser' || serviceProvider === 'enhanced-browser' ? (
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
          </div>
        </div>

        {/* Recording Tips */}
        {isRecording && (
          <div className="bg-green-50 p-4 rounded-lg">
            <h4 className="font-medium text-green-900 mb-2">Recording Tips</h4>
            <ul className="text-sm text-green-700 space-y-1">
              <li>• Speak clearly and at a normal pace</li>
              <li>• Minimize background noise</li>
              <li>• Keep your microphone close to your mouth</li>
              <li>• The system will automatically detect language changes</li>
            </ul>
          </div>
        )}

        {/* Error State */}
        {connectionStatus === 'error' && (
          <div className="bg-red-50 p-4 rounded-lg">
            <div className="flex items-start space-x-2">
              <AlertCircle className="h-5 w-5 text-red-600 mt-0.5" />
              <div>
                <h4 className="font-medium text-red-900">Connection Error</h4>
                <p className="text-sm text-red-700 mt-1">
                  Speech recognition service is not available. Please check your microphone permissions and try again.
                </p>
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default RecordingControls;
