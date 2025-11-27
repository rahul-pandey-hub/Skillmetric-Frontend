import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { FileUpload } from '@/components/shared/FileUpload';
import { Progress } from '@/components/ui/progress';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Upload,
  Download,
  CheckCircle2,
  XCircle,
  AlertCircle,
  FileText,
  Users,
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'sonner';

interface StudentRecord {
  name: string;
  email: string;
  studentId: string;
  batch?: string;
  status: 'pending' | 'success' | 'error';
  error?: string;
}

export default function BulkEnrollment() {
  const [file, setFile] = useState<File | null>(null);
  const [students, setStudents] = useState<StudentRecord[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadComplete, setUploadComplete] = useState(false);

  const handleFileSelect = async (selectedFile: File) => {
    setFile(selectedFile);
    setStudents([]);
    setUploadComplete(false);

    // Parse CSV file
    const text = await selectedFile.text();
    const lines = text.split('\n');
    const headers = lines[0].split(',').map((h) => h.trim());

    const parsedStudents: StudentRecord[] = [];
    for (let i = 1; i < lines.length; i++) {
      if (lines[i].trim()) {
        const values = lines[i].split(',').map((v) => v.trim());
        parsedStudents.push({
          name: values[0] || '',
          email: values[1] || '',
          studentId: values[2] || '',
          batch: values[3] || '',
          status: 'pending',
        });
      }
    }

    setStudents(parsedStudents);
    toast.success(`Parsed ${parsedStudents.length} student records`);
  };

  const handleUpload = async () => {
    setIsUploading(true);
    setUploadProgress(0);

    // Simulate upload with progress
    for (let i = 0; i < students.length; i++) {
      await new Promise((resolve) => setTimeout(resolve, 200));

      setStudents((prev) =>
        prev.map((student, index) =>
          index === i
            ? {
                ...student,
                status: Math.random() > 0.1 ? 'success' : 'error',
                error: Math.random() > 0.1 ? undefined : 'Email already exists',
              }
            : student
        )
      );

      setUploadProgress(((i + 1) / students.length) * 100);
    }

    setIsUploading(false);
    setUploadComplete(true);
    toast.success('Bulk enrollment completed');
  };

  const downloadTemplate = () => {
    const template = 'Name,Email,Student ID,Batch\nJohn Doe,john@example.com,STU001,2024A\nJane Smith,jane@example.com,STU002,2024A';
    const blob = new Blob([template], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'student-enrollment-template.csv';
    a.click();
    URL.revokeObjectURL(url);
    toast.success('Template downloaded');
  };

  const successCount = students.filter((s) => s.status === 'success').length;
  const errorCount = students.filter((s) => s.status === 'error').length;
  const pendingCount = students.filter((s) => s.status === 'pending').length;

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Bulk Student Enrollment</h1>
        <p className="text-gray-600 mt-2">Upload a CSV file to enroll multiple students at once</p>
      </div>

      {/* Stats Cards */}
      {students.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">Total</p>
                    <p className="text-2xl font-bold text-gray-900 mt-1">{students.length}</p>
                  </div>
                  <Users className="w-8 h-8 text-primary-600" />
                </div>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
          >
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">Success</p>
                    <p className="text-2xl font-bold text-success-600 mt-1">{successCount}</p>
                  </div>
                  <CheckCircle2 className="w-8 h-8 text-success-600" />
                </div>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">Errors</p>
                    <p className="text-2xl font-bold text-destructive-600 mt-1">{errorCount}</p>
                  </div>
                  <XCircle className="w-8 h-8 text-destructive-600" />
                </div>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">Pending</p>
                    <p className="text-2xl font-bold text-warning-600 mt-1">{pendingCount}</p>
                  </div>
                  <AlertCircle className="w-8 h-8 text-warning-600" />
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      )}

      {/* Upload Section */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>Upload Student Data</span>
            <Button variant="outline" onClick={downloadTemplate}>
              <Download className="w-4 h-4 mr-2" />
              Download Template
            </Button>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <div className="flex items-start">
                <FileText className="w-5 h-5 text-blue-600 mt-0.5 mr-3" />
                <div>
                  <h4 className="text-sm font-medium text-blue-900">CSV Format Requirements</h4>
                  <ul className="text-xs text-blue-700 mt-2 space-y-1 list-disc list-inside">
                    <li>File must be in CSV format</li>
                    <li>Required columns: Name, Email, Student ID</li>
                    <li>Optional column: Batch</li>
                    <li>First row should contain column headers</li>
                    <li>Maximum 1000 students per upload</li>
                  </ul>
                </div>
              </div>
            </div>

            <FileUpload
              onFileSelect={handleFileSelect}
              accept={{ 'text/csv': ['.csv'] }}
              maxSize={5242880}
            />

            {file && (
              <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                <div className="flex items-center">
                  <FileText className="w-5 h-5 text-primary-600 mr-3" />
                  <div>
                    <p className="text-sm font-medium text-gray-900">{file.name}</p>
                    <p className="text-xs text-gray-600">{(file.size / 1024).toFixed(2)} KB</p>
                  </div>
                </div>
                <Button
                  onClick={handleUpload}
                  disabled={isUploading || uploadComplete || students.length === 0}
                  className="gap-2"
                >
                  <Upload className="w-4 h-4" />
                  {isUploading ? 'Uploading...' : uploadComplete ? 'Completed' : 'Start Upload'}
                </Button>
              </div>
            )}

            {isUploading && (
              <div className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-600">Upload Progress</span>
                  <span className="font-medium text-gray-900">{Math.round(uploadProgress)}%</span>
                </div>
                <Progress value={uploadProgress} />
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Preview Table */}
      {students.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Student Records Preview ({students.length})</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto max-h-96">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Student ID</TableHead>
                    <TableHead>Batch</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {students.map((student, index) => (
                    <TableRow key={index}>
                      <TableCell className="font-medium">{student.name}</TableCell>
                      <TableCell>{student.email}</TableCell>
                      <TableCell>{student.studentId}</TableCell>
                      <TableCell>{student.batch || '-'}</TableCell>
                      <TableCell>
                        {student.status === 'success' && (
                          <Badge className="bg-success-100 text-success-700 border-success-200">
                            <CheckCircle2 className="w-3 h-3 mr-1" />
                            Success
                          </Badge>
                        )}
                        {student.status === 'error' && (
                          <Badge className="bg-destructive-100 text-destructive-700 border-destructive-200">
                            <XCircle className="w-3 h-3 mr-1" />
                            {student.error || 'Error'}
                          </Badge>
                        )}
                        {student.status === 'pending' && (
                          <Badge className="bg-gray-100 text-gray-700 border-gray-200">
                            <AlertCircle className="w-3 h-3 mr-1" />
                            Pending
                          </Badge>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
