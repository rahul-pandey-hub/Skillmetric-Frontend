import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Plus,
  Pencil,
  Trash2,
  Search,
  RefreshCw,
  Loader2,
  X,
} from 'lucide-react';
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

  const handlePageChange = (page: number) => {
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

  const getDifficultyVariant = (difficulty: DifficultyLevel): "default" | "secondary" | "destructive" | "outline" | "success" | "warning" => {
    switch (difficulty) {
      case DifficultyLevel.EASY:
        return 'success';
      case DifficultyLevel.MEDIUM:
        return 'warning';
      case DifficultyLevel.HARD:
        return 'destructive';
      default:
        return 'secondary';
    }
  };

  return (
    <div className="container mx-auto max-w-6xl py-8">
      {/* Header */}
      <div className="flex justify-between items-start mb-8">
        <div>
          <h1 className="text-4xl font-bold mb-2">Question Bank</h1>
          <p className="text-muted-foreground">
            Manage and organize your exam questions
          </p>
        </div>
        <Button
          onClick={() => navigate('/admin/questions/create')}
          size="lg"
          className="gap-2"
        >
          <Plus className="h-5 w-5" />
          Create Question
        </Button>
      </div>

      {/* Filters */}
      <Card className="p-6 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-end">
          <div className="md:col-span-3">
            <Label htmlFor="search">Search</Label>
            <div className="relative">
              <Input
                id="search"
                value={searchText}
                onChange={(e) => setSearchText(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                placeholder="Search questions..."
              />
              <Button
                variant="ghost"
                size="icon"
                className="absolute right-0 top-0"
                onClick={handleSearch}
              >
                <Search className="h-4 w-4" />
              </Button>
            </div>
          </div>

          <div className="md:col-span-2">
            <Label htmlFor="type">Type</Label>
            <Select
              value={typeFilter}
              onValueChange={(value) => {
                setTypeFilter(value);
                handleFilterChange('type', value);
              }}
            >
              <SelectTrigger id="type">
                <SelectValue placeholder="All Types" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">All Types</SelectItem>
                {Object.values(QuestionType).map((type) => (
                  <SelectItem key={type} value={type}>
                    {type.replace('_', ' ')}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="md:col-span-2">
            <Label htmlFor="difficulty">Difficulty</Label>
            <Select
              value={difficultyFilter}
              onValueChange={(value) => {
                setDifficultyFilter(value);
                handleFilterChange('difficulty', value);
              }}
            >
              <SelectTrigger id="difficulty">
                <SelectValue placeholder="All Levels" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">All Levels</SelectItem>
                {Object.values(DifficultyLevel).map((level) => (
                  <SelectItem key={level} value={level}>
                    {level}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="md:col-span-2">
            <Label htmlFor="category">Category</Label>
            <Input
              id="category"
              value={categoryFilter}
              onChange={(e) => {
                setCategoryFilter(e.target.value);
                handleFilterChange('category', e.target.value);
              }}
              placeholder="Filter by category"
            />
          </div>

          <div className="md:col-span-3">
            <Button
              variant="outline"
              onClick={fetchQuestions}
              className="w-full gap-2"
            >
              <RefreshCw className="h-4 w-4" />
              Refresh
            </Button>
          </div>
        </div>
      </Card>

      {/* Alerts */}
      {error && (
        <Alert variant="destructive" className="mb-6">
          <AlertDescription className="flex justify-between items-center">
            <span>{error}</span>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => dispatch(setError(null))}
            >
              <X className="h-4 w-4" />
            </Button>
          </AlertDescription>
        </Alert>
      )}
      {deleteSuccess && (
        <Alert variant="success" className="mb-6">
          <AlertDescription>{deleteSuccess}</AlertDescription>
        </Alert>
      )}

      {/* Loading State */}
      {loading && (
        <div className="flex justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      )}

      {/* Questions List */}
      {!loading && questions.length === 0 && (
        <Card className="p-8 text-center">
          <h2 className="text-2xl font-semibold text-muted-foreground mb-2">
            No questions found
          </h2>
          <p className="text-muted-foreground mb-4">
            Create your first question to get started
          </p>
          <Button onClick={() => navigate('/admin/questions/create')} className="gap-2">
            <Plus className="h-4 w-4" />
            Create Question
          </Button>
        </Card>
      )}

      {!loading && questions.length > 0 && (
        <>
          <div className="space-y-4">
            {questions.map((question: Question) => (
              <Card key={question._id}>
                <CardContent className="pt-6">
                  <div className="flex justify-between items-start mb-4">
                    <div className="flex gap-2 flex-wrap">
                      <Badge variant="outline">
                        {question.type.replace('_', ' ')}
                      </Badge>
                      <Badge variant={getDifficultyVariant(question.difficulty)}>
                        {question.difficulty}
                      </Badge>
                      {question.category && (
                        <Badge variant="outline">{question.category}</Badge>
                      )}
                      <Badge variant="secondary">{question.marks} marks</Badge>
                    </div>
                    <div className="flex gap-2">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => navigate(`/admin/questions/${question._id}`)}
                      >
                        <Pencil className="h-4 w-4 text-primary" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleDeleteQuestion(question._id)}
                      >
                        <Trash2 className="h-4 w-4 text-destructive" />
                      </Button>
                    </div>
                  </div>

                  <h3 className="text-lg font-semibold mb-4">{question.text}</h3>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2 mt-4">
                    {question.options.map((option, index) => (
                      <div
                        key={option.id}
                        className={`p-3 border rounded-md ${
                          option.isCorrect
                            ? 'border-success bg-success/10'
                            : 'border-border'
                        }`}
                      >
                        <p className="text-sm">
                          <strong>{String.fromCharCode(65 + index)}.</strong> {option.text}
                        </p>
                      </div>
                    ))}
                  </div>

                  {question.tags && question.tags.length > 0 && (
                    <div className="flex gap-1 mt-4 flex-wrap">
                      {question.tags.map((tag, index) => (
                        <Badge key={index} variant="outline">
                          {tag}
                        </Badge>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Pagination */}
          <div className="flex justify-center items-center gap-2 mt-8">
            <Button
              variant="outline"
              disabled={pagination.page === 1}
              onClick={() => handlePageChange(pagination.page - 1)}
            >
              Previous
            </Button>
            <span className="text-sm text-muted-foreground">
              Page {pagination.page} of {pagination.totalPages}
            </span>
            <Button
              variant="outline"
              disabled={pagination.page === pagination.totalPages}
              onClick={() => handlePageChange(pagination.page + 1)}
            >
              Next
            </Button>
          </div>
        </>
      )}
    </div>
  );
};

export default QuestionsList;
