import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Container,
  Typography,
  Paper,
  Box,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  IconButton,
  Alert,
  CircularProgress,
} from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import VisibilityIcon from '@mui/icons-material/Visibility';
import { examService } from '../services/examService';
import { Exam, ExamStatus } from '../types/exam';

const ExamsList = () => {
  const navigate = useNavigate();
  const [exams, setExams] = useState<Exam[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchExams();
  }, []);

  const fetchExams = async () => {
    try {
      setLoading(true);
      const response = await examService.getAllExams();
      setExams(response.data.data);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to load exams');
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
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
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

  return (
    <Container maxWidth="lg">
      <Box sx={{ py: 4 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
          <Typography variant="h4">Exams</Typography>
          <Button variant="contained" onClick={() => navigate('/admin/create-exam')}>
            Create New Exam
          </Button>
        </Box>

        {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

        {exams.length === 0 ? (
          <Paper elevation={3} sx={{ p: 4, textAlign: 'center' }}>
            <Typography variant="h6" color="textSecondary" gutterBottom>
              No exams found
            </Typography>
            <Typography color="textSecondary" sx={{ mb: 2 }}>
              Create your first exam to get started
            </Typography>
            <Button variant="contained" onClick={() => navigate('/admin/create-exam')}>
              Create Exam
            </Button>
          </Paper>
        ) : (
          <TableContainer component={Paper} elevation={3}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell><strong>Title</strong></TableCell>
                  <TableCell><strong>Code</strong></TableCell>
                  <TableCell><strong>Duration</strong></TableCell>
                  <TableCell><strong>Questions</strong></TableCell>
                  <TableCell><strong>Status</strong></TableCell>
                  <TableCell><strong>Start Date</strong></TableCell>
                  <TableCell><strong>Actions</strong></TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {exams.map((exam) => (
                  <TableRow key={exam._id} hover>
                    <TableCell>{exam.title}</TableCell>
                    <TableCell>{exam.code}</TableCell>
                    <TableCell>{exam.duration} min</TableCell>
                    <TableCell>
                      {Array.isArray(exam.questions) ? exam.questions.length : 0} questions
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={exam.status}
                        color={getStatusColor(exam.status)}
                        size="small"
                      />
                    </TableCell>
                    <TableCell>{formatDate(exam.schedule.startDate)}</TableCell>
                    <TableCell>
                      <IconButton
                        size="small"
                        onClick={() => navigate(`/admin/exams/${exam._id}`)}
                        title="View Details"
                      >
                        <VisibilityIcon />
                      </IconButton>
                      <IconButton
                        size="small"
                        onClick={() => navigate(`/admin/exams/${exam._id}/edit`)}
                        title="Edit Exam"
                      >
                        <EditIcon />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        )}
      </Box>
    </Container>
  );
};

export default ExamsList;
