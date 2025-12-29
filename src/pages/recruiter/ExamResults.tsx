import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Download,
  Filter,
  Search,
  CheckCircle,
  XCircle,
  Clock,
  AlertTriangle,
  TrendingUp,
  Users,
  Award,
  BarChart3,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
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
import api from '../../services/api';
import { toast } from 'sonner';
import { ExamCategory, ExamAccessMode } from '@/types/exam';

interface ResultData {
  _id: string;
  candidateName: string;
  candidateEmail: string;
  candidatePhone?: string;
  score: number;
  percentage: number;
  totalMarks: number;
  status: string;
  submittedAt?: string;
  duration?: number; // in seconds
  violationsCount: number;
  violations: Array<{
    type: string;
    severity: string;
    detectedAt: string;
  }>;
  isPassed: boolean;
}

interface ExamResultsData {
  exam: {
    _id: string;
    title: string;
    code: string;
    category: string;
    accessMode: string;
    totalMarks: number;
    passingMarks: number;
    duration: number;
  };
  results: ResultData[];
  stats: {
    totalParticipants: number;
    completed: number;
    inProgress: number;
    notStarted: number;
    passed: number;
    failed: number;
    averageScore: number;
    medianScore: number;
    highestScore: number;
    lowestScore: number;
    averageDuration: number;
    completionRate: number;
    passRate: number;
    totalViolations: number;
    averageViolations: number;
  };
}

export default function ExamResults() {
  const { examId } = useParams<{ examId: string }>();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<ExamResultsData | null>(null);
  const [filteredResults, setFilteredResults] = useState<ResultData[]>([]);

  // Filters
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState<'score' | 'name' | 'violations' | 'date'>('score');

  useEffect(() => {
    if (examId) {
      fetchResults();
    }
  }, [examId]);

  useEffect(() => {
    applyFilters();
  }, [statusFilter, searchQuery, sortBy, data]);

  const fetchResults = async () => {
    try {
      setLoading(true);
      const response = await api.get(`/exams/${examId}/results`);
      setData(response.data);
    } catch (err: any) {
      console.error('Failed to load results:', err);
      toast.error(err.response?.data?.message || 'Failed to load results');
    } finally {
      setLoading(false);
    }
  };

  const applyFilters = () => {
    if (!data) return;

    let filtered = [...data.results];

    // Status filter
    if (statusFilter !== 'all') {
      if (statusFilter === 'passed') {
        filtered = filtered.filter(r => r.isPassed);
      } else if (statusFilter === 'failed') {
        filtered = filtered.filter(r => !r.isPassed && r.status === 'COMPLETED');
      } else {
        filtered = filtered.filter(r => r.status === statusFilter.toUpperCase());
      }
    }

    // Search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        r =>
          r.candidateName.toLowerCase().includes(query) ||
          r.candidateEmail.toLowerCase().includes(query)
      );
    }

    // Sorting
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'score':
          return (b.score || 0) - (a.score || 0);
        case 'name':
          return a.candidateName.localeCompare(b.candidateName);
        case 'violations':
          return (b.violationsCount || 0) - (a.violationsCount || 0);
        case 'date':
          return new Date(b.submittedAt || 0).getTime() - new Date(a.submittedAt || 0).getTime();
        default:
          return 0;
      }
    });

    setFilteredResults(filtered);
  };

  const handleExport = async (format: 'csv' | 'xlsx' | 'pdf' = 'csv') => {
    try {
      const response = await api.get(`/exams/${examId}/results/export`, {
        params: { format },
        responseType: 'blob',
      });

      const blob = new Blob([response.data], {
        type: format === 'pdf' ? 'application/pdf' : 'text/csv',
      });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `exam-results-${examId}.${format}`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);

      toast.success(`Results exported as ${format.toUpperCase()}`);
    } catch (err: any) {
      console.error('Failed to export:', err);
      toast.error(err.response?.data?.message || 'Failed to export results');
    }
  };

  const getStatusBadge = (result: ResultData) => {
    if (result.status === 'COMPLETED') {
      return result.isPassed ? (
        <Badge className="bg-green-100 text-green-800 border-green-300">
          <CheckCircle className="w-3 h-3 mr-1" />
          Passed
        </Badge>
      ) : (
        <Badge className="bg-red-100 text-red-800 border-red-300">
          <XCircle className="w-3 h-3 mr-1" />
          Failed
        </Badge>
      );
    } else if (result.status === 'IN_PROGRESS') {
      return (
        <Badge className="bg-blue-100 text-blue-800 border-blue-300">
          <Clock className="w-3 h-3 mr-1" />
          In Progress
        </Badge>
      );
    } else {
      return (
        <Badge className="bg-gray-100 text-gray-800 border-gray-300">
          Not Started
        </Badge>
      );
    }
  };

  const formatDuration = (seconds?: number) => {
    if (!seconds) return 'N/A';
    const minutes = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${minutes}m ${secs}s`;
  };

  if (loading) {
    return (
      <div className="container max-w-7xl mx-auto px-4 py-8">
        <div className="flex justify-center items-center min-h-[400px]">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
        </div>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="container max-w-7xl mx-auto px-4 py-8">
        <Alert variant="destructive">
          <AlertDescription>Failed to load exam results</AlertDescription>
        </Alert>
      </div>
    );
  }

  const { exam, results, stats } = data;
  const isRecruitment = exam.category === ExamCategory.RECRUITMENT;

  return (
    <div className="container max-w-7xl mx-auto px-4 py-8 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">{exam.title}</h1>
          <p className="text-muted-foreground mt-1">
            {exam.code} • {isRecruitment ? 'Recruitment Exam' : 'Assessment Exam'}
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => handleExport('csv')}>
            <Download className="w-4 h-4 mr-2" />
            Export CSV
          </Button>
          <Button variant="outline" onClick={() => handleExport('xlsx')}>
            Export Excel
          </Button>
          <Button variant="outline" onClick={() => navigate(`/recruiter/exams/${examId}/analytics`)}>
            <BarChart3 className="w-4 h-4 mr-2" />
            Analytics
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Total Participants
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div>
                <div className="text-3xl font-bold">{stats.totalParticipants}</div>
                <p className="text-xs text-muted-foreground mt-1">
                  {stats.completed} completed
                </p>
              </div>
              <Users className="w-8 h-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Average Score
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div>
                <div className="text-3xl font-bold">{stats.averageScore?.toFixed(1) || 0}%</div>
                <p className="text-xs text-muted-foreground mt-1">
                  Highest: {stats.highestScore || 0}%
                </p>
              </div>
              <TrendingUp className="w-8 h-8 text-green-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Pass Rate
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div>
                <div className="text-3xl font-bold">{stats.passRate?.toFixed(1) || 0}%</div>
                <p className="text-xs text-muted-foreground mt-1">
                  {stats.passed}/{stats.completed} passed
                </p>
              </div>
              <Award className="w-8 h-8 text-yellow-500" />
            </div>
            <Progress value={stats.passRate || 0} className="mt-3" />
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Total Violations
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div>
                <div className="text-3xl font-bold">{stats.totalViolations || 0}</div>
                <p className="text-xs text-muted-foreground mt-1">
                  Avg: {stats.averageViolations?.toFixed(1) || 0} per exam
                </p>
              </div>
              <AlertTriangle className="w-8 h-8 text-red-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters and Search */}
      <Card>
        <CardHeader>
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
              <CardTitle>Results</CardTitle>
              <CardDescription>
                {filteredResults.length} of {results.length} results
              </CardDescription>
            </div>
            <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
              <div className="relative flex-1 sm:flex-initial">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  placeholder="Search by name or email..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 w-full sm:w-64"
                />
              </div>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-full sm:w-40">
                  <Filter className="w-4 h-4 mr-2" />
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="passed">Passed</SelectItem>
                  <SelectItem value="failed">Failed</SelectItem>
                  <SelectItem value="completed">Completed</SelectItem>
                  <SelectItem value="in_progress">In Progress</SelectItem>
                  <SelectItem value="not_started">Not Started</SelectItem>
                </SelectContent>
              </Select>
              <Select value={sortBy} onValueChange={(v: any) => setSortBy(v)}>
                <SelectTrigger className="w-full sm:w-40">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="score">Sort by Score</SelectItem>
                  <SelectItem value="name">Sort by Name</SelectItem>
                  <SelectItem value="violations">Sort by Violations</SelectItem>
                  <SelectItem value="date">Sort by Date</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Candidate</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead className="text-center">Score</TableHead>
                  <TableHead className="text-center">Percentage</TableHead>
                  <TableHead className="text-center">Violations</TableHead>
                  <TableHead className="text-center">Duration</TableHead>
                  <TableHead className="text-center">Status</TableHead>
                  <TableHead>Submitted At</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredResults.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={8} className="text-center py-8 text-muted-foreground">
                      No results found
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredResults.map((result) => (
                    <TableRow key={result._id} className="hover:bg-muted/50">
                      <TableCell className="font-medium">{result.candidateName}</TableCell>
                      <TableCell className="text-sm text-muted-foreground">
                        {result.candidateEmail}
                      </TableCell>
                      <TableCell className="text-center font-semibold">
                        {result.score || 0}/{result.totalMarks}
                      </TableCell>
                      <TableCell className="text-center">
                        <div className="flex flex-col items-center gap-1">
                          <span className="font-medium">{result.percentage?.toFixed(1) || 0}%</span>
                          <Progress value={result.percentage || 0} className="w-16 h-2" />
                        </div>
                      </TableCell>
                      <TableCell className="text-center">
                        {result.violationsCount > 0 ? (
                          <Badge variant="destructive" className="gap-1">
                            <AlertTriangle className="w-3 h-3" />
                            {result.violationsCount}
                          </Badge>
                        ) : (
                          <Badge variant="outline" className="gap-1">
                            <CheckCircle className="w-3 h-3" />
                            0
                          </Badge>
                        )}
                      </TableCell>
                      <TableCell className="text-center text-sm">
                        {formatDuration(result.duration)}
                      </TableCell>
                      <TableCell className="text-center">{getStatusBadge(result)}</TableCell>
                      <TableCell className="text-sm text-muted-foreground">
                        {result.submittedAt
                          ? new Date(result.submittedAt).toLocaleString()
                          : 'Not submitted'}
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
