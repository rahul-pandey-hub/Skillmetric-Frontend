import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAIGenerationStore } from '../../../store/aiGenerationStore';
import { Button } from '../../../components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../../../components/ui/card';
import { Checkbox } from '../../../components/ui/checkbox';
import { Alert, AlertDescription } from '../../../components/ui/alert';
import { Badge } from '../../../components/ui/badge';
import { CheckCircle2, XCircle, Edit, Trash2, RefreshCw, Save, AlertCircle } from 'lucide-react';
import { toast } from 'sonner';

const AIQuestionPreview: React.FC = () => {
  const navigate = useNavigate();
  const {
    questions,
    selectedQuestionIds,
    status,
    metadata,
    isSaving,
    toggleQuestionSelection,
    selectAllQuestions,
    deselectAllQuestions,
    deleteQuestion,
    regenerateQuestion,
    saveQuestions,
    resetGeneration,
  } = useAIGenerationStore();

  const [regeneratingIndex, setRegeneratingIndex] = useState<number | null>(null);

  if (questions.length === 0) {
    return (
      <div className="container mx-auto py-8 px-4">
        <Alert>
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            No questions to preview. Please generate questions first.
          </AlertDescription>
        </Alert>
        <Button onClick={() => navigate('/org-admin/ai-question-generation')} className="mt-4">
          Generate Questions
        </Button>
      </div>
    );
  }

  const handleRegenerateQuestion = async (index: number) => {
    setRegeneratingIndex(index);
    try {
      await regenerateQuestion(index);
      toast.success('Question regenerated successfully');
    } catch (error) {
      toast.error('Failed to regenerate question');
    } finally {
      setRegeneratingIndex(null);
    }
  };

  const handleSave = async () => {
    if (selectedQuestionIds.size === 0) {
      toast.error('Please select at least one question to save');
      return;
    }

    try {
      await saveQuestions({
        markAsPublic: false,
        additionalTags: ['ai-generated'],
      });

      toast.success(`${selectedQuestionIds.size} questions saved successfully!`);

      // Navigate to questions list
      setTimeout(() => {
        resetGeneration();
        navigate('/org-admin/questions');
      }, 1500);
    } catch (error) {
      toast.error('Failed to save questions');
    }
  };

  const selectedCount = selectedQuestionIds.size;
  const totalMarks = questions
    .filter(q => selectedQuestionIds.has(q.tempId))
    .reduce((sum, q) => sum + q.marks, 0);

  return (
    <div className="container mx-auto py-8 px-4 max-w-6xl">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-3xl font-bold mb-2">Review Generated Questions</h1>
        <p className="text-muted-foreground">
          Generated {metadata?.generated}/{metadata?.requested} questions • {questions[0]?.subcategory} •{' '}
          {questions[0]?.difficulty}
        </p>
      </div>

      {/* Status Banner */}
      {status === 'PARTIAL' && (
        <Alert variant="warning" className="mb-4">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            Partial success: {metadata?.generated} of {metadata?.requested} questions generated. {metadata?.failed}{' '}
            failed.
          </AlertDescription>
        </Alert>
      )}

      {/* Bulk Actions */}
      <div className="flex items-center justify-between mb-6 p-4 bg-muted rounded-lg">
        <div className="flex items-center gap-4">
          <Button size="sm" variant="outline" onClick={selectAllQuestions}>
            Select All
          </Button>
          <Button size="sm" variant="outline" onClick={deselectAllQuestions}>
            Deselect All
          </Button>
          <span className="text-sm text-muted-foreground">
            {selectedCount} of {questions.length} selected
          </span>
        </div>

        <div className="flex items-center gap-4">
          <div className="text-sm">
            <span className="font-semibold">Total Marks:</span> {totalMarks}
          </div>
          <div className="text-sm">
            <span className="font-semibold">Est. Time:</span>{' '}
            {Math.round((selectedCount * questions[0]?.estimatedTime) / 60)} min
          </div>
        </div>
      </div>

      {/* Questions List */}
      <div className="space-y-4 mb-6">
        {questions.map((question, index) => (
          <Card
            key={question.tempId}
            className={selectedQuestionIds.has(question.tempId) ? 'ring-2 ring-primary' : ''}
          >
            <CardHeader>
              <div className="flex items-start justify-between">
                <div className="flex items-start gap-3 flex-1">
                  <Checkbox
                    checked={selectedQuestionIds.has(question.tempId)}
                    onCheckedChange={() => toggleQuestionSelection(question.tempId)}
                  />
                  <div className="flex-1">
                    <CardTitle className="text-lg mb-2">
                      Question {index + 1} of {questions.length}
                    </CardTitle>
                    <div className="flex gap-2">
                      <Badge variant="outline">{question.type.replace(/_/g, ' ')}</Badge>
                      <Badge variant="outline">{question.marks} marks</Badge>
                      <Badge variant="outline">{question.estimatedTime}s</Badge>
                    </div>
                  </div>
                </div>

                <div className="flex gap-2">
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => handleRegenerateQuestion(index)}
                    disabled={regeneratingIndex === index}
                  >
                    {regeneratingIndex === index ? (
                      <RefreshCw className="h-4 w-4 animate-spin" />
                    ) : (
                      <RefreshCw className="h-4 w-4" />
                    )}
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => {
                      deleteQuestion(question.tempId);
                      toast.success('Question deleted');
                    }}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardHeader>

            <CardContent className="space-y-4">
              {/* Question Text */}
              <div className="p-4 bg-muted rounded-lg">
                <p className="font-medium">{question.text}</p>
              </div>

              {/* Options (for MCQ) */}
              {question.options && question.options.length > 0 && (
                <div className="space-y-2">
                  {question.options.map((option) => (
                    <div
                      key={option.id}
                      className={`p-3 rounded border ${
                        option.isCorrect ? 'bg-green-50 border-green-500' : 'bg-background'
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        {option.isCorrect ? (
                          <CheckCircle2 className="h-4 w-4 text-green-600" />
                        ) : (
                          <XCircle className="h-4 w-4 text-muted-foreground" />
                        )}
                        <span>{option.text}</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Explanation */}
              {question.explanation && (
                <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                  <p className="text-sm font-semibold mb-1 text-blue-900">Explanation:</p>
                  <p className="text-sm text-blue-800">{question.explanation}</p>
                </div>
              )}

              {/* Hints */}
              {question.hints && question.hints.length > 0 && (
                <div className="p-4 bg-yellow-50 rounded-lg border border-yellow-200">
                  <p className="text-sm font-semibold mb-1 text-yellow-900">Hints:</p>
                  <ul className="list-disc list-inside space-y-1">
                    {question.hints.map((hint, i) => (
                      <li key={i} className="text-sm text-yellow-800">
                        {hint}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Action Buttons */}
      <div className="flex justify-between gap-4 sticky bottom-4 bg-background p-4 rounded-lg border shadow-lg">
        <Button
          variant="outline"
          onClick={() => {
            if (confirm('Are you sure? Unsaved questions will be lost.')) {
              resetGeneration();
              navigate('/org-admin/ai-question-generation');
            }
          }}
        >
          Regenerate All
        </Button>

        <div className="flex gap-4">
          <Button variant="outline" onClick={() => navigate('/org-admin/questions')}>
            Cancel
          </Button>
          <Button onClick={handleSave} disabled={isSaving || selectedCount === 0}>
            {isSaving ? (
              <>
                <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                Saving...
              </>
            ) : (
              <>
                <Save className="mr-2 h-4 w-4" />
                Save {selectedCount} Question{selectedCount !== 1 ? 's' : ''} to Bank
              </>
            )}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default AIQuestionPreview;
