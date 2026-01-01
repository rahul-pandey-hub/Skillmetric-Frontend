import { useEffect, useState } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ArrowLeft, Loader2, AlertCircle, CheckCircle } from 'lucide-react';
import { examService } from '../services/examService';
import { orgAdminQuestionsService } from '../services/orgAdminQuestionsService';
import { Exam } from '../types/exam';
import { Question } from '../types/question';

const ManageExamQuestions = () => {
  const { examId } = useParams<{ examId: string }>();
  const navigate = useNavigate();
  const location = useLocation();

  const [exam, setExam] = useState<Exam | null>(null);
  const [allQuestions, setAllQuestions] = useState<Question[]>([]);
  const [selectedQuestions, setSelectedQuestions] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Filters
  const [typeFilter, setTypeFilter] = useState('all');
  const [difficultyFilter, setDifficultyFilter] = useState('all');
  const [categoryFilter, setCategoryFilter] = useState('');

  // Determine base path from current location
  const basePath = location.pathname.includes('/org-admin')
    ? '/org-admin'
    : location.pathname.includes('/recruiter')
    ? '/recruiter'
    : '/admin';

  useEffect(() => {
    fetchData();
  }, [examId]);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [examResponse, questionsResponse] = await Promise.all([
        examService.getExamById(examId!),
        orgAdminQuestionsService.getAllQuestions({ page: 1, limit: 1000 }),
      ]);

      const examData = examResponse.data;
      setExam(examData);
      setAllQuestions(questionsResponse.data.data || []);

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
        navigate(`${basePath}/exams/${examId}`);
      }, 1500);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to update questions');
    } finally {
      setSaving(false);
    }
  };

  const filteredQuestions = allQuestions.filter((q) => {
    if (typeFilter !== 'all' && q.type !== typeFilter) return false;
    if (difficultyFilter !== 'all' && q.difficulty !== difficultyFilter) return false;
    if (categoryFilter && !q.category?.toLowerCase().includes(categoryFilter.toLowerCase())) return false;
    return true;
  });

  const getDifficultyVariant = (difficulty: string): 'default' | 'secondary' | 'success' | 'destructive' => {
    switch (difficulty.toUpperCase()) {
      case 'EASY':
        return 'success';
      case 'MEDIUM':
        return 'secondary';
      case 'HARD':
      case 'EXPERT':
        return 'destructive';
      default:
        return 'default';
    }
  };

  if (loading) {
    return (
      <div className="container max-w-6xl mx-auto px-4 py-8">
        <div className="flex justify-center items-center min-h-[400px]">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      </div>
    );
  }

  if (!exam) {
    return (
      <div className="container max-w-6xl mx-auto px-4 py-8">
        <div className="flex items-center gap-2 p-4 rounded-lg bg-destructive/10 border border-destructive/20 text-destructive">
          <AlertCircle className="h-5 w-5 flex-shrink-0" />
          <p>Exam not found</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container max-w-6xl mx-auto px-4 py-8">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center gap-4">
          <Button variant="ghost" onClick={() => navigate(`${basePath}/exams/${examId}`)}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back
          </Button>
          <h1 className="text-3xl font-bold">Manage Questions - {exam.title}</h1>
        </div>

        {/* Alerts */}
        {error && (
          <div className="flex items-center gap-2 p-4 rounded-lg bg-destructive/10 border border-destructive/20 text-destructive">
            <AlertCircle className="h-5 w-5 flex-shrink-0" />
            <p className="text-sm">{error}</p>
          </div>
        )}
        {success && (
          <div className="flex items-center gap-2 p-4 rounded-lg bg-green-50 border border-green-500/50 text-green-900 dark:bg-green-900/20 dark:text-green-200">
            <CheckCircle className="h-5 w-5 flex-shrink-0 text-green-600 dark:text-green-400" />
            <p className="text-sm font-medium">{success}</p>
          </div>
        )}

        {/* Main Card */}
        <Card>
          <CardHeader>
            <CardTitle>Selected: {selectedQuestions.size} questions</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Filters */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label>Filter by Type</Label>
                <Select value={typeFilter} onValueChange={setTypeFilter}>
                  <SelectTrigger>
                    <SelectValue placeholder="All Types" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Types</SelectItem>
                    <SelectItem value="MULTIPLE_CHOICE">Multiple Choice</SelectItem>
                    <SelectItem value="TRUE_FALSE">True/False</SelectItem>
                    <SelectItem value="FILL_BLANK">Fill in the Blank</SelectItem>
                    <SelectItem value="SHORT_ANSWER">Short Answer</SelectItem>
                    <SelectItem value="ESSAY">Essay</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Filter by Difficulty</Label>
                <Select value={difficultyFilter} onValueChange={setDifficultyFilter}>
                  <SelectTrigger>
                    <SelectValue placeholder="All Difficulties" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Difficulties</SelectItem>
                    <SelectItem value="EASY">Easy</SelectItem>
                    <SelectItem value="MEDIUM">Medium</SelectItem>
                    <SelectItem value="HARD">Hard</SelectItem>
                    <SelectItem value="EXPERT">Expert</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="category">Filter by Category</Label>
                <Input
                  id="category"
                  placeholder="Enter category"
                  value={categoryFilter}
                  onChange={(e) => setCategoryFilter(e.target.value)}
                />
              </div>
            </div>

            {/* Questions List */}
            <div className="max-h-[500px] overflow-y-auto space-y-3">
              {filteredQuestions.length === 0 ? (
                <p className="text-center text-muted-foreground py-8">
                  No questions found matching your filters
                </p>
              ) : (
                filteredQuestions.map((question) => (
                  <Card
                    key={question._id}
                    className={`cursor-pointer transition-colors ${
                      selectedQuestions.has(question._id)
                        ? 'bg-primary/5 border-primary/30'
                        : 'hover:bg-muted/50'
                    }`}
                    onClick={() => handleToggleQuestion(question._id)}
                  >
                    <CardContent className="pt-6">
                      <div className="flex items-start gap-3">
                        <Checkbox
                          checked={selectedQuestions.has(question._id)}
                          onCheckedChange={() => handleToggleQuestion(question._id)}
                          onClick={(e) => e.stopPropagation()}
                        />
                        <div className="flex-1 space-y-2">
                          <p className="font-medium leading-snug">{question.text}</p>
                          <div className="flex gap-2 flex-wrap">
                            <Badge variant="outline">
                              {question.type.replace('_', ' ')}
                            </Badge>
                            <Badge variant={getDifficultyVariant(question.difficulty)}>
                              {question.difficulty}
                            </Badge>
                            <Badge variant="secondary">
                              {question.marks} marks
                            </Badge>
                            {question.negativeMarks > 0 && (
                              <Badge variant="destructive" className="opacity-75">
                                -{question.negativeMarks} negative
                              </Badge>
                            )}
                            {question.category && (
                              <Badge variant="outline">{question.category}</Badge>
                            )}
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))
              )}
            </div>
          </CardContent>
        </Card>

        {/* Actions */}
        <div className="flex gap-3 justify-end">
          <Button
            variant="outline"
            onClick={() => navigate(`${basePath}/exams/${examId}`)}
            disabled={saving}
          >
            Cancel
          </Button>
          <Button onClick={handleSave} disabled={saving}>
            {saving ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Saving...
              </>
            ) : (
              'Save Changes'
            )}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default ManageExamQuestions;
