import { useExams } from '@/hooks/useExams';
import { StatsCard } from '@/components/shared/StatsCard';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  ClipboardList,
  Users,
  Clock,
  TrendingUp,
  Plus,
  Eye,
  Settings,
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { formatDate, formatDuration } from '@/lib/utils';

export default function RecruiterDashboard() {
  const navigate = useNavigate();
  const { data: exams, isLoading } = useExams();

  // Calculate statistics
  const activeExams = exams?.filter((e) => e.status === 'active').length || 0;
  const scheduledExams = exams?.filter((e) => e.status === 'scheduled').length || 0;
  const totalStudents = 0; // This would come from a separate API call
  const completionRate = 85; // This would be calculated from results

  const recentExams = exams?.slice(0, 5) || [];

  const stats = [
    {
      title: 'Active Assessments',
      value: activeExams,
      change: { value: 12, trend: 'up' as const },
      icon: ClipboardList,
      iconColor: 'text-primary-600',
      iconBgColor: 'bg-primary-100',
      description: 'Currently running',
    },
    {
      title: 'Total Students',
      value: totalStudents,
      change: { value: 8, trend: 'up' as const },
      icon: Users,
      iconColor: 'text-success-600',
      iconBgColor: 'bg-success-100',
      description: 'Enrolled across all exams',
    },
    {
      title: 'Scheduled',
      value: scheduledExams,
      icon: Clock,
      iconColor: 'text-warning-600',
      iconBgColor: 'bg-warning-100',
      description: 'Upcoming assessments',
    },
    {
      title: 'Completion Rate',
      value: `${completionRate}%`,
      change: { value: 5, trend: 'up' as const },
      icon: TrendingUp,
      iconColor: 'text-blue-600',
      iconBgColor: 'bg-blue-100',
      description: 'Average across exams',
    },
  ];

  const quickActions = [
    {
      label: 'Create Exam',
      icon: Plus,
      onClick: () => navigate('/recruiter/create-exam'),
      variant: 'default' as const,
    },
    {
      label: 'Live Monitoring',
      icon: Eye,
      onClick: () => navigate('/recruiter/monitoring'),
      variant: 'outline' as const,
    },
    {
      label: 'Bulk Enroll',
      icon: Users,
      onClick: () => navigate('/recruiter/bulk-enrollment'),
      variant: 'outline' as const,
    },
    {
      label: 'Analytics',
      icon: TrendingUp,
      onClick: () => navigate('/recruiter/analytics'),
      variant: 'outline' as const,
    },
  ];

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
        <p className="text-muted-foreground">
          Welcome back! Here's an overview of your assessments.
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid gap-6 grid-cols-1 md:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat, index) => (
          <motion.div
            key={stat.title}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: index * 0.1 }}
          >
            <StatsCard {...stat} loading={isLoading} />
          </motion.div>
        ))}
      </div>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
          <CardDescription>Common tasks and shortcuts</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {quickActions.map((action) => (
              <Button
                key={action.label}
                variant={action.variant}
                onClick={action.onClick}
                className="h-auto flex-col gap-2 py-6"
              >
                <action.icon className="h-6 w-6" />
                <span className="text-sm">{action.label}</span>
              </Button>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Recent Exams */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle>Recent Assessments</CardTitle>
            <CardDescription>Your latest created assessments</CardDescription>
          </div>
          <Button variant="outline" size="sm" onClick={() => navigate('/recruiter/exams')}>
            View All
          </Button>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="space-y-3">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="animate-pulse space-y-2">
                  <div className="h-4 bg-gray-200 rounded w-3/4" />
                  <div className="h-3 bg-gray-200 rounded w-1/2" />
                </div>
              ))}
            </div>
          ) : recentExams.length > 0 ? (
            <div className="space-y-4">
              {recentExams.map((exam) => (
                <motion.div
                  key={exam.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="flex items-center justify-between p-4 rounded-lg border hover:bg-accent transition-colors cursor-pointer"
                  onClick={() => navigate(`/recruiter/exams/${exam.id}`)}
                >
                  <div className="flex-1 space-y-1">
                    <div className="flex items-center gap-3">
                      <h4 className="font-semibold">{exam.title}</h4>
                      <Badge
                        variant={
                          exam.status === 'active'
                            ? 'success'
                            : exam.status === 'scheduled'
                            ? 'warning'
                            : 'default'
                        }
                      >
                        {exam.status}
                      </Badge>
                    </div>
                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        {formatDuration(exam.duration)}
                      </span>
                      <span>{exam.totalMarks} marks</span>
                      <span>Created {formatDate(exam.createdAt)}</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation();
                        navigate(`/recruiter/monitoring/${exam.id}`);
                      }}
                    >
                      <Eye className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation();
                        navigate(`/recruiter/exams/${exam.id}/edit`);
                      }}
                    >
                      <Settings className="h-4 w-4" />
                    </Button>
                  </div>
                </motion.div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <ClipboardList className="mx-auto h-12 w-12 text-muted-foreground/50" />
              <h3 className="mt-4 text-lg font-semibold">No assessments yet</h3>
              <p className="text-sm text-muted-foreground mt-2">
                Get started by creating your first assessment
              </p>
              <Button onClick={() => navigate('/recruiter/exams/create')} className="mt-4">
                <Plus className="mr-2 h-4 w-4" />
                Create Exam
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
