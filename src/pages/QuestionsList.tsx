import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import {
  Container,
  Box,
  Typography,
  Button,
  Paper,
  Grid,
  TextField,
  MenuItem,
  Card,
  CardContent,
  Chip,
  IconButton,
  Pagination,
  Alert,
  CircularProgress,
  InputAdornment,
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Search as SearchIcon,
  Refresh as RefreshIcon,
} from '@mui/icons-material';
import { RootState } from '../store';
import {
  setQuestions,
  setPagination,
  setFilters,
  setLoading,
  setError,
  removeQuestion,
} from '../store/slices/questionsSlice';
import questionsService from '../services/questionsService';
import { QuestionType, DifficultyLevel, Question } from '../types/question';

const QuestionsList: React.FC = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { questions, pagination, filters, loading, error } = useSelector(
    (state: RootState) => state.questions
  );

  const [searchText, setSearchText] = useState('');
  const [typeFilter, setTypeFilter] = useState<string>('');
  const [difficultyFilter, setDifficultyFilter] = useState<string>('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [deleteSuccess, setDeleteSuccess] = useState('');

  useEffect(() => {
    fetchQuestions();
  }, [filters]);

  const fetchQuestions = async () => {
    try {
      dispatch(setLoading(true));
      const response = await questionsService.getAllQuestions(filters);
      dispatch(setQuestions(response.data.data));
      dispatch(setPagination(response.data.pagination));
    } catch (err: any) {
      dispatch(
        setError(err.response?.data?.message || 'Failed to fetch questions')
      );
    }
  };

  const handleSearch = () => {
    dispatch(
      setFilters({
        ...filters,
        page: 1,
      })
    );
    fetchQuestions();
  };

  const handleFilterChange = (key: string, value: any) => {
    const newFilters: any = { ...filters, [key]: value || undefined, page: 1 };
    dispatch(setFilters(newFilters));
  };

  const handlePageChange = (_event: React.ChangeEvent<unknown>, page: number) => {
    dispatch(setFilters({ ...filters, page }));
  };

  const handleDeleteQuestion = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this question?')) {
      return;
    }

    try {
      await questionsService.deleteQuestion(id);
      dispatch(removeQuestion(id));
      setDeleteSuccess('Question deleted successfully');
      setTimeout(() => setDeleteSuccess(''), 3000);
    } catch (err: any) {
      dispatch(
        setError(err.response?.data?.message || 'Failed to delete question')
      );
    }
  };

  const getDifficultyColor = (difficulty: DifficultyLevel) => {
    switch (difficulty) {
      case DifficultyLevel.EASY:
        return 'success';
      case DifficultyLevel.MEDIUM:
        return 'warning';
      case DifficultyLevel.HARD:
        return 'error';
      default:
        return 'default';
    }
  };

  return (
    <Container maxWidth="lg">
      <Box sx={{ py: 4 }}>
        {/* Header */}
        <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 4 }}>
          <Box>
            <Typography variant="h4" gutterBottom>
              Question Bank
            </Typography>
            <Typography variant="subtitle1" color="textSecondary">
              Manage and organize your exam questions
            </Typography>
          </Box>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() => navigate('/admin/questions/create')}
            size="large"
          >
            Create Question
          </Button>
        </Box>

        {/* Filters */}
        <Paper elevation={2} sx={{ p: 3, mb: 3 }}>
          <Grid container spacing={2} alignItems="center">
            <Grid item xs={12} md={3}>
              <TextField
                fullWidth
                label="Search"
                value={searchText}
                onChange={(e) => setSearchText(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                InputProps={{
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton onClick={handleSearch}>
                        <SearchIcon />
                      </IconButton>
                    </InputAdornment>
                  ),
                }}
              />
            </Grid>
            <Grid item xs={12} md={2}>
              <TextField
                fullWidth
                select
                label="Type"
                value={typeFilter}
                onChange={(e) => {
                  setTypeFilter(e.target.value);
                  handleFilterChange('type', e.target.value);
                }}
              >
                <MenuItem value="">All Types</MenuItem>
                {Object.values(QuestionType).map((type) => (
                  <MenuItem key={type} value={type}>
                    {type.replace('_', ' ')}
                  </MenuItem>
                ))}
              </TextField>
            </Grid>
            <Grid item xs={12} md={2}>
              <TextField
                fullWidth
                select
                label="Difficulty"
                value={difficultyFilter}
                onChange={(e) => {
                  setDifficultyFilter(e.target.value);
                  handleFilterChange('difficulty', e.target.value);
                }}
              >
                <MenuItem value="">All Levels</MenuItem>
                {Object.values(DifficultyLevel).map((level) => (
                  <MenuItem key={level} value={level}>
                    {level}
                  </MenuItem>
                ))}
              </TextField>
            </Grid>
            <Grid item xs={12} md={2}>
              <TextField
                fullWidth
                label="Category"
                value={categoryFilter}
                onChange={(e) => {
                  setCategoryFilter(e.target.value);
                  handleFilterChange('category', e.target.value);
                }}
              />
            </Grid>
            <Grid item xs={12} md={3}>
              <Box sx={{ display: 'flex', gap: 1 }}>
                <Button
                  variant="outlined"
                  startIcon={<RefreshIcon />}
                  onClick={fetchQuestions}
                  fullWidth
                >
                  Refresh
                </Button>
              </Box>
            </Grid>
          </Grid>
        </Paper>

        {/* Alerts */}
        {error && (
          <Alert severity="error" sx={{ mb: 3 }} onClose={() => dispatch(setError(null))}>
            {error}
          </Alert>
        )}
        {deleteSuccess && (
          <Alert severity="success" sx={{ mb: 3 }}>
            {deleteSuccess}
          </Alert>
        )}

        {/* Loading State */}
        {loading && (
          <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
            <CircularProgress />
          </Box>
        )}

        {/* Questions List */}
        {!loading && questions.length === 0 && (
          <Paper elevation={2} sx={{ p: 4, textAlign: 'center' }}>
            <Typography variant="h6" color="textSecondary">
              No questions found
            </Typography>
            <Typography variant="body2" color="textSecondary" sx={{ mt: 1 }}>
              Create your first question to get started
            </Typography>
            <Button
              variant="contained"
              startIcon={<AddIcon />}
              onClick={() => navigate('/admin/questions/create')}
              sx={{ mt: 2 }}
            >
              Create Question
            </Button>
          </Paper>
        )}

        {!loading && questions.length > 0 && (
          <>
            <Grid container spacing={3}>
              {questions.map((question: Question) => (
                <Grid item xs={12} key={question._id}>
                  <Card elevation={2}>
                    <CardContent>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
                        <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                          <Chip
                            label={question.type.replace('_', ' ')}
                            size="small"
                            color="primary"
                            variant="outlined"
                          />
                          <Chip
                            label={question.difficulty}
                            size="small"
                            color={getDifficultyColor(question.difficulty)}
                          />
                          {question.category && (
                            <Chip label={question.category} size="small" variant="outlined" />
                          )}
                          <Chip label={`${question.marks} marks`} size="small" />
                        </Box>
                        <Box>
                          <IconButton
                            size="small"
                            onClick={() => navigate(`/admin/questions/${question._id}`)}
                            color="primary"
                          >
                            <EditIcon />
                          </IconButton>
                          <IconButton
                            size="small"
                            onClick={() => handleDeleteQuestion(question._id)}
                            color="error"
                          >
                            <DeleteIcon />
                          </IconButton>
                        </Box>
                      </Box>
                      <Typography variant="h6" gutterBottom>
                        {question.text}
                      </Typography>
                      <Grid container spacing={1} sx={{ mt: 2 }}>
                        {question.options.map((option, index) => (
                          <Grid item xs={12} md={6} key={option.id}>
                            <Box
                              sx={{
                                p: 1.5,
                                border: '1px solid',
                                borderColor: option.isCorrect ? 'success.main' : 'grey.300',
                                borderRadius: 1,
                                bgcolor: option.isCorrect ? 'success.light' : 'transparent',
                              }}
                            >
                              <Typography variant="body2">
                                <strong>{String.fromCharCode(65 + index)}.</strong> {option.text}
                              </Typography>
                            </Box>
                          </Grid>
                        ))}
                      </Grid>
                      {question.tags && question.tags.length > 0 && (
                        <Box sx={{ display: 'flex', gap: 0.5, mt: 2, flexWrap: 'wrap' }}>
                          {question.tags.map((tag, index) => (
                            <Chip key={index} label={tag} size="small" variant="outlined" />
                          ))}
                        </Box>
                      )}
                    </CardContent>
                  </Card>
                </Grid>
              ))}
            </Grid>

            {/* Pagination */}
            <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
              <Pagination
                count={pagination.totalPages}
                page={pagination.page}
                onChange={handlePageChange}
                color="primary"
                size="large"
              />
            </Box>
          </>
        )}
      </Box>
    </Container>
  );
};

export default QuestionsList;
