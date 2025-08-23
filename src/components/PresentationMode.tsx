import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  ChevronLeft, 
  ChevronRight, 
  Brain, 
  Heart, 
  QrCode, 
  Users, 
  TrendingUp, 
  Globe,
  Mic,
  FileText,
  Target,
  Lightbulb,
  Rocket,
  Check,
  Shield,
  Clock,
  Smile,
  Wifi,
  Volume2,
  ArrowDown,
  ArrowRight,
  UserCheck,
  Share2,
  BarChart3,
  Stethoscope
} from 'lucide-react';

const PresentationMode = () => {
  const [currentSlide, setCurrentSlide] = useState(0);

  const slides = [
    {
      id: 'title',
      title: 'ClinIQ',
      subtitle: 'Modern Intelligent Healthcare Assistant',
      content: (
        <div className="text-center space-y-6">
          <div className="bg-gradient-to-r from-blue-600 to-green-600 text-white p-8 rounded-lg">
            <Brain className="h-16 w-16 mx-auto mb-4" />
            <h2 className="text-3xl font-bold mb-2">Next-Generation Healthcare AI</h2>
            <p className="text-xl opacity-90">Real-time multilingual consultation assistance</p>
          </div>
          <div className="grid grid-cols-3 gap-4 mt-8">
            <Badge className="p-3 text-sm"><span>🎙️ Live Speech Recognition</span></Badge>
            <Badge className="p-3 text-sm"><span>🧠 AI Medical Analysis</span></Badge>
            <Badge className="p-3 text-sm"><span>🌐 Multilingual Support</span></Badge>
          </div>
        </div>
      )
    },
    {
      id: 'problem',
      title: 'The Healthcare Documentation Challenge',
      subtitle: 'Critical gaps in current medical consultation workflows',
      content: (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card className="border-red-200 bg-red-50">
              <CardHeader>
                <CardTitle className="text-red-700">Current Pain Points</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center space-x-2">
                  <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                  <span className="text-sm">Manual note-taking reduces doctor-patient eye contact</span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                  <span className="text-sm">Language barriers affect 40% of consultations</span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                  <span className="text-sm">Inconsistent documentation across providers</span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                  <span className="text-sm">Critical details missed in complex cases</span>
                </div>
              </CardContent>
            </Card>
            <Card className="border-blue-200 bg-blue-50">
              <CardHeader>
                <CardTitle className="text-blue-700">Market Opportunity</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="text-center">
                  <div className="text-3xl font-bold text-blue-600">$45B</div>
                  <p className="text-sm text-gray-600">Healthcare AI Market by 2026</p>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-green-600">78%</div>
                  <p className="text-sm text-gray-600">Of doctors want AI documentation tools</p>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-purple-600">60%</div>
                  <p className="text-sm text-gray-600">Time savings potential</p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      )
    },
    {
      id: 'workflow',
      title: 'How Our AI Assistant Works',
      subtitle: 'Complete workflow from consultation to patient care',
      content: (
        <div className="space-y-6">
          <div className="bg-gradient-to-r from-blue-100 to-green-100 p-6 rounded-lg">
            <h3 className="text-xl font-bold text-center mb-6">AI Medical Consultation Workflow</h3>
            
            {/* Workflow Steps */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
              <div className="text-center">
                <div className="bg-blue-500 text-white w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-2 text-xl font-bold">1</div>
                <h4 className="font-semibold mb-2">Session Setup</h4>
                <div className="bg-white p-3 rounded shadow-sm">
                  <UserCheck className="h-8 w-8 text-blue-500 mx-auto mb-2" />
                  <p className="text-xs">Patient profile recognition</p>
                  <p className="text-xs">Language selection</p>
                  <p className="text-xs">Voice signature matching</p>
                </div>
              </div>
              
              <div className="text-center">
                <div className="bg-green-500 text-white w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-2 text-xl font-bold">2</div>
                <h4 className="font-semibold mb-2">Live Recording</h4>
                <div className="bg-white p-3 rounded shadow-sm">
                  <Mic className="h-8 w-8 text-green-500 mx-auto mb-2" />
                  <p className="text-xs">Real-time transcription</p>
                  <p className="text-xs">Medical entity extraction</p>
                  <p className="text-xs">Mood & empathy tracking</p>
                </div>
              </div>
              
              <div className="text-center">
                <div className="bg-purple-500 text-white w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-2 text-xl font-bold">3</div>
                <h4 className="font-semibold mb-2">AI Analysis</h4>
                <div className="bg-white p-3 rounded shadow-sm">
                  <Brain className="h-8 w-8 text-purple-500 mx-auto mb-2" />
                  <p className="text-xs">Conversation quality scoring</p>
                  <p className="text-xs">Medical insights generation</p>
                  <p className="text-xs">Template suggestions</p>
                </div>
              </div>
            </div>

            {/* Flow Arrows */}
            <div className="flex justify-center items-center space-x-8 mb-6">
              <ArrowDown className="h-6 w-6 text-gray-400" />
              <ArrowDown className="h-6 w-6 text-gray-400" />
              <ArrowDown className="h-6 w-6 text-gray-400" />
            </div>

            {/* Output Phase */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
              <Card className="bg-orange-50 border-orange-200">
                <CardContent className="p-3 text-center">
                  <FileText className="h-6 w-6 text-orange-600 mx-auto mb-1" />
                  <p className="text-xs font-medium">Doctor Notes</p>
                  <p className="text-xs text-gray-600">Clinical summary</p>
                </CardContent>
              </Card>
              
              <Card className="bg-pink-50 border-pink-200">
                <CardContent className="p-3 text-center">
                  <Heart className="h-6 w-6 text-pink-600 mx-auto mb-1" />
                  <p className="text-xs font-medium">Patient Report</p>
                  <p className="text-xs text-gray-600">Shareable summary</p>
                </CardContent>
              </Card>
              
              <Card className="bg-cyan-50 border-cyan-200">
                <CardContent className="p-3 text-center">
                  <Users className="h-6 w-6 text-cyan-600 mx-auto mb-1" />
                  <p className="text-xs font-medium">Multi-role Summaries</p>
                  <p className="text-xs text-gray-600">Staff efficiency</p>
                </CardContent>
              </Card>
              
              <Card className="bg-indigo-50 border-indigo-200">
                <CardContent className="p-3 text-center">
                  <QrCode className="h-6 w-6 text-indigo-600 mx-auto mb-1" />
                  <p className="text-xs font-medium">QR Summary</p>
                  <p className="text-xs text-gray-600">Mobile access</p>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      )
    },
    {
      id: 'winning-features',
      title: 'Why Our Features Win',
      subtitle: 'Strategic advantages across trust, efficiency, and care quality',
      content: (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            
            {/* Trust & Transparency */}
            <Card className="border-green-200 bg-green-50">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2 text-green-700">
                  <Shield className="h-5 w-5" />
                  <span>Trust & Transparency</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="bg-white p-3 rounded">
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-medium text-sm">Shareable Summaries</span>
                    <Share2 className="h-4 w-4 text-green-600" />
                  </div>
                  <p className="text-xs text-gray-600">Fosters patient loyalty through transparent communication</p>
                  <Badge className="text-xs bg-green-100 text-green-700">Patient Empowerment</Badge>
                </div>
              </CardContent>
            </Card>

            {/* Continuity of Care */}
            <Card className="border-blue-200 bg-blue-50">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2 text-blue-700">
                  <UserCheck className="h-5 w-5" />
                  <span>Continuity of Care</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="bg-white p-3 rounded">
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-medium text-sm">Voice Memory + Profile</span>
                    <Volume2 className="h-4 w-4 text-blue-600" />
                  </div>
                  <p className="text-xs text-gray-600">Personalized, context-aware consultations</p>
                  <Badge className="text-xs bg-blue-100 text-blue-700">Smart Recognition</Badge>
                </div>
              </CardContent>
            </Card>

            {/* Efficiency */}
            <Card className="border-purple-200 bg-purple-50">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2 text-purple-700">
                  <Clock className="h-5 w-5" />
                  <span>Operational Efficiency</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="bg-white p-3 rounded">
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-medium text-sm">Multi-role Summaries</span>
                    <Users className="h-4 w-4 text-purple-600" />
                  </div>
                  <p className="text-xs text-gray-600">Saves staff time across departments</p>
                  <Badge className="text-xs bg-purple-100 text-purple-700">Time Multiplier</Badge>
                </div>
              </CardContent>
            </Card>

            {/* Communication Quality */}
            <Card className="border-orange-200 bg-orange-50">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2 text-orange-700">
                  <BarChart3 className="h-5 w-5" />
                  <span>Communication Quality</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="bg-white p-3 rounded">
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-medium text-sm">Conversation Clarity Index</span>
                    <TrendingUp className="h-4 w-4 text-orange-600" />
                  </div>
                  <p className="text-xs text-gray-600">Improves care delivery through quality metrics</p>
                  <Badge className="text-xs bg-orange-100 text-orange-700">Quality Analytics</Badge>
                </div>
              </CardContent>
            </Card>

            {/* Empathy + EQ */}
            <Card className="border-pink-200 bg-pink-50">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2 text-pink-700">
                  <Heart className="h-5 w-5" />
                  <span>Empathy + EQ</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="bg-white p-3 rounded">
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-medium text-sm">Mood Tagging & Empathy Score</span>
                    <Smile className="h-4 w-4 text-pink-600" />
                  </div>
                  <p className="text-xs text-gray-600">Encourages mindful, compassionate care</p>
                  <Badge className="text-xs bg-pink-100 text-pink-700">Emotional Intelligence</Badge>
                </div>
              </CardContent>
            </Card>

            {/* Offline Support */}
            <Card className="border-cyan-200 bg-cyan-50">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2 text-cyan-700">
                  <Wifi className="h-5 w-5" />
                  <span>Offline Support</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="bg-white p-3 rounded">
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-medium text-sm">QR-based Patient Recap</span>
                    <QrCode className="h-4 w-4 text-cyan-600" />
                  </div>
                  <p className="text-xs text-gray-600">Perfect for low-connectivity environments</p>
                  <Badge className="text-xs bg-cyan-100 text-cyan-700">Universal Access</Badge>
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="bg-gradient-to-r from-yellow-100 to-orange-100 p-4 rounded-lg">
            <h3 className="text-center font-bold text-gray-800 mb-3">Additional Winning Features</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex items-center space-x-3">
                <Stethoscope className="h-6 w-6 text-blue-600" />
                <div>
                  <p className="font-medium text-sm">Voice-Commanded Template Injection</p>
                  <p className="text-xs text-gray-600">Huge time-saver for routine documentation</p>
                </div>
              </div>
              <div className="flex items-center space-x-3">
                <Globe className="h-6 w-6 text-green-600" />
                <div>
                  <p className="font-medium text-sm">Global Template Library</p>
                  <p className="text-xs text-gray-600">Standardized care protocols worldwide</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )
    },
    {
      id: 'unique-features',
      title: 'Our Unique Competitive Advantages',
      subtitle: 'Features that set us apart from the competition',
      content: (
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card className="border-purple-200 bg-purple-50">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Brain className="h-5 w-5 text-purple-600" />
                  <span>Patient Voice Profile & Recall</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-gray-700 mb-2">
                  Recognizes returning patients and recalls conversation history
                </p>
                <Badge variant="outline" className="text-xs">🔄 Continuity of Care</Badge>
              </CardContent>
            </Card>

            <Card className="border-green-200 bg-green-50">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <TrendingUp className="h-5 w-5 text-green-600" />
                  <span>Live Conversation Quality Analysis</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-gray-700 mb-2">
                  Real-time clarity, empathy, and completeness scoring
                </p>
                <Badge variant="outline" className="text-xs">📊 Communication Intelligence</Badge>
              </CardContent>
            </Card>

            <Card className="border-blue-200 bg-blue-50">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <QrCode className="h-5 w-5 text-blue-600" />
                  <span>QR-Based Patient Summaries</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-gray-700 mb-2">
                  Instant shareable summaries with offline access
                </p>
                <Badge variant="outline" className="text-xs">📱 Digital Bridge</Badge>
              </CardContent>
            </Card>

            <Card className="border-orange-200 bg-orange-50">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Globe className="h-5 w-5 text-orange-600" />
                  <span>Multilingual Family Support</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-gray-700 mb-2">
                  Dual-language transcription for diverse households
                </p>
                <Badge variant="outline" className="text-xs">🌐 Global Accessibility</Badge>
              </CardContent>
            </Card>
          </div>
        </div>
      )
    },
    {
      id: 'features-demo',
      title: 'Feature Demonstration',
      subtitle: 'See our AI assistant in action',
      content: (
        <div className="space-y-6">
          <div className="bg-gradient-to-r from-blue-500 to-green-500 text-white p-6 rounded-lg">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-semibold">Live Demo Session</h3>
              <Badge className="bg-white/20 text-white">
                <div className="w-2 h-2 bg-green-400 rounded-full mr-2 animate-pulse"></div>
                INTELLIGENT AI
              </Badge>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-white/10 p-4 rounded">
                <Mic className="h-8 w-8 mb-2" />
                <p className="text-sm">Real-time Speech Recognition</p>
                <p className="text-xs opacity-80">English, Hindi, Odia support</p>
              </div>
              <div className="bg-white/10 p-4 rounded">
                <Brain className="h-8 w-8 mb-2" />
                <p className="text-sm">Medical Entity Extraction</p>
                <p className="text-xs opacity-80">Symptoms, medications, conditions</p>
              </div>
              <div className="bg-white/10 p-4 rounded">
                <FileText className="h-8 w-8 mb-2" />
                <p className="text-sm">AI-Generated Insights</p>
                <p className="text-xs opacity-80">Comprehensive analysis reports</p>
              </div>
            </div>
          </div>
          
          <div className="text-center">
            <Button 
              size="lg" 
              className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700"
              onClick={() => window.location.href = '/consultation'}
            >
              <Rocket className="h-5 w-5 mr-2" />
              Start Live Demo
            </Button>
          </div>
        </div>
      )
    },
    {
      id: 'benefits',
      title: 'Transformative Benefits',
      subtitle: 'Impact across the healthcare ecosystem',
      content: (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card className="border-blue-200 bg-blue-50">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2 text-blue-700">
                  <Users className="h-5 w-5" />
                  <span>For Doctors</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <div className="flex items-center space-x-2">
                  <Check className="h-4 w-4 text-green-500" />
                  <span className="text-sm">60% less documentation time</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Check className="h-4 w-4 text-green-500" />
                  <span className="text-sm">More patient eye contact</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Check className="h-4 w-4 text-green-500" />
                  <span className="text-sm">Improved diagnostic accuracy</span>
                </div>
              </CardContent>
            </Card>

            <Card className="border-green-200 bg-green-50">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2 text-green-700">
                  <Heart className="h-5 w-5" />
                  <span>For Patients</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <div className="flex items-center space-x-2">
                  <Check className="h-4 w-4 text-green-500" />
                  <span className="text-sm">Better understanding</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Check className="h-4 w-4 text-green-500" />
                  <span className="text-sm">Language support</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Check className="h-4 w-4 text-green-500" />
                  <span className="text-sm">Shareable summaries</span>
                </div>
              </CardContent>
            </Card>

            <Card className="border-purple-200 bg-purple-50">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2 text-purple-700">
                  <Target className="h-5 w-5" />
                  <span>For Healthcare Orgs</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <div className="flex items-center space-x-2">
                  <Check className="h-4 w-4 text-green-500" />
                  <span className="text-sm">Consistent documentation</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Check className="h-4 w-4 text-green-500" />
                  <span className="text-sm">Operational efficiency</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Check className="h-4 w-4 text-green-500" />
                  <span className="text-sm">Quality metrics</span>
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="bg-gradient-to-r from-green-100 to-blue-100 p-6 rounded-lg">
            <div className="text-center">
              <h3 className="text-2xl font-bold text-gray-800 mb-2">ROI Impact</h3>
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <div className="text-3xl font-bold text-green-600">40%</div>
                  <p className="text-sm text-gray-600">Faster Consultations</p>
                </div>
                <div>
                  <div className="text-3xl font-bold text-blue-600">85%</div>
                  <p className="text-sm text-gray-600">Documentation Accuracy</p>
                </div>
                <div>
                  <div className="text-3xl font-bold text-purple-600">92%</div>
                  <p className="text-sm text-gray-600">Patient Satisfaction</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )
    },
    {
      id: 'competitive-edge',
      title: 'Why We Win Against Competition',
      subtitle: 'Our differentiated approach to healthcare AI',
      content: (
        <div className="space-y-6">
          <div className="bg-gradient-to-r from-yellow-100 to-orange-100 p-6 rounded-lg">
            <h3 className="text-xl font-bold text-gray-800 mb-4 flex items-center">
              <Lightbulb className="h-6 w-6 mr-2 text-yellow-600" />
              Unique Value Propositions
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-3">
                <div className="flex items-start space-x-3">
                  <div className="w-2 h-2 bg-green-500 rounded-full mt-2"></div>
                  <div>
                    <p className="font-medium">Emotional Intelligence</p>
                    <p className="text-sm text-gray-600">Only solution tracking empathy & conversation quality</p>
                  </div>
                </div>
                <div className="flex items-start space-x-3">
                  <div className="w-2 h-2 bg-blue-500 rounded-full mt-2"></div>
                  <div>
                    <p className="font-medium">Patient Memory</p>
                    <p className="text-sm text-gray-600">Contextual awareness across multiple visits</p>
                  </div>
                </div>
              </div>
              <div className="space-y-3">
                <div className="flex items-start space-x-3">
                  <div className="w-2 h-2 bg-purple-500 rounded-full mt-2"></div>
                  <div>
                    <p className="font-medium">Multilingual Families</p>
                    <p className="text-sm text-gray-600">Dual-language support for complex households</p>
                  </div>
                </div>
                <div className="flex items-start space-x-3">
                  <div className="w-2 h-2 bg-orange-500 rounded-full mt-2"></div>
                  <div>
                    <p className="font-medium">Offline QR Summaries</p>
                    <p className="text-sm text-gray-600">Works in low-connectivity environments</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card className="border-red-200 bg-red-50">
              <CardHeader>
                <CardTitle className="text-red-700">Competitors</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <p className="text-sm">❌ Basic transcription only</p>
                <p className="text-sm">❌ English-only support</p>
                <p className="text-sm">❌ No patient continuity</p>
                <p className="text-sm">❌ Limited empathy analysis</p>
              </CardContent>
            </Card>

            <Card className="border-green-200 bg-green-50">
              <CardHeader>
                <CardTitle className="text-green-700">Our Solution</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <p className="text-sm">✅ Intelligent medical analysis</p>
                <p className="text-sm">✅ Multilingual family support</p>
                <p className="text-sm">✅ Patient voice memory</p>
                <p className="text-sm">✅ Real-time quality metrics</p>
              </CardContent>
            </Card>
          </div>
        </div>
      )
    },
    {
      id: 'roadmap',
      title: 'Product Roadmap & Vision',
      subtitle: 'Building the future of healthcare AI',
      content: (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card className="border-blue-200 bg-blue-50">
              <CardHeader>
                <CardTitle className="text-blue-700">Phase 1: Foundation</CardTitle>
                <Badge className="w-fit">Q1 2025</Badge>
              </CardHeader>
              <CardContent className="space-y-2">
                <p className="text-sm">✅ Core speech recognition</p>
                <p className="text-sm">✅ Medical entity extraction</p>
                <p className="text-sm">✅ Basic multilingual support</p>
                <p className="text-sm">🔄 Patient profiles</p>
              </CardContent>
            </Card>

            <Card className="border-green-200 bg-green-50">
              <CardHeader>
                <CardTitle className="text-green-700">Phase 2: Intelligence</CardTitle>
                <Badge className="w-fit">Q2-Q3 2025</Badge>
              </CardHeader>
              <CardContent className="space-y-2">
                <p className="text-sm">📋 Advanced template library</p>
                <p className="text-sm">🧠 Enhanced AI diagnostics</p>
                <p className="text-sm">📊 Quality analytics dashboard</p>
                <p className="text-sm">🔗 EHR integrations</p>
              </CardContent>
            </Card>

            <Card className="border-purple-200 bg-purple-50">
              <CardHeader>
                <CardTitle className="text-purple-700">Phase 3: Expansion</CardTitle>
                <Badge className="w-fit">Q4 2025+</Badge>
              </CardHeader>
              <CardContent className="space-y-2">
                <p className="text-sm">📱 Mobile applications</p>
                <p className="text-sm">🌍 10+ language support</p>
                <p className="text-sm">🤖 Predictive health insights</p>
                <p className="text-sm">🏥 Enterprise solutions</p>
              </CardContent>
            </Card>
          </div>

          <div className="bg-gradient-to-r from-purple-100 to-blue-100 p-6 rounded-lg">
            <div className="text-center">
              <h3 className="text-2xl font-bold text-gray-800 mb-4">Vision Statement</h3>
              <p className="text-lg text-gray-700 italic">
                "To democratize high-quality healthcare documentation and analysis, 
                breaking down language barriers and enhancing the human connection 
                between doctors and patients worldwide."
              </p>
            </div>
          </div>
        </div>
      )
    },
    {
      id: 'next-steps',
      title: 'Partnership & Next Steps',
      subtitle: 'Ready to transform healthcare together',
      content: (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card className="border-green-200 bg-green-50">
              <CardHeader>
                <CardTitle className="text-green-700">Pilot Program Proposal</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center space-x-2">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  <span className="text-sm">3-month pilot with 5-10 clinicians</span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  <span className="text-sm">Custom training & onboarding</span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  <span className="text-sm">Performance metrics & ROI tracking</span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  <span className="text-sm">Dedicated support team</span>
                </div>
              </CardContent>
            </Card>

            <Card className="border-blue-200 bg-blue-50">
              <CardHeader>
                <CardTitle className="text-blue-700">Investment Opportunity</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="text-center mb-4">
                  <div className="text-2xl font-bold text-blue-600">$500K - $2M</div>
                  <p className="text-sm text-gray-600">Seed/Series A Round</p>
                </div>
                <div className="space-y-2">
                  <p className="text-sm">🎯 Market expansion</p>
                  <p className="text-sm">👥 Team scaling</p>
                  <p className="text-sm">🔬 R&D acceleration</p>
                  <p className="text-sm">🏥 Enterprise partnerships</p>
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="bg-gradient-to-r from-blue-600 to-green-600 text-white p-8 rounded-lg text-center">
            <h3 className="text-2xl font-bold mb-4">Ready to Get Started?</h3>
            <p className="text-lg opacity-90 mb-6">
              Join us in revolutionizing healthcare documentation and patient care
            </p>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Button 
                className="bg-white text-blue-600 hover:bg-gray-100"
                onClick={() => window.location.href = '/consultation'}
              >
                <Rocket className="h-4 w-4 mr-2" />
                Schedule Live Demo
              </Button>
              <Button 
                className="bg-white/20 text-white hover:bg-white/30"
                onClick={() => window.location.href = '/reports'}
              >
                <FileText className="h-4 w-4 mr-2" />
                View Sample Reports
              </Button>
              <Button 
                className="bg-white/20 text-white hover:bg-white/30"
                onClick={() => window.open('mailto:contact@medical-ai.demo')}
              >
                <Users className="h-4 w-4 mr-2" />
                Contact Team
              </Button>
            </div>
          </div>
        </div>
      )
    }
  ];

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % slides.length);
  };

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + slides.length) % slides.length);
  };

  const goToSlide = (index: number) => {
    setCurrentSlide(index);
  };

  const currentSlideData = slides[currentSlide];

  return (
    <div className="max-w-7xl mx-auto p-6 space-y-6">
      {/* Presentation Header */}
      <div className="bg-gradient-to-r from-blue-600 to-green-600 text-white p-6 rounded-lg">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Stakeholder Presentation</h1>
            <p className="opacity-90">ClinIQ</p>
          </div>
          <div className="text-right">
            <div className="text-sm opacity-75">Slide {currentSlide + 1} of {slides.length}</div>
            <Badge className="bg-white/20 text-white mt-1">
              <span>Interactive Presentation Mode</span>
            </Badge>
          </div>
        </div>
      </div>

      {/* Slide Navigation */}
      <div className="flex justify-center space-x-2">
        {slides.map((_, index) => (
          <Button
            key={index}
            variant={index === currentSlide ? "default" : "outline"}
            size="sm"
            className="w-3 h-3 p-0 rounded-full"
            onClick={() => goToSlide(index)}
          />
        ))}
      </div>

      {/* Main Slide Content */}
      <Card className="min-h-[600px] border-2">
        <CardHeader className="text-center pb-4">
          <CardTitle className="text-2xl font-bold text-gray-800">
            {currentSlideData.title}
          </CardTitle>
          <p className="text-gray-600 text-lg">{currentSlideData.subtitle}</p>
        </CardHeader>
        <CardContent className="px-8 pb-8">
          {currentSlideData.content}
        </CardContent>
      </Card>

      {/* Navigation Controls */}
      <div className="flex justify-between items-center">
        <Button
          onClick={prevSlide}
          disabled={currentSlide === 0}
          className="flex items-center space-x-2"
          variant="outline"
        >
          <ChevronLeft className="h-4 w-4" />
          <span>Previous</span>
        </Button>

        <div className="flex space-x-2">
          <Button
            onClick={() => window.location.href = '/'}
            variant="outline"
          >
            Back to Dashboard
          </Button>
          <Button
            onClick={() => window.location.href = '/consultation'}
            className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700"
          >
            <Rocket className="h-4 w-4 mr-2" />
            Try Live Demo
          </Button>
        </div>

        <Button
          onClick={nextSlide}
          disabled={currentSlide === slides.length - 1}
          className="flex items-center space-x-2"
          variant="outline"
        >
          <span>Next</span>
          <ChevronRight className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
};

export default PresentationMode;
