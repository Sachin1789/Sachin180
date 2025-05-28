import React, { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/components/ui/use-toast";
import { Plus, Upload, FileSpreadsheet, Users, TrendingUp, BookOpen } from 'lucide-react';
import StudentList from '@/components/StudentList';
import StudentForm from '@/components/StudentForm';
import BatchImport from '@/components/BatchImport';
import AnalyticsDashboard from '@/components/AnalyticsDashboard';
import SearchBar from '@/components/SearchBar';
import { Student, StudentFormData, ImportResult } from '@/types/Student';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/providers/AuthProvider';

const Index = () => {
  const [students, setStudents] = useState<Student[]>([]);
  const [filteredStudents, setFilteredStudents] = useState<Student[]>([]);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isImportOpen, setIsImportOpen] = useState(false);
  const [editingStudent, setEditingStudent] = useState<Student | undefined>();
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();
  const { user } = useAuth();

  // Fetch students on component mount and when user changes
  useEffect(() => {
    if (user) {
      fetchStudents();
    }
  }, [user]);

  // Update filtered students when students array changes
  useEffect(() => {
    setFilteredStudents(students);
  }, [students]);

  const fetchStudents = async () => {
    if (!user) return;
    
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('students')
        .select('*')
        .eq('created_by', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;

      const formattedStudents: Student[] = data.map(student => ({
        id: student.id,
        name: student.name,
        email: student.email,
        grade: student.grade,
        course: student.course,
        enrollmentDate: student.enrollment_date.split('T')[0] // Convert to YYYY-MM-DD format
      }));

      setStudents(formattedStudents);
    } catch (error: any) {
      toast({
        title: "Error fetching students",
        description: error.message,
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleAddStudent = async (studentData: StudentFormData) => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('students')
        .insert([{
          name: studentData.name,
          email: studentData.email,
          grade: studentData.grade,
          course: studentData.course,
          enrollment_date: studentData.enrollmentDate,
          created_by: user.id
        }])
        .select()
        .single();

      if (error) throw error;

      const newStudent: Student = {
        id: data.id,
        name: data.name,
        email: data.email,
        grade: data.grade,
        course: data.course,
        enrollmentDate: data.enrollment_date.split('T')[0]
      };

      setStudents(prev => [newStudent, ...prev]);
      setIsFormOpen(false);
      setEditingStudent(undefined);
    } catch (error: any) {
      toast({
        title: "Error adding student",
        description: error.message,
        variant: "destructive"
      });
    }
  };

  const handleEditStudent = async (studentData: StudentFormData) => {
    if (!editingStudent || !user) return;

    try {
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
        .eq('id', editingStudent.id)
        .eq('created_by', user.id)
        .select()
        .single();

      if (error) throw error;

      const updatedStudent: Student = {
        id: data.id,
        name: data.name,
        email: data.email,
        grade: data.grade,
        course: data.course,
        enrollmentDate: data.enrollment_date.split('T')[0]
      };

      setStudents(prev => prev.map(s => s.id === editingStudent.id ? updatedStudent : s));
      setIsFormOpen(false);
      setEditingStudent(undefined);
    } catch (error: any) {
      toast({
        title: "Error updating student",
        description: error.message,
        variant: "destructive"
      });
    }
  };

  const handleDeleteStudent = async (id: string) => {
    if (!user) return;

    try {
      const { error } = await supabase
        .from('students')
        .delete()
        .eq('id', id)
        .eq('created_by', user.id);

      if (error) throw error;

      setStudents(prev => prev.filter(s => s.id !== id));
      
      toast({
        title: "Student deleted",
        description: "Student has been successfully removed.",
      });
    } catch (error: any) {
      toast({
        title: "Error deleting student",
        description: error.message,
        variant: "destructive"
      });
    }
  };

  const handleFormSubmit = (studentData: StudentFormData) => {
    if (editingStudent) {
      handleEditStudent(studentData);
    } else {
      handleAddStudent(studentData);
    }
  };

  const handleEditClick = (student: Student) => {
    setEditingStudent(student);
    setIsFormOpen(true);
  };

  const handleImportComplete = async (result: ImportResult) => {
    if (!user) return;

    const studentsWithUser = result.successful.map(student => ({
      ...student,
      created_by: user.id
    }));

    if (studentsWithUser.length > 0) {
      try {
        const { error } = await supabase
          .from('students')
          .insert(studentsWithUser.map(student => ({
            id: student.id,
            name: student.name,
            email: student.email,
            grade: student.grade,
            course: student.course,
            enrollment_date: student.enrollmentDate,
            created_by: user.id
          })));

        if (error) throw error;

        await fetchStudents();
      } catch (error: any) {
        toast({
          title: "Error saving imported students",
          description: error.message,
          variant: "destructive"
        });
      }
    }

    setIsImportOpen(false);
  };

  const handleSearch = (searchTerm: string) => {
    if (!searchTerm.trim()) {
      setFilteredStudents(students);
      return;
    }

    const filtered = students.filter(student =>
      student.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      student.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      student.course.toLowerCase().includes(searchTerm.toLowerCase())
    );
    setFilteredStudents(filtered);
  };

  const handleAddNew = () => {
    setEditingStudent(undefined);
    setIsFormOpen(true);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading students...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        {/* Header Section */}
        <div className="mb-8">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">Student Management</h1>
              <p className="text-gray-600">Manage your students efficiently and track their progress</p>
            </div>
            <div className="flex flex-col sm:flex-row gap-3">
              <Button 
                onClick={() => setIsImportOpen(true)}
                variant="outline"
                className="flex items-center gap-2"
              >
                <Upload className="h-4 w-4" />
                Import CSV
              </Button>
              <Button 
                onClick={handleAddNew}
                className="flex items-center gap-2"
              >
                <Plus className="h-4 w-4" />
                Add Student
              </Button>
            </div>
          </div>
        </div>

        {/* Analytics Dashboard */}
        <div className="mb-8">
          <AnalyticsDashboard />
        </div>

        {/* Search and Filter Section */}
        <div className="mb-6">
          <SearchBar 
            onSearch={handleSearch}
            onAddNew={handleAddNew}
          />
        </div>

        {/* Students Section */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center gap-2 mb-6">
            <Users className="h-5 w-5 text-blue-600" />
            <h2 className="text-xl font-semibold text-gray-900">
              Students ({filteredStudents.length})
            </h2>
          </div>
          
          <StudentList 
            students={filteredStudents}
            onEditStudent={handleEditClick}
            onDeleteStudent={handleDeleteStudent}
          />
        </div>

        {/* Modals */}
        <StudentForm
          open={isFormOpen}
          onClose={() => {
            setIsFormOpen(false);
            setEditingStudent(undefined);
          }}
          onSubmit={handleFormSubmit}
          student={editingStudent}
        />

        {isImportOpen && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
              <div className="p-4 border-b">
                <div className="flex justify-between items-center">
                  <h2 className="text-xl font-semibold">Import Students</h2>
                  <Button
                    variant="ghost"
                    onClick={() => setIsImportOpen(false)}
                    className="h-6 w-6 p-0"
                  >
                    ×
                  </Button>
                </div>
              </div>
              <div className="p-4">
                <BatchImport onStudentsImported={(students) => {
                  const importResult: ImportResult = {
                    successful: students,
                    failed: [],
                    totalRows: students.length
                  };
                  handleImportComplete(importResult);
                }} />
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Index;
