import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Box,
  Container,
  Grid,
  Paper,
  Typography,
  Card,
  CardContent,
  Tabs,
  Tab,
  CircularProgress,
  Alert,
  Chip,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  LinearProgress,
} from '@mui/material';
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
import {
  TrendingUp,
  TrendingDown,
  CheckCircle,
  Cancel,
  People,
  Timer,
  Warning,
  Assessment,
} from '@mui/icons-material';
import { getCompleteAnalytics, CompleteAnalytics } from '../services/analyticsService';

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8', '#82ca9d'];

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

function TabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props;
  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`analytics-tabpanel-${index}`}
      aria-labelledby={`analytics-tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ py: 3 }}>{children}</Box>}
    </div>
  );
}

const ExamAnalytics: React.FC = () => {
  const { examId } = useParams<{ examId: string }>();
  const navigate = useNavigate();
  const [analytics, setAnalytics] = useState<CompleteAnalytics | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [tabValue, setTabValue] = useState(0);

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

  const handleTabChange = (_event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };

  if (loading) {
    return (
      <Container>
        <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
          <CircularProgress />
        </Box>
      </Container>
    );
  }

  if (error) {
    return (
      <Container>
        <Alert severity="error" sx={{ mt: 2 }}>
          {error}
        </Alert>
      </Container>
    );
  }

  if (!analytics) {
    return (
      <Container>
        <Alert severity="info" sx={{ mt: 2 }}>
          No analytics data available
        </Alert>
      </Container>
    );
  }

  const { exam, questions, categories } = analytics;

  return (
    <Container maxWidth="xl" sx={{ py: 4 }}>
      {/* Header */}
      <Box mb={4}>
        <Typography variant="h4" gutterBottom>
          📊 Exam Analytics
        </Typography>
        <Typography variant="h6" color="text.secondary">
          {exam.examTitle} ({exam.examCode})
        </Typography>
        <Chip
          label={exam.status}
          color={exam.status === 'COMPLETED' ? 'success' : 'primary'}
          sx={{ mt: 1 }}
        />
      </Box>

      {/* Tabs */}
      <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 3 }}>
        <Tabs value={tabValue} onChange={handleTabChange}>
          <Tab label="Overview" />
          <Tab label="Question Analysis" />
          <Tab label="Category Breakdown" />
        </Tabs>
      </Box>

      {/* Overview Tab */}
      <TabPanel value={tabValue} index={0}>
        {/* Stats Cards */}
        <Grid container spacing={3} mb={4}>
          <Grid item xs={12} sm={6} md={3}>
            <Card>
              <CardContent>
                <Box display="flex" alignItems="center" justifyContent="space-between">
                  <Box>
                    <Typography color="text.secondary" variant="body2">
                      Completion Rate
                    </Typography>
                    <Typography variant="h4">
                      {exam.participation.completionRate.toFixed(1)}%
                    </Typography>
                  </Box>
                  <People sx={{ fontSize: 40, color: 'primary.main' }} />
                </Box>
                <LinearProgress
                  variant="determinate"
                  value={exam.participation.completionRate}
                  sx={{ mt: 2 }}
                />
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} sm={6} md={3}>
            <Card>
              <CardContent>
                <Box display="flex" alignItems="center" justifyContent="space-between">
                  <Box>
                    <Typography color="text.secondary" variant="body2">
                      Pass Rate
                    </Typography>
                    <Typography variant="h4">{exam.passFailStats.passRate.toFixed(1)}%</Typography>
                  </Box>
                  {exam.passFailStats.passRate >= 60 ? (
                    <CheckCircle sx={{ fontSize: 40, color: 'success.main' }} />
                  ) : (
                    <TrendingDown sx={{ fontSize: 40, color: 'error.main' }} />
                  )}
                </Box>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} sm={6} md={3}>
            <Card>
              <CardContent>
                <Box display="flex" alignItems="center" justifyContent="space-between">
                  <Box>
                    <Typography color="text.secondary" variant="body2">
                      Average Score
                    </Typography>
                    <Typography variant="h4">
                      {exam.scores.averageScore.toFixed(1)}/{exam.scores.totalResults > 0 ? exam.scores.scoreRanges.reduce((max, r) => Math.max(max, parseInt(r.range.split('-')[1]) || 0), 0) : 100}
                    </Typography>
                  </Box>
                  <Assessment sx={{ fontSize: 40, color: 'info.main' }} />
                </Box>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} sm={6} md={3}>
            <Card>
              <CardContent>
                <Box display="flex" alignItems="center" justifyContent="space-between">
                  <Box>
                    <Typography color="text.secondary" variant="body2">
                      Avg Duration
                    </Typography>
                    <Typography variant="h4">{exam.timeStats.averageDuration} min</Typography>
                  </Box>
                  <Timer sx={{ fontSize: 40, color: 'warning.main' }} />
                </Box>
              </CardContent>
            </Card>
          </Grid>
        </Grid>

        {/* Charts Row 1 */}
        <Grid container spacing={3} mb={4}>
          {/* Score Distribution */}
          <Grid item xs={12} md={6}>
            <Paper sx={{ p: 3 }}>
              <Typography variant="h6" gutterBottom>
                Score Distribution
              </Typography>
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
            </Paper>
          </Grid>

          {/* Pass/Fail Pie Chart */}
          <Grid item xs={12} md={6}>
            <Paper sx={{ p: 3 }}>
              <Typography variant="h6" gutterBottom>
                Pass/Fail Distribution
              </Typography>
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
            </Paper>
          </Grid>
        </Grid>

        {/* Charts Row 2 */}
        <Grid container spacing={3} mb={4}>
          {/* Time Analysis */}
          <Grid item xs={12} md={6}>
            <Paper sx={{ p: 3 }}>
              <Typography variant="h6" gutterBottom>
                Time Distribution
              </Typography>
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
            </Paper>
          </Grid>

          {/* Violations */}
          {exam.violations.totalViolations > 0 && (
            <Grid item xs={12} md={6}>
              <Paper sx={{ p: 3 }}>
                <Typography variant="h6" gutterBottom>
                  <Warning color="error" sx={{ verticalAlign: 'middle', mr: 1 }} />
                  Violation Analysis
                </Typography>
                <Box mb={2}>
                  <Typography variant="body2" color="text.secondary">
                    Total Violations: {exam.violations.totalViolations}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Violation Rate: {exam.violations.violationRate.toFixed(1)}%
                  </Typography>
                </Box>
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
              </Paper>
            </Grid>
          )}
        </Grid>

        {/* Shortlisting Stats */}
        {exam.shortlisting.enabled && (
          <Grid container spacing={3}>
            <Grid item xs={12}>
              <Paper sx={{ p: 3 }}>
                <Typography variant="h6" gutterBottom>
                  Shortlisting Results
                </Typography>
                <Grid container spacing={2}>
                  <Grid item xs={12} sm={6} md={3}>
                    <Box>
                      <Typography variant="body2" color="text.secondary">
                        Shortlisted
                      </Typography>
                      <Typography variant="h5">{exam.shortlisting.totalShortlisted}</Typography>
                    </Box>
                  </Grid>
                  <Grid item xs={12} sm={6} md={3}>
                    <Box>
                      <Typography variant="body2" color="text.secondary">
                        Shortlisting Rate
                      </Typography>
                      <Typography variant="h5">
                        {exam.shortlisting.shortlistingRate.toFixed(1)}%
                      </Typography>
                    </Box>
                  </Grid>
                  <Grid item xs={12} sm={6} md={3}>
                    <Box>
                      <Typography variant="body2" color="text.secondary">
                        Avg Score (Shortlisted)
                      </Typography>
                      <Typography variant="h5" color="success.main">
                        {exam.shortlisting.averageScoreShortlisted.toFixed(1)}
                      </Typography>
                    </Box>
                  </Grid>
                  <Grid item xs={12} sm={6} md={3}>
                    <Box>
                      <Typography variant="body2" color="text.secondary">
                        Avg Score (Not Shortlisted)
                      </Typography>
                      <Typography variant="h5" color="error.main">
                        {exam.shortlisting.averageScoreNotShortlisted.toFixed(1)}
                      </Typography>
                    </Box>
                  </Grid>
                </Grid>
              </Paper>
            </Grid>
          </Grid>
        )}
      </TabPanel>

      {/* Question Analysis Tab */}
      <TabPanel value={tabValue} index={1}>
        <Paper sx={{ p: 3 }}>
          <Typography variant="h6" gutterBottom>
            Question Performance Analysis
          </Typography>
          <Typography variant="body2" color="text.secondary" paragraph>
            Questions with success rate &gt;90% are too easy, &lt;30% are too hard
          </Typography>
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableRow>
                    <TableCell>Question</TableCell>
                    <TableCell>Type</TableCell>
                    <TableCell>Category</TableCell>
                    <TableCell>Difficulty</TableCell>
                    <TableCell align="right">Attempts</TableCell>
                    <TableCell align="right">Success Rate</TableCell>
                    <TableCell align="right">Avg Time (s)</TableCell>
                    <TableCell>Status</TableCell>
                  </TableRow>
                </TableRow>
              </TableHead>
              <TableBody>
                {questions.questions.map((q) => (
                  <TableRow
                    key={q.questionId}
                    sx={{ backgroundColor: q.problematic ? '#fff3cd' : 'inherit' }}
                  >
                    <TableCell>
                      <Typography variant="body2" noWrap sx={{ maxWidth: 300 }}>
                        {q.questionText}
                      </Typography>
                    </TableCell>
                    <TableCell>{q.questionType}</TableCell>
                    <TableCell>{q.category}</TableCell>
                    <TableCell>
                      <Chip
                        label={q.difficulty}
                        size="small"
                        color={
                          q.difficulty === 'EASY'
                            ? 'success'
                            : q.difficulty === 'HARD'
                            ? 'error'
                            : 'default'
                        }
                      />
                    </TableCell>
                    <TableCell align="right">{q.totalAttempts}</TableCell>
                    <TableCell align="right">
                      <Box display="flex" alignItems="center" justifyContent="flex-end">
                        {q.successRate.toFixed(1)}%
                        <LinearProgress
                          variant="determinate"
                          value={q.successRate}
                          sx={{ width: 60, ml: 1 }}
                          color={
                            q.successRate > 90
                              ? 'success'
                              : q.successRate < 30
                              ? 'error'
                              : 'primary'
                          }
                        />
                      </Box>
                    </TableCell>
                    <TableCell align="right">{q.averageTime}</TableCell>
                    <TableCell>
                      {q.problematic ? (
                        <Chip
                          icon={<Warning />}
                          label={q.problematicReason}
                          size="small"
                          color="warning"
                        />
                      ) : (
                        <Chip icon={<CheckCircle />} label="OK" size="small" color="success" />
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </Paper>
      </TabPanel>

      {/* Category Breakdown Tab */}
      <TabPanel value={tabValue} index={2}>
        <Grid container spacing={3}>
          <Grid item xs={12} md={6}>
            <Paper sx={{ p: 3 }}>
              <Typography variant="h6" gutterBottom>
                Category Performance Radar
              </Typography>
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
            </Paper>
          </Grid>

          <Grid item xs={12} md={6}>
            <Paper sx={{ p: 3 }}>
              <Typography variant="h6" gutterBottom>
                Category Statistics
              </Typography>
              {categories.weakAreas.length > 0 && (
                <Alert severity="warning" sx={{ mb: 2 }}>
                  <Typography variant="body2">
                    <strong>Weak Areas:</strong> {categories.weakAreas.join(', ')}
                  </Typography>
                </Alert>
              )}
              <TableContainer>
                <Table size="small">
                  <TableHead>
                    <TableRow>
                      <TableCell>Category</TableCell>
                      <TableCell align="right">Questions</TableCell>
                      <TableCell align="right">Avg Score</TableCell>
                      <TableCell align="right">Accuracy</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {categories.categories.map((cat) => (
                      <TableRow key={cat.category}>
                        <TableCell>
                          <strong>{cat.category}</strong>
                        </TableCell>
                        <TableCell align="right">{cat.totalQuestions}</TableCell>
                        <TableCell align="right">
                          {cat.averageScore.toFixed(1)} / {cat.totalQuestions}
                        </TableCell>
                        <TableCell align="right">
                          <Box display="flex" alignItems="center" justifyContent="flex-end">
                            {cat.averageAccuracy.toFixed(1)}%
                            <LinearProgress
                              variant="determinate"
                              value={cat.averageAccuracy}
                              sx={{ width: 80, ml: 1 }}
                              color={
                                cat.averageAccuracy >= 70
                                  ? 'success'
                                  : cat.averageAccuracy >= 50
                                  ? 'warning'
                                  : 'error'
                              }
                            />
                          </Box>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            </Paper>
          </Grid>
        </Grid>
      </TabPanel>
    </Container>
  );
};

export default ExamAnalytics;
