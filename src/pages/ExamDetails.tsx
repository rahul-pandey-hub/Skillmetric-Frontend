import { useEffect, useState } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import {
  Container,
  Typography,
  Paper,
  Box,
  Button,
  Alert,
  CircularProgress,
  Grid,
  Chip,
  Divider,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
} from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import EditIcon from '@mui/icons-material/Edit';
import AddIcon from '@mui/icons-material/Add';
import { examService } from '../services/examService';
import { Exam, ExamStatus } from '../types/exam';
import BulkStudentUpload from '../components/BulkStudentUpload';

const ExamDetails = () => {
  const { examId } = useParams<{ examId: string }>();
  const navigate = useNavigate();
  const location = useLocation();

  const [exam, setExam] = useState<Exam | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Determine base path from current location (org-admin, recruiter, or admin)
  const basePath = location.pathname.includes('/org-admin')
    ? '/org-admin'
    : location.pathname.includes('/recruiter')
    ? '/recruiter'
    : '/admin';

  useEffect(() => {
    fetchExam();
  }, [examId]);

  const fetchExam = async () => {
    try {
      setLoading(true);
      const response = await examService.getExamById(examId!);
      setExam(response.data);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to load exam');
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: ExamStatus) => {
    switch (status) {
      case ExamStatus.DRAFT:
        return 'default';
      case ExamStatus.PUBLISHED:
        return 'info';
      case ExamStatus.ACTIVE:
        return 'success';
      case ExamStatus.COMPLETED:
        return 'warning';
      case ExamStatus.ARCHIVED:
        return 'error';
      default:
        return 'default';
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const handleStudentUpload = async (students: { name: string; email: string }[]) => {
    try {
      setError('');
      setSuccess('');
      const response = await examService.enrollStudents(examId!, students);
      const { summary, details } = response.data;

      // Log the full response for debugging
      console.log('Enrollment response:', response.data);

      // Show detailed error messages if there are errors
      if (summary.errors > 0) {
        const errorMessages = details.errors.map((err: any) =>
          `${err.name} (${err.email}): ${err.error}`
        ).join('; ');

        setError(
          `Enrollment partially failed. ${summary.enrolled} enrolled, ${summary.errors} errors. ` +
          `Errors: ${errorMessages}`
        );
      }

      // Show success message
      if (summary.enrolled > 0 || summary.created > 0) {
        setSuccess(
          `Successfully enrolled ${summary.enrolled} students. ` +
          `${summary.created > 0 ? `Created ${summary.created} new accounts. ` : ''}` +
          `${summary.alreadyEnrolled > 0 ? `${summary.alreadyEnrolled} already enrolled. ` : ''}`
        );
      }

      // Refresh exam data to show updated student count
      fetchExam();
    } catch (err: any) {
      console.error('Enrollment error:', err);
      setError(err.response?.data?.message || 'Failed to enroll students');
    }
  };

  if (loading) {
    return (
      <Container maxWidth="lg">
        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '400px' }}>
          <CircularProgress />
        </Box>
      </Container>
    );
  }

  if (!exam) {
    return (
      <Container maxWidth="lg">
        <Alert severity="error">{error || 'Exam not found'}</Alert>
      </Container>
    );
  }

  const questions = Array.isArray(exam.questions) ? exam.questions : [];

  return (
    <Container maxWidth="lg">
      <Box sx={{ py: 4 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 3 }}>
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <Button
              startIcon={<ArrowBackIcon />}
              onClick={() => navigate(`${basePath}/exams`)}
              sx={{ mr: 2 }}
            >
              Back
            </Button>
            <Typography variant="h4">{exam.title}</Typography>
          </Box>
          <Button
            variant="contained"
            startIcon={<EditIcon />}
            onClick={() => navigate(`${basePath}/exams/${examId}/edit`)}
          >
            Manage Questions
          </Button>
        </Box>

        {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
        {success && <Alert severity="success" sx={{ mb: 2 }}>{success}</Alert>}

        {/* Basic Info */}
        <Paper elevation={3} sx={{ p: 3, mb: 3 }}>
          <Typography variant="h6" gutterBottom>
            Basic Information
          </Typography>
          <Divider sx={{ mb: 2 }} />
          <Grid container spacing={2}>
            <Grid item xs={12} md={6}>
              <Typography variant="body2" color="textSecondary">
                Exam Code
              </Typography>
              <Typography variant="body1">{exam.code}</Typography>
            </Grid>
            <Grid item xs={12} md={6}>
              <Typography variant="body2" color="textSecondary">
                Status
              </Typography>
              <Chip label={exam.status} color={getStatusColor(exam.status)} size="small" />
            </Grid>
            <Grid item xs={12} md={6}>
              <Typography variant="body2" color="textSecondary">
                Duration
              </Typography>
              <Typography variant="body1">{exam.duration} minutes</Typography>
            </Grid>
            <Grid item xs={12} md={6}>
              <Typography variant="body2" color="textSecondary">
                Questions
              </Typography>
              <Typography variant="body1">{questions.length} questions</Typography>
            </Grid>
            {exam.description && (
              <Grid item xs={12}>
                <Typography variant="body2" color="textSecondary">
                  Description
                </Typography>
                <Typography variant="body1">{exam.description}</Typography>
              </Grid>
            )}
          </Grid>
        </Paper>

        {/* Schedule */}
        <Paper elevation={3} sx={{ p: 3, mb: 3 }}>
          <Typography variant="h6" gutterBottom>
            Schedule
          </Typography>
          <Divider sx={{ mb: 2 }} />
          <Grid container spacing={2}>
            <Grid item xs={12} md={6}>
              <Typography variant="body2" color="textSecondary">
                Start Date
              </Typography>
              <Typography variant="body1">{formatDate(exam.schedule.startDate)}</Typography>
            </Grid>
            <Grid item xs={12} md={6}>
              <Typography variant="body2" color="textSecondary">
                End Date
              </Typography>
              <Typography variant="body1">{formatDate(exam.schedule.endDate)}</Typography>
            </Grid>
            <Grid item xs={12}>
              <Typography variant="body2" color="textSecondary">
                Late Submission
              </Typography>
              <Typography variant="body1">
                {exam.schedule.lateSubmissionAllowed ? 'Allowed' : 'Not Allowed'}
              </Typography>
            </Grid>
          </Grid>
        </Paper>

        {/* Grading */}
        <Paper elevation={3} sx={{ p: 3, mb: 3 }}>
          <Typography variant="h6" gutterBottom>
            Grading Configuration
          </Typography>
          <Divider sx={{ mb: 2 }} />
          <Grid container spacing={2}>
            <Grid item xs={12} md={6}>
              <Typography variant="body2" color="textSecondary">
                Total Marks
              </Typography>
              <Typography variant="body1">{exam.grading.totalMarks}</Typography>
            </Grid>
            <Grid item xs={12} md={6}>
              <Typography variant="body2" color="textSecondary">
                Passing Marks
              </Typography>
              <Typography variant="body1">{exam.grading.passingMarks}</Typography>
            </Grid>
            <Grid item xs={12} md={6}>
              <Typography variant="body2" color="textSecondary">
                Negative Marking
              </Typography>
              <Typography variant="body1">
                {exam.grading.negativeMarking
                  ? `Yes (${exam.grading.negativeMarkValue} per wrong answer)`
                  : 'No'}
              </Typography>
            </Grid>
          </Grid>
        </Paper>

        {/* Enrolled Students */}
        <Paper elevation={3} sx={{ p: 3, mb: 3 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
            <Typography variant="h6">
              Enrolled Students ({exam.enrolledStudents?.length || 0})
            </Typography>
            <BulkStudentUpload examId={examId!} onUploadComplete={handleStudentUpload} />
          </Box>
          <Divider sx={{ mb: 2 }} />

          {(!exam.enrolledStudents || exam.enrolledStudents.length === 0) ? (
            <Box sx={{ textAlign: 'center', py: 4 }}>
              <Typography color="textSecondary" gutterBottom>
                No students enrolled yet
              </Typography>
              <Typography variant="body2" color="textSecondary">
                Use the "Bulk Upload Students" button to enroll students via Excel/CSV file
              </Typography>
            </Box>
          ) : (
            <Typography variant="body1" color="textSecondary">
              {exam.enrolledStudents.length} student{exam.enrolledStudents.length !== 1 ? 's' : ''} enrolled
            </Typography>
          )}
        </Paper>

        {/* Questions */}
        <Paper elevation={3} sx={{ p: 3 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
            <Typography variant="h6">Questions ({questions.length})</Typography>
            <Button
              variant="outlined"
              startIcon={<AddIcon />}
              onClick={() => navigate(`${basePath}/exams/${examId}/edit`)}
              size="small"
            >
              Add Questions
            </Button>
          </Box>
          <Divider sx={{ mb: 2 }} />

          {questions.length === 0 ? (
            <Box sx={{ textAlign: 'center', py: 4 }}>
              <Typography color="textSecondary" gutterBottom>
                No questions added yet
              </Typography>
              <Button
                variant="contained"
                startIcon={<AddIcon />}
                onClick={() => navigate(`${basePath}/exams/${examId}/edit`)}
                sx={{ mt: 2 }}
              >
                Add Questions
              </Button>
            </Box>
          ) : (
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell><strong>#</strong></TableCell>
                    <TableCell><strong>Question</strong></TableCell>
                    <TableCell><strong>Type</strong></TableCell>
                    <TableCell><strong>Difficulty</strong></TableCell>
                    <TableCell><strong>Marks</strong></TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {questions.map((question: any, index) => (
                    <TableRow key={question._id || index}>
                      <TableCell>{index + 1}</TableCell>
                      <TableCell>{question.questionText || 'N/A'}</TableCell>
                      <TableCell>
                        <Chip label={question.type || 'N/A'} size="small" color="primary" />
                      </TableCell>
                      <TableCell>
                        <Chip label={question.difficulty || 'N/A'} size="small" color="secondary" />
                      </TableCell>
                      <TableCell>{question.marks || 0}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          )}
        </Paper>
      </Box>
    </Container>
  );
};

export default ExamDetails;
