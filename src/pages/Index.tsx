
import React, { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/components/ui/use-toast';
import StudentForm from '@/components/StudentForm';
import StudentList from '@/components/StudentList';
import AnalyticsDashboard from '@/components/AnalyticsDashboard';
import BatchImport from '@/components/BatchImport';
import VoiceAssistant from '@/components/VoiceAssistant';
import { 
  Users, 
  GraduationCap, 
  TrendingUp, 
  Award, 
  Search,
  Plus,
  Upload,
  BarChart3,
  BookOpen,
  Target,
  Star,
  UserCheck
} from 'lucide-react';
import { Link } from 'react-router-dom';

const Index = () => {
  const [activeTab, setActiveTab] = useState('overview');
  const [searchTerm, setSearchTerm] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [showVoiceAssistant, setShowVoiceAssistant] = useState(false);
  const [editingStudent, setEditingStudent] = useState(null);
  const { toast } = useToast();

  // Animation states
  const [animateCards, setAnimateCards] = useState(false);

  useEffect(() => {
    setTimeout(() => setAnimateCards(true), 100);
  }, []);

  const { data: students, isLoading, refetch } = useQuery({
    queryKey: ['students'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('students')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data;
    },
  });

  const { data: analytics } = useQuery({
    queryKey: ['analytics'],
    queryFn: async () => {
      if (!students?.length) return null;
      
      const totalStudents = students.length;
      const averageGrade = students.reduce((acc, student) => acc + student.grade, 0) / totalStudents;
      const topPerformers = students.filter(student => student.grade >= 85).length;
      const needsImprovement = students.filter(student => student.grade < 70).length;
      
      return {
        totalStudents,
        averageGrade: Math.round(averageGrade * 10) / 10,
        topPerformers,
        needsImprovement
      };
    },
    enabled: !!students?.length
  });

  // Filter students based on search term
  const filteredStudents = students?.filter(student =>
    student.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    student.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    student.course.toLowerCase().includes(searchTerm.toLowerCase())
  ) || [];

  const handleStudentsImported = async (importedStudents) => {
    // Refresh the students list after import
    await refetch();
    toast({
      title: "Students Imported",
      description: `Successfully imported ${importedStudents.length} students.`,
    });
  };

  const handleEditStudent = (student) => {
    setEditingStudent(student);
    setShowForm(true);
  };

  const handleDeleteStudent = async (id) => {
    try {
      const { error } = await supabase
        .from('students')
        .delete()
        .eq('id', id);

      if (error) throw error;

      await refetch();
      toast({
        title: "Student Deleted",
        description: "Student has been successfully deleted.",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete student.",
        variant: "destructive"
      });
    }
  };

  const handleFormSuccess = async () => {
    setShowForm(false);
    setEditingStudent(null);
    await refetch();
  };

  const handleFormClose = () => {
    setShowForm(false);
    setEditingStudent(null);
  };

  const statsCards = [
    {
      title: "Total Students",
      value: analytics?.totalStudents || 0,
      icon: Users,
      color: "bg-gradient-to-br from-blue-500 to-blue-600",
      textColor: "text-blue-600",
      bgColor: "bg-blue-50",
      description: "Active enrollments"
    },
    {
      title: "Average Grade",
      value: `${analytics?.averageGrade || 0}%`,
      icon: TrendingUp,
      color: "bg-gradient-to-br from-emerald-500 to-emerald-600",
      textColor: "text-emerald-600",
      bgColor: "bg-emerald-50",
      description: "Overall performance"
    },
    {
      title: "Top Performers",
      value: analytics?.topPerformers || 0,
      icon: Award,
      color: "bg-gradient-to-br from-amber-500 to-amber-600",
      textColor: "text-amber-600",
      bgColor: "bg-amber-50",
      description: "Grade ≥ 85%"
    },
    {
      title: "Need Support",
      value: analytics?.needsImprovement || 0,
      icon: Target,
      color: "bg-gradient-to-br from-red-500 to-red-600",
      textColor: "text-red-600",
      bgColor: "bg-red-50",
      description: "Grade < 70%"
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      <div className="container mx-auto p-6 space-y-8 max-w-7xl">
        {/* Header Section */}
        <div className={`text-center space-y-4 transform transition-all duration-700 ${animateCards ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'}`}>
          <div className="flex items-center justify-center space-x-3 mb-4">
            <div className="h-12 w-12 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center shadow-lg">
              <GraduationCap className="h-6 w-6 text-white" />
            </div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
              Student Management System
            </h1>
          </div>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Comprehensive platform for managing student records, tracking performance, and generating insights
          </p>
        </div>

        {/* Quick Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {statsCards.map((stat, index) => (
            <Card 
              key={stat.title} 
              className={`border-0 shadow-md hover:shadow-xl transition-all duration-300 hover:scale-105 ${stat.bgColor} transform ${animateCards ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'}`}
              style={{ transitionDelay: `${index * 100}ms` }}
            >
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground mb-2">{stat.title}</p>
                    <p className={`text-3xl font-bold ${stat.textColor}`}>{stat.value}</p>
                    <p className="text-xs text-muted-foreground mt-1">{stat.description}</p>
                  </div>
                  <div className={`h-12 w-12 rounded-full ${stat.color} flex items-center justify-center shadow-md`}>
                    <stat.icon className="h-6 w-6 text-white" />
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Main Content */}
        <Card className="border-0 shadow-xl bg-white/80 backdrop-blur-sm">
          <CardHeader className="pb-4 border-b bg-gradient-to-r from-indigo-50 to-purple-50">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between space-y-4 md:space-y-0">
              <div>
                <CardTitle className="text-2xl font-bold text-gray-900">Management Dashboard</CardTitle>
                <CardDescription className="text-gray-600">
                  Manage students, view analytics, and generate reports
                </CardDescription>
              </div>
              <div className="flex flex-wrap gap-3">
                <Link to="/performance-report">
                  <Button variant="outline" className="bg-white/80 hover:bg-white border-indigo-200 hover:border-indigo-300">
                    <BarChart3 className="h-4 w-4 mr-2" />
                    Performance Reports
                  </Button>
                </Link>
                <Button 
                  variant="outline" 
                  onClick={() => setShowVoiceAssistant(true)}
                  className="bg-white/80 hover:bg-white border-indigo-200 hover:border-indigo-300"
                >
                  Voice Assistant
                </Button>
              </div>
            </div>
          </CardHeader>
          
          <CardContent className="p-6">
            <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
              <TabsList className="grid grid-cols-4 lg:w-max bg-gray-100/80 h-12">
                <TabsTrigger value="overview" className="flex items-center space-x-2 data-[state=active]:bg-white data-[state=active]:shadow-sm">
                  <BookOpen className="h-4 w-4" />
                  <span className="hidden sm:inline">Overview</span>
                </TabsTrigger>
                <TabsTrigger value="students" className="flex items-center space-x-2 data-[state=active]:bg-white data-[state=active]:shadow-sm">
                  <UserCheck className="h-4 w-4" />
                  <span className="hidden sm:inline">Students</span>
                </TabsTrigger>
                <TabsTrigger value="analytics" className="flex items-center space-x-2 data-[state=active]:bg-white data-[state=active]:shadow-sm">
                  <BarChart3 className="h-4 w-4" />
                  <span className="hidden sm:inline">Analytics</span>
                </TabsTrigger>
                <TabsTrigger value="import" className="flex items-center space-x-2 data-[state=active]:bg-white data-[state=active]:shadow-sm">
                  <Upload className="h-4 w-4" />
                  <span className="hidden sm:inline">Import</span>
                </TabsTrigger>
              </TabsList>

              <TabsContent value="overview" className="space-y-6">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <Card className="border border-gray-200 shadow-sm hover:shadow-md transition-shadow">
                    <CardHeader className="pb-3">
                      <CardTitle className="text-lg flex items-center space-x-2">
                        <Plus className="h-5 w-5 text-indigo-600" />
                        <span>Quick Actions</span>
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <Button 
                        onClick={() => setShowForm(true)} 
                        className="w-full justify-start bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700"
                      >
                        <Plus className="h-4 w-4 mr-2" />
                        Add New Student
                      </Button>
                      <Button 
                        variant="outline" 
                        className="w-full justify-start border-gray-200 hover:bg-gray-50"
                        onClick={() => setActiveTab('import')}
                      >
                        <Upload className="h-4 w-4 mr-2" />
                        Import Students
                      </Button>
                      <Link to="/performance-report">
                        <Button variant="outline" className="w-full justify-start border-gray-200 hover:bg-gray-50">
                          <BarChart3 className="h-4 w-4 mr-2" />
                          Generate Report
                        </Button>
                      </Link>
                    </CardContent>
                  </Card>

                  <Card className="border border-gray-200 shadow-sm hover:shadow-md transition-shadow">
                    <CardHeader className="pb-3">
                      <CardTitle className="text-lg flex items-center space-x-2">
                        <Star className="h-5 w-5 text-amber-600" />
                        <span>Recent Activity</span>
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        {students?.slice(0, 3).map((student, index) => (
                          <div key={student.id} className="flex items-center space-x-3 p-3 rounded-lg bg-gray-50">
                            <div className="h-10 w-10 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white font-semibold text-sm">
                              {student.name.charAt(0)}
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="font-medium text-gray-900 truncate">{student.name}</p>
                              <p className="text-sm text-gray-500">{student.email}</p>
                            </div>
                            <Badge variant={student.grade >= 80 ? "default" : student.grade >= 70 ? "secondary" : "destructive"}>
                              {student.grade}%
                            </Badge>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </TabsContent>

              <TabsContent value="students" className="space-y-4">
                <div className="flex flex-col sm:flex-row gap-4 items-center">
                  <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                    <Input
                      placeholder="Search students by name, email, or course..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10 bg-white border-gray-200 focus:border-indigo-300 focus:ring-indigo-200"
                    />
                  </div>
                  <Button 
                    onClick={() => setShowForm(true)}
                    className="bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700"
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Add Student
                  </Button>
                </div>
                
                <div className="bg-white rounded-lg border border-gray-200 shadow-sm">
                  <StudentList 
                    students={filteredStudents}
                    onEditStudent={handleEditStudent}
                    onDeleteStudent={handleDeleteStudent}
                  />
                </div>
              </TabsContent>

              <TabsContent value="analytics">
                <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-6">
                  <AnalyticsDashboard />
                </div>
              </TabsContent>

              <TabsContent value="import">
                <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-6">
                  <BatchImport onStudentsImported={handleStudentsImported} />
                </div>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>

        {/* Student Form Modal */}
        {showForm && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
              <div className="p-6 border-b bg-gradient-to-r from-indigo-50 to-purple-50">
                <h2 className="text-xl font-semibold text-gray-900">
                  {editingStudent ? 'Edit Student' : 'Add New Student'}
                </h2>
                <p className="text-gray-600 mt-1">Enter student information below</p>
              </div>
              <div className="p-6">
                <StudentForm 
                  open={showForm}
                  onClose={handleFormClose}
                  onSubmit={handleFormSuccess}
                  student={editingStudent}
                />
              </div>
            </div>
          </div>
        )}

        {/* Voice Assistant */}
        <VoiceAssistant 
          isOpen={showVoiceAssistant}
          onClose={() => setShowVoiceAssistant(false)}
        />
      </div>
    </div>
  );
};

export default Index;
