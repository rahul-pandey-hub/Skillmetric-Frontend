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

    // Parse CSV
    const text = await selectedFile.text();
    const lines = text.split('\n');

    const parsedUsers: UserRecord[] = [];
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

    setUsers(parsedUsers);
  };

  const handleUpload = async () => {
    setUploading(true);
    setUploadProgress(0);

    // Simulate upload
    for (let i = 0; i < users.length; i++) {
      await new Promise((resolve) => setTimeout(resolve, 200));

      setUsers((prev) =>
        prev.map((user, index) =>
          index === i
            ? {
                ...user,
                status: Math.random() > 0.1 ? 'success' : 'error',
                error: Math.random() > 0.1 ? undefined : 'Email already exists',
              }
            : user
        )
      );

      setUploadProgress(((i + 1) / users.length) * 100);
    }

    setUploading(false);
    setUploadComplete(true);
  };

  const downloadTemplate = () => {
    const template = 'Name,Email,Role\nJohn Doe,john@example.com,STUDENT\nJane Smith,jane@example.com,INSTRUCTOR';
    const blob = new Blob([template], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'user-upload-template.csv';
    a.click();
  };

  const successCount = users.filter((u) => u.status === 'success').length;
  const errorCount = users.filter((u) => u.status === 'error').length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Bulk User Upload</h1>
        <p className="text-muted-foreground">Upload multiple users at once using a CSV file</p>
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

            <Button variant="outline" onClick={downloadTemplate} className="mt-6">
              <Download className="mr-2 h-4 w-4" />
              Download Template
            </Button>
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
            <CardDescription>Select a CSV file containing user information</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center gap-4">
              <Button variant="outline" asChild>
                <label className="cursor-pointer">
                  <CloudUpload className="mr-2 h-4 w-4" />
                  Select CSV File
                  <input
                    type="file"
                    accept=".csv"
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
