import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Share2, Download, Printer, QrCode, Calendar, Clock, User, FileText, Heart, Brain, CheckCircle } from 'lucide-react';
import { TranscriptEntry, MedicalEntity } from '@/types/consultation';
import { reportsStore } from '@/utils/reportsStore';

interface ShareablePatientReportProps {
  patientName: string;
  transcriptEntries: TranscriptEntry[];
  medicalEntities: MedicalEntity[];
  sessionActive: boolean;
  detectedLanguage: string;
}

const ShareablePatientReport: React.FC<ShareablePatientReportProps> = ({
  patientName,
  transcriptEntries,
  medicalEntities,
  sessionActive,
  detectedLanguage
}) => {
  const [reportGenerated, setReportGenerated] = useState(false);
  const [shareableUrl, setShareableUrl] = useState('');

  const generateReport = () => {
    // Generate and save the report using the reports store
    const report = reportsStore.generateReport(
      patientName,
      transcriptEntries,
      medicalEntities,
      detectedLanguage
    );
    
    setShareableUrl(report.reportUrl);
    setReportGenerated(true);
    
    // Show success message
    console.log('Report generated and saved:', report.id);
    
    // Show toast notification
    if (typeof window !== 'undefined' && window.toast) {
      window.toast({
        title: "Report Generated!",
        description: `Patient report saved successfully. You can view it in the Reports tab.`,
        duration: 5000
      });
    }
  };

  const downloadReport = () => {
    const reportData = generateReportData();
    const blob = new Blob([JSON.stringify(reportData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${patientName.replace(/\s+/g, '_')}_health_report_${new Date().toISOString().split('T')[0]}.json`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const printReport = () => {
    window.print();
  };

  const shareReport = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: `Health Report - ${patientName}`,
          text: 'Your consultation summary and next steps',
          url: shareableUrl
        });
      } catch (err) {
        console.log('Error sharing:', err);
      }
    } else {
      // Fallback: copy to clipboard
      navigator.clipboard.writeText(shareableUrl);
      alert('Report link copied to clipboard!');
    }
  };

  const generateReportData = () => {
    const symptoms = medicalEntities.filter(e => e.type === 'symptom');
    const medications = medicalEntities.filter(e => e.type === 'medication');
    const conditions = medicalEntities.filter(e => e.type === 'condition');

    return {
      patientName,
      visitDate: new Date().toLocaleDateString(),
      visitTime: new Date().toLocaleTimeString(),
      language: detectedLanguage,
      summary: {
        mainConcerns: symptoms.length > 0 ? symptoms.map(s => s.text) : ['General consultation'],
        discussedSymptoms: symptoms.map(s => s.text),
        mentionedMedications: medications.map(m => m.text),
        identifiedConditions: conditions.map(c => c.text)
      },
      nextSteps: [
        'Continue taking prescribed medications as directed',
        'Monitor symptoms and report any changes',
        'Schedule follow-up appointment as recommended'
      ],
      importantNotes: [
        'This report is generated from your consultation',
        'Keep this for your records',
        'Share with family members or caregivers as needed'
      ]
    };
  };

  if (!sessionActive || transcriptEntries.length === 0) {
    return (
      <Card className="border-blue-200 bg-blue-50">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <FileText className="h-5 w-5 text-blue-600" />
            <span>Patient Report</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-gray-500 text-sm">Complete your consultation to generate a shareable patient report...</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Report Generation Controls */}
      <Card className="border-blue-200 bg-blue-50">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <FileText className="h-5 w-5 text-blue-600" />
            <span>Shareable Patient Report</span>
            <Badge className="bg-white/20 text-white mt-1">
              <span>Interactive Presentation Mode</span>
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {!reportGenerated ? (
            <div className="text-center space-y-3">
              <Heart className="h-12 w-12 text-blue-600 mx-auto" />
              <p className="text-sm text-gray-600">
                Generate a comprehensive, patient-friendly report including:
              </p>
              <div className="grid grid-cols-2 gap-2 text-xs">
                <Badge variant="outline"><span>✓ Visit summary</span></Badge>
                <Badge variant="outline"><span>✓ Key findings</span></Badge>
                <Badge variant="outline"><span>✓ Next steps</span></Badge>
                <Badge variant="outline"><span>✓ Care instructions</span></Badge>
              </div>
              <Badge className="bg-purple-100 text-purple-700 animate-pulse">
                <span>Processing...</span>
              </Badge>
              <Button onClick={generateReport} className="bg-blue-600 hover:bg-blue-700">
                <FileText className="h-4 w-4 mr-2" />
                Generate & Save Report
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="flex space-x-2 justify-center">
                <Button size="sm" onClick={shareReport} className="bg-green-600 hover:bg-green-700">
                  <Share2 className="h-3 w-3 mr-1" />
                  Share
                </Button>
                <Button size="sm" onClick={downloadReport} variant="outline">
                  <Download className="h-3 w-3 mr-1" />
                  Download
                </Button>
                <Button size="sm" onClick={printReport} variant="outline">
                  <Printer className="h-3 w-3 mr-1" />
                  Print
                </Button>
              </div>
              <div className="flex items-center justify-center space-x-2 text-xs text-green-600">
                <CheckCircle className="h-4 w-4" />
                <span>Report saved to Reports tab!</span>
              </div>
              <p className="text-xs text-center text-gray-500">
                Report available at: <span className="font-mono text-blue-600">{shareableUrl}</span>
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Sample Patient Report Preview */}
      {reportGenerated && (
        <Card className="border-2 border-green-200 bg-white shadow-lg">
          <CardHeader className="bg-gradient-to-r from-blue-500 to-green-500 text-white">
            <CardTitle className="flex items-center space-x-2">
              <Heart className="h-6 w-6" />
              <span>ClinIQ Visit Summary</span>
            </CardTitle>
            <div className="flex items-center space-x-4 text-sm opacity-90">
              <div className="flex items-center space-x-1">
                <User className="h-4 w-4" />
                <span>{patientName}</span>
              </div>
              <div className="flex items-center space-x-1">
                <Calendar className="h-4 w-4" />
                <span>{new Date().toLocaleDateString()}</span>
              </div>
              <div className="flex items-center space-x-1">
                <Clock className="h-4 w-4" />
                <span>{new Date().toLocaleTimeString()}</span>
              </div>
            </div>
          </CardHeader>
          <CardContent className="p-6 space-y-6">
            
            {/* Main Concerns */}
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-3 flex items-center">
                <Brain className="h-5 w-5 mr-2 text-blue-600" />
                What We Discussed Today
              </h3>
              <div className="bg-blue-50 p-4 rounded-lg">
                <ul className="space-y-2">
                  {medicalEntities.filter(e => e.type === 'symptom').length > 0 ? (
                    medicalEntities.filter(e => e.type === 'symptom').map((symptom, idx) => (
                      <li key={idx} className="flex items-center space-x-2">
                        <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                        <span className="text-gray-700">{symptom.text}</span>
                      </li>
                    ))
                  ) : (
                    <li className="flex items-center space-x-2">
                      <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                      <span className="text-gray-700">General health consultation and wellness check</span>
                    </li>
                  )}
                </ul>
              </div>
            </div>

            <Separator />

            {/* Medications */}
            {medicalEntities.filter(e => e.type === 'medication').length > 0 && (
              <>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-3">💊 Medications Discussed</h3>
                  <div className="bg-yellow-50 p-4 rounded-lg">
                    <ul className="space-y-2">
                      {medicalEntities.filter(e => e.type === 'medication').map((med, idx) => (
                        <li key={idx} className="flex items-center space-x-2">
                          <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>
                          <span className="text-gray-700">{med.text}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
                <Separator />
              </>
            )}

            {/* Next Steps */}
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-3">📋 Your Next Steps</h3>
              <div className="bg-green-50 p-4 rounded-lg">
                <ul className="space-y-3">
                  <li className="flex items-start space-x-3">
                    <div className="w-6 h-6 bg-green-500 text-white rounded-full flex items-center justify-center text-sm font-semibold">1</div>
                    <span className="text-gray-700">Continue taking any prescribed medications as directed</span>
                  </li>
                  <li className="flex items-start space-x-3">
                    <div className="w-6 h-6 bg-green-500 text-white rounded-full flex items-center justify-center text-sm font-semibold">2</div>
                    <span className="text-gray-700">Monitor your symptoms and keep track of any changes</span>
                  </li>
                  <li className="flex items-start space-x-3">
                    <div className="w-6 h-6 bg-green-500 text-white rounded-full flex items-center justify-center text-sm font-semibold">3</div>
                    <span className="text-gray-700">Schedule your follow-up appointment as recommended</span>
                  </li>
                  <li className="flex items-start space-x-3">
                    <div className="w-6 h-6 bg-green-500 text-white rounded-full flex items-center justify-center text-sm font-semibold">4</div>
                    <span className="text-gray-700">Contact us if you have any questions or concerns</span>
                  </li>
                </ul>
              </div>
            </div>

            <Separator />

            {/* Important Notes */}
            <div className="bg-gray-50 p-4 rounded-lg">
              <h3 className="text-sm font-semibold text-gray-900 mb-2">📝 Important Notes:</h3>
              <ul className="text-xs text-gray-600 space-y-1">
                <li>• This report is generated from your consultation with AI assistance</li>
                <li>• Keep this report for your personal health records</li>
                <li>• Share with family members or caregivers as needed</li>
                <li>• If you have urgent concerns, contact your healthcare provider immediately</li>
              </ul>
            </div>

            {/* QR Code for Mobile Access */}
            <div className="text-center p-4 bg-gradient-to-r from-purple-50 to-blue-50 rounded-lg">
              <QrCode className="h-16 w-16 mx-auto text-purple-600 mb-2" />
              <p className="text-sm text-gray-600">Scan to access this report on your phone</p>
              <p className="text-xs text-gray-500 mt-1">Available in multiple languages</p>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default ShareablePatientReport;
