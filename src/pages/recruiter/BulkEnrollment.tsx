import { useState, useEffect } from 'react';
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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Upload,
  Download,
  CheckCircle2,
  XCircle,
  AlertCircle,
  FileText,
  Users,
  Loader2,
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'sonner';
import * as XLSX from 'xlsx';
import { examService } from '@/services/examService';
import type { Exam } from '@/types/exam';

interface CandidateRecord {
  name: string;
  email: string;
  status: 'pending' | 'success' | 'error';
  error?: string;
}

export default function BulkEnrollment() {
  const [exams, setExams] = useState<Exam[]>([]);
  const [selectedExamId, setSelectedExamId] = useState<string>('');
  const [loadingExams, setLoadingExams] = useState(true);
  const [file, setFile] = useState<File | null>(null);
  const [candidates, setCandidates] = useState<CandidateRecord[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadComplete, setUploadComplete] = useState(false);

  // Fetch exams on mount
  useEffect(() => {
    fetchExams();
  }, []);

  const fetchExams = async () => {
    try {
      setLoadingExams(true);
      const response = await examService.getAllExams();
      setExams(response.data.data || []);
    } catch (error) {
      console.error('Error fetching exams:', error);
      toast.error('Failed to load exams');
    } finally {
      setLoadingExams(false);
    }
  };

  const handleFileSelect = async (selectedFile: File) => {
    setFile(selectedFile);
    setCandidates([]);
    setUploadComplete(false);

    try {
      // Check file type
      const fileExtension = selectedFile.name.split('.').pop()?.toLowerCase();
      if (!['xlsx', 'xls', 'csv'].includes(fileExtension || '')) {
        toast.error('Please upload a valid Excel (.xlsx, .xls) or CSV file');
        return;
      }

      // Read file
      const data = await selectedFile.arrayBuffer();
      const workbook = XLSX.read(data, { type: 'array' });

      // Get first sheet
      const sheetName = workbook.SheetNames[0];
      const worksheet = workbook.Sheets[sheetName];

      // Convert to JSON
      const jsonData: any[] = XLSX.utils.sheet_to_json(worksheet, { header: 1 });

      if (jsonData.length === 0) {
        toast.error('File is empty');
        return;
      }

      // Check headers
      const headers = jsonData[0];
      const nameIndex = headers.findIndex(
        (h: string) => h && h.toLowerCase().includes('name')
      );
      const emailIndex = headers.findIndex(
        (h: string) => h && h.toLowerCase().includes('email')
      );

      if (nameIndex === -1 || emailIndex === -1) {
        toast.error('File must contain "Name" and "Email" columns');
        return;
      }

      // Parse candidates
      const parsedCandidates: CandidateRecord[] = [];
      for (let i = 1; i < jsonData.length; i++) {
        const row = jsonData[i];
        if (!row || row.length === 0) continue; // Skip empty rows

        const name = row[nameIndex];
        const email = row[emailIndex];

        if (name && email) {
          parsedCandidates.push({
            name: name.toString().trim(),
            email: email.toString().trim(),
            status: 'pending',
          });
        }
      }

      if (parsedCandidates.length === 0) {
        toast.error('No valid candidate data found in file');
        return;
      }

      setCandidates(parsedCandidates);
      toast.success(`Parsed ${parsedCandidates.length} candidate records`);
    } catch (error) {
      console.error('Error parsing file:', error);
      toast.error('Failed to parse file. Please check the file format.');
    }
  };

  const handleUpload = async () => {
    if (!selectedExamId) {
      toast.error('Please select an exam first');
      return;
    }

    if (candidates.length === 0) {
      toast.error('No candidates to upload');
      return;
    }

    setIsUploading(true);
    setUploadProgress(0);

    try {
      // Call the API to enroll candidates
      const response = await examService.enrollCandidates(
        selectedExamId,
        candidates.map((c) => ({ name: c.name, email: c.email }))
      );

      const { summary, details } = response.data;

      // Update candidate status based on the response
      setCandidates((prev) =>
        prev.map((candidate) => {
          // Check if candidate was enrolled successfully
          const enrolled = details.enrolled.find((e: any) => e.email === candidate.email);
          if (enrolled) {
            return { ...candidate, status: 'success' };
          }

          // Check if candidate was already enrolled
          const alreadyEnrolled = details.alreadyEnrolled.find((e: any) => e.email === candidate.email);
          if (alreadyEnrolled) {
            return { ...candidate, status: 'success' };
          }

          // Check if there was an error
          const error = details.errors.find((e: any) => e.email === candidate.email);
          if (error) {
            return { ...candidate, status: 'error', error: error.error };
          }

          // Default to success if created
          const created = details.created.find((c: any) => c.email === candidate.email);
          if (created) {
            return { ...candidate, status: 'success' };
          }

          return candidate;
        })
      );

      setUploadProgress(100);
      setIsUploading(false);
      setUploadComplete(true);

      // Show success message
      toast.success(
        `Enrollment completed! ${summary.enrolled} enrolled, ${summary.created} new accounts created` +
        (summary.errors > 0 ? `, ${summary.errors} errors` : '')
      );
    } catch (error: any) {
      console.error('Upload error:', error);
      setIsUploading(false);
      toast.error(error.response?.data?.message || 'Failed to enroll candidates');

      // Mark all as error
      setCandidates((prev) =>
        prev.map((candidate) => ({
          ...candidate,
          status: 'error',
          error: 'Upload failed',
        }))
      );
    }
  };

  const downloadTemplate = () => {
    const sampleData = [
      ['Name', 'Email'],
      ['John Doe', 'john.doe@example.com'],
      ['Jane Smith', 'jane.smith@example.com'],
      ['Bob Johnson', 'bob.johnson@example.com'],
    ];

    const worksheet = XLSX.utils.aoa_to_sheet(sampleData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Candidates');

    XLSX.writeFile(workbook, 'candidate_enrollment_template.xlsx');
    toast.success('Template downloaded');
  };

  const successCount = candidates.filter((c) => c.status === 'success').length;
  const errorCount = candidates.filter((c) => c.status === 'error').length;
  const pendingCount = candidates.filter((c) => c.status === 'pending').length;

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Bulk Candidate Enrollment</h1>
        <p className="text-gray-600 mt-2">Upload an Excel/CSV file to enroll multiple candidates at once</p>
      </div>

      {/* Exam Selection */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Select Exam</CardTitle>
        </CardHeader>
        <CardContent>
          {loadingExams ? (
            <div className="flex items-center gap-2 text-gray-600">
              <Loader2 className="w-4 h-4 animate-spin" />
              <span>Loading exams...</span>
            </div>
          ) : (
            <Select value={selectedExamId} onValueChange={setSelectedExamId}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Select an exam to enroll candidates" />
              </SelectTrigger>
              <SelectContent>
                {exams.map((exam) => (
                  <SelectItem key={exam._id} value={exam._id}>
                    {exam.title} ({exam.code})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}
          {!loadingExams && exams.length === 0 && (
            <p className="text-sm text-gray-600 mt-2">No exams available. Please create an exam first.</p>
          )}
        </CardContent>
      </Card>

      {/* Stats Cards */}
      {candidates.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">Total</p>
                    <p className="text-2xl font-bold text-gray-900 mt-1">{candidates.length}</p>
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
            <span>Upload Candidate Data</span>
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
                  <h4 className="text-sm font-medium text-blue-900">File Format Requirements</h4>
                  <ul className="text-xs text-blue-700 mt-2 space-y-1 list-disc list-inside">
                    <li>File must be in Excel (.xlsx, .xls) or CSV format</li>
                    <li>Required columns: Name, Email</li>
                    <li>First row should contain column headers</li>
                    <li>All fields are required (no empty cells)</li>
                    <li>Email addresses must be in valid format</li>
                  </ul>
                </div>
              </div>
            </div>

            <FileUpload
              onFileSelect={handleFileSelect}
              accept={{
                'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': ['.xlsx'],
                'application/vnd.ms-excel': ['.xls'],
                'text/csv': ['.csv']
              }}
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
                  disabled={isUploading || uploadComplete || candidates.length === 0 || !selectedExamId}
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
      {candidates.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Candidate Records Preview ({candidates.length})</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto max-h-96">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {candidates.map((candidate, index) => (
                    <TableRow key={index}>
                      <TableCell className="font-medium">{candidate.name}</TableCell>
                      <TableCell>{candidate.email}</TableCell>
                      <TableCell>
                        {candidate.status === 'success' && (
                          <Badge className="bg-success-100 text-success-700 border-success-200">
                            <CheckCircle2 className="w-3 h-3 mr-1" />
                            Success
                          </Badge>
                        )}
                        {candidate.status === 'error' && (
                          <Badge className="bg-destructive-100 text-destructive-700 border-destructive-200">
                            <XCircle className="w-3 h-3 mr-1" />
                            {candidate.error || 'Error'}
                          </Badge>
                        )}
                        {candidate.status === 'pending' && (
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
