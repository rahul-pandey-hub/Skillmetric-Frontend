import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Container,
  Typography,
  Paper,
  Box,
  Grid,
  Button,
  Chip,
  Card,
  CardContent,
  CircularProgress,
  Alert,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
} from '@mui/material';
import {
  CheckCircle,
  Cancel,
  EmojiEvents,
  Visibility,
  Assessment,
} from '@mui/icons-material';
import { useSnackbar } from 'notistack';
import api from '../services/api';

interface ExamHistory {
  _id: string;
  exam: {
    _id: string;
    title: string;
    code: string;
    description: string;
    totalMarks: number;
    passingMarks: number;
    schedule: any;
  };
  status: string;
  score: {
    obtained: number;
    total: number;
    percentage: number;
    passed: boolean;
  };
  analysis: {
    timeSpent: number;
    attempted: number;
    correct: number;
    incorrect: number;
    unanswered: number;
    accuracy: number;
  };
  rank?: number;
  percentile?: number;
  proctoringReport?: any;
  submittedAt?: string;
  publishedAt?: string;
  createdAt?: string;
}

const StudentExamHistory = () => {
  const navigate = useNavigate();
  const { enqueueSnackbar } = useSnackbar();
  const [loading, setLoading] = useState(true);
  const [results, setResults] = useState<ExamHistory[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchResults();
  }, []);

  const fetchResults = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await api.get('/student/exams/results');
      setResults(response.data.data || []);
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || 'Failed to load exam history';
      setError(errorMessage);
      enqueueSnackbar(errorMessage, { variant: 'error' });
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const getStatusChip = (status: string) => {
    const statusConfig = {
      PUBLISHED: { label: 'Published', color: 'success' as const },
      GRADED: { label: 'Graded', color: 'info' as const },
      PENDING: { label: 'Under Review', color: 'warning' as const },
      EVALUATING: { label: 'Evaluating', color: 'default' as const },
    };
    const config = statusConfig[status as keyof typeof statusConfig] || { label: status, color: 'default' as const };
    return <Chip label={config.label} color={config.color} size="small" />;
  };

  if (loading) {
    return (
      <Container maxWidth="lg" sx={{ mt: 4, textAlign: 'center' }}>
        <CircularProgress />
        <Typography sx={{ mt: 2 }}>Loading exam history...</Typography>
      </Container>
    );
  }

  if (error) {
    return (
      <Container maxWidth="lg" sx={{ mt: 4 }}>
        <Alert severity="error">{error}</Alert>
      </Container>
    );
  }

  if (results.length === 0) {
    return (
      <Container maxWidth="lg" sx={{ mt: 4 }}>
        <Paper sx={{ p: 4, textAlign: 'center' }}>
          <Assessment sx={{ fontSize: 80, color: 'text.secondary', mb: 2 }} />
          <Typography variant="h5" gutterBottom>
            No Exam History
          </Typography>
          <Typography color="text.secondary" paragraph>
            You haven't taken any exams yet.
          </Typography>
          <Button variant="contained" onClick={() => navigate('/student')}>
            Browse Available Exams
          </Button>
        </Paper>
      </Container>
    );
  }

  // Calculate statistics
  const totalExams = results.length;
  const passedExams = results.filter(r => r.score?.passed).length;
  const averageScore = results.reduce((sum, r) => sum + (r.score?.percentage || 0), 0) / totalExams;

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      {/* Header */}
      <Box sx={{ mb: 3 }}>
        <Typography variant="h4" gutterBottom>
          Exam History
        </Typography>
        <Typography variant="subtitle1" color="text.secondary">
          View all your past exam attempts and results
        </Typography>
      </Box>

      {/* Statistics */}
      <Grid container spacing={3} sx={{ mb: 3 }}>
        <Grid item xs={12} md={4}>
          <Card>
            <CardContent sx={{ textAlign: 'center' }}>
              <Assessment sx={{ fontSize: 40, color: '#2196f3', mb: 1 }} />
              <Typography color="text.secondary" gutterBottom>
                Total Exams
              </Typography>
              <Typography variant="h3">{totalExams}</Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={4}>
          <Card>
            <CardContent sx={{ textAlign: 'center' }}>
              <CheckCircle sx={{ fontSize: 40, color: '#4caf50', mb: 1 }} />
              <Typography color="text.secondary" gutterBottom>
                Passed
              </Typography>
              <Typography variant="h3">{passedExams}</Typography>
              <Typography variant="caption" color="text.secondary">
                {((passedExams / totalExams) * 100).toFixed(0)}% pass rate
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={4}>
          <Card>
            <CardContent sx={{ textAlign: 'center' }}>
              <EmojiEvents sx={{ fontSize: 40, color: '#ffd700', mb: 1 }} />
              <Typography color="text.secondary" gutterBottom>
                Average Score
              </Typography>
              <Typography variant="h3">{averageScore.toFixed(1)}%</Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Results Table */}
      <Paper sx={{ width: '100%', overflow: 'hidden' }}>
        <TableContainer>
          <Table stickyHeader>
            <TableHead>
              <TableRow>
                <TableCell><strong>Exam</strong></TableCell>
                <TableCell align="center"><strong>Status</strong></TableCell>
                <TableCell align="center"><strong>Score</strong></TableCell>
                <TableCell align="center"><strong>Percentage</strong></TableCell>
                <TableCell align="center"><strong>Result</strong></TableCell>
                <TableCell align="center"><strong>Rank</strong></TableCell>
                <TableCell align="center"><strong>Date</strong></TableCell>
                <TableCell align="center"><strong>Actions</strong></TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {results.map((result) => (
                <TableRow key={result._id} hover>
                  <TableCell>
                    <Typography variant="body2" fontWeight="medium">
                      {result.exam.title}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      {result.exam.code}
                    </Typography>
                  </TableCell>
                  <TableCell align="center">
                    {getStatusChip(result.status)}
                  </TableCell>
                  <TableCell align="center">
                    <Typography variant="body2" fontWeight="medium">
                      {result.score?.obtained || 0} / {result.score?.total || 0}
                    </Typography>
                  </TableCell>
                  <TableCell align="center">
                    <Typography
                      variant="body2"
                      fontWeight="bold"
                      sx={{
                        color: result.score?.percentage >= 70 ? 'success.main' :
                               result.score?.percentage >= 40 ? 'warning.main' : 'error.main'
                      }}
                    >
                      {result.score?.percentage?.toFixed(1) || 0}%
                    </Typography>
                  </TableCell>
                  <TableCell align="center">
                    {result.score?.passed ? (
                      <Chip
                        icon={<CheckCircle />}
                        label="PASSED"
                        color="success"
                        size="small"
                      />
                    ) : (
                      <Chip
                        icon={<Cancel />}
                        label="FAILED"
                        color="error"
                        size="small"
                      />
                    )}
                  </TableCell>
                  <TableCell align="center">
                    <Typography variant="body2">
                      {result.rank ? `#${result.rank}` : 'N/A'}
                    </Typography>
                    {result.percentile && (
                      <Typography variant="caption" color="text.secondary">
                        ({result.percentile.toFixed(0)}th)
                      </Typography>
                    )}
                  </TableCell>
                  <TableCell align="center">
                    <Typography variant="body2">
                      {result.submittedAt ? formatDate(result.submittedAt) : 'N/A'}
                    </Typography>
                  </TableCell>
                  <TableCell align="center">
                    <Button
                      size="small"
                      variant="outlined"
                      startIcon={<Visibility />}
                      onClick={() => navigate(`/student/results/${result.exam._id}`)}
                    >
                      View
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </Paper>

      {/* Back Button */}
      <Box sx={{ mt: 3, textAlign: 'center' }}>
        <Button variant="outlined" onClick={() => navigate('/student')}>
          Back to Dashboard
        </Button>
      </Box>
    </Container>
  );
};

export default StudentExamHistory;
