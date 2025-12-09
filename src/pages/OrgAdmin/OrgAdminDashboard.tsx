import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '@/store/authStore';
import { examService } from '@/services/examService';
import { Exam } from '@/types/exam';
import { StatsCard } from '@/components/shared/StatsCard';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  Users,
  ClipboardList,
  HelpCircle,
  Activity,
  Plus,
  UserPlus,
  FileQuestion,
  BarChart,
  Settings,
  Eye,
} from 'lucide-react';
import { motion } from 'framer-motion';
import { formatDate } from '@/lib/utils';

export default function OrgAdminDashboard() {
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const [exams, setExams] = useState<Exam[]>([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalExams: 0,
    totalQuestions: 0,
    activeExams: 0,
  });

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const response = await examService.getAllExams();
      setExams(response.data.data.slice(0, 6));

      // Mock stats - replace with actual API call
      setStats({
        totalUsers: 120,
        totalExams: response.data.data.length,
        totalQuestions: 450,
        activeExams: response.data.data.filter((e: Exam) => e.status === 'ACTIVE').length,
      });
    } catch (err) {
      console.error('Failed to load dashboard data:', err);
    } finally {
      setLoading(false);
    }
  };

  const statsCards = [
    {
      title: 'Total Users',
      value: stats.totalUsers,
      change: { value: 12, trend: 'up' as const },
      icon: Users,
      iconColor: 'text-primary-600',
      iconBgColor: 'bg-primary-100',
      description: 'Across all roles',
    },
    {
      title: 'Total Exams',
      value: stats.totalExams,
      change: { value: 8, trend: 'up' as const },
      icon: ClipboardList,
      iconColor: 'text-success-600',
      iconBgColor: 'bg-success-100',
      description: 'Created exams',
    },
    {
      title: 'Question Bank',
      value: stats.totalQuestions,
      icon: HelpCircle,
      iconColor: 'text-warning-600',
      iconBgColor: 'bg-warning-100',
      description: 'Available questions',
    },
    {
      title: 'Active Exams',
      value: stats.activeExams,
      change: { value: 5, trend: 'up' as const },
      icon: Activity,
      iconColor: 'text-blue-600',
      iconBgColor: 'bg-blue-100',
      description: 'Currently running',
    },
  ];

  const quickActions = [
    {
      label: 'Add Users',
      icon: UserPlus,
      onClick: () => navigate('/org-admin/users/add'),
      variant: 'default' as const,
    },
    {
      label: 'Create Exam',
      icon: Plus,
      onClick: () => navigate('/org-admin/exams/create'),
      variant: 'outline' as const,
    },
    {
      label: 'Add Questions',
      icon: FileQuestion,
      onClick: () => navigate('/org-admin/questions/create'),
      variant: 'outline' as const,
    },
    {
      label: 'Manage Users',
      icon: Users,
      onClick: () => navigate('/org-admin/users'),
      variant: 'outline' as const,
    },
    {
      label: 'Question Bank',
      icon: HelpCircle,
      onClick: () => navigate('/org-admin/questions'),
      variant: 'outline' as const,
    },
    {
      label: 'View Analytics',
      icon: BarChart,
      onClick: () => navigate('/org-admin/analytics'),
      variant: 'outline' as const,
    },
    {
      label: 'Settings',
      icon: Settings,
      onClick: () => navigate('/org-admin/settings'),
      variant: 'outline' as const,
    },
  ];

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Organization Dashboard</h1>
        <p className="text-muted-foreground">Welcome, {user?.name}</p>
      </div>

      {/* Stats Grid */}
      <div className="grid gap-6 grid-cols-1 md:grid-cols-2 lg:grid-cols-4">
        {statsCards.map((stat, index) => (
          <motion.div
            key={stat.title}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: index * 0.1 }}
          >
            <StatsCard {...stat} loading={loading} />
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
            <CardTitle>Recent Exams</CardTitle>
            <CardDescription>Your latest created exams</CardDescription>
          </div>
          <Button variant="outline" size="sm" onClick={() => navigate('/org-admin/exams')}>
            View All
          </Button>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="space-y-3">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="animate-pulse space-y-2">
                  <div className="h-4 bg-gray-200 rounded w-3/4" />
                  <div className="h-3 bg-gray-200 rounded w-1/2" />
                </div>
              ))}
            </div>
          ) : exams.length === 0 ? (
            <div className="text-center py-12">
              <ClipboardList className="mx-auto h-12 w-12 text-muted-foreground/50" />
              <h3 className="mt-4 text-lg font-semibold">No exams found</h3>
              <p className="text-sm text-muted-foreground mt-2">
                Create your first exam to get started
              </p>
              <Button onClick={() => navigate('/org-admin/exams/create')} className="mt-4">
                <Plus className="mr-2 h-4 w-4" />
                Create Your First Exam
              </Button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {exams.map((exam) => (
                <motion.div
                  key={exam._id}
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="border rounded-lg p-4 hover:bg-accent transition-colors cursor-pointer"
                  onClick={() => navigate(`/org-admin/exams/${exam._id}`)}
                >
                  <div className="space-y-2">
                    <h4 className="font-semibold line-clamp-1">{exam.title}</h4>
                    <div className="flex items-center gap-2">
                      <Badge variant="outline">Code: {exam.code}</Badge>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      Duration: {exam.duration} min
                    </p>
                    <div className="flex gap-2 pt-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation();
                          navigate(`/org-admin/exams/${exam._id}`);
                        }}
                      >
                        <Eye className="h-4 w-4 mr-1" />
                        View
                      </Button>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
