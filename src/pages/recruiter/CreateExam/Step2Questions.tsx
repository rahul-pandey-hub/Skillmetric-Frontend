import { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ExamFormData } from './index';
import { Search, Plus, Trash2, FileText } from 'lucide-react';

interface Step2Props {
  data: ExamFormData;
  updateData: (data: Partial<ExamFormData>) => void;
}

// Mock question data - in real app, fetch from API
const MOCK_QUESTIONS = [
  {
    id: '1',
    questionText: 'What is the time complexity of binary search?',
    type: 'MCQ',
    difficulty: 'easy',
    marks: 2,
    category: 'algorithms',
  },
  {
    id: '2',
    questionText: 'Explain the concept of closures in JavaScript',
    type: 'TEXT',
    difficulty: 'medium',
    marks: 5,
    category: 'programming',
  },
  {
    id: '3',
    questionText: 'What are the SOLID principles?',
    type: 'MSQ',
    difficulty: 'medium',
    marks: 3,
    category: 'system-design',
  },
  {
    id: '4',
    questionText: 'Implement a function to reverse a linked list',
    type: 'CODING',
    difficulty: 'hard',
    marks: 10,
    category: 'data-structures',
  },
];

export default function Step2Questions({ data, updateData }: Step2Props) {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCategory, setFilterCategory] = useState('all');

  const filteredQuestions = MOCK_QUESTIONS.filter((q) => {
    const matchesSearch = q.questionText.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = filterCategory === 'all' || q.category === filterCategory;
    return matchesSearch && matchesCategory;
  });

  const isQuestionSelected = (id: string) => data.questions.includes(id);

  const toggleQuestion = (id: string) => {
    const newQuestions = isQuestionSelected(id)
      ? data.questions.filter((qId) => qId !== id)
      : [...data.questions, id];
    updateData({ questions: newQuestions });
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'easy':
        return 'bg-success-100 text-success-700';
      case 'medium':
        return 'bg-warning-100 text-warning-700';
      case 'hard':
        return 'bg-destructive-100 text-destructive-700';
      default:
        return 'bg-gray-100 text-gray-700';
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4 flex-1">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <Input
              placeholder="Search questions..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
          <select
            value={filterCategory}
            onChange={(e) => setFilterCategory(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
          >
            <option value="all">All Categories</option>
            <option value="programming">Programming</option>
            <option value="algorithms">Algorithms</option>
            <option value="data-structures">Data Structures</option>
            <option value="system-design">System Design</option>
          </select>
        </div>
        <Button variant="outline">
          <Plus className="w-4 h-4 mr-2" />
          Create New
        </Button>
      </div>

      <div className="bg-primary-50 border border-primary-200 rounded-lg p-4">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-primary-900">Selected Questions</p>
            <p className="text-xs text-primary-700 mt-1">
              {data.questions.length} question{data.questions.length !== 1 ? 's' : ''} selected
            </p>
          </div>
          {data.questions.length > 0 && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => updateData({ questions: [] })}
              className="text-destructive-600 hover:text-destructive-700 hover:bg-destructive-50"
            >
              Clear All
            </Button>
          )}
        </div>
      </div>

      <div className="space-y-3 max-h-96 overflow-y-auto">
        {filteredQuestions.length === 0 ? (
          <div className="text-center py-12">
            <FileText className="w-12 h-12 text-gray-400 mx-auto mb-3" />
            <p className="text-gray-600">No questions found</p>
          </div>
        ) : (
          filteredQuestions.map((question) => (
            <div
              key={question.id}
              className={`border rounded-lg p-4 cursor-pointer transition-all ${
                isQuestionSelected(question.id)
                  ? 'border-primary-500 bg-primary-50'
                  : 'border-gray-200 bg-white hover:border-gray-300'
              }`}
              onClick={() => toggleQuestion(question.id)}
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <Badge variant="outline" className="text-xs">
                      {question.type}
                    </Badge>
                    <Badge className={getDifficultyColor(question.difficulty)}>
                      {question.difficulty}
                    </Badge>
                    <span className="text-xs text-gray-500">{question.marks} marks</span>
                  </div>
                  <p className="text-sm text-gray-900">{question.questionText}</p>
                  <p className="text-xs text-gray-500 mt-1 capitalize">{question.category}</p>
                </div>
                <div className="ml-4">
                  {isQuestionSelected(question.id) ? (
                    <div className="w-5 h-5 bg-primary-500 rounded flex items-center justify-center">
                      <svg
                        className="w-3 h-3 text-white"
                        fill="none"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path d="M5 13l4 4L19 7"></path>
                      </svg>
                    </div>
                  ) : (
                    <div className="w-5 h-5 border-2 border-gray-300 rounded"></div>
                  )}
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
