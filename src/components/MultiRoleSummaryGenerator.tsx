import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Users, Stethoscope, Clipboard, Phone, User, Globe } from 'lucide-react';
import { TranscriptEntry, MedicalEntity, MultiRoleSummary } from '@/types/consultation';
import { useToast } from '@/hooks/use-toast';

interface MultiRoleSummaryGeneratorProps {
  transcriptEntries: TranscriptEntry[];
  medicalEntities: MedicalEntity[];
  patientName: string;
  sessionActive: boolean;
}

const MultiRoleSummaryGenerator: React.FC<MultiRoleSummaryGeneratorProps> = ({
  transcriptEntries,
  medicalEntities,
  patientName,
  sessionActive
}) => {
  const [summaries, setSummaries] = useState<MultiRoleSummary | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const { toast } = useToast();

  const generateMultiRoleSummaries = async () => {
    setIsGenerating(true);
    
    // Simulate AI-powered multi-role summary generation
    setTimeout(() => {
      const symptoms = medicalEntities.filter(e => e.type === 'symptom').map(e => e.text);
      const medications = medicalEntities.filter(e => e.type === 'medication').map(e => e.text);
      
      const multiRoleSummary: MultiRoleSummary = {
        doctor: `CLINICAL SUMMARY - ${patientName}
Date: ${new Date().toLocaleDateString()}

CHIEF COMPLAINT: ${symptoms.slice(0, 2).join(', ') || 'General consultation'}

HISTORY OF PRESENT ILLNESS:
Patient presents with ${symptoms.join(', ')}. Conversation lasted ${transcriptEntries.length} exchanges.

MEDICATIONS DISCUSSED: ${medications.join(', ') || 'None mentioned'}

ASSESSMENT & PLAN:
- Continue monitoring symptoms
- Follow-up as needed
- Patient education provided

NEXT APPOINTMENT: As scheduled`,

        nurse: `NURSING NOTES - ${patientName}
Date: ${new Date().toLocaleDateString()}

PRE-VISIT PREPARATION NEEDED:
- Vital signs: BP, Temp, HR, Weight
- Symptom assessment focus: ${symptoms.slice(0, 3).join(', ') || 'General wellness'}

PATIENT EDUCATION TOPICS:
- Medication compliance ${medications.length > 0 ? `(${medications[0]})` : ''}
- Symptom monitoring
- When to call clinic

FOLLOW-UP CARE:
- Schedule next appointment
- Lab work if ordered
- Patient questions addressed: Yes

SPECIAL NOTES: Patient communicated clearly, no language barriers noted.`,

        receptionist: `FRONT DESK SUMMARY - ${patientName}
Visit Date: ${new Date().toLocaleDateString()}

BILLING NOTES:
- Consultation completed: ${new Date().toLocaleTimeString()}
- Duration: Approximately ${Math.ceil(transcriptEntries.length / 2)} minutes
- Visit type: Follow-up consultation

SCHEDULING NEEDS:
- Follow-up appointment recommended
- Lab work: Check with doctor
- Referrals: None mentioned

PATIENT COMMUNICATION:
- Primary language: English
- Preferred contact: Phone
- Emergency contact: Update if needed

INSURANCE: Verify coverage for follow-up visits`,

        patient: `YOUR VISIT SUMMARY - ${patientName}
Date: ${new Date().toLocaleDateString()}

WHAT WE DISCUSSED TODAY:
${symptoms.length > 0 ? `• Your symptoms: ${symptoms.join(', ')}` : '• General health checkup'}
${medications.length > 0 ? `• Your medications: ${medications.join(', ')}` : ''}

WHAT YOU SHOULD DO:
• Continue taking your medications as prescribed
• Watch for any changes in your symptoms
• Call us if you have concerns

NEXT STEPS:
• Schedule your follow-up appointment
• Return if symptoms get worse
• Keep taking medications as discussed

QUESTIONS? Call us at (555) 123-4567

Remember: This summary is in simple language. Keep it safe and share with family if needed.`,

        translated: {
          hindi: `आपकी यात्रा का सारांश - ${patientName}
दिनांक: ${new Date().toLocaleDateString()}

आज हमने क्या चर्चा की:
${symptoms.length > 0 ? `• आपके लक्षण: ${symptoms.join(', ')}` : '• सामान्य स्वास्थ्य जांच'}

आपको क्या करना चाहिए:
• अपनी दवाइयां निर्देशानुसार लेते रहें
• लक्षणों में किसी भी बदलाव पर ध्यान दें
• चिंता होने पर हमें कॉल करें

प्रश्न? हमें (555) 123-4567 पर कॉल करें`,
          
          spanish: `RESUMEN DE SU VISITA - ${patientName}
Fecha: ${new Date().toLocaleDateString()}

LO QUE DISCUTIMOS HOY:
${symptoms.length > 0 ? `• Sus síntomas: ${symptoms.join(', ')}` : '• Chequeo general de salud'}

QUÉ DEBE HACER:
• Continúe tomando sus medicamentos según lo recetado
• Observe cualquier cambio en sus síntomas
• Llámenos si tiene preocupaciones

¿PREGUNTAS? Llámenos al (555) 123-4567`
        }
      };
      
      setSummaries(multiRoleSummary);
      setIsGenerating(false);
      
      toast({
        title: "Multi-Role Summaries Generated",
        description: "Customized summaries created for all staff roles and patient",
      });
    }, 2000);
  };

  if (!sessionActive || transcriptEntries.length === 0) {
    return (
      <Card className="border-teal-200 bg-teal-50">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Users className="h-5 w-5 text-teal-600" />
            <span>Multi-Role Summary Generator</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-gray-500 text-sm">Complete consultation to generate role-specific summaries...</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-teal-200 bg-teal-50">
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <Users className="h-5 w-5 text-teal-600" />
          <span>Auto-Triage Summary Generator</span>
          <Badge className="bg-teal-100 text-teal-700">Multi-Role AI</Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {!summaries ? (
          <div className="text-center space-y-4">
            <div className="grid grid-cols-2 gap-4 mb-4">
              <div className="flex items-center space-x-2 text-sm">
                <Stethoscope className="h-4 w-4 text-blue-500" />
                <span>Doctor Summary</span>
              </div>
              <div className="flex items-center space-x-2 text-sm">
                <Clipboard className="h-4 w-4 text-green-500" />
                <span>Nurse Notes</span>
              </div>
              <div className="flex items-center space-x-2 text-sm">
                <Phone className="h-4 w-4 text-orange-500" />
                <span>Reception Info</span>
              </div>
              <div className="flex items-center space-x-2 text-sm">
                <User className="h-4 w-4 text-purple-500" />
                <span>Patient Copy</span>
              </div>
            </div>
            
            <Button 
              onClick={generateMultiRoleSummaries}
              disabled={isGenerating}
              className="bg-teal-600 hover:bg-teal-700"
            >
              {isGenerating ? 'Generating...' : 'Generate All Role Summaries'}
            </Button>
          </div>
        ) : (
          <Tabs defaultValue="doctor" className="w-full">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="doctor" className="text-xs">
                <Stethoscope className="h-3 w-3 mr-1" />
                Doctor
              </TabsTrigger>
              <TabsTrigger value="nurse" className="text-xs">
                <Clipboard className="h-3 w-3 mr-1" />
                Nurse
              </TabsTrigger>
              <TabsTrigger value="reception" className="text-xs">
                <Phone className="h-3 w-3 mr-1" />
                Reception
              </TabsTrigger>
              <TabsTrigger value="patient" className="text-xs">
                <User className="h-3 w-3 mr-1" />
                Patient
              </TabsTrigger>
            </TabsList>
            
            <TabsContent value="doctor" className="space-y-2">
              <div className="bg-white p-3 rounded border">
                <pre className="text-xs whitespace-pre-wrap text-gray-700">
                  {summaries.doctor}
                </pre>
              </div>
            </TabsContent>
            
            <TabsContent value="nurse" className="space-y-2">
              <div className="bg-white p-3 rounded border">
                <pre className="text-xs whitespace-pre-wrap text-gray-700">
                  {summaries.nurse}
                </pre>
              </div>
            </TabsContent>
            
            <TabsContent value="reception" className="space-y-2">
              <div className="bg-white p-3 rounded border">
                <pre className="text-xs whitespace-pre-wrap text-gray-700">
                  {summaries.receptionist}
                </pre>
              </div>
            </TabsContent>
            
            <TabsContent value="patient" className="space-y-2">
              <div className="bg-white p-3 rounded border">
                <pre className="text-xs whitespace-pre-wrap text-gray-700">
                  {summaries.patient}
                </pre>
              </div>
              
              {summaries.translated && (
                <div className="space-y-2">
                  <div className="flex items-center space-x-2">
                    <Globe className="h-4 w-4 text-blue-500" />
                    <span className="text-sm font-medium">Translated Versions</span>
                  </div>
                  <Tabs defaultValue="hindi" className="w-full">
                    <TabsList>
                      <TabsTrigger value="hindi">हिंदी</TabsTrigger>
                      <TabsTrigger value="spanish">Español</TabsTrigger>
                    </TabsList>
                    <TabsContent value="hindi">
                      <div className="bg-blue-50 p-3 rounded border">
                        <pre className="text-xs whitespace-pre-wrap text-gray-700">
                          {summaries.translated.hindi}
                        </pre>
                      </div>
                    </TabsContent>
                    <TabsContent value="spanish">
                      <div className="bg-blue-50 p-3 rounded border">
                        <pre className="text-xs whitespace-pre-wrap text-gray-700">
                          {summaries.translated.spanish}
                        </pre>
                      </div>
                    </TabsContent>
                  </Tabs>
                </div>
              )}
            </TabsContent>
          </Tabs>
        )}
      </CardContent>
    </Card>
  );
};

export default MultiRoleSummaryGenerator;
