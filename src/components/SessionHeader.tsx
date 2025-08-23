
import React from 'react';
import { Button } from '@/components/ui/button';
import { Bot, Save } from 'lucide-react';

interface SessionHeaderProps {
  onGenerateAnalysis: () => void;
  onSaveSession: () => void;
  sessionActive: boolean;
  isAnalyzing: boolean;
}

const SessionHeader: React.FC<SessionHeaderProps> = ({
  onGenerateAnalysis,
  onSaveSession,
  sessionActive,
  isAnalyzing
}) => {
  return (
    <div className="flex justify-between items-center">
      <div>
        <h2 className="text-3xl font-bold text-gray-900">AI-Powered Live Consultation</h2>
        <p className="text-gray-600 mt-1">Real-time speech recognition with medical entity extraction</p>
      </div>
      <div className="flex space-x-3">
        <Button 
          onClick={onGenerateAnalysis}
          disabled={!sessionActive || isAnalyzing}
          className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700"
        >
          <Bot className="h-4 w-4 mr-2" />
          {isAnalyzing ? 'Analyzing...' : 'Generate AI Insights'}
        </Button>
        <Button 
          onClick={onSaveSession}
          disabled={!sessionActive}
          className="bg-gradient-to-r from-green-600 to-blue-600 hover:from-green-700 hover:to-blue-700"
        >
          <Save className="h-4 w-4 mr-2" />
          Save Session
        </Button>
      </div>
    </div>
  );
};

export default SessionHeader;
