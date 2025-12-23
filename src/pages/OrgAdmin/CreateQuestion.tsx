import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
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
import { Plus, Trash2, AlertCircle, X } from 'lucide-react';
import { motion } from 'framer-motion';
import { QuestionType, DifficultyLevel } from '@/types/question';

export default function CreateQuestion() {
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
    { id: crypto.randomUUID(), text: '', isCorrect: false },
    { id: crypto.randomUUID(), text: '', isCorrect: false },
  ]);
  const [shortAnswerText, setShortAnswerText] = useState('');
  const [tagInput, setTagInput] = useState('');
  const [error, setError] = useState('');

  const handleAddOption = () => {
    setOptions([...options, { id: crypto.randomUUID(), text: '', isCorrect: false }]);
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

  const handleRemoveOption = (index: number) => {
    if (options.length > 2) {
      setOptions(options.filter((_, i) => i !== index));
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

  const handleTypeChange = (newType: QuestionType) => {
    setFormData({ ...formData, type: newType });

    // Initialize options based on type
    if (newType === QuestionType.TRUE_FALSE) {
      setOptions([
        { id: crypto.randomUUID(), text: 'True', isCorrect: false },
        { id: crypto.randomUUID(), text: 'False', isCorrect: false },
      ]);
    } else if (newType === QuestionType.MULTIPLE_CHOICE) {
      setOptions([
        { id: crypto.randomUUID(), text: '', isCorrect: false },
        { id: crypto.randomUUID(), text: '', isCorrect: false },
      ]);
    }

    // Reset short answer text
    setShortAnswerText('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setError('');

      // Validate question text length
      if (formData.text.length < 10) {
        setError('Question text must be at least 10 characters long');
        return;
      }

      const { orgAdminQuestionsService } = await import('@/services/orgAdminQuestionsService');

      // Prepare data based on question type
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

      // Handle type-specific fields
      switch (formData.type) {
        case QuestionType.MULTIPLE_CHOICE:
          const correctOption = options.find(opt => opt.isCorrect);
          if (!correctOption) {
            setError('Please select a correct answer');
            return;
          }
          if (options.length < 2) {
            setError('Multiple choice questions must have at least 2 options');
            return;
          }
          questionData.options = options;
          questionData.correctAnswer = correctOption.id;
          break;

        case QuestionType.TRUE_FALSE:
          const trueFalseCorrect = options.find(opt => opt.isCorrect);
          if (!trueFalseCorrect) {
            setError('Please select a correct answer');
            return;
          }
          // For TRUE_FALSE, correctAnswer should be boolean
          questionData.options = options;
          questionData.correctAnswer = trueFalseCorrect.text.toLowerCase() === 'true';
          break;

        case QuestionType.SHORT_ANSWER:
          if (!shortAnswerText.trim()) {
            setError('Please provide a model answer for the short answer question');
            return;
          }
          questionData.correctAnswer = shortAnswerText;
          // No options for short answer
          break;

        case QuestionType.ESSAY:
          // Essay questions don't need correctAnswer or options
          break;

        default:
          setError('Invalid question type');
          return;
      }

      await orgAdminQuestionsService.createQuestion(questionData);
      navigate('/org-admin/questions');
    } catch (err: any) {
      const errorMessage = err.response?.data?.message;
      if (Array.isArray(errorMessage)) {
        setError(errorMessage.join(', '));
      } else {
        setError(errorMessage || 'Failed to create question');
      }
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Create New Question</h1>
        <p className="text-muted-foreground">Add a new question to your question bank</p>
      </div>

      {/* Form Card */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        <Card>
          <CardHeader>
            <CardTitle>Question Details</CardTitle>
            <CardDescription>Fill in the information for the new question</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Error Alert */}
              {error && (
                <div className="flex items-center gap-2 p-4 rounded-lg bg-destructive/10 border border-destructive/20 text-destructive">
                  <AlertCircle className="h-5 w-5 flex-shrink-0" />
                  <p className="text-sm font-medium">{error}</p>
                </div>
              )}

              {/* Question Text */}
              <div>
                <Label htmlFor="text">Question Text * (minimum 10 characters)</Label>
                <textarea
                  id="text"
                  required
                  rows={3}
                  value={formData.text}
                  onChange={(e) => setFormData({ ...formData, text: e.target.value })}
                  className="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 mt-1.5"
                  placeholder="Enter your question here (at least 10 characters)..."
                />
                <p className="text-xs text-muted-foreground mt-1">
                  {formData.text.length}/10 characters minimum
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Question Type */}
                <div>
                  <Label htmlFor="type">Question Type *</Label>
                  <Select
                    value={formData.type}
                    onValueChange={(value) => handleTypeChange(value as QuestionType)}
                  >
                    <SelectTrigger className="mt-1.5">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value={QuestionType.MULTIPLE_CHOICE}>Multiple Choice</SelectItem>
                      <SelectItem value={QuestionType.TRUE_FALSE}>True/False</SelectItem>
                      <SelectItem value={QuestionType.SHORT_ANSWER}>Short Answer</SelectItem>
                      <SelectItem value={QuestionType.ESSAY}>Essay</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Difficulty */}
                <div>
                  <Label htmlFor="difficulty">Difficulty *</Label>
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

                {/* Category */}
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
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Marks */}
                <div>
                  <Label htmlFor="marks">Marks *</Label>
                  <Input
                    id="marks"
                    type="number"
                    min="0"
                    value={formData.marks}
                    onChange={(e) => setFormData({ ...formData, marks: parseInt(e.target.value) || 0 })}
                    className="mt-1.5"
                  />
                </div>

                {/* Negative Marks */}
                <div>
                  <Label htmlFor="negativeMarks">Negative Marks</Label>
                  <Input
                    id="negativeMarks"
                    type="number"
                    min="0"
                    value={formData.negativeMarks}
                    onChange={(e) => setFormData({ ...formData, negativeMarks: parseInt(e.target.value) || 0 })}
                    className="mt-1.5"
                  />
                </div>
              </div>

              {/* Options for Multiple Choice */}
              {formData.type === QuestionType.MULTIPLE_CHOICE && (
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <Label>Answer Options *</Label>
                    <Button type="button" variant="outline" size="sm" onClick={handleAddOption}>
                      <Plus className="h-4 w-4 mr-1" />
                      Add Option
                    </Button>
                  </div>
                  <div className="space-y-3">
                    {options.map((option, index) => (
                      <div key={option.id} className="flex gap-2">
                        <Input
                          value={option.text}
                          onChange={(e) => handleOptionChange(index, e.target.value)}
                          placeholder={`Option ${index + 1}`}
                          className="flex-1"
                        />
                        <Button
                          type="button"
                          variant={option.isCorrect ? 'default' : 'outline'}
                          onClick={() => handleCorrectToggle(index)}
                          className="whitespace-nowrap"
                        >
                          {option.isCorrect ? 'Correct' : 'Mark Correct'}
                        </Button>
                        {options.length > 2 && (
                          <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            onClick={() => handleRemoveOption(index)}
                            className="text-destructive"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Options for True/False */}
              {formData.type === QuestionType.TRUE_FALSE && (
                <div className="space-y-4">
                  <Label>Select the Correct Answer *</Label>
                  <div className="space-y-3">
                    {options.map((option, index) => (
                      <div key={option.id} className="flex gap-2 items-center">
                        <div className="flex-1 px-4 py-2 border rounded-md bg-muted/50">
                          {option.text}
                        </div>
                        <Button
                          type="button"
                          variant={option.isCorrect ? 'default' : 'outline'}
                          onClick={() => handleCorrectToggle(index)}
                          className="whitespace-nowrap"
                        >
                          {option.isCorrect ? 'Correct Answer' : 'Mark as Correct'}
                        </Button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Model Answer for Short Answer */}
              {formData.type === QuestionType.SHORT_ANSWER && (
                <div>
                  <Label htmlFor="shortAnswer">Model Answer *</Label>
                  <textarea
                    id="shortAnswer"
                    required
                    rows={3}
                    value={shortAnswerText}
                    onChange={(e) => setShortAnswerText(e.target.value)}
                    className="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 mt-1.5"
                    placeholder="Enter the model/expected answer..."
                  />
                  <p className="text-xs text-muted-foreground mt-1">
                    This will be used as the reference answer for grading.
                  </p>
                </div>
              )}

              {/* Info for Essay Questions */}
              {formData.type === QuestionType.ESSAY && (
                <div className="p-4 rounded-lg bg-muted/50 border">
                  <p className="text-sm text-muted-foreground">
                    Essay questions will require manual grading. No model answer is needed.
                  </p>
                </div>
              )}

              {/* Tags */}
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
                    placeholder="Add a tag and press Enter"
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

              {/* Explanation */}
              <div>
                <Label htmlFor="explanation">Explanation (Optional)</Label>
                <textarea
                  id="explanation"
                  rows={2}
                  value={formData.explanation}
                  onChange={(e) => setFormData({ ...formData, explanation: e.target.value })}
                  className="flex min-h-[60px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 mt-1.5"
                  placeholder="Provide an explanation for the correct answer..."
                />
              </div>

              {/* Action Buttons */}
              <div className="flex justify-between pt-4">
                <Button type="button" variant="outline" onClick={() => navigate('/org-admin/questions')}>
                  Cancel
                </Button>
                <Button type="submit">
                  Create Question
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}
