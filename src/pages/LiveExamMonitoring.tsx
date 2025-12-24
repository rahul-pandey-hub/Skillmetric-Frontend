import React, { useEffect, useState, useCallback } from 'react';
import { useParams } from 'react-router-dom';
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
  Circle,
  Users,
  CheckCircle,
  Clock,
  AlertTriangle,
  Eye,
  RefreshCw,
  Loader2,
} from 'lucide-react';
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

  const getStatusVariant = (status: string): "default" | "secondary" | "destructive" | "outline" | "success" | "warning" => {
    switch (status) {
      case 'IN_PROGRESS':
        return 'default';
      case 'COMPLETED':
        return 'success';
      case 'ACTIVE':
        return 'warning';
      default:
        return 'secondary';
    }
  };

  if (loading && !stats) {
    return (
      <div className="container mx-auto max-w-7xl py-8">
        <div className="flex justify-center items-center min-h-[400px]">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </div>
    );
  }

  if (error && !stats) {
    return (
      <div className="container mx-auto max-w-7xl py-8">
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      </div>
    );
  }

  if (!stats) {
    return (
      <div className="container mx-auto max-w-7xl py-8">
        <Alert>
          <AlertDescription>No monitoring data available</AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <div className="container mx-auto max-w-7xl py-8">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-4xl font-bold mb-2">🔴 Live Exam Monitoring</h1>
          <h2 className="text-xl text-muted-foreground">{stats.examTitle}</h2>
          <div className="flex gap-2 mt-2">
            <Badge variant={getStatusVariant(stats.status)}>{stats.status}</Badge>
            {isLive && (
              <Badge variant="destructive" className="gap-1 animate-pulse">
                <Circle className="h-3 w-3 fill-current" />
                LIVE
              </Badge>
            )}
          </div>
        </div>
        <div>
          <Button variant="outline" size="icon" onClick={handleRefresh} title="Refresh">
            <RefreshCw className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Time Remaining */}
      {stats.schedule.timeRemaining !== undefined && stats.schedule.timeRemaining > 0 && (
        <Alert className="mb-6">
          <AlertDescription>
            <h3 className="text-lg font-semibold">
              ⏱️ Time Remaining: {formatTimeRemaining(stats.schedule.timeRemaining)}
            </h3>
          </AlertDescription>
        </Alert>
      )}

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6 mb-6">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Enrolled</p>
                <h3 className="text-3xl font-bold">{stats.participation.totalEnrolled}</h3>
              </div>
              <Users className="h-10 w-10 text-primary" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-primary">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">In Progress</p>
                <h3 className="text-3xl font-bold text-primary">
                  {stats.participation.totalInProgress}
                </h3>
              </div>
              <Clock className="h-10 w-10 text-primary" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-success">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Submitted</p>
                <h3 className="text-3xl font-bold text-success">
                  {stats.participation.totalSubmitted}
                </h3>
              </div>
              <CheckCircle className="h-10 w-10 text-success" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-destructive">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Violations</p>
                <h3 className="text-3xl font-bold text-destructive">
                  {stats.violations.totalViolations}
                </h3>
              </div>
              <AlertTriangle className="h-10 w-10 text-destructive" />
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Live Students */}
        <div className="lg:col-span-2">
          <Card className="p-6">
            <h3 className="text-xl font-semibold mb-4">
              👥 Students Currently Taking Exam ({stats.liveStudents.length})
            </h3>
            <div className="border-t pt-4">
              {stats.liveStudents.length === 0 ? (
                <Alert>
                  <AlertDescription>No students are currently taking the exam</AlertDescription>
                </Alert>
              ) : (
                <div className="max-h-[600px] overflow-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Student</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Time Elapsed</TableHead>
                        <TableHead>Warnings</TableHead>
                        <TableHead>Last Activity</TableHead>
                        <TableHead>Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {stats.liveStudents.map((student) => (
                        <TableRow key={student.studentId}>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              <div className="w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-sm font-bold">
                                {student.studentName?.charAt(0) || 'S'}
                              </div>
                              <div>
                                <p className="text-sm font-medium">{student.studentName || 'Unknown'}</p>
                                <p className="text-xs text-muted-foreground">{student.studentEmail}</p>
                              </div>
                            </div>
                          </TableCell>
                          <TableCell>
                            <Badge variant={getStatusVariant(student.status)} className="gap-1">
                              <Circle className="h-2 w-2 fill-current" />
                              {student.status}
                            </Badge>
                          </TableCell>
                          <TableCell>{Math.floor(student.timeElapsed / 60)} min</TableCell>
                          <TableCell>
                            {student.warningCount > 0 ? (
                              <Badge variant="destructive" className="gap-1">
                                <AlertTriangle className="h-3 w-3" />
                                {student.warningCount}
                              </Badge>
                            ) : (
                              <Badge variant="success">None</Badge>
                            )}
                          </TableCell>
                          <TableCell>
                            <p className="text-xs">
                              {student.lastActivity
                                ? formatDistanceToNow(new Date(student.lastActivity), { addSuffix: true })
                                : 'N/A'}
                            </p>
                          </TableCell>
                          <TableCell>
                            <Button variant="ghost" size="icon" title="View Details">
                              <Eye className="h-4 w-4" />
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              )}
            </div>
          </Card>
        </div>

        {/* Recent Activity & Violations */}
        <div className="space-y-6">
          {/* Recent Activity */}
          <Card className="p-4">
            <h3 className="text-lg font-semibold mb-4">📝 Recent Activity</h3>
            <div className="border-t pt-4 max-h-[300px] overflow-auto space-y-3">
              {stats.recentActivity.slice(0, 10).map((activity, index) => (
                <div key={index} className="flex items-start gap-3">
                  <div
                    className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
                      activity.action === 'STARTED'
                        ? 'bg-primary text-primary-foreground'
                        : activity.action === 'SUBMITTED'
                        ? 'bg-success text-success-foreground'
                        : 'bg-destructive text-destructive-foreground'
                    }`}
                  >
                    {activity.action === 'STARTED' ? (
                      <Users className="h-4 w-4" />
                    ) : activity.action === 'SUBMITTED' ? (
                      <CheckCircle className="h-4 w-4" />
                    ) : (
                      <AlertTriangle className="h-4 w-4" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium">
                      {activity.studentName || 'Student'} - {activity.action}
                    </p>
                    <p className="text-xs text-muted-foreground">{activity.details}</p>
                    <p className="text-xs text-muted-foreground">
                      {formatDistanceToNow(new Date(activity.timestamp), { addSuffix: true })}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </Card>

          {/* Recent Violations */}
          {stats.violations.recentViolations.length > 0 && (
            <Card className="p-4">
              <h3 className="text-lg font-semibold mb-4">🚨 Recent Violations</h3>
              <div className="border-t pt-4 max-h-[280px] overflow-auto space-y-3">
                {stats.violations.recentViolations.map((violation, index) => (
                  <div key={index} className="flex items-start gap-3">
                    <div className="w-8 h-8 rounded-full bg-destructive text-destructive-foreground flex items-center justify-center flex-shrink-0">
                      <AlertTriangle className="h-4 w-4" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex gap-2 mb-1">
                        <Badge variant="destructive">{violation.type}</Badge>
                        <Badge
                          variant={
                            violation.severity === 'HIGH'
                              ? 'destructive'
                              : violation.severity === 'MEDIUM'
                              ? 'warning'
                              : 'secondary'
                          }
                        >
                          {violation.severity}
                        </Badge>
                      </div>
                      <p className="text-sm">{violation.studentName || 'Unknown Student'}</p>
                      <p className="text-xs text-muted-foreground">
                        {formatDistanceToNow(new Date(violation.timestamp), { addSuffix: true })}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
};

export default LiveExamMonitoring;
