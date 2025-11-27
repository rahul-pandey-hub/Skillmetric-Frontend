import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
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
} from '@mui/material';
import {
  ArrowBack as ArrowBackIcon,
  Add as AddIcon,
  Delete as DeleteIcon,
} from '@mui/icons-material';
import questionsService from '../services/questionsService';
import { QuestionType, DifficultyLevel, QuestionOption } from '../types/question';

const CreateQuestion: React.FC = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
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
  const [fillBlankAnswer, setFillBlankAnswer] = useState('');
  const [shortAnswer, setShortAnswer] = useState('');
  const [explanation, setExplanation] = useState('');
  const [marks, setMarks] = useState(1);
  const [negativeMarks, setNegativeMarks] = useState(0);
  const [category, setCategory] = useState('');
  const [tagInput, setTagInput] = useState('');
  const [tags, setTags] = useState<string[]>([]);

  // Initialize options when question type changes
  useEffect(() => {
    if (type === QuestionType.MULTIPLE_CHOICE) {
      // Keep existing options or reset to 4 if not already set
      if (options.length < 2) {
        setOptions([
          { id: 'opt1', text: '', isCorrect: false },
          { id: 'opt2', text: '', isCorrect: false },
          { id: 'opt3', text: '', isCorrect: false },
          { id: 'opt4', text: '', isCorrect: false },
        ]);
      }
    } else if (type === QuestionType.TRUE_FALSE) {
      setOptions([
        { id: 'true', text: 'True', isCorrect: false },
        { id: 'false', text: 'False', isCorrect: false },
      ]);
    } else {
      // For other types, clear options
      setOptions([]);
    }
  }, [type]);

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

  const handleAddOption = () => {
    const newOptionId = `opt${options.length + 1}`;
    setOptions([...options, { id: newOptionId, text: '', isCorrect: false }]);
  };

  const handleRemoveOption = (index: number) => {
    if (options.length > 2) {
      const newOptions = options.filter((_, i) => i !== index);
      setOptions(newOptions);
    }
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

    // Type-specific validation
    if (type === QuestionType.MULTIPLE_CHOICE || type === QuestionType.TRUE_FALSE) {
      // Validate options
      for (let i = 0; i < options.length; i++) {
        if (!options[i].text.trim()) {
          setError(`Option ${i + 1} cannot be empty`);
          return false;
        }
        if (options[i].text.length > 500) {
          setError(`Option ${i + 1} cannot exceed 500 characters`);
          return false;
        }
      }

      // Check for at least 2 options
      if (options.length < 2) {
        setError('At least 2 options are required');
        return false;
      }

      // Check correct answer is selected
      const correctOptions = options.filter((opt) => opt.isCorrect);
      if (correctOptions.length === 0) {
        setError('Please select one correct answer');
        return false;
      }

      if (correctOptions.length > 1) {
        setError('Only one option can be marked as correct');
        return false;
      }
    } else if (type === QuestionType.FILL_BLANK) {
      if (!fillBlankAnswer.trim()) {
        setError('Fill in the blank answer is required');
        return false;
      }
      // Check if question text contains underscores for blanks
      if (!text.includes('_')) {
        setError('Question text must contain underscores (_) to indicate blank spaces');
        return false;
      }
    } else if (type === QuestionType.SHORT_ANSWER) {
      if (!shortAnswer.trim()) {
        setError('Short answer is required');
        return false;
      }
    } else if (type === QuestionType.ESSAY) {
      // Essay questions don't need a correct answer
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

    if (!validateForm()) {
      return;
    }

    setLoading(true);
    setError('');
    setSuccess('');

    try {
      let correctAnswer: any;
      let questionOptions: QuestionOption[] = [];

      // Prepare data based on question type
      if (type === QuestionType.MULTIPLE_CHOICE) {
        const correctOption = options.find((opt) => opt.isCorrect);
        correctAnswer = correctOption?.id;
        questionOptions = options;
      } else if (type === QuestionType.TRUE_FALSE) {
        const correctOption = options.find((opt) => opt.isCorrect);
        correctAnswer = correctOption?.id === 'true';
        questionOptions = options;
      } else if (type === QuestionType.FILL_BLANK) {
        correctAnswer = fillBlankAnswer;
        questionOptions = [];
      } else if (type === QuestionType.SHORT_ANSWER) {
        correctAnswer = shortAnswer;
        questionOptions = [];
      } else if (type === QuestionType.ESSAY) {
        correctAnswer = null; // Essay questions don't have a predefined correct answer
        questionOptions = [];
      }

      const questionData = {
        text,
        type,
        difficulty,
        options: questionOptions,
        correctAnswer,
        explanation: explanation || undefined,
        marks,
        negativeMarks,
        tags: tags.length > 0 ? tags : undefined,
        category: category || undefined,
      };

      await questionsService.createQuestion(questionData);
      setSuccess('Question created successfully!');
      setTimeout(() => {
        navigate('/admin/questions');
      }, 1500);
    } catch (err: any) {
      const errorMessage =
        err.response?.data?.message || 'Failed to create question. Please try again.';
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

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
              Create New Question
            </Typography>
            <Typography variant="subtitle1" color="textSecondary">
              Add a new question to your question bank
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

          {/* Answer Options - Dynamic based on question type */}
          {(type === QuestionType.MULTIPLE_CHOICE || type === QuestionType.TRUE_FALSE) && (
            <Paper elevation={3} sx={{ p: 3, mb: 3 }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                <Typography variant="h6">
                  Answer Options
                </Typography>
                {type === QuestionType.MULTIPLE_CHOICE && (
                  <Button
                    variant="outlined"
                    startIcon={<AddIcon />}
                    onClick={handleAddOption}
                    size="small"
                  >
                    Add Option
                  </Button>
                )}
              </Box>
              <Divider sx={{ mb: 3 }} />

              <FormControl component="fieldset" fullWidth>
                <FormLabel component="legend" sx={{ mb: 2 }}>
                  {type === QuestionType.TRUE_FALSE
                    ? 'Select the correct answer'
                    : 'Select the correct answer and manage options'}
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
                        disabled={type === QuestionType.TRUE_FALSE}
                      />
                      {type === QuestionType.MULTIPLE_CHOICE && options.length > 2 && (
                        <IconButton
                          color="error"
                          onClick={() => handleRemoveOption(index)}
                          aria-label="delete option"
                        >
                          <DeleteIcon />
                        </IconButton>
                      )}
                    </Box>
                  ))}
                </RadioGroup>
              </FormControl>
            </Paper>
          )}

          {/* Fill in the Blank */}
          {type === QuestionType.FILL_BLANK && (
            <Paper elevation={3} sx={{ p: 3, mb: 3 }}>
              <Typography variant="h6" gutterBottom>
                Fill in the Blank Answer
              </Typography>
              <Divider sx={{ mb: 3 }} />

              <Alert severity="info" sx={{ mb: 3 }}>
                Use underscores (_____) in the question text to indicate where the blank spaces should be.
                For example: "The capital of France is _____."
              </Alert>

              <TextField
                fullWidth
                required
                label="Correct Answer"
                value={fillBlankAnswer}
                onChange={(e) => setFillBlankAnswer(e.target.value)}
                helperText="Enter the correct answer that should fill the blank"
                placeholder="e.g., Paris"
              />
            </Paper>
          )}

          {/* Short Answer */}
          {type === QuestionType.SHORT_ANSWER && (
            <Paper elevation={3} sx={{ p: 3, mb: 3 }}>
              <Typography variant="h6" gutterBottom>
                Short Answer
              </Typography>
              <Divider sx={{ mb: 3 }} />

              <Alert severity="info" sx={{ mb: 3 }}>
                Provide a model answer for the short answer question. This will be used for reference during grading.
              </Alert>

              <TextField
                fullWidth
                required
                multiline
                rows={4}
                label="Model Answer"
                value={shortAnswer}
                onChange={(e) => setShortAnswer(e.target.value)}
                helperText="Enter the expected short answer"
                placeholder="Write the expected answer here..."
              />
            </Paper>
          )}

          {/* Essay Type */}
          {type === QuestionType.ESSAY && (
            <Paper elevation={3} sx={{ p: 3, mb: 3 }}>
              <Typography variant="h6" gutterBottom>
                Essay Question
              </Typography>
              <Divider sx={{ mb: 3 }} />

              <Alert severity="info">
                Essay questions require manual grading. No predefined correct answer is needed.
                Students will provide a detailed written response that needs to be evaluated by an instructor.
              </Alert>
            </Paper>
          )}

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
            <Button
              type="submit"
              variant="contained"
              size="large"
              disabled={loading}
            >
              {loading ? 'Creating...' : 'Create Question'}
            </Button>
          </Box>
        </form>
      </Box>
    </Container>
  );
};

export default CreateQuestion;
