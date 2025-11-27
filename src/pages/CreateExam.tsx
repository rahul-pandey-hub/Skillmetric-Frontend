import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Container,
  Typography,
  Paper,
  Box,
  TextField,
  Button,
  Grid,
  FormControlLabel,
  Switch,
  MenuItem,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Alert,
  Divider,
  Checkbox,
  Card,
  CardContent,
  Chip,
} from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import { examService } from '../services/examService';
import { questionsService } from '../services/questionsService';
import { Question } from '../types/question';

interface ProctoringSettings {
  enabled: boolean;
  violationWarningLimit: number;
  webcamRequired: boolean;
  screenRecording: boolean;
  tabSwitchDetection: boolean;
  copyPasteDetection: boolean;
  rightClickDisabled: boolean;
  devToolsDetection: boolean;
  fullscreenRequired: boolean;
  autoSubmitOnViolation: boolean;
}

interface Schedule {
  startDate: string;
  endDate: string;
  lateSubmissionAllowed: boolean;
}

interface Grading {
  totalMarks: number;
  passingMarks: number;
  negativeMarking: boolean;
  negativeMarkValue: number;
}

interface Settings {
  shuffleQuestions: boolean;
  shuffleOptions: boolean;
  showResultsImmediately: boolean;
  allowReview: boolean;
  attemptsAllowed: number;
}

const CreateExam = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [loadingQuestions, setLoadingQuestions] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Questions
  const [allQuestions, setAllQuestions] = useState<Question[]>([]);
  const [selectedQuestions, setSelectedQuestions] = useState<Set<string>>(new Set());

  // Basic Info
  const [title, setTitle] = useState('');
  const [code, setCode] = useState('');
  const [description, setDescription] = useState('');
  const [duration, setDuration] = useState(60);
  const [status, setStatus] = useState('DRAFT');

  // Proctoring Settings
  const [proctoringSettings, setProctoringSettings] = useState<ProctoringSettings>({
    enabled: true,
    violationWarningLimit: 3,
    webcamRequired: true,
    screenRecording: true,
    tabSwitchDetection: true,
    copyPasteDetection: true,
    rightClickDisabled: true,
    devToolsDetection: true,
    fullscreenRequired: true,
    autoSubmitOnViolation: false,
  });

  // Schedule
  const [schedule, setSchedule] = useState<Schedule>({
    startDate: '',
    endDate: '',
    lateSubmissionAllowed: false,
  });

  // Grading
  const [grading, setGrading] = useState<Grading>({
    totalMarks: 100,
    passingMarks: 40,
    negativeMarking: false,
    negativeMarkValue: 0.25,
  });

  // Settings
  const [settings, setSettings] = useState<Settings>({
    shuffleQuestions: true,
    shuffleOptions: true,
    showResultsImmediately: false,
    allowReview: true,
    attemptsAllowed: 1,
  });

  const handleProctoringChange = (field: keyof ProctoringSettings, value: boolean | number) => {
    setProctoringSettings({ ...proctoringSettings, [field]: value });
  };

  const handleScheduleChange = (field: keyof Schedule, value: string | boolean) => {
    setSchedule({ ...schedule, [field]: value });
  };

  const handleGradingChange = (field: keyof Grading, value: number | boolean) => {
    setGrading({ ...grading, [field]: value });
  };

  const handleSettingsChange = (field: keyof Settings, value: boolean | number) => {
    setSettings({ ...settings, [field]: value });
  };

  useEffect(() => {
    fetchQuestions();
  }, []);

  const fetchQuestions = async () => {
    try {
      setLoadingQuestions(true);
      const response = await questionsService.getAllQuestions({ isActive: true, limit: 1000 });
      setAllQuestions(response.data.data);
    } catch (err) {
      console.error('Failed to load questions:', err);
    } finally {
      setLoadingQuestions(false);
    }
  };

  const handleToggleQuestion = (questionId: string) => {
    const newSelected = new Set(selectedQuestions);
    if (newSelected.has(questionId)) {
      newSelected.delete(questionId);
    } else {
      newSelected.add(questionId);
    }
    setSelectedQuestions(newSelected);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);

    // Validation
    if (!title || !code || !schedule.startDate || !schedule.endDate) {
      setError('Please fill in all required fields');
      setLoading(false);
      return;
    }

    if (new Date(schedule.startDate) >= new Date(schedule.endDate)) {
      setError('End date must be after start date');
      setLoading(false);
      return;
    }

    if (grading.passingMarks > grading.totalMarks) {
      setError('Passing marks cannot be greater than total marks');
      setLoading(false);
      return;
    }

    try {
      const examData = {
        title,
        code,
        description,
        duration,
        status,
        proctoringSettings,
        schedule: {
          startDate: new Date(schedule.startDate).toISOString(),
          endDate: new Date(schedule.endDate).toISOString(),
          lateSubmissionAllowed: schedule.lateSubmissionAllowed,
        },
        grading,
        settings,
        questions: Array.from(selectedQuestions),
      };

      const response = await examService.createExam(examData);
      setSuccess('Exam created successfully!');

      // Redirect after 2 seconds
      setTimeout(() => {
        navigate('/admin/exams');
      }, 2000);
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || 'Failed to create exam';
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container maxWidth="lg">
      <Box sx={{ py: 4 }}>
        <Typography variant="h4" gutterBottom>
          Create New Exam
        </Typography>

        {error && <Alert severity="error" sx={{ mt: 2, mb: 2 }}>{error}</Alert>}
        {success && <Alert severity="success" sx={{ mt: 2, mb: 2 }}>{success}</Alert>}

        <form onSubmit={handleSubmit}>
          {/* Basic Information */}
          <Paper elevation={3} sx={{ p: 3, mt: 3 }}>
            <Typography variant="h6" gutterBottom>
              Basic Information
            </Typography>
            <Divider sx={{ mb: 3 }} />

            <Grid container spacing={3}>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Exam Title"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  required
                  helperText="E.g., Data Structures Final Exam"
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Exam Code"
                  value={code}
                  onChange={(e) => setCode(e.target.value)}
                  required
                  helperText="Unique code for this exam (e.g., DS-FINAL-2024)"
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Description"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  multiline
                  rows={3}
                  helperText="Brief description of the exam"
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Duration (minutes)"
                  type="number"
                  value={duration}
                  onChange={(e) => setDuration(Number(e.target.value))}
                  required
                  inputProps={{ min: 1 }}
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  select
                  label="Status"
                  value={status}
                  onChange={(e) => setStatus(e.target.value)}
                >
                  <MenuItem value="DRAFT">Draft</MenuItem>
                  <MenuItem value="PUBLISHED">Published</MenuItem>
                  <MenuItem value="ACTIVE">Active</MenuItem>
                  <MenuItem value="COMPLETED">Completed</MenuItem>
                  <MenuItem value="ARCHIVED">Archived</MenuItem>
                </TextField>
              </Grid>
            </Grid>
          </Paper>

          {/* Schedule */}
          <Paper elevation={3} sx={{ p: 3, mt: 3 }}>
            <Typography variant="h6" gutterBottom>
              Schedule
            </Typography>
            <Divider sx={{ mb: 3 }} />

            <Grid container spacing={3}>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Start Date & Time"
                  type="datetime-local"
                  value={schedule.startDate}
                  onChange={(e) => handleScheduleChange('startDate', e.target.value)}
                  required
                  InputLabelProps={{ shrink: true }}
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="End Date & Time"
                  type="datetime-local"
                  value={schedule.endDate}
                  onChange={(e) => handleScheduleChange('endDate', e.target.value)}
                  required
                  InputLabelProps={{ shrink: true }}
                />
              </Grid>
              <Grid item xs={12}>
                <FormControlLabel
                  control={
                    <Switch
                      checked={schedule.lateSubmissionAllowed}
                      onChange={(e) => handleScheduleChange('lateSubmissionAllowed', e.target.checked)}
                    />
                  }
                  label="Allow Late Submission"
                />
              </Grid>
            </Grid>
          </Paper>

          {/* Grading */}
          <Paper elevation={3} sx={{ p: 3, mt: 3 }}>
            <Typography variant="h6" gutterBottom>
              Grading Configuration
            </Typography>
            <Divider sx={{ mb: 3 }} />

            <Grid container spacing={3}>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Total Marks"
                  type="number"
                  value={grading.totalMarks}
                  onChange={(e) => handleGradingChange('totalMarks', Number(e.target.value))}
                  required
                  inputProps={{ min: 0 }}
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Passing Marks"
                  type="number"
                  value={grading.passingMarks}
                  onChange={(e) => handleGradingChange('passingMarks', Number(e.target.value))}
                  required
                  inputProps={{ min: 0 }}
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <FormControlLabel
                  control={
                    <Switch
                      checked={grading.negativeMarking}
                      onChange={(e) => handleGradingChange('negativeMarking', e.target.checked)}
                    />
                  }
                  label="Enable Negative Marking"
                />
              </Grid>
              {grading.negativeMarking && (
                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    label="Negative Mark Value"
                    type="number"
                    value={grading.negativeMarkValue}
                    onChange={(e) => handleGradingChange('negativeMarkValue', Number(e.target.value))}
                    inputProps={{ min: 0, step: 0.25 }}
                    helperText="Marks to deduct per wrong answer"
                  />
                </Grid>
              )}
            </Grid>
          </Paper>

          {/* Proctoring Settings */}
          <Accordion sx={{ mt: 3 }}>
            <AccordionSummary expandIcon={<ExpandMoreIcon />}>
              <Typography variant="h6">Proctoring Settings</Typography>
            </AccordionSummary>
            <AccordionDetails>
              <Grid container spacing={2}>
                <Grid item xs={12}>
                  <FormControlLabel
                    control={
                      <Switch
                        checked={proctoringSettings.enabled}
                        onChange={(e) => handleProctoringChange('enabled', e.target.checked)}
                      />
                    }
                    label="Enable Proctoring"
                  />
                </Grid>
                {proctoringSettings.enabled && (
                  <>
                    <Grid item xs={12} md={6}>
                      <TextField
                        fullWidth
                        label="Violation Warning Limit"
                        type="number"
                        value={proctoringSettings.violationWarningLimit}
                        onChange={(e) => handleProctoringChange('violationWarningLimit', Number(e.target.value))}
                        inputProps={{ min: 0 }}
                        helperText="Number of warnings before action"
                      />
                    </Grid>
                    <Grid item xs={12} md={6}>
                      <FormControlLabel
                        control={
                          <Switch
                            checked={proctoringSettings.webcamRequired}
                            onChange={(e) => handleProctoringChange('webcamRequired', e.target.checked)}
                          />
                        }
                        label="Webcam Required"
                      />
                    </Grid>
                    <Grid item xs={12} md={6}>
                      <FormControlLabel
                        control={
                          <Switch
                            checked={proctoringSettings.screenRecording}
                            onChange={(e) => handleProctoringChange('screenRecording', e.target.checked)}
                          />
                        }
                        label="Screen Recording"
                      />
                    </Grid>
                    <Grid item xs={12} md={6}>
                      <FormControlLabel
                        control={
                          <Switch
                            checked={proctoringSettings.tabSwitchDetection}
                            onChange={(e) => handleProctoringChange('tabSwitchDetection', e.target.checked)}
                          />
                        }
                        label="Tab Switch Detection"
                      />
                    </Grid>
                    <Grid item xs={12} md={6}>
                      <FormControlLabel
                        control={
                          <Switch
                            checked={proctoringSettings.copyPasteDetection}
                            onChange={(e) => handleProctoringChange('copyPasteDetection', e.target.checked)}
                          />
                        }
                        label="Copy/Paste Detection"
                      />
                    </Grid>
                    <Grid item xs={12} md={6}>
                      <FormControlLabel
                        control={
                          <Switch
                            checked={proctoringSettings.rightClickDisabled}
                            onChange={(e) => handleProctoringChange('rightClickDisabled', e.target.checked)}
                          />
                        }
                        label="Disable Right Click"
                      />
                    </Grid>
                    <Grid item xs={12} md={6}>
                      <FormControlLabel
                        control={
                          <Switch
                            checked={proctoringSettings.devToolsDetection}
                            onChange={(e) => handleProctoringChange('devToolsDetection', e.target.checked)}
                          />
                        }
                        label="Dev Tools Detection"
                      />
                    </Grid>
                    <Grid item xs={12} md={6}>
                      <FormControlLabel
                        control={
                          <Switch
                            checked={proctoringSettings.fullscreenRequired}
                            onChange={(e) => handleProctoringChange('fullscreenRequired', e.target.checked)}
                          />
                        }
                        label="Fullscreen Required"
                      />
                    </Grid>
                    <Grid item xs={12} md={6}>
                      <FormControlLabel
                        control={
                          <Switch
                            checked={proctoringSettings.autoSubmitOnViolation}
                            onChange={(e) => handleProctoringChange('autoSubmitOnViolation', e.target.checked)}
                          />
                        }
                        label="Auto Submit on Violation"
                      />
                    </Grid>
                  </>
                )}
              </Grid>
            </AccordionDetails>
          </Accordion>

          {/* Questions Selection */}
          <Accordion sx={{ mt: 2 }}>
            <AccordionSummary expandIcon={<ExpandMoreIcon />}>
              <Typography variant="h6">
                Select Questions ({selectedQuestions.size} selected)
              </Typography>
            </AccordionSummary>
            <AccordionDetails>
              {loadingQuestions ? (
                <Typography color="textSecondary">Loading questions...</Typography>
              ) : allQuestions.length === 0 ? (
                <Box sx={{ textAlign: 'center', py: 2 }}>
                  <Typography color="textSecondary" gutterBottom>
                    No questions available
                  </Typography>
                  <Button
                    variant="outlined"
                    onClick={() => navigate('/admin/questions/create')}
                    sx={{ mt: 1 }}
                  >
                    Create Questions First
                  </Button>
                </Box>
              ) : (
                <Box sx={{ maxHeight: '400px', overflowY: 'auto' }}>
                  <Grid container spacing={2}>
                    {allQuestions.map((question) => (
                      <Grid item xs={12} key={question._id}>
                        <Card
                          variant="outlined"
                          sx={{
                            backgroundColor: selectedQuestions.has(question._id)
                              ? 'action.selected'
                              : 'background.paper',
                          }}
                        >
                          <CardContent>
                            <Box sx={{ display: 'flex', alignItems: 'flex-start' }}>
                              <FormControlLabel
                                control={
                                  <Checkbox
                                    checked={selectedQuestions.has(question._id)}
                                    onChange={() => handleToggleQuestion(question._id)}
                                  />
                                }
                                label=""
                                sx={{ mr: 1 }}
                              />
                              <Box sx={{ flex: 1 }}>
                                <Typography variant="body1" gutterBottom sx={{ fontWeight: 500 }}>
                                  {question.text}
                                </Typography>
                                <Box sx={{ display: 'flex', gap: 1, mt: 1, flexWrap: 'wrap' }}>
                                  <Chip
                                    label={question.type.replace('_', ' ')}
                                    size="small"
                                    color="primary"
                                    variant="outlined"
                                  />
                                  <Chip
                                    label={question.difficulty}
                                    size="small"
                                    color={
                                      question.difficulty === 'EASY'
                                        ? 'success'
                                        : question.difficulty === 'MEDIUM'
                                        ? 'warning'
                                        : 'error'
                                    }
                                  />
                                  <Chip label={`${question.marks} marks`} size="small" color="info" />
                                  {question.negativeMarks > 0 && (
                                    <Chip
                                      label={`-${question.negativeMarks} negative`}
                                      size="small"
                                      color="error"
                                      variant="outlined"
                                    />
                                  )}
                                  {question.category && (
                                    <Chip label={question.category} size="small" variant="outlined" />
                                  )}
                                </Box>
                              </Box>
                            </Box>
                          </CardContent>
                        </Card>
                      </Grid>
                    ))}
                  </Grid>
                </Box>
              )}
            </AccordionDetails>
          </Accordion>

          {/* Exam Settings */}
          <Accordion sx={{ mt: 2 }}>
            <AccordionSummary expandIcon={<ExpandMoreIcon />}>
              <Typography variant="h6">Exam Settings</Typography>
            </AccordionSummary>
            <AccordionDetails>
              <Grid container spacing={2}>
                <Grid item xs={12} md={6}>
                  <FormControlLabel
                    control={
                      <Switch
                        checked={settings.shuffleQuestions}
                        onChange={(e) => handleSettingsChange('shuffleQuestions', e.target.checked)}
                      />
                    }
                    label="Shuffle Questions"
                  />
                </Grid>
                <Grid item xs={12} md={6}>
                  <FormControlLabel
                    control={
                      <Switch
                        checked={settings.shuffleOptions}
                        onChange={(e) => handleSettingsChange('shuffleOptions', e.target.checked)}
                      />
                    }
                    label="Shuffle Options"
                  />
                </Grid>
                <Grid item xs={12} md={6}>
                  <FormControlLabel
                    control={
                      <Switch
                        checked={settings.showResultsImmediately}
                        onChange={(e) => handleSettingsChange('showResultsImmediately', e.target.checked)}
                      />
                    }
                    label="Show Results Immediately"
                  />
                </Grid>
                <Grid item xs={12} md={6}>
                  <FormControlLabel
                    control={
                      <Switch
                        checked={settings.allowReview}
                        onChange={(e) => handleSettingsChange('allowReview', e.target.checked)}
                      />
                    }
                    label="Allow Review"
                  />
                </Grid>
                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    label="Attempts Allowed"
                    type="number"
                    value={settings.attemptsAllowed}
                    onChange={(e) => handleSettingsChange('attemptsAllowed', Number(e.target.value))}
                    inputProps={{ min: 1 }}
                    helperText="Number of attempts allowed per student"
                  />
                </Grid>
              </Grid>
            </AccordionDetails>
          </Accordion>

          {/* Action Buttons */}
          <Box sx={{ mt: 4, display: 'flex', gap: 2, justifyContent: 'flex-end' }}>
            <Button
              variant="outlined"
              size="large"
              onClick={() => navigate('/admin/dashboard')}
              disabled={loading}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="contained"
              size="large"
              disabled={loading}
            >
              {loading ? 'Creating...' : 'Create Exam'}
            </Button>
          </Box>
        </form>
      </Box>
    </Container>
  );
};

export default CreateExam;
