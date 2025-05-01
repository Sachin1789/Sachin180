
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line, Legend } from 'recharts';
import { useToast } from "@/components/ui/use-toast";
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Download, RefreshCw } from 'lucide-react';

interface CourseDistribution {
  name: string;
  value: number;
  color: string;
}

interface GradeDistribution {
  grade: string;
  count: number;
}

interface PerformanceTrend {
  month: string;
  avgGrade: number;
  attendance: number;
}

const COLORS = ['#4f46e5', '#8b5cf6', '#a78bfa', '#c4b5fd', '#ddd6fe'];
const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'];

const AnalyticsDashboard: React.FC = () => {
  const [courseData, setCourseData] = useState<CourseDistribution[]>([]);
  const [gradeData, setGradeData] = useState<GradeDistribution[]>([]);
  const [totalStudents, setTotalStudents] = useState<number>(0);
  const [loading, setLoading] = useState<boolean>(true);
  const [refreshing, setRefreshing] = useState<boolean>(false);
  const [performanceTrends, setPerformanceTrends] = useState<PerformanceTrend[]>([]);
  const { toast } = useToast();

  const fetchAnalyticsData = async () => {
    try {
      setRefreshing(true);
      // Get total count
      const { count, error: countError } = await supabase
        .from('students')
        .select('*', { count: 'exact', head: true });
      
      if (countError) throw countError;
      setTotalStudents(count || 0);
      
      // Get course distribution
      const { data: coursesRaw, error: coursesError } = await supabase
        .from('students')
        .select('course');
        
      if (coursesError) throw coursesError;
      
      // Process course data
      const courseMap = new Map<string, number>();
      coursesRaw.forEach(item => {
        const count = courseMap.get(item.course) || 0;
        courseMap.set(item.course, count + 1);
      });
      
      const courseDistribution = Array.from(courseMap.entries())
        .map(([name, value], index) => ({
          name,
          value,
          color: COLORS[index % COLORS.length]
        }));
      
      setCourseData(courseDistribution);
      
      // Get grade distribution
      const { data: gradesRaw, error: gradesError } = await supabase
        .from('students')
        .select('grade');
        
      if (gradesError) throw gradesError;
      
      // Process grade data
      const gradeMap = new Map<string, number>();
      gradesRaw.forEach(item => {
        const count = gradeMap.get(String(item.grade)) || 0;
        gradeMap.set(String(item.grade), count + 1);
      });
      
      const gradeDistribution = Array.from(gradeMap.entries())
        .map(([grade, count]) => ({
          grade,
          count
        }))
        .sort((a, b) => a.grade.localeCompare(b.grade));
      
      setGradeData(gradeDistribution);

      // Generate mock performance trend data (would be from real data in a full app)
      const trendData: PerformanceTrend[] = MONTHS.map((month, index) => {
        // Simulate data that improves over time to show positive trends
        const baseGrade = 70 + Math.floor(Math.random() * 10);
        const upwardTrend = index * 2;
        return {
          month,
          avgGrade: Math.min(95, baseGrade + upwardTrend),
          attendance: 70 + Math.floor(Math.random() * 20) + (index * 1.5),
        };
      });
      
      setPerformanceTrends(trendData);
    } catch (error) {
      console.error('Error fetching analytics data:', error);
      toast({
        title: 'Error loading analytics',
        description: 'Failed to load analytics data. Please try again.',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchAnalyticsData();
  }, []);

  const handleRefresh = () => {
    fetchAnalyticsData();
  };

  const handleExportData = () => {
    // Create CSV content
    const headers = ['Course', 'Students'];
    const courseRows = courseData.map(item => `${item.name},${item.value}`).join('\n');
    const csvContent = `${headers.join(',')}\n${courseRows}`;
    
    // Create a download link
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', 'course_distribution.csv');
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    toast({
      title: 'Export Complete',
      description: 'Course distribution data has been exported to CSV.',
    });
  };

  if (loading) {
    return (
      <div className="w-full h-64 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6 stagger-in show">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold text-primary">Analytics Dashboard</h2>
        <div className="flex gap-2">
          <Button 
            variant="outline" 
            size="sm" 
            onClick={handleRefresh}
            disabled={refreshing}
            className="flex items-center gap-1"
          >
            <RefreshCw className={`h-4 w-4 ${refreshing ? 'animate-spin' : ''}`} />
            <span>Refresh</span>
          </Button>
          <Button 
            variant="outline" 
            size="sm" 
            onClick={handleExportData}
            className="flex items-center gap-1"
          >
            <Download className="h-4 w-4" />
            <span>Export</span>
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="card-wrapper">
          <CardHeader className="pb-2">
            <CardTitle className="text-lg">Total Students</CardTitle>
            <CardDescription>Current enrollment</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-primary glow-text">
              {totalStudents}
            </div>
          </CardContent>
          <CardFooter className="pt-1 text-xs text-muted-foreground">
            Last updated: {new Date().toLocaleDateString()}
          </CardFooter>
        </Card>
        
        <Card className="card-wrapper">
          <CardHeader className="pb-2">
            <CardTitle className="text-lg">Course Distribution</CardTitle>
            <CardDescription>Students by course</CardDescription>
          </CardHeader>
          <CardContent className="p-0 h-48">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={courseData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  outerRadius={60}
                  fill="#8884d8"
                  dataKey="value"
                  label={({ name, percent }: { name: string, percent: number }) => `${name} ${(percent * 100).toFixed(0)}%`}
                >
                  {courseData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip 
                  formatter={(value: number, name: string) => [`${value} students`, name]}
                  contentStyle={{ background: 'rgba(255, 255, 255, 0.95)', borderRadius: '8px', border: '1px solid #e2e8f0' }}
                />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
        
        <Card className="card-wrapper">
          <CardHeader className="pb-2">
            <CardTitle className="text-lg">Grade Distribution</CardTitle>
            <CardDescription>Performance analysis</CardDescription>
          </CardHeader>
          <CardContent className="p-0 h-48">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={gradeData} margin={{ top: 20, right: 30, left: 0, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" opacity={0.2} />
                <XAxis dataKey="grade" />
                <YAxis />
                <Tooltip 
                  formatter={(value: number) => [`${value} students`]}
                  contentStyle={{ background: 'rgba(255, 255, 255, 0.95)', borderRadius: '8px', border: '1px solid #e2e8f0' }}
                />
                <Bar dataKey="count" fill="#4f46e5" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>
      
      {/* Performance Trends Chart - New Feature */}
      <Card className="card-wrapper w-full">
        <CardHeader>
          <CardTitle className="text-lg">Performance Trends</CardTitle>
          <CardDescription>Average grades and attendance over time</CardDescription>
        </CardHeader>
        <CardContent className="p-1 h-80">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart
              data={performanceTrends}
              margin={{ top: 20, right: 30, left: 20, bottom: 20 }}
            >
              <CartesianGrid strokeDasharray="3 3" opacity={0.2} />
              <XAxis dataKey="month" />
              <YAxis />
              <Tooltip
                contentStyle={{ background: 'rgba(255, 255, 255, 0.95)', borderRadius: '8px', border: '1px solid #e2e8f0' }}
              />
              <Legend />
              <Line
                type="monotone"
                dataKey="avgGrade"
                name="Average Grade"
                stroke="#4f46e5"
                activeDot={{ r: 8 }}
                strokeWidth={2}
              />
              <Line
                type="monotone"
                dataKey="attendance"
                name="Attendance %"
                stroke="#10b981"
                strokeWidth={2}
              />
            </LineChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
      
      {/* Interactive Tip Card */}
      <div className="flex justify-center mt-8 mb-4">
        <div className="flip-card w-full max-w-xs">
          <div className="flip-card-inner shadow-xl">
            <div className="flip-card-front">
              <div className="text-center p-4">
                <h3 className="text-lg font-medium">Hover for Tips</h3>
                <p className="text-muted-foreground">Discover student success strategies</p>
              </div>
            </div>
            <div className="flip-card-back">
              <div className="text-center p-4">
                <h3 className="text-lg font-medium">Success Tip</h3>
                <p className="text-sm">Regular check-ins with students increase engagement by 40%</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AnalyticsDashboard;
