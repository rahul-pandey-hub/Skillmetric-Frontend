import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
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
  Divider,
  LinearProgress,
} from '@mui/material';
import {
  CheckCircle,
  Cancel,
  EmojiEvents,
  TrendingUp,
  Warning,
  ArrowBack,
  Info,
} from '@mui/icons-material';
import { useSnackbar } from 'notistack';
import api from '../services/api';

interface ExamResult {
  _id: string;
  exam: {
    _id: string;
    title: string;
    code: string;
    description: string;
    duration: number;
    totalMarks: number;
    passingMarks: number;
    settings: any;
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
  questionResults?: Array<{
    questionId: string;
    answer: any;
    correctAnswer: any;
    isCorrect: boolean;
    marksObtained: number;
    totalMarks: number;
    requiresManualGrading?: boolean;
    feedback?: string;
  }>;
  proctoringReport?: {
    totalViolations: number;
    violationBreakdown: any;
    autoSubmitted: boolean;
    warningsIssued: number;
  };
  ranking?: {
    rank: number;
    outOf: number;
    percentile: number;
    isShortlisted: boolean;
  };
  session?: {
    startTime: string;
    endTime: string;
    submittedAt: string;
    warningCount: number;
    violationsCount: number;
  };
  submittedAt?: string;
  publishedAt?: string;
  evaluatedAt?: string;
  createdAt?: string;
}

const StudentResults = () => {
  const { examId } = useParams<{ examId: string }>();
  const navigate = useNavigate();
  const { enqueueSnackbar } = useSnackbar();
  const [loading, setLoading] = useState(true);
  const [result, setResult] = useState<ExamResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchResult();
  }, [examId]);

  const fetchResult = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await api.get(`/student/exams/${examId}/result`);
      setResult(response.data);
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || 'Failed to load result';
      setError(errorMessage);
      enqueueSnackbar(errorMessage, { variant: 'error' });
    } finally {
      setLoading(false);
    }
  };

  const formatDuration = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    if (hours > 0) {
      return `${hours}h ${minutes}m`;
    }
    return `${minutes} minutes`;
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getGrade = (percentage: number) => {
    if (percentage >= 90) return { grade: 'A+', color: '#4caf50' };
    if (percentage >= 80) return { grade: 'A', color: '#66bb6a' };
    if (percentage >= 70) return { grade: 'B+', color: '#9ccc65' };
    if (percentage >= 60) return { grade: 'B', color: '#ffeb3b' };
    if (percentage >= 50) return { grade: 'C', color: '#ff9800' };
    return { grade: 'F', color: '#f44336' };
  };

  if (loading) {
    return (
      <Container maxWidth="lg" sx={{ mt: 4, textAlign: 'center' }}>
        <CircularProgress />
        <Typography sx={{ mt: 2 }}>Loading your results...</Typography>
      </Container>
    );
  }

  if (error || !result) {
    return (
      <Container maxWidth="lg" sx={{ mt: 4 }}>
        <Alert severity="error" sx={{ mb: 2 }}>
          {error || 'Result not found'}
        </Alert>
        <Button
          variant="outlined"
          startIcon={<ArrowBack />}
          onClick={() => navigate('/student')}
        >
          Back to Dashboard
        </Button>
      </Container>
    );
  }

  const gradeInfo = getGrade(result.score.percentage);

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      {/* Header */}
      <Box sx={{ mb: 3 }}>
        <Button
          variant="text"
          startIcon={<ArrowBack />}
          onClick={() => navigate('/student')}
          sx={{ mb: 2 }}
        >
          Back to Dashboard
        </Button>
        <Typography variant="h4" gutterBottom>
          Exam Result
        </Typography>
        <Typography variant="subtitle1" color="text.secondary">
          {result.exam.title} ({result.exam.code})
        </Typography>
      </Box>

      {/* Result Status Banner */}
      <Paper
        sx={{
          p: 4,
          mb: 3,
          background: result.score.passed
            ? 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
            : 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
          color: 'white',
          textAlign: 'center',
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', mb: 2 }}>
          {result.score.passed ? (
            <CheckCircle sx={{ fontSize: 64, mr: 2 }} />
          ) : (
            <Cancel sx={{ fontSize: 64, mr: 2 }} />
          )}
          <Typography variant="h3" component="div">
            {result.score.passed ? 'PASSED' : 'NOT PASSED'}
          </Typography>
        </Box>
        <Typography variant="h6">
          {result.status === 'PUBLISHED'
            ? 'Your results have been published'
            : 'Under Evaluation'}
        </Typography>
      </Paper>

      {/* Score Overview */}
      <Grid container spacing={3} sx={{ mb: 3 }}>
        <Grid item xs={12} md={3}>
          <Card>
            <CardContent sx={{ textAlign: 'center' }}>
              <Typography color="text.secondary" gutterBottom>
                Your Score
              </Typography>
              <Typography variant="h3" component="div">
                {result.score.obtained}
              </Typography>
              <Typography color="text.secondary">
                out of {result.score.total}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={3}>
          <Card>
            <CardContent sx={{ textAlign: 'center' }}>
              <Typography color="text.secondary" gutterBottom>
                Percentage
              </Typography>
              <Typography
                variant="h3"
                component="div"
                sx={{ color: gradeInfo.color }}
              >
                {result.score.percentage.toFixed(1)}%
              </Typography>
              <Chip
                label={`Grade: ${gradeInfo.grade}`}
                sx={{
                  mt: 1,
                  bgcolor: gradeInfo.color,
                  color: 'white',
                  fontWeight: 'bold',
                }}
              />
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={3}>
          <Card>
            <CardContent sx={{ textAlign: 'center' }}>
              <EmojiEvents sx={{ fontSize: 40, color: '#ffd700', mb: 1 }} />
              <Typography color="text.secondary" gutterBottom>
                Rank
              </Typography>
              <Typography variant="h3" component="div">
                {result.ranking?.rank || 'N/A'}
              </Typography>
              <Typography color="text.secondary">
                out of {result.ranking?.outOf || 0}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={3}>
          <Card>
            <CardContent sx={{ textAlign: 'center' }}>
              <TrendingUp sx={{ fontSize: 40, color: '#2196f3', mb: 1 }} />
              <Typography color="text.secondary" gutterBottom>
                Percentile
              </Typography>
              <Typography variant="h3" component="div">
                {result.ranking?.percentile?.toFixed(0) || 'N/A'}
              </Typography>
              <Typography color="text.secondary">percentile</Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Shortlisting Status */}
      {result.ranking?.isShortlisted !== undefined && (
        <Alert
          severity={result.ranking.isShortlisted ? 'success' : 'info'}
          sx={{ mb: 3 }}
          icon={result.ranking.isShortlisted ? <CheckCircle /> : <Info />}
        >
          <Typography variant="h6" gutterBottom>
            {result.ranking.isShortlisted
              ? '🎉 Congratulations! You are shortlisted (Top 15%)'
              : 'You are not shortlisted for the next round'}
          </Typography>
          {result.ranking.isShortlisted && (
            <Typography variant="body2">
              Next Round Information will be shared via email. Please check your inbox regularly.
            </Typography>
          )}
        </Alert>
      )}

      {/* Performance Analysis */}
      <Paper sx={{ p: 3, mb: 3 }}>
        <Typography variant="h6" gutterBottom>
          Performance Analysis
        </Typography>
        <Divider sx={{ mb: 2 }} />
        <Grid container spacing={3}>
          <Grid item xs={12} md={6}>
            <Box sx={{ mb: 2 }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                <Typography variant="body2">Attempted</Typography>
                <Typography variant="body2" fontWeight="bold">
                  {result.analysis.attempted} / {result.analysis.attempted + result.analysis.unanswered}
                </Typography>
              </Box>
              <LinearProgress
                variant="determinate"
                value={(result.analysis.attempted / (result.analysis.attempted + result.analysis.unanswered)) * 100}
                sx={{ height: 10, borderRadius: 5 }}
              />
            </Box>
            <Box sx={{ mb: 2 }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                <Typography variant="body2">Correct Answers</Typography>
                <Typography variant="body2" fontWeight="bold" color="success.main">
                  {result.analysis.correct}
                </Typography>
              </Box>
              <LinearProgress
                variant="determinate"
                value={(result.analysis.correct / result.analysis.attempted) * 100}
                color="success"
                sx={{ height: 10, borderRadius: 5 }}
              />
            </Box>
            <Box sx={{ mb: 2 }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                <Typography variant="body2">Incorrect Answers</Typography>
                <Typography variant="body2" fontWeight="bold" color="error.main">
                  {result.analysis.incorrect}
                </Typography>
              </Box>
              <LinearProgress
                variant="determinate"
                value={(result.analysis.incorrect / result.analysis.attempted) * 100}
                color="error"
                sx={{ height: 10, borderRadius: 5 }}
              />
            </Box>
          </Grid>
          <Grid item xs={12} md={6}>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', p: 2, bgcolor: '#f5f5f5', borderRadius: 1 }}>
                <Typography>Accuracy</Typography>
                <Typography fontWeight="bold">{result.analysis.accuracy.toFixed(1)}%</Typography>
              </Box>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', p: 2, bgcolor: '#f5f5f5', borderRadius: 1 }}>
                <Typography>Time Taken</Typography>
                <Typography fontWeight="bold">{formatDuration(result.analysis.timeSpent)}</Typography>
              </Box>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', p: 2, bgcolor: '#f5f5f5', borderRadius: 1 }}>
                <Typography>Unanswered</Typography>
                <Typography fontWeight="bold">{result.analysis.unanswered}</Typography>
              </Box>
            </Box>
          </Grid>
        </Grid>
      </Paper>

      {/* Proctoring Report */}
      {result.proctoringReport && (
        <Paper sx={{ p: 3, mb: 3 }}>
          <Typography variant="h6" gutterBottom>
            Proctoring Report
          </Typography>
          <Divider sx={{ mb: 2 }} />
          <Grid container spacing={2}>
            <Grid item xs={12} md={6}>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <Warning sx={{ mr: 1, color: result.proctoringReport.totalViolations > 0 ? 'warning.main' : 'success.main' }} />
                <Typography>
                  Total Violations: <strong>{result.proctoringReport.totalViolations}</strong>
                </Typography>
              </Box>
            </Grid>
            <Grid item xs={12} md={6}>
              <Typography>
                Warnings Issued: <strong>{result.proctoringReport.warningsIssued}</strong>
              </Typography>
            </Grid>
            {result.proctoringReport.autoSubmitted && (
              <Grid item xs={12}>
                <Alert severity="warning">
                  This exam was auto-submitted due to violation limit exceeded.
                </Alert>
              </Grid>
            )}
          </Grid>
        </Paper>
      )}

      {/* Submission Details */}
      <Paper sx={{ p: 3, mb: 3 }}>
        <Typography variant="h6" gutterBottom>
          Submission Details
        </Typography>
        <Divider sx={{ mb: 2 }} />
        <Grid container spacing={2}>
          {result.session && (
            <>
              <Grid item xs={12} md={6}>
                <Typography color="text.secondary">Started At</Typography>
                <Typography fontWeight="medium">{formatDate(result.session.startTime)}</Typography>
              </Grid>
              <Grid item xs={12} md={6}>
                <Typography color="text.secondary">Submitted At</Typography>
                <Typography fontWeight="medium">{formatDate(result.session.submittedAt)}</Typography>
              </Grid>
            </>
          )}
          {result.publishedAt && (
            <Grid item xs={12} md={6}>
              <Typography color="text.secondary">Published At</Typography>
              <Typography fontWeight="medium">{formatDate(result.publishedAt)}</Typography>
            </Grid>
          )}
        </Grid>
      </Paper>

      {/* Next Steps */}
      <Paper sx={{ p: 3 }}>
        <Typography variant="h6" gutterBottom>
          Next Steps
        </Typography>
        <Divider sx={{ mb: 2 }} />
        {result.ranking?.isShortlisted ? (
          <Box>
            <Typography variant="body1" gutterBottom>
              ✅ You have been shortlisted for the next round!
            </Typography>
            <Typography variant="body2" color="text.secondary" gutterBottom>
              • Check your email for interview schedule and details
            </Typography>
            <Typography variant="body2" color="text.secondary" gutterBottom>
              • Prepare using the resources provided in the email
            </Typography>
            <Typography variant="body2" color="text.secondary">
              • Stay tuned for further communication from the recruitment team
            </Typography>
          </Box>
        ) : (
          <Box>
            <Typography variant="body1" gutterBottom>
              Thank you for taking the assessment!
            </Typography>
            <Typography variant="body2" color="text.secondary" gutterBottom>
              • Review your performance and identify areas for improvement
            </Typography>
            <Typography variant="body2" color="text.secondary" gutterBottom>
              • Practice more to enhance your skills
            </Typography>
            <Typography variant="body2" color="text.secondary">
              • Look out for more opportunities in the future
            </Typography>
          </Box>
        )}
      </Paper>
    </Container>
  );
};

export default StudentResults;
