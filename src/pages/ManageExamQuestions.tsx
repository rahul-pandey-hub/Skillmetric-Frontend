import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Container,
  Typography,
  Paper,
  Box,
  Button,
  Alert,
  CircularProgress,
  Grid,
  Card,
  CardContent,
  Checkbox,
  FormControlLabel,
  Chip,
  Divider,
  TextField,
  MenuItem,
} from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import { examService } from '../services/examService';
import { questionsService } from '../services/questionsService';
import { Exam } from '../types/exam';
import { Question } from '../types/question';

const ManageExamQuestions = () => {
  const { examId } = useParams<{ examId: string }>();
  const navigate = useNavigate();

  const [exam, setExam] = useState<Exam | null>(null);
  const [allQuestions, setAllQuestions] = useState<Question[]>([]);
  const [selectedQuestions, setSelectedQuestions] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Filters
  const [typeFilter, setTypeFilter] = useState('');
  const [difficultyFilter, setDifficultyFilter] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');

  useEffect(() => {
    fetchData();
  }, [examId]);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [examResponse, questionsResponse] = await Promise.all([
        examService.getExamById(examId!),
        questionsService.getAllQuestions({ isActive: true, limit: 1000 }),
      ]);

      const examData = examResponse.data;
      setExam(examData);
      setAllQuestions(questionsResponse.data.data);

      // Set currently selected questions
      const currentQuestionIds = Array.isArray(examData.questions)
        ? examData.questions.map((q: any) => (typeof q === 'string' ? q : q._id))
        : [];
      setSelectedQuestions(new Set(currentQuestionIds));
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to load data');
    } finally {
      setLoading(false);
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

  const handleSave = async () => {
    try {
      setSaving(true);
      setError('');
      setSuccess('');

      const currentQuestionIds = Array.isArray(exam?.questions)
        ? exam!.questions.map((q: any) => (typeof q === 'string' ? q : q._id))
        : [];

      const questionsToAdd = Array.from(selectedQuestions).filter(
        (id) => !currentQuestionIds.includes(id)
      );
      const questionsToRemove = currentQuestionIds.filter(
        (id: string) => !selectedQuestions.has(id)
      );

      // Add new questions
      if (questionsToAdd.length > 0) {
        await examService.addQuestionsToExam(examId!, {
          questionIds: questionsToAdd,
        });
      }

      // Remove questions
      if (questionsToRemove.length > 0) {
        await examService.removeQuestionsFromExam(examId!, {
          questionIds: questionsToRemove,
        });
      }

      setSuccess('Questions updated successfully!');
      setTimeout(() => {
        navigate(`/admin/exams/${examId}`);
      }, 1500);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to update questions');
    } finally {
      setSaving(false);
    }
  };

  const filteredQuestions = allQuestions.filter((q) => {
    if (typeFilter && q.type !== typeFilter) return false;
    if (difficultyFilter && q.difficulty !== difficultyFilter) return false;
    if (categoryFilter && q.category !== categoryFilter) return false;
    return true;
  });

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
        <Alert severity="error">Exam not found</Alert>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg">
      <Box sx={{ py: 4 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
          <Button
            startIcon={<ArrowBackIcon />}
            onClick={() => navigate(`/admin/exams/${examId}`)}
            sx={{ mr: 2 }}
          >
            Back
          </Button>
          <Typography variant="h4">Manage Questions - {exam.title}</Typography>
        </Box>

        {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
        {success && <Alert severity="success" sx={{ mb: 2 }}>{success}</Alert>}

        <Paper elevation={3} sx={{ p: 3, mb: 3 }}>
          <Typography variant="h6" gutterBottom>
            Selected: {selectedQuestions.size} questions
          </Typography>
          <Divider sx={{ my: 2 }} />

          {/* Filters */}
          <Grid container spacing={2} sx={{ mb: 3 }}>
            <Grid item xs={12} md={4}>
              <TextField
                select
                fullWidth
                label="Filter by Type"
                value={typeFilter}
                onChange={(e) => setTypeFilter(e.target.value)}
                size="small"
              >
                <MenuItem value="">All Types</MenuItem>
                <MenuItem value="MULTIPLE_CHOICE">Multiple Choice</MenuItem>
                <MenuItem value="TRUE_FALSE">True/False</MenuItem>
                <MenuItem value="FILL_BLANK">Fill in the Blank</MenuItem>
                <MenuItem value="SHORT_ANSWER">Short Answer</MenuItem>
                <MenuItem value="ESSAY">Essay</MenuItem>
              </TextField>
            </Grid>
            <Grid item xs={12} md={4}>
              <TextField
                select
                fullWidth
                label="Filter by Difficulty"
                value={difficultyFilter}
                onChange={(e) => setDifficultyFilter(e.target.value)}
                size="small"
              >
                <MenuItem value="">All Difficulties</MenuItem>
                <MenuItem value="EASY">Easy</MenuItem>
                <MenuItem value="MEDIUM">Medium</MenuItem>
                <MenuItem value="HARD">Hard</MenuItem>
              </TextField>
            </Grid>
            <Grid item xs={12} md={4}>
              <TextField
                fullWidth
                label="Filter by Category"
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value)}
                size="small"
                placeholder="Enter category"
              />
            </Grid>
          </Grid>

          {/* Questions List */}
          <Box sx={{ maxHeight: '500px', overflowY: 'auto' }}>
            {filteredQuestions.length === 0 ? (
              <Typography color="textSecondary">No questions found</Typography>
            ) : (
              <Grid container spacing={2}>
                {filteredQuestions.map((question) => (
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
            )}
          </Box>
        </Paper>

        <Box sx={{ display: 'flex', gap: 2, justifyContent: 'flex-end' }}>
          <Button
            variant="outlined"
            onClick={() => navigate(`/admin/exams/${examId}`)}
            disabled={saving}
          >
            Cancel
          </Button>
          <Button variant="contained" onClick={handleSave} disabled={saving}>
            {saving ? 'Saving...' : 'Save Changes'}
          </Button>
        </Box>
      </Box>
    </Container>
  );
};

export default ManageExamQuestions;
