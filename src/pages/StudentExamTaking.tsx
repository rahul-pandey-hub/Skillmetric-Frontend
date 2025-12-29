import { useEffect, useState, useRef, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  ChevronRight,
  ChevronLeft,
  Flag,
  Timer,
  AlertTriangle,
  CheckCircle,
  FileText,
  Loader2,
} from 'lucide-react';
import { useSnackbar } from 'notistack';
import FaceProctoring from '../components/proctoring/FaceProctoring';
import { useAuthStore } from '../store/authStore';
import socketService from '../services/socket';
import api from '../services/api';
import { Button } from '../components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Checkbox } from '../components/ui/checkbox';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Progress } from '../components/ui/progress';
import { Badge } from '../components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '../components/ui/dialog';
import { cn } from '../lib/utils';

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
  const { examId, token } = useParams<{ examId?: string; token?: string }>();
  const navigate = useNavigate();
  const { enqueueSnackbar } = useSnackbar();
  const { user } = useAuthStore();

  // Check if this is invitation-based access
  const isInvitationBased = !!token;

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
  const socket = useRef<any>(null);
  const timerRef = useRef<any>(null);
  const autoSaveRef = useRef<any>(null);

  // Start exam and load questions
  useEffect(() => {
    startExam();

    // Set page title
    document.title = 'Exam in Progress - SkillMetric';

    // Prevent accidental page close
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      e.preventDefault();
      e.returnValue = '';
    };

    window.addEventListener('beforeunload', handleBeforeUnload);

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
      if (autoSaveRef.current) clearInterval(autoSaveRef.current);
      if (socket.current) socketService.disconnect();
      window.removeEventListener('beforeunload', handleBeforeUnload);
      document.title = 'SkillMetric';
    };
  }, [examId]);

  const startExam = async () => {
    try {
      let data: ExamData;

      if (isInvitationBased) {
        // For invitation-based access, data is already loaded when starting exam
        const invitationToken = localStorage.getItem('invitationToken');
        const sessionId = localStorage.getItem('invitationSessionId');
        const examDataStr = localStorage.getItem('invitationExamData');

        if (!invitationToken || !sessionId || !examDataStr) {
          enqueueSnackbar('Session expired. Please use the invitation link again.', { variant: 'error' });
          navigate(`/exam/invitation/${token}`);
          return;
        }

        // Use temporary JWT for API calls
        api.defaults.headers.common['Authorization'] = `Bearer ${invitationToken}`;

        data = JSON.parse(examDataStr);
      } else {
        // Regular student exam start
        const response = await api.post(`/student/exams/${examId}/start`);
        data = response.data;
      }

      console.log('🔍 Exam Started - Full Response:', data);
      console.log('🔒 Proctoring Settings:', data.proctoringSettings);
      console.log('📝 Questions:', data.questions);
      console.log('🎯 Is Invitation Based:', isInvitationBased);

      setExamData(data);

      // Calculate time remaining
      const endTime = new Date(data.endTime).getTime();
      const now = new Date().getTime();
      setTimeRemaining(Math.floor((endTime - now) / 1000));

      // Setup WebSocket for proctoring
      if (data.proctoringSettings.enabled) {
        setupProctoring(data);
      }

      // Note: Fullscreen will be requested when user clicks first question
      // Browser security doesn't allow automatic fullscreen without user gesture

      setLoading(false);
      enqueueSnackbar('Exam started successfully', { variant: 'success' });
    } catch (error: any) {
      enqueueSnackbar(error.response?.data?.message || 'Failed to start exam', {
        variant: 'error',
      });
      navigate('/student');
    }
  };

  const setupProctoring = (data: ExamData) => {
    // For invitation-based access, connect with temporary token
    if (isInvitationBased) {
      const invitationToken = localStorage.getItem('invitationToken');
      socket.current = socketService.connect('proctoring', invitationToken);
    } else {
      socket.current = socketService.connect('proctoring');
    }

    socket.current.emit('start-exam', {
      sessionId: data.sessionId,
      examId: data.exam._id,
      studentId: user?.id || null, // null for invitation-based access
      accessSource: isInvitationBased ? 'INVITATION' : 'ENROLLMENT',
    });

    socket.current.on('warning', (warningData: any) => {
      setWarningCountLocal(warningData.warningCount);
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

  // Face detection callbacks
  const handleFaceWarning = useCallback((type: 'NO_FACE' | 'MULTIPLE_FACES') => {
    const messages = {
      NO_FACE: 'Face not detected! Please ensure your face is visible in the camera.',
      MULTIPLE_FACES: 'Multiple faces detected! Only you should be visible during the exam.'
    };
    reportViolation(type, { message: messages[type] });
  }, [reportViolation]);

  const handleCameraError = useCallback((error: string) => {
    enqueueSnackbar(error, { variant: 'error' });
  }, [enqueueSnackbar]);

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

      enqueueSnackbar('Exam submitted successfully!', { variant: 'success' });
      navigate('/student', {
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
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <Loader2 className="w-16 h-16 animate-spin text-primary mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-gray-700">Loading exam...</h3>
        </div>
      </div>
    );
  }

  if (!examData) {
    return null;
  }

  if (!examData.questions || examData.questions.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Card className="p-8 max-w-md">
          <CardHeader>
            <CardTitle className="text-red-600">No Questions Available</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-600 mb-4">
              This exam has no questions. Please contact the administrator.
            </p>
            <Button onClick={() => navigate(-1)}>Go Back</Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const currentQuestion = examData.questions[currentQuestionIndex];
  const progress = ((currentQuestionIndex + 1) / examData.questions.length) * 100;
  const answeredCount = answers.size;

  return (
    <div className="min-h-screen bg-gray-50 py-2">
      <div className="max-w-7xl mx-auto px-2 sm:px-4">
        {/* Header with timer and warnings */}
        <Card className="mb-4 sticky top-0 z-50 shadow-lg">
          <CardContent className="p-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-center">
              <div className="flex items-center gap-2">
                <FileText className="w-5 h-5 text-primary" />
                <h1 className="text-lg font-bold truncate">{examData.exam.title}</h1>
              </div>

              <div className="flex items-center justify-center gap-2">
                <Timer className={cn(
                  "w-6 h-6",
                  timeRemaining < 300 ? "text-red-500" : "text-primary"
                )} />
                <span className={cn(
                  "text-2xl font-bold tabular-nums",
                  timeRemaining < 300 ? "text-red-500" : "text-primary"
                )}>
                  {formatTime(timeRemaining)}
                </span>
              </div>

              <div className="flex items-center justify-end gap-2">
                {warningCount > 0 && (
                  <Badge variant="destructive" className="flex items-center gap-1">
                    <AlertTriangle className="w-4 h-4" />
                    Warnings: {warningCount}/{examData.proctoringSettings.violationWarningLimit}
                  </Badge>
                )}
                <Button
                  variant="success"
                  onClick={handleSubmit}
                  disabled={submitting}
                  className="flex items-center gap-2"
                >
                  <CheckCircle className="w-4 h-4" />
                  Submit Exam
                </Button>
              </div>
            </div>

            {/* Progress bar */}
            <div className="mt-4">
              <div className="flex justify-between text-sm text-gray-600 mb-2">
                <span>Question {currentQuestionIndex + 1} of {examData.questions.length}</span>
                <span>Answered: {answeredCount}/{examData.questions.length}</span>
              </div>
              <Progress value={progress} className="h-2" />
            </div>
          </CardContent>
        </Card>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-4 items-start">
          {/* Question panel */}
          <div className="lg:col-span-3">
            <Card className="shadow-lg h-full">
              <CardContent className="p-6">
                <div className="flex justify-between items-start mb-4">
                  <div className="flex-1">
                    <h2 className="text-xl font-bold mb-2">Question {currentQuestionIndex + 1}</h2>
                    <div className="flex gap-2">
                      <Badge
                        variant={
                          currentQuestion.difficulty === 'EASY'
                            ? 'success'
                            : currentQuestion.difficulty === 'MEDIUM'
                            ? 'default'
                            : 'destructive'
                        }
                      >
                        {currentQuestion.difficulty}
                      </Badge>
                      <Badge variant="outline">{currentQuestion.marks} marks</Badge>
                    </div>
                  </div>
                  <Button
                    variant={flaggedQuestions.has(currentQuestion._id) ? 'default' : 'ghost'}
                    size="icon"
                    onClick={() => toggleFlag(currentQuestion._id)}
                    className={flaggedQuestions.has(currentQuestion._id) ? 'bg-yellow-500 hover:bg-yellow-600' : ''}
                  >
                    <Flag className="w-5 h-5" />
                  </Button>
                </div>

                <p className="text-lg leading-relaxed mb-6">{currentQuestion.questionText}</p>

                {/* Multiple Choice Questions */}
                {currentQuestion.type === 'MULTIPLE_CHOICE' && (
                  <div className="space-y-3">
                    <Label className="text-sm text-gray-600">Select all that apply</Label>
                    {currentQuestion.options?.map((option) => {
                      const selectedOptions = answers.get(currentQuestion._id)?.selectedOptions || [];
                      const isChecked = selectedOptions.includes(option.id);

                      return (
                        <div
                          key={option.id}
                          className={cn(
                            "flex items-start gap-3 p-4 border rounded-lg cursor-pointer transition-all hover:bg-gray-50",
                            isChecked && "bg-primary/5 border-primary"
                          )}
                          onClick={() => {
                            const newSelected = isChecked
                              ? selectedOptions.filter((id: string) => id !== option.id)
                              : [...selectedOptions, option.id];
                            handleAnswerChange(currentQuestion._id, newSelected, 'MULTIPLE_CHOICE');
                          }}
                        >
                          <Checkbox
                            checked={isChecked}
                            onCheckedChange={(checked) => {
                              const newSelected = checked
                                ? [...selectedOptions, option.id]
                                : selectedOptions.filter((id: string) => id !== option.id);
                              handleAnswerChange(currentQuestion._id, newSelected, 'MULTIPLE_CHOICE');
                            }}
                          />
                          <Label className="flex-1 cursor-pointer">{option.text}</Label>
                        </div>
                      );
                    })}
                  </div>
                )}

                {/* True/False Questions */}
                {currentQuestion.type === 'TRUE_FALSE' && (
                  <div className="space-y-3">
                    {['true', 'false'].map((value) => {
                      const isSelected = answers.get(currentQuestion._id)?.selectedOption === value;

                      return (
                        <div
                          key={value}
                          className={cn(
                            "flex items-center gap-3 p-4 border rounded-lg cursor-pointer transition-all hover:bg-gray-50",
                            isSelected && "bg-primary/5 border-primary"
                          )}
                          onClick={() => handleAnswerChange(currentQuestion._id, value, 'TRUE_FALSE')}
                        >
                          <div className={cn(
                            "w-5 h-5 rounded-full border-2 flex items-center justify-center",
                            isSelected && "border-primary"
                          )}>
                            {isSelected && <div className="w-3 h-3 rounded-full bg-primary" />}
                          </div>
                          <Label className="flex-1 cursor-pointer capitalize">{value}</Label>
                        </div>
                      );
                    })}
                  </div>
                )}

                {/* Short Answer / Fill in Blank */}
                {(currentQuestion.type === 'SHORT_ANSWER' || currentQuestion.type === 'FILL_BLANK') && (
                  <textarea
                    className="w-full min-h-[120px] p-4 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary resize-y"
                    placeholder="Type your answer here..."
                    value={answers.get(currentQuestion._id)?.answer || ''}
                    onChange={(e) => handleAnswerChange(currentQuestion._id, e.target.value, currentQuestion.type)}
                  />
                )}

                {/* Essay Questions */}
                {currentQuestion.type === 'ESSAY' && (
                  <textarea
                    className="w-full min-h-[250px] p-4 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary resize-y"
                    placeholder="Type your essay here..."
                    value={answers.get(currentQuestion._id)?.answer || ''}
                    onChange={(e) => handleAnswerChange(currentQuestion._id, e.target.value, 'ESSAY')}
                  />
                )}

                {/* Navigation buttons */}
                <div className="flex justify-between mt-8">
                  <Button
                    variant="outline"
                    onClick={() => goToQuestion(currentQuestionIndex - 1)}
                    disabled={currentQuestionIndex === 0}
                  >
                    <ChevronLeft className="w-4 h-4 mr-2" />
                    Previous
                  </Button>
                  <Button
                    onClick={() => goToQuestion(currentQuestionIndex + 1)}
                    disabled={currentQuestionIndex === examData.questions.length - 1}
                  >
                    Next
                    <ChevronRight className="w-4 h-4 ml-2" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Question navigator */}
          <div className="lg:col-span-1 space-y-4">
            <Card className="shadow-lg">
              <CardHeader>
                <CardTitle className="text-lg">Questions</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-4 gap-2 mb-4">
                  {examData.questions.map((question, index) => {
                    const isAnswered = answers.has(question._id);
                    const isFlagged = flaggedQuestions.has(question._id);
                    const isCurrent = index === currentQuestionIndex;

                    return (
                      <Button
                        key={question._id}
                        variant={isCurrent ? 'default' : 'outline'}
                        size="sm"
                        onClick={() => goToQuestion(index)}
                        className={cn(
                          "h-10 w-full",
                          isAnswered && !isCurrent && "bg-green-100 hover:bg-green-200 text-green-700 border-green-300",
                          isFlagged && "border-2 border-yellow-500"
                        )}
                      >
                        {index + 1}
                      </Button>
                    );
                  })}
                </div>

                <div className="space-y-2 text-xs">
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 bg-green-100 border border-green-300 rounded" />
                    <span>Answered</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 border border-gray-300 rounded" />
                    <span>Not Answered</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 border-2 border-yellow-500 rounded" />
                    <span>Flagged</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Camera Feed */}
            {examData.proctoringSettings.webcamRequired && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-base flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-red-500 animate-pulse" />
                    Camera Feed
                    <Badge variant="destructive" className="ml-auto text-xs">REC</Badge>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="relative aspect-video bg-black rounded-lg overflow-hidden">
                    <FaceProctoring
                      onWarning={handleFaceWarning}
                      onCameraError={handleCameraError}
                    />
                  </div>
                  <p className="text-xs text-gray-600 mt-2 text-center">
                    Keep your face visible at all times - AI proctoring active
                  </p>
                </CardContent>
              </Card>
            )}
          </div>
        </div>

        {/* Submit confirmation dialog */}
        <Dialog open={showSubmitDialog} onOpenChange={setShowSubmitDialog}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Submit Exam?</DialogTitle>
              <DialogDescription>
                Are you sure you want to submit your exam? You have answered {answeredCount} out of{' '}
                {examData.questions.length} questions.
              </DialogDescription>
            </DialogHeader>

            {answeredCount < examData.questions.length && (
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 flex items-start gap-3">
                <AlertTriangle className="w-5 h-5 text-yellow-600 flex-shrink-0 mt-0.5" />
                <p className="text-sm text-yellow-800">
                  You have {examData.questions.length - answeredCount} unanswered questions!
                </p>
              </div>
            )}

            <DialogFooter>
              <Button variant="outline" onClick={() => setShowSubmitDialog(false)}>
                Cancel
              </Button>
              <Button variant="success" onClick={confirmSubmit} disabled={submitting}>
                {submitting ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Submitting...
                  </>
                ) : (
                  'Submit'
                )}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Warning dialog */}
        <Dialog open={showWarningDialog} onOpenChange={setShowWarningDialog}>
          <DialogContent className="max-w-md">
            <DialogHeader className="bg-yellow-500 -m-6 mb-0 p-6 rounded-t-lg">
              <DialogTitle className="text-white flex items-center gap-2">
                <AlertTriangle className="w-6 h-6" />
                Security Warning
              </DialogTitle>
            </DialogHeader>

            <div className="pt-4">
              <p className="text-gray-700 mb-4">{warningMessage}</p>
              <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                <p className="text-sm text-red-800">
                  <strong>Warning {warningCount} of {examData.proctoringSettings.violationWarningLimit}.</strong>
                  {' '}Exceeding the limit will result in automatic submission!
                </p>
              </div>
            </div>

            <DialogFooter>
              <Button onClick={() => setShowWarningDialog(false)}>
                I Understand
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
};

export default StudentExamTaking;
