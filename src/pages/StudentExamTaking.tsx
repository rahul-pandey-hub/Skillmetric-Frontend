import { useEffect, useState, useRef, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import {
  Container,
  Paper,
  Typography,
  Box,
  Button,
  Alert,
  LinearProgress,
  Radio,
  RadioGroup,
  FormControlLabel,
  FormControl,
  FormLabel,
  Checkbox,
  TextField,
  Grid,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Chip,
  IconButton,
  CircularProgress,
} from '@mui/material';
import {
  NavigateNext,
  NavigateBefore,
  Flag,
  Timer,
  Warning,
  CheckCircle,
  Assignment,
} from '@mui/icons-material';
import { useSnackbar } from 'notistack';
import Webcam from 'react-webcam';
import { RootState } from '../store';
import { setSessionId, setWarningCount, setMaxWarnings, setSubmitted } from '../store/slices/examSlice';
import socketService from '../services/socket';
import api from '../services/api';

interface ExamQuestion {
  _id: string;
  questionText: string;
  type: string;
  difficulty: string;
  marks: number;
  options?: Array<{ id: string; text: string }>;
}

interface ExamData {
  sessionId: string;
  exam: {
    _id: string;
    title: string;
    duration: number;
    totalMarks: number;
  };
  questions: ExamQuestion[];
  startTime: string;
  endTime: string;
  proctoringSettings: any;
}

const StudentExamTaking = () => {
  const { examId } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { enqueueSnackbar } = useSnackbar();
  const { user } = useSelector((state: RootState) => state.auth);

  // Exam state
  const [examData, setExamData] = useState<ExamData | null>(null);
  const [loading, setLoading] = useState(true);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState<Map<string, any>>(new Map());
  const [flaggedQuestions, setFlaggedQuestions] = useState<Set<string>>(new Set());
  const [timeRemaining, setTimeRemaining] = useState(0);
  const [submitting, setSubmitting] = useState(false);

  // Proctoring state
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [warningCount, setWarningCountLocal] = useState(0);
  const [showSubmitDialog, setShowSubmitDialog] = useState(false);
  const [showWarningDialog, setShowWarningDialog] = useState(false);
  const [warningMessage, setWarningMessage] = useState('');

  // Refs
  const webcamRef = useRef<Webcam>(null);
  const socket = useRef<any>(null);
  const timerRef = useRef<any>(null);
  const autoSaveRef = useRef<any>(null);

  // Start exam and load questions
  useEffect(() => {
    startExam();
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
      if (autoSaveRef.current) clearInterval(autoSaveRef.current);
      if (socket.current) socketService.disconnect();
    };
  }, [examId]);

  const startExam = async () => {
    try {
      const response = await api.post(`/student/exams/${examId}/start`);
      const data: ExamData = response.data;

      // Debug logging
      console.log('🔍 Exam Started - Full Response:', data);
      console.log('🔒 Proctoring Settings:', data.proctoringSettings);

      setExamData(data);
      dispatch(setSessionId(data.sessionId));

      // Calculate time remaining
      const endTime = new Date(data.endTime).getTime();
      const now = new Date().getTime();
      setTimeRemaining(Math.floor((endTime - now) / 1000));

      // Setup WebSocket for proctoring
      if (data.proctoringSettings.enabled) {
        setupProctoring(data);
      }

      // Enter fullscreen if required
      if (data.proctoringSettings.fullscreenRequired) {
        enterFullscreen();
      }

      setLoading(false);
      enqueueSnackbar('Exam started successfully', { variant: 'success' });
    } catch (error: any) {
      enqueueSnackbar(error.response?.data?.message || 'Failed to start exam', {
        variant: 'error',
      });
      navigate('/student/dashboard');
    }
  };

  const setupProctoring = (data: ExamData) => {
    socket.current = socketService.connect('proctoring');

    socket.current.emit('start-exam', {
      sessionId: data.sessionId,
      examId: data.exam._id,
      studentId: user?.id,
    });

    socket.current.on('warning', (warningData: any) => {
      setWarningCountLocal(warningData.warningCount);
      dispatch(setWarningCount(warningData.warningCount));
      dispatch(setMaxWarnings(warningData.maxWarnings));
      setWarningMessage(warningData.message);
      setShowWarningDialog(true);
    });

    socket.current.on('force-submit', (submitData: any) => {
      enqueueSnackbar(submitData.message, { variant: 'error' });
      handleForceSubmit(submitData.reason);
    });
  };

  // Timer countdown
  useEffect(() => {
    if (timeRemaining > 0 && examData) {
      timerRef.current = setInterval(() => {
        setTimeRemaining((prev) => {
          if (prev <= 1) {
            handleAutoSubmit('Time expired');
            return 0;
          }
          return prev - 1;
        });
      }, 1000);

      return () => clearInterval(timerRef.current);
    }
  }, [timeRemaining, examData]);

  // Auto-save answers
  useEffect(() => {
    if (examData) {
      autoSaveRef.current = setInterval(() => {
        saveCurrentAnswer();
      }, 30000); // Save every 30 seconds

      return () => clearInterval(autoSaveRef.current);
    }
  }, [examData, currentQuestionIndex, answers]);

  // Proctoring: Tab Switch Detection
  useEffect(() => {
    console.log('📋 Tab Switch Detection:', examData?.proctoringSettings?.tabSwitchDetection ? 'ENABLED' : 'DISABLED');
    if (!examData?.proctoringSettings?.tabSwitchDetection) return;

    const handleVisibilityChange = () => {
      if (document.hidden && examData.sessionId) {
        reportViolation('TAB_SWITCH', {
          description: 'Student switched tabs or minimized window',
        });
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => document.removeEventListener('visibilitychange', handleVisibilityChange);
  }, [examData]);

  // Proctoring: Copy/Paste Detection
  useEffect(() => {
    if (!examData?.proctoringSettings?.copyPasteDetection) return;

    const handleCopyPaste = (e: ClipboardEvent) => {
      e.preventDefault();
      reportViolation('COPY_PASTE', {
        description: `${e.type} operation attempted`,
      });
    };

    document.addEventListener('copy', handleCopyPaste);
    document.addEventListener('paste', handleCopyPaste);
    document.addEventListener('cut', handleCopyPaste);
    return () => {
      document.removeEventListener('copy', handleCopyPaste);
      document.removeEventListener('paste', handleCopyPaste);
      document.removeEventListener('cut', handleCopyPaste);
    };
  }, [examData]);

  // Proctoring: Right Click Detection
  useEffect(() => {
    if (!examData?.proctoringSettings?.rightClickDisabled) return;

    const handleRightClick = (e: MouseEvent) => {
      e.preventDefault();
      reportViolation('RIGHT_CLICK', {
        description: 'Right-click attempted',
      });
    };

    document.addEventListener('contextmenu', handleRightClick);
    return () => document.removeEventListener('contextmenu', handleRightClick);
  }, [examData]);

  // Proctoring: Fullscreen Detection
  useEffect(() => {
    if (!examData?.proctoringSettings?.fullscreenRequired) return;

    const handleFullscreenChange = () => {
      const isFullscreenNow = !!document.fullscreenElement;
      setIsFullscreen(isFullscreenNow);

      if (!isFullscreenNow && examData.sessionId) {
        reportViolation('FULLSCREEN_EXIT', {
          description: 'Student exited fullscreen mode',
        });
      }
    };

    document.addEventListener('fullscreenchange', handleFullscreenChange);
    return () => document.removeEventListener('fullscreenchange', handleFullscreenChange);
  }, [examData]);

  // Proctoring: Dev Tools Detection
  useEffect(() => {
    if (!examData?.proctoringSettings?.devToolsDetection) return;

    const detectDevTools = () => {
      const threshold = 160;
      const widthThreshold = window.outerWidth - window.innerWidth > threshold;
      const heightThreshold = window.outerHeight - window.innerHeight > threshold;

      if ((widthThreshold || heightThreshold) && examData.sessionId) {
        reportViolation('DEV_TOOLS', {
          description: 'Developer tools detected',
        });
      }
    };

    const interval = setInterval(detectDevTools, 2000);
    return () => clearInterval(interval);
  }, [examData]);

  // Report violation to server
  const reportViolation = useCallback((type: string, details: any) => {
    if (socket.current && examData?.sessionId) {
      socket.current.emit('violation', {
        sessionId: examData.sessionId,
        type,
        details,
      });
    }
  }, [examData]);

  // Enter fullscreen
  const enterFullscreen = () => {
    document.documentElement.requestFullscreen().catch((err) => {
      console.error('Error entering fullscreen:', err);
      enqueueSnackbar('Please enable fullscreen mode', { variant: 'warning' });
    });
  };

  // Format time
  const formatTime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  // Handle answer change
  const handleAnswerChange = (questionId: string, value: any, type: string) => {
    const newAnswers = new Map(answers);

    if (type === 'MULTIPLE_CHOICE') {
      // For multiple choice, value is array of selected options
      newAnswers.set(questionId, { selectedOptions: value });
    } else if (type === 'TRUE_FALSE') {
      newAnswers.set(questionId, { selectedOption: value });
    } else {
      newAnswers.set(questionId, { answer: value });
    }

    setAnswers(newAnswers);
  };

  // Save current answer
  const saveCurrentAnswer = async () => {
    if (!examData) return;

    const currentQuestion = examData.questions[currentQuestionIndex];
    const answer = answers.get(currentQuestion._id);

    if (answer && examData.sessionId) {
      try {
        await api.post(`/student/exams/${examData.sessionId}/save-answer`, {
          questionId: currentQuestion._id,
          answer,
        });
      } catch (error) {
        console.error('Failed to save answer:', error);
      }
    }
  };

  // Navigate to question
  const goToQuestion = async (index: number) => {
    await saveCurrentAnswer();
    setCurrentQuestionIndex(index);
  };

  // Toggle flag
  const toggleFlag = (questionId: string) => {
    const newFlagged = new Set(flaggedQuestions);
    if (newFlagged.has(questionId)) {
      newFlagged.delete(questionId);
    } else {
      newFlagged.add(questionId);
    }
    setFlaggedQuestions(newFlagged);
  };

  // Handle submit
  const handleSubmit = () => {
    setShowSubmitDialog(true);
  };

  const confirmSubmit = async () => {
    setShowSubmitDialog(false);
    await submitExam();
  };

  const submitExam = async () => {
    if (!examData) return;

    setSubmitting(true);
    await saveCurrentAnswer();

    try {
      // Convert answers map to array
      const answersArray = Array.from(answers.entries()).map(([questionId, answer]) => ({
        questionId,
        ...answer,
      }));

      const response = await api.post(`/student/exams/${examData.exam._id}/submit`, {
        sessionId: examData.sessionId,
        answers: answersArray,
      });

      if (socket.current) {
        socket.current.emit('submit-exam', {
          sessionId: examData.sessionId,
          answers: answersArray,
        });
      }

      dispatch(setSubmitted(true));
      enqueueSnackbar('Exam submitted successfully!', { variant: 'success' });

      // Navigate to results or dashboard
      navigate('/student/dashboard', {
        state: { examResult: response.data },
      });
    } catch (error: any) {
      enqueueSnackbar(error.response?.data?.message || 'Failed to submit exam', {
        variant: 'error',
      });
      setSubmitting(false);
    }
  };

  const handleForceSubmit = async (reason: string) => {
    enqueueSnackbar(`Exam auto-submitted: ${reason}`, { variant: 'error' });
    await submitExam();
  };

  const handleAutoSubmit = async (reason: string) => {
    enqueueSnackbar(`Time expired! Submitting exam...`, { variant: 'warning' });
    await handleForceSubmit(reason);
  };

  if (loading) {
    return (
      <Container maxWidth="lg">
        <Box sx={{ py: 8, textAlign: 'center' }}>
          <CircularProgress size={60} />
          <Typography variant="h6" sx={{ mt: 2 }}>
            Loading exam...
          </Typography>
        </Box>
      </Container>
    );
  }

  if (!examData) {
    return null;
  }

  const currentQuestion = examData.questions[currentQuestionIndex];
  const progress = ((currentQuestionIndex + 1) / examData.questions.length) * 100;
  const answeredCount = answers.size;

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: '#f5f5f5', py: 2 }}>
      <Container maxWidth="lg">
        {/* Header with timer and warnings */}
        <Paper elevation={3} sx={{ p: 2, mb: 2, position: 'sticky', top: 0, zIndex: 100 }}>
          <Grid container spacing={2} alignItems="center">
            <Grid item xs={12} md={4}>
              <Typography variant="h6" sx={{ display: 'flex', alignItems: 'center' }}>
                <Assignment sx={{ mr: 1 }} />
                {examData.exam.title}
              </Typography>
            </Grid>
            <Grid item xs={6} md={4} sx={{ textAlign: 'center' }}>
              <Typography
                variant="h5"
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: timeRemaining < 300 ? 'error.main' : 'primary.main',
                  fontWeight: 'bold',
                }}
              >
                <Timer sx={{ mr: 1 }} />
                {formatTime(timeRemaining)}
              </Typography>
            </Grid>
            <Grid item xs={6} md={4} sx={{ textAlign: 'right' }}>
              {warningCount > 0 && (
                <Chip
                  icon={<Warning />}
                  label={`Warnings: ${warningCount}/${examData.proctoringSettings.violationWarningLimit}`}
                  color="warning"
                  sx={{ mr: 1 }}
                />
              )}
              <Button
                variant="contained"
                color="success"
                onClick={handleSubmit}
                disabled={submitting}
                startIcon={<CheckCircle />}
              >
                Submit Exam
              </Button>
            </Grid>
          </Grid>

          {/* Progress bar */}
          <Box sx={{ mt: 2 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
              <Typography variant="body2">
                Question {currentQuestionIndex + 1} of {examData.questions.length}
              </Typography>
              <Typography variant="body2">
                Answered: {answeredCount}/{examData.questions.length}
              </Typography>
            </Box>
            <LinearProgress variant="determinate" value={progress} sx={{ height: 8, borderRadius: 1 }} />
          </Box>
        </Paper>

        <Grid container spacing={2}>
          {/* Question panel */}
          <Grid item xs={12} md={9}>
            <Paper elevation={3} sx={{ p: 3, minHeight: 500 }}>
              <Box sx={{ display: 'flex', justifyContent: 'between', alignItems: 'start', mb: 2 }}>
                <Box sx={{ flex: 1 }}>
                  <Typography variant="h6" gutterBottom>
                    Question {currentQuestionIndex + 1}
                  </Typography>
                  <Chip
                    label={currentQuestion.difficulty}
                    size="small"
                    color={
                      currentQuestion.difficulty === 'EASY'
                        ? 'success'
                        : currentQuestion.difficulty === 'MEDIUM'
                        ? 'warning'
                        : 'error'
                    }
                    sx={{ mr: 1 }}
                  />
                  <Chip label={`${currentQuestion.marks} marks`} size="small" variant="outlined" />
                </Box>
                <IconButton
                  onClick={() => toggleFlag(currentQuestion._id)}
                  color={flaggedQuestions.has(currentQuestion._id) ? 'warning' : 'default'}
                >
                  <Flag />
                </IconButton>
              </Box>

              <Typography variant="body1" sx={{ mb: 3, fontSize: '1.1rem', lineHeight: 1.8 }}>
                {currentQuestion.questionText}
              </Typography>


              {currentQuestion.type === 'MULTIPLE_CHOICE' && (
                <FormControl component="fieldset" fullWidth>
                  <FormLabel component="legend">Select all that apply</FormLabel>
                  {currentQuestion.options?.map((option) => {
                    const selectedOptions = answers.get(currentQuestion._id)?.selectedOptions || [];
                    return (
                      <FormControlLabel
                        key={option.id}
                        control={
                          <Checkbox
                            checked={selectedOptions.includes(option.id)}
                            onChange={(e) => {
                              const newSelected = e.target.checked
                                ? [...selectedOptions, option.id]
                                : selectedOptions.filter((id: string) => id !== option.id);
                              handleAnswerChange(currentQuestion._id, newSelected, 'MULTIPLE_CHOICE');
                            }}
                          />
                        }
                        label={option.text}
                        sx={{
                          mb: 1,
                          p: 2,
                          border: '1px solid #e0e0e0',
                          borderRadius: 1,
                          '&:hover': { bgcolor: '#f5f5f5' },
                        }}
                      />
                    );
                  })}
                </FormControl>
              )}

              {currentQuestion.type === 'TRUE_FALSE' && (
                <FormControl component="fieldset" fullWidth>
                  <RadioGroup
                    value={answers.get(currentQuestion._id)?.selectedOption || ''}
                    onChange={(e) => handleAnswerChange(currentQuestion._id, e.target.value, 'TRUE_FALSE')}
                  >
                    <FormControlLabel
                      value="true"
                      control={<Radio />}
                      label="True"
                      sx={{
                        mb: 1,
                        p: 2,
                        border: '1px solid #e0e0e0',
                        borderRadius: 1,
                        '&:hover': { bgcolor: '#f5f5f5' },
                      }}
                    />
                    <FormControlLabel
                      value="false"
                      control={<Radio />}
                      label="False"
                      sx={{
                        mb: 1,
                        p: 2,
                        border: '1px solid #e0e0e0',
                        borderRadius: 1,
                        '&:hover': { bgcolor: '#f5f5f5' },
                      }}
                    />
                  </RadioGroup>
                </FormControl>
              )}

              {(currentQuestion.type === 'SHORT_ANSWER' || currentQuestion.type === 'FILL_BLANK') && (
                <TextField
                  fullWidth
                  multiline
                  rows={3}
                  placeholder="Type your answer here..."
                  value={answers.get(currentQuestion._id)?.answer || ''}
                  onChange={(e) => handleAnswerChange(currentQuestion._id, e.target.value, currentQuestion.type)}
                  variant="outlined"
                />
              )}

              {currentQuestion.type === 'ESSAY' && (
                <TextField
                  fullWidth
                  multiline
                  rows={8}
                  placeholder="Type your essay here..."
                  value={answers.get(currentQuestion._id)?.answer || ''}
                  onChange={(e) => handleAnswerChange(currentQuestion._id, e.target.value, 'ESSAY')}
                  variant="outlined"
                />
              )}

              {/* Navigation buttons */}
              <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 4 }}>
                <Button
                  variant="outlined"
                  startIcon={<NavigateBefore />}
                  onClick={() => goToQuestion(currentQuestionIndex - 1)}
                  disabled={currentQuestionIndex === 0}
                >
                  Previous
                </Button>
                <Button
                  variant="contained"
                  endIcon={<NavigateNext />}
                  onClick={() => goToQuestion(currentQuestionIndex + 1)}
                  disabled={currentQuestionIndex === examData.questions.length - 1}
                >
                  Next
                </Button>
              </Box>
            </Paper>
          </Grid>

          {/* Question navigator */}
          <Grid item xs={12} md={3}>
            <Paper elevation={3} sx={{ p: 2, position: 'sticky', top: 140 }}>
              <Typography variant="h6" gutterBottom>
                Questions
              </Typography>
              <Grid container spacing={1}>
                {examData.questions.map((question, index) => {
                  const isAnswered = answers.has(question._id);
                  const isFlagged = flaggedQuestions.has(question._id);
                  const isCurrent = index === currentQuestionIndex;

                  return (
                    <Grid item xs={3} key={question._id}>
                      <Button
                        variant={isCurrent ? 'contained' : 'outlined'}
                        size="small"
                        onClick={() => goToQuestion(index)}
                        sx={{
                          minWidth: 40,
                          height: 40,
                          bgcolor: isAnswered ? (isCurrent ? 'primary.main' : 'success.light') : undefined,
                          color: isAnswered && !isCurrent ? 'white' : undefined,
                          borderColor: isFlagged ? 'warning.main' : undefined,
                          borderWidth: isFlagged ? 2 : 1,
                          '&:hover': {
                            bgcolor: isAnswered ? 'success.main' : undefined,
                          },
                        }}
                      >
                        {index + 1}
                      </Button>
                    </Grid>
                  );
                })}
              </Grid>

              <Box sx={{ mt: 2 }}>
                <Typography variant="caption" display="block" gutterBottom>
                  <Box component="span" sx={{ display: 'inline-block', width: 16, height: 16, bgcolor: 'success.light', mr: 1, borderRadius: 0.5 }} />
                  Answered
                </Typography>
                <Typography variant="caption" display="block" gutterBottom>
                  <Box component="span" sx={{ display: 'inline-block', width: 16, height: 16, border: '1px solid', borderColor: 'grey.400', mr: 1, borderRadius: 0.5 }} />
                  Not Answered
                </Typography>
                <Typography variant="caption" display="block">
                  <Box component="span" sx={{ display: 'inline-block', width: 16, height: 16, border: '2px solid', borderColor: 'warning.main', mr: 1, borderRadius: 0.5 }} />
                  Flagged
                </Typography>
              </Box>
            </Paper>
          </Grid>
        </Grid>

        {/* Hidden webcam for proctoring */}
        {examData.proctoringSettings.webcamRequired && (
          <Box sx={{ display: 'none' }}>
            <Webcam
              ref={webcamRef}
              audio={false}
              screenshotFormat="image/jpeg"
              videoConstraints={{ facingMode: 'user' }}
            />
          </Box>
        )}

        {/* Submit confirmation dialog */}
        <Dialog open={showSubmitDialog} onClose={() => setShowSubmitDialog(false)}>
          <DialogTitle>Submit Exam?</DialogTitle>
          <DialogContent>
            <Typography>
              Are you sure you want to submit your exam? You have answered {answeredCount} out of{' '}
              {examData.questions.length} questions.
            </Typography>
            {answeredCount < examData.questions.length && (
              <Alert severity="warning" sx={{ mt: 2 }}>
                You have {examData.questions.length - answeredCount} unanswered questions!
              </Alert>
            )}
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setShowSubmitDialog(false)}>Cancel</Button>
            <Button onClick={confirmSubmit} variant="contained" color="success" disabled={submitting}>
              {submitting ? 'Submitting...' : 'Submit'}
            </Button>
          </DialogActions>
        </Dialog>

        {/* Warning dialog */}
        <Dialog open={showWarningDialog} onClose={() => setShowWarningDialog(false)}>
          <DialogTitle sx={{ bgcolor: 'warning.main', color: 'white' }}>
            <Warning sx={{ mr: 1, verticalAlign: 'middle' }} />
            Security Warning
          </DialogTitle>
          <DialogContent sx={{ mt: 2 }}>
            <Typography>{warningMessage}</Typography>
            <Alert severity="error" sx={{ mt: 2 }}>
              Warning {warningCount} of {examData.proctoringSettings.violationWarningLimit}. Exceeding the limit will
              result in automatic submission!
            </Alert>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setShowWarningDialog(false)} variant="contained">
              I Understand
            </Button>
          </DialogActions>
        </Dialog>
      </Container>
    </Box>
  );
};

export default StudentExamTaking;
