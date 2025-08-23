
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { QrCode, Download, Share2, FileText } from 'lucide-react';
import { TranscriptEntry, MedicalEntity } from '@/types/consultation';

interface PatientSummaryQRProps {
  patientName: string;
  transcriptEntries: TranscriptEntry[];
  medicalEntities: MedicalEntity[];
  sessionActive: boolean;
}

const PatientSummaryQR: React.FC<PatientSummaryQRProps> = ({
  patientName,
  transcriptEntries,
  medicalEntities,
  sessionActive
}) => {
  const [qrGenerated, setQrGenerated] = useState(false);
  const [summaryUrl, setSummaryUrl] = useState('');

  const generatePatientSummary = () => {
    const summary = {
      patient: patientName,
      date: new Date().toLocaleDateString(),
      keyPoints: [
        'Patient consultation completed successfully',
        `Discussed ${medicalEntities.filter(e => e.type === 'symptom').length} symptoms`,
        `Reviewed ${medicalEntities.filter(e => e.type === 'medication').length} medications`,
        'Follow-up scheduled as needed'
      ],
      symptoms: medicalEntities.filter(e => e.type === 'symptom').map(e => e.text),
      medications: medicalEntities.filter(e => e.type === 'medication').map(e => e.text),
      nextSteps: [
        'Continue prescribed medications',
        'Return if symptoms worsen',
        'Schedule follow-up in 2 weeks'
      ],
      doctorNotes: 'AI-powered consultation completed with multilingual support',
      language: 'Patient-friendly summary in multiple languages available'
    };

    // Generate QR code URL
    const summaryUrl = `/summary/${Date.now()}?patient=${encodeURIComponent(patientName)}`;
    setSummaryUrl(summaryUrl);
    setQrGenerated(true);
    
    // Store summary data
    localStorage.setItem(`summary_${Date.now()}`, JSON.stringify(summary));
  };

  const downloadSummary = () => {
    const summaryData = {
      patient: patientName,
      date: new Date().toLocaleDateString(),
      time: new Date().toLocaleTimeString(),
      consultationSummary: 'AI-Generated Patient Summary',
      keyFindings: medicalEntities.map(e => `${e.type}: ${e.text}`),
      recommendations: [
        'Continue current treatment plan',
        'Monitor symptoms closely',
        'Return for follow-up as scheduled'
      ]
    };

    const blob = new Blob([JSON.stringify(summaryData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${patientName.replace(/\s+/g, '_')}_summary_${new Date().toISOString().split('T')[0]}.json`;
    link.click();
    URL.revokeObjectURL(url);
  };

  if (!sessionActive || transcriptEntries.length === 0) {
    return (
      <Card className="border-green-200 bg-green-50">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <QrCode className="h-5 w-5 text-green-600" />
            <span>Patient Summary & QR Code</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-gray-500 text-sm">Complete consultation to generate patient summary QR code...</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-green-200 bg-green-50">
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <QrCode className="h-5 w-5 text-green-600" />
          <span>Shareable Patient Summary</span>
          <Badge className="bg-green-100 text-green-700">Ready</Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {!qrGenerated ? (
          <div className="text-center space-y-3">
            <FileText className="h-12 w-12 text-green-600 mx-auto" />
            <p className="text-sm text-gray-600">
              Generate a QR code for patient-friendly summary with:
            </p>
            <ul className="text-xs text-gray-500 space-y-1">
              <li>• Visit summary in simple language</li>
              <li>• Key findings and recommendations</li>
              <li>• Next steps and follow-up instructions</li>
              <li>• Available in patient's preferred language</li>
            </ul>
            <Button onClick={generatePatientSummary} className="bg-green-600 hover:bg-green-700">
              <QrCode className="h-4 w-4 mr-2" />
              Generate QR Summary
            </Button>
          </div>
        ) : (
          <div className="space-y-4">
            {/* Mock QR Code */}
            <div className="bg-white p-4 rounded-lg border-2 border-green-200 text-center">
              <div className="bg-gray-900 w-32 h-32 mx-auto mb-3 flex items-center justify-center">
                <QrCode className="h-16 w-16 text-white" />
              </div>
              <p className="text-xs text-gray-600">Scan to access patient summary</p>
            </div>

            <div className="space-y-2">
              <p className="text-sm font-medium">Summary includes:</p>
              <div className="grid grid-cols-2 gap-2 text-xs">
                <Badge variant="outline">✓ Key findings</Badge>
                <Badge variant="outline">✓ Medications</Badge>
                <Badge variant="outline">✓ Next steps</Badge>
                <Badge variant="outline">✓ Follow-up</Badge>
              </div>
            </div>

            <div className="flex space-x-2">
              <Button size="sm" onClick={downloadSummary} variant="outline">
                <Download className="h-3 w-3 mr-1" />
                Download
              </Button>
              <Button size="sm" onClick={() => navigator.share?.({ url: summaryUrl })} variant="outline">
                <Share2 className="h-3 w-3 mr-1" />
                Share
              </Button>
            </div>

            <p className="text-xs text-gray-500">
              QR code links to secure, patient-friendly summary page
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default PatientSummaryQR;
