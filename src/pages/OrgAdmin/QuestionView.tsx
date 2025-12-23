import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, Edit, Trash2, Loader2 } from 'lucide-react';
import { orgAdminQuestionsService } from '@/services/orgAdminQuestionsService';
import { Question, QuestionType, DifficultyLevel } from '@/types/question';

export default function QuestionView() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [question, setQuestion] = useState<Question | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    if (id) {
      fetchQuestion();
    }
  }, [id]);

  const fetchQuestion = async () => {
    try {
      setLoading(true);
      setError('');
      const response = await orgAdminQuestionsService.getQuestionById(id!);
      setQuestion(response.data);
    } catch (err: any) {
      console.error('Failed to fetch question:', err);
      setError(err.response?.data?.message || 'Failed to load question');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!window.confirm(`Are you sure you want to delete this question?\n\nThis action cannot be undone.`)) {
      return;
    }

    try {
      setDeleting(true);
      await orgAdminQuestionsService.deleteQuestion(id!);
      navigate('/org-admin/questions');
    } catch (err: any) {
      console.error('Delete error:', err);
      alert(err.response?.data?.message || 'Failed to delete question');
      setDeleting(false);
    }
  };

  const getDifficultyVariant = (difficulty: DifficultyLevel) => {
    switch (difficulty) {
      case DifficultyLevel.EASY:
        return 'success';
      case DifficultyLevel.MEDIUM:
        return 'warning';
      case DifficultyLevel.HARD:
      case DifficultyLevel.EXPERT:
        return 'destructive';
      default:
        return 'default';
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (error || !question) {
    return (
      <div className="space-y-6">
        <Button variant="ghost" onClick={() => navigate('/org-admin/questions')}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Questions
        </Button>
        <Card>
          <CardContent className="pt-6">
            <p className="text-destructive text-center">{error || 'Question not found'}</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <Button variant="ghost" onClick={() => navigate('/org-admin/questions')}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Questions
        </Button>
        <div className="flex gap-2">
          <Button
            variant="outline"
            onClick={() => navigate(`/org-admin/questions/${id}/edit`)}
          >
            <Edit className="mr-2 h-4 w-4" />
            Edit
          </Button>
          <Button
            variant="destructive"
            onClick={handleDelete}
            disabled={deleting}
          >
            {deleting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Deleting...
              </>
            ) : (
              <>
                <Trash2 className="mr-2 h-4 w-4" />
                Delete
              </>
            )}
          </Button>
        </div>
      </div>

      {/* Question Details */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2 mb-2">
            <Badge variant="outline">
              {question.type.replace('_', ' ')}
            </Badge>
            <Badge variant={getDifficultyVariant(question.difficulty)}>
              {question.difficulty}
            </Badge>
            <span className="text-sm text-muted-foreground">
              {question.marks} marks
            </span>
            {question.negativeMarks > 0 && (
              <span className="text-sm text-muted-foreground">
                (-{question.negativeMarks} negative)
              </span>
            )}
          </div>
          <CardTitle className="text-2xl">{question.text}</CardTitle>
          {question.category && (
            <CardDescription className="capitalize">{question.category}</CardDescription>
          )}
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Options for MCQ/True-False */}
          {(question.type === QuestionType.MULTIPLE_CHOICE ||
            question.type === QuestionType.TRUE_FALSE) &&
            question.options && question.options.length > 0 && (
            <div>
              <h3 className="font-semibold mb-3">Options:</h3>
              <div className="space-y-2">
                {question.options.map((option, index) => (
                  <div
                    key={option.id}
                    className={`p-3 rounded-lg border ${
                      option.isCorrect
                        ? 'bg-success/10 border-success/30'
                        : 'bg-muted/50 border-border'
                    }`}
                  >
                    <div className="flex items-start justify-between">
                      <span className="flex-1">{option.text}</span>
                      {option.isCorrect && (
                        <Badge variant="success" className="ml-2">
                          Correct
                        </Badge>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Correct Answer for Short Answer */}
          {question.type === QuestionType.SHORT_ANSWER && question.correctAnswer && (
            <div>
              <h3 className="font-semibold mb-2">Model Answer:</h3>
              <p className="p-3 rounded-lg bg-muted/50 border">{question.correctAnswer}</p>
            </div>
          )}

          {/* Explanation */}
          {question.explanation && (
            <div>
              <h3 className="font-semibold mb-2">Explanation:</h3>
              <p className="text-muted-foreground">{question.explanation}</p>
            </div>
          )}

          {/* Tags */}
          {question.tags && question.tags.length > 0 && (
            <div>
              <h3 className="font-semibold mb-2">Tags:</h3>
              <div className="flex gap-2 flex-wrap">
                {question.tags.map((tag) => (
                  <Badge key={tag} variant="secondary">
                    {tag}
                  </Badge>
                ))}
              </div>
            </div>
          )}

          {/* Metadata */}
          <div className="pt-4 border-t">
            <div className="grid grid-cols-2 gap-4 text-sm text-muted-foreground">
              <div>
                <span className="font-medium">Created:</span>{' '}
                {new Date(question.createdAt).toLocaleDateString()}
              </div>
              {question.updatedAt && (
                <div>
                  <span className="font-medium">Last Updated:</span>{' '}
                  {new Date(question.updatedAt).toLocaleDateString()}
                </div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
