import React from 'react';
import { Link } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Calendar, 
  Users, 
  FileText, 
  Stethoscope, 
  Mic, 
  Bot, 
  TrendingUp, 
  Activity,
  Clock,
  Globe,
  Presentation,
  ArrowRight
} from 'lucide-react';

const Dashboard = () => {
  const stats = [
    {
      title: 'Active Sessions',
      value: '3',
      description: 'Ongoing consultations',
      icon: Activity,
      color: 'text-blue-600',
      bgColor: 'bg-blue-100',
      link: '/consultation',
      action: 'View Sessions'
    },
    {
      title: 'Total Patients',
      value: '127',
      description: 'Registered patients',
      icon: Users,
      color: 'text-green-600',
      bgColor: 'bg-green-100',
      link: '/patients',
      action: 'Manage Patients'
    },
    {
      title: 'Reports Generated',
      value: '89',
      description: 'AI-powered reports',
      icon: FileText,
      color: 'text-purple-600',
      bgColor: 'bg-purple-100',
      link: '/reports',
      action: 'View Reports'
    },
    {
      title: 'Languages Supported',
      value: '3',
      description: 'English, Hindi, Odia',
      icon: Globe,
      color: 'text-orange-600',
      bgColor: 'bg-orange-100',
      link: '/consultation',
      action: 'Start Session'
    }
  ];

  const quickActions = [
    {
      title: 'Start Live Consultation',
      description: 'Begin recording patient conversation',
      icon: Mic,
      color: 'bg-gradient-to-r from-red-500 to-pink-500',
      link: '/consultation'
    },
    {
      title: 'AI Analysis',
      description: 'Generate insights from notes',
      icon: Bot,
      color: 'bg-gradient-to-r from-purple-500 to-blue-500',
      link: '/consultation'
    },
    {
      title: 'View Reports',
      description: 'Access patient reports',
      icon: FileText,
      color: 'bg-gradient-to-r from-green-500 to-blue-500',
      link: '/reports'
    }
  ];

  const recentSessions = [
    {
      patient: 'राज कुमार (Raj Kumar)',
      time: '2 hours ago',
      language: 'Hindi',
      status: 'completed'
    },
    {
      patient: 'Priya Sharma',
      time: '4 hours ago',
      language: 'English',
      status: 'in-progress'
    },
    {
      patient: 'ସୁନୀତା ପାତ୍ର (Sunita Patra)',
      time: '1 day ago',
      language: 'Odia',
      status: 'completed'
    }
  ];

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-8">
      {/* Header */}
      <div className="text-center">
        <div className="flex justify-between items-start mb-4">
          <div className="flex-1">
            <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-green-600 bg-clip-text text-transparent mb-4">
              ClinIQ
            </h1>
            <p className="text-xl text-gray-600 mb-8">
              Modern, AI-powered multilingual consultation and documentation
            </p>
          </div>
          <Link to="/presentation">
            <Button className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700">
              <Presentation className="h-4 w-4 mr-2" />
              Stakeholder Presentation
            </Button>
          </Link>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        {quickActions.map((action, index) => {
          const Icon = action.icon;
          return (
            <Link key={index} to={action.link}>
              <Card className="hover:shadow-lg transition-all duration-300 cursor-pointer transform hover:scale-105">
                <CardContent className="p-6 text-center">
                  <div className={`w-16 h-16 ${action.color} rounded-full flex items-center justify-center mx-auto mb-4`}>
                    <Icon className="h-8 w-8 text-white" />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">{action.title}</h3>
                  <p className="text-gray-600 text-sm">{action.description}</p>
                </CardContent>
              </Card>
            </Link>
          );
        })}
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {stats.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <Link key={index} to={stat.link}>
              <Card className="hover:shadow-lg transition-all duration-300 cursor-pointer transform hover:scale-105 border-2 border-transparent hover:border-gray-200">
                <CardContent className="p-6">
                  <div className="flex items-center space-x-4">
                    <div className={`p-3 rounded-full ${stat.bgColor}`}>
                      <Icon className={`h-6 w-6 ${stat.color}`} />
                    </div>
                    <div className="flex-1">
                      <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
                      <p className="text-sm font-medium text-gray-600">{stat.title}</p>
                      <p className="text-xs text-gray-500">{stat.description}</p>
                    </div>
                  </div>
                  <div className="mt-4 pt-3 border-t border-gray-100">
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      className={`w-full ${stat.color.replace('text-', 'hover:bg-').replace('-600', '-100')} hover:text-white transition-colors flex items-center justify-between`}
                    >
                      <span>{stat.action}</span>
                      <ArrowRight className="h-4 w-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </Link>
          );
        })}
      </div>

      {/* Recent Sessions */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Clock className="h-5 w-5 text-blue-600" />
            <span>Recent Consultation Sessions</span>
          </CardTitle>
          <CardDescription>Latest patient interactions and their status</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {recentSessions.map((session, index) => (
              <Link key={index} to="/consultation">
                <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors cursor-pointer">
                  <div className="flex items-center space-x-3">
                    <div className="bg-blue-100 p-2 rounded-full">
                      <Stethoscope className="h-4 w-4 text-blue-600" />
                    </div>
                    <div className="flex-1">
                      <p className="font-medium text-gray-900">{session.patient}</p>
                      <p className="text-sm text-gray-600">{session.time} • {session.language}</p>
                    </div>
                    <ArrowRight className="h-4 w-4 text-gray-400" />
                  </div>
                  <Badge 
                    className={session.status === 'completed' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}
                  >
                    {session.status}
                  </Badge>
                </div>
              </Link>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Call to Action */}
      <Card className="bg-gradient-to-r from-blue-500 to-green-500 text-white">
        <CardContent className="p-8 text-center">
          <h2 className="text-2xl font-bold mb-4">Ready to Start a New Consultation?</h2>
          <p className="text-blue-100 mb-6">
            Use AI-powered note-taking to capture patient conversations in multiple languages
          </p>
          <Link to="/consultation">
            <Button size="lg" className="bg-white text-blue-600 hover:bg-blue-50">
              <Mic className="h-5 w-5 mr-2" />
              Start Live Session
            </Button>
          </Link>
        </CardContent>
      </Card>
    </div>
  );
};

export default Dashboard;
