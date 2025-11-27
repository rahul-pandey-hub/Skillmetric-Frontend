import React from 'react';
import {
  Box,
  Typography,
  Radio,
  RadioGroup,
  FormControlLabel,
  TextField,
  Paper,
  Chip,
} from '@mui/material';
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
        <Box sx={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: 1 }}>
          {parts.map((part, index) => (
            <React.Fragment key={index}>
              <Typography component="span" variant="body1">
                {part}
              </Typography>
              {index < blanks.length && (
                <TextField
                  size="small"
                  variant="outlined"
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
                  sx={{ minWidth: '150px' }}
                  placeholder="Your answer"
                />
              )}
            </React.Fragment>
          ))}
        </Box>
      );
    }

    return (
      <Typography variant="body1" sx={{ mb: 3 }}>
        {question.text}
      </Typography>
    );
  };

  const renderAnswerSection = () => {
    switch (question.type) {
      case QuestionType.MULTIPLE_CHOICE:
        return (
          <RadioGroup
            value={answer || ''}
            onChange={(e) => onAnswerChange(e.target.value)}
          >
            {question.options.map((option, index) => {
              const isCorrect = showCorrectAnswer && option.id === question.correctAnswer;
              const isSelected = answer === option.id;
              const isWrong = showCorrectAnswer && isSelected && !isCorrect;

              return (
                <Paper
                  key={option.id}
                  elevation={isSelected ? 3 : 1}
                  sx={{
                    p: 2,
                    mb: 1,
                    border: isCorrect
                      ? '2px solid green'
                      : isWrong
                      ? '2px solid red'
                      : 'none',
                    backgroundColor: isCorrect
                      ? 'rgba(76, 175, 80, 0.1)'
                      : isWrong
                      ? 'rgba(244, 67, 54, 0.1)'
                      : 'inherit',
                  }}
                >
                  <FormControlLabel
                    value={option.id}
                    control={<Radio disabled={isReview} />}
                    label={
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Typography>
                          {String.fromCharCode(65 + index)}. {option.text}
                        </Typography>
                        {isCorrect && showCorrectAnswer && (
                          <Chip label="Correct" color="success" size="small" />
                        )}
                      </Box>
                    }
                  />
                </Paper>
              );
            })}
          </RadioGroup>
        );

      case QuestionType.TRUE_FALSE:
        return (
          <RadioGroup
            value={answer !== undefined ? String(answer) : ''}
            onChange={(e) => onAnswerChange(e.target.value === 'true')}
          >
            {question.options.map((option) => {
              const optionValue = option.id === 'true';
              const isCorrect = showCorrectAnswer && question.correctAnswer === optionValue;
              const isSelected = answer === optionValue;
              const isWrong = showCorrectAnswer && isSelected && !isCorrect;

              return (
                <Paper
                  key={option.id}
                  elevation={isSelected ? 3 : 1}
                  sx={{
                    p: 2,
                    mb: 1,
                    border: isCorrect
                      ? '2px solid green'
                      : isWrong
                      ? '2px solid red'
                      : 'none',
                    backgroundColor: isCorrect
                      ? 'rgba(76, 175, 80, 0.1)'
                      : isWrong
                      ? 'rgba(244, 67, 54, 0.1)'
                      : 'inherit',
                  }}
                >
                  <FormControlLabel
                    value={option.id}
                    control={<Radio disabled={isReview} />}
                    label={
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Typography>{option.text}</Typography>
                        {isCorrect && showCorrectAnswer && (
                          <Chip label="Correct" color="success" size="small" />
                        )}
                      </Box>
                    }
                  />
                </Paper>
              );
            })}
          </RadioGroup>
        );

      case QuestionType.FILL_BLANK:
        // Already rendered in question text
        return null;

      case QuestionType.SHORT_ANSWER:
        return (
          <TextField
            fullWidth
            multiline
            rows={4}
            variant="outlined"
            value={answer || ''}
            onChange={(e) => onAnswerChange(e.target.value)}
            placeholder="Type your answer here..."
            disabled={isReview}
          />
        );

      case QuestionType.ESSAY:
        return (
          <TextField
            fullWidth
            multiline
            rows={8}
            variant="outlined"
            value={answer || ''}
            onChange={(e) => onAnswerChange(e.target.value)}
            placeholder="Write your essay here..."
            disabled={isReview}
          />
        );

      default:
        return <Typography>Unsupported question type</Typography>;
    }
  };

  return (
    <Paper elevation={3} sx={{ p: 3, mb: 3 }}>
      {/* Question Header */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
        <Typography variant="h6">Question {questionNumber}</Typography>
        <Box sx={{ display: 'flex', gap: 1 }}>
          <Chip
            label={question.type.replace('_', ' ')}
            color="primary"
            size="small"
            variant="outlined"
          />
          <Chip
            label={`${question.marks} marks`}
            color="info"
            size="small"
          />
          {question.difficulty && (
            <Chip
              label={question.difficulty}
              color={
                question.difficulty === 'EASY'
                  ? 'success'
                  : question.difficulty === 'MEDIUM'
                  ? 'warning'
                  : 'error'
              }
              size="small"
            />
          )}
        </Box>
      </Box>

      {/* Question Text */}
      {renderQuestionText()}

      {/* Answer Section */}
      {renderAnswerSection()}

      {/* Show explanation if in review mode */}
      {isReview && showCorrectAnswer && question.explanation && (
        <Paper sx={{ p: 2, mt: 2, backgroundColor: 'rgba(33, 150, 243, 0.1)' }}>
          <Typography variant="subtitle2" color="primary" gutterBottom>
            Explanation:
          </Typography>
          <Typography variant="body2">{question.explanation}</Typography>
        </Paper>
      )}
    </Paper>
  );
};

export default QuestionRenderer;
