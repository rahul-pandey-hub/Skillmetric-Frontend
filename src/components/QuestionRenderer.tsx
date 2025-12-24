import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Question, QuestionType } from '../types/question';

interface QuestionRendererProps {
  question: Question;
  questionNumber: number;
  answer: any;
  onAnswerChange: (answer: any) => void;
  isReview?: boolean;
  showCorrectAnswer?: boolean;
}

const QuestionRenderer: React.FC<QuestionRendererProps> = ({
  question,
  questionNumber,
  answer,
  onAnswerChange,
  isReview = false,
  showCorrectAnswer = false,
}) => {
  const renderQuestionText = () => {
    if (question.type === QuestionType.FILL_BLANK) {
      // Split text by underscores and render with input fields
      const parts = question.text.split(/_+/g);
      const blanks = question.text.match(/_+/g) || [];

      return (
        <div className="flex flex-wrap items-center gap-2">
          {parts.map((part, index) => (
            <React.Fragment key={index}>
              <span className="text-base">{part}</span>
              {index < blanks.length && (
                <Input
                  value={Array.isArray(answer) ? answer[index] || '' : answer || ''}
                  onChange={(e) => {
                    if (Array.isArray(answer)) {
                      const newAnswer = [...answer];
                      newAnswer[index] = e.target.value;
                      onAnswerChange(newAnswer);
                    } else {
                      onAnswerChange(e.target.value);
                    }
                  }}
                  disabled={isReview}
                  className="min-w-[150px] inline-block"
                  placeholder="Your answer"
                />
              )}
            </React.Fragment>
          ))}
        </div>
      );
    }

    return <p className="text-base mb-4">{question.text}</p>;
  };

  const renderAnswerSection = () => {
    switch (question.type) {
      case QuestionType.MULTIPLE_CHOICE:
        return (
          <div className="space-y-2">
            {question.options.map((option, index) => {
              const isCorrect = showCorrectAnswer && option.id === question.correctAnswer;
              const isSelected = answer === option.id;
              const isWrong = showCorrectAnswer && isSelected && !isCorrect;

              return (
                <Card
                  key={option.id}
                  className={`p-4 cursor-pointer transition-all ${
                    isSelected ? 'shadow-md' : ''
                  } ${
                    isCorrect
                      ? 'border-2 border-success bg-success/10'
                      : isWrong
                      ? 'border-2 border-destructive bg-destructive/10'
                      : ''
                  }`}
                  onClick={() => !isReview && onAnswerChange(option.id)}
                >
                  <div className="flex items-center gap-2">
                    <input
                      type="radio"
                      checked={isSelected}
                      onChange={() => !isReview && onAnswerChange(option.id)}
                      disabled={isReview}
                      className="h-4 w-4"
                    />
                    <Label className="flex items-center gap-2 cursor-pointer flex-1">
                      <span>
                        {String.fromCharCode(65 + index)}. {option.text}
                      </span>
                      {isCorrect && showCorrectAnswer && (
                        <Badge variant="success">Correct</Badge>
                      )}
                    </Label>
                  </div>
                </Card>
              );
            })}
          </div>
        );

      case QuestionType.TRUE_FALSE:
        return (
          <div className="space-y-2">
            {question.options.map((option) => {
              const optionValue = option.id === 'true';
              const isCorrect = showCorrectAnswer && question.correctAnswer === optionValue;
              const isSelected = answer === optionValue;
              const isWrong = showCorrectAnswer && isSelected && !isCorrect;

              return (
                <Card
                  key={option.id}
                  className={`p-4 cursor-pointer transition-all ${
                    isSelected ? 'shadow-md' : ''
                  } ${
                    isCorrect
                      ? 'border-2 border-success bg-success/10'
                      : isWrong
                      ? 'border-2 border-destructive bg-destructive/10'
                      : ''
                  }`}
                  onClick={() => !isReview && onAnswerChange(optionValue)}
                >
                  <div className="flex items-center gap-2">
                    <input
                      type="radio"
                      checked={isSelected}
                      onChange={() => !isReview && onAnswerChange(optionValue)}
                      disabled={isReview}
                      className="h-4 w-4"
                    />
                    <Label className="flex items-center gap-2 cursor-pointer flex-1">
                      <span>{option.text}</span>
                      {isCorrect && showCorrectAnswer && (
                        <Badge variant="success">Correct</Badge>
                      )}
                    </Label>
                  </div>
                </Card>
              );
            })}
          </div>
        );

      case QuestionType.FILL_BLANK:
        // Already rendered in question text
        return null;

      case QuestionType.SHORT_ANSWER:
        return (
          <textarea
            className="w-full min-h-[100px] p-3 border rounded-md focus:outline-none focus:ring-2 focus:ring-ring resize-none"
            value={answer || ''}
            onChange={(e) => onAnswerChange(e.target.value)}
            placeholder="Type your answer here..."
            disabled={isReview}
            rows={4}
          />
        );

      case QuestionType.ESSAY:
        return (
          <textarea
            className="w-full min-h-[200px] p-3 border rounded-md focus:outline-none focus:ring-2 focus:ring-ring resize-none"
            value={answer || ''}
            onChange={(e) => onAnswerChange(e.target.value)}
            placeholder="Write your essay here..."
            disabled={isReview}
            rows={8}
          />
        );

      default:
        return <p>Unsupported question type</p>;
    }
  };

  return (
    <Card className="p-6 mb-4">
      {/* Question Header */}
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-semibold">Question {questionNumber}</h3>
        <div className="flex gap-2">
          <Badge variant="outline">
            {question.type.replace('_', ' ')}
          </Badge>
          <Badge variant="default">
            {question.marks} marks
          </Badge>
          {question.difficulty && (
            <Badge
              variant={
                question.difficulty === 'EASY'
                  ? 'success'
                  : question.difficulty === 'MEDIUM'
                  ? 'warning'
                  : 'destructive'
              }
            >
              {question.difficulty}
            </Badge>
          )}
        </div>
      </div>

      {/* Question Text */}
      {renderQuestionText()}

      {/* Answer Section */}
      {renderAnswerSection()}

      {/* Show explanation if in review mode */}
      {isReview && showCorrectAnswer && question.explanation && (
        <Card className="mt-4 p-4 bg-primary/10 border-primary/20">
          <p className="text-sm font-semibold text-primary mb-2">
            Explanation:
          </p>
          <p className="text-sm">{question.explanation}</p>
        </Card>
      )}
    </Card>
  );
};

export default QuestionRenderer;
