
import React, { useState, useEffect } from 'react';
import { 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  ResponsiveContainer 
} from 'recharts';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";
import { TrendingUp, TrendingDown, Star, Database, Zap, Loader2 } from "lucide-react";
import { generateInsightsWithGemini } from "@/utils/geminiApi";

// Sample data - in a real implementation, this would come from an API
const generatePerformanceData = (period: string) => {
  const baseData = [
    { month: 'Jan', grade: 65 },
    { month: 'Feb', grade: 68 },
    { month: 'Mar', grade: 71 },
    { month: 'Apr', grade: 69 },
    { month: 'May', grade: 74 },
    { month: 'Jun', grade: 78 },
    { month: 'Jul', grade: 77 },
    { month: 'Aug', grade: 81 },
    { month: 'Sep', grade: 85 },
    { month: 'Oct', grade: 87 },
    { month: 'Nov', grade: 89 },
    { month: 'Dec', grade: 91 },
  ];
  
  if (period === 'last3months') {
    return baseData.slice(9);
  } else if (period === 'last6months') {
    return baseData.slice(6);
  } else {
    return baseData;
  }
};

// Sample student data - this would come from an API in production
const sampleStudents = [
  { id: 1, name: "Emma Johnson", grade: 96, course: "Mathematics", improvement: "+5%" },
  { id: 2, name: "Daniel Lee", grade: 94, course: "Physics", improvement: "+3%" },
  { id: 3, name: "Olivia Martinez", grade: 92, course: "Chemistry", improvement: "+7%" },
  { id: 4, name: "Michael Chen", grade: 64, course: "Biology", improvement: "-2%" },
  { id: 5, name: "Sophia Patel", grade: 68, course: "History", improvement: "0%" },
  { id: 6, name: "William Smith", grade: 66, course: "English", improvement: "-4%" },
];

// Helper function to determine grade status
const getGradeStatus = (grade: number) => {
  if (grade >= 85) return { status: 'success', text: 'Excellent' };
  if (grade >= 70) return { status: 'info', text: 'Good' };
  if (grade >= 60) return { status: 'warning', text: 'Needs Improvement' };
  return { status: 'destructive', text: 'Critical' };
};

const PerformanceTrends = () => {
  const [timePeriod, setTimePeriod] = useState('year');
  const [data, setData] = useState(generatePerformanceData(timePeriod));
  const [activeTab, setActiveTab] = useState<'chart' | 'topPerformers' | 'needsImprovement'>('chart');
  const [aiInsight, setAiInsight] = useState<string | null>(null);
  const [isLoadingInsights, setIsLoadingInsights] = useState(false);
  const [aiError, setAiError] = useState<string | null>(null);
  
  // Calculate average grade
  const averageGrade = data.reduce((acc, curr) => acc + curr.grade, 0) / data.length;
  const roundedAverage = Math.round(averageGrade);
  const gradeStatus = getGradeStatus(roundedAverage);

  // Filter top performers and students needing improvement
  const topPerformers = sampleStudents.filter(student => student.grade >= 90);
  const needsImprovement = sampleStudents.filter(student => student.grade < 70);

  const handlePeriodChange = (value: string) => {
    setTimePeriod(value);
    setData(generatePerformanceData(value));
    setAiInsight(null);
    setAiError(null);
  };

  // Get the progress bar color based on the grade
  const getProgressColor = (grade: number) => {
    if (grade >= 85) return "#10B981"; // Green
    if (grade >= 70) return "#3B82F6"; // Blue
    if (grade >= 60) return "#F59E0B"; // Yellow
    return "#EF4444"; // Red
  };
  
  // Generate insights using Gemini API
  useEffect(() => {
    const fetchInsights = async () => {
      setIsLoadingInsights(true);
      setAiError(null);
      
      try {
        // Real API call to Gemini
        const performanceDataForAI = {
          timePeriod,
          averageGrade: roundedAverage,
          gradeTrend: data[data.length - 1].grade - data[0].grade,
          dataPoints: data,
          topPerformersCount: topPerformers.length,
          needsImprovementCount: needsImprovement.length
        };
        
        const result = await generateInsightsWithGemini(
          [performanceDataForAI], 
          `Educational performance trends for ${timePeriod === 'year' ? 'the past year' : timePeriod === 'last6months' ? 'the last 6 months' : 'the last 3 months'}`
        );
        
        if (result.error) {
          setAiError("Could not generate insights: " + result.error);
          setAiInsight(null);
        } else {
          setAiInsight(result.text);
        }
      } catch (err) {
        console.error("Error fetching insights:", err);
        setAiError("An error occurred while generating insights");
        setAiInsight(null);
      } finally {
        setIsLoadingInsights(false);
      }
    };

    // Fetch insights when the time period changes
    if (timePeriod) {
      fetchInsights();
    }
  }, [timePeriod]);

  // Render student tables
  const renderStudentTable = (students: typeof sampleStudents) => (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Student</TableHead>
          <TableHead>Grade</TableHead>
          <TableHead>Course</TableHead>
          <TableHead>Trend</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {students.map((student) => (
          <TableRow key={student.id} className="hover:bg-muted/40 transition-colors">
            <TableCell className="font-medium">{student.name}</TableCell>
            <TableCell>
              <div className="flex items-center gap-2">
                {student.grade}%
                <Badge variant={getGradeStatus(student.grade).status as "success" | "warning" | "info" | "destructive"}>
                  {getGradeStatus(student.grade).text}
                </Badge>
              </div>
            </TableCell>
            <TableCell>{student.course}</TableCell>
            <TableCell>
              <div className="flex items-center gap-1">
                {student.improvement.startsWith('+') ? (
                  <TrendingUp className="h-4 w-4 text-green-500" />
                ) : student.improvement.startsWith('-') ? (
                  <TrendingDown className="h-4 w-4 text-red-500" />
                ) : (
                  <span className="h-4 w-4 inline-block">—</span>
                )}
                {student.improvement}
              </div>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
  
  return (
    <Card className="w-full h-full shadow-md hover:shadow-lg transition-shadow duration-300">
      <CardHeader className="pb-2">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div>
            <CardTitle className="text-xl font-bold">Performance Trends</CardTitle>
            <CardDescription>Student grade progression over time</CardDescription>
          </div>
          <div className="flex gap-2">
            <Select value={timePeriod} onValueChange={handlePeriodChange}>
              <SelectTrigger className="w-[140px]">
                <SelectValue placeholder="Select period" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="year">Past Year</SelectItem>
                <SelectItem value="last6months">Last 6 Months</SelectItem>
                <SelectItem value="last3months">Last 3 Months</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="mb-6">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium">Average Grade: {roundedAverage}%</span>
            <Badge variant={gradeStatus.status as "success" | "warning" | "info" | "destructive"}>{gradeStatus.text}</Badge>
          </div>
          <Progress value={roundedAverage} indicatorColor={getProgressColor(roundedAverage)} className="h-2" />
        </div>
        
        <div className="flex space-x-2 mb-4">
          <button 
            onClick={() => setActiveTab('chart')}
            className={`px-3 py-1 text-sm rounded-md transition-colors ${activeTab === 'chart' 
              ? 'bg-primary text-primary-foreground' 
              : 'hover:bg-muted'}`}
          >
            Chart View
          </button>
          <button 
            onClick={() => setActiveTab('topPerformers')}
            className={`px-3 py-1 text-sm rounded-md transition-colors flex items-center gap-1 ${activeTab === 'topPerformers' 
              ? 'bg-primary text-primary-foreground' 
              : 'hover:bg-muted'}`}
          >
            <Star className="h-3 w-3" /> Top Performers
          </button>
          <button 
            onClick={() => setActiveTab('needsImprovement')}
            className={`px-3 py-1 text-sm rounded-md transition-colors flex items-center gap-1 ${activeTab === 'needsImprovement' 
              ? 'bg-primary text-primary-foreground' 
              : 'hover:bg-muted'}`}
          >
            <TrendingDown className="h-3 w-3" /> Needs Improvement
          </button>
        </div>

        {activeTab === 'chart' && (
          <div className="w-full h-[300px] animate-in fade-in slide-in-from-bottom-3">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart
                data={data}
                margin={{ top: 5, right: 20, left: 0, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="month" />
                <YAxis domain={[40, 100]} />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: 'rgba(255, 255, 255, 0.9)', 
                    borderRadius: '8px', 
                    boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)', 
                    border: '1px solid rgba(0, 0, 0, 0.05)' 
                  }} 
                />
                <Legend verticalAlign="top" height={36} />
                <Line
                  type="monotone"
                  dataKey="grade"
                  stroke="hsl(var(--primary))"
                  strokeWidth={2}
                  activeDot={{ r: 6 }}
                  animationDuration={1500}
                  dot={{ stroke: 'hsl(var(--primary))', strokeWidth: 2, r: 4, fill: 'white' }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        )}

        {activeTab === 'topPerformers' && (
          <div className="animate-in fade-in slide-in-from-bottom-3">
            <h3 className="font-medium mb-3 flex items-center gap-2">
              <Star className="h-4 w-4 text-yellow-500" /> Top Performing Students
            </h3>
            {renderStudentTable(topPerformers)}
          </div>
        )}

        {activeTab === 'needsImprovement' && (
          <div className="animate-in fade-in slide-in-from-bottom-3">
            <h3 className="font-medium mb-3 flex items-center gap-2">
              <TrendingDown className="h-4 w-4 text-red-500" /> Students Needing Improvement
            </h3>
            {renderStudentTable(needsImprovement)}
          </div>
        )}

        <div className="mt-4 p-3 bg-muted/50 rounded-md text-sm">
          <p className="font-semibold text-center flex items-center justify-center gap-2">
            <Zap className="h-4 w-4 text-yellow-500" /> AI-Powered Insights
          </p>

          {isLoadingInsights ? (
            <div className="flex justify-center items-center h-16">
              <Loader2 className="h-5 w-5 animate-spin text-primary" />
              <span className="ml-2 text-sm text-muted-foreground">Generating insights with Gemini AI...</span>
            </div>
          ) : aiError ? (
            <div className="text-center p-3 text-destructive">
              <p>{aiError}</p>
              <p className="text-xs mt-1">Please check your Gemini API key configuration.</p>
            </div>
          ) : aiInsight ? (
            <div className="mt-2 space-y-2">
              <p className="text-muted-foreground">{aiInsight}</p>
            </div>
          ) : (
            <div className="text-center p-3 text-muted-foreground">
              <p>No insights generated yet.</p>
            </div>
          )}
          
          <ul className="mt-3 space-y-1 text-muted-foreground">
            <li>• Grade trend shows {data[data.length - 1].grade > data[0].grade ? 'improvement' : 'decline'} over time</li>
            <li>• {data[data.length - 1].grade > averageGrade ? 'Recent performance is above average' : 'Recent performance is below average'}</li>
            <li>• Highest grade: {Math.max(...data.map(item => item.grade))}%</li>
          </ul>
        </div>
      </CardContent>
    </Card>
  );
};

export default PerformanceTrends;
