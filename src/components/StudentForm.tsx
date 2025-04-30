
import React, { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Student, StudentFormData } from '@/types/Student';
import { useToast } from '@/components/ui/use-toast';
import { validateStudent } from '@/utils/validation';

interface StudentFormProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (student: StudentFormData) => void;
  student?: Student;
}

const defaultFormData: StudentFormData = {
  name: '',
  email: '',
  grade: 0,
  course: '',
  enrollmentDate: new Date().toISOString().split('T')[0]
};

const StudentForm: React.FC<StudentFormProps> = ({ open, onClose, onSubmit, student }) => {
  const [formData, setFormData] = useState<StudentFormData>(defaultFormData);
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  const { toast } = useToast();
  
  useEffect(() => {
    if (student) {
      setFormData({
        name: student.name,
        email: student.email,
        grade: student.grade,
        course: student.course,
        enrollmentDate: student.enrollmentDate
      });
    } else {
      setFormData(defaultFormData);
    }
    setFormErrors({});
  }, [student, open]);
  
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name === 'grade' ? parseFloat(value) || 0 : value
    }));
    
    // Clear error for this field when user starts typing
    if (formErrors[name]) {
      setFormErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };
  
  const validateForm = (): boolean => {
    const tempStudent = {
      id: student?.id || 'new',
      ...formData
    };
    
    const validationErrors = validateStudent(tempStudent, 0);
    const errors: Record<string, string> = {};
    
    validationErrors.forEach(err => {
      errors[err.field] = err.message;
    });
    
    setFormErrors(errors);
    return validationErrors.length === 0;
  };
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (validateForm()) {
      onSubmit(formData);
      toast({
        title: student ? "Student Updated" : "Student Created",
        description: `${formData.name} has been ${student ? "updated" : "added"} successfully.`,
      });
    } else {
      toast({
        title: "Validation Error",
        description: "Please fix the errors in the form.",
        variant: "destructive"
      });
    }
  };
  
  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>{student ? 'Edit Student' : 'Add New Student'}</DialogTitle>
          <DialogDescription>
            Enter the student details below.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="name">Name</Label>
              <Input
                id="name"
                name="name"
                value={formData.name}
                onChange={handleChange}
                className={formErrors.name ? "border-destructive" : ""}
              />
              {formErrors.name && (
                <p className="text-destructive text-xs">{formErrors.name}</p>
              )}
            </div>
            
            <div className="grid gap-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                name="email"
                type="email"
                value={formData.email}
                onChange={handleChange}
                className={formErrors.email ? "border-destructive" : ""}
              />
              {formErrors.email && (
                <p className="text-destructive text-xs">{formErrors.email}</p>
              )}
            </div>
            
            <div className="grid gap-2">
              <Label htmlFor="course">Course</Label>
              <Input
                id="course"
                name="course"
                value={formData.course}
                onChange={handleChange}
                className={formErrors.course ? "border-destructive" : ""}
              />
              {formErrors.course && (
                <p className="text-destructive text-xs">{formErrors.course}</p>
              )}
            </div>
            
            <div className="grid gap-2">
              <Label htmlFor="grade">Grade (0-100)</Label>
              <Input
                id="grade"
                name="grade"
                type="number"
                min="0"
                max="100"
                step="0.1"
                value={formData.grade}
                onChange={handleChange}
                className={formErrors.grade ? "border-destructive" : ""}
              />
              {formErrors.grade && (
                <p className="text-destructive text-xs">{formErrors.grade}</p>
              )}
            </div>
            
            <div className="grid gap-2">
              <Label htmlFor="enrollmentDate">Enrollment Date</Label>
              <Input
                id="enrollmentDate"
                name="enrollmentDate"
                type="date"
                value={formData.enrollmentDate}
                onChange={handleChange}
                className={formErrors.enrollmentDate ? "border-destructive" : ""}
              />
              {formErrors.enrollmentDate && (
                <p className="text-destructive text-xs">{formErrors.enrollmentDate}</p>
              )}
            </div>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose}>Cancel</Button>
            <Button type="submit">{student ? 'Update' : 'Create'}</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default StudentForm;
