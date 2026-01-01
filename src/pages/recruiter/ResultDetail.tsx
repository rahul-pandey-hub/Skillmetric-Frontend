import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import {
  CheckCircle,
  XCircle,
  Trophy,
  TrendingUp,
  AlertTriangle,
  ArrowLeft,
  Clock,
  User,
  Mail,
  Calendar,
  Award,
  Target,
  Activity,
  Loader2,
} from 'lucide-react';
import { toast } from 'sonner';
import api from '../../services/api';

interface ResultDetail {
  _id: string;
  exam: {
    _id: string;
    title: string;
    code: string;
    description: string;
    duration: number;
    totalMarks: number;
    passingMarks: number;
  };
  candidate: {
    name: string;
    email: string;
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
  ranking: {
    rank: number;
    outOf: number;
    percentile: number;
  };
  proctoringReport: {
    totalViolations: number;
    violationBreakdown: Array<{
      type: string;
      severity: string;
      detectedAt: string;
    }>;
    autoSubmitted: boolean;
    warningsIssued: number;
  };
  session: {
    startTime: string;
    endTime: string;
    submittedAt: string;
    warningCount: number;
    violationsCount: number;
  } | null;
  submittedAt?: string;
  createdAt?: string;
}

export default function ResultDetail() {
  const { examId, resultId } = useParams<{ examId: string; resultId: string }>();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [result, setResult] = useState<ResultDetail | null>(null);

  useEffect(() => {
    fetchResultDetail();
  }, [examId, resultId]);

  const fetchResultDetail = async () => {
    try {
      setLoading(true);
      const response = await api.get(`/exams/${examId}/results/${resultId}`);
      setResult(response.data);
    } catch (error: any) {
      console.error('Failed to load result:', error);
      toast.error(error.response?.data?.message || 'Failed to load result details');
    } finally {
      setLoading(false);
    }
  };

  const formatDuration = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;

    if (hours > 0) {
      return `${hours}h ${minutes}m ${secs}s`;
    }
    return `${minutes}m ${secs}s`;
  };

  if (loading) {
    return (
      <div className="container max-w-6xl mx-auto px-4 py-8">
        <div className="flex justify-center items-center min-h-[400px]">
          <Loader2 className="w-12 h-12 animate-spin text-primary" />
        </div>
      </div>
    );
  }

  if (!result) {
    return (
      <div className="container max-w-6xl mx-auto px-4 py-8">
        <Card>
          <CardContent className="p-8 text-center">
            <p className="text-muted-foreground">Result not found</p>
            <Button
              variant="outline"
              onClick={() => navigate(`/org-admin/exams/${examId}/results`)}
              className="mt-4"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Results
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container max-w-6xl mx-auto px-4 py-8 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigate(`/org-admin/exams/${examId}/results`)}
          >
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <div>
            <h1 className="text-3xl font-bold">{result.exam.title}</h1>
            <p className="text-muted-foreground mt-1">{result.exam.code}</p>
          </div>
        </div>
      </div>

      {/* Candidate Info */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <User className="w-5 h-5" />
            Candidate Information
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex items-center gap-2">
              <User className="w-4 h-4 text-muted-foreground" />
              <span className="font-medium">{result.candidate.name}</span>
            </div>
            <div className="flex items-center gap-2">
              <Mail className="w-4 h-4 text-muted-foreground" />
              <span className="text-sm text-muted-foreground">{result.candidate.email}</span>
            </div>
            {result.submittedAt && (
              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4 text-muted-foreground" />
                <span className="text-sm text-muted-foreground">
                  {new Date(result.submittedAt).toLocaleString()}
                </span>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Score Summary */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Score
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">
              {result.score.obtained}/{result.score.total}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              {result.score.percentage.toFixed(1)}%
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Status
            </CardTitle>
          </CardHeader>
          <CardContent>
            {result.score.passed ? (
              <Badge className="bg-green-100 text-green-800 border-green-300">
                <CheckCircle className="w-4 h-4 mr-1" />
                Passed
              </Badge>
            ) : (
              <Badge className="bg-red-100 text-red-800 border-red-300">
                <XCircle className="w-4 h-4 mr-1" />
                Failed
              </Badge>
            )}
            <p className="text-xs text-muted-foreground mt-2">
              Passing: {result.exam.passingMarks}/{result.exam.totalMarks}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Rank
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <Trophy className="w-6 h-6 text-yellow-500" />
              <div>
                <div className="text-2xl font-bold">
                  #{result.ranking.rank}
                </div>
                <p className="text-xs text-muted-foreground">
                  of {result.ranking.outOf}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Percentile
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <TrendingUp className="w-6 h-6 text-blue-500" />
              <div className="text-2xl font-bold">
                {result.ranking.percentile.toFixed(1)}%
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Analysis */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Activity className="w-5 h-5" />
            Performance Analysis
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium">Attempted</span>
                <span className="text-sm text-muted-foreground">
                  {result.analysis.attempted}
                </span>
              </div>
              <Progress
                value={(result.analysis.attempted / (result.analysis.attempted + result.analysis.unanswered)) * 100}
                className="h-2"
              />
            </div>

            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-green-600">Correct</span>
                <span className="text-sm text-muted-foreground">
                  {result.analysis.correct}
                </span>
              </div>
              <Progress
                value={(result.analysis.correct / result.analysis.attempted) * 100}
                className="h-2 [&>div]:bg-green-500"
              />
            </div>

            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-red-600">Incorrect</span>
                <span className="text-sm text-muted-foreground">
                  {result.analysis.incorrect}
                </span>
              </div>
              <Progress
                value={(result.analysis.incorrect / result.analysis.attempted) * 100}
                className="h-2 [&>div]:bg-red-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-4 border-t">
            <div className="flex items-center gap-3">
              <Clock className="w-8 h-8 text-blue-500" />
              <div>
                <p className="text-sm text-muted-foreground">Time Spent</p>
                <p className="text-lg font-semibold">{formatDuration(result.analysis.timeSpent)}</p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <Target className="w-8 h-8 text-green-500" />
              <div>
                <p className="text-sm text-muted-foreground">Accuracy</p>
                <p className="text-lg font-semibold">{result.analysis.accuracy.toFixed(1)}%</p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <Award className="w-8 h-8 text-purple-500" />
              <div>
                <p className="text-sm text-muted-foreground">Unanswered</p>
                <p className="text-lg font-semibold">{result.analysis.unanswered}</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Proctoring Report */}
      {result.proctoringReport && (
        <Card>
          <CardHeader>
            <CardTitle className={`flex items-center gap-2 ${result.proctoringReport.totalViolations > 0 ? 'text-red-600' : 'text-green-600'}`}>
              <AlertTriangle className="w-5 h-5" />
              Proctoring Report
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {result.proctoringReport.totalViolations === 0 ? (
              <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                <p className="text-sm font-medium text-green-800">
                  ✅ No violations detected. The candidate completed the exam without any proctoring issues.
                </p>
              </div>
            ) : (
              <>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-muted-foreground">Total Violations</p>
                    <p className="text-2xl font-bold text-red-600">
                      {result.proctoringReport.totalViolations}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Warnings Issued</p>
                    <p className="text-2xl font-bold text-yellow-600">
                      {result.proctoringReport.warningsIssued}
                    </p>
                  </div>
                </div>

            {result.proctoringReport.violationBreakdown.length > 0 && (
              <div className="border-t pt-4">
                <h4 className="font-semibold mb-2">Violation Details:</h4>
                <div className="space-y-2">
                  {result.proctoringReport.violationBreakdown.map((violation, index) => (
                    <div
                      key={index}
                      className="flex items-start gap-3 p-3 bg-red-50 border border-red-200 rounded-lg"
                    >
                      <AlertTriangle className="w-4 h-4 text-red-600 mt-0.5" />
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <span className="font-medium">{violation.type}</span>
                          <Badge variant={violation.severity === 'HIGH' ? 'destructive' : 'default'}>
                            {violation.severity}
                          </Badge>
                        </div>
                        <p className="text-sm text-muted-foreground mt-1">
                          {new Date(violation.detectedAt).toLocaleString()}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

                {result.proctoringReport.autoSubmitted && (
                  <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                    <p className="text-sm font-medium text-red-800">
                      ⚠️ This exam was automatically submitted due to excessive violations.
                    </p>
                  </div>
                )}
              </>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
