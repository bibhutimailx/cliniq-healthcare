import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { 
  Users, 
  Search, 
  Plus, 
  Filter,
  Stethoscope,
  Calendar,
  Phone,
  Mail,
  MapPin
} from 'lucide-react';

const PatientManager = () => {
  const [searchTerm, setSearchTerm] = useState('');

  const patients = [
    {
      id: 1,
      name: 'राज कुमार (Raj Kumar)',
      age: 45,
      phone: '+91 98765 43210',
      email: 'raj.kumar@email.com',
      language: 'Hindi',
      lastVisit: '2024-08-03',
      nextAppointment: '2024-08-10',
      status: 'active',
      condition: 'Hypertension'
    },
    {
      id: 2,
      name: 'Priya Sharma',
      age: 32,
      phone: '+91 87654 32109',
      email: 'priya.sharma@email.com',
      language: 'English',
      lastVisit: '2024-08-02',
      nextAppointment: '2024-08-15',
      status: 'active',
      condition: 'Diabetes'
    },
    {
      id: 3,
      name: 'ସୁନୀତା ପାତ୍ର (Sunita Patra)',
      age: 28,
      phone: '+91 76543 21098',
      email: 'sunita.patra@email.com',
      language: 'Odia',
      lastVisit: '2024-08-01',
      nextAppointment: '2024-08-12',
      status: 'active',
      condition: 'Asthma'
    },
    {
      id: 4,
      name: 'Amit Patel',
      age: 55,
      phone: '+91 65432 10987',
      email: 'amit.patel@email.com',
      language: 'Gujarati',
      lastVisit: '2024-07-30',
      nextAppointment: '2024-08-08',
      status: 'inactive',
      condition: 'Cardiac'
    },
    {
      id: 5,
      name: 'Lakshmi Devi',
      age: 38,
      phone: '+91 54321 09876',
      email: 'lakshmi.devi@email.com',
      language: 'Tamil',
      lastVisit: '2024-07-29',
      nextAppointment: '2024-08-05',
      status: 'active',
      condition: 'Thyroid'
    }
  ];

  const filteredPatients = patients.filter(patient =>
    patient.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    patient.condition.toLowerCase().includes(searchTerm.toLowerCase()) ||
    patient.language.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getStatusColor = (status: string) => {
    return status === 'active' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800';
  };

  const getLanguageBadgeColor = (language: string) => {
    const colors: { [key: string]: string } = {
      'Hindi': 'bg-orange-100 text-orange-800',
      'English': 'bg-blue-100 text-blue-800',
      'Odia': 'bg-purple-100 text-purple-800',
      'Gujarati': 'bg-green-100 text-green-800',
      'Tamil': 'bg-red-100 text-red-800'
    };
    return colors[language] || 'bg-gray-100 text-gray-800';
  };

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Patient Management</h1>
          <p className="text-gray-600 mt-2">Manage your patient database and appointments</p>
        </div>
        <Button className="bg-blue-600 hover:bg-blue-700">
          <Plus className="h-4 w-4 mr-2" />
          Add New Patient
        </Button>
      </div>

      {/* Search and Filters */}
      <Card>
        <CardContent className="p-6">
          <div className="flex gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                placeholder="Search patients by name, condition, or language..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <Button variant="outline">
              <Filter className="h-4 w-4 mr-2" />
              Filter
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-3">
              <Users className="h-8 w-8 text-blue-600" />
              <div>
                <p className="text-2xl font-bold">{patients.length}</p>
                <p className="text-sm text-gray-600">Total Patients</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-3">
              <Stethoscope className="h-8 w-8 text-green-600" />
              <div>
                <p className="text-2xl font-bold">{patients.filter(p => p.status === 'active').length}</p>
                <p className="text-sm text-gray-600">Active Patients</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-3">
              <Calendar className="h-8 w-8 text-purple-600" />
              <div>
                <p className="text-2xl font-bold">12</p>
                <p className="text-sm text-gray-600">Appointments Today</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-3">
              <Users className="h-8 w-8 text-orange-600" />
              <div>
                <p className="text-2xl font-bold">5</p>
                <p className="text-sm text-gray-600">Languages</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Patient List */}
      <Card>
        <CardHeader>
          <CardTitle>Patient Directory</CardTitle>
          <CardDescription>
            {filteredPatients.length} patients found
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {filteredPatients.map((patient) => (
              <div key={patient.id} className="border rounded-lg p-4 hover:bg-gray-50 transition-colors">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <div className="bg-blue-100 p-3 rounded-full">
                      <Users className="h-6 w-6 text-blue-600" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-lg">{patient.name}</h3>
                      <p className="text-sm text-gray-600">{patient.age} years • {patient.condition}</p>
                      <div className="flex items-center space-x-2 mt-2">
                        <Badge className={getLanguageBadgeColor(patient.language)}>
                          {patient.language}
                        </Badge>
                        <Badge className={getStatusColor(patient.status)}>
                          {patient.status}
                        </Badge>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center space-x-4">
                    <div className="text-right">
                      <p className="text-sm text-gray-600">Last Visit</p>
                      <p className="font-medium">{patient.lastVisit}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm text-gray-600">Next Appointment</p>
                      <p className="font-medium">{patient.nextAppointment}</p>
                    </div>
                    <Button variant="outline" size="sm">
                      View Details
                    </Button>
                  </div>
                </div>
                <div className="flex items-center space-x-4 mt-4 pt-4 border-t border-gray-100">
                  <div className="flex items-center space-x-2 text-sm text-gray-600">
                    <Phone className="h-4 w-4" />
                    <span>{patient.phone}</span>
                  </div>
                  <div className="flex items-center space-x-2 text-sm text-gray-600">
                    <Mail className="h-4 w-4" />
                    <span>{patient.email}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default PatientManager; 