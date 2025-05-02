
import React, { useState } from 'react';
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
  
  // Calculate average grade
  const averageGrade = data.reduce((acc, curr) => acc + curr.grade, 0) / data.length;
  const roundedAverage = Math.round(averageGrade);
  const gradeStatus = getGradeStatus(roundedAverage);

  const handlePeriodChange = (value: string) => {
    setTimePeriod(value);
    setData(generatePerformanceData(value));
  };

  // Get the progress bar color based on the grade
  const getProgressColor = (grade: number) => {
    if (grade >= 85) return "#10B981"; // Green
    if (grade >= 70) return "#3B82F6"; // Blue
    if (grade >= 60) return "#F59E0B"; // Yellow
    return "#EF4444"; // Red
  };
  
  return (
    <Card className="w-full h-full shadow-md hover:shadow-lg transition-shadow duration-300">
      <CardHeader className="pb-2">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div>
            <CardTitle className="text-xl font-bold">Performance Trends</CardTitle>
            <CardDescription>Student grade progression over time</CardDescription>
          </div>
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
      </CardHeader>
      <CardContent>
        <div className="mb-6">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium">Average Grade: {roundedAverage}%</span>
            <Badge variant={gradeStatus.status as "success" | "warning" | "info" | "destructive"}>{gradeStatus.text}</Badge>
          </div>
          <Progress value={roundedAverage} indicatorColor={getProgressColor(roundedAverage)} className="h-2" />
        </div>
        
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

        <div className="mt-4 p-3 bg-muted/50 rounded-md text-sm">
          <p className="font-semibold text-center">Insights</p>
          <ul className="mt-2 space-y-1 text-muted-foreground">
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
