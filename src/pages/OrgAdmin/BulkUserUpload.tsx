import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Upload, Download, CloudUpload, CheckCircle, XCircle, AlertCircle } from 'lucide-react';
import { motion } from 'framer-motion';
import * as XLSX from 'xlsx';

interface UserRecord {
  name: string;
  email: string;
  role: string;
  status: 'pending' | 'success' | 'error';
  error?: string;
}

export default function BulkUserUpload() {
  const navigate = useNavigate();
  const [file, setFile] = useState<File | null>(null);
  const [users, setUsers] = useState<UserRecord[]>([]);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadComplete, setUploadComplete] = useState(false);

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (!selectedFile) return;

    setFile(selectedFile);
    setUsers([]);
    setUploadComplete(false);

    const fileName = selectedFile.name.toLowerCase();
    const parsedUsers: UserRecord[] = [];

    try {
      if (fileName.endsWith('.csv')) {
        // Parse CSV
        const text = await selectedFile.text();
        const lines = text.split('\n');

        for (let i = 1; i < lines.length; i++) {
          if (lines[i].trim()) {
            const values = lines[i].split(',').map((v) => v.trim());
            parsedUsers.push({
              name: values[0] || '',
              email: values[1] || '',
              role: values[2] || 'STUDENT',
              status: 'pending',
            });
          }
        }
      } else if (fileName.endsWith('.xlsx') || fileName.endsWith('.xls')) {
        // Parse Excel
        const data = await selectedFile.arrayBuffer();
        const workbook = XLSX.read(data, { type: 'array' });
        const firstSheet = workbook.Sheets[workbook.SheetNames[0]];
        const jsonData = XLSX.utils.sheet_to_json(firstSheet, { header: 1 }) as any[][];

        // Skip header row (index 0) and process data rows
        for (let i = 1; i < jsonData.length; i++) {
          const row = jsonData[i];
          if (row && row.length > 0 && row[0]) {
            parsedUsers.push({
              name: String(row[0] || '').trim(),
              email: String(row[1] || '').trim(),
              role: String(row[2] || 'STUDENT').trim(),
              status: 'pending',
            });
          }
        }
      }

      setUsers(parsedUsers);
    } catch (error) {
      console.error('Error parsing file:', error);
      alert('Failed to parse file. Please ensure it follows the template format.');
    }
  };

  const handleUpload = async () => {
    setUploading(true);
    setUploadProgress(0);

    try {
      // Import the service
      const { orgAdminService } = await import('@/services/orgAdminService');

      // Prepare users data for bulk creation
      const usersToCreate = users.map(user => ({
        name: user.name,
        email: user.email,
        role: user.role,
      }));

      // Call backend bulk create API
      const response = await orgAdminService.bulkCreateUsers(usersToCreate);

      console.log('Bulk upload response:', response);

      // Update users with actual results
      const updatedUsers = users.map((user) => {
        // Check if user was successful
        const successUser = response.success?.find((s: any) => s.email === user.email);
        if (successUser) {
          return { ...user, status: 'success' as const };
        }

        // Check if user failed
        const failedUser = response.failed?.find((f: any) => f.email === user.email);
        if (failedUser) {
          return {
            ...user,
            status: 'error' as const,
            error: failedUser.error || 'Failed to create user',
          };
        }

        return user;
      });

      setUsers(updatedUsers);
      setUploadProgress(100);
    } catch (error: any) {
      console.error('Bulk upload error:', error);
      // Mark all as error if the entire request failed
      setUsers(prev => prev.map(user => ({
        ...user,
        status: 'error' as const,
        error: error.response?.data?.message || 'Failed to upload users',
      })));
    } finally {
      setUploading(false);
      setUploadComplete(true);
    }
  };

  const downloadTemplate = (format: 'csv' | 'excel' = 'csv') => {
    if (format === 'csv') {
      const template = 'Name,Email,Role\nJohn Doe,john@example.com,STUDENT\nJane Smith,jane@example.com,INSTRUCTOR';
      const blob = new Blob([template], { type: 'text/csv' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'user-upload-template.csv';
      a.click();
    } else {
      // Create Excel template
      const ws = XLSX.utils.aoa_to_sheet([
        ['Name', 'Email', 'Role'],
        ['John Doe', 'john@example.com', 'STUDENT'],
        ['Jane Smith', 'jane@example.com', 'INSTRUCTOR'],
      ]);
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, 'Users');
      XLSX.writeFile(wb, 'user-upload-template.xlsx');
    }
  };

  const successCount = users.filter((u) => u.status === 'success').length;
  const errorCount = users.filter((u) => u.status === 'error').length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Bulk User Upload</h1>
        <p className="text-muted-foreground">Upload multiple users at once using a CSV or Excel file</p>
      </div>

      {/* Instructions Card */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        <Card>
          <CardHeader>
            <CardTitle>Upload Instructions</CardTitle>
            <CardDescription>Follow these steps to upload users in bulk</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3 text-sm">
              <div className="flex items-start gap-2">
                <div className="rounded-full bg-primary/10 text-primary w-6 h-6 flex items-center justify-center flex-shrink-0 font-semibold">
                  1
                </div>
                <p>Download the CSV template below</p>
              </div>
              <div className="flex items-start gap-2">
                <div className="rounded-full bg-primary/10 text-primary w-6 h-6 flex items-center justify-center flex-shrink-0 font-semibold">
                  2
                </div>
                <p>Fill in user details (Name, Email, Role)</p>
              </div>
              <div className="flex items-start gap-2">
                <div className="rounded-full bg-primary/10 text-primary w-6 h-6 flex items-center justify-center flex-shrink-0 font-semibold">
                  3
                </div>
                <p>Upload the completed CSV file</p>
              </div>
              <div className="flex items-start gap-2">
                <div className="rounded-full bg-primary/10 text-primary w-6 h-6 flex items-center justify-center flex-shrink-0 font-semibold">
                  4
                </div>
                <p>Users will receive login credentials via email</p>
              </div>
            </div>

            <div className="flex gap-2 mt-6">
              <Button variant="outline" onClick={() => downloadTemplate('csv')}>
                <Download className="mr-2 h-4 w-4" />
                Download CSV Template
              </Button>
              <Button variant="outline" onClick={() => downloadTemplate('excel')}>
                <Download className="mr-2 h-4 w-4" />
                Download Excel Template
              </Button>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Upload File Card */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: 0.1 }}
      >
        <Card>
          <CardHeader>
            <CardTitle>Upload File</CardTitle>
            <CardDescription>Select a CSV or Excel file (.csv, .xlsx, .xls) containing user information</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center gap-4">
              <Button variant="outline" asChild>
                <label className="cursor-pointer">
                  <CloudUpload className="mr-2 h-4 w-4" />
                  Select CSV or Excel File
                  <input
                    type="file"
                    accept=".csv,.xlsx,.xls"
                    className="hidden"
                    onChange={handleFileSelect}
                  />
                </label>
              </Button>

              {file && (
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <span className="font-medium">{file.name}</span>
                  <Badge variant="outline">{users.length} users</Badge>
                </div>
              )}
            </div>

            {users.length > 0 && !uploadComplete && (
              <Button onClick={handleUpload} disabled={uploading}>
                <Upload className="mr-2 h-4 w-4" />
                {uploading ? 'Uploading...' : 'Upload Users'}
              </Button>
            )}

            {uploading && (
              <div className="space-y-2">
                <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden">
                  <div
                    className="bg-primary h-2 transition-all duration-300"
                    style={{ width: `${uploadProgress}%` }}
                  />
                </div>
                <p className="text-sm text-muted-foreground">
                  Uploading: {Math.round(uploadProgress)}%
                </p>
              </div>
            )}

            {uploadComplete && (
              <div className={`flex items-center gap-2 p-4 rounded-lg border ${
                errorCount > 0
                  ? 'bg-warning-50 border-warning-200 text-warning-700'
                  : 'bg-success-50 border-success-200 text-success-700'
              }`}>
                {errorCount > 0 ? (
                  <AlertCircle className="h-5 w-5 flex-shrink-0" />
                ) : (
                  <CheckCircle className="h-5 w-5 flex-shrink-0" />
                )}
                <p className="text-sm font-medium">
                  Upload complete! {successCount} users created successfully.
                  {errorCount > 0 && ` ${errorCount} users failed.`}
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      </motion.div>

      {/* Users Table */}
      {users.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.2 }}
        >
          <Card>
            <CardHeader>
              <CardTitle>User Preview</CardTitle>
              <CardDescription>Review the users from your CSV file</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Name</TableHead>
                      <TableHead>Email</TableHead>
                      <TableHead>Role</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Error</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {users.map((user, index) => (
                      <TableRow key={index}>
                        <TableCell className="font-medium">{user.name}</TableCell>
                        <TableCell>{user.email}</TableCell>
                        <TableCell>
                          <Badge variant="outline">{user.role}</Badge>
                        </TableCell>
                        <TableCell>
                          {user.status === 'success' && (
                            <Badge variant="success" className="gap-1">
                              <CheckCircle className="h-3 w-3" />
                              Success
                            </Badge>
                          )}
                          {user.status === 'error' && (
                            <Badge variant="destructive" className="gap-1">
                              <XCircle className="h-3 w-3" />
                              Failed
                            </Badge>
                          )}
                          {user.status === 'pending' && (
                            <Badge variant="outline">Pending</Badge>
                          )}
                        </TableCell>
                        <TableCell>
                          {user.error && (
                            <span className="text-sm text-destructive">{user.error}</span>
                          )}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      )}

      {/* Action Buttons */}
      <div className="flex justify-between">
        <Button variant="outline" onClick={() => navigate('/org-admin/users')}>
          Back to Users
        </Button>
        {uploadComplete && (
          <Button onClick={() => navigate('/org-admin/users')}>
            Done
          </Button>
        )}
      </div>
    </div>
  );
}
