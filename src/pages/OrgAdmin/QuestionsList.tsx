import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
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
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Edit, Trash2, Plus, Eye, FolderTree, FileUp } from 'lucide-react';
import { motion } from 'framer-motion';
import { Question, QuestionType, DifficultyLevel } from '@/types/question';

export default function QuestionsList() {
  const navigate = useNavigate();
  const [questions, setQuestions] = useState<Question[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [total, setTotal] = useState(0);
  const [typeFilter, setTypeFilter] = useState('all');
  const [difficultyFilter, setDifficultyFilter] = useState('all');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [deletingId, setDeletingId] = useState<string | null>(null);

  useEffect(() => {
    fetchQuestions();
  }, [page, rowsPerPage, typeFilter, difficultyFilter, categoryFilter]);

  const fetchQuestions = async () => {
    try {
      setLoading(true);
      const { questionsService } = await import('@/services/questionsService');
      const response = await questionsService.getAllQuestions({
        page: page + 1,
        limit: rowsPerPage,
        type: typeFilter !== 'all' ? typeFilter : undefined,
        difficulty: difficultyFilter !== 'all' ? difficultyFilter : undefined,
        category: categoryFilter || undefined,
      });

      setQuestions(response.data.data || []);
      setTotal(response.data.total || 0);
    } catch (error) {
      console.error('Failed to fetch questions:', error);
      setQuestions([]);
      setTotal(0);
    } finally {
      setLoading(false);
    }
  };

  const getDifficultyVariant = (difficulty: DifficultyLevel): 'success' | 'warning' | 'destructive' => {
    switch (difficulty) {
      case DifficultyLevel.EASY:
        return 'success';
      case DifficultyLevel.MEDIUM:
        return 'warning';
      case DifficultyLevel.HARD:
        return 'destructive';
      default:
        return 'warning';
    }
  };

  const handleDelete = async (questionId: string, questionText: string) => {
    if (!window.confirm(`Are you sure you want to delete this question?\n\n"${questionText.slice(0, 100)}..."\n\nThis action cannot be undone.`)) {
      return;
    }

    try {
      setDeletingId(questionId);
      const { questionsService } = await import('@/services/questionsService');
      await questionsService.deleteQuestion(questionId);

      // Refresh the questions list
      fetchQuestions();
    } catch (error: any) {
      console.error('Delete error:', error);
      alert(error.response?.data?.message || 'Failed to delete question. Please try again.');
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Question Bank</h1>
          <p className="text-muted-foreground">Manage your organization's question library</p>
        </div>
        <div className="flex gap-2">
          <Button onClick={() => navigate('/org-admin/questions/create')}>
            <Plus className="mr-2 h-4 w-4" />
            Create Question
          </Button>
          <Button variant="outline" onClick={() => navigate('/org-admin/questions/pools')}>
            <FolderTree className="mr-2 h-4 w-4" />
            Manage Pools
          </Button>
          <Button variant="outline" onClick={() => navigate('/org-admin/questions/import')}>
            <FileUp className="mr-2 h-4 w-4" />
            Import
          </Button>
        </div>
      </div>

      {/* Filters */}
      <Card className="p-4">
        <div className="flex flex-wrap gap-4">
          <div className="w-[180px]">
            <Label htmlFor="type-filter" className="sr-only">Type</Label>
            <Select value={typeFilter} onValueChange={setTypeFilter}>
              <SelectTrigger id="type-filter">
                <SelectValue placeholder="All Types" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                <SelectItem value="MULTIPLE_CHOICE">Multiple Choice</SelectItem>
                <SelectItem value="TRUE_FALSE">True/False</SelectItem>
                <SelectItem value="SHORT_ANSWER">Short Answer</SelectItem>
                <SelectItem value="ESSAY">Essay</SelectItem>
                <SelectItem value="FILL_BLANK">Fill in the Blank</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="w-[180px]">
            <Label htmlFor="difficulty-filter" className="sr-only">Difficulty</Label>
            <Select value={difficultyFilter} onValueChange={setDifficultyFilter}>
              <SelectTrigger id="difficulty-filter">
                <SelectValue placeholder="All Difficulties" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Difficulties</SelectItem>
                <SelectItem value="EASY">Easy</SelectItem>
                <SelectItem value="MEDIUM">Medium</SelectItem>
                <SelectItem value="HARD">Hard</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="flex-1 min-w-[200px]">
            <Label htmlFor="category-filter" className="sr-only">Category</Label>
            <Input
              id="category-filter"
              placeholder="Filter by category..."
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
            />
          </div>
        </div>
      </Card>

      {/* Questions Table */}
      <Card>
        {loading ? (
          <div className="flex justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        ) : (
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Question</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Difficulty</TableHead>
                  <TableHead>Category</TableHead>
                  <TableHead>Marks</TableHead>
                  <TableHead>Tags</TableHead>
                  <TableHead className="text-center">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {questions.map((question, index) => (
                  <motion.tr
                    key={question._id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.2, delay: index * 0.05 }}
                    className="group hover:bg-muted/50"
                  >
                    <TableCell className="max-w-xs">
                      <p className="font-medium line-clamp-2">{question.text}</p>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline">
                        {question.type.replace('_', ' ')}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge variant={getDifficultyVariant(question.difficulty)}>
                        {question.difficulty}
                      </Badge>
                    </TableCell>
                    <TableCell>{question.category || '-'}</TableCell>
                    <TableCell>{question.marks}</TableCell>
                    <TableCell>
                      <div className="flex gap-1 flex-wrap max-w-[200px]">
                        {question.tags.slice(0, 2).map((tag) => (
                          <Badge key={tag} variant="secondary" className="text-xs">
                            {tag}
                          </Badge>
                        ))}
                        {question.tags.length > 2 && (
                          <Badge variant="secondary" className="text-xs">
                            +{question.tags.length - 2}
                          </Badge>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center justify-center gap-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => navigate(`/org-admin/questions/${question._id}`)}
                          title="View"
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => navigate(`/org-admin/questions/${question._id}/edit`)}
                          title="Edit"
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          title="Delete"
                          className="text-destructive hover:text-destructive"
                          onClick={() => handleDelete(question._id, question.text)}
                          disabled={deletingId === question._id}
                        >
                          {deletingId === question._id ? (
                            <div className="h-4 w-4 animate-spin rounded-full border-2 border-solid border-current border-r-transparent" />
                          ) : (
                            <Trash2 className="h-4 w-4" />
                          )}
                        </Button>
                      </div>
                    </TableCell>
                  </motion.tr>
                ))}
              </TableBody>
            </Table>
          </div>
        )}

        {/* Pagination */}
        <div className="flex items-center justify-between px-4 py-4 border-t">
          <div className="text-sm text-muted-foreground">
            Showing {page * rowsPerPage + 1} to {Math.min((page + 1) * rowsPerPage, total)} of {total} questions
          </div>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setPage(Math.max(0, page - 1))}
              disabled={page === 0}
            >
              Previous
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setPage(page + 1)}
              disabled={(page + 1) * rowsPerPage >= total}
            >
              Next
            </Button>
          </div>
        </div>
      </Card>
    </div>
  );
}
