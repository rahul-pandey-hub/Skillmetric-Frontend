import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  Container,
  Box,
  Typography,
  Button,
  Paper,
  Grid,
  TextField,
  MenuItem,
  Alert,
  Divider,
  IconButton,
  Radio,
  RadioGroup,
  FormControlLabel,
  FormControl,
  FormLabel,
  Chip,
  CircularProgress,
} from '@mui/material';
import {
  ArrowBack as ArrowBackIcon,
  Add as AddIcon,
} from '@mui/icons-material';
import questionsService from '../services/questionsService';
import { QuestionType, DifficultyLevel, QuestionOption } from '../types/question';

const EditQuestion: React.FC = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const [loading, setLoading] = useState(false);
  const [fetchLoading, setFetchLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Form state
  const [text, setText] = useState('');
  const [type, setType] = useState<QuestionType>(QuestionType.MULTIPLE_CHOICE);
  const [difficulty, setDifficulty] = useState<DifficultyLevel>(DifficultyLevel.MEDIUM);
  const [options, setOptions] = useState<QuestionOption[]>([
    { id: 'opt1', text: '', isCorrect: false },
    { id: 'opt2', text: '', isCorrect: false },
    { id: 'opt3', text: '', isCorrect: false },
    { id: 'opt4', text: '', isCorrect: false },
  ]);
  const [explanation, setExplanation] = useState('');
  const [marks, setMarks] = useState(1);
  const [negativeMarks, setNegativeMarks] = useState(0);
  const [category, setCategory] = useState('');
  const [tagInput, setTagInput] = useState('');
  const [tags, setTags] = useState<string[]>([]);

  useEffect(() => {
    fetchQuestion();
  }, [id]);

  const fetchQuestion = async () => {
    if (!id) return;

    try {
      setFetchLoading(true);
      const response = await questionsService.getQuestionById(id);
      const question = response.data;

      setText(question.text);
      setType(question.type);
      setDifficulty(question.difficulty);
      setOptions(question.options);
      setExplanation(question.explanation || '');
      setMarks(question.marks);
      setNegativeMarks(question.negativeMarks);
      setCategory(question.category || '');
      setTags(question.tags || []);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to fetch question');
    } finally {
      setFetchLoading(false);
    }
  };

  const handleOptionChange = (index: number, value: string) => {
    const newOptions = [...options];
    newOptions[index].text = value;
    setOptions(newOptions);
  };

  const handleCorrectAnswerChange = (index: number) => {
    const newOptions = options.map((opt, i) => ({
      ...opt,
      isCorrect: i === index,
    }));
    setOptions(newOptions);
  };

  const handleAddTag = () => {
    if (tagInput.trim() && !tags.includes(tagInput.trim())) {
      setTags([...tags, tagInput.trim()]);
      setTagInput('');
    }
  };

  const handleDeleteTag = (tagToDelete: string) => {
    setTags(tags.filter((tag) => tag !== tagToDelete));
  };

  const validateForm = (): boolean => {
    setError('');

    if (text.length < 10) {
      setError('Question text must be at least 10 characters');
      return false;
    }

    if (text.length > 2000) {
      setError('Question text cannot exceed 2000 characters');
      return false;
    }

    for (let i = 0; i < 4; i++) {
      if (!options[i].text.trim()) {
        setError(`Option ${i + 1} cannot be empty`);
        return false;
      }
      if (options[i].text.length > 500) {
        setError(`Option ${i + 1} cannot exceed 500 characters`);
        return false;
      }
    }

    const correctOptions = options.filter((opt) => opt.isCorrect);
    if (correctOptions.length === 0) {
      setError('Please select one correct answer');
      return false;
    }

    if (correctOptions.length > 1) {
      setError('Only one option can be marked as correct');
      return false;
    }

    if (marks < 0.5) {
      setError('Marks must be at least 0.5');
      return false;
    }

    if (negativeMarks < 0) {
      setError('Negative marks cannot be less than 0');
      return false;
    }

    if (negativeMarks > marks) {
      setError('Negative marks cannot exceed total marks');
      return false;
    }

    if (explanation.length > 1000) {
      setError('Explanation cannot exceed 1000 characters');
      return false;
    }

    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm() || !id) {
      return;
    }

    setLoading(true);
    setError('');
    setSuccess('');

    try {
      const correctOption = options.find((opt) => opt.isCorrect);
      const questionData = {
        text,
        type,
        difficulty,
        options,
        correctAnswer: correctOption?.id,
        explanation: explanation || undefined,
        marks,
        negativeMarks,
        tags: tags.length > 0 ? tags : undefined,
        category: category || undefined,
      };

      await questionsService.updateQuestion(id, questionData);
      setSuccess('Question updated successfully!');
      setTimeout(() => {
        navigate('/admin/questions');
      }, 1500);
    } catch (err: any) {
      const errorMessage =
        err.response?.data?.message || 'Failed to update question. Please try again.';
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  if (fetchLoading) {
    return (
      <Container maxWidth="lg">
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
          <CircularProgress />
        </Box>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg">
      <Box sx={{ py: 4 }}>
        {/* Header */}
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 4 }}>
          <IconButton onClick={() => navigate('/admin/questions')} sx={{ mr: 2 }}>
            <ArrowBackIcon />
          </IconButton>
          <Box>
            <Typography variant="h4" gutterBottom>
              Edit Question
            </Typography>
            <Typography variant="subtitle1" color="textSecondary">
              Update question details
            </Typography>
          </Box>
        </Box>

        {/* Alerts */}
        {error && (
          <Alert severity="error" sx={{ mb: 3 }}>
            {error}
          </Alert>
        )}
        {success && (
          <Alert severity="success" sx={{ mb: 3 }}>
            {success}
          </Alert>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit}>
          {/* Basic Info */}
          <Paper elevation={3} sx={{ p: 3, mb: 3 }}>
            <Typography variant="h6" gutterBottom>
              Basic Information
            </Typography>
            <Divider sx={{ mb: 3 }} />

            <Grid container spacing={3}>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  required
                  multiline
                  rows={4}
                  label="Question Text"
                  value={text}
                  onChange={(e) => setText(e.target.value)}
                  helperText={`${text.length}/2000 characters (minimum 10)`}
                  error={text.length > 0 && text.length < 10}
                />
              </Grid>

              <Grid item xs={12} md={4}>
                <TextField
                  fullWidth
                  required
                  select
                  label="Question Type"
                  value={type}
                  onChange={(e) => setType(e.target.value as QuestionType)}
                >
                  {Object.values(QuestionType).map((qType) => (
                    <MenuItem key={qType} value={qType}>
                      {qType.replace('_', ' ')}
                    </MenuItem>
                  ))}
                </TextField>
              </Grid>

              <Grid item xs={12} md={4}>
                <TextField
                  fullWidth
                  required
                  select
                  label="Difficulty Level"
                  value={difficulty}
                  onChange={(e) => setDifficulty(e.target.value as DifficultyLevel)}
                >
                  {Object.values(DifficultyLevel).map((level) => (
                    <MenuItem key={level} value={level}>
                      {level}
                    </MenuItem>
                  ))}
                </TextField>
              </Grid>

              <Grid item xs={12} md={4}>
                <TextField
                  fullWidth
                  label="Category"
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  helperText="e.g., Geography, Mathematics"
                />
              </Grid>
            </Grid>
          </Paper>

          {/* Answer Options */}
          <Paper elevation={3} sx={{ p: 3, mb: 3 }}>
            <Typography variant="h6" gutterBottom>
              Answer Options
            </Typography>
            <Divider sx={{ mb: 3 }} />

            <FormControl component="fieldset">
              <FormLabel component="legend" sx={{ mb: 2 }}>
                Select the correct answer
              </FormLabel>
              <RadioGroup>
                {options.map((option, index) => (
                  <Box
                    key={option.id}
                    sx={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 2,
                      mb: 2,
                    }}
                  >
                    <FormControlLabel
                      value={option.id}
                      control={
                        <Radio
                          checked={option.isCorrect}
                          onChange={() => handleCorrectAnswerChange(index)}
                        />
                      }
                      label={`${String.fromCharCode(65 + index)}.`}
                      sx={{ minWidth: 60 }}
                    />
                    <TextField
                      fullWidth
                      required
                      label={`Option ${index + 1}`}
                      value={option.text}
                      onChange={(e) => handleOptionChange(index, e.target.value)}
                      helperText={`${option.text.length}/500 characters`}
                      error={option.text.length > 500}
                    />
                  </Box>
                ))}
              </RadioGroup>
            </FormControl>
          </Paper>

          {/* Scoring */}
          <Paper elevation={3} sx={{ p: 3, mb: 3 }}>
            <Typography variant="h6" gutterBottom>
              Scoring
            </Typography>
            <Divider sx={{ mb: 3 }} />

            <Grid container spacing={3}>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  required
                  type="number"
                  label="Marks"
                  value={marks}
                  onChange={(e) => setMarks(parseFloat(e.target.value))}
                  inputProps={{ min: 0.5, step: 0.5 }}
                  helperText="Marks awarded for correct answer (minimum 0.5)"
                />
              </Grid>

              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  type="number"
                  label="Negative Marks"
                  value={negativeMarks}
                  onChange={(e) => setNegativeMarks(parseFloat(e.target.value))}
                  inputProps={{ min: 0, step: 0.25 }}
                  helperText="Marks deducted for incorrect answer"
                />
              </Grid>

              <Grid item xs={12}>
                <TextField
                  fullWidth
                  multiline
                  rows={3}
                  label="Explanation (Optional)"
                  value={explanation}
                  onChange={(e) => setExplanation(e.target.value)}
                  helperText={`${explanation.length}/1000 characters`}
                  error={explanation.length > 1000}
                />
              </Grid>
            </Grid>
          </Paper>

          {/* Tags */}
          <Paper elevation={3} sx={{ p: 3, mb: 3 }}>
            <Typography variant="h6" gutterBottom>
              Tags (Optional)
            </Typography>
            <Divider sx={{ mb: 3 }} />

            <Box sx={{ display: 'flex', gap: 2, mb: 2 }}>
              <TextField
                fullWidth
                label="Add Tag"
                value={tagInput}
                onChange={(e) => setTagInput(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddTag())}
                helperText="Press Enter to add tag"
              />
              <Button
                variant="outlined"
                startIcon={<AddIcon />}
                onClick={handleAddTag}
                disabled={!tagInput.trim()}
              >
                Add
              </Button>
            </Box>

            {tags.length > 0 && (
              <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                {tags.map((tag) => (
                  <Chip
                    key={tag}
                    label={tag}
                    onDelete={() => handleDeleteTag(tag)}
                    color="primary"
                    variant="outlined"
                  />
                ))}
              </Box>
            )}
          </Paper>

          {/* Actions */}
          <Box sx={{ display: 'flex', gap: 2, justifyContent: 'flex-end' }}>
            <Button
              variant="outlined"
              size="large"
              onClick={() => navigate('/admin/questions')}
              disabled={loading}
            >
              Cancel
            </Button>
            <Button type="submit" variant="contained" size="large" disabled={loading}>
              {loading ? 'Updating...' : 'Update Question'}
            </Button>
          </Box>
        </form>
      </Box>
    </Container>
  );
};

export default EditQuestion;
