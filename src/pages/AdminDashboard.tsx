import { useEffect, useState } from 'react';
import {
  Container,
  Typography,
  Paper,
  Box,
  Button,
  Grid,
  Card,
  CardContent,
  CardActions,
  Chip,
  CircularProgress,
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { RootState } from '../store';
import { examService } from '../services/examService';
import { Exam, ExamStatus } from '../types/exam';

const AdminDashboard = () => {
  const navigate = useNavigate();
  const { user } = useSelector((state: RootState) => state.auth);
  const [exams, setExams] = useState<Exam[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchExams();
  }, []);

  const fetchExams = async () => {
    try {
      setLoading(true);
      const response = await examService.getAllExams();
      setExams(response.data.data.slice(0, 6)); // Show only first 6
    } catch (err) {
      console.error('Failed to load exams:', err);
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

  return (
    <Container maxWidth="lg">
      <Box sx={{ py: 4 }}>
        <Typography variant="h4" gutterBottom>
          Admin Dashboard
        </Typography>
        <Typography variant="subtitle1" color="textSecondary" gutterBottom>
          Welcome, {user?.name}
        </Typography>

        <Paper elevation={3} sx={{ p: 3, mt: 3 }}>
          <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
            <Button
              variant="contained"
              onClick={() => navigate('/admin/create-exam')}
            >
              Create New Exam
            </Button>
            <Button
              variant="contained"
              color="secondary"
              onClick={() => navigate('/admin/questions')}
            >
              Manage Questions
            </Button>
            <Button
              variant="outlined"
              onClick={() => navigate('/admin/exams')}
            >
              View All Exams
            </Button>
            <Button
              variant="outlined"
              onClick={() => navigate('/admin/bulk-upload')}
            >
              Bulk Upload Students
            </Button>
          </Box>

          <Typography variant="h6" sx={{ mt: 4, mb: 2 }}>
            Recent Exams
          </Typography>

          {loading ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
              <CircularProgress />
            </Box>
          ) : exams.length === 0 ? (
            <Box sx={{ textAlign: 'center', py: 4 }}>
              <Typography color="textSecondary" gutterBottom>
                No exams found. Create your first exam to get started.
              </Typography>
              <Button
                variant="contained"
                onClick={() => navigate('/admin/create-exam')}
                sx={{ mt: 2 }}
              >
                Create Your First Exam
              </Button>
            </Box>
          ) : (
            <>
              <Grid container spacing={2}>
                {exams.map((exam) => (
                  <Grid item xs={12} sm={6} md={4} key={exam._id}>
                    <Card>
                      <CardContent>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                          <Typography variant="h6" component="div" noWrap>
                            {exam.title}
                          </Typography>
                          <Chip
                            label={exam.status}
                            color={getStatusColor(exam.status)}
                            size="small"
                          />
                        </Box>
                        <Typography variant="body2" color="textSecondary" gutterBottom>
                          Code: {exam.code}
                        </Typography>
                        <Typography variant="body2" color="textSecondary">
                          Duration: {exam.duration} min
                        </Typography>
                        <Typography variant="body2" color="textSecondary">
                          Questions: {Array.isArray(exam.questions) ? exam.questions.length : 0}
                        </Typography>
                      </CardContent>
                      <CardActions>
                        <Button
                          size="small"
                          onClick={() => navigate(`/admin/exams/${exam._id}`)}
                        >
                          View Details
                        </Button>
                        <Button
                          size="small"
                          onClick={() => navigate(`/admin/exams/${exam._id}/edit`)}
                        >
                          Edit
                        </Button>
                      </CardActions>
                    </Card>
                  </Grid>
                ))}
              </Grid>
              <Box sx={{ mt: 2, textAlign: 'center' }}>
                <Button variant="outlined" onClick={() => navigate('/admin/exams')}>
                  View All Exams
                </Button>
              </Box>
            </>
          )}
        </Paper>
      </Box>
    </Container>
  );
};

export default AdminDashboard;
