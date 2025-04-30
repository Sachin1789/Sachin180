
import { Student, ValidationError } from "@/types/Student";
import { validateStudent } from "./validation";

// Parse CSV content into array of students
export const parseCSV = (content: string): { data: string[][], headers: string[] } => {
  const lines = content.split(/\r?\n/).filter(line => line.trim() !== '');
  const headers = lines[0].split(',').map(header => header.trim());
  
  const data = lines.slice(1).map(line => {
    // Handle values with commas inside quotes
    const values: string[] = [];
    let currentValue = '';
    let insideQuotes = false;
    
    for (let i = 0; i < line.length; i++) {
      const char = line[i];
      
      if (char === '"') {
        insideQuotes = !insideQuotes;
      } else if (char === ',' && !insideQuotes) {
        values.push(currentValue.trim());
        currentValue = '';
      } else {
        currentValue += char;
      }
    }
    
    // Add the last value
    values.push(currentValue.trim());
    return values;
  });
  
  return { data, headers };
};

// Convert CSV data to Student objects with validation
export const convertCSVToStudents = (data: string[][], headers: string[]): { 
  students: Student[], 
  errors: { rowData: string[], errors: ValidationError[] }[] 
} => {
  const students: Student[] = [];
  const errors: { rowData: string[], errors: ValidationError[] }[] = [];
  
  const nameIndex = headers.findIndex(h => h.toLowerCase() === 'name');
  const emailIndex = headers.findIndex(h => h.toLowerCase() === 'email');
  const gradeIndex = headers.findIndex(h => h.toLowerCase() === 'grade');
  const courseIndex = headers.findIndex(h => h.toLowerCase() === 'course');
  const enrollmentDateIndex = headers.findIndex(h => h.toLowerCase() === 'enrollmentdate');
  
  data.forEach((row, rowIndex) => {
    // Skip empty rows
    if (row.length === 0 || (row.length === 1 && row[0] === '')) return;
    
    const studentData = {
      id: `temp-${Date.now()}-${rowIndex}`,
      name: nameIndex >= 0 && row[nameIndex] ? row[nameIndex] : '',
      email: emailIndex >= 0 && row[emailIndex] ? row[emailIndex] : '',
      grade: gradeIndex >= 0 && row[gradeIndex] ? parseFloat(row[gradeIndex]) : 0,
      course: courseIndex >= 0 && row[courseIndex] ? row[courseIndex] : '',
      enrollmentDate: enrollmentDateIndex >= 0 && row[enrollmentDateIndex] ? row[enrollmentDateIndex] : new Date().toISOString().split('T')[0]
    };
    
    const validationErrors = validateStudent(studentData, rowIndex + 2);
    
    if (validationErrors.length > 0) {
      errors.push({ rowData: row, errors: validationErrors });
    } else {
      students.push(studentData);
    }
  });
  
  return { students, errors };
};

// Process multiple CSV files in parallel
export const processCSVFiles = async (files: File[]): Promise<{
  results: { file: string, students: Student[], errors: { rowData: string[], errors: ValidationError[] }[] }[]
}> => {
  const fileProcessingPromises = files.map(file => {
    return new Promise<{
      file: string,
      students: Student[],
      errors: { rowData: string[], errors: ValidationError[] }[]
    }>(resolve => {
      const reader = new FileReader();
      
      reader.onload = (e) => {
        const content = e.target?.result as string;
        const { data, headers } = parseCSV(content);
        const { students, errors } = convertCSVToStudents(data, headers);
        
        resolve({
          file: file.name,
          students,
          errors
        });
      };
      
      reader.readAsText(file);
    });
  });
  
  const results = await Promise.all(fileProcessingPromises);
  return { results };
};
