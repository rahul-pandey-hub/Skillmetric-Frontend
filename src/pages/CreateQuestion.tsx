import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Plus, Trash2 } from 'lucide-react';
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
            <h1 className="text-3xl font-bold tracking-tight">Create New Question</h1>
            <p className="text-muted-foreground mt-1">Add a new question to your question bank</p>
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

          {/* Answer Options - Dynamic based on question type */}
          {(type === QuestionType.MULTIPLE_CHOICE || type === QuestionType.TRUE_FALSE) && (
            <Card className="mb-3">
              <CardHeader>
                <div className="flex justify-between items-center">
                  <CardTitle>Answer Options</CardTitle>
                  {type === QuestionType.MULTIPLE_CHOICE && (
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={handleAddOption}
                    >
                      <Plus className="h-4 w-4 mr-2" />
                      Add Option
                    </Button>
                  )}
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground mb-4">
                  {type === QuestionType.TRUE_FALSE
                    ? 'Select the correct answer'
                    : 'Select the correct answer and manage options'}
                </p>
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
                          disabled={type === QuestionType.TRUE_FALSE}
                        />
                        <p className={`text-xs mt-1.5 ${option.text.length > 500 ? 'text-destructive' : 'text-muted-foreground'}`}>
                          {option.text.length}/500 characters
                        </p>
                      </div>
                      {type === QuestionType.MULTIPLE_CHOICE && options.length > 2 && (
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          onClick={() => handleRemoveOption(index)}
                          className="text-destructive hover:text-destructive"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Fill in the Blank */}
          {type === QuestionType.FILL_BLANK && (
            <Card className="mb-3">
              <CardHeader>
                <CardTitle>Fill in the Blank Answer</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <Alert className="border-blue-500 bg-blue-50">
                  <AlertDescription className="text-blue-900">
                    Use underscores (_____) in the question text to indicate where the blank spaces should be.
                    For example: "The capital of France is _____."
                  </AlertDescription>
                </Alert>

                <div>
                  <Label htmlFor="fillBlankAnswer" className="required">Correct Answer</Label>
                  <Input
                    id="fillBlankAnswer"
                    required
                    value={fillBlankAnswer}
                    onChange={(e) => setFillBlankAnswer(e.target.value)}
                    placeholder="e.g., Paris"
                    className="mt-1.5"
                  />
                  <p className="text-xs text-muted-foreground mt-1.5">
                    Enter the correct answer that should fill the blank
                  </p>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Short Answer */}
          {type === QuestionType.SHORT_ANSWER && (
            <Card className="mb-3">
              <CardHeader>
                <CardTitle>Short Answer</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <Alert className="border-blue-500 bg-blue-50">
                  <AlertDescription className="text-blue-900">
                    Provide a model answer for the short answer question. This will be used for reference during grading.
                  </AlertDescription>
                </Alert>

                <div>
                  <Label htmlFor="shortAnswer" className="required">Model Answer</Label>
                  <textarea
                    id="shortAnswer"
                    required
                    rows={4}
                    value={shortAnswer}
                    onChange={(e) => setShortAnswer(e.target.value)}
                    placeholder="Write the expected answer here..."
                    className="w-full mt-1.5 px-3 py-2 border border-input rounded-md focus:outline-none focus:ring-2 focus:ring-ring resize-none"
                  />
                  <p className="text-xs text-muted-foreground mt-1.5">
                    Enter the expected short answer
                  </p>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Essay Type */}
          {type === QuestionType.ESSAY && (
            <Card className="mb-3">
              <CardHeader>
                <CardTitle>Essay Question</CardTitle>
              </CardHeader>
              <CardContent>
                <Alert className="border-blue-500 bg-blue-50">
                  <AlertDescription className="text-blue-900">
                    Essay questions require manual grading. No predefined correct answer is needed.
                    Students will provide a detailed written response that needs to be evaluated by an instructor.
                  </AlertDescription>
                </Alert>
              </CardContent>
            </Card>
          )}

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
            <Button
              type="submit"
              size="lg"
              disabled={loading}
            >
              {loading ? 'Creating...' : 'Create Question'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateQuestion;
