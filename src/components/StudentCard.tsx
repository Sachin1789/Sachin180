
import React from 'react';
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Student } from '@/types/Student';
import { Edit, Trash } from 'lucide-react';

interface StudentCardProps {
  student: Student;
  onEdit: (student: Student) => void;
  onDelete: (id: string) => void;
}

const StudentCard: React.FC<StudentCardProps> = ({ student, onEdit, onDelete }) => {
  return (
    <Card className="w-full h-full">
      <CardHeader className="pb-2">
        <div className="font-medium text-lg">{student.name}</div>
        <div className="text-sm text-muted-foreground">{student.email}</div>
      </CardHeader>
      <CardContent className="pb-2">
        <div className="grid grid-cols-2 gap-2 text-sm">
          <div>
            <span className="font-medium">Course:</span>
            <p>{student.course}</p>
          </div>
          <div>
            <span className="font-medium">Grade:</span>
            <p>{student.grade}</p>
          </div>
          <div className="col-span-2">
            <span className="font-medium">Enrollment Date:</span>
            <p>{student.enrollmentDate}</p>
          </div>
        </div>
      </CardContent>
      <CardFooter className="pt-2 flex justify-between">
        <Button variant="outline" size="sm" onClick={() => onEdit(student)}>
          <Edit className="h-4 w-4 mr-1" /> Edit
        </Button>
        <Button variant="outline" size="sm" className="text-destructive hover:bg-destructive/10" onClick={() => onDelete(student.id)}>
          <Trash className="h-4 w-4 mr-1" /> Delete
        </Button>
      </CardFooter>
    </Card>
  );
};

export default StudentCard;
