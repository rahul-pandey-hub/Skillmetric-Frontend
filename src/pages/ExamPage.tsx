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
} from '@mui/material';
import { useSnackbar } from 'notistack';
import Webcam from 'react-webcam';
import { RootState } from '../store';
import { setSessionId, setWarningCount, setMaxWarnings, setSubmitted } from '../store/slices/examSlice';
import socketService from '../services/socket';

const ExamPage = () => {
  const { examId } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { enqueueSnackbar } = useSnackbar();
  const { user } = useSelector((state: RootState) => state.auth);
  const { sessionId, warningCount, maxWarnings } = useSelector((state: RootState) => state.exam);

  const [isFullscreen, setIsFullscreen] = useState(false);
  const [answers, setAnswers] = useState<any[]>([]);
  const webcamRef = useRef<Webcam>(null);
  const socket = useRef<any>(null);

  // Connect to proctoring WebSocket
  useEffect(() => {
    socket.current = socketService.connect('proctoring');

    // Start exam session
    socket.current.emit('start-exam', {
      examId,
      studentId: user?.id,
    });

    // Listen for exam started
    socket.current.on('exam-started', (data: any) => {
      dispatch(setSessionId(data.sessionId));
      enqueueSnackbar('Exam started successfully', { variant: 'success' });
    });

    // Listen for warnings
    socket.current.on('warning', (data: any) => {
      dispatch(setWarningCount(data.warningCount));
      dispatch(setMaxWarnings(data.maxWarnings));
      enqueueSnackbar(data.message, { variant: 'warning' });
    });

    // Listen for force submit
    socket.current.on('force-submit', (data: any) => {
      enqueueSnackbar(data.message, { variant: 'error' });
      handleForceSubmit(data.reason);
    });

    return () => {
      socketService.disconnect();
    };
  }, [examId, user, dispatch, enqueueSnackbar]);

  // Proctoring: Tab Switch Detection
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.hidden && sessionId) {
        reportViolation('TAB_SWITCH', {
          description: 'Student switched tabs',
        });
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => document.removeEventListener('visibilitychange', handleVisibilityChange);
  }, [sessionId]);

  // Proctoring: Copy/Paste Detection
  useEffect(() => {
    const handleCopyPaste = (e: ClipboardEvent) => {
      e.preventDefault();
      if (sessionId) {
        reportViolation('COPY_PASTE', {
          description: `${e.type} operation detected`,
        });
      }
    };

    document.addEventListener('copy', handleCopyPaste);
    document.addEventListener('paste', handleCopyPaste);
    return () => {
      document.removeEventListener('copy', handleCopyPaste);
      document.removeEventListener('paste', handleCopyPaste);
    };
  }, [sessionId]);

  // Proctoring: Right Click Detection
  useEffect(() => {
    const handleRightClick = (e: MouseEvent) => {
      e.preventDefault();
      if (sessionId) {
        reportViolation('RIGHT_CLICK', {
          description: 'Right-click detected',
        });
      }
    };

    document.addEventListener('contextmenu', handleRightClick);
    return () => document.removeEventListener('contextmenu', handleRightClick);
  }, [sessionId]);

  // Proctoring: Fullscreen Detection
  useEffect(() => {
    const handleFullscreenChange = () => {
      const isFullscreenNow = !!document.fullscreenElement;
      setIsFullscreen(isFullscreenNow);

      if (!isFullscreenNow && sessionId) {
        reportViolation('FULLSCREEN_EXIT', {
          description: 'Student exited fullscreen mode',
        });
      }
    };

    document.addEventListener('fullscreenchange', handleFullscreenChange);
    return () => document.removeEventListener('fullscreenchange', handleFullscreenChange);
  }, [sessionId]);

  // Proctoring: Dev Tools Detection
  useEffect(() => {
    const detectDevTools = () => {
      const threshold = 160;
      const widthThreshold = window.outerWidth - window.innerWidth > threshold;
      const heightThreshold = window.outerHeight - window.innerHeight > threshold;

      if ((widthThreshold || heightThreshold) && sessionId) {
        reportViolation('DEV_TOOLS', {
          description: 'Developer tools detected',
        });
      }
    };

    const interval = setInterval(detectDevTools, 1000);
    return () => clearInterval(interval);
  }, [sessionId]);

  // Report violation to server
  const reportViolation = useCallback((type: string, details: any) => {
    if (socket.current && sessionId) {
      socket.current.emit('violation', {
        sessionId,
        type,
        details,
      });
    }
  }, [sessionId]);

  // Enter fullscreen
  const enterFullscreen = () => {
    document.documentElement.requestFullscreen().catch((err) => {
      console.error('Error entering fullscreen:', err);
    });
  };

  // Handle force submit
  const handleForceSubmit = (reason: string) => {
    dispatch(setSubmitted(true));

    if (socket.current && sessionId) {
      socket.current.emit('submit-exam', {
        sessionId,
        answers,
      });
    }

    setTimeout(() => {
      navigate('/student/dashboard');
    }, 3000);
  };

  // Handle manual submit
  const handleSubmit = () => {
    if (socket.current && sessionId) {
      socket.current.emit('submit-exam', {
        sessionId,
        answers,
      });
    }

    dispatch(setSubmitted(true));
    enqueueSnackbar('Exam submitted successfully', { variant: 'success' });
    navigate('/student/dashboard');
  };

  return (
    <Container maxWidth="lg">
      <Box sx={{ py: 3 }}>
        {/* Warning Banner */}
        {warningCount > 0 && (
          <Alert severity="warning" sx={{ mb: 2 }}>
            Warning: {warningCount} of {maxWarnings} used
            {warningCount === maxWarnings && ' - Exam will be auto-submitted!'}
          </Alert>
        )}

        {/* Exam Header */}
        <Paper elevation={3} sx={{ p: 3, mb: 3 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Typography variant="h5">Exam in Progress</Typography>
            <Box>
              <Button
                variant="outlined"
                onClick={enterFullscreen}
                disabled={isFullscreen}
                sx={{ mr: 2 }}
              >
                {isFullscreen ? 'Fullscreen Active' : 'Enter Fullscreen'}
              </Button>
              <Button variant="contained" color="primary" onClick={handleSubmit}>
                Submit Exam
              </Button>
            </Box>
          </Box>

          {/* Progress */}
          <Box sx={{ mt: 2 }}>
            <Typography variant="body2" gutterBottom>
              Progress: 0/10 Questions
            </Typography>
            <LinearProgress variant="determinate" value={0} />
          </Box>
        </Paper>

        {/* Webcam (Hidden but active) */}
        <Box sx={{ display: 'none' }}>
          <Webcam
            ref={webcamRef}
            audio={false}
            screenshotFormat="image/jpeg"
            videoConstraints={{
              facingMode: 'user',
            }}
          />
        </Box>

        {/* Exam Content */}
        <Paper elevation={3} sx={{ p: 3 }}>
          <Typography variant="h6" gutterBottom>
            Question 1
          </Typography>
          <Typography variant="body1">
            This is a sample question. The actual exam questions will be loaded here.
          </Typography>

          <Alert severity="info" sx={{ mt: 3 }}>
            <Typography variant="body2">
              <strong>Proctoring Active:</strong>
              <ul>
                <li>Do not switch tabs</li>
                <li>Do not copy/paste</li>
                <li>Stay in fullscreen mode</li>
                <li>Keep your face visible to the camera</li>
              </ul>
            </Typography>
          </Alert>
        </Paper>
      </Box>
    </Container>
  );
};

export default ExamPage;
