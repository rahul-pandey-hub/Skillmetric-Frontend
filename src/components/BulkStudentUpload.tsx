import React, { useState } from 'react';
import {
  Box,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Typography,
  Alert,
  LinearProgress,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Chip,
  IconButton,
} from '@mui/material';
import {
  CloudUpload as UploadIcon,
  Download as DownloadIcon,
  Close as CloseIcon,
  CheckCircle as SuccessIcon,
  Error as ErrorIcon,
} from '@mui/icons-material';
import * as XLSX from 'xlsx';

interface StudentData {
  name: string;
  email: string;
  rowNumber: number;
  isValid: boolean;
  errors: string[];
}

interface BulkStudentUploadProps {
  examId: string;
  onUploadComplete: (students: { name: string; email: string }[]) => void;
}

const BulkStudentUpload: React.FC<BulkStudentUploadProps> = ({
  examId,
  onUploadComplete,
}) => {
  const [open, setOpen] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [students, setStudents] = useState<StudentData[]>([]);
  const [validationError, setValidationError] = useState('');
  const [processing, setProcessing] = useState(false);

  const handleOpen = () => setOpen(true);
  const handleClose = () => {
    setOpen(false);
    setFile(null);
    setStudents([]);
    setValidationError('');
  };

  // Email validation regex
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  // Validate student data
  const validateStudent = (
    name: string | null | undefined,
    email: string | null | undefined,
    rowNumber: number
  ): StudentData => {
    const errors: string[] = [];

    // Check for null/empty name
    if (!name || name.toString().trim() === '') {
      errors.push('Name is required');
    }

    // Check for null/empty email
    if (!email || email.toString().trim() === '') {
      errors.push('Email is required');
    } else if (!emailRegex.test(email.toString().trim())) {
      errors.push('Invalid email format');
    }

    return {
      name: name ? name.toString().trim() : '',
      email: email ? email.toString().trim() : '',
      rowNumber,
      isValid: errors.length === 0,
      errors,
    };
  };

  // Parse Excel/CSV file
  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = event.target.files?.[0];
    if (!selectedFile) return;

    setFile(selectedFile);
    setValidationError('');
    setStudents([]);
    setProcessing(true);

    try {
      // Check file type
      const fileExtension = selectedFile.name.split('.').pop()?.toLowerCase();
      if (!['xlsx', 'xls', 'csv'].includes(fileExtension || '')) {
        setValidationError('Please upload a valid Excel (.xlsx, .xls) or CSV file');
        setProcessing(false);
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
        setValidationError('File is empty');
        setProcessing(false);
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
        setValidationError(
          'File must contain "Name" and "Email" columns. Please check the headers.'
        );
        setProcessing(false);
        return;
      }

      // Parse and validate students
      const parsedStudents: StudentData[] = [];
      for (let i = 1; i < jsonData.length; i++) {
        const row = jsonData[i];
        if (!row || row.length === 0) continue; // Skip empty rows

        const name = row[nameIndex];
        const email = row[emailIndex];
        const validated = validateStudent(name, email, i + 1);
        parsedStudents.push(validated);
      }

      if (parsedStudents.length === 0) {
        setValidationError('No student data found in file');
        setProcessing(false);
        return;
      }

      setStudents(parsedStudents);
    } catch (error) {
      console.error('Error parsing file:', error);
      setValidationError('Failed to parse file. Please check the file format.');
    } finally {
      setProcessing(false);
    }
  };

  // Download sample template
  const downloadTemplate = () => {
    const sampleData = [
      ['Name', 'Email'],
      ['John Doe', 'john.doe@example.com'],
      ['Jane Smith', 'jane.smith@example.com'],
      ['Bob Johnson', 'bob.johnson@example.com'],
    ];

    const worksheet = XLSX.utils.aoa_to_sheet(sampleData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Students');

    XLSX.writeFile(workbook, 'student_upload_template.xlsx');
  };

  // Handle upload
  const handleUpload = () => {
    const validStudents = students.filter((s) => s.isValid);

    if (validStudents.length === 0) {
      setValidationError('No valid students to upload');
      return;
    }

    onUploadComplete(
      validStudents.map((s) => ({ name: s.name, email: s.email }))
    );
    handleClose();
  };

  const validCount = students.filter((s) => s.isValid).length;
  const invalidCount = students.length - validCount;

  return (
    <>
      <Button
        variant="contained"
        startIcon={<UploadIcon />}
        onClick={handleOpen}
        color="primary"
      >
        Bulk Upload Students
      </Button>

      <Dialog open={open} onClose={handleClose} maxWidth="md" fullWidth>
        <DialogTitle>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Typography variant="h6">Bulk Upload Students</Typography>
            <IconButton onClick={handleClose} size="small">
              <CloseIcon />
            </IconButton>
          </Box>
        </DialogTitle>

        <DialogContent>
          {/* Instructions */}
          <Alert severity="info" sx={{ mb: 2 }}>
            <Typography variant="body2" gutterBottom>
              <strong>Instructions:</strong>
            </Typography>
            <Typography variant="body2" component="div">
              <ul style={{ margin: 0, paddingLeft: '20px' }}>
                <li>Upload an Excel (.xlsx, .xls) or CSV file</li>
                <li>File must contain "Name" and "Email" columns</li>
                <li>All fields are required (no empty cells)</li>
                <li>Email addresses must be in valid format</li>
              </ul>
            </Typography>
          </Alert>

          {/* Download Template Button */}
          <Box sx={{ mb: 3 }}>
            <Button
              variant="outlined"
              startIcon={<DownloadIcon />}
              onClick={downloadTemplate}
              size="small"
            >
              Download Sample Template
            </Button>
          </Box>

          {/* File Upload */}
          <Box sx={{ mb: 3 }}>
            <input
              accept=".xlsx,.xls,.csv"
              style={{ display: 'none' }}
              id="bulk-upload-file"
              type="file"
              onChange={handleFileChange}
            />
            <label htmlFor="bulk-upload-file">
              <Button
                variant="outlined"
                component="span"
                startIcon={<UploadIcon />}
                fullWidth
                sx={{ py: 2 }}
              >
                {file ? file.name : 'Choose File'}
              </Button>
            </label>
          </Box>

          {/* Processing */}
          {processing && (
            <Box sx={{ mb: 2 }}>
              <LinearProgress />
              <Typography variant="body2" color="textSecondary" sx={{ mt: 1 }}>
                Processing file...
              </Typography>
            </Box>
          )}

          {/* Validation Error */}
          {validationError && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {validationError}
            </Alert>
          )}

          {/* Results Summary */}
          {students.length > 0 && !processing && (
            <>
              <Box sx={{ display: 'flex', gap: 2, mb: 2 }}>
                <Chip
                  icon={<SuccessIcon />}
                  label={`${validCount} Valid`}
                  color="success"
                  variant="outlined"
                />
                {invalidCount > 0 && (
                  <Chip
                    icon={<ErrorIcon />}
                    label={`${invalidCount} Invalid`}
                    color="error"
                    variant="outlined"
                  />
                )}
              </Box>

              {/* Students Table */}
              <TableContainer component={Paper} variant="outlined" sx={{ maxHeight: 400 }}>
                <Table size="small" stickyHeader>
                  <TableHead>
                    <TableRow>
                      <TableCell>Row</TableCell>
                      <TableCell>Name</TableCell>
                      <TableCell>Email</TableCell>
                      <TableCell>Status</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {students.map((student, index) => (
                      <TableRow
                        key={index}
                        sx={{
                          backgroundColor: student.isValid
                            ? 'inherit'
                            : 'rgba(211, 47, 47, 0.1)',
                        }}
                      >
                        <TableCell>{student.rowNumber}</TableCell>
                        <TableCell>{student.name || '-'}</TableCell>
                        <TableCell>{student.email || '-'}</TableCell>
                        <TableCell>
                          {student.isValid ? (
                            <Chip label="Valid" color="success" size="small" />
                          ) : (
                            <Box>
                              <Chip label="Invalid" color="error" size="small" />
                              <Typography variant="caption" color="error" display="block">
                                {student.errors.join(', ')}
                              </Typography>
                            </Box>
                          )}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            </>
          )}
        </DialogContent>

        <DialogActions>
          <Button onClick={handleClose}>Cancel</Button>
          <Button
            variant="contained"
            onClick={handleUpload}
            disabled={validCount === 0 || processing}
            color="primary"
          >
            Upload {validCount} Student{validCount !== 1 ? 's' : ''}
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

export default BulkStudentUpload;
