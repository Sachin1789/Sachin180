
import { Student, ValidationError } from "@/types/Student";

export const validateStudent = (student: Student, rowNum: number): ValidationError[] => {
  const errors: ValidationError[] = [];
  
  // Validate name
  if (!student.name || student.name.trim() === '') {
    errors.push({
      row: rowNum,
      field: 'name',
      message: 'Name is required'
    });
  }
  
  // Validate email
  if (!student.email || student.email.trim() === '') {
    errors.push({
      row: rowNum,
      field: 'email',
      message: 'Email is required'
    });
  } else if (!isValidEmail(student.email)) {
    errors.push({
      row: rowNum,
      field: 'email',
      message: 'Email is not valid'
    });
  }
  
  // Validate grade
  if (isNaN(student.grade)) {
    errors.push({
      row: rowNum,
      field: 'grade',
      message: 'Grade must be a number'
    });
  } else if (student.grade < 0 || student.grade > 100) {
    errors.push({
      row: rowNum,
      field: 'grade',
      message: 'Grade must be between 0 and 100'
    });
  }
  
  // Validate course
  if (!student.course || student.course.trim() === '') {
    errors.push({
      row: rowNum,
      field: 'course',
      message: 'Course is required'
    });
  }
  
  // Validate enrollment date
  if (student.enrollmentDate && !isValidDate(student.enrollmentDate)) {
    errors.push({
      row: rowNum,
      field: 'enrollmentDate',
      message: 'Enrollment date is not valid (use YYYY-MM-DD format)'
    });
  }
  
  return errors;
};

export const isValidEmail = (email: string): boolean => {
  const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return re.test(email);
};

export const isValidDate = (dateString: string): boolean => {
  // Check if date is in YYYY-MM-DD format and is a valid date
  const regex = /^\d{4}-\d{2}-\d{2}$/;
  
  if (!regex.test(dateString)) return false;
  
  const date = new Date(dateString);
  const timestamp = date.getTime();
  
  if (isNaN(timestamp)) return false;
  
  return date.toISOString().slice(0, 10) === dateString;
};
