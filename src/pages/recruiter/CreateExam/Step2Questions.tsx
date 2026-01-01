import { useState, useEffect } from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ExamFormData } from './index';
import { Search, Plus, Trash2, FileText, Loader2, Sparkles } from 'lucide-react';
import { orgAdminQuestionsService } from '@/services/orgAdminQuestionsService';

interface Step2Props {
  data: ExamFormData;
  updateData: (data: Partial<ExamFormData>) => void;
}

interface Question {
  _id: string;
  text: string;
  type: string;
  difficulty: string;
  marks: number;
  category?: string;
}

export default function Step2Questions({ data, updateData }: Step2Props) {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCategory, setFilterCategory] = useState('all');
  const [questions, setQuestions] = useState<Question[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchQuestions();
  }, []);

  const fetchQuestions = async () => {
    try {
      setLoading(true);
      setError('');
      const response = await orgAdminQuestionsService.getAllQuestions({
        page: 1,
        limit: 100, // Fetch all questions
      });
      setQuestions(response.data.data || []);
    } catch (err: any) {
      console.error('Failed to fetch questions:', err);
      setError(err.response?.data?.message || 'Failed to load questions');
    } finally {
      setLoading(false);
    }
  };

  const filteredQuestions = questions.filter((q) => {
    const matchesSearch = q.text.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = filterCategory === 'all' || q.category === filterCategory;
    return matchesSearch && matchesCategory;
  });

  const isQuestionSelected = (id: string) => data.questions.includes(id);

  const toggleQuestion = (id: string) => {
    const newQuestions = isQuestionSelected(id)
      ? data.questions.filter((qId) => qId !== id)
      : [...data.questions, id];

    // Auto-calculate total marks based on selected questions
    const selectedQuestionsList = questions.filter(q => newQuestions.includes(q._id));
    const calculatedTotalMarks = selectedQuestionsList.reduce((sum, q) => sum + (q.marks || 0), 0);

    updateData({
      questions: newQuestions,
      totalMarks: calculatedTotalMarks > 0 ? calculatedTotalMarks : 100 // Default to 100 if no questions selected
    });
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty.toUpperCase()) {
      case 'EASY':
        return 'bg-success-100 text-success-700';
      case 'MEDIUM':
        return 'bg-warning-100 text-warning-700';
      case 'HARD':
      case 'EXPERT':
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
        <div className="flex gap-2">
          <Button
            variant="outline"
            onClick={() => window.open('/org-admin/questions/create', '_blank')}
          >
            <Plus className="w-4 h-4 mr-2" />
            Create Manually
          </Button>
          <Button
            variant="outline"
            onClick={() => window.open('/org-admin/ai-generate', '_blank')}
            className="border-purple-300 text-purple-700 hover:bg-purple-50"
          >
            <Sparkles className="w-4 h-4 mr-2" />
            Create with AI
          </Button>
        </div>
      </div>

      <div className="bg-primary-50 border border-primary-200 rounded-lg p-4">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-primary-900">Selected Questions</p>
            <p className="text-xs text-primary-700 mt-1">
              {data.questions.length} question{data.questions.length !== 1 ? 's' : ''} selected • Total: {data.totalMarks} marks
            </p>
          </div>
          {data.questions.length > 0 && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => updateData({ questions: [], totalMarks: 100 })}
              className="text-destructive-600 hover:text-destructive-700 hover:bg-destructive-50"
            >
              Clear All
            </Button>
          )}
        </div>
      </div>

      <div className="space-y-3 max-h-96 overflow-y-auto">
        {loading ? (
          <div className="text-center py-12">
            <Loader2 className="w-8 h-8 text-primary-500 mx-auto mb-3 animate-spin" />
            <p className="text-gray-600">Loading questions...</p>
          </div>
        ) : error ? (
          <div className="text-center py-12">
            <p className="text-destructive-600 mb-2">{error}</p>
            <Button variant="outline" size="sm" onClick={fetchQuestions}>
              Retry
            </Button>
          </div>
        ) : filteredQuestions.length === 0 ? (
          <div className="text-center py-12">
            <FileText className="w-12 h-12 text-gray-400 mx-auto mb-3" />
            <p className="text-gray-600">
              {questions.length === 0
                ? 'No questions available. Create your first question!'
                : 'No questions match your search criteria'}
            </p>
          </div>
        ) : (
          filteredQuestions.map((question) => (
            <div
              key={question._id}
              className={`border rounded-lg p-4 cursor-pointer transition-all ${
                isQuestionSelected(question._id)
                  ? 'border-primary-500 bg-primary-50'
                  : 'border-gray-200 bg-white hover:border-gray-300'
              }`}
              onClick={() => toggleQuestion(question._id)}
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <Badge variant="outline" className="text-xs">
                      {question.type.replace('_', ' ')}
                    </Badge>
                    <Badge className={getDifficultyColor(question.difficulty)}>
                      {question.difficulty}
                    </Badge>
                    <span className="text-xs text-gray-500">{question.marks} marks</span>
                  </div>
                  <p className="text-sm text-gray-900">{question.text}</p>
                  {question.category && (
                    <p className="text-xs text-gray-500 mt-1 capitalize">{question.category}</p>
                  )}
                </div>
                <div className="ml-4">
                  {isQuestionSelected(question._id) ? (
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
