
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { AlertCircle, Check, Award, TrendingUp, BookOpen, Clock, CheckCircle2 } from 'lucide-react';

interface StudentInsightsProps {
  studentCount: number;
  averageGrade: number;
  courseCompletion: number;
}

const StudentInsights: React.FC<StudentInsightsProps> = ({ 
  studentCount = 45, 
  averageGrade = 84,
  courseCompletion = 68 
}) => {
  const [selectedTab, setSelectedTab] = useState('overview');

  const getGradeColor = (grade: number) => {
    if (grade >= 90) return 'text-green-500';
    if (grade >= 80) return 'text-blue-500';
    if (grade >= 70) return 'text-yellow-500';
    return 'text-red-500';
  };

  const getProgressColor = (progress: number) => {
    if (progress >= 75) return 'bg-green-500';
    if (progress >= 50) return 'bg-blue-500';
    if (progress >= 25) return 'bg-yellow-500';
    return 'bg-red-500';
  };

  const mockPerformanceData = [
    { name: "Assignment Completion", value: 92 },
    { name: "Attendance Rate", value: 88 },
    { name: "Participation Score", value: 75 },
    { name: "On-time Submission", value: 82 },
  ];

  const mockPredictionData = [
    { metric: "Predicted Final Grade", value: "B+", trend: "up", detail: "Based on current performance" },
    { metric: "Risk Level", value: "Low", trend: "stable", detail: "Student is on track" },
    { metric: "Engagement", value: "High", trend: "up", detail: "Active in discussions" }
  ];

  const mockRecommendations = [
    "Schedule one-on-one office hours with struggling students",
    "Provide additional resources for advanced topics",
    "Consider peer tutoring program for core subjects",
    "Implement weekly check-ins for at-risk students"
  ];

  return (
    <Card className="w-full overflow-hidden transition-all duration-300 hover:shadow-md">
      <CardHeader className="bg-gradient-to-r from-indigo-50 to-purple-50">
        <CardTitle className="flex justify-between items-center">
          <span>Student Insights</span>
          <Badge variant="outline" className="bg-primary/10 text-primary">AI Enhanced</Badge>
        </CardTitle>
        <CardDescription>Advanced analytics and recommendations</CardDescription>
      </CardHeader>
      <CardContent className="p-0">
        <Tabs value={selectedTab} onValueChange={setSelectedTab} className="w-full">
          <TabsList className="grid grid-cols-3 w-full">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="predictions">Predictions</TabsTrigger>
            <TabsTrigger value="actions">Actions</TabsTrigger>
          </TabsList>
          
          <TabsContent value="overview" className="p-4 space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="flex flex-col items-center p-3 border rounded-md bg-primary/5">
                <span className="text-muted-foreground text-sm mb-1">Total Students</span>
                <span className="text-2xl font-bold">{studentCount}</span>
              </div>
              
              <div className="flex flex-col items-center p-3 border rounded-md bg-primary/5">
                <span className="text-muted-foreground text-sm mb-1">Average Grade</span>
                <span className={`text-2xl font-bold ${getGradeColor(averageGrade)}`}>{averageGrade}%</span>
              </div>
              
              <div className="flex flex-col items-center p-3 border rounded-md bg-primary/5">
                <span className="text-muted-foreground text-sm mb-1">Course Completion</span>
                <span className="text-2xl font-bold">{courseCompletion}%</span>
              </div>
            </div>
            
            <div className="space-y-3">
              <h3 className="font-medium">Performance Metrics</h3>
              {mockPerformanceData.map((item, i) => (
                <div key={i} className="space-y-1">
                  <div className="flex justify-between items-center">
                    <span className="text-sm">{item.name}</span>
                    <span className="text-sm font-medium">{item.value}%</span>
                  </div>
                  <Progress value={item.value} className={getProgressColor(item.value)} />
                </div>
              ))}
            </div>
          </TabsContent>
          
          <TabsContent value="predictions" className="p-4 space-y-4 animate-in fade-in-50">
            <div className="space-y-4">
              <h3 className="font-medium flex items-center gap-1">
                <TrendingUp className="h-4 w-4" />
                <span>AI Predictions</span>
              </h3>
              
              <div className="space-y-3">
                {mockPredictionData.map((item, i) => (
                  <div key={i} className="border rounded-md p-3 bg-card/50">
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-medium">{item.metric}</span>
                      <Badge variant={
                        item.trend === 'up' ? 'default' : 
                        item.trend === 'down' ? 'destructive' : 
                        'outline'
                      }>
                        {item.value}
                      </Badge>
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">{item.detail}</p>
                  </div>
                ))}
              </div>
              
              <div className="bg-primary/5 p-3 rounded-md">
                <div className="flex items-center gap-2 mb-2">
                  <AlertCircle className="h-4 w-4 text-amber-500" />
                  <span className="text-sm font-medium">Key Insight</span>
                </div>
                <p className="text-xs">Students with attendance above 90% are 3x more likely to achieve an A grade</p>
              </div>
            </div>
          </TabsContent>
          
          <TabsContent value="actions" className="p-4 space-y-4 animate-in fade-in-50">
            <div className="space-y-4">
              <h3 className="font-medium flex items-center gap-1">
                <CheckCircle2 className="h-4 w-4" />
                <span>Recommended Actions</span>
              </h3>
              
              <ul className="space-y-2">
                {mockRecommendations.map((recommendation, i) => (
                  <li key={i} className="flex items-start gap-2 border-b pb-2 last:border-0">
                    <Check className="h-4 w-4 text-green-500 shrink-0 mt-0.5" />
                    <span className="text-sm">{recommendation}</span>
                  </li>
                ))}
              </ul>
              
              <div className="flex gap-2 pt-2">
                <Button size="sm" className="flex items-center gap-1">
                  <Award className="h-4 w-4" />
                  <span>Generate Report</span>
                </Button>
                <Button size="sm" variant="outline" className="flex items-center gap-1">
                  <BookOpen className="h-4 w-4" />
                  <span>View Resources</span>
                </Button>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
      <CardFooter className="bg-muted/30 text-xs text-muted-foreground flex justify-between">
        <span className="flex items-center gap-1">
          <Clock className="h-3 w-3" />
          Updated just now
        </span>
        <Button variant="link" size="sm" className="p-0 h-auto">Refresh</Button>
      </CardFooter>
    </Card>
  );
};

export default StudentInsights;
