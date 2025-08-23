
import React from 'react';
import { TranscriptEntry, MedicalEntity } from '@/types/consultation';
import LiveTranscript from './LiveTranscript';
import MedicalNotesGraph from './MedicalNotesGraph';
import ConversationQualityAnalyzer from './ConversationQualityAnalyzer';
import PatientSummaryQR from './PatientSummaryQR';
import MedicalTemplateLibrary from './MedicalTemplateLibrary';
import MultiRoleSummaryGenerator from './MultiRoleSummaryGenerator';
import ShareablePatientReport from './ShareablePatientReport';

interface FeatureGridsProps {
  transcriptEntries: TranscriptEntry[];
  detectedLanguage: string;
  isRecording: boolean;
  medicalEntities: MedicalEntity[];
  isProcessingEntities: boolean;
  sessionActive: boolean;
  patientName: string;
  onTemplateInserted: (template: string) => void;
}

const FeatureGrids: React.FC<FeatureGridsProps> = ({
  transcriptEntries,
  detectedLanguage,
  isRecording,
  medicalEntities,
  isProcessingEntities,
  sessionActive,
  patientName,
  onTemplateInserted
}) => {
  return (
    <>
      {/* Enhanced Live Transcript and Medical Graph */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <LiveTranscript 
          entries={transcriptEntries}
          detectedLanguage={detectedLanguage}
          isListening={isRecording}
        />
        <MedicalNotesGraph 
          entities={medicalEntities}
          isProcessing={isProcessingEntities}
        />
      </div>

      {/* Advanced AI Features Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <ConversationQualityAnalyzer
          transcriptEntries={transcriptEntries}
          isActive={sessionActive}
        />
        <PatientSummaryQR
          patientName={patientName}
          transcriptEntries={transcriptEntries}
          medicalEntities={medicalEntities}
          sessionActive={sessionActive}
        />
      </div>

      {/* New Advanced Features */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <MedicalTemplateLibrary
          onTemplateInserted={onTemplateInserted}
          isListening={isRecording}
        />
        <MultiRoleSummaryGenerator
          transcriptEntries={transcriptEntries}
          medicalEntities={medicalEntities}
          patientName={patientName}
          sessionActive={sessionActive}
        />
      </div>

      {/* Shareable Patient Report - Full Width */}
      <div className="w-full">
        <ShareablePatientReport
          patientName={patientName}
          transcriptEntries={transcriptEntries}
          medicalEntities={medicalEntities}
          sessionActive={sessionActive}
          detectedLanguage={detectedLanguage}
        />
      </div>
    </>
  );
};

export default FeatureGrids;
