import React, { useEffect, useState, useCallback } from 'react';
import { useParams } from 'react-router-dom';
import {
  Box,
  Container,
  Grid,
  Paper,
  Typography,
  Card,
  CardContent,
  Chip,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  CircularProgress,
  Alert,
  Badge,
  Divider,
  List,
  ListItem,
  ListItemText,
  ListItemAvatar,
  Avatar,
  IconButton,
  Tooltip,
} from '@mui/material';
import {
  FiberManualRecord,
  People,
  CheckCircle,
  HourglassEmpty,
  Warning,
  Visibility,
  Refresh,
} from '@mui/icons-material';
import { formatDistanceToNow } from 'date-fns';
import {
  getLiveExamStats,
  monitoringWs,
  LiveExamStats,
} from '../services/monitoringService';

const LiveExamMonitoring: React.FC = () => {
  const { examId } = useParams<{ examId: string }>();
  const [stats, setStats] = useState<LiveExamStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isLive, setIsLive] = useState(false);

  const fetchStats = useCallback(async () => {
    if (!examId) return;

    try {
      setError(null);
      const data = await getLiveExamStats(examId);
      setStats(data);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to fetch monitoring data');
    } finally {
      setLoading(false);
    }
  }, [examId]);

  useEffect(() => {
    if (!examId) return;

    // Initial fetch
    fetchStats();

    // Connect WebSocket for real-time updates
    monitoringWs.connect();

    // Subscribe to exam monitoring
    monitoringWs.subscribeToExam(examId, 5000);

    // Listen for updates
    monitoringWs.onExamUpdate((updatedStats) => {
      setStats(updatedStats);
      setIsLive(true);
    });

    // Listen for violation alerts
    monitoringWs.onViolationAlert((violation) => {
      console.log('🚨 Violation Alert:', violation);
      // You can add a notification here
    });

    // Listen for errors
    monitoringWs.onError((err) => {
      console.error('WebSocket Error:', err);
    });

    // Cleanup
    return () => {
      monitoringWs.unsubscribeFromExam(examId);
      monitoringWs.removeAllListeners();
    };
  }, [examId, fetchStats]);

  const handleRefresh = () => {
    setLoading(true);
    fetchStats();
  };

  const formatTimeRemaining = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    return `${hours}h ${minutes}m ${secs}s`;
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'IN_PROGRESS':
        return 'primary';
      case 'COMPLETED':
        return 'success';
      case 'ACTIVE':
        return 'warning';
      default:
        return 'default';
    }
  };

  if (loading && !stats) {
    return (
      <Container>
        <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
          <CircularProgress />
        </Box>
      </Container>
    );
  }

  if (error && !stats) {
    return (
      <Container>
        <Alert severity="error" sx={{ mt: 2 }}>
          {error}
        </Alert>
      </Container>
    );
  }

  if (!stats) {
    return (
      <Container>
        <Alert severity="info" sx={{ mt: 2 }}>
          No monitoring data available
        </Alert>
      </Container>
    );
  }

  return (
    <Container maxWidth="xl" sx={{ py: 4 }}>
      {/* Header */}
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={4}>
        <Box>
          <Typography variant="h4" gutterBottom>
            🔴 Live Exam Monitoring
          </Typography>
          <Typography variant="h6" color="text.secondary">
            {stats.examTitle}
          </Typography>
          <Box display="flex" gap={1} mt={1}>
            <Chip label={stats.status} color={getStatusColor(stats.status)} size="small" />
            {isLive && (
              <Chip
                icon={<FiberManualRecord />}
                label="LIVE"
                color="error"
                size="small"
                sx={{ animation: 'pulse 2s infinite' }}
              />
            )}
          </Box>
        </Box>
        <Box>
          <Tooltip title="Refresh">
            <IconButton onClick={handleRefresh} size="large">
              <Refresh />
            </IconButton>
          </Tooltip>
        </Box>
      </Box>

      {/* Time Remaining */}
      {stats.schedule.timeRemaining !== undefined && stats.schedule.timeRemaining > 0 && (
        <Alert severity="info" sx={{ mb: 3 }}>
          <Typography variant="h6">
            ⏱️ Time Remaining: {formatTimeRemaining(stats.schedule.timeRemaining)}
          </Typography>
        </Alert>
      )}

      {/* Stats Cards */}
      <Grid container spacing={3} mb={4}>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box display="flex" alignItems="center" justifyContent="space-between">
                <Box>
                  <Typography color="text.secondary" variant="body2">
                    Total Enrolled
                  </Typography>
                  <Typography variant="h4">{stats.participation.totalEnrolled}</Typography>
                </Box>
                <People sx={{ fontSize: 40, color: 'primary.main' }} />
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ borderLeft: '4px solid #2196f3' }}>
            <CardContent>
              <Box display="flex" alignItems="center" justifyContent="space-between">
                <Box>
                  <Typography color="text.secondary" variant="body2">
                    In Progress
                  </Typography>
                  <Typography variant="h4" color="primary">
                    {stats.participation.totalInProgress}
                  </Typography>
                </Box>
                <HourglassEmpty sx={{ fontSize: 40, color: 'primary.main' }} />
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ borderLeft: '4px solid #4caf50' }}>
            <CardContent>
              <Box display="flex" alignItems="center" justifyContent="space-between">
                <Box>
                  <Typography color="text.secondary" variant="body2">
                    Submitted
                  </Typography>
                  <Typography variant="h4" color="success.main">
                    {stats.participation.totalSubmitted}
                  </Typography>
                </Box>
                <CheckCircle sx={{ fontSize: 40, color: 'success.main' }} />
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ borderLeft: '4px solid #f44336' }}>
            <CardContent>
              <Box display="flex" alignItems="center" justifyContent="space-between">
                <Box>
                  <Typography color="text.secondary" variant="body2">
                    Violations
                  </Typography>
                  <Typography variant="h4" color="error">
                    {stats.violations.totalViolations}
                  </Typography>
                </Box>
                <Warning sx={{ fontSize: 40, color: 'error.main' }} />
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      <Grid container spacing={3}>
        {/* Live Students */}
        <Grid item xs={12} lg={8}>
          <Paper sx={{ p: 3, height: '600px', overflow: 'auto' }}>
            <Typography variant="h6" gutterBottom>
              👥 Students Currently Taking Exam ({stats.liveStudents.length})
            </Typography>
            <Divider sx={{ mb: 2 }} />
            {stats.liveStudents.length === 0 ? (
              <Alert severity="info">No students are currently taking the exam</Alert>
            ) : (
              <TableContainer>
                <Table size="small" stickyHeader>
                  <TableHead>
                    <TableRow>
                      <TableCell>Student</TableCell>
                      <TableCell>Status</TableCell>
                      <TableCell>Time Elapsed</TableCell>
                      <TableCell>Warnings</TableCell>
                      <TableCell>Last Activity</TableCell>
                      <TableCell>Actions</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {stats.liveStudents.map((student) => (
                      <TableRow key={student.studentId}>
                        <TableCell>
                          <Box display="flex" alignItems="center">
                            <Avatar sx={{ width: 32, height: 32, mr: 1, bgcolor: 'primary.main' }}>
                              {student.studentName?.charAt(0) || 'S'}
                            </Avatar>
                            <Box>
                              <Typography variant="body2">{student.studentName || 'Unknown'}</Typography>
                              <Typography variant="caption" color="text.secondary">
                                {student.studentEmail}
                              </Typography>
                            </Box>
                          </Box>
                        </TableCell>
                        <TableCell>
                          <Chip
                            label={student.status}
                            size="small"
                            color={getStatusColor(student.status)}
                            icon={<FiberManualRecord />}
                          />
                        </TableCell>
                        <TableCell>
                          {Math.floor(student.timeElapsed / 60)} min
                        </TableCell>
                        <TableCell>
                          {student.warningCount > 0 ? (
                            <Badge badgeContent={student.warningCount} color="error">
                              <Warning color="error" />
                            </Badge>
                          ) : (
                            <Chip label="None" size="small" color="success" />
                          )}
                        </TableCell>
                        <TableCell>
                          <Typography variant="caption">
                            {student.lastActivity
                              ? formatDistanceToNow(new Date(student.lastActivity), { addSuffix: true })
                              : 'N/A'}
                          </Typography>
                        </TableCell>
                        <TableCell>
                          <Tooltip title="View Details">
                            <IconButton size="small">
                              <Visibility fontSize="small" />
                            </IconButton>
                          </Tooltip>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            )}
          </Paper>
        </Grid>

        {/* Recent Activity & Violations */}
        <Grid item xs={12} lg={4}>
          {/* Recent Activity */}
          <Paper sx={{ p: 2, mb: 3, maxHeight: '300px', overflow: 'auto' }}>
            <Typography variant="h6" gutterBottom>
              📝 Recent Activity
            </Typography>
            <Divider sx={{ mb: 2 }} />
            <List dense>
              {stats.recentActivity.slice(0, 10).map((activity, index) => (
                <ListItem key={index}>
                  <ListItemAvatar>
                    <Avatar
                      sx={{
                        width: 32,
                        height: 32,
                        bgcolor:
                          activity.action === 'STARTED'
                            ? 'primary.main'
                            : activity.action === 'SUBMITTED'
                            ? 'success.main'
                            : 'error.main',
                      }}
                    >
                      {activity.action === 'STARTED' ? (
                        <People fontSize="small" />
                      ) : activity.action === 'SUBMITTED' ? (
                        <CheckCircle fontSize="small" />
                      ) : (
                        <Warning fontSize="small" />
                      )}
                    </Avatar>
                  </ListItemAvatar>
                  <ListItemText
                    primary={`${activity.studentName || 'Student'} - ${activity.action}`}
                    secondary={
                      <>
                        {activity.details}
                        <br />
                        <Typography variant="caption" color="text.secondary">
                          {formatDistanceToNow(new Date(activity.timestamp), { addSuffix: true })}
                        </Typography>
                      </>
                    }
                  />
                </ListItem>
              ))}
            </List>
          </Paper>

          {/* Recent Violations */}
          {stats.violations.recentViolations.length > 0 && (
            <Paper sx={{ p: 2, maxHeight: '280px', overflow: 'auto' }}>
              <Typography variant="h6" gutterBottom>
                🚨 Recent Violations
              </Typography>
              <Divider sx={{ mb: 2 }} />
              <List dense>
                {stats.violations.recentViolations.map((violation, index) => (
                  <ListItem key={index}>
                    <ListItemAvatar>
                      <Avatar sx={{ width: 32, height: 32, bgcolor: 'error.main' }}>
                        <Warning fontSize="small" />
                      </Avatar>
                    </ListItemAvatar>
                    <ListItemText
                      primary={
                        <Box>
                          <Chip label={violation.type} size="small" color="error" sx={{ mr: 1 }} />
                          <Chip
                            label={violation.severity}
                            size="small"
                            variant="outlined"
                            color={
                              violation.severity === 'HIGH'
                                ? 'error'
                                : violation.severity === 'MEDIUM'
                                ? 'warning'
                                : 'default'
                            }
                          />
                        </Box>
                      }
                      secondary={
                        <>
                          {violation.studentName || 'Unknown Student'}
                          <br />
                          <Typography variant="caption" color="text.secondary">
                            {formatDistanceToNow(new Date(violation.timestamp), { addSuffix: true })}
                          </Typography>
                        </>
                      }
                    />
                  </ListItem>
                ))}
              </List>
            </Paper>
          )}
        </Grid>
      </Grid>

      {/* Live indicator CSS */}
      <style>{`
        @keyframes pulse {
          0%, 100% {
            opacity: 1;
          }
          50% {
            opacity: 0.5;
          }
        }
      `}</style>
    </Container>
  );
};

export default LiveExamMonitoring;
