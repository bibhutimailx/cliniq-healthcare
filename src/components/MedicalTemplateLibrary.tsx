
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { PuzzleIcon, Mic, Brain, Zap } from 'lucide-react';
import { MedicalTemplate } from '@/types/consultation';
import { useToast } from '@/hooks/use-toast';

interface MedicalTemplateLibraryProps {
  onTemplateInserted: (template: string) => void;
  isListening: boolean;
}

const MedicalTemplateLibrary: React.FC<MedicalTemplateLibraryProps> = ({
  onTemplateInserted,
  isListening
}) => {
  const [templates, setTemplates] = useState<MedicalTemplate[]>([]);
  const [voiceCommand, setVoiceCommand] = useState('');
  const [lastUsedTemplate, setLastUsedTemplate] = useState<string | null>(null);
  const { toast } = useToast();

  // Initialize medical templates
  useEffect(() => {
    const defaultTemplates: MedicalTemplate[] = [
      {
        id: '1',
        name: 'Pediatric Fever Assessment',
        category: 'pediatric',
        voiceTrigger: 'use pediatric fever note',
        template: `PEDIATRIC FEVER ASSESSMENT:
- Temperature: [ADAPT_TEMP]°F
- Duration: [ADAPT_DURATION]
- Associated symptoms: [ADAPT_SYMPTOMS]
- Appetite/fluid intake: [ADAPT_INTAKE]
- Activity level: [ADAPT_ACTIVITY]
- Vaccination status: Up to date
- Recommendations: [ADAPT_RECOMMENDATIONS]`,
        adaptiveFields: ['ADAPT_TEMP', 'ADAPT_DURATION', 'ADAPT_SYMPTOMS', 'ADAPT_INTAKE', 'ADAPT_ACTIVITY', 'ADAPT_RECOMMENDATIONS']
      },
      {
        id: '2',
        name: 'Hypertension Follow-up',
        category: 'general',
        voiceTrigger: 'use hypertension template',
        template: `HYPERTENSION FOLLOW-UP:
- Current BP: [ADAPT_BP] mmHg
- Medication compliance: [ADAPT_COMPLIANCE]
- Side effects: [ADAPT_SIDE_EFFECTS]
- Lifestyle modifications: [ADAPT_LIFESTYLE]
- Next steps: [ADAPT_NEXT_STEPS]
- Follow-up: [ADAPT_FOLLOWUP]`,
        adaptiveFields: ['ADAPT_BP', 'ADAPT_COMPLIANCE', 'ADAPT_SIDE_EFFECTS', 'ADAPT_LIFESTYLE', 'ADAPT_NEXT_STEPS', 'ADAPT_FOLLOWUP']
      },
      {
        id: '3',
        name: 'Diabetes Management',
        category: 'general',
        voiceTrigger: 'use diabetes note',
        template: `DIABETES MANAGEMENT:
- HbA1c: [ADAPT_HBA1C]%
- Blood glucose monitoring: [ADAPT_GLUCOSE]
- Medication review: [ADAPT_MEDS]
- Diet adherence: [ADAPT_DIET]
- Exercise routine: [ADAPT_EXERCISE]
- Foot examination: [ADAPT_FEET]
- Recommendations: [ADAPT_RECOMMENDATIONS]`,
        adaptiveFields: ['ADAPT_HBA1C', 'ADAPT_GLUCOSE', 'ADAPT_MEDS', 'ADAPT_DIET', 'ADAPT_EXERCISE', 'ADAPT_FEET', 'ADAPT_RECOMMENDATIONS']
      },
      {
        id: '4',
        name: 'Elderly Care Assessment',
        category: 'geriatric',
        voiceTrigger: 'use elderly care template',
        template: `ELDERLY CARE ASSESSMENT:
- Mobility status: [ADAPT_MOBILITY]
- Cognitive function: [ADAPT_COGNITIVE]
- Medication review: [ADAPT_POLYPHARMACY]
- Fall risk: [ADAPT_FALL_RISK]
- Social support: [ADAPT_SUPPORT]
- Advance directives: [ADAPT_DIRECTIVES]
- Next appointment: [ADAPT_FOLLOWUP]`,
        adaptiveFields: ['ADAPT_MOBILITY', 'ADAPT_COGNITIVE', 'ADAPT_POLYPHARMACY', 'ADAPT_FALL_RISK', 'ADAPT_SUPPORT', 'ADAPT_DIRECTIVES', 'ADAPT_FOLLOWUP']
      }
    ];
    setTemplates(defaultTemplates);
  }, []);

  // Simulate voice command detection
  useEffect(() => {
    if (isListening && voiceCommand) {
      const matchingTemplate = templates.find(t => 
        voiceCommand.toLowerCase().includes(t.voiceTrigger.toLowerCase())
      );
      
      if (matchingTemplate) {
        handleTemplateInsert(matchingTemplate);
        setVoiceCommand('');
      }
    }
  }, [voiceCommand, isListening, templates]);

  const handleTemplateInsert = (template: MedicalTemplate) => {
    // Simulate AI adaptation based on conversation context
    let adaptedTemplate = template.template;
    
    // AI adaptation based on conversation context
    template.adaptiveFields.forEach(field => {
      if (field === 'ADAPT_TEMP') adaptedTemplate = adaptedTemplate.replace(field, '[Temperature]');
      if (field === 'ADAPT_BP') adaptedTemplate = adaptedTemplate.replace(field, '[Blood Pressure]');
      if (field === 'ADAPT_DURATION') adaptedTemplate = adaptedTemplate.replace(field, '[Duration]');
      if (field === 'ADAPT_SYMPTOMS') adaptedTemplate = adaptedTemplate.replace(field, '[Symptoms]');
      // Add more context-aware replacements
    });
    
    onTemplateInserted(adaptedTemplate);
    setLastUsedTemplate(template.name);
    
    toast({
      title: "Template Inserted",
      description: `${template.name} template inserted with AI adaptations`,
    });
  };

  return (
    <Card className="border-orange-200 bg-orange-50">
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <PuzzleIcon className="h-5 w-5 text-orange-600" />
          <span>AI Template Library</span>
          {isListening && (
            <Badge className="bg-red-100 text-red-800 animate-pulse">
              <Mic className="h-3 w-3 mr-1" />
              Voice Commands Active
            </Badge>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Voice Command Input */}
        <div className="space-y-2">
          <div className="flex items-center space-x-2">
            <Mic className="h-4 w-4 text-gray-500" />
            <span className="text-sm font-medium">Voice Command</span>
          </div>
          <Input
            placeholder="Try: 'use pediatric fever note' or 'use diabetes template'"
            value={voiceCommand}
            onChange={(e) => setVoiceCommand(e.target.value)}
            className="text-sm"
          />
          {voiceCommand && (
            <p className="text-xs text-gray-500">
              Say this phrase during recording to auto-insert template
            </p>
          )}
        </div>

        {/* Template Grid */}
        <div className="grid grid-cols-1 gap-3">
          {templates.map((template) => (
            <div key={template.id} className="bg-white p-3 rounded-lg border">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center space-x-2">
                  <span className="text-sm font-medium">{template.name}</span>
                  <Badge variant="outline" className="text-xs">
                    {template.category}
                  </Badge>
                </div>
                <Button
                  size="sm"
                  onClick={() => handleTemplateInsert(template)}
                  className="bg-orange-600 hover:bg-orange-700"
                >
                  <Zap className="h-3 w-3 mr-1" />
                  Insert
                </Button>
              </div>
              
              <p className="text-xs text-gray-600 mb-2">
                Voice trigger: "{template.voiceTrigger}"
              </p>
              
              <div className="flex items-center space-x-2">
                <Brain className="h-3 w-3 text-purple-500" />
                <span className="text-xs text-purple-600">
                  AI-adaptive: {template.adaptiveFields.length} smart fields
                </span>
              </div>
            </div>
          ))}
        </div>

        {lastUsedTemplate && (
          <div className="bg-green-50 p-2 rounded border border-green-200">
            <p className="text-xs text-green-700">
              ✓ Last used: {lastUsedTemplate} (AI-adapted)
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default MedicalTemplateLibrary;
