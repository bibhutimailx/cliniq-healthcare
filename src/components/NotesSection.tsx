
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Stethoscope, AlertCircle } from 'lucide-react';

interface NotesSectionProps {
  doctorNotes: string;
  setDoctorNotes: (notes: string) => void;
  patientNotes: string;
  setPatientNotes: (notes: string) => void;
}

const NotesSection: React.FC<NotesSectionProps> = ({
  doctorNotes,
  setDoctorNotes,
  patientNotes,
  setPatientNotes
}) => {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Stethoscope className="h-5 w-5 text-blue-600" />
            <span>Doctor's Notes</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Textarea
            placeholder="AI will assist with note-taking based on live speech recognition..."
            value={doctorNotes}
            onChange={(e) => setDoctorNotes(e.target.value)}
            className="min-h-[200px] resize-none"
          />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <AlertCircle className="h-5 w-5 text-green-600" />
            <span>AI-Extracted Patient Information</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Textarea
            placeholder="AI will automatically extract patient information from live conversation..."
            value={patientNotes}
            onChange={(e) => setPatientNotes(e.target.value)}
            className="min-h-[200px] resize-none"
          />
        </CardContent>
      </Card>
    </div>
  );
};

export default NotesSection;
