import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { ArrowLeft, AlertCircle, X, Loader2 } from 'lucide-react';
import { QuestionType, DifficultyLevel } from '@/types/question';
import { orgAdminQuestionsService } from '@/services/orgAdminQuestionsService';

export default function EditQuestion() {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

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
    { id: crypto.randomUUID(), text: '', isCorrect: false },
    { id: crypto.randomUUID(), text: '', isCorrect: false },
  ]);
  const [shortAnswerText, setShortAnswerText] = useState('');
  const [tagInput, setTagInput] = useState('');

  useEffect(() => {
    if (id) {
      fetchQuestion();
    }
  }, [id]);

  const fetchQuestion = async () => {
    try {
      setLoading(true);
      const response = await orgAdminQuestionsService.getQuestionById(id!);
      const q = response.data;

      setFormData({
        text: q.text,
        type: q.type,
        difficulty: q.difficulty,
        category: q.category || '',
        marks: q.marks,
        negativeMarks: q.negativeMarks || 0,
        tags: q.tags || [],
        explanation: q.explanation || '',
      });

      if (q.options && q.options.length > 0) {
        setOptions(q.options);
      }

      if (q.type === QuestionType.SHORT_ANSWER && q.correctAnswer) {
        setShortAnswerText(q.correctAnswer);
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to load question');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (formData.text.length < 10) {
      setError('Question text must be at least 10 characters');
      return;
    }

    try {
      setSaving(true);
      setError('');

      let questionData: any = {
        text: formData.text,
        type: formData.type,
        difficulty: formData.difficulty,
        category: formData.category || undefined,
        explanation: formData.explanation || undefined,
        marks: formData.marks,
        negativeMarks: formData.negativeMarks,
        tags: formData.tags.length > 0 ? formData.tags : undefined,
      };

      switch (formData.type) {
        case QuestionType.MULTIPLE_CHOICE:
        case QuestionType.TRUE_FALSE:
          const correctOption = options.find(opt => opt.isCorrect);
          if (!correctOption) {
            setError('Please select a correct answer');
            return;
          }
          questionData.options = options;
          questionData.correctAnswer = formData.type === QuestionType.TRUE_FALSE
            ? correctOption.text.toLowerCase() === 'true'
            : correctOption.id;
          break;

        case QuestionType.SHORT_ANSWER:
          if (!shortAnswerText.trim()) {
            setError('Please provide a model answer');
            return;
          }
          questionData.correctAnswer = shortAnswerText;
          break;
      }

      await orgAdminQuestionsService.updateQuestion(id!, questionData);
      navigate(`/org-admin/questions/${id}`);
    } catch (err: any) {
      const errorMessage = err.response?.data?.message;
      setError(Array.isArray(errorMessage) ? errorMessage.join(', ') : errorMessage || 'Failed to update question');
    } finally {
      setSaving(false);
    }
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

  const handleCorrectToggle = (index: number) => {
    const newOptions = [...options];
    newOptions.forEach((opt, i) => {
      opt.isCorrect = i === index;
    });
    setOptions(newOptions);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <Button variant="ghost" onClick={() => navigate(`/org-admin/questions/${id}`)}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Question
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Edit Question</CardTitle>
          <CardDescription>Update question details</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            {error && (
              <div className="flex items-center gap-2 p-4 rounded-lg bg-destructive/10 border border-destructive/20 text-destructive">
                <AlertCircle className="h-5 w-5 flex-shrink-0" />
                <p className="text-sm font-medium">{error}</p>
              </div>
            )}

            <div>
              <Label htmlFor="text">Question Text * (minimum 10 characters)</Label>
              <textarea
                id="text"
                required
                rows={3}
                value={formData.text}
                onChange={(e) => setFormData({ ...formData, text: e.target.value })}
                className="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 mt-1.5"
                placeholder="Enter your question here"
              />
              <p className="text-xs text-muted-foreground mt-1">
                {formData.text.length}/10 characters minimum
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <Label>Difficulty</Label>
                <Select
                  value={formData.difficulty}
                  onValueChange={(value) => setFormData({ ...formData, difficulty: value as DifficultyLevel })}
                >
                  <SelectTrigger className="mt-1.5">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value={DifficultyLevel.EASY}>Easy</SelectItem>
                    <SelectItem value={DifficultyLevel.MEDIUM}>Medium</SelectItem>
                    <SelectItem value={DifficultyLevel.HARD}>Hard</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="category">Category</Label>
                <Input
                  id="category"
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                  placeholder="e.g., Programming"
                  className="mt-1.5"
                />
              </div>

              <div>
                <Label htmlFor="marks">Marks *</Label>
                <Input
                  id="marks"
                  type="number"
                  min="0.5"
                  step="0.5"
                  value={formData.marks}
                  onChange={(e) => setFormData({ ...formData, marks: parseFloat(e.target.value) || 0 })}
                  className="mt-1.5"
                />
              </div>
            </div>

            {(formData.type === QuestionType.MULTIPLE_CHOICE || formData.type === QuestionType.TRUE_FALSE) && (
              <div>
                <Label>Answer Options</Label>
                <div className="space-y-2 mt-2">
                  {options.map((option, index) => (
                    <div key={option.id} className="flex gap-2 items-center">
                      <div className="flex-1 p-3 border rounded-md bg-muted/50">
                        {formData.type === QuestionType.TRUE_FALSE ? option.text : (
                          <Input
                            value={option.text}
                            onChange={(e) => {
                              const newOptions = [...options];
                              newOptions[index].text = e.target.value;
                              setOptions(newOptions);
                            }}
                            placeholder={`Option ${index + 1}`}
                          />
                        )}
                      </div>
                      <Button
                        type="button"
                        variant={option.isCorrect ? 'default' : 'outline'}
                        onClick={() => handleCorrectToggle(index)}
                      >
                        {option.isCorrect ? 'Correct' : 'Mark Correct'}
                      </Button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {formData.type === QuestionType.SHORT_ANSWER && (
              <div>
                <Label htmlFor="shortAnswer">Model Answer *</Label>
                <textarea
                  id="shortAnswer"
                  rows={3}
                  value={shortAnswerText}
                  onChange={(e) => setShortAnswerText(e.target.value)}
                  className="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background mt-1.5"
                  placeholder="Enter the model answer"
                />
              </div>
            )}

            <div className="space-y-3">
              <Label htmlFor="tags">Tags</Label>
              <div className="flex gap-2">
                <Input
                  id="tags"
                  value={tagInput}
                  onChange={(e) => setTagInput(e.target.value)}
                  onKeyPress={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      handleAddTag();
                    }
                  }}
                  placeholder="Add a tag"
                />
                <Button type="button" variant="outline" onClick={handleAddTag}>
                  Add
                </Button>
              </div>
              {formData.tags.length > 0 && (
                <div className="flex gap-2 flex-wrap">
                  {formData.tags.map((tag) => (
                    <Badge key={tag} variant="secondary" className="gap-1">
                      {tag}
                      <button
                        type="button"
                        onClick={() => handleRemoveTag(tag)}
                        className="ml-1 hover:text-destructive"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </Badge>
                  ))}
                </div>
              )}
            </div>

            <div className="flex justify-between pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => navigate(`/org-admin/questions/${id}`)}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={saving}>
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
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
