
import React, { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/integrations/supabase/client';
import PerformanceTrends from '@/components/PerformanceTrends';
import VoiceAssistant from '@/components/VoiceAssistant';
import { 
  TrendingUp, 
  Users, 
  Award, 
  AlertTriangle, 
  BarChart3,
  Target,
  Star,
  BookOpen,
  ArrowLeft,
  Brain,
  Loader2
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { useToast } from '@/components/ui/use-toast';

const PerformanceReport = () => {
  const [activeTab, setActiveTab] = useState('overview');
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [analysis, setAnalysis] = useState('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [animateCards, setAnimateCards] = useState(false);
  const [showVoiceAssistant, setShowVoiceAssistant] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    setTimeout(() => setAnimateCards(true), 100);
  }, []);

  const { data: students, isLoading } = useQuery({
    queryKey: ['students'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('students')
        .select('*')
        .order('grade', { ascending: false });
      
      if (error) throw error;
      return data;
    },
  });

  const topPerformers = students?.filter(student => student.grade >= 85) || [];
  const needsImprovement = students?.filter(student => student.grade < 70) || [];
  const averageGrade = students?.length ? 
    Math.round((students.reduce((acc, student) => acc + student.grade, 0) / students.length) * 10) / 10 : 0;

  const handleAnalyzeStudent = async (student) => {
    setSelectedStudent(student);
    setIsAnalyzing(true);
    setAnalysis('');
    
    try {
      const { data, error } = await supabase.functions.invoke('analyze-student', {
        body: { student }
      });
      
      if (error) throw error;
      
      if (data?.analysis) {
        setAnalysis(data.analysis);
      } else {
        throw new Error('No analysis returned');
      }
    } catch (error) {
      console.error('Analysis error:', error);
      toast({
        title: "Analysis Failed",
        description: error.message || "Could not analyze student. Please check your Gemini API key configuration.",
        variant: "destructive"
      });
      setAnalysis('Unable to generate analysis. Please ensure your Gemini API key is properly configured in Supabase secrets.');
    } finally {
      setIsAnalyzing(false);
    }
  };

  const performanceCards = [
    {
      title: "Average Grade",
      value: `${averageGrade}%`,
      icon: BarChart3,
      color: "bg-gradient-to-br from-blue-500 to-blue-600",
      bgColor: "bg-blue-50",
      textColor: "text-blue-600",
      description: "Class average performance"
    },
    {
      title: "Top Performers",
      value: topPerformers.length,
      icon: Award,
      color: "bg-gradient-to-br from-emerald-500 to-emerald-600",
      bgColor: "bg-emerald-50",
      textColor: "text-emerald-600",
      description: "Students with 85%+ grades"
    },
    {
      title: "Need Support",
      value: needsImprovement.length,
      icon: AlertTriangle,
      color: "bg-gradient-to-br from-amber-500 to-amber-600",
      bgColor: "bg-amber-50",
      textColor: "text-amber-600",
      description: "Students below 70%"
    },
    {
      title: "Total Students",
      value: students?.length || 0,
      icon: Users,
      color: "bg-gradient-to-br from-purple-500 to-purple-600",
      bgColor: "bg-purple-50",
      textColor: "text-purple-600",
      description: "Total enrolled students"
    }
  ];

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 flex items-center justify-center">
        <div className="text-center space-y-4">
          <Loader2 className="h-12 w-12 animate-spin text-indigo-600 mx-auto" />
          <p className="text-lg text-gray-600">Loading performance data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      <div className="container mx-auto p-6 space-y-8 max-w-7xl">
        {/* Header */}
        <div className={`space-y-6 transform transition-all duration-700 ${animateCards ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'}`}>
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Link to="/">
                <Button variant="outline" size="sm" className="bg-white/80 hover:bg-white border-gray-200">
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Back to Dashboard
                </Button>
              </Link>
            </div>
            <Button 
              variant="outline" 
              onClick={() => setShowVoiceAssistant(true)}
              className="bg-white/80 hover:bg-white border-indigo-200 hover:border-indigo-300"
            >
              Voice Assistant
            </Button>
          </div>

          <div className="text-center space-y-4">
            <div className="flex items-center justify-center space-x-3">
              <div className="h-12 w-12 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center shadow-lg">
                <TrendingUp className="h-6 w-6 text-white" />
              </div>
              <h1 className="text-4xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
                Performance Analytics
              </h1>
            </div>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Comprehensive performance insights and AI-powered student analysis
            </p>
          </div>
        </div>

        {/* Performance Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {performanceCards.map((card, index) => (
            <Card 
              key={card.title}
              className={`border-0 shadow-md hover:shadow-xl transition-all duration-300 hover:scale-105 ${card.bgColor} transform ${animateCards ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'}`}
              style={{ transitionDelay: `${index * 100}ms` }}
            >
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground mb-2">{card.title}</p>
                    <p className={`text-3xl font-bold ${card.textColor}`}>{card.value}</p>
                    <p className="text-xs text-muted-foreground mt-1">{card.description}</p>
                  </div>
                  <div className={`h-12 w-12 rounded-full ${card.color} flex items-center justify-center shadow-md`}>
                    <card.icon className="h-6 w-6 text-white" />
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Main Content */}
        <Card className="border-0 shadow-xl bg-white/80 backdrop-blur-sm">
          <CardHeader className="pb-4 border-b bg-gradient-to-r from-indigo-50 to-purple-50">
            <CardTitle className="text-2xl font-bold text-gray-900 flex items-center space-x-2">
              <BarChart3 className="h-6 w-6 text-indigo-600" />
              <span>Detailed Analytics</span>
            </CardTitle>
            <CardDescription className="text-gray-600">
              In-depth performance analysis and student insights
            </CardDescription>
          </CardHeader>
          
          <CardContent className="p-6">
            <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
              <TabsList className="grid grid-cols-4 lg:w-max bg-gray-100/80 h-12">
                <TabsTrigger value="overview" className="flex items-center space-x-2 data-[state=active]:bg-white data-[state=active]:shadow-sm">
                  <BookOpen className="h-4 w-4" />
                  <span className="hidden sm:inline">Trends</span>
                </TabsTrigger>
                <TabsTrigger value="top-performers" className="flex items-center space-x-2 data-[state=active]:bg-white data-[state=active]:shadow-sm">
                  <Star className="h-4 w-4" />
                  <span className="hidden sm:inline">Top Performers</span>
                </TabsTrigger>
                <TabsTrigger value="needs-improvement" className="flex items-center space-x-2 data-[state=active]:bg-white data-[state=active]:shadow-sm">
                  <Target className="h-4 w-4" />
                  <span className="hidden sm:inline">Need Support</span>
                </TabsTrigger>
                <TabsTrigger value="analysis" className="flex items-center space-x-2 data-[state=active]:bg-white data-[state=active]:shadow-sm">
                  <Brain className="h-4 w-4" />
                  <span className="hidden sm:inline">AI Analysis</span>
                </TabsTrigger>
              </TabsList>

              <TabsContent value="overview">
                <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-6">
                  <PerformanceTrends />
                </div>
              </TabsContent>

              <TabsContent value="top-performers" className="space-y-4">
                <Card className="border border-gray-200 shadow-sm">
                  <CardHeader className="pb-4">
                    <CardTitle className="text-lg flex items-center space-x-2">
                      <Award className="h-5 w-5 text-emerald-600" />
                      <span>Top Performing Students</span>
                      <Badge variant="secondary" className="bg-emerald-100 text-emerald-700">
                        {topPerformers.length} students
                      </Badge>
                    </CardTitle>
                    <CardDescription>Students achieving 85% or higher grades</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="grid gap-4">
                      {topPerformers.map((student, index) => (
                        <div key={student.id} className="flex items-center justify-between p-4 bg-emerald-50 rounded-lg border border-emerald-200">
                          <div className="flex items-center space-x-4">
                            <div className="h-12 w-12 rounded-full bg-gradient-to-br from-emerald-500 to-emerald-600 flex items-center justify-center text-white font-bold">
                              #{index + 1}
                            </div>
                            <div>
                              <h3 className="font-semibold text-gray-900">{student.name}</h3>
                              <p className="text-sm text-gray-600">{student.email}</p>
                              <p className="text-sm font-medium text-emerald-700">{student.course}</p>
                            </div>
                          </div>
                          <div className="text-right space-y-2">
                            <Badge className="bg-emerald-600 text-white">
                              {student.grade}%
                            </Badge>
                            <Button 
                              size="sm" 
                              variant="outline"
                              onClick={() => handleAnalyzeStudent(student)}
                              className="ml-2 border-emerald-200 hover:bg-emerald-50"
                            >
                              <Brain className="h-3 w-3 mr-1" />
                              Analyze
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="needs-improvement" className="space-y-4">
                <Card className="border border-gray-200 shadow-sm">
                  <CardHeader className="pb-4">
                    <CardTitle className="text-lg flex items-center space-x-2">
                      <AlertTriangle className="h-5 w-5 text-amber-600" />
                      <span>Students Needing Support</span>
                      <Badge variant="secondary" className="bg-amber-100 text-amber-700">
                        {needsImprovement.length} students
                      </Badge>
                    </CardTitle>
                    <CardDescription>Students with grades below 70% who may need additional support</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="grid gap-4">
                      {needsImprovement.map((student) => (
                        <div key={student.id} className="flex items-center justify-between p-4 bg-amber-50 rounded-lg border border-amber-200">
                          <div className="flex items-center space-x-4">
                            <div className="h-12 w-12 rounded-full bg-gradient-to-br from-amber-500 to-amber-600 flex items-center justify-center text-white font-semibold text-sm">
                              {student.name.charAt(0)}
                            </div>
                            <div>
                              <h3 className="font-semibold text-gray-900">{student.name}</h3>
                              <p className="text-sm text-gray-600">{student.email}</p>
                              <p className="text-sm font-medium text-amber-700">{student.course}</p>
                            </div>
                          </div>
                          <div className="text-right space-y-2">
                            <Badge variant="destructive">
                              {student.grade}%
                            </Badge>
                            <Button 
                              size="sm" 
                              variant="outline"
                              onClick={() => handleAnalyzeStudent(student)}
                              className="ml-2 border-amber-200 hover:bg-amber-50"
                            >
                              <Brain className="h-3 w-3 mr-1" />
                              Analyze
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="analysis" className="space-y-4">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <Card className="border border-gray-200 shadow-sm">
                    <CardHeader className="pb-4">
                      <CardTitle className="text-lg flex items-center space-x-2">
                        <Brain className="h-5 w-5 text-indigo-600" />
                        <span>AI Student Analysis</span>
                      </CardTitle>
                      <CardDescription>Select a student to get AI-powered insights and recommendations</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="grid gap-3 max-h-96 overflow-y-auto">
                        {students?.map((student) => (
                          <div 
                            key={student.id} 
                            className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 cursor-pointer transition-colors"
                            onClick={() => handleAnalyzeStudent(student)}
                          >
                            <div className="flex items-center space-x-3">
                              <div className="h-10 w-10 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white font-semibold text-sm">
                                {student.name.charAt(0)}
                              </div>
                              <div>
                                <p className="font-medium text-gray-900">{student.name}</p>
                                <p className="text-sm text-gray-600">{student.course}</p>
                              </div>
                            </div>
                            <Badge variant={student.grade >= 80 ? "default" : student.grade >= 70 ? "secondary" : "destructive"}>
                              {student.grade}%
                            </Badge>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>

                  <Card className="border border-gray-200 shadow-sm">
                    <CardHeader className="pb-4">
                      <CardTitle className="text-lg">Analysis Results</CardTitle>
                      <CardDescription>
                        {selectedStudent ? `Analysis for ${selectedStudent.name}` : 'Select a student to view AI analysis'}
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      {isAnalyzing ? (
                        <div className="flex items-center justify-center py-12">
                          <div className="text-center space-y-4">
                            <Loader2 className="h-8 w-8 animate-spin text-indigo-600 mx-auto" />
                            <p className="text-gray-600">Generating AI analysis...</p>
                          </div>
                        </div>
                      ) : selectedStudent ? (
                        <div className="space-y-4">
                          <div className="flex items-center space-x-3 p-3 bg-indigo-50 rounded-lg">
                            <div className="h-12 w-12 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white font-semibold">
                              {selectedStudent.name.charAt(0)}
                            </div>
                            <div>
                              <h3 className="font-semibold text-gray-900">{selectedStudent.name}</h3>
                              <p className="text-sm text-gray-600">{selectedStudent.email}</p>
                              <div className="flex items-center space-x-2 mt-1">
                                <Badge>{selectedStudent.course}</Badge>
                                <Badge variant={selectedStudent.grade >= 80 ? "default" : selectedStudent.grade >= 70 ? "secondary" : "destructive"}>
                                  {selectedStudent.grade}%
                                </Badge>
                              </div>
                            </div>
                          </div>
                          
                          {analysis && (
                            <div className="bg-white border border-gray-200 rounded-lg p-4">
                              <h4 className="font-semibold text-gray-900 mb-3 flex items-center space-x-2">
                                <Brain className="h-4 w-4 text-indigo-600" />
                                <span>AI Analysis & Recommendations</span>
                              </h4>
                              <div className="prose prose-sm max-w-none text-gray-700">
                                {analysis.split('\n').map((paragraph, index) => (
                                  <p key={index} className="mb-2 last:mb-0">{paragraph}</p>
                                ))}
                              </div>
                            </div>
                          )}
                        </div>
                      ) : (
                        <div className="text-center py-12 text-gray-500">
                          <Brain className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                          <p>Select a student from the list to generate AI-powered analysis and recommendations</p>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </div>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>

        {/* Voice Assistant */}
        <VoiceAssistant 
          content={analysis}
          isOpen={showVoiceAssistant}
          onClose={() => setShowVoiceAssistant(false)}
        />
      </div>
    </div>
  );
};

export default PerformanceReport;
