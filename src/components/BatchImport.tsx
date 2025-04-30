
import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/components/ui/use-toast";
import FileUploader from './FileUploader';
import { ImportResult, Student, ValidationError } from '@/types/Student';
import { processCSVFiles } from '@/utils/csvParser';
import { Check, AlertCircle, Loader2 } from 'lucide-react';

interface BatchImportProps {
  onStudentsImported: (students: Student[]) => void;
}

const BatchImport: React.FC<BatchImportProps> = ({ onStudentsImported }) => {
  const { toast } = useToast();
  const [files, setFiles] = useState<File[]>([]);
  const [isImporting, setIsImporting] = useState(false);
  const [importResults, setImportResults] = useState<ImportResult | null>(null);
  const [activeTab, setActiveTab] = useState<string>('upload');
  
  const handleFilesSelected = (selectedFiles: File[]) => {
    setFiles(prev => [...prev, ...selectedFiles]);
  };
  
  const handleImport = async () => {
    if (files.length === 0) {
      toast({
        title: "No files selected",
        description: "Please select at least one CSV file to import.",
        variant: "destructive"
      });
      return;
    }
    
    setIsImporting(true);
    
    try {
      const { results } = await processCSVFiles(files);
      
      const allStudents: Student[] = [];
      const allFailed: { rowData: string[], errors: ValidationError[] }[] = [];
      let totalRows = 0;
      
      results.forEach(result => {
        allStudents.push(...result.students);
        allFailed.push(...result.errors);
        totalRows += result.students.length + result.errors.length;
      });
      
      setImportResults({
        successful: allStudents,
        failed: allFailed,
        totalRows
      });
      
      if (allStudents.length > 0) {
        onStudentsImported(allStudents);
      }
      
      toast({
        title: "Import completed",
        description: `Successfully imported ${allStudents.length} students. ${allFailed.length} entries had errors.`,
        variant: allStudents.length > 0 ? "default" : "destructive"
      });
      
      setActiveTab('results');
    } catch (error) {
      console.error('Import error:', error);
      toast({
        title: "Import failed",
        description: "An error occurred while importing students. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsImporting(false);
    }
  };
  
  const resetImport = () => {
    setFiles([]);
    setImportResults(null);
    setActiveTab('upload');
  };
  
  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>Batch Import Students</CardTitle>
        <CardDescription>
          Upload CSV files containing student data for bulk import.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="upload">Upload Files</TabsTrigger>
            <TabsTrigger value="results" disabled={!importResults}>Results</TabsTrigger>
          </TabsList>
          
          <TabsContent value="upload" className="pt-4">
            <FileUploader 
              onFilesSelected={handleFilesSelected}
              multiple={true}
              accept=".csv"
              isUploading={isImporting}
            />
            
            <div className="mt-4">
              <p className="text-sm text-gray-500 mb-2">Your CSV files should include the following columns:</p>
              <div className="bg-gray-50 p-3 rounded-md">
                <code className="text-xs">name, email, grade, course, enrollmentDate</code>
              </div>
            </div>
          </TabsContent>
          
          <TabsContent value="results" className="pt-4">
            {importResults && (
              <div>
                <div className="bg-muted/50 rounded-lg p-4 mb-4">
                  <h3 className="text-lg font-medium mb-2">Import Summary</h3>
                  <div className="grid grid-cols-3 gap-4">
                    <div className="bg-white p-3 rounded-md shadow-sm">
                      <p className="text-sm text-gray-500">Total Rows</p>
                      <p className="text-2xl font-bold">{importResults.totalRows}</p>
                    </div>
                    <div className="bg-green-50 p-3 rounded-md shadow-sm">
                      <p className="text-sm text-green-600">Successful</p>
                      <p className="text-2xl font-bold text-green-700">{importResults.successful.length}</p>
                    </div>
                    <div className={`p-3 rounded-md shadow-sm ${importResults.failed.length > 0 ? 'bg-red-50' : 'bg-white'}`}>
                      <p className={`text-sm ${importResults.failed.length > 0 ? 'text-red-600' : 'text-gray-500'}`}>Failed</p>
                      <p className={`text-2xl font-bold ${importResults.failed.length > 0 ? 'text-red-700' : 'text-gray-700'}`}>{importResults.failed.length}</p>
                    </div>
                  </div>
                </div>
                
                {importResults.failed.length > 0 && (
                  <div className="mb-4">
                    <h3 className="text-lg font-medium mb-2">Errors</h3>
                    <div className="max-h-60 overflow-y-auto border rounded-md">
                      <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50 sticky top-0">
                          <tr>
                            <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Row</th>
                            <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Field</th>
                            <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Error</th>
                          </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                          {importResults.failed.flatMap((failure, idx) =>
                            failure.errors.map((error, errorIdx) => (
                              <tr key={`${idx}-${errorIdx}`}>
                                <td className="px-3 py-2 whitespace-nowrap text-xs">{error.row}</td>
                                <td className="px-3 py-2 whitespace-nowrap text-xs">{error.field}</td>
                                <td className="px-3 py-2 whitespace-nowrap text-xs">{error.message}</td>
                              </tr>
                            ))
                          )}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </CardContent>
      <CardFooter className="flex justify-between">
        <Button variant="outline" onClick={resetImport}>
          Reset
        </Button>
        <Button 
          disabled={isImporting || files.length === 0} 
          onClick={handleImport}
        >
          {isImporting ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Importing...
            </>
          ) : (
            'Import Students'
          )}
        </Button>
      </CardFooter>
    </Card>
  );
};

export default BatchImport;
