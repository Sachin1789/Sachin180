
export interface Student {
  id: string;
  name: string;
  email: string;
  grade: number;
  course: string;
  enrollmentDate: string;
}

export type StudentFormData = Omit<Student, 'id'>;

export interface ValidationError {
  row: number;
  field: string;
  message: string;
}

export interface ImportResult {
  successful: Student[];
  failed: {
    rowData: string[];
    errors: ValidationError[];
  }[];
  totalRows: number;
}
