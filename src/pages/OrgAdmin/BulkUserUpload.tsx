import { useState } from 'react';
import {
  Container,
  Typography,
  Box,
  Paper,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Alert,
  Chip,
  LinearProgress,
  IconButton,
} from '@mui/material';
import { Upload, Download, CloudUpload, CheckCircle, Error as ErrorIcon } from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';

interface UserRecord {
  name: string;
  email: string;
  role: string;
  status: 'pending' | 'success' | 'error';
  error?: string;
}

const BulkUserUpload = () => {
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
    <Container maxWidth="lg">
      <Box sx={{ py: 4 }}>
        <Typography variant="h4" gutterBottom>
          Bulk User Upload
        </Typography>

        <Paper elevation={3} sx={{ p: 3, mb: 3 }}>
          <Typography variant="h6" gutterBottom>
            Upload Instructions
          </Typography>
          <Typography variant="body2" color="textSecondary" paragraph>
            1. Download the CSV template below
            <br />
            2. Fill in user details (Name, Email, Role)
            <br />
            3. Upload the completed CSV file
            <br />
            4. Users will receive login credentials via email
          </Typography>

          <Button
            variant="outlined"
            startIcon={<Download />}
            onClick={downloadTemplate}
          >
            Download Template
          </Button>
        </Paper>

        <Paper elevation={3} sx={{ p: 3, mb: 3 }}>
          <Typography variant="h6" gutterBottom>
            Upload File
          </Typography>

          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mt: 2 }}>
            <Button
              variant="contained"
              component="label"
              startIcon={<CloudUpload />}
            >
              Select CSV File
              <input
                type="file"
                accept=".csv"
                hidden
                onChange={handleFileSelect}
              />
            </Button>

            {file && (
              <Typography variant="body2">
                {file.name} ({users.length} users)
              </Typography>
            )}
          </Box>

          {users.length > 0 && !uploadComplete && (
            <Box sx={{ mt: 2 }}>
              <Button
                variant="contained"
                color="primary"
                onClick={handleUpload}
                disabled={uploading}
                startIcon={<Upload />}
              >
                {uploading ? 'Uploading...' : 'Upload Users'}
              </Button>
            </Box>
          )}

          {uploading && (
            <Box sx={{ mt: 2 }}>
              <LinearProgress variant="determinate" value={uploadProgress} />
              <Typography variant="body2" color="textSecondary" sx={{ mt: 1 }}>
                Uploading: {Math.round(uploadProgress)}%
              </Typography>
            </Box>
          )}

          {uploadComplete && (
            <Alert severity={errorCount > 0 ? 'warning' : 'success'} sx={{ mt: 2 }}>
              Upload complete! {successCount} users created successfully.
              {errorCount > 0 && ` ${errorCount} users failed.`}
            </Alert>
          )}
        </Paper>

        {users.length > 0 && (
          <TableContainer component={Paper} elevation={3}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Name</TableCell>
                  <TableCell>Email</TableCell>
                  <TableCell>Role</TableCell>
                  <TableCell>Status</TableCell>
                  <TableCell>Error</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {users.map((user, index) => (
                  <TableRow key={index}>
                    <TableCell>{user.name}</TableCell>
                    <TableCell>{user.email}</TableCell>
                    <TableCell>
                      <Chip label={user.role} size="small" />
                    </TableCell>
                    <TableCell>
                      {user.status === 'success' && (
                        <Chip icon={<CheckCircle />} label="Success" color="success" size="small" />
                      )}
                      {user.status === 'error' && (
                        <Chip icon={<ErrorIcon />} label="Failed" color="error" size="small" />
                      )}
                      {user.status === 'pending' && (
                        <Chip label="Pending" size="small" />
                      )}
                    </TableCell>
                    <TableCell>
                      {user.error && (
                        <Typography variant="body2" color="error">
                          {user.error}
                        </Typography>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        )}

        <Box sx={{ mt: 3, display: 'flex', justifyContent: 'space-between' }}>
          <Button onClick={() => navigate('/org-admin/users')}>
            Back to Users
          </Button>
          {uploadComplete && (
            <Button
              variant="contained"
              onClick={() => navigate('/org-admin/users')}
            >
              Done
            </Button>
          )}
        </Box>
      </Box>
    </Container>
  );
};

export default BulkUserUpload;
