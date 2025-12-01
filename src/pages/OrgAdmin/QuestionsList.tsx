import { useEffect, useState } from 'react';
import {
  Container,
  Typography,
  Box,
  Button,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TablePagination,
  Chip,
  IconButton,
  TextField,
  MenuItem,
  CircularProgress,
} from '@mui/material';
import { Edit, Delete, Add, Visibility } from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { Question, QuestionType, DifficultyLevel } from '../../types/question';

const QuestionsList = () => {
  const navigate = useNavigate();
  const [questions, setQuestions] = useState<Question[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [total, setTotal] = useState(0);
  const [typeFilter, setTypeFilter] = useState('');
  const [difficultyFilter, setDifficultyFilter] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');

  useEffect(() => {
    fetchQuestions();
  }, [page, rowsPerPage, typeFilter, difficultyFilter, categoryFilter]);

  const fetchQuestions = async () => {
    try {
      setLoading(true);
      // TODO: Replace with actual API call
      // const response = await questionService.getAllQuestions({ page: page + 1, limit: rowsPerPage, type: typeFilter, difficulty: difficultyFilter });

      // Mock data
      const mockQuestions: Question[] = [
        {
          _id: '1',
          text: 'What is React?',
          type: QuestionType.MULTIPLE_CHOICE,
          difficulty: DifficultyLevel.EASY,
          options: [
            { id: '1', text: 'A library', isCorrect: true },
            { id: '2', text: 'A framework' },
          ],
          correctAnswer: '1',
          marks: 2,
          negativeMarks: 0,
          tags: ['React', 'Frontend'],
          category: 'Programming',
          createdBy: { _id: '1', name: 'Admin', email: 'admin@example.com' },
          isActive: true,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        },
      ];
      setQuestions(mockQuestions);
      setTotal(mockQuestions.length);
    } catch (error) {
      console.error('Failed to fetch questions:', error);
    } finally {
      setLoading(false);
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
    <Container maxWidth="xl">
      <Box sx={{ py: 4 }}>
        <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
          <Typography variant="h4">Question Bank</Typography>
          <Box display="flex" gap={1}>
            <Button
              variant="contained"
              startIcon={<Add />}
              onClick={() => navigate('/org-admin/questions/create')}
            >
              Create Question
            </Button>
            <Button
              variant="outlined"
              onClick={() => navigate('/org-admin/questions/pools')}
            >
              Manage Pools
            </Button>
            <Button
              variant="outlined"
              onClick={() => navigate('/org-admin/questions/import')}
            >
              Import Questions
            </Button>
          </Box>
        </Box>

        <Paper elevation={3} sx={{ p: 3, mb: 3 }}>
          <Box display="flex" gap={2} flexWrap="wrap">
            <TextField
              select
              label="Type"
              variant="outlined"
              size="small"
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
              sx={{ minWidth: 150 }}
            >
              <MenuItem value="">All Types</MenuItem>
              <MenuItem value="MULTIPLE_CHOICE">Multiple Choice</MenuItem>
              <MenuItem value="TRUE_FALSE">True/False</MenuItem>
              <MenuItem value="SHORT_ANSWER">Short Answer</MenuItem>
              <MenuItem value="ESSAY">Essay</MenuItem>
              <MenuItem value="FILL_BLANK">Fill in the Blank</MenuItem>
            </TextField>
            <TextField
              select
              label="Difficulty"
              variant="outlined"
              size="small"
              value={difficultyFilter}
              onChange={(e) => setDifficultyFilter(e.target.value)}
              sx={{ minWidth: 150 }}
            >
              <MenuItem value="">All Difficulties</MenuItem>
              <MenuItem value="EASY">Easy</MenuItem>
              <MenuItem value="MEDIUM">Medium</MenuItem>
              <MenuItem value="HARD">Hard</MenuItem>
            </TextField>
            <TextField
              label="Category"
              variant="outlined"
              size="small"
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              sx={{ minWidth: 200 }}
            />
          </Box>
        </Paper>

        {loading ? (
          <Box display="flex" justifyContent="center" py={4}>
            <CircularProgress />
          </Box>
        ) : (
          <TableContainer component={Paper} elevation={3}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Question</TableCell>
                  <TableCell>Type</TableCell>
                  <TableCell>Difficulty</TableCell>
                  <TableCell>Category</TableCell>
                  <TableCell>Marks</TableCell>
                  <TableCell>Tags</TableCell>
                  <TableCell align="center">Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {questions.map((question) => (
                  <TableRow key={question._id} hover>
                    <TableCell>
                      <Typography variant="body2" noWrap sx={{ maxWidth: 300 }}>
                        {question.text}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Chip label={question.type.replace('_', ' ')} size="small" />
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={question.difficulty}
                        color={getDifficultyColor(question.difficulty)}
                        size="small"
                      />
                    </TableCell>
                    <TableCell>{question.category || '-'}</TableCell>
                    <TableCell>{question.marks}</TableCell>
                    <TableCell>
                      {question.tags.slice(0, 2).map((tag) => (
                        <Chip key={tag} label={tag} size="small" sx={{ mr: 0.5 }} />
                      ))}
                      {question.tags.length > 2 && <span>+{question.tags.length - 2}</span>}
                    </TableCell>
                    <TableCell align="center">
                      <IconButton
                        size="small"
                        onClick={() => navigate(`/org-admin/questions/${question._id}`)}
                        title="View"
                      >
                        <Visibility />
                      </IconButton>
                      <IconButton
                        size="small"
                        onClick={() => navigate(`/org-admin/questions/${question._id}/edit`)}
                        title="Edit"
                      >
                        <Edit />
                      </IconButton>
                      <IconButton
                        size="small"
                        title="Delete"
                        color="error"
                      >
                        <Delete />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
            <TablePagination
              component="div"
              count={total}
              page={page}
              onPageChange={(_, newPage) => setPage(newPage)}
              rowsPerPage={rowsPerPage}
              onRowsPerPageChange={(e) => {
                setRowsPerPage(parseInt(e.target.value, 10));
                setPage(0);
              }}
            />
          </TableContainer>
        )}
      </Box>
    </Container>
  );
};

export default QuestionsList;
