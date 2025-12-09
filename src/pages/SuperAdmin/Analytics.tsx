import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { StatsCard } from '@/components/shared/StatsCard';
import { DollarSign, TrendingUp, Users, BarChart3, Loader2 } from 'lucide-react';
import { motion } from 'framer-motion';
import superAdminService from '../../services/superAdminService';

const Analytics = () => {
  const [loading, setLoading] = useState(true);
  const [topOrgs, setTopOrgs] = useState<any[]>([]);
  const [revenue, setRevenue] = useState<any>(null);

  useEffect(() => {
    fetchAnalytics();
  }, []);

  const fetchAnalytics = async () => {
    try {
      setLoading(true);
      const [topOrgsData, revenueData] = await Promise.all([
        superAdminService.getTopOrganizations(10),
        superAdminService.getRevenueAnalytics(),
      ]);
      setTopOrgs(topOrgsData.topOrganizations || []);
      setRevenue(revenueData);
    } catch (error) {
      console.error('Failed to fetch analytics:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[80vh]">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  const stats = [
    {
      title: 'Total Revenue (Monthly)',
      value: `$${revenue?.totalMonthlyRevenue?.toLocaleString() || 0}`,
      icon: DollarSign,
      iconColor: 'text-green-600',
      iconBgColor: 'bg-green-100',
      description: 'Current month revenue',
    },
    {
      title: 'Total Revenue (Yearly)',
      value: `$${revenue?.totalYearlyRevenue?.toLocaleString() || 0}`,
      icon: TrendingUp,
      iconColor: 'text-blue-600',
      iconBgColor: 'bg-blue-100',
      description: 'Annual revenue',
    },
    {
      title: 'Active Subscribers',
      value: revenue?.activeSubscriptions || 0,
      icon: Users,
      iconColor: 'text-primary-600',
      iconBgColor: 'bg-primary-100',
      description: 'Active organizations',
    },
    {
      title: 'Avg Revenue/Org',
      value: `$${
        revenue?.activeSubscriptions > 0
          ? Math.round(revenue.totalMonthlyRevenue / revenue.activeSubscriptions)
          : 0
      }`,
      icon: BarChart3,
      iconColor: 'text-warning-600',
      iconBgColor: 'bg-warning-100',
      description: 'Per organization',
    },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Global Analytics</h1>
        <p className="text-muted-foreground">Platform-wide performance metrics and insights</p>
      </div>

      {/* Revenue Analytics Stats */}
      <div className="grid gap-6 grid-cols-1 md:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat, index) => (
          <motion.div
            key={stat.title}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: index * 0.1 }}
          >
            <StatsCard {...stat} />
          </motion.div>
        ))}
      </div>

      <div className="grid gap-6 grid-cols-1 lg:grid-cols-2">
        {/* Top Organizations by Users */}
        <Card>
          <CardHeader>
            <CardTitle>Top Organizations by Users</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {topOrgs.slice(0, 5).map((org: any, index: number) => (
                <div key={org._id} className="flex items-center justify-between pb-4 border-b last:border-b-0">
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <span className="text-2xl font-bold text-muted-foreground">{index + 1}</span>
                      <div>
                        <div className="font-semibold">{org.name}</div>
                        <div className="text-sm text-muted-foreground">
                          {org.stats.totalUsers} users • {org.subscription.plan} plan
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Top Organizations by Exams */}
        <Card>
          <CardHeader>
            <CardTitle>Top Organizations by Exams</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {topOrgs
                .sort((a: any, b: any) => b.stats.totalExams - a.stats.totalExams)
                .slice(0, 5)
                .map((org: any, index: number) => (
                  <div key={org._id} className="flex items-center justify-between pb-4 border-b last:border-b-0">
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <span className="text-2xl font-bold text-muted-foreground">{index + 1}</span>
                        <div>
                          <div className="font-semibold">{org.name}</div>
                          <div className="text-sm text-muted-foreground">
                            {org.stats.totalExams} exams • {org.stats.totalAssessments} assessments
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Subscription Breakdown */}
      <Card>
        <CardHeader>
          <CardTitle>Subscription Breakdown</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 grid-cols-2 md:grid-cols-4">
            {revenue?.subscriptionBreakdown &&
              Object.entries(revenue.subscriptionBreakdown).map(([plan, count]: [string, any]) => (
                <div key={plan} className="border rounded-lg p-4 text-center">
                  <div className="text-sm text-muted-foreground mb-2">{plan}</div>
                  <div className="text-3xl font-bold">{count}</div>
                  <div className="text-xs text-muted-foreground mt-1">organizations</div>
                </div>
              ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Analytics;
