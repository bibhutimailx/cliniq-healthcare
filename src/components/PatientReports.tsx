import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Calendar, FileText, TrendingUp, User, Search, Filter, Download, Trash2, Eye } from 'lucide-react';
import { reportsStore, PatientReport } from '@/utils/reportsStore';

const PatientReports = () => {
  const [reports, setReports] = useState<PatientReport[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterLanguage, setFilterLanguage] = useState('all');
  const [stats, setStats] = useState({
    total: 0,
    completed: 0,
    languages: 0,
    patients: 0
  });

  useEffect(() => {
    loadReports();
  }, []);

  const loadReports = () => {
    const allReports = reportsStore.getReports();
    setReports(allReports);
    setStats(reportsStore.getReportsStats());
  };

  const filteredReports = reports.filter(report => {
    const matchesSearch = report.patientName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         report.summary.mainConcerns.some(concern => concern.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesLanguage = filterLanguage === 'all' || report.language.toLowerCase() === filterLanguage.toLowerCase();
    return matchesSearch && matchesLanguage;
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'bg-green-100 text-green-800';
      case 'draft':
        return 'bg-yellow-100 text-yellow-800';
      case 'archived':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-blue-100 text-blue-800';
    }
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

  const deleteReport = (id: string) => {
    if (window.confirm('Are you sure you want to delete this report?')) {
      reportsStore.deleteReport(id);
      loadReports();
    }
  };

  const downloadReport = (report: PatientReport) => {
    const blob = new Blob([JSON.stringify(report, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${report.patientName.replace(/\s+/g, '_')}_report_${report.id}.json`;
    link.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Patient Reports</h1>
          <p className="text-gray-600 mt-2">View and manage patient consultation reports and medical history</p>
        </div>
        <Button onClick={loadReports} variant="outline">
          <FileText className="h-4 w-4 mr-2" />
          Refresh Reports
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-3">
              <FileText className="h-8 w-8 text-blue-600" />
              <div>
                <p className="text-2xl font-bold">{stats.total}</p>
                <p className="text-sm text-gray-600">Total Reports</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-3">
              <User className="h-8 w-8 text-green-600" />
              <div>
                <p className="text-2xl font-bold">{stats.patients}</p>
                <p className="text-sm text-gray-600">Unique Patients</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-3">
              <TrendingUp className="h-8 w-8 text-purple-600" />
              <div>
                <p className="text-2xl font-bold">{stats.completed}</p>
                <p className="text-sm text-gray-600">Completed</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-3">
              <Calendar className="h-8 w-8 text-orange-600" />
              <div>
                <p className="text-2xl font-bold">{stats.languages}</p>
                <p className="text-sm text-gray-600">Languages</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Search and Filters */}
      <Card>
        <CardContent className="p-6">
          <div className="flex gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <input
                type="text"
                placeholder="Search reports by patient name or concerns..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            <select
              value={filterLanguage}
              onChange={(e) => setFilterLanguage(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="all">All Languages</option>
              <option value="English">English</option>
              <option value="Hindi">Hindi</option>
              <option value="Odia">Odia</option>
              <option value="Gujarati">Gujarati</option>
              <option value="Tamil">Tamil</option>
            </select>
          </div>
        </CardContent>
      </Card>

      {/* Reports List */}
      <div className="space-y-4">
        {filteredReports.length === 0 ? (
          <Card className="border-dashed border-gray-300 bg-gray-50">
            <CardContent className="p-8 text-center">
              <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-600 mb-2">No Reports Found</h3>
              <p className="text-gray-500 text-sm">
                {reports.length === 0 
                  ? "Patient reports will appear here once consultation sessions are completed and reports are generated."
                  : "No reports match your search criteria."
                }
              </p>
            </CardContent>
          </Card>
        ) : (
          filteredReports.map((report) => (
            <Card key={report.id} className="hover:shadow-lg transition-shadow">
              <CardHeader className="pb-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="bg-blue-100 p-2 rounded-full">
                      <User className="h-5 w-5 text-blue-600" />
                    </div>
                    <div>
                      <CardTitle className="text-xl">{report.patientName}</CardTitle>
                      <CardDescription>
                        {report.visitDate} at {report.visitTime} • Language: {report.language}
                      </CardDescription>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Badge className={getLanguageBadgeColor(report.language)}>
                      {report.language}
                    </Badge>
                    <Badge className={getStatusColor(report.status)}>
                      {report.status.charAt(0).toUpperCase() + report.status.slice(1)}
                    </Badge>
                  </div>
                </div>
              </CardHeader>
              
              <CardContent className="space-y-4">
                <div className="grid md:grid-cols-3 gap-4">
                  <div className="flex items-center space-x-2">
                    <Calendar className="h-4 w-4 text-gray-500" />
                    <span className="text-sm text-gray-600">Visit: {report.visitDate}</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <FileText className="h-4 w-4 text-gray-500" />
                    <span className="text-sm text-gray-600">ID: {report.id}</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <TrendingUp className="h-4 w-4 text-gray-500" />
                    <span className="text-sm text-gray-600">Status: {report.status}</span>
                  </div>
                </div>
                
                <div className="border-t pt-4">
                  <h4 className="font-semibold text-gray-900 mb-2">Main Concerns</h4>
                  <div className="flex flex-wrap gap-2">
                    {report.summary.mainConcerns.map((concern, idx) => (
                      <Badge key={idx} variant="outline" className="text-xs">
                        {concern}
                      </Badge>
                    ))}
                  </div>
                </div>

                {report.summary.mentionedMedications.length > 0 && (
                  <div className="border-t pt-4">
                    <h4 className="font-semibold text-gray-900 mb-2">Medications Discussed</h4>
                    <div className="flex flex-wrap gap-2">
                      {report.summary.mentionedMedications.map((med, idx) => (
                        <Badge key={idx} variant="outline" className="text-xs bg-yellow-50">
                          💊 {med}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}

                <div className="flex items-center justify-between pt-4 border-t">
                  <div className="flex items-center space-x-2">
                    <Button size="sm" variant="outline" onClick={() => downloadReport(report)}>
                      <Download className="h-4 w-4 mr-1" />
                      Download
                    </Button>
                    <Button size="sm" variant="outline">
                      <Eye className="h-4 w-4 mr-1" />
                      View
                    </Button>
                  </div>
                  <Button 
                    size="sm" 
                    variant="outline" 
                    onClick={() => deleteReport(report.id)}
                    className="text-red-600 hover:text-red-700"
                  >
                    <Trash2 className="h-4 w-4 mr-1" />
                    Delete
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
};

export default PatientReports; 