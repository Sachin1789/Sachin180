
import React, { useState, useEffect } from 'react';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/components/ui/use-toast';
import { Student, StudentFormData } from '@/types/Student';
import StudentList from '@/components/StudentList';
import StudentForm from '@/components/StudentForm';
import SearchBar from '@/components/SearchBar';
import BatchImport from '@/components/BatchImport';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/providers/AuthProvider';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

const Index = () => {
  const [filteredStudents, setFilteredStudents] = useState<Student[]>([]);
  const [isStudentFormOpen, setIsStudentFormOpen] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState<Student | undefined>(undefined);
  const [searchQuery, setSearchQuery] = useState('');
  const { toast } = useToast();
  const { user } = useAuth();
  const queryClient = useQueryClient();

  // Fetch students from Supabase
  const { data: students = [], isLoading } = useQuery({
    queryKey: ['students'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('students')
        .select('*')
        .order('name', { ascending: true });
        
      if (error) {
        toast({
          title: 'Error',
          description: error.message,
          variant: 'destructive'
        });
        throw new Error(error.message);
      }
      
      return data.map((student) => ({
        id: student.id,
        name: student.name,
        email: student.email,
        grade: student.grade,
        course: student.course,
        enrollmentDate: student.enrollment_date
      })) as Student[];
    }
  });

  // Add student mutation
  const addStudentMutation = useMutation({
    mutationFn: async (studentData: StudentFormData) => {
      if (!user) throw new Error('User not authenticated');
      
      const { data, error } = await supabase
        .from('students')
        .insert({
          name: studentData.name,
          email: studentData.email,
          grade: studentData.grade,
          course: studentData.course,
          enrollment_date: studentData.enrollmentDate,
          created_by: user.id
        })
        .select();
        
      if (error) throw new Error(error.message);
      return data[0];
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['students'] });
      toast({
        title: 'Success',
        description: 'Student added successfully'
      });
    },
    onError: (error: Error) => {
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive'
      });
    }
  });

  // Update student mutation
  const updateStudentMutation = useMutation({
    mutationFn: async ({ id, ...studentData }: Student) => {
      const { data, error } = await supabase
        .from('students')
        .update({
          name: studentData.name,
          email: studentData.email,
          grade: studentData.grade,
          course: studentData.course,
          enrollment_date: studentData.enrollmentDate,
          updated_at: new Date().toISOString()
        })
        .eq('id', id)
        .select();
        
      if (error) throw new Error(error.message);
      return data[0];
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['students'] });
      toast({
        title: 'Success',
        description: 'Student updated successfully'
      });
    },
    onError: (error: Error) => {
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive'
      });
    }
  });

  // Delete student mutation
  const deleteStudentMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('students')
        .delete()
        .eq('id', id);
        
      if (error) throw new Error(error.message);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['students'] });
      toast({
        title: 'Success',
        description: 'Student deleted successfully'
      });
    },
    onError: (error: Error) => {
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive'
      });
    }
  });

  // Filter students based on search query
  useEffect(() => {
    if (!students) return;
    
    if (!searchQuery.trim()) {
      setFilteredStudents(students);
      return;
    }
    
    const lowerQuery = searchQuery.toLowerCase();
    const filtered = students.filter(
      student =>
        student.name.toLowerCase().includes(lowerQuery) ||
        student.email.toLowerCase().includes(lowerQuery) ||
        student.course.toLowerCase().includes(lowerQuery)
    );
    setFilteredStudents(filtered);
  }, [searchQuery, students]);

  // Handle search
  const handleSearch = (query: string) => {
    setSearchQuery(query);
  };

  // Add a new student
  const handleAddStudent = (studentData: StudentFormData) => {
    addStudentMutation.mutate(studentData);
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
    
    updateStudentMutation.mutate({
      ...studentData,
      id: selectedStudent.id
    });
    
    setIsStudentFormOpen(false);
    setSelectedStudent(undefined);
  };

  // Delete a student
  const handleDeleteStudent = (id: string) => {
    deleteStudentMutation.mutate(id);
  };

  // Import students from CSV
  const handleStudentsImported = async (importedStudents: Student[]) => {
    if (!user) return;
    
    // Create an import log entry
    const { data: logEntry, error: logError } = await supabase
      .from('import_logs')
      .insert({
        user_id: user.id,
        filename: `batch-${new Date().toISOString()}`,
        total_rows: importedStudents.length,
        successful_rows: importedStudents.length, // Optimistic
        status: 'processing'
      })
      .select();
      
    if (logError) {
      toast({
        title: 'Error',
        description: 'Failed to create import log',
        variant: 'destructive'
      });
      return;
    }
    
    // Insert students one by one, collecting results
    let successful = 0;
    let failed = 0;
    const errors = [];
    
    for (const student of importedStudents) {
      try {
        const { error } = await supabase
          .from('students')
          .insert({
            name: student.name,
            email: student.email,
            grade: student.grade,
            course: student.course,
            enrollment_date: student.enrollmentDate,
            created_by: user.id
          });
          
        if (error) {
          failed++;
          errors.push({
            email: student.email,
            error: error.message
          });
        } else {
          successful++;
        }
      } catch (error: any) {
        failed++;
        errors.push({
          email: student.email,
          error: error.message
        });
      }
    }
    
    // Update import log with results
    await supabase
      .from('import_logs')
      .update({
        successful_rows: successful,
        failed_rows: failed,
        status: 'completed',
        errors: errors.length > 0 ? errors : null
      })
      .eq('id', logEntry[0].id);
    
    // Refresh students list
    queryClient.invalidateQueries({ queryKey: ['students'] });
    
    toast({
      title: 'Import Complete',
      description: `Successfully imported ${successful} students. Failed: ${failed}.`
    });
  };

  if (isLoading) {
    return (
      <div className="container mx-auto py-6 flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

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
