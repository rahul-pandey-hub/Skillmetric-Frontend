import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  CheckCircle,
  XCircle,
  Trophy,
  Eye,
  FileText,
  Loader2,
} from 'lucide-react';
import { useSnackbar } from 'notistack';
import api from '../services/api';

interface ExamHistory {
  _id: string;
  exam: {
    _id: string;
    title: string;
    code: string;
    description: string;
    totalMarks: number;
    passingMarks: number;
    schedule: any;
  };
  status: string;
  score: {
    obtained: number;
    total: number;
    percentage: number;
    passed: boolean;
  };
  analysis: {
    timeSpent: number;
    attempted: number;
    correct: number;
    incorrect: number;
    unanswered: number;
    accuracy: number;
  };
  rank?: number;
  percentile?: number;
  proctoringReport?: any;
  submittedAt?: string;
  publishedAt?: string;
  createdAt?: string;
}

const CandidateExamHistory = () => {
  const navigate = useNavigate();
  const { enqueueSnackbar } = useSnackbar();
  const [loading, setLoading] = useState(true);
  const [results, setResults] = useState<ExamHistory[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchResults();
  }, []);

  const fetchResults = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await api.get('/candidate/exams/results');
      setResults(response.data.data || []);
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || 'Failed to load exam history';
      setError(errorMessage);
      enqueueSnackbar(errorMessage, { variant: 'error' });
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const getStatusVariant = (status: string): "default" | "secondary" | "destructive" | "outline" | "success" | "warning" => {
    const statusConfig: Record<string, "default" | "secondary" | "destructive" | "outline" | "success" | "warning"> = {
      PUBLISHED: 'success',
      COMPLETED: 'success',
      GRADED: 'success',
      PENDING: 'warning',
      EVALUATING: 'secondary',
    };
    return statusConfig[status] || 'secondary';
  };

  const getStatusLabel = (status: string): string => {
    const statusLabels: Record<string, string> = {
      PUBLISHED: 'Completed',
      COMPLETED: 'Completed',
      GRADED: 'Graded',
      PENDING: 'Pending',
      EVALUATING: 'Evaluating',
    };
    return statusLabels[status] || status;
  };

  if (loading) {
    return (
      <div className="container mx-auto max-w-6xl py-8">
        <div className="flex justify-center items-center min-h-[400px]">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <p className="ml-4">Loading exam history...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto max-w-6xl py-8">
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      </div>
    );
  }

  if (results.length === 0) {
    return (
      <div className="container mx-auto max-w-6xl py-8">
        <Card className="p-8 text-center">
          <FileText className="h-20 w-20 text-muted-foreground mx-auto mb-4" />
          <h2 className="text-2xl font-semibold mb-2">No Exam History</h2>
          <p className="text-muted-foreground mb-4">
            You haven't taken any exams yet.
          </p>
          <Button onClick={() => navigate('/candidate')}>
            Browse Available Exams
          </Button>
        </Card>
      </div>
    );
  }

  // Calculate statistics
  const totalExams = results.length;
  const passedExams = results.filter(r => r.score?.passed).length;
  const averageScore = results.reduce((sum, r) => sum + (r.score?.percentage || 0), 0) / totalExams;

  return (
    <div className="container mx-auto max-w-6xl py-8">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-4xl font-bold mb-2">Exam History</h1>
        <p className="text-muted-foreground">
          View all your past exam attempts and results
        </p>
      </div>

      {/* Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
        <Card>
          <CardContent className="pt-6 text-center">
            <FileText className="h-10 w-10 text-primary mx-auto mb-2" />
            <p className="text-muted-foreground mb-1">Total Exams</p>
            <h2 className="text-4xl font-bold">{totalExams}</h2>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6 text-center">
            <CheckCircle className="h-10 w-10 text-success mx-auto mb-2" />
            <p className="text-muted-foreground mb-1">Passed</p>
            <h2 className="text-4xl font-bold">{passedExams}</h2>
            <p className="text-xs text-muted-foreground mt-1">
              {((passedExams / totalExams) * 100).toFixed(0)}% pass rate
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6 text-center">
            <Trophy className="h-10 w-10 text-warning mx-auto mb-2" />
            <p className="text-muted-foreground mb-1">Average Score</p>
            <h2 className="text-4xl font-bold">{averageScore.toFixed(1)}%</h2>
          </CardContent>
        </Card>
      </div>

      {/* Results Table */}
      <Card>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Exam</TableHead>
              <TableHead className="text-center">Status</TableHead>
              <TableHead className="text-center">Score</TableHead>
              <TableHead className="text-center">Percentage</TableHead>
              <TableHead className="text-center">Result</TableHead>
              <TableHead className="text-center">Rank</TableHead>
              <TableHead className="text-center">Date</TableHead>
              <TableHead className="text-center">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {results.map((result) => (
              <TableRow key={result._id}>
                <TableCell>
                  <div>
                    <p className="font-medium">{result.exam.title}</p>
                    <p className="text-xs text-muted-foreground">{result.exam.code}</p>
                  </div>
                </TableCell>
                <TableCell className="text-center">
                  <Badge variant={getStatusVariant(result.status)}>
                    {getStatusLabel(result.status)}
                  </Badge>
                </TableCell>
                <TableCell className="text-center">
                  <p className="font-medium">
                    {result.score?.obtained || 0} / {result.score?.total || 0}
                  </p>
                </TableCell>
                <TableCell className="text-center">
                  <p
                    className={`font-bold ${
                      result.score?.percentage >= 70
                        ? 'text-success'
                        : result.score?.percentage >= 40
                        ? 'text-warning'
                        : 'text-destructive'
                    }`}
                  >
                    {result.score?.percentage?.toFixed(1) || 0}%
                  </p>
                </TableCell>
                <TableCell className="text-center">
                  {result.score?.passed ? (
                    <Badge variant="success" className="gap-1">
                      <CheckCircle className="h-3 w-3" />
                      PASSED
                    </Badge>
                  ) : (
                    <Badge variant="destructive" className="gap-1">
                      <XCircle className="h-3 w-3" />
                      FAILED
                    </Badge>
                  )}
                </TableCell>
                <TableCell className="text-center">
                  <div>
                    <p>{result.rank ? `#${result.rank}` : '-'}</p>
                    {result.percentile && (
                      <p className="text-xs text-muted-foreground">
                        ({result.percentile.toFixed(0)}th)
                      </p>
                    )}
                  </div>
                </TableCell>
                <TableCell className="text-center">
                  <p className="text-sm">
                    {formatDate(result.submittedAt || result.createdAt || new Date().toISOString())}
                  </p>
                </TableCell>
                <TableCell className="text-center">
                  <Button
                    variant="outline"
                    size="sm"
                    className="gap-2"
                    onClick={() => navigate(`/candidate/results/${result.exam._id}`)}
                  >
                    <Eye className="h-4 w-4" />
                    View
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Card>

      {/* Back Button */}
      <div className="mt-6 text-center">
        <Button variant="outline" onClick={() => navigate('/candidate')}>
          Back to Dashboard
        </Button>
      </div>
    </div>
  );
};

export default CandidateExamHistory;
