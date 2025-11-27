import { useState } from 'react';
import { useParams } from 'react-router-dom';
import { useExam, useExamSessions } from '@/hooks/useExams';
import { useProctoring } from '@/hooks/useProctoring';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import {
  Users,
  Clock,
  AlertTriangle,
  Eye,
  CheckCircle,
  XCircle,
  Radio,
  Filter,
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { formatDateTime, getStatusColor } from '@/lib/utils';
import { ExamSession } from '@/store/examStore';

export default function LiveMonitoring() {
  const { examId } = useParams<{ examId: string }>();
  const { data: exam, isLoading: examLoading } = useExam(examId!);
  const { data: sessions = [] } = useExamSessions(examId!);
  const { isConnected } = useProctoring(examId);
  const [filter, setFilter] = useState<'all' | 'in_progress' | 'flagged'>('all');

  const filteredSessions = sessions.filter((session: ExamSession) => {
    if (filter === 'all') return true;
    if (filter === 'in_progress') return session.status === 'in_progress';
    if (filter === 'flagged') return session.violations > 0;
    return true;
  });

  const stats = {
    total: sessions.length,
    inProgress: sessions.filter((s: ExamSession) => s.status === 'in_progress').length,
    completed: sessions.filter((s: ExamSession) => s.status === 'submitted').length,
    flagged: sessions.filter((s: ExamSession) => s.violations > 0).length,
  };

  if (examLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-primary border-r-transparent" />
          <p className="mt-2 text-sm text-muted-foreground">Loading exam...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Live Monitoring</h1>
          <p className="text-muted-foreground mt-1">{exam?.title}</p>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant={isConnected ? 'success' : 'destructive'} className="gap-1">
            <Radio className={`h-3 w-3 ${isConnected ? 'animate-pulse' : ''}`} />
            {isConnected ? 'Connected' : 'Disconnected'}
          </Badge>
        </div>
      </div>

      {/* Stats Overview */}
      <div className="grid gap-4 grid-cols-2 md:grid-cols-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Students</p>
                <p className="text-2xl font-bold mt-2">{stats.total}</p>
              </div>
              <Users className="h-8 w-8 text-primary-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">In Progress</p>
                <p className="text-2xl font-bold mt-2 text-success-600">{stats.inProgress}</p>
              </div>
              <Clock className="h-8 w-8 text-success-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Completed</p>
                <p className="text-2xl font-bold mt-2 text-blue-600">{stats.completed}</p>
              </div>
              <CheckCircle className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Flagged</p>
                <p className="text-2xl font-bold mt-2 text-warning-600">{stats.flagged}</p>
              </div>
              <AlertTriangle className="h-8 w-8 text-warning-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <div className="flex items-center gap-2">
        <Filter className="h-4 w-4 text-muted-foreground" />
        <Button
          variant={filter === 'all' ? 'default' : 'outline'}
          size="sm"
          onClick={() => setFilter('all')}
        >
          All
        </Button>
        <Button
          variant={filter === 'in_progress' ? 'default' : 'outline'}
          size="sm"
          onClick={() => setFilter('in_progress')}
        >
          In Progress
        </Button>
        <Button
          variant={filter === 'flagged' ? 'default' : 'outline'}
          size="sm"
          onClick={() => setFilter('flagged')}
        >
          Flagged
        </Button>
      </div>

      {/* Sessions Grid */}
      <div className="grid gap-4 grid-cols-1 lg:grid-cols-2">
        <AnimatePresence mode="popLayout">
          {filteredSessions.map((session: ExamSession, index: number) => (
            <motion.div
              key={session.id}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ duration: 0.2, delay: index * 0.05 }}
            >
              <Card className={session.violations > 3 ? 'border-warning-500' : ''}>
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <CardTitle className="text-lg">{session.studentName}</CardTitle>
                      <CardDescription className="text-xs">{session.studentEmail}</CardDescription>
                    </div>
                    <Badge className={getStatusColor(session.status)}>
                      {session.status.replace('_', ' ')}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  {/* Progress */}
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">Progress</span>
                      <span className="font-medium">
                        {session.answeredQuestions} / {session.totalQuestions}
                      </span>
                    </div>
                    <Progress
                      value={(session.answeredQuestions / session.totalQuestions) * 100}
                    />
                  </div>

                  {/* Violations & Status */}
                  <div className="grid grid-cols-3 gap-3 text-center">
                    <div className="rounded-lg bg-muted p-2">
                      <p className="text-xs text-muted-foreground">Violations</p>
                      <p
                        className={`text-lg font-bold ${
                          session.violations > 3 ? 'text-warning-600' : 'text-foreground'
                        }`}
                      >
                        {session.violations}
                      </p>
                    </div>
                    <div className="rounded-lg bg-muted p-2">
                      <p className="text-xs text-muted-foreground">Tab Switches</p>
                      <p className="text-lg font-bold">{session.tabSwitches}</p>
                    </div>
                    <div className="rounded-lg bg-muted p-2">
                      <p className="text-xs text-muted-foreground">Flagged</p>
                      <p className="text-lg font-bold">{session.flaggedQuestions.length}</p>
                    </div>
                  </div>

                  {/* Proctoring Status */}
                  <div className="flex items-center gap-4 text-xs">
                    <div className="flex items-center gap-1">
                      {session.webcamStream ? (
                        <Eye className="h-3 w-3 text-success-600" />
                      ) : (
                        <XCircle className="h-3 w-3 text-muted-foreground" />
                      )}
                      <span>Webcam</span>
                    </div>
                    <div className="flex items-center gap-1">
                      {session.screenShare ? (
                        <Eye className="h-3 w-3 text-success-600" />
                      ) : (
                        <XCircle className="h-3 w-3 text-muted-foreground" />
                      )}
                      <span>Screen</span>
                    </div>
                  </div>

                  {/* Time */}
                  {session.startedAt && (
                    <p className="text-xs text-muted-foreground">
                      Started: {formatDateTime(session.startedAt)}
                    </p>
                  )}

                  {/* Alert for high violations */}
                  {session.violations > 3 && (
                    <div className="flex items-center gap-2 p-2 rounded-lg bg-warning-100 text-warning-900">
                      <AlertTriangle className="h-4 w-4" />
                      <span className="text-xs font-medium">High violation count detected</span>
                    </div>
                  )}
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {filteredSessions.length === 0 && (
        <Card>
          <CardContent className="py-12 text-center">
            <Users className="mx-auto h-12 w-12 text-muted-foreground/50" />
            <h3 className="mt-4 text-lg font-semibold">No active sessions</h3>
            <p className="text-sm text-muted-foreground mt-2">
              {filter === 'all'
                ? 'No students have started the exam yet'
                : filter === 'in_progress'
                ? 'No students are currently taking the exam'
                : 'No sessions with violations'}
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
