import React, { useState, useEffect } from 'react';
import { useSpeechRecognition } from '@/hooks/useSpeechRecognition';
import { useConsultationSession } from '@/hooks/useConsultationSession';
import SessionHeader from './SessionHeader';
import SessionSetup from './SessionSetup';
import SessionInfo from './SessionInfo';
import RecordingControls from './RecordingControls';
import FeatureGrids from './FeatureGrids';
import NotesSection from './NotesSection';
import PatientProfileManager from './PatientProfileManager';
import AIAnalysisSection from './AIAnalysisSection';
import { useProductionSpeechRecognition } from '@/hooks/useProductionSpeechRecognition';
import SpeechProviderConfig from './SpeechProviderConfig';
import { getBestAvailableProvider } from '@/services/speechRecognitionService';
import { SpeechRecognitionConfig } from '@/types/speechRecognition';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Eye, EyeOff, Users, Brain, Mic, MicOff, Zap } from 'lucide-react';
import { voiceSignatureDetection } from '@/utils/voiceSignatureDetection';
import { checkSpeechRecognitionSupport, isSpeechRecognitionSupported } from '@/utils/speechRecognitionConfig';

const ConsultationSession = () => {
  const {
    selectedLanguage,
    setSelectedLanguage,
    patientName,
    setPatientName,
    doctorNotes,
    setDoctorNotes,
    patientNotes,
    setPatientNotes,
    aiAnalysis,
    isAnalyzing,
    sessionActive,
    transcriptEntries,
    detectedLanguage,
    medicalEntities,
    isProcessingEntities,
    selectedPatientProfile,
    setSelectedPatientProfile,
    languages,
    handleTranscriptEntry,
    handleLanguageDetected,
    startSession,
    handleTemplateInserted,
    generateAIAnalysis,
    saveSession,
    getLanguageLabel
  } = useConsultationSession();

  // Add speech recognition configuration state - default to browser (no external APIs)
  const [speechConfig, setSpeechConfig] = useState<SpeechRecognitionConfig>({
    provider: 'browser', // Force browser speech recognition to avoid external API issues
    language: 'en-US',
    continuous: true,
    interimResults: false
  });

  // Debug state
  const [showDebugPanel, setShowDebugPanel] = useState(false);
  const [realTimeSpeakerCount, setRealTimeSpeakerCount] = useState(0);
  const [browserSupport, setBrowserSupport] = useState<any>(null);

  // Check browser support on component mount
  useEffect(() => {
    const support = checkSpeechRecognitionSupport();
    setBrowserSupport(support);
    console.log('Browser support check:', support);
    
    if (!support.speechRecognition) {
      console.error('❌ Speech recognition not supported in this browser');
    }
    if (!support.mediaDevices) {
      console.error('❌ Media devices not supported in this browser');
    }
  }, []);

  // Use production speech recognition instead of the old hook
  const { 
    isRecording, 
    connectionStatus,
    toggleRecording, 
    speakerToggle, 
    totalSpeakers,
    serviceProvider 
  } = useProductionSpeechRecognition({
    config: speechConfig,
    onTranscriptEntry: handleTranscriptEntry,
    onLanguageDetected: handleLanguageDetected
  });

  // Update speech config when language changes
  useEffect(() => {
    const langCode = languages.find(l => l.value === selectedLanguage)?.code || 'en-US';
    setSpeechConfig(prev => ({ ...prev, language: langCode }));
  }, [selectedLanguage, languages]);

  // Update real-time speaker count
  useEffect(() => {
    if (sessionActive && isRecording) {
      const interval = setInterval(() => {
        setRealTimeSpeakerCount(voiceSignatureDetection.getSpeakerStats().totalSpeakers);
      }, 1000);
      return () => clearInterval(interval);
    } else {
      setRealTimeSpeakerCount(0);
    }
  }, [sessionActive, isRecording]);

  const handleSpeechConfigUpdate = (newConfig: SpeechRecognitionConfig) => {
    setSpeechConfig(newConfig);
  };

  const handleStartSession = () => {
    // Start voice detection session
    // Session management is handled automatically by the singleton
    startSession();
  };

  const handleStopSession = () => {
    // End voice detection session
    // Session management is handled automatically by the singleton
    // Additional cleanup if needed
  };

  const getSpeakerProfiles = () => {
    return voiceSignatureDetection.getDetectedSpeakers();
  };

  const resetVoiceDetection = () => {
    voiceSignatureDetection.resetSpeakers();
    setRealTimeSpeakerCount(0);
  };

  const getProviderInfo = () => {
    switch (speechConfig.provider) {
      case 'anthropic':
        return {
          name: 'Anthropic Claude',
          description: 'Best AI model for medical understanding and multilingual support',
          features: ['Medical Expertise', '100+ Languages', 'Context Understanding', 'High Accuracy', 'Real-time'],
          icon: <Zap className="h-4 w-4 text-purple-600" />
        };
      case 'aws-bedrock':
        return {
          name: 'AWS Bedrock',
          description: 'Enterprise-grade, HIPAA compliant, production ready',
          features: ['100+ Languages', 'Speaker Diarization', 'Real-time', 'HIPAA Compliant', 'High Accuracy'],
          icon: <Zap className="h-4 w-4 text-purple-600" />
        };
      case 'assemblyai':
        return {
          name: 'AssemblyAI',
          description: 'Advanced AI with real-time speaker diarization',
          features: ['100+ Languages', 'Speaker Diarization', 'Real-time', 'High Accuracy'],
          icon: <Zap className="h-4 w-4 text-purple-600" />
        };
      case 'google':
        return {
          name: 'Google Cloud',
          description: 'Enterprise-grade multilingual recognition',
          features: ['120+ Languages', 'High Accuracy', 'Real-time'],
          icon: <Zap className="h-4 w-4 text-blue-600" />
        };
      case 'azure':
        return {
          name: 'Azure Speech',
          description: 'Microsoft\'s advanced speech services',
          features: ['100+ Languages', 'Custom Models', 'Real-time'],
          icon: <Zap className="h-4 w-4 text-green-600" />
        };
      case 'reverie':
        return {
          name: 'Reverie AI',
          description: 'Specialized for Indian languages',
          features: ['Indian Languages', 'Auto Detection', 'Real-time'],
          icon: <Zap className="h-4 w-4 text-orange-600" />
        };
      case 'enhanced-browser':
        return {
          name: 'Enhanced Browser',
          description: 'Improved browser recognition with fallbacks',
          features: ['Multi-language', 'No API Key', 'Real-time'],
          icon: <Zap className="h-4 w-4 text-green-600" />
        };
      default:
        return {
          name: 'Browser Native',
          description: 'Basic browser speech recognition',
          features: ['Basic Support', 'No API Key', 'Limited Languages'],
          icon: <Zap className="h-4 w-4 text-gray-600" />
        };
    }
  };

  const providerInfo = getProviderInfo();

  return (
    <div className="max-w-7xl mx-auto p-6 space-y-6">
      <SessionHeader
        onGenerateAnalysis={generateAIAnalysis}
        onSaveSession={saveSession}
        sessionActive={sessionActive}
        isAnalyzing={isAnalyzing}
      />

      {!sessionActive && (
        <>
          <SpeechProviderConfig
            currentConfig={speechConfig}
            onConfigUpdate={handleSpeechConfigUpdate}
          />
          
          <SessionSetup
            patientName={patientName}
            setPatientName={setPatientName}
            selectedLanguage={selectedLanguage}
            setSelectedLanguage={setSelectedLanguage}
            languages={languages}
            onStartSession={handleStartSession}
          />
          
          {patientName.length > 2 && (
            <PatientProfileManager
              patientName={patientName}
              onProfileSelected={setSelectedPatientProfile}
            />
          )}
        </>
      )}

      {sessionActive && (
        <>
          <SessionInfo
            patientName={patientName}
            detectedLanguage={detectedLanguage}
            totalSpeakers={realTimeSpeakerCount}
            detectedSpeakers={['doctor', 'patient']}
            speakerToggle={speakerToggle}
            selectedPatientProfile={selectedPatientProfile}
            getLanguageLabel={getLanguageLabel}
            serviceProvider={serviceProvider}
            connectionStatus={connectionStatus}
          />

          <RecordingControls
            isRecording={isRecording}
            onToggleRecording={toggleRecording}
            speakerToggle={speakerToggle}
            totalSpeakers={realTimeSpeakerCount}
            serviceProvider={serviceProvider}
            connectionStatus={connectionStatus}
          />

          {/* AI Provider Status */}
          <Card className="border-purple-200 bg-purple-50">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                {providerInfo.icon}
                <span>AI Speech Recognition</span>
                <Badge className="bg-purple-100 text-purple-800">
                  {providerInfo.name}
                </Badge>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <p className="text-sm text-purple-700">{providerInfo.description}</p>
                <div className="flex flex-wrap gap-2">
                  {providerInfo.features.map((feature, index) => (
                    <Badge key={index} variant="outline" className="text-xs bg-purple-100 text-purple-700">
                      {feature}
                    </Badge>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Real-time Voice Detection Status */}
          <Card className="border-blue-200 bg-blue-50">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Brain className="h-5 w-5 text-blue-600" />
                <span>Real-time Voice Detection</span>
                <Badge className="bg-blue-100 text-blue-800">
                  {isRecording ? 'Active' : 'Inactive'}
                </Badge>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="text-center">
                  <div className="text-2xl font-bold text-blue-600">
                    {realTimeSpeakerCount}
                  </div>
                  <div className="text-sm text-blue-700">Speakers Detected</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-green-600">
                    {isRecording ? '🔴' : '⚪'}
                  </div>
                  <div className="text-sm text-green-700">
                    {isRecording ? 'Recording' : 'Not Recording'}
                  </div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-purple-600">
                    {speakerToggle}
                  </div>
                  <div className="text-sm text-purple-700">Current Speaker</div>
                </div>
              </div>
              
              {realTimeSpeakerCount === 0 && isRecording && (
                <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                  <div className="flex items-center space-x-2">
                    <Mic className="h-4 w-4 text-yellow-600" />
                    <span className="text-sm text-yellow-800">
                      No speakers detected yet. Start speaking to see real-time detection.
                    </span>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Browser Compatibility Warning */}
          {browserSupport && (!browserSupport.speechRecognition || !browserSupport.mediaDevices) && (
            <Card className="mb-6 border-2 border-red-200 bg-red-50">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <MicOff className="h-5 w-5 text-red-600" />
                  <span>Browser Compatibility Issue</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2 text-sm">
                  {!browserSupport.speechRecognition && (
                    <div className="flex items-center space-x-2">
                      <span className="text-red-600">❌</span>
                      <span>Speech Recognition API not supported in this browser</span>
                    </div>
                  )}
                  {!browserSupport.mediaDevices && (
                    <div className="flex items-center space-x-2">
                      <span className="text-red-600">❌</span>
                      <span>Media Devices API not supported in this browser</span>
                    </div>
                  )}
                  <div className="mt-3 text-xs text-red-700">
                    Please use Chrome, Edge, or Safari for the best speech recognition experience.
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Debug Panel */}
          <Card className="border-orange-200 bg-orange-50">
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Brain className="h-5 w-5 text-orange-600" />
                  <span>Voice Signature Detection Debug</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setShowDebugPanel(!showDebugPanel)}
                  >
                    {showDebugPanel ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    {showDebugPanel ? 'Hide' : 'Show'} Debug
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={resetVoiceDetection}
                  >
                    Reset Detection
                  </Button>
                </div>
              </CardTitle>
            </CardHeader>
            {showDebugPanel && (
              <CardContent>
                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <h4 className="font-medium text-orange-900 mb-2">Current Speaker</h4>
                      <Badge className="bg-orange-100 text-orange-800">
                        {speakerToggle}
                      </Badge>
                    </div>
                    <div>
                      <h4 className="font-medium text-orange-900 mb-2">Real-time Speakers</h4>
                      <Badge className="bg-blue-100 text-blue-800">
                        {realTimeSpeakerCount}
                      </Badge>
                    </div>
                    <div>
                      <h4 className="font-medium text-orange-900 mb-2">Speech Recognition</h4>
                      <Badge className={browserSupport?.speechRecognition ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"}>
                        {browserSupport?.speechRecognition ? '✅ Supported' : '❌ Not Supported'}
                      </Badge>
                    </div>
                    <div>
                      <h4 className="font-medium text-orange-900 mb-2">Media Devices</h4>
                      <Badge className={browserSupport?.mediaDevices ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"}>
                        {browserSupport?.mediaDevices ? '✅ Supported' : '❌ Not Supported'}
                      </Badge>
                    </div>
                  </div>

                  {getSpeakerProfiles().length > 0 ? (
                    <div>
                      <h4 className="font-medium text-orange-900 mb-2">Speaker Profiles</h4>
                      <div className="space-y-2">
                        {getSpeakerProfiles().map((speaker, index) => (
                          <div key={speaker.id} className="bg-white p-3 rounded border">
                            <div className="flex items-center justify-between mb-2">
                              <Badge className="bg-green-100 text-green-800">
                                {speaker.role}
                              </Badge>
                              <span className="text-sm text-gray-600">
                                Confidence: {Math.round(speaker.confidence * 100)}%
                              </span>
                            </div>
                            <div className="grid grid-cols-2 gap-2 text-xs text-gray-600">
                              <div>Language: {speaker.characteristics.language}</div>
                              <div>Accent: {speaker.characteristics.accent}</div>
                              <div>Word Length: {speaker.characteristics.wordLength.toFixed(1)}</div>
                              <div>Sentence Length: {speaker.characteristics.sentenceLength.toFixed(1)}</div>
                              <div>Vocabulary: {(speaker.characteristics.vocabularyComplexity * 100).toFixed(1)}%</div>
                              <div>Samples: {speaker.sampleCount}</div>
                            </div>
                            <div className="mt-2 text-xs text-gray-500">
                              Last seen: {new Date(speaker.lastSeen).toLocaleTimeString()}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  ) : (
                    <div className="text-center py-4 text-gray-500">
                      <MicOff className="h-8 w-8 mx-auto mb-2 text-gray-400" />
                      <p>No speakers detected yet. Start speaking to see profiles.</p>
                    </div>
                  )}

                  {getSpeakerProfiles().length > 0 && (
                    <div>
                      <h4 className="font-medium text-orange-900 mb-2">Recent Speech Patterns</h4>
                      <div className="bg-white p-3 rounded border max-h-32 overflow-y-auto">
                        {getSpeakerProfiles().map(speaker => (
                          <div key={speaker.id} className="mb-2">
                            <div className="text-xs font-medium text-gray-700">{speaker.role}:</div>
                            <div className="text-xs text-gray-600">
                              {speaker.speechPatterns.slice(-3).join(', ')}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </CardContent>
            )}
          </Card>

          <FeatureGrids
            transcriptEntries={transcriptEntries}
            detectedLanguage={detectedLanguage}
            isRecording={isRecording}
            medicalEntities={medicalEntities}
            isProcessingEntities={isProcessingEntities}
            sessionActive={sessionActive}
            patientName={patientName}
            onTemplateInserted={handleTemplateInserted}
          />

          <NotesSection
            doctorNotes={doctorNotes}
            setDoctorNotes={setDoctorNotes}
            patientNotes={patientNotes}
            setPatientNotes={setPatientNotes}
          />

          <AIAnalysisSection
            aiAnalysis={aiAnalysis}
            isAnalyzing={isAnalyzing}
          />
        </>
      )}
    </div>
  );
};

export default ConsultationSession;
