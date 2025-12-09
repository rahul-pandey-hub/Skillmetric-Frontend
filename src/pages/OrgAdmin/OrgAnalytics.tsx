import { useState, useEffect } from 'react';
import { StatsCard } from '@/components/shared/StatsCard';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { TrendingUp, Users, ClipboardList, CheckCircle } from 'lucide-react';
import { motion } from 'framer-motion';

export default function OrgAnalytics() {
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalExams: 45,
    totalCandidates: 350,
    avgScore: 72.5,
    passRate: 68,
  });

  useEffect(() => {
    // TODO: Fetch analytics data
    setLoading(false);
  }, []);

  const statsCards = [
    {
      title: 'Total Exams Conducted',
      value: stats.totalExams,
      change: { value: 12, trend: 'up' as const },
      icon: ClipboardList,
      iconColor: 'text-primary-600',
      iconBgColor: 'bg-primary-100',
      description: 'All time exams',
    },
    {
      title: 'Total Candidates',
      value: stats.totalCandidates,
      change: { value: 15, trend: 'up' as const },
      icon: Users,
      iconColor: 'text-success-600',
      iconBgColor: 'bg-success-100',
      description: 'Registered users',
    },
    {
      title: 'Average Score',
      value: `${stats.avgScore}%`,
      change: { value: 3, trend: 'up' as const },
      icon: TrendingUp,
      iconColor: 'text-warning-600',
      iconBgColor: 'bg-warning-100',
      description: 'Across all exams',
    },
    {
      title: 'Pass Rate',
      value: `${stats.passRate}%`,
      change: { value: 5, trend: 'up' as const },
      icon: CheckCircle,
      iconColor: 'text-blue-600',
      iconBgColor: 'bg-blue-100',
      description: 'Overall success rate',
    },
  ];

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Organization Analytics</h1>
        <p className="text-muted-foreground">Performance metrics and insights</p>
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

      {/* Charts Section */}
      <div className="grid gap-6 grid-cols-1 md:grid-cols-2">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.4 }}
        >
          <Card className="h-[300px]">
            <CardHeader>
              <CardTitle>Department Comparison</CardTitle>
              <CardDescription>Performance across departments</CardDescription>
            </CardHeader>
            <CardContent className="flex items-center justify-center h-[200px]">
              <div className="text-center text-muted-foreground">
                <TrendingUp className="mx-auto h-12 w-12 mb-2 opacity-50" />
                <p className="text-sm">Chart Coming Soon</p>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.5 }}
        >
          <Card className="h-[300px]">
            <CardHeader>
              <CardTitle>Score Trend</CardTitle>
              <CardDescription>Average scores over time</CardDescription>
            </CardHeader>
            <CardContent className="flex items-center justify-center h-[200px]">
              <div className="text-center text-muted-foreground">
                <TrendingUp className="mx-auto h-12 w-12 mb-2 opacity-50" />
                <p className="text-sm">Chart Coming Soon</p>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Additional Analytics Cards */}
      <div className="grid gap-6 grid-cols-1 md:grid-cols-3">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.6 }}
        >
          <Card>
            <CardHeader>
              <CardTitle>Top Performers</CardTitle>
              <CardDescription>Highest scoring candidates</CardDescription>
            </CardHeader>
            <CardContent className="flex items-center justify-center h-[150px]">
              <div className="text-center text-muted-foreground">
                <Users className="mx-auto h-10 w-10 mb-2 opacity-50" />
                <p className="text-sm">Data Coming Soon</p>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.7 }}
        >
          <Card>
            <CardHeader>
              <CardTitle>Question Analytics</CardTitle>
              <CardDescription>Most challenging questions</CardDescription>
            </CardHeader>
            <CardContent className="flex items-center justify-center h-[150px]">
              <div className="text-center text-muted-foreground">
                <ClipboardList className="mx-auto h-10 w-10 mb-2 opacity-50" />
                <p className="text-sm">Data Coming Soon</p>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.8 }}
        >
          <Card>
            <CardHeader>
              <CardTitle>Exam Distribution</CardTitle>
              <CardDescription>By difficulty and category</CardDescription>
            </CardHeader>
            <CardContent className="flex items-center justify-center h-[150px]">
              <div className="text-center text-muted-foreground">
                <TrendingUp className="mx-auto h-10 w-10 mb-2 opacity-50" />
                <p className="text-sm">Data Coming Soon</p>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  );
}
