import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Progress } from '@/components/ui/progress';
import {
  CheckCircle,
  XCircle,
  Trophy,
  TrendingUp,
  AlertTriangle,
  ArrowLeft,
  Info,
  Loader2,
} from 'lucide-react';
import { useSnackbar } from 'notistack';
import api from '../services/api';

interface ExamResult {
  _id: string;
  exam: {
    _id: string;
    title: string;
    code: string;
    description: string;
    duration: number;
    totalMarks: number;
    passingMarks: number;
    settings: any;
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
  questionResults?: Array<{
    questionId: string;
    answer: any;
    correctAnswer: any;
    isCorrect: boolean;
    marksObtained: number;
    totalMarks: number;
    requiresManualGrading?: boolean;
    feedback?: string;
  }>;
  proctoringReport?: {
    totalViolations: number;
    violationBreakdown: any;
    autoSubmitted: boolean;
    warningsIssued: number;
  };
  ranking?: {
    rank: number;
    outOf: number;
    percentile: number;
    isShortlisted: boolean;
  };
  session?: {
    startTime: string;
    endTime: string;
    submittedAt: string;
    warningCount: number;
    violationsCount: number;
  };
  submittedAt?: string;
  publishedAt?: string;
  evaluatedAt?: string;
  createdAt?: string;
}

const StudentResults = () => {
  const { examId } = useParams<{ examId: string }>();
  const navigate = useNavigate();
  const { enqueueSnackbar } = useSnackbar();
  const [loading, setLoading] = useState(true);
  const [result, setResult] = useState<ExamResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchResult();
  }, [examId]);

  const fetchResult = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await api.get(`/student/exams/${examId}/result`);
      setResult(response.data);
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || 'Failed to load result';
      setError(errorMessage);
      enqueueSnackbar(errorMessage, { variant: 'error' });
    } finally {
      setLoading(false);
    }
  };

  const formatDuration = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    if (hours > 0) {
      return `${hours}h ${minutes}m`;
    }
    return `${minutes} minutes`;
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getGrade = (percentage: number) => {
    if (percentage >= 90) return { grade: 'A+', color: 'text-success' };
    if (percentage >= 80) return { grade: 'A', color: 'text-success' };
    if (percentage >= 70) return { grade: 'B+', color: 'text-success' };
    if (percentage >= 60) return { grade: 'B', color: 'text-warning' };
    if (percentage >= 50) return { grade: 'C', color: 'text-warning' };
    return { grade: 'F', color: 'text-destructive' };
  };

  if (loading) {
    return (
      <div className="container mx-auto max-w-6xl py-8">
        <div className="flex flex-col items-center justify-center min-h-[400px]">
          <Loader2 className="h-8 w-8 animate-spin text-primary mb-4" />
          <p>Loading your results...</p>
        </div>
      </div>
    );
  }

  if (error || !result) {
    return (
      <div className="container mx-auto max-w-6xl py-8">
        <Alert variant="destructive" className="mb-4">
          <AlertDescription>{error || 'Result not found'}</AlertDescription>
        </Alert>
        <Button
          variant="outline"
          className="gap-2"
          onClick={() => navigate('/student')}
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Dashboard
        </Button>
      </div>
    );
  }

  const gradeInfo = getGrade(result.score.percentage);

  return (
    <div className="container mx-auto max-w-6xl py-8">
      {/* Header */}
      <div className="mb-6">
        <Button
          variant="ghost"
          className="gap-2 mb-4"
          onClick={() => navigate('/student')}
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Dashboard
        </Button>
        <h1 className="text-4xl font-bold mb-2">Exam Result</h1>
        <p className="text-muted-foreground">
          {result.exam.title} ({result.exam.code})
        </p>
      </div>

      {/* Result Status Banner */}
      <Card className={`p-8 mb-6 text-center ${
        result.score.passed
          ? 'bg-gradient-to-br from-purple-500 to-purple-700 text-white'
          : 'bg-gradient-to-br from-red-500 to-pink-600 text-white'
      }`}>
        <div className="flex items-center justify-center mb-4">
          {result.score.passed ? (
            <CheckCircle className="h-16 w-16 mr-4" />
          ) : (
            <XCircle className="h-16 w-16 mr-4" />
          )}
          <h2 className="text-4xl font-bold">
            {result.score.passed ? 'PASSED' : 'NOT PASSED'}
          </h2>
        </div>
        <p className="text-xl">
          {result.status === 'PUBLISHED'
            ? 'Your results have been published'
            : 'Under Evaluation'}
        </p>
      </Card>

      {/* Score Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
        <Card>
          <CardContent className="pt-6 text-center">
            <p className="text-muted-foreground mb-2">Your Score</p>
            <h3 className="text-4xl font-bold">{result.score.obtained}</h3>
            <p className="text-muted-foreground">out of {result.score.total}</p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6 text-center">
            <p className="text-muted-foreground mb-2">Percentage</p>
            <h3 className={`text-4xl font-bold ${gradeInfo.color}`}>
              {result.score.percentage.toFixed(1)}%
            </h3>
            <Badge className="mt-2" variant="secondary">
              Grade: {gradeInfo.grade}
            </Badge>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6 text-center">
            <Trophy className="h-10 w-10 text-warning mx-auto mb-2" />
            <p className="text-muted-foreground mb-2">Rank</p>
            <h3 className="text-4xl font-bold">{result.ranking?.rank || '-'}</h3>
            <p className="text-muted-foreground">out of {result.ranking?.outOf || 0}</p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6 text-center">
            <TrendingUp className="h-10 w-10 text-primary mx-auto mb-2" />
            <p className="text-muted-foreground mb-2">Percentile</p>
            <h3 className="text-4xl font-bold">{result.ranking?.percentile?.toFixed(0) || '-'}</h3>
            <p className="text-muted-foreground">percentile</p>
          </CardContent>
        </Card>
      </div>

      {/* Shortlisting Status - Only show if passed */}
      {result.score?.passed && result.ranking?.isShortlisted !== undefined && (
        <Alert
          variant={result.ranking.isShortlisted ? 'success' : 'info'}
          className="mb-6"
        >
          <AlertDescription>
            <div>
              <h3 className="text-lg font-semibold mb-2">
                {result.ranking.isShortlisted
                  ? '🎉 Congratulations! You are shortlisted (Top 15%)'
                  : 'You are not shortlisted for the next round'}
              </h3>
              {result.ranking.isShortlisted && (
                <p className="text-sm">
                  Next Round Information will be shared via email. Please check your inbox regularly.
                </p>
              )}
            </div>
          </AlertDescription>
        </Alert>
      )}

      {/* Performance Analysis */}
      <Card className="p-6 mb-6">
        <h2 className="text-2xl font-semibold mb-4">Performance Analysis</h2>
        <div className="border-t pt-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div>
                <div className="flex justify-between mb-2">
                  <p className="text-sm">Attempted</p>
                  <p className="text-sm font-bold">
                    {result.analysis.attempted} / {result.analysis.attempted + result.analysis.unanswered}
                  </p>
                </div>
                <Progress
                  value={(result.analysis.attempted / (result.analysis.attempted + result.analysis.unanswered)) * 100}
                  className="h-3"
                />
              </div>

              <div>
                <div className="flex justify-between mb-2">
                  <p className="text-sm">Correct Answers</p>
                  <p className="text-sm font-bold text-success">
                    {result.analysis.correct}
                  </p>
                </div>
                <Progress
                  value={(result.analysis.correct / result.analysis.attempted) * 100}
                  className="h-3 bg-success/20"
                />
              </div>

              <div>
                <div className="flex justify-between mb-2">
                  <p className="text-sm">Incorrect Answers</p>
                  <p className="text-sm font-bold text-destructive">
                    {result.analysis.incorrect}
                  </p>
                </div>
                <Progress
                  value={(result.analysis.incorrect / result.analysis.attempted) * 100}
                  className="h-3 bg-destructive/20"
                />
              </div>
            </div>

            <div className="space-y-4">
              <div className="flex justify-between p-4 bg-muted rounded-lg">
                <p>Accuracy</p>
                <p className="font-bold">{result.analysis.accuracy.toFixed(1)}%</p>
              </div>
              <div className="flex justify-between p-4 bg-muted rounded-lg">
                <p>Time Taken</p>
                <p className="font-bold">{formatDuration(result.analysis.timeSpent)}</p>
              </div>
              <div className="flex justify-between p-4 bg-muted rounded-lg">
                <p>Unanswered</p>
                <p className="font-bold">{result.analysis.unanswered}</p>
              </div>
            </div>
          </div>
        </div>
      </Card>

      {/* Proctoring Report */}
      {result.proctoringReport && (
        <Card className="p-6 mb-6">
          <h2 className="text-2xl font-semibold mb-4">Proctoring Report</h2>
          <div className="border-t pt-4">
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex items-center gap-2">
                  <AlertTriangle className={`h-5 w-5 ${
                    result.proctoringReport.totalViolations > 0 ? 'text-warning' : 'text-success'
                  }`} />
                  <p>
                    Total Violations: <strong>{result.proctoringReport.totalViolations}</strong>
                  </p>
                </div>
                <div>
                  <p>
                    Warnings Issued: <strong>{result.proctoringReport.warningsIssued}</strong>
                  </p>
                </div>
              </div>

              {result.proctoringReport.violationBreakdown && Object.keys(result.proctoringReport.violationBreakdown).length > 0 && (
                <div>
                  <h3 className="font-semibold mb-2">Violation Details:</h3>
                  <div className="space-y-2">
                    {Object.entries(result.proctoringReport.violationBreakdown).map(([type, count]: [string, any]) => (
                      count > 0 && (
                        <div key={type} className="flex items-center justify-between bg-muted p-2 rounded">
                          <span className="capitalize">{type.replace(/_/g, ' ')}</span>
                          <Badge variant="warning">{count} time{count > 1 ? 's' : ''}</Badge>
                        </div>
                      )
                    ))}
                  </div>
                </div>
              )}

              {result.proctoringReport.autoSubmitted && (
                <Alert variant="warning">
                  <AlertDescription>
                    This exam was auto-submitted due to violation limit exceeded.
                  </AlertDescription>
                </Alert>
              )}
            </div>
          </div>
        </Card>
      )}

      {/* Submission Details */}
      <Card className="p-6 mb-6">
        <h2 className="text-2xl font-semibold mb-4">Submission Details</h2>
        <div className="border-t pt-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {result.session && (
              <>
                <div>
                  <p className="text-muted-foreground">Started At</p>
                  <p className="font-medium">{formatDate(result.session.startTime)}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Submitted At</p>
                  <p className="font-medium">{formatDate(result.session.submittedAt)}</p>
                </div>
              </>
            )}
            {result.publishedAt && (
              <div>
                <p className="text-muted-foreground">Published At</p>
                <p className="font-medium">{formatDate(result.publishedAt)}</p>
              </div>
            )}
          </div>
        </div>
      </Card>
    </div>
  );
};

export default StudentResults;
