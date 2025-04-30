
import React, { useState } from 'react';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/components/ui/use-toast';
import { Student, StudentFormData } from '@/types/Student';
import StudentList from '@/components/StudentList';
import StudentForm from '@/components/StudentForm';
import SearchBar from '@/components/SearchBar';
import BatchImport from '@/components/BatchImport';

const Index = () => {
  const [students, setStudents] = useState<Student[]>([]);
  const [filteredStudents, setFilteredStudents] = useState<Student[]>([]);
  const [isStudentFormOpen, setIsStudentFormOpen] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState<Student | undefined>(undefined);
  const [searchQuery, setSearchQuery] = useState('');
  const { toast } = useToast();

  // Filter students based on search query
  const handleSearch = (query: string) => {
    setSearchQuery(query);
    if (!query.trim()) {
      setFilteredStudents(students);
      return;
    }
    
    const lowerQuery = query.toLowerCase();
    const filtered = students.filter(
      student =>
        student.name.toLowerCase().includes(lowerQuery) ||
        student.email.toLowerCase().includes(lowerQuery) ||
        student.course.toLowerCase().includes(lowerQuery)
    );
    setFilteredStudents(filtered);
  };

  // Add a new student
  const handleAddStudent = (studentData: StudentFormData) => {
    const newStudent: Student = {
      id: `student-${Date.now()}`,
      ...studentData
    };
    
    setStudents(prev => [...prev, newStudent]);
    setFilteredStudents(prev => [...prev, newStudent]);
    setIsStudentFormOpen(false);
  };

  // Edit an existing student
  const handleEditStudent = (student: Student) => {
    setSelectedStudent(student);
    setIsStudentFormOpen(true);
  };

  // Submit edited student
  const handleSubmitEdit = (studentData: StudentFormData) => {
    if (!selectedStudent) return;
    
    const updatedStudent: Student = {
      ...studentData,
      id: selectedStudent.id
    };
    
    setStudents(prev =>
      prev.map(s => (s.id === selectedStudent.id ? updatedStudent : s))
    );
    
    setFilteredStudents(prev =>
      prev.map(s => (s.id === selectedStudent.id ? updatedStudent : s))
    );
    
    setIsStudentFormOpen(false);
    setSelectedStudent(undefined);
  };

  // Delete a student
  const handleDeleteStudent = (id: string) => {
    setStudents(prev => prev.filter(s => s.id !== id));
    setFilteredStudents(prev => prev.filter(s => s.id !== id));
    
    toast({
      title: "Student Deleted",
      description: "The student has been removed successfully."
    });
  };

  // Import students from CSV
  const handleStudentsImported = (importedStudents: Student[]) => {
    // Generate unique IDs for imported students
    const studentsWithIds = importedStudents.map(student => ({
      ...student,
      id: `student-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
    }));
    
    setStudents(prev => [...prev, ...studentsWithIds]);
    
    // Apply current search filter to the new combined list
    if (searchQuery) {
      handleSearch(searchQuery);
    } else {
      setFilteredStudents(prev => [...prev, ...studentsWithIds]);
    }
  };

  return (
    <div className="container mx-auto py-6 space-y-6">
      <div className="flex flex-col space-y-2">
        <h1 className="text-3xl font-bold tracking-tight">Student Data Management</h1>
        <p className="text-muted-foreground">
          Manage student records, grades, and courses with bulk import capabilities.
        </p>
      </div>

      <Tabs defaultValue="students" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="students">Student List</TabsTrigger>
          <TabsTrigger value="import">Batch Import</TabsTrigger>
        </TabsList>

        <TabsContent value="students" className="space-y-4 pt-4">
          <Card className="w-full">
            <CardHeader className="pb-3">
              <CardTitle>Students</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <SearchBar
                  onSearch={handleSearch}
                  onAddNew={() => {
                    setSelectedStudent(undefined);
                    setIsStudentFormOpen(true);
                  }}
                />
                
                <StudentList
                  students={filteredStudents}
                  onEditStudent={handleEditStudent}
                  onDeleteStudent={handleDeleteStudent}
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="import" className="pt-4">
          <BatchImport onStudentsImported={handleStudentsImported} />
        </TabsContent>
      </Tabs>

      <StudentForm
        open={isStudentFormOpen}
        onClose={() => {
          setIsStudentFormOpen(false);
          setSelectedStudent(undefined);
        }}
        onSubmit={selectedStudent ? handleSubmitEdit : handleAddStudent}
        student={selectedStudent}
      />
    </div>
  );
};

export default Index;
