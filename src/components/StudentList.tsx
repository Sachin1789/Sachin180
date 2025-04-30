
import React from 'react';
import { Student } from '@/types/Student';
import StudentCard from './StudentCard';

interface StudentListProps {
  students: Student[];
  onEditStudent: (student: Student) => void;
  onDeleteStudent: (id: string) => void;
}

const StudentList: React.FC<StudentListProps> = ({ students, onEditStudent, onDeleteStudent }) => {
  if (students.length === 0) {
    return (
      <div className="w-full py-8 text-center">
        <p className="text-gray-500">No students found. Add new students or import from CSV.</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {students.map(student => (
        <StudentCard
          key={student.id}
          student={student}
          onEdit={onEditStudent}
          onDelete={onDeleteStudent}
        />
      ))}
    </div>
  );
};

export default StudentList;
