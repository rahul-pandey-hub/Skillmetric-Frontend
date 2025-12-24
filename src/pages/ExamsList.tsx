import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Loader2, Eye, Pencil } from 'lucide-react';
import { examService } from '../services/examService';
import { Exam, ExamStatus } from '../types/exam';

const ExamsList = () => {
  const navigate = useNavigate();
  const [exams, setExams] = useState<Exam[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchExams();
  }, []);

  const fetchExams = async () => {
    try {
      setLoading(true);
      const response = await examService.getAllExams();
      setExams(response.data.data);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to load exams');
    } finally {
      setLoading(false);
    }
  };

  const getStatusVariant = (status: ExamStatus): "default" | "secondary" | "destructive" | "outline" | "success" | "warning" => {
    switch (status) {
      case ExamStatus.DRAFT:
        return 'secondary';
      case ExamStatus.PUBLISHED:
        return 'default';
      case ExamStatus.ACTIVE:
        return 'success';
      case ExamStatus.COMPLETED:
        return 'warning';
      case ExamStatus.ARCHIVED:
        return 'destructive';
      default:
        return 'secondary';
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  if (loading) {
    return (
      <div className="container mx-auto max-w-6xl py-8">
        <div className="flex justify-center items-center min-h-[400px]">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto max-w-6xl py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-4xl font-bold">Exams</h1>
        <Button onClick={() => navigate('/admin/create-exam')}>
          Create New Exam
        </Button>
      </div>

      {error && (
        <Alert variant="destructive" className="mb-4">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {exams.length === 0 ? (
        <Card className="p-8 text-center">
          <h2 className="text-2xl font-semibold text-muted-foreground mb-2">
            No exams found
          </h2>
          <p className="text-muted-foreground mb-4">
            Create your first exam to get started
          </p>
          <Button onClick={() => navigate('/admin/create-exam')}>
            Create Exam
          </Button>
        </Card>
      ) : (
        <Card>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Title</TableHead>
                <TableHead>Code</TableHead>
                <TableHead>Duration</TableHead>
                <TableHead>Questions</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Start Date</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {exams.map((exam) => (
                <TableRow key={exam._id}>
                  <TableCell className="font-medium">{exam.title}</TableCell>
                  <TableCell>{exam.code}</TableCell>
                  <TableCell>{exam.duration} min</TableCell>
                  <TableCell>
                    {Array.isArray(exam.questions) ? exam.questions.length : 0} questions
                  </TableCell>
                  <TableCell>
                    <Badge variant={getStatusVariant(exam.status)}>
                      {exam.status}
                    </Badge>
                  </TableCell>
                  <TableCell>{formatDate(exam.schedule.startDate)}</TableCell>
                  <TableCell>
                    <div className="flex gap-2">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => navigate(`/admin/exams/${exam._id}`)}
                        title="View Details"
                      >
                        <Eye className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => navigate(`/admin/exams/${exam._id}/edit`)}
                        title="Edit Exam"
                      >
                        <Pencil className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </Card>
      )}
    </div>
  );
};

export default ExamsList;
