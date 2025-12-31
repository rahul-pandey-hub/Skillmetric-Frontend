import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAIGenerationStore } from '../../../store/aiGenerationStore';
import {
  QuestionCategory,
  QuestionType,
  DifficultyLevel,
  TOPIC_SUBTOPICS,
  AIGenerationRequest,
} from '../../../types/aiQuestion';
import { Button } from '../../../components/ui/button';
import { Input } from '../../../components/ui/input';
import { Label } from '../../../components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../../components/ui/select';
import { Checkbox } from '../../../components/ui/checkbox';
import { Textarea } from '../../../components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../../components/ui/card';
import { Alert, AlertDescription } from '../../../components/ui/alert';
import { Loader2, Sparkles, AlertCircle } from 'lucide-react';

const AIQuestionGeneration: React.FC = () => {
  const navigate = useNavigate();
  const { generateQuestions, isGenerating, error, setError } = useAIGenerationStore();

  // Form state
  const [mainTopic, setMainTopic] = useState<QuestionCategory | ''>('');
  const [subTopic, setSubTopic] = useState('');
  const [difficulty, setDifficulty] = useState<DifficultyLevel>(DifficultyLevel.MEDIUM);
  const [numberOfQuestions, setNumberOfQuestions] = useState(10);
  const [selectedQuestionTypes, setSelectedQuestionTypes] = useState<QuestionType[]>([
    QuestionType.MULTIPLE_CHOICE,
  ]);
  const [marksPerQuestion, setMarksPerQuestion] = useState(2);
  const [includeNegativeMarking, setIncludeNegativeMarking] = useState(false);
  const [negativeMarks, setNegativeMarks] = useState(0);
  const [includeExplanations, setIncludeExplanations] = useState(true);
  const [includeHints, setIncludeHints] = useState(true);
  const [estimatedTime, setEstimatedTime] = useState(120);
  const [additionalInstructions, setAdditionalInstructions] = useState('');

  // Get subtopics based on selected main topic
  const availableSubtopics = mainTopic ? TOPIC_SUBTOPICS[mainTopic] || [] : [];

  // Handle question type toggle
  const toggleQuestionType = (type: QuestionType) => {
    if (selectedQuestionTypes.includes(type)) {
      if (selectedQuestionTypes.length > 1) {
        setSelectedQuestionTypes(selectedQuestionTypes.filter(t => t !== type));
      }
    } else {
      setSelectedQuestionTypes([...selectedQuestionTypes, type]);
    }
  };

  // Handle form submission
  const handleGenerate = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    // Validation
    if (!mainTopic || !subTopic) {
      setError('Please select both main topic and subtopic');
      return;
    }

    if (selectedQuestionTypes.length === 0) {
      setError('Please select at least one question type');
      return;
    }

    const request: AIGenerationRequest = {
      mainTopic,
      subTopic,
      difficulty,
      numberOfQuestions,
      questionTypes: selectedQuestionTypes,
      marksPerQuestion,
      additionalInstructions: additionalInstructions || undefined,
      includeNegativeMarking,
      negativeMarks: includeNegativeMarking ? negativeMarks : undefined,
      includeExplanations,
      includeHints,
      estimatedTime,
    };

    try {
      await generateQuestions(request);
      // Navigate to preview page
      navigate('/org-admin/ai-question-generation/preview');
    } catch (error) {
      // Error handled in store
      console.error('Generation failed:', error);
    }
  };

  return (
    <div className="container mx-auto py-8 px-4 max-w-4xl">
      <div className="mb-8">
        <div className="flex items-center gap-2 mb-2">
          <Sparkles className="h-6 w-6 text-primary" />
          <h1 className="text-3xl font-bold">AI Question Generation</h1>
        </div>
        <p className="text-muted-foreground">
          Generate high-quality assessment questions using AI. Select your criteria and let AI create questions for you.
        </p>
      </div>

      {error && (
        <Alert variant="destructive" className="mb-6">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <form onSubmit={handleGenerate}>
        <div className="space-y-6">
          {/* Topic Selection */}
          <Card>
            <CardHeader>
              <CardTitle>Topic & Subject</CardTitle>
              <CardDescription>Select the main topic and specific subtopic for your questions</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="mainTopic">Main Topic *</Label>
                  <Select value={mainTopic} onValueChange={(value) => {
                    setMainTopic(value as QuestionCategory);
                    setSubTopic(''); // Reset subtopic
                  }}>
                    <SelectTrigger id="mainTopic">
                      <SelectValue placeholder="Select main topic" />
                    </SelectTrigger>
                    <SelectContent>
                      {Object.values(QuestionCategory).map((category) => (
                        <SelectItem key={category} value={category}>
                          {category.replace(/_/g, ' ')}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="subTopic">Subtopic *</Label>
                  <Select value={subTopic} onValueChange={setSubTopic} disabled={!mainTopic}>
                    <SelectTrigger id="subTopic">
                      <SelectValue placeholder="Select subtopic" />
                    </SelectTrigger>
                    <SelectContent>
                      {availableSubtopics.map((topic) => (
                        <SelectItem key={topic} value={topic}>
                          {topic}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Question Configuration */}
          <Card>
            <CardHeader>
              <CardTitle>Question Configuration</CardTitle>
              <CardDescription>Configure the number, type, and difficulty of questions</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="numberOfQuestions">Number of Questions *</Label>
                  <Input
                    id="numberOfQuestions"
                    type="number"
                    min="1"
                    max="50"
                    value={numberOfQuestions}
                    onChange={(e) => setNumberOfQuestions(parseInt(e.target.value) || 1)}
                  />
                  <p className="text-xs text-muted-foreground">Max: 50</p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="marksPerQuestion">Marks per Question *</Label>
                  <Input
                    id="marksPerQuestion"
                    type="number"
                    min="0.5"
                    max="10"
                    step="0.5"
                    value={marksPerQuestion}
                    onChange={(e) => setMarksPerQuestion(parseFloat(e.target.value) || 1)}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="estimatedTime">Time (seconds) *</Label>
                  <Input
                    id="estimatedTime"
                    type="number"
                    min="30"
                    max="1800"
                    value={estimatedTime}
                    onChange={(e) => setEstimatedTime(parseInt(e.target.value) || 120)}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label>Difficulty Level *</Label>
                <div className="flex gap-4">
                  {Object.values(DifficultyLevel).map((level) => (
                    <label key={level} className="flex items-center space-x-2 cursor-pointer">
                      <input
                        type="radio"
                        name="difficulty"
                        value={level}
                        checked={difficulty === level}
                        onChange={(e) => setDifficulty(e.target.value as DifficultyLevel)}
                        className="w-4 h-4"
                      />
                      <span className="text-sm">{level}</span>
                    </label>
                  ))}
                </div>
              </div>

              <div className="space-y-2">
                <Label>Question Types * (Select at least one)</Label>
                <div className="grid grid-cols-2 gap-2">
                  {[
                    QuestionType.MULTIPLE_CHOICE,
                    QuestionType.TRUE_FALSE,
                    QuestionType.SHORT_ANSWER,
                  ].map((type) => (
                    <div key={type} className="flex items-center space-x-2">
                      <Checkbox
                        id={type}
                        checked={selectedQuestionTypes.includes(type)}
                        onCheckedChange={() => toggleQuestionType(type)}
                      />
                      <label htmlFor={type} className="text-sm cursor-pointer">
                        {type.replace(/_/g, ' ')}
                      </label>
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Advanced Options */}
          <Card>
            <CardHeader>
              <CardTitle>Advanced Options</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="includeExplanations"
                  checked={includeExplanations}
                  onCheckedChange={(checked) => setIncludeExplanations(checked as boolean)}
                />
                <label htmlFor="includeExplanations" className="text-sm cursor-pointer">
                  Include explanations
                </label>
              </div>

              <div className="flex items-center space-x-2">
                <Checkbox
                  id="includeHints"
                  checked={includeHints}
                  onCheckedChange={(checked) => setIncludeHints(checked as boolean)}
                />
                <label htmlFor="includeHints" className="text-sm cursor-pointer">
                  Include hints
                </label>
              </div>

              <div className="flex items-center space-x-2">
                <Checkbox
                  id="includeNegativeMarking"
                  checked={includeNegativeMarking}
                  onCheckedChange={(checked) => setIncludeNegativeMarking(checked as boolean)}
                />
                <label htmlFor="includeNegativeMarking" className="text-sm cursor-pointer">
                  Include negative marking
                </label>
              </div>

              {includeNegativeMarking && (
                <div className="ml-6 space-y-2">
                  <Label htmlFor="negativeMarks">Negative Marks</Label>
                  <Input
                    id="negativeMarks"
                    type="number"
                    min="0"
                    max={marksPerQuestion}
                    step="0.5"
                    value={negativeMarks}
                    onChange={(e) => setNegativeMarks(parseFloat(e.target.value) || 0)}
                    className="max-w-xs"
                  />
                </div>
              )}

              <div className="space-y-2">
                <Label htmlFor="additionalInstructions">Additional Instructions (Optional)</Label>
                <Textarea
                  id="additionalInstructions"
                  placeholder="E.g., Focus on practical examples, include code snippets, etc."
                  value={additionalInstructions}
                  onChange={(e) => setAdditionalInstructions(e.target.value)}
                  rows={3}
                  maxLength={500}
                />
                <p className="text-xs text-muted-foreground">
                  {additionalInstructions.length}/500 characters
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Submit Button */}
          <div className="flex gap-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => navigate('/org-admin/questions')}
              disabled={isGenerating}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isGenerating} className="flex-1">
              {isGenerating ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Generating Questions...
                </>
              ) : (
                <>
                  <Sparkles className="mr-2 h-4 w-4" />
                  Generate Questions
                </>
              )}
            </Button>
          </div>
        </div>
      </form>
    </div>
  );
};

export default AIQuestionGeneration;
