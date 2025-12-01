import { useState } from 'react';
import {
  Container,
  Typography,
  Box,
  Paper,
  TextField,
  Button,
  Grid,
  MenuItem,
  IconButton,
  Alert,
  FormControl,
  InputLabel,
  Select,
  Chip,
} from '@mui/material';
import { Add, Delete } from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { QuestionType, DifficultyLevel } from '../../types/question';

const CreateQuestion = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    text: '',
    type: QuestionType.MULTIPLE_CHOICE,
    difficulty: DifficultyLevel.MEDIUM,
    category: '',
    marks: 1,
    negativeMarks: 0,
    tags: [] as string[],
    explanation: '',
  });
  const [options, setOptions] = useState([
    { text: '', isCorrect: false },
    { text: '', isCorrect: false },
  ]);
  const [tagInput, setTagInput] = useState('');
  const [error, setError] = useState('');

  const handleAddOption = () => {
    setOptions([...options, { text: '', isCorrect: false }]);
  };

  const handleOptionChange = (index: number, text: string) => {
    const newOptions = [...options];
    newOptions[index].text = text;
    setOptions(newOptions);
  };

  const handleCorrectToggle = (index: number) => {
    const newOptions = [...options];
    newOptions.forEach((opt, i) => {
      opt.isCorrect = i === index;
    });
    setOptions(newOptions);
  };

  const handleAddTag = () => {
    if (tagInput.trim() && !formData.tags.includes(tagInput.trim())) {
      setFormData({ ...formData, tags: [...formData.tags, tagInput.trim()] });
      setTagInput('');
    }
  };

  const handleRemoveTag = (tag: string) => {
    setFormData({ ...formData, tags: formData.tags.filter((t) => t !== tag) });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setError('');
      // TODO: API call
      // await questionService.createQuestion({ ...formData, options });
      navigate('/org-admin/questions');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to create question');
    }
  };

  return (
    <Container maxWidth="md">
      <Box sx={{ py: 4 }}>
        <Typography variant="h4" gutterBottom>
          Create New Question
        </Typography>

        <Paper elevation={3} sx={{ p: 3, mt: 3 }}>
          <form onSubmit={handleSubmit}>
            {error && <Alert severity="error" sx={{ mb: 3 }}>{error}</Alert>}

            <Grid container spacing={3}>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Question Text"
                  multiline
                  rows={3}
                  required
                  value={formData.text}
                  onChange={(e) => setFormData({ ...formData, text: e.target.value })}
                />
              </Grid>

              <Grid item xs={12} md={4}>
                <TextField
                  fullWidth
                  select
                  label="Question Type"
                  value={formData.type}
                  onChange={(e) => setFormData({ ...formData, type: e.target.value as QuestionType })}
                >
                  <MenuItem value={QuestionType.MULTIPLE_CHOICE}>Multiple Choice</MenuItem>
                  <MenuItem value={QuestionType.TRUE_FALSE}>True/False</MenuItem>
                  <MenuItem value={QuestionType.SHORT_ANSWER}>Short Answer</MenuItem>
                  <MenuItem value={QuestionType.ESSAY}>Essay</MenuItem>
                </TextField>
              </Grid>

              <Grid item xs={12} md={4}>
                <TextField
                  fullWidth
                  select
                  label="Difficulty"
                  value={formData.difficulty}
                  onChange={(e) => setFormData({ ...formData, difficulty: e.target.value as DifficultyLevel })}
                >
                  <MenuItem value={DifficultyLevel.EASY}>Easy</MenuItem>
                  <MenuItem value={DifficultyLevel.MEDIUM}>Medium</MenuItem>
                  <MenuItem value={DifficultyLevel.HARD}>Hard</MenuItem>
                </TextField>
              </Grid>

              <Grid item xs={12} md={4}>
                <TextField
                  fullWidth
                  label="Category"
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                />
              </Grid>

              <Grid item xs={6}>
                <TextField
                  fullWidth
                  type="number"
                  label="Marks"
                  value={formData.marks}
                  onChange={(e) => setFormData({ ...formData, marks: parseInt(e.target.value) })}
                />
              </Grid>

              <Grid item xs={6}>
                <TextField
                  fullWidth
                  type="number"
                  label="Negative Marks"
                  value={formData.negativeMarks}
                  onChange={(e) => setFormData({ ...formData, negativeMarks: parseInt(e.target.value) })}
                />
              </Grid>

              {formData.type === QuestionType.MULTIPLE_CHOICE && (
                <Grid item xs={12}>
                  <Typography variant="h6" gutterBottom>
                    Options
                  </Typography>
                  {options.map((option, index) => (
                    <Box key={index} sx={{ display: 'flex', gap: 1, mb: 2 }}>
                      <TextField
                        fullWidth
                        label={`Option ${index + 1}`}
                        value={option.text}
                        onChange={(e) => handleOptionChange(index, e.target.value)}
                      />
                      <Button
                        variant={option.isCorrect ? 'contained' : 'outlined'}
                        onClick={() => handleCorrectToggle(index)}
                      >
                        {option.isCorrect ? 'Correct' : 'Mark Correct'}
                      </Button>
                      {options.length > 2 && (
                        <IconButton
                          onClick={() => setOptions(options.filter((_, i) => i !== index))}
                          color="error"
                        >
                          <Delete />
                        </IconButton>
                      )}
                    </Box>
                  ))}
                  <Button startIcon={<Add />} onClick={handleAddOption}>
                    Add Option
                  </Button>
                </Grid>
              )}

              <Grid item xs={12}>
                <Box sx={{ display: 'flex', gap: 1, mb: 1 }}>
                  <TextField
                    fullWidth
                    label="Add Tags"
                    value={tagInput}
                    onChange={(e) => setTagInput(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddTag())}
                  />
                  <Button onClick={handleAddTag}>Add</Button>
                </Box>
                <Box sx={{ display: 'flex', gap: 0.5, flexWrap: 'wrap' }}>
                  {formData.tags.map((tag) => (
                    <Chip key={tag} label={tag} onDelete={() => handleRemoveTag(tag)} />
                  ))}
                </Box>
              </Grid>

              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Explanation (Optional)"
                  multiline
                  rows={2}
                  value={formData.explanation}
                  onChange={(e) => setFormData({ ...formData, explanation: e.target.value })}
                />
              </Grid>
            </Grid>

            <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 4 }}>
              <Button onClick={() => navigate('/org-admin/questions')}>Cancel</Button>
              <Button type="submit" variant="contained">
                Create Question
              </Button>
            </Box>
          </form>
        </Paper>
      </Box>
    </Container>
  );
};

export default CreateQuestion;
