
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { useToast } from "@/components/ui/use-toast";
import { supabase } from '@/integrations/supabase/client';

interface CourseDistribution {
  name: string;
  value: number;
  color: string;
}

interface GradeDistribution {
  grade: string;
  count: number;
}

const COLORS = ['#4f46e5', '#8b5cf6', '#a78bfa', '#c4b5fd', '#ddd6fe'];

const AnalyticsDashboard: React.FC = () => {
  const [courseData, setCourseData] = useState<CourseDistribution[]>([]);
  const [gradeData, setGradeData] = useState<GradeDistribution[]>([]);
  const [totalStudents, setTotalStudents] = useState<number>(0);
  const [loading, setLoading] = useState<boolean>(true);
  const { toast } = useToast();

  useEffect(() => {
    const fetchAnalyticsData = async () => {
      try {
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
          const count = gradeMap.get(item.grade) || 0;
          gradeMap.set(item.grade, count + 1);
        });
        
        const gradeDistribution = Array.from(gradeMap.entries())
          .map(([grade, count]) => ({
            grade,
            count
          }))
          .sort((a, b) => a.grade.localeCompare(b.grade));
        
        setGradeData(gradeDistribution);
      } catch (error) {
        console.error('Error fetching analytics data:', error);
        toast({
          title: 'Error loading analytics',
          description: 'Failed to load analytics data. Please try again.',
          variant: 'destructive'
        });
      } finally {
        setLoading(false);
      }
    };
    
    fetchAnalyticsData();
  }, [toast]);

  if (loading) {
    return (
      <div className="w-full h-64 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6 stagger-in show">
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
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
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
      
      {/* Flip Card Demo */}
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
