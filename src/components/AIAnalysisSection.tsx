
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Bot } from 'lucide-react';

interface AIAnalysisSectionProps {
  aiAnalysis: string;
  isAnalyzing: boolean;
}

const AIAnalysisSection: React.FC<AIAnalysisSectionProps> = ({
  aiAnalysis,
  isAnalyzing
}) => {
  if (!aiAnalysis && !isAnalyzing) {
    return null;
  }

  return (
    <Card className="border-2 border-purple-200 bg-gradient-to-br from-purple-50 to-blue-50">
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <Bot className="h-5 w-5 text-purple-600" />
          <span>🧠 ClinIQ Intelligence Report</span>
          {isAnalyzing && (
            <Badge className="bg-purple-100 text-purple-700 animate-pulse">
              Processing...
            </Badge>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent>
        {isAnalyzing ? (
          <div className="flex items-center justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600"></div>
            <span className="ml-3 text-purple-600">Generating comprehensive AI analysis with advanced features...</span>
          </div>
        ) : (
          <div className="prose prose-sm max-w-none">
            <pre className="whitespace-pre-wrap text-sm text-gray-700 bg-white p-4 rounded-lg border">
              {aiAnalysis}
            </pre>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default AIAnalysisSection;
