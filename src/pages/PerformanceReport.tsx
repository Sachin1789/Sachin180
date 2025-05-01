
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { ArrowUpIcon, ArrowDownIcon, CalendarIcon, Download, FileJson } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import PerformanceTrends from '@/components/PerformanceTrends';

const PerformanceReport = () => {
  const [timeRange, setTimeRange] = useState<string>('month');
  const [exportFormat, setExportFormat] = useState<string>('csv');
  
  // Fetch performance data with time range filter
  const { data: performanceData, isLoading } = useQuery({
    queryKey: ['performance', timeRange],
    queryFn: async () => {
      // In a real app, this would be filtered by time range from the backend
      const { data, error } = await supabase
        .from('students')
        .select('*')
        .order('grade', { ascending: false });
        
      if (error) throw new Error(error.message);
      return data;
    }
  });
  
  // Calculate performance metrics
  const averageGrade = performanceData?.reduce((acc, student) => acc + Number(student?.grade || 0), 0) / (performanceData?.length || 1);
  const topPerformers = performanceData?.filter(student => Number(student.grade) >= 90) || [];
  const needsImprovement = performanceData?.filter(student => Number(student.grade) < 70) || [];
  
  const handleExport = () => {
    if (!performanceData) return;
    
    if (exportFormat === 'csv') {
      // Convert data to CSV
      const headers = ['name', 'email', 'grade', 'course', 'enrollmentDate'];
      const csvContent = [
        headers.join(','),
        ...performanceData.map(student => 
          headers.map(header => {
            // Handle enrollmentDate specially since it's nested
            if (header === 'enrollmentDate') return `"${student[header]}"`;
            return `"${student[header as keyof typeof student]}"`
          }).join(',')
        )
      ].join('\n');
      
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const link = document.createElement('a');
      link.href = URL.createObjectURL(blob);
      link.setAttribute('download', `student-performance-${new Date().toISOString().split('T')[0]}.csv`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } else if (exportFormat === 'json') {
      const jsonContent = JSON.stringify(performanceData, null, 2);
      const blob = new Blob([jsonContent], { type: 'application/json' });
      const link = document.createElement('a');
      link.href = URL.createObjectURL(blob);
      link.setAttribute('download', `student-performance-${new Date().toISOString().split('T')[0]}.json`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };
  
  if (isLoading) {
    return (
      <div className="container mx-auto py-12 flex justify-center items-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }
  
  return (
    <div className="container mx-auto py-8 px-4">
      <div className="flex flex-col space-y-2 mb-6">
        <h1 className="text-3xl font-bold tracking-tight text-primary glow-text">Performance Reports</h1>
        <p className="text-muted-foreground">
          Comprehensive analytics and insights about student performance across courses.
        </p>
      </div>
      
      <div className="flex flex-wrap gap-4 mb-6 items-center justify-between">
        <div className="flex items-center gap-2">
          <CalendarIcon className="h-5 w-5 text-muted-foreground" />
          <Select value={timeRange} onValueChange={setTimeRange}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Select time range" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="week">This Week</SelectItem>
              <SelectItem value="month">This Month</SelectItem>
              <SelectItem value="quarter">This Quarter</SelectItem>
              <SelectItem value="year">This Year</SelectItem>
            </SelectContent>
          </Select>
        </div>
        
        <div className="flex gap-2 items-center">
          <Select value={exportFormat} onValueChange={setExportFormat}>
            <SelectTrigger className="w-[100px]">
              <SelectValue placeholder="Format" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="csv">CSV</SelectItem>
              <SelectItem value="json">JSON</SelectItem>
            </SelectContent>
          </Select>
          <Button variant="outline" onClick={handleExport} className="flex items-center gap-2">
            <Download className="h-4 w-4" />
            Export
          </Button>
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <Card className="md:col-span-1">
          <CardHeader className="pb-2">
            <CardTitle className="text-lg">Average Grade</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex justify-between items-center">
              <span className="text-3xl font-bold">{averageGrade.toFixed(1)}</span>
              <Badge variant={averageGrade >= 80 ? "success" : averageGrade >= 70 ? "warning" : "destructive"}>
                {averageGrade >= 80 ? "Excellent" : averageGrade >= 70 ? "Good" : "Needs Improvement"}
              </Badge>
            </div>
            <Progress 
              value={averageGrade} 
              className="mt-2" 
              indicatorColor={
                averageGrade >= 80 ? "hsl(142.1, 76.2%, 36.3%)" : 
                averageGrade >= 70 ? "hsl(48, 96.5%, 58.8%)" : 
                "hsl(0, 84.2%, 60.2%)"
              }
            />
            <p className="text-sm text-muted-foreground mt-2">
              Overall average across all students
            </p>
          </CardContent>
        </Card>
        
        <Card className="md:col-span-1">
          <CardHeader className="pb-2">
            <CardTitle className="text-lg">Top Performers</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex justify-between items-center">
              <span className="text-3xl font-bold">{topPerformers.length}</span>
              <Badge variant="success" className="flex items-center gap-1">
                <ArrowUpIcon className="h-3 w-3" /> A Grade
              </Badge>
            </div>
            <Progress 
              value={(topPerformers.length / (performanceData?.length || 1)) * 100}
              className="mt-2"
              indicatorColor="hsl(142.1, 76.2%, 36.3%)"
            />
            <p className="text-sm text-muted-foreground mt-2">
              Students with 90% or higher grades
            </p>
          </CardContent>
        </Card>
        
        <Card className="md:col-span-1">
          <CardHeader className="pb-2">
            <CardTitle className="text-lg">Needs Improvement</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex justify-between items-center">
              <span className="text-3xl font-bold">{needsImprovement.length}</span>
              <Badge variant="destructive" className="flex items-center gap-1">
                <ArrowDownIcon className="h-3 w-3" /> At Risk
              </Badge>
            </div>
            <Progress 
              value={(needsImprovement.length / (performanceData?.length || 1)) * 100}
              className="mt-2"
              indicatorColor="hsl(0, 84.2%, 60.2%)"
            />
            <p className="text-sm text-muted-foreground mt-2">
              Students with less than 70% grades
            </p>
          </CardContent>
        </Card>
      </div>
      
      <Tabs defaultValue="overview" className="w-full">
        <TabsList className="grid w-full grid-cols-3 mb-4">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="courses">Course Analysis</TabsTrigger>
          <TabsTrigger value="trends">Performance Trends</TabsTrigger>
        </TabsList>
        
        <TabsContent value="overview" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Student Performance Distribution</CardTitle>
              <CardDescription>Grade distribution across all enrolled students</CardDescription>
            </CardHeader>
            <CardContent className="h-80">
              {/* This would be a real chart component in production */}
              <div className="w-full h-full flex items-center justify-center text-muted-foreground">
                Student performance distribution chart would render here
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="courses" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Course Comparison</CardTitle>
              <CardDescription>Average performance by course</CardDescription>
            </CardHeader>
            <CardContent className="h-80">
              {/* This would be a real chart component in production */}
              <div className="w-full h-full flex items-center justify-center text-muted-foreground">
                Course comparison chart would render here
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="trends" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Performance Over Time</CardTitle>
              <CardDescription>How student performance has changed over time</CardDescription>
            </CardHeader>
            <CardContent className="h-80">
              {/* Placeholder for the trends component */}
              <PerformanceTrends />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default PerformanceReport;
