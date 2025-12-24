import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Loader2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { RootState } from '../store';
import { examService } from '../services/examService';
import { Exam, ExamStatus } from '../types/exam';

const AdminDashboard = () => {
  const navigate = useNavigate();
  const { user } = useSelector((state: RootState) => state.auth);
  const [exams, setExams] = useState<Exam[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchExams();
  }, []);

  const fetchExams = async () => {
    try {
      setLoading(true);
      const response = await examService.getAllExams();
      setExams(response.data.data.slice(0, 6)); // Show only first 6
    } catch (err) {
      console.error('Failed to load exams:', err);
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

  return (
    <div className="container mx-auto max-w-6xl py-8">
      <h1 className="text-4xl font-bold mb-2">Admin Dashboard</h1>
      <p className="text-muted-foreground mb-6">Welcome, {user?.name}</p>

      <Card className="mb-6">
        <CardContent className="pt-6">
          <div className="flex gap-2 flex-wrap">
            <Button onClick={() => navigate('/admin/create-exam')}>
              Create New Exam
            </Button>
            <Button
              variant="secondary"
              onClick={() => navigate('/admin/questions')}
            >
              Manage Questions
            </Button>
            <Button
              variant="outline"
              onClick={() => navigate('/admin/exams')}
            >
              View All Exams
            </Button>
            <Button
              variant="outline"
              onClick={() => navigate('/admin/bulk-upload')}
            >
              Bulk Upload Students
            </Button>
          </div>

          <h2 className="text-2xl font-semibold mt-8 mb-4">Recent Exams</h2>

          {loading ? (
            <div className="flex justify-center py-8">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : exams.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-muted-foreground mb-4">
                No exams found. Create your first exam to get started.
              </p>
              <Button onClick={() => navigate('/admin/create-exam')}>
                Create Your First Exam
              </Button>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                {exams.map((exam) => (
                  <Card key={exam._id}>
                    <CardHeader>
                      <div className="flex justify-between items-start mb-2">
                        <CardTitle className="text-base line-clamp-1">
                          {exam.title}
                        </CardTitle>
                        <Badge variant={getStatusVariant(exam.status)}>
                          {exam.status}
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground">Code: {exam.code}</p>
                      <p className="text-sm text-muted-foreground">Duration: {exam.duration} min</p>
                      <p className="text-sm text-muted-foreground">
                        Questions: {Array.isArray(exam.questions) ? exam.questions.length : 0}
                      </p>
                    </CardHeader>
                    <CardContent className="pt-0">
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => navigate(`/admin/exams/${exam._id}`)}
                        >
                          View Details
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => navigate(`/admin/exams/${exam._id}/edit`)}
                        >
                          Edit
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
              <div className="mt-4 text-center">
                <Button variant="outline" onClick={() => navigate('/admin/exams')}>
                  View All Exams
                </Button>
              </div>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminDashboard;
