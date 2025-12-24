import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Loader2, TrendingUp, TrendingDown, CheckCircle, Users, Clock, AlertTriangle, BarChart3 } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
} from 'recharts';
import { getCompleteAnalytics, CompleteAnalytics } from '../services/analyticsService';

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8', '#82ca9d'];

const ExamAnalytics: React.FC = () => {
  const { examId } = useParams<{ examId: string }>();
  const navigate = useNavigate();
  const [analytics, setAnalytics] = useState<CompleteAnalytics | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (examId) {
      fetchAnalytics();
    }
  }, [examId]);

  const fetchAnalytics = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await getCompleteAnalytics(examId!);
      setAnalytics(data);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to fetch analytics');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="container mx-auto max-w-screen-2xl px-4 sm:px-6 lg:px-8">
        <div className="flex justify-center items-center min-h-[400px]">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto max-w-screen-2xl px-4 sm:px-6 lg:px-8">
        <Alert variant="destructive" className="mt-2">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      </div>
    );
  }

  if (!analytics) {
    return (
      <div className="container mx-auto max-w-screen-2xl px-4 sm:px-6 lg:px-8">
        <Alert className="mt-2 border-blue-500 bg-blue-50">
          <AlertDescription className="text-blue-900">No analytics data available</AlertDescription>
        </Alert>
      </div>
    );
  }

  const { exam, questions, categories } = analytics;

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'EASY':
        return 'bg-green-100 text-green-800 border-green-300';
      case 'MEDIUM':
        return 'bg-yellow-100 text-yellow-800 border-yellow-300';
      case 'HARD':
        return 'bg-red-100 text-red-800 border-red-300';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-300';
    }
  };

  return (
    <div className="container mx-auto max-w-screen-2xl px-4 sm:px-6 lg:px-8 py-4">
      {/* Header */}
      <div className="mb-4">
        <h1 className="text-3xl font-bold tracking-tight">Exam Analytics</h1>
        <h2 className="text-xl text-muted-foreground mt-1">
          {exam.examTitle} ({exam.examCode})
        </h2>
        <Badge
          className={`mt-2 ${exam.status === 'COMPLETED' ? 'bg-green-100 text-green-800 border-green-300' : 'bg-blue-100 text-blue-800 border-blue-300'}`}
          variant="outline"
        >
          {exam.status}
        </Badge>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="overview" className="mb-4">
        <TabsList className="mb-4">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="questions">Question Analysis</TabsTrigger>
          <TabsTrigger value="categories">Category Breakdown</TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-4">
          {/* Stats Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-2">
                  <div>
                    <p className="text-sm text-muted-foreground">Completion Rate</p>
                    <p className="text-3xl font-bold">{exam.participation.completionRate.toFixed(1)}%</p>
                  </div>
                  <Users className="h-10 w-10 text-primary" />
                </div>
                <Progress value={exam.participation.completionRate} className="mt-2" />
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Pass Rate</p>
                    <p className="text-3xl font-bold">{exam.passFailStats.passRate.toFixed(1)}%</p>
                  </div>
                  {exam.passFailStats.passRate >= 60 ? (
                    <CheckCircle className="h-10 w-10 text-green-600" />
                  ) : (
                    <TrendingDown className="h-10 w-10 text-red-600" />
                  )}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Average Score</p>
                    <p className="text-3xl font-bold">
                      {exam.scores.averageScore.toFixed(1)}/
                      {exam.scores.totalResults > 0
                        ? exam.scores.scoreRanges.reduce((max, r) => Math.max(max, parseInt(r.range.split('-')[1]) || 0), 0)
                        : 100}
                    </p>
                  </div>
                  <BarChart3 className="h-10 w-10 text-blue-600" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Avg Duration</p>
                    <p className="text-3xl font-bold">{exam.timeStats.averageDuration} min</p>
                  </div>
                  <Clock className="h-10 w-10 text-orange-600" />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Charts Row 1 */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {/* Score Distribution */}
            <Card>
              <CardHeader>
                <CardTitle>Score Distribution</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={exam.scores.scoreRanges}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="range" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="count" fill="#8884d8" name="Students" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* Pass/Fail Pie Chart */}
            <Card>
              <CardHeader>
                <CardTitle>Pass/Fail Distribution</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={[
                        { name: 'Passed', value: exam.passFailStats.totalPassed },
                        { name: 'Failed', value: exam.passFailStats.totalFailed },
                      ]}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={(entry) => `${entry.name}: ${entry.value}`}
                      outerRadius={100}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      <Cell fill="#00C49F" />
                      <Cell fill="#FF8042" />
                    </Pie>
                    <Tooltip />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>

          {/* Charts Row 2 */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {/* Time Analysis */}
            <Card>
              <CardHeader>
                <CardTitle>Time Distribution</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={exam.timeStats.durationRanges}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="range" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="count" fill="#82ca9d" name="Students" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* Violations */}
            {exam.violations.totalViolations > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <AlertTriangle className="h-5 w-5 text-red-600 mr-2" />
                    Violation Analysis
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="mb-4">
                    <p className="text-sm text-muted-foreground">
                      Total Violations: {exam.violations.totalViolations}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      Violation Rate: {exam.violations.violationRate.toFixed(1)}%
                    </p>
                  </div>
                  <ResponsiveContainer width="100%" height={250}>
                    <BarChart
                      data={Object.entries(exam.violations.violationTypes).map(([type, count]) => ({
                        type,
                        count,
                      }))}
                    >
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="type" />
                      <YAxis />
                      <Tooltip />
                      <Bar dataKey="count" fill="#ff6b6b" name="Count" />
                    </BarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Shortlisting Stats */}
          {exam.shortlisting.enabled && (
            <Card>
              <CardHeader>
                <CardTitle>Shortlisting Results</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                  <div>
                    <p className="text-sm text-muted-foreground">Shortlisted</p>
                    <p className="text-2xl font-bold">{exam.shortlisting.totalShortlisted}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Shortlisting Rate</p>
                    <p className="text-2xl font-bold">{exam.shortlisting.shortlistingRate.toFixed(1)}%</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Avg Score (Shortlisted)</p>
                    <p className="text-2xl font-bold text-green-600">
                      {exam.shortlisting.averageScoreShortlisted.toFixed(1)}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Avg Score (Not Shortlisted)</p>
                    <p className="text-2xl font-bold text-red-600">
                      {exam.shortlisting.averageScoreNotShortlisted.toFixed(1)}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        {/* Question Analysis Tab */}
        <TabsContent value="questions">
          <Card>
            <CardHeader>
              <CardTitle>Question Performance Analysis</CardTitle>
              <p className="text-sm text-muted-foreground mt-2">
                Questions with success rate &gt;90% are too easy, &lt;30% are too hard
              </p>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Question</TableHead>
                      <TableHead>Type</TableHead>
                      <TableHead>Category</TableHead>
                      <TableHead>Difficulty</TableHead>
                      <TableHead className="text-right">Attempts</TableHead>
                      <TableHead className="text-right">Success Rate</TableHead>
                      <TableHead className="text-right">Avg Time (s)</TableHead>
                      <TableHead>Status</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {questions.questions.map((q) => (
                      <TableRow
                        key={q.questionId}
                        className={q.problematic ? 'bg-yellow-50' : ''}
                      >
                        <TableCell className="max-w-xs">
                          <div className="truncate">{q.questionText}</div>
                        </TableCell>
                        <TableCell>{q.questionType}</TableCell>
                        <TableCell>{q.category}</TableCell>
                        <TableCell>
                          <Badge variant="outline" className={getDifficultyColor(q.difficulty)}>
                            {q.difficulty}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right">{q.totalAttempts}</TableCell>
                        <TableCell className="text-right">
                          <div className="flex items-center justify-end gap-2">
                            <span>{q.successRate.toFixed(1)}%</span>
                            <Progress
                              value={q.successRate}
                              className={`w-16 ${
                                q.successRate > 90
                                  ? '[&>div]:bg-green-500'
                                  : q.successRate < 30
                                  ? '[&>div]:bg-red-500'
                                  : '[&>div]:bg-blue-500'
                              }`}
                            />
                          </div>
                        </TableCell>
                        <TableCell className="text-right">{q.averageTime}</TableCell>
                        <TableCell>
                          {q.problematic ? (
                            <Badge variant="outline" className="bg-yellow-100 text-yellow-800 border-yellow-300">
                              <AlertTriangle className="h-3 w-3 mr-1" />
                              {q.problematicReason}
                            </Badge>
                          ) : (
                            <Badge variant="outline" className="bg-green-100 text-green-800 border-green-300">
                              <CheckCircle className="h-3 w-3 mr-1" />
                              OK
                            </Badge>
                          )}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Category Breakdown Tab */}
        <TabsContent value="categories">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <Card>
              <CardHeader>
                <CardTitle>Category Performance Radar</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={400}>
                  <RadarChart data={categories.categories}>
                    <PolarGrid />
                    <PolarAngleAxis dataKey="category" />
                    <PolarRadiusAxis angle={90} domain={[0, 100]} />
                    <Radar
                      name="Average Accuracy"
                      dataKey="averageAccuracy"
                      stroke="#8884d8"
                      fill="#8884d8"
                      fillOpacity={0.6}
                    />
                    <Tooltip />
                    <Legend />
                  </RadarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Category Statistics</CardTitle>
              </CardHeader>
              <CardContent>
                {categories.weakAreas.length > 0 && (
                  <Alert className="mb-4 border-yellow-500 bg-yellow-50">
                    <AlertDescription className="text-yellow-900">
                      <strong>Weak Areas:</strong> {categories.weakAreas.join(', ')}
                    </AlertDescription>
                  </Alert>
                )}
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Category</TableHead>
                        <TableHead className="text-right">Questions</TableHead>
                        <TableHead className="text-right">Avg Score</TableHead>
                        <TableHead className="text-right">Accuracy</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {categories.categories.map((cat) => (
                        <TableRow key={cat.category}>
                          <TableCell>
                            <strong>{cat.category}</strong>
                          </TableCell>
                          <TableCell className="text-right">{cat.totalQuestions}</TableCell>
                          <TableCell className="text-right">
                            {cat.averageScore.toFixed(1)} / {cat.totalQuestions}
                          </TableCell>
                          <TableCell className="text-right">
                            <div className="flex items-center justify-end gap-2">
                              <span>{cat.averageAccuracy.toFixed(1)}%</span>
                              <Progress
                                value={cat.averageAccuracy}
                                className={`w-20 ${
                                  cat.averageAccuracy >= 70
                                    ? '[&>div]:bg-green-500'
                                    : cat.averageAccuracy >= 50
                                    ? '[&>div]:bg-yellow-500'
                                    : '[&>div]:bg-red-500'
                                }`}
                              />
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default ExamAnalytics;
