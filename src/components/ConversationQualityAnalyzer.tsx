
import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { TrendingUp, Heart, MessageCircle, AlertCircle, Brain, Smile, Frown, Meh } from 'lucide-react';
import { TranscriptEntry, ClarityAnalysis, EmpathyAnalysis } from '@/types/consultation';

interface ConversationQualityAnalyzerProps {
  transcriptEntries: TranscriptEntry[];
  isActive: boolean;
}

const ConversationQualityAnalyzer: React.FC<ConversationQualityAnalyzerProps> = ({
  transcriptEntries,
  isActive
}) => {
  const [clarityAnalysis, setClarityAnalysis] = useState<ClarityAnalysis>({
    score: 0,
    issues: [],
    suggestions: [],
    completeness: 0,
    followUpQuestions: 0,
    medicalJargonUsed: false,
    patientUnderstanding: 'high'
  });
  const [empathyAnalysis, setEmpathyAnalysis] = useState<EmpathyAnalysis>({
    overallScore: 0,
    empathyMoments: [],
    recommendations: []
  });

  // Enhanced AI analysis with mood tracking and empathy scoring
  useEffect(() => {
    if (transcriptEntries.length === 0) return;

    const doctorEntries = transcriptEntries.filter(e => e.speaker === 'doctor');
    const patientEntries = transcriptEntries.filter(e => e.speaker === 'patient');
    
    // Enhanced Clarity Analysis
    let clarityScore = 85;
    const issues: string[] = [];
    const suggestions: string[] = [];
    
    // Check for medical jargon
    const jargonTerms = ['hypertension', 'cardiovascular', 'diagnosis', 'medication', 'prescription'];
    const hasJargon = doctorEntries.some(entry => 
      jargonTerms.some(term => entry.text.toLowerCase().includes(term))
    );
    
    if (hasJargon) {
      clarityScore -= 10;
      issues.push('Medical jargon used without explanation');
      suggestions.push('Consider explaining medical terms in simpler language');
    }
    
    // Check for follow-up questions
    const followUpQuestions = patientEntries.filter(entry =>
      /\b(what|how|why|when|could you|can you|explain|understand)\b/i.test(entry.text)
    ).length;
    
    if (followUpQuestions === 0) {
      clarityScore -= 5;
      issues.push('Patient may not have fully understood - no follow-up questions');
      suggestions.push('Encourage patient to ask questions');
    }
    
    // Check conversation balance
    const doctorWords = doctorEntries.reduce((acc, entry) => acc + entry.text.split(' ').length, 0);
    const patientWords = patientEntries.reduce((acc, entry) => acc + entry.text.split(' ').length, 0);
    const ratio = doctorWords / (patientWords || 1);
    
    if (ratio > 3) {
      clarityScore -= 8;
      issues.push('Doctor dominated conversation - limited patient input');
      suggestions.push('Allow more time for patient to express concerns');
    }
    
    // Determine patient understanding level
    let patientUnderstanding: 'high' | 'medium' | 'low' = 'high';
    if (followUpQuestions === 0 && ratio > 2) patientUnderstanding = 'low';
    else if (followUpQuestions < 2 || ratio > 1.5) patientUnderstanding = 'medium';
    
    const completeness = Math.min(100, (transcriptEntries.length / 10) * 100);
    
    setClarityAnalysis({
      score: Math.max(0, clarityScore),
      issues,
      suggestions,
      completeness,
      followUpQuestions,
      medicalJargonUsed: hasJargon,
      patientUnderstanding
    });

    // Enhanced Empathy Analysis with Mood Detection
    const empathyMoments: EmpathyAnalysis['empathyMoments'] = [];
    let totalEmpathyScore = 75;
    
    doctorEntries.forEach((entry, index) => {
      let empathyLevel = 5; // neutral
      let emotional_state = 'neutral';
      
      // Positive empathy indicators
      if (/\b(understand|sorry|I see|that must be|feeling|difficult|concern)\b/i.test(entry.text)) {
        empathyLevel = 8;
        emotional_state = 'empathetic';
        totalEmpathyScore += 5;
      }
      
      // Rushed or dismissive language
      if (/\b(quickly|next|hurry|fast|simple|just|only)\b/i.test(entry.text)) {
        empathyLevel = 3;
        emotional_state = 'rushed';
        totalEmpathyScore -= 3;
      }
      
      // Reassuring language
      if (/\b(normal|common|okay|fine|better|improve|help)\b/i.test(entry.text)) {
        empathyLevel = 7;
        emotional_state = 'reassuring';
        totalEmpathyScore += 2;
      }
      
      empathyMoments.push({
        timestamp: entry.timestamp,
        speaker: entry.speaker,
        text: entry.text.slice(0, 50) + '...',
        empathyLevel,
        emotional_state
      });
    });
    
    // Generate recommendations
    const recommendations: string[] = [];
    if (totalEmpathyScore < 70) {
      recommendations.push('Consider using more acknowledgment phrases like "I understand" or "That must be concerning"');
    }
    if (empathyMoments.filter(m => m.emotional_state === 'rushed').length > 2) {
      recommendations.push('Try to slow down and give patient more time to process information');
    }
    if (empathyMoments.filter(m => m.emotional_state === 'empathetic').length === 0) {
      recommendations.push('Show more active listening with phrases that validate patient concerns');
    }
    
    setEmpathyAnalysis({
      overallScore: Math.max(0, Math.min(100, totalEmpathyScore)),
      empathyMoments: empathyMoments.slice(-5), // Keep last 5 moments
      recommendations
    });
  }, [transcriptEntries]);

  const getMoodIcon = (emotional_state: string) => {
    switch (emotional_state) {
      case 'empathetic': return <Smile className="h-3 w-3 text-green-500" />;
      case 'rushed': return <Frown className="h-3 w-3 text-red-500" />;
      case 'reassuring': return <Heart className="h-3 w-3 text-blue-500" />;
      default: return <Meh className="h-3 w-3 text-gray-500" />;
    }
  };

  if (!isActive || transcriptEntries.length === 0) {
    return (
      <Card className="border-purple-200 bg-purple-50">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Brain className="h-5 w-5 text-purple-600" />
            <span>AI Conversation Intelligence</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-gray-500 text-sm">Start recording to analyze conversation quality and emotional intelligence...</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-purple-200 bg-purple-50">
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <Brain className="h-5 w-5 text-purple-600" />
          <span>AI Conversation Intelligence</span>
          <Badge className="bg-purple-100 text-purple-700 animate-pulse">
            Live Analysis
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <Tabs defaultValue="quality" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="quality">Communication Quality</TabsTrigger>
            <TabsTrigger value="empathy">Empathy & Mood</TabsTrigger>
          </TabsList>
          
          <TabsContent value="quality" className="space-y-4">
            {/* Clarity Score */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <MessageCircle className="h-4 w-4 text-blue-500" />
                  <span className="text-sm font-medium">Communication Clarity</span>
                </div>
                <div className="flex items-center space-x-2">
                  <span className="text-sm font-bold">{clarityAnalysis.score}%</span>
                  <Badge variant={clarityAnalysis.patientUnderstanding === 'high' ? 'default' : 'destructive'}>
                    {clarityAnalysis.patientUnderstanding} understanding
                  </Badge>
                </div>
              </div>
              <Progress value={clarityAnalysis.score} className="h-2" />
            </div>

            {/* Conversation Depth */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <TrendingUp className="h-4 w-4 text-green-500" />
                  <span className="text-sm font-medium">Conversation Depth</span>
                </div>
                <span className="text-sm font-bold">{Math.round(clarityAnalysis.completeness)}%</span>
              </div>
              <Progress value={clarityAnalysis.completeness} className="h-2" />
            </div>

            {/* Key Metrics */}
            <div className="grid grid-cols-2 gap-3">
              <div className="bg-white p-2 rounded border">
                <p className="text-xs text-gray-600">Follow-up Questions</p>
                <p className="text-lg font-bold text-blue-600">{clarityAnalysis.followUpQuestions}</p>
              </div>
              <div className="bg-white p-2 rounded border">
                <p className="text-xs text-gray-600">Medical Jargon</p>
                <p className="text-lg font-bold text-orange-600">
                  {clarityAnalysis.medicalJargonUsed ? 'Used' : 'Clear'}
                </p>
              </div>
            </div>

            {/* Suggestions */}
            {clarityAnalysis.suggestions.length > 0 && (
              <div className="bg-white p-3 rounded-lg border">
                <div className="flex items-center space-x-2 mb-2">
                  <AlertCircle className="h-4 w-4 text-orange-500" />
                  <span className="text-sm font-medium">Live Insights</span>
                </div>
                <div className="space-y-1">
                  {clarityAnalysis.suggestions.slice(0, 2).map((suggestion, idx) => (
                    <p key={idx} className="text-xs text-gray-600">• {suggestion}</p>
                  ))}
                </div>
              </div>
            )}
          </TabsContent>

          <TabsContent value="empathy" className="space-y-4">
            {/* Empathy Score */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Heart className="h-4 w-4 text-red-500" />
                  <span className="text-sm font-medium">Empathy & Warmth</span>
                </div>
                <span className="text-sm font-bold">{empathyAnalysis.overallScore}%</span>
              </div>
              <Progress value={empathyAnalysis.overallScore} className="h-2" />
            </div>

            {/* Empathy Moments */}
            <div className="space-y-2">
              <span className="text-sm font-medium">Recent Emotional Moments</span>
              <div className="space-y-2 max-h-32 overflow-y-auto">
                {empathyAnalysis.empathyMoments.map((moment, idx) => (
                  <div key={idx} className="bg-white p-2 rounded border flex items-center space-x-2">
                    {getMoodIcon(moment.emotional_state)}
                    <div className="flex-1">
                      <p className="text-xs text-gray-700">{moment.text}</p>
                      <p className="text-xs text-gray-500">{moment.timestamp}</p>
                    </div>
                    <Badge variant="outline" className="text-xs">
                      {moment.emotional_state}
                    </Badge>
                  </div>
                ))}
              </div>
            </div>

            {/* Empathy Recommendations */}
            {empathyAnalysis.recommendations.length > 0 && (
              <div className="bg-white p-3 rounded-lg border">
                <div className="flex items-center space-x-2 mb-2">
                  <Heart className="h-4 w-4 text-red-500" />
                  <span className="text-sm font-medium">Empathy Coaching</span>
                </div>
                <div className="space-y-1">
                  {empathyAnalysis.recommendations.map((rec, idx) => (
                    <p key={idx} className="text-xs text-gray-600">• {rec}</p>
                  ))}
                </div>
              </div>
            )}
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
};

export default ConversationQualityAnalyzer;
