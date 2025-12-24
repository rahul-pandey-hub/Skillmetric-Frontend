import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, Plus, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
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
      <div className="container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex justify-center py-8">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
      <div className="py-4">
        {/* Header */}
        <div className="flex items-center mb-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigate('/admin/questions')}
            className="mr-2"
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Edit Question</h1>
            <p className="text-muted-foreground mt-1">Update question details</p>
          </div>
        </div>

        {/* Alerts */}
        {error && (
          <Alert variant="destructive" className="mb-3">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}
        {success && (
          <Alert className="mb-3 border-green-500 bg-green-50 text-green-900">
            <AlertDescription>{success}</AlertDescription>
          </Alert>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit}>
          {/* Basic Info */}
          <Card className="mb-3">
            <CardHeader>
              <CardTitle>Basic Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="text" className="required">Question Text</Label>
                <textarea
                  id="text"
                  required
                  rows={4}
                  value={text}
                  onChange={(e) => setText(e.target.value)}
                  className="w-full mt-1.5 px-3 py-2 border border-input rounded-md focus:outline-none focus:ring-2 focus:ring-ring resize-none"
                />
                <p className={`text-xs mt-1.5 ${text.length > 0 && text.length < 10 ? 'text-destructive' : 'text-muted-foreground'}`}>
                  {text.length}/2000 characters (minimum 10)
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <Label htmlFor="type" className="required">Question Type</Label>
                  <Select value={type} onValueChange={(value) => setType(value as QuestionType)}>
                    <SelectTrigger className="mt-1.5">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {Object.values(QuestionType).map((qType) => (
                        <SelectItem key={qType} value={qType}>
                          {qType.replace('_', ' ')}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="difficulty" className="required">Difficulty Level</Label>
                  <Select value={difficulty} onValueChange={(value) => setDifficulty(value as DifficultyLevel)}>
                    <SelectTrigger className="mt-1.5">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {Object.values(DifficultyLevel).map((level) => (
                        <SelectItem key={level} value={level}>
                          {level}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="category">Category</Label>
                  <Input
                    id="category"
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    placeholder="e.g., Geography, Mathematics"
                    className="mt-1.5"
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Answer Options */}
          <Card className="mb-3">
            <CardHeader>
              <CardTitle>Answer Options</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground mb-4">Select the correct answer</p>
              <div className="space-y-4">
                {options.map((option, index) => (
                  <div key={option.id} className="flex items-start gap-4">
                    <div className="flex items-center h-10">
                      <input
                        type="radio"
                        id={`option-${option.id}`}
                        name="correctAnswer"
                        checked={option.isCorrect}
                        onChange={() => handleCorrectAnswerChange(index)}
                        className="h-4 w-4 text-primary border-gray-300 focus:ring-2 focus:ring-primary"
                      />
                      <label htmlFor={`option-${option.id}`} className="ml-2 text-sm font-medium min-w-[40px]">
                        {String.fromCharCode(65 + index)}.
                      </label>
                    </div>
                    <div className="flex-1">
                      <Input
                        required
                        value={option.text}
                        onChange={(e) => handleOptionChange(index, e.target.value)}
                        placeholder={`Option ${index + 1}`}
                      />
                      <p className={`text-xs mt-1.5 ${option.text.length > 500 ? 'text-destructive' : 'text-muted-foreground'}`}>
                        {option.text.length}/500 characters
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Scoring */}
          <Card className="mb-3">
            <CardHeader>
              <CardTitle>Scoring</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="marks" className="required">Marks</Label>
                  <Input
                    id="marks"
                    type="number"
                    required
                    min={0.5}
                    step={0.5}
                    value={marks}
                    onChange={(e) => setMarks(parseFloat(e.target.value))}
                    className="mt-1.5"
                  />
                  <p className="text-xs text-muted-foreground mt-1.5">
                    Marks awarded for correct answer (minimum 0.5)
                  </p>
                </div>

                <div>
                  <Label htmlFor="negativeMarks">Negative Marks</Label>
                  <Input
                    id="negativeMarks"
                    type="number"
                    min={0}
                    step={0.25}
                    value={negativeMarks}
                    onChange={(e) => setNegativeMarks(parseFloat(e.target.value))}
                    className="mt-1.5"
                  />
                  <p className="text-xs text-muted-foreground mt-1.5">
                    Marks deducted for incorrect answer
                  </p>
                </div>
              </div>

              <div>
                <Label htmlFor="explanation">Explanation (Optional)</Label>
                <textarea
                  id="explanation"
                  rows={3}
                  value={explanation}
                  onChange={(e) => setExplanation(e.target.value)}
                  className="w-full mt-1.5 px-3 py-2 border border-input rounded-md focus:outline-none focus:ring-2 focus:ring-ring resize-none"
                />
                <p className={`text-xs mt-1.5 ${explanation.length > 1000 ? 'text-destructive' : 'text-muted-foreground'}`}>
                  {explanation.length}/1000 characters
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Tags */}
          <Card className="mb-3">
            <CardHeader>
              <CardTitle>Tags (Optional)</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex gap-2">
                <div className="flex-1">
                  <Input
                    value={tagInput}
                    onChange={(e) => setTagInput(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddTag())}
                    placeholder="Add tag and press Enter"
                  />
                  <p className="text-xs text-muted-foreground mt-1.5">
                    Press Enter to add tag
                  </p>
                </div>
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleAddTag}
                  disabled={!tagInput.trim()}
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Add
                </Button>
              </div>

              {tags.length > 0 && (
                <div className="flex gap-2 flex-wrap">
                  {tags.map((tag) => (
                    <Badge
                      key={tag}
                      variant="outline"
                      className="cursor-pointer hover:bg-destructive hover:text-destructive-foreground"
                      onClick={() => handleDeleteTag(tag)}
                    >
                      {tag}
                      <span className="ml-1 text-xs">&times;</span>
                    </Badge>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Actions */}
          <div className="flex gap-2 justify-end">
            <Button
              type="button"
              variant="outline"
              size="lg"
              onClick={() => navigate('/admin/questions')}
              disabled={loading}
            >
              Cancel
            </Button>
            <Button type="submit" size="lg" disabled={loading}>
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Updating...
                </>
              ) : (
                'Update Question'
              )}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditQuestion;
