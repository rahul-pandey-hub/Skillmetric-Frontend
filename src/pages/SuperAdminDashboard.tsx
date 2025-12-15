import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { StatsCard } from '@/components/shared/StatsCard';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  Building2,
  Users,
  DollarSign,
  TrendingUp,
  Plus,
  Settings,
  BarChart3,
  CheckCircle2,
  XCircle,
  Clock,
} from 'lucide-react';
import { motion } from 'framer-motion';
import superAdminService, { PlatformStats } from '../services/superAdminService';

export default function SuperAdminDashboard() {
  const navigate = useNavigate();
  const [stats, setStats] = useState<PlatformStats | null>(null);
  const [systemHealth, setSystemHealth] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      console.log('🔍 Fetching dashboard data...');
      const [platformStats, healthData] = await Promise.all([
        superAdminService.getPlatformStats(),
        superAdminService.getSystemHealth(),
      ]);
      console.log('✅ Platform Stats received:', platformStats);
      console.log('✅ Health Data received:', healthData);
      setStats(platformStats);
      setSystemHealth(healthData);
    } catch (error) {
      console.error('❌ Failed to fetch dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const statsCards = [
    {
      title: 'Total Organizations',
      value: stats?.totalOrganizations || 0,
      icon: Building2,
      iconColor: 'text-blue-600',
      iconBgColor: 'bg-blue-100',
      description: `${stats?.organizationsByStatus?.ACTIVE || 0} active`,
    },
    {
      title: 'Total Users',
      value: stats?.totalUsers || 0,
      icon: Users,
      iconColor: 'text-green-600',
      iconBgColor: 'bg-green-100',
      description: 'Across all organizations',
    },
    {
      title: 'Total Exams',
      value: stats?.totalExams || 0,
      icon: BarChart3,
      iconColor: 'text-purple-600',
      iconBgColor: 'bg-purple-100',
      description: 'Platform-wide',
    },
    {
      title: 'Total Assessments',
      value: stats?.totalAssessments || 0,
      icon: TrendingUp,
      iconColor: 'text-orange-600',
      iconBgColor: 'bg-orange-100',
      description: 'Completed',
    },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Super Admin Dashboard</h1>
          <p className="text-muted-foreground mt-1">Platform-wide management and analytics</p>
        </div>
        <div className="flex gap-3">
          <Button variant="outline" onClick={() => navigate('/super-admin/system-config')}>
            <Settings className="mr-2 h-4 w-4" />
            System Config
          </Button>
          <Button onClick={() => navigate('/super-admin/organizations/create')}>
            <Plus className="mr-2 h-4 w-4" />
            New Organization
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {statsCards.map((stat, index) => (
          <StatsCard key={index} {...stat} loading={loading} />
        ))}
      </div>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
          <CardDescription>Common administrative tasks</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-2 md:grid-cols-4">
            <Button
              variant="outline"
              className="justify-start"
              onClick={() => navigate('/super-admin/organizations/create')}
            >
              <Building2 className="mr-2 h-4 w-4" />
              Create Organization
            </Button>
            <Button
              variant="outline"
              className="justify-start"
              onClick={() => navigate('/super-admin/organizations')}
            >
              <Building2 className="mr-2 h-4 w-4" />
              Manage Organizations
            </Button>
            <Button
              variant="outline"
              className="justify-start"
              onClick={() => navigate('/super-admin/system-config')}
            >
              <Settings className="mr-2 h-4 w-4" />
              System Configuration
            </Button>
            <Button
              variant="outline"
              className="justify-start"
              onClick={() => navigate('/super-admin/analytics')}
            >
              <BarChart3 className="mr-2 h-4 w-4" />
              View Analytics
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Organizations Breakdown */}
      <div className="grid gap-6 md:grid-cols-2">
        {/* By Type */}
        <Card>
          <CardHeader>
            <CardTitle>Organizations by Type</CardTitle>
            <CardDescription>Distribution by organization type</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {stats?.organizationsByType &&
                Object.entries(stats.organizationsByType).map(([type, count]) => (
                  <div key={type} className="flex items-center justify-between">
                    <span className="text-sm font-medium">{type}</span>
                    <Badge variant="secondary">{count}</Badge>
                  </div>
                ))}
            </div>
          </CardContent>
        </Card>

        {/* By Status */}
        <Card>
          <CardHeader>
            <CardTitle>Organizations by Status</CardTitle>
            <CardDescription>Current status distribution</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {stats?.organizationsByStatus &&
                Object.entries(stats.organizationsByStatus).map(([status, count]) => (
                  <div key={status} className="flex items-center justify-between">
                    <span className="text-sm font-medium">{status}</span>
                    <Badge
                      variant={
                        status === 'ACTIVE' ? 'default' : status === 'SUSPENDED' ? 'destructive' : 'secondary'
                      }
                    >
                      {count}
                    </Badge>
                  </div>
                ))}
            </div>
          </CardContent>
        </Card>

        {/* By Plan */}
        <Card>
          <CardHeader>
            <CardTitle>Organizations by Plan</CardTitle>
            <CardDescription>Subscription plan distribution</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {stats?.organizationsByPlan &&
                Object.entries(stats.organizationsByPlan).map(([plan, count]) => (
                  <div key={plan} className="flex items-center justify-between">
                    <span className="text-sm font-medium">{plan}</span>
                    <Badge variant="outline">{count}</Badge>
                  </div>
                ))}
            </div>
          </CardContent>
        </Card>

        {/* System Health */}
        <Card>
          <CardHeader>
            <CardTitle>System Health</CardTitle>
            <CardDescription>Platform status and metrics</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Active Users (24h)</span>
                <Badge variant="default" className="bg-green-600">
                  <CheckCircle2 className="mr-1 h-3 w-3" />
                  {systemHealth?.activeUsers || 0}
                </Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Active Exams</span>
                <Badge variant="default" className="bg-blue-600">
                  <Clock className="mr-1 h-3 w-3" />
                  {systemHealth?.activeExams || 0}
                </Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Recent Assessments (24h)</span>
                <Badge variant="default" className="bg-purple-600">
                  {systemHealth?.recentAssessments || 0}
                </Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Expiring Subscriptions (30d)</span>
                <Badge variant="destructive">
                  <XCircle className="mr-1 h-3 w-3" />
                  {systemHealth?.expiringSubscriptions || 0}
                </Badge>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
