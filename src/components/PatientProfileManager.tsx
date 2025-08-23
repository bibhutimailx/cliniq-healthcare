
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { User, History, Heart, TrendingUp, Brain, Clock } from 'lucide-react';
import { PatientProfile, ConsultationSession } from '@/types/consultation';

interface PatientProfileManagerProps {
  patientName: string;
  onProfileSelected: (profile: PatientProfile | null) => void;
}

const PatientProfileManager: React.FC<PatientProfileManagerProps> = ({
  patientName,
  onProfileSelected
}) => {
  const [profiles, setProfiles] = useState<PatientProfile[]>([]);
  const [selectedProfile, setSelectedProfile] = useState<PatientProfile | null>(null);
  const [isNewPatient, setIsNewPatient] = useState(true);

  // Initialize with empty profiles - no mock data
  useEffect(() => {
    setProfiles([]);
  }, []);

  // Enhanced patient matching with voice memory context
  useEffect(() => {
    const matchingProfile = profiles.find(p => 
      p.name.toLowerCase().includes(patientName.toLowerCase()) && patientName.length > 2
    );
    
    if (matchingProfile) {
      setSelectedProfile(matchingProfile);
      setIsNewPatient(false);
      onProfileSelected(matchingProfile);
    } else {
      setSelectedProfile(null);
      setIsNewPatient(true);
      onProfileSelected(null);
    }
  }, [patientName, profiles, onProfileSelected]);

  const createNewProfile = () => {
    const newProfile: PatientProfile = {
      id: Date.now().toString(),
      name: patientName,
      previousVisits: [],
      preferences: {
        language: 'english',
        communicationStyle: 'balanced'
      },
      medicalHistory: {
        recurringSymptoms: [],
        chronicConditions: [],
        medications: [],
        lastMentioned: {}
      }
    };
    setProfiles(prev => [...prev, newProfile]);
    setSelectedProfile(newProfile);
    setIsNewPatient(false);
    onProfileSelected(newProfile);
  };

  const getContextualReminders = (profile: PatientProfile) => {
    const reminders = [];
    const recentSymptoms = Object.entries(profile.medicalHistory.lastMentioned)
      .sort(([,a], [,b]) => new Date(b).getTime() - new Date(a).getTime())
      .slice(0, 3);
    
    recentSymptoms.forEach(([symptom, date]) => {
      reminders.push(`Last mentioned "${symptom}" on ${date}`);
    });
    
    return reminders;
  };

  return (
    <Card className="border-blue-200 bg-blue-50">
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <User className="h-5 w-5 text-blue-600" />
          <span>Patient Voice Profile & Memory</span>
          {selectedProfile && (
            <Badge className="bg-purple-100 text-purple-800">
              <Brain className="h-3 w-3 mr-1" />
              AI Memory Active
            </Badge>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {isNewPatient ? (
          <div className="space-y-3">
            <Badge className="bg-green-100 text-green-800">New Patient</Badge>
            <p className="text-sm text-gray-600">
              No previous visits found for "{patientName}"
            </p>
            <p className="text-xs text-gray-500">
              Voice signature will be created during this session for future recognition
            </p>
            <Button onClick={createNewProfile} size="sm" className="bg-blue-600">
              Create Patient Profile + Voice Memory
            </Button>
          </div>
        ) : selectedProfile && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <Badge className="bg-blue-100 text-blue-800">Returning Patient</Badge>
              <div className="flex space-x-2">
                <Badge variant="outline">
                  {selectedProfile.previousVisits.length} Previous Visits
                </Badge>
                <Badge variant="outline" className="bg-purple-50">
                  <Brain className="h-3 w-3 mr-1" />
                  Voice ID: {selectedProfile.voiceSignature?.slice(-3).toUpperCase()}
                </Badge>
              </div>
            </div>
            
            <div className="space-y-3">
              <p className="font-medium">{selectedProfile.name}</p>
              <p className="text-sm text-gray-600">
                Preferred Language: {selectedProfile.preferences.language} | 
                Style: {selectedProfile.preferences.communicationStyle}
              </p>
              
              {/* Medical Memory Context */}
              <div className="bg-gradient-to-r from-purple-50 to-blue-50 p-3 rounded-lg border">
                <div className="flex items-center space-x-2 mb-2">
                  <Brain className="h-4 w-4 text-purple-500" />
                  <span className="text-sm font-medium">AI Memory Context</span>
                </div>
                
                {selectedProfile.medicalHistory.recurringSymptoms.length > 0 && (
                  <div className="mb-2">
                    <p className="text-xs text-gray-600 mb-1">Recurring Symptoms:</p>
                    <div className="flex flex-wrap gap-1">
                      {selectedProfile.medicalHistory.recurringSymptoms.map((symptom, idx) => (
                        <Badge key={idx} variant="outline" className="text-xs bg-red-50">
                          {symptom}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}
                
                {Object.keys(selectedProfile.medicalHistory.lastMentioned).length > 0 && (
                  <div>
                    <p className="text-xs text-gray-600 mb-1">Recent Context:</p>
                    {getContextualReminders(selectedProfile).map((reminder, idx) => (
                      <p key={idx} className="text-xs text-purple-700 flex items-center">
                        <Clock className="h-3 w-3 mr-1" />
                        {reminder}
                      </p>
                    ))}
                  </div>
                )}
              </div>
              
              {/* Last Visit Summary */}
              {selectedProfile.previousVisits.length > 0 && (
                <div className="bg-white p-3 rounded-lg border">
                  <div className="flex items-center space-x-2 mb-2">
                    <History className="h-4 w-4 text-gray-500" />
                    <span className="text-sm font-medium">Last Visit Summary</span>
                    <Badge variant="outline" className="text-xs">
                      {selectedProfile.previousVisits[0].date}
                    </Badge>
                  </div>
                  <p className="text-sm text-gray-700">
                    {selectedProfile.previousVisits[0].summary}
                  </p>
                  <div className="flex items-center space-x-4 mt-2">
                    <div className="flex items-center space-x-1">
                      <TrendingUp className="h-3 w-3 text-blue-500" />
                      <span className="text-xs">Clarity: {selectedProfile.previousVisits[0].clarityScore}%</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <Heart className="h-3 w-3 text-red-500" />
                      <span className="text-xs">Empathy: {selectedProfile.previousVisits[0].empathyScore}%</span>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default PatientProfileManager;
