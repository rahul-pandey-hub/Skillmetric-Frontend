import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
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
  CardActions,
  Alert,
  CircularProgress,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  List,
  ListItem,
  ListItemText,
} from '@mui/material';
import {
  AccessTime,
  Assignment,
  CheckCircle,
  Schedule,
  Lock,
  PlayArrow,
  Info,
} from '@mui/icons-material';
import { useSelector } from 'react-redux';
import { useSnackbar } from 'notistack';
import { RootState } from '../store';
import api from '../services/api';

interface StudentExam {
  _id: string;
  title: string;
  code: string;
  description?: string;
  duration: number;
  status: string;
  schedule: {
    startDate: string;
    endDate: string;
  };
  proctoringSettings: any;
  grading: {
    totalMarks: number;
    passingMarks: number;
  };
  attemptStatus: string;
  attempts: number;
  canAttempt: boolean;
  examStatus: string;
}

const StudentDashboard = () => {
  const { user } = useSelector((state: RootState) => state.auth);
  const { enqueueSnackbar } = useSnackbar();
  const navigate = useNavigate();
  const location = useLocation();

  const [exams, setExams] = useState<StudentExam[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedExam, setSelectedExam] = useState<StudentExam | null>(null);
  const [examAccess, setExamAccess] = useState<any>(null);
  const [showInstructionsDialog, setShowInstructionsDialog] = useState(false);

  useEffect(() => {
    fetchExams();

    // Check if redirected with exam result
    if (location.state?.examResult) {
      const result = location.state.examResult;
      if (result.passed) {
        enqueueSnackbar(`Congratulations! You passed with ${result.score}/${result.totalMarks}`, {
          variant: 'success',
        });
      } else {
        enqueueSnackbar(`Exam submitted. Score: ${result.score}/${result.totalMarks}`, {
          variant: 'info',
        });
      }
    }
  }, []);

  const fetchExams = async () => {
    try {
      const response = await api.get('/student/exams');
      setExams(response.data.data);
    } catch (error: any) {
      enqueueSnackbar(error.response?.data?.message || 'Failed to load exams', {
        variant: 'error',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleStartExam = async (exam: StudentExam) => {
    try {
      const response = await api.get(`/student/exams/${exam._id}/access`);
      setExamAccess(response.data);
      setSelectedExam(exam);

      if (response.data.canStart) {
        setShowInstructionsDialog(true);
      } else {
        enqueueSnackbar(response.data.reason, { variant: 'warning' });
      }
    } catch (error: any) {
      enqueueSnackbar(error.response?.data?.message || 'Failed to access exam', {
        variant: 'error',
      });
    }
  };

  const confirmStartExam = () => {
    setShowInstructionsDialog(false);
    if (selectedExam) {
      navigate(`/student/exam/${selectedExam._id}`);
    }
  };

  const getExamStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'success';
      case 'upcoming':
        return 'info';
      case 'expired':
        return 'error';
      default:
        return 'default';
    }
  };

  const getAttemptStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'success';
      case 'in_progress':
        return 'warning';
      default:
        return 'default';
    }
  };

  if (loading) {
    return (
      <Container maxWidth="lg">
        <Box sx={{ py: 8, textAlign: 'center' }}>
          <CircularProgress size={60} />
          <Typography variant="h6" sx={{ mt: 2 }}>
            Loading exams...
          </Typography>
        </Box>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg">
      <Box sx={{ py: 4 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
          <Box>
            <Typography variant="h4" gutterBottom>
              Student Dashboard
            </Typography>
            <Typography variant="subtitle1" color="textSecondary" gutterBottom>
              Welcome, {user?.name}
            </Typography>
          </Box>
          <Button variant="outlined" onClick={() => navigate('/student/debug')}>
            Debug Info
          </Button>
        </Box>

        <Paper elevation={3} sx={{ p: 3, mt: 3 }}>
          <Typography variant="h6" gutterBottom>
            My Exams
          </Typography>

          {exams.length === 0 ? (
            <Alert severity="info" sx={{ mt: 2 }}>
              You are not enrolled in any exams at the moment. Please check back later or contact your
              administrator.
            </Alert>
          ) : (
            <Grid container spacing={3} sx={{ mt: 1 }}>
              {exams.map((exam) => (
                <Grid item xs={12} md={6} key={exam._id}>
                  <Card elevation={2}>
                    <CardContent>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', mb: 2 }}>
                        <Typography variant="h6" gutterBottom>
                          {exam.title}
                        </Typography>
                        <Chip
                          label={exam.examStatus}
                          size="small"
                          color={getExamStatusColor(exam.examStatus)}
                        />
                      </Box>

                      {exam.description && (
                        <Typography variant="body2" color="textSecondary" gutterBottom>
                          {exam.description}
                        </Typography>
                      )}

                      <Box sx={{ mt: 2 }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                          <AccessTime fontSize="small" sx={{ mr: 1, color: 'text.secondary' }} />
                          <Typography variant="body2" color="textSecondary">
                            Duration: {exam.duration} minutes
                          </Typography>
                        </Box>

                        <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                          <Assignment fontSize="small" sx={{ mr: 1, color: 'text.secondary' }} />
                          <Typography variant="body2" color="textSecondary">
                            Total Marks: {exam.grading.totalMarks} | Passing: {exam.grading.passingMarks}
                          </Typography>
                        </Box>

                        <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                          <Schedule fontSize="small" sx={{ mr: 1, color: 'text.secondary' }} />
                          <Typography variant="body2" color="textSecondary">
                            {new Date(exam.schedule.startDate).toLocaleString()} -{' '}
                            {new Date(exam.schedule.endDate).toLocaleString()}
                          </Typography>
                        </Box>

                        {exam.attemptStatus !== 'not_started' && (
                          <Chip
                            label={exam.attemptStatus === 'completed' ? 'Completed' : 'In Progress'}
                            size="small"
                            color={getAttemptStatusColor(exam.attemptStatus)}
                            sx={{ mt: 1 }}
                          />
                        )}

                        {exam.proctoringSettings.enabled && (
                          <Chip
                            label="Proctored"
                            size="small"
                            icon={<Lock />}
                            variant="outlined"
                            sx={{ mt: 1, ml: 1 }}
                          />
                        )}
                      </Box>
                    </CardContent>
                    <CardActions>
                      <Button
                        variant="contained"
                        color="primary"
                        startIcon={exam.canAttempt ? <PlayArrow /> : <Info />}
                        onClick={() => handleStartExam(exam)}
                        disabled={!exam.canAttempt && exam.examStatus !== 'active'}
                        fullWidth
                      >
                        {exam.canAttempt ? 'Start Exam' : exam.attemptStatus === 'completed' ? 'View Details' : 'View Info'}
                      </Button>
                    </CardActions>
                  </Card>
                </Grid>
              ))}
            </Grid>
          )}
        </Paper>

        {/* Instructions Dialog */}
        <Dialog
          open={showInstructionsDialog}
          onClose={() => setShowInstructionsDialog(false)}
          maxWidth="md"
          fullWidth
        >
          <DialogTitle>
            <Typography variant="h5">Exam Instructions</Typography>
            <Typography variant="subtitle2" color="textSecondary">
              {selectedExam?.title}
            </Typography>
          </DialogTitle>
          <DialogContent>
            {examAccess?.instructions && (
              <>
                <Alert severity="info" sx={{ mb: 2 }}>
                  <Typography variant="body2" gutterBottom>
                    <strong>Duration:</strong> {examAccess.instructions.duration} minutes
                  </Typography>
                  <Typography variant="body2">
                    <strong>Total Questions:</strong> {examAccess.instructions.totalQuestions}
                  </Typography>
                </Alert>

                {examAccess.instructions.proctoringEnabled && (
                  <Alert severity="warning" sx={{ mb: 2 }}>
                    <Typography variant="body2" gutterBottom>
                      <strong>This exam is proctored. Please note:</strong>
                    </Typography>
                    <List dense>
                      {examAccess.instructions.requirements.map((req: string, index: number) => (
                        <ListItem key={index}>
                          <ListItemText primary={`• ${req}`} />
                        </ListItem>
                      ))}
                    </List>
                  </Alert>
                )}

                <Alert severity="success" sx={{ mb: 2 }}>
                  <Typography variant="body2">
                    <strong>General Instructions:</strong>
                  </Typography>
                  <List dense>
                    <ListItem>
                      <ListItemText primary="• Read each question carefully before answering" />
                    </ListItem>
                    <ListItem>
                      <ListItemText primary="• Your answers are auto-saved every 30 seconds" />
                    </ListItem>
                    <ListItem>
                      <ListItemText primary="• You can navigate between questions freely" />
                    </ListItem>
                    <ListItem>
                      <ListItemText primary="• Flag questions you want to review later" />
                    </ListItem>
                    <ListItem>
                      <ListItemText primary="• Submit your exam before time runs out" />
                    </ListItem>
                  </List>
                </Alert>
              </>
            )}
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setShowInstructionsDialog(false)}>Cancel</Button>
            <Button onClick={confirmStartExam} variant="contained" color="primary" startIcon={<PlayArrow />}>
              I Understand, Start Exam
            </Button>
          </DialogActions>
        </Dialog>
      </Box>
    </Container>
  );
};

export default StudentDashboard;
