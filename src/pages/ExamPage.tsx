import { useEffect, useState, useRef, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { useSnackbar } from 'notistack';
import Webcam from 'react-webcam';
import {
  Clock,
  Flag,
  ChevronLeft,
  ChevronRight,
  AlertCircle,
  Video,
  Maximize
} from 'lucide-react';
import { RootState } from '../store';
import { setSessionId, setWarningCount, setMaxWarnings, setSubmitted } from '../store/slices/examSlice';
import socketService from '../services/socket';

interface Question {
  id: string;
  text: string;
  options: { id: string; text: string }[];
}

interface Answer {
  questionId: string;
  selectedOption: string | null;
  flagged: boolean;
  visited: boolean;
}

const ExamPage = () => {
  const { examId } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { enqueueSnackbar } = useSnackbar();
  const { user } = useSelector((state: RootState) => state.auth);
  const { sessionId, warningCount, maxWarnings } = useSelector((state: RootState) => state.exam);

  const [isFullscreen, setIsFullscreen] = useState(false);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [timeRemaining, setTimeRemaining] = useState(3600); // 60 minutes in seconds
  const [cameraError, setCameraError] = useState<string>('');
  const [cameraReady, setCameraReady] = useState(false);
  const webcamRef = useRef<Webcam>(null);
  const socket = useRef<any>(null);

  // Sample questions - Replace with actual API call
  const [questions] = useState<Question[]>([
    {
      id: 'q1',
      text: 'What is the capital of France?',
      options: [
        { id: 'opt1', text: 'London' },
        { id: 'opt2', text: 'Paris' },
        { id: 'opt3', text: 'Berlin' },
        { id: 'opt4', text: 'Madrid' },
      ],
    },
    {
      id: 'q2',
      text: 'Which programming language is known for web development?',
      options: [
        { id: 'opt1', text: 'Python' },
        { id: 'opt2', text: 'JavaScript' },
        { id: 'opt3', text: 'C++' },
        { id: 'opt4', text: 'Java' },
      ],
    },
    {
      id: 'q3',
      text: 'What does HTML stand for?',
      options: [
        { id: 'opt1', text: 'Hyper Text Markup Language' },
        { id: 'opt2', text: 'High Tech Modern Language' },
        { id: 'opt3', text: 'Home Tool Markup Language' },
        { id: 'opt4', text: 'Hyperlinks and Text Markup Language' },
      ],
    },
    {
      id: 'q4',
      text: 'Which CSS property is used to change text color?',
      options: [
        { id: 'opt1', text: 'text-color' },
        { id: 'opt2', text: 'font-color' },
        { id: 'opt3', text: 'color' },
        { id: 'opt4', text: 'text-style' },
      ],
    },
    {
      id: 'q5',
      text: 'What is the correct syntax for a JavaScript function?',
      options: [
        { id: 'opt1', text: 'function myFunction()' },
        { id: 'opt2', text: 'def myFunction()' },
        { id: 'opt3', text: 'function: myFunction()' },
        { id: 'opt4', text: 'func myFunction()' },
      ],
    },
  ]);

  const [answers, setAnswers] = useState<Answer[]>(
    questions.map(q => ({
      questionId: q.id,
      selectedOption: null,
      flagged: false,
      visited: false,
    }))
  );

  // Timer countdown
  useEffect(() => {
    if (timeRemaining <= 0) {
      handleSubmit();
      return;
    }

    const timer = setInterval(() => {
      setTimeRemaining((prev) => prev - 1);
    }, 1000);

    return () => clearInterval(timer);
  }, [timeRemaining]);

  // Mark current question as visited
  useEffect(() => {
    setAnswers((prev) =>
      prev.map((ans, idx) =>
        idx === currentQuestionIndex ? { ...ans, visited: true } : ans
      )
    );
  }, [currentQuestionIndex]);

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

  // Format time to HH:MM:SS
  const formatTime = (seconds: number): string => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  // Handle option selection
  const handleOptionSelect = (optionId: string) => {
    setAnswers((prev) =>
      prev.map((ans, idx) =>
        idx === currentQuestionIndex
          ? { ...ans, selectedOption: optionId }
          : ans
      )
    );
  };

  // Handle flag toggle
  const handleToggleFlag = () => {
    setAnswers((prev) =>
      prev.map((ans, idx) =>
        idx === currentQuestionIndex
          ? { ...ans, flagged: !ans.flagged }
          : ans
      )
    );
  };

  // Navigate to previous question
  const handlePrevious = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(currentQuestionIndex - 1);
    }
  };

  // Navigate to next question
  const handleNext = () => {
    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
    }
  };

  // Navigate to specific question
  const handleQuestionClick = (index: number) => {
    setCurrentQuestionIndex(index);
  };

  // Get question status for navigator
  const getQuestionStatus = (index: number): 'answered' | 'flagged' | 'visited' | 'not-visited' => {
    const answer = answers[index];
    if (answer.selectedOption) return 'answered';
    if (answer.flagged) return 'flagged';
    if (answer.visited) return 'visited';
    return 'not-visited';
  };

  // Get badge color for question status
  const getStatusBadgeColor = (status: string): string => {
    switch (status) {
      case 'answered':
        return 'bg-green-500 hover:bg-green-600';
      case 'flagged':
        return 'bg-orange-500 hover:bg-orange-600';
      case 'visited':
        return 'bg-gray-400 hover:bg-gray-500';
      default:
        return 'bg-gray-200 hover:bg-gray-300';
    }
  };

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

  // Calculate answered questions count
  const answeredCount = answers.filter(ans => ans.selectedOption !== null).length;

  const currentQuestion = questions[currentQuestionIndex];
  const currentAnswer = answers[currentQuestionIndex];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Warning Banner */}
      {warningCount > 0 && (
        <Alert variant="destructive" className="m-4">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            Warning: {warningCount} of {maxWarnings} warnings received.
            {warningCount === maxWarnings && ' Exam will be auto-submitted!'}
          </AlertDescription>
        </Alert>
      )}

      {/* Header */}
      <div className="bg-white shadow-sm border-b sticky top-0 z-10">
        <div className="container mx-auto px-4 py-3">
          <div className="flex justify-between items-center">
            <h1 className="text-xl font-bold">Exam in Progress</h1>

            <div className="flex items-center gap-4">
              {/* Timer */}
              <div className="flex items-center gap-2 px-4 py-2 bg-gray-100 rounded-lg">
                <Clock className="h-5 w-5 text-gray-600" />
                <span className="font-mono text-lg font-semibold">
                  {formatTime(timeRemaining)}
                </span>
              </div>

              {/* Fullscreen Button */}
              <Button
                variant="outline"
                size="sm"
                onClick={enterFullscreen}
                disabled={isFullscreen}
              >
                <Maximize className="h-4 w-4 mr-2" />
                {isFullscreen ? 'Fullscreen Active' : 'Enter Fullscreen'}
              </Button>

              {/* Submit Button */}
              <Button onClick={handleSubmit} size="sm">
                Submit Exam
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-6">
        <div className="flex gap-6">
          {/* Left Column - Question Display (3/4 width) */}
          <div className="flex-1 w-3/4">
            <Card className="p-6">
              {/* Question Header */}
              <div className="flex justify-between items-start mb-6">
                <div>
                  <h2 className="text-2xl font-bold mb-2">
                    Question {currentQuestionIndex + 1} of {questions.length}
                  </h2>
                  <Badge variant={currentAnswer.flagged ? 'destructive' : 'outline'}>
                    {currentAnswer.flagged ? 'Flagged' : 'Not Flagged'}
                  </Badge>
                </div>
                <Button
                  variant={currentAnswer.flagged ? 'destructive' : 'outline'}
                  size="sm"
                  onClick={handleToggleFlag}
                >
                  <Flag className="h-4 w-4 mr-2" />
                  {currentAnswer.flagged ? 'Unflag' : 'Flag'} Question
                </Button>
              </div>

              {/* Question Text */}
              <div className="mb-8 p-4 bg-gray-50 rounded-lg">
                <p className="text-lg">{currentQuestion.text}</p>
              </div>

              {/* Options */}
              <RadioGroup
                value={currentAnswer.selectedOption || ''}
                onValueChange={handleOptionSelect}
              >
                <div className="space-y-3">
                  {currentQuestion.options.map((option) => (
                    <div
                      key={option.id}
                      className={`flex items-center space-x-3 p-4 border-2 rounded-lg cursor-pointer transition-all ${
                        currentAnswer.selectedOption === option.id
                          ? 'border-blue-500 bg-blue-50'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                      onClick={() => handleOptionSelect(option.id)}
                    >
                      <RadioGroupItem value={option.id} id={option.id} />
                      <Label
                        htmlFor={option.id}
                        className="flex-1 cursor-pointer text-base"
                      >
                        {option.text}
                      </Label>
                    </div>
                  ))}
                </div>
              </RadioGroup>

              {/* Navigation Buttons */}
              <div className="flex justify-between mt-8">
                <Button
                  variant="outline"
                  onClick={handlePrevious}
                  disabled={currentQuestionIndex === 0}
                >
                  <ChevronLeft className="h-4 w-4 mr-2" />
                  Previous
                </Button>
                <Button
                  onClick={handleNext}
                  disabled={currentQuestionIndex === questions.length - 1}
                >
                  Next
                  <ChevronRight className="h-4 w-4 ml-2" />
                </Button>
              </div>
            </Card>
          </div>

          {/* Right Column - Navigator and Camera (1/4 width) */}
          <div className="w-1/4 space-y-4">
            {/* Question Navigator */}
            <Card className="p-4">
              <h3 className="font-semibold mb-3 flex items-center justify-between">
                Question Navigator
                <Badge variant="outline">
                  {answeredCount}/{questions.length}
                </Badge>
              </h3>
              <div className="grid grid-cols-4 gap-2">
                {questions.map((_, index) => {
                  const status = getQuestionStatus(index);
                  const isActive = index === currentQuestionIndex;
                  return (
                    <button
                      key={index}
                      onClick={() => handleQuestionClick(index)}
                      className={`
                        aspect-square rounded-md flex items-center justify-center
                        text-sm font-semibold transition-all
                        ${getStatusBadgeColor(status)}
                        ${isActive ? 'ring-2 ring-blue-500 ring-offset-2' : ''}
                        ${status === 'answered' ? 'text-white' : 'text-gray-700'}
                      `}
                    >
                      {index + 1}
                    </button>
                  );
                })}
              </div>

              {/* Legend */}
              <div className="mt-4 pt-4 border-t space-y-2 text-xs">
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 rounded bg-green-500"></div>
                  <span>Answered</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 rounded bg-orange-500"></div>
                  <span>Flagged</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 rounded bg-gray-400"></div>
                  <span>Visited</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 rounded bg-gray-200"></div>
                  <span>Not Visited</span>
                </div>
              </div>
            </Card>

            {/* Camera Feed */}
            <Card className="p-4">
              <h3 className="font-semibold mb-3 flex items-center gap-2">
                <Video className="h-4 w-4" />
                Camera Feed
                {cameraReady && (
                  <Badge variant="success" className="ml-auto">
                    <div className="h-2 w-2 rounded-full bg-green-500 animate-pulse mr-1"></div>
                    Live
                  </Badge>
                )}
              </h3>
              <div className="relative aspect-video bg-black rounded-lg overflow-hidden">
                <Webcam
                  ref={webcamRef}
                  audio={false}
                  screenshotFormat="image/jpeg"
                  videoConstraints={{
                    facingMode: 'user',
                    width: 1280,
                    height: 720,
                  }}
                  className="w-full h-full object-cover"
                  onUserMedia={() => {
                    setCameraReady(true);
                    setCameraError('');
                  }}
                  onUserMediaError={(error) => {
                    setCameraError('Camera access denied or not available');
                    console.error('Camera error:', error);
                  }}
                />
                {cameraReady && (
                  <div className="absolute top-2 right-2">
                    <div className="flex items-center gap-1 px-2 py-1 bg-red-500 rounded-full">
                      <div className="w-2 h-2 bg-white rounded-full animate-pulse"></div>
                      <span className="text-white text-xs font-semibold">REC</span>
                    </div>
                  </div>
                )}
                {!cameraReady && !cameraError && (
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="text-white text-center">
                      <Video className="h-12 w-12 mx-auto mb-2 animate-pulse" />
                      <p className="text-sm">Loading camera...</p>
                      <p className="text-xs mt-1">Please allow camera access</p>
                    </div>
                  </div>
                )}
                {cameraError && (
                  <div className="absolute inset-0 flex items-center justify-center bg-red-900/20">
                    <div className="text-white text-center p-4">
                      <AlertCircle className="h-12 w-12 mx-auto mb-2 text-red-400" />
                      <p className="text-sm font-semibold">{cameraError}</p>
                      <p className="text-xs mt-2">
                        Please enable camera in browser settings
                      </p>
                    </div>
                  </div>
                )}
              </div>
              <Alert className="mt-3">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription className="text-xs">
                  {cameraReady
                    ? 'Keep your face visible at all times'
                    : 'Waiting for camera access...'}
                </AlertDescription>
              </Alert>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ExamPage;
