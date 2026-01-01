import React, { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Progress } from '@/components/ui/progress';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  Upload,
  Download,
  CheckCircle,
  XCircle,
} from 'lucide-react';
import * as XLSX from 'xlsx';

interface CandidateData {
  name: string;
  email: string;
  rowNumber: number;
  isValid: boolean;
  errors: string[];
}

interface BulkCandidateUploadProps {
  examId: string;
  onUploadComplete: (candidates: { name: string; email: string }[]) => void;
}

const BulkCandidateUpload: React.FC<BulkCandidateUploadProps> = ({
  examId,
  onUploadComplete,
}) => {
  const [open, setOpen] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [candidates, setCandidates] = useState<CandidateData[]>([]);
  const [validationError, setValidationError] = useState('');
  const [processing, setProcessing] = useState(false);

  const handleOpen = () => setOpen(true);
  const handleClose = () => {
    setOpen(false);
    setFile(null);
    setCandidates([]);
    setValidationError('');
  };

  // Email validation regex
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  // Validate candidate data
  const validateCandidate = (
    name: string | null | undefined,
    email: string | null | undefined,
    rowNumber: number
  ): CandidateData => {
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
    setCandidates([]);
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

      // Parse and validate candidates
      const parsedCandidates: CandidateData[] = [];
      for (let i = 1; i < jsonData.length; i++) {
        const row = jsonData[i];
        if (!row || row.length === 0) continue; // Skip empty rows

        const name = row[nameIndex];
        const email = row[emailIndex];
        const validated = validateCandidate(name, email, i + 1);
        parsedCandidates.push(validated);
      }

      if (parsedCandidates.length === 0) {
        setValidationError('No candidate data found in file');
        setProcessing(false);
        return;
      }

      setCandidates(parsedCandidates);
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
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Candidates');

    XLSX.writeFile(workbook, 'candidate_upload_template.xlsx');
  };

  // Handle upload
  const handleUpload = () => {
    const validCandidates = candidates.filter((s) => s.isValid);

    if (validCandidates.length === 0) {
      setValidationError('No valid candidates to upload');
      return;
    }

    onUploadComplete(
      validCandidates.map((s) => ({ name: s.name, email: s.email }))
    );
    handleClose();
  };

  const validCount = candidates.filter((s) => s.isValid).length;
  const invalidCount = candidates.length - validCount;

  return (
    <>
      <Button onClick={handleOpen} className="gap-2">
        <Upload className="h-4 w-4" />
        Bulk Upload Candidates
      </Button>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Bulk Upload Candidates</DialogTitle>
          </DialogHeader>

          <div className="space-y-4">
            {/* Instructions */}
            <Alert variant="info">
              <AlertDescription>
                <div className="space-y-2">
                  <p className="font-semibold">Instructions:</p>
                  <ul className="list-disc pl-5 space-y-1">
                    <li>Upload an Excel (.xlsx, .xls) or CSV file</li>
                    <li>File must contain "Name" and "Email" columns</li>
                    <li>All fields are required (no empty cells)</li>
                    <li>Email addresses must be in valid format</li>
                  </ul>
                </div>
              </AlertDescription>
            </Alert>

            {/* Download Template Button */}
            <div>
              <Button
                variant="outline"
                onClick={downloadTemplate}
                size="sm"
                className="gap-2"
              >
                <Download className="h-4 w-4" />
                Download Sample Template
              </Button>
            </div>

            {/* File Upload */}
            <div>
              <input
                accept=".xlsx,.xls,.csv"
                style={{ display: 'none' }}
                id="bulk-upload-file"
                type="file"
                onChange={handleFileChange}
              />
              <label htmlFor="bulk-upload-file" className="cursor-pointer">
                <div className="flex items-center justify-center gap-2 w-full py-6 px-4 border border-gray-300 rounded-md hover:bg-gray-50 transition-colors">
                  <Upload className="h-4 w-4" />
                  <span>{file ? file.name : 'Choose File'}</span>
                </div>
              </label>
            </div>

            {/* Processing */}
            {processing && (
              <div className="space-y-2">
                <Progress value={50} className="w-full" />
                <p className="text-sm text-muted-foreground">Processing file...</p>
              </div>
            )}

            {/* Validation Error */}
            {validationError && (
              <Alert variant="destructive">
                <AlertDescription>{validationError}</AlertDescription>
              </Alert>
            )}

            {/* Results Summary */}
            {candidates.length > 0 && !processing && (
              <>
                <div className="flex gap-2">
                  <Badge variant="success" className="gap-1">
                    <CheckCircle className="h-3 w-3" />
                    {validCount} Valid
                  </Badge>
                  {invalidCount > 0 && (
                    <Badge variant="destructive" className="gap-1">
                      <XCircle className="h-3 w-3" />
                      {invalidCount} Invalid
                    </Badge>
                  )}
                </div>

                {/* Candidates Table */}
                <Card className="max-h-96 overflow-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Row</TableHead>
                        <TableHead>Name</TableHead>
                        <TableHead>Email</TableHead>
                        <TableHead>Status</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {candidates.map((candidate, index) => (
                        <TableRow
                          key={index}
                          className={!candidate.isValid ? 'bg-destructive/10' : ''}
                        >
                          <TableCell>{candidate.rowNumber}</TableCell>
                          <TableCell>{candidate.name || '-'}</TableCell>
                          <TableCell>{candidate.email || '-'}</TableCell>
                          <TableCell>
                            {candidate.isValid ? (
                              <Badge variant="success">Valid</Badge>
                            ) : (
                              <div className="space-y-1">
                                <Badge variant="destructive">Invalid</Badge>
                                <p className="text-xs text-destructive">
                                  {candidate.errors.join(', ')}
                                </p>
                              </div>
                            )}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </Card>
              </>
            )}
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={handleClose}>
              Cancel
            </Button>
            <Button
              onClick={handleUpload}
              disabled={validCount === 0 || processing}
            >
              Upload {validCount} Candidate{validCount !== 1 ? 's' : ''}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default BulkCandidateUpload;
