import { useEffect, useState } from 'react';
import {
  Container,
  Typography,
  Grid,
  Card,
  CardContent,
  Box,
  Button,
  CircularProgress,
  Paper,
  Chip,
} from '@mui/material';
import {
  Business,
  People,
  Assessment,
  TrendingUp,
  Settings,
  Analytics,
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import superAdminService, { PlatformStats } from '../services/superAdminService';

interface StatsCardProps {
  title: string;
  value: number | string;
  icon: React.ReactNode;
  color: string;
  subtitle?: string;
}

const StatsCard: React.FC<StatsCardProps> = ({ title, value, icon, color, subtitle }) => (
  <Card elevation={3}>
    <CardContent>
      <Box display="flex" justifyContent="space-between" alignItems="flex-start">
        <Box>
          <Typography color="textSecondary" gutterBottom variant="body2">
            {title}
          </Typography>
          <Typography variant="h4" component="div" sx={{ my: 1 }}>
            {value.toLocaleString()}
          </Typography>
          {subtitle && (
            <Typography variant="body2" color="textSecondary">
              {subtitle}
            </Typography>
          )}
        </Box>
        <Box
          sx={{
            backgroundColor: `${color}20`,
            borderRadius: 2,
            p: 1.5,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          {icon}
        </Box>
      </Box>
    </CardContent>
  </Card>
);

const SuperAdminDashboard = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<PlatformStats | null>(null);
  const [systemHealth, setSystemHealth] = useState<any>(null);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const [platformStats, healthData] = await Promise.all([
        superAdminService.getPlatformStats(),
        superAdminService.getSystemHealth(),
      ]);
      setStats(platformStats);
      setSystemHealth(healthData);
    } catch (error) {
      console.error('Failed to fetch dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="80vh">
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Container maxWidth="xl">
      <Box sx={{ py: 4 }}>
        <Box display="flex" justifyContent="space-between" alignItems="center" mb={4}>
          <Box>
            <Typography variant="h4" gutterBottom>
              Super Admin Dashboard
            </Typography>
            <Typography variant="subtitle1" color="textSecondary">
              Platform-wide management and analytics
            </Typography>
          </Box>
        </Box>

        {/* Overview Stats */}
        <Grid container spacing={3} sx={{ mb: 4 }}>
          <Grid item xs={12} sm={6} md={3}>
            <StatsCard
              title="Total Organizations"
              value={stats?.totalOrganizations || 0}
              icon={<Business sx={{ color: '#1976d2', fontSize: 32 }} />}
              color="#1976d2"
              subtitle={`${stats?.organizationsByStatus?.ACTIVE || 0} active`}
            />
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <StatsCard
              title="Total Users"
              value={stats?.totalUsers || 0}
              icon={<People sx={{ color: '#2e7d32', fontSize: 32 }} />}
              color="#2e7d32"
              subtitle="Across all organizations"
            />
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <StatsCard
              title="Total Exams"
              value={stats?.totalExams || 0}
              icon={<Assessment sx={{ color: '#ed6c02', fontSize: 32 }} />}
              color="#ed6c02"
              subtitle="Platform-wide"
            />
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <StatsCard
              title="Total Assessments"
              value={stats?.totalAssessments || 0}
              icon={<TrendingUp sx={{ color: '#9c27b0', fontSize: 32 }} />}
              color="#9c27b0"
              subtitle="Completed assessments"
            />
          </Grid>
        </Grid>

        {/* Quick Actions */}
        <Paper elevation={3} sx={{ p: 3, mb: 4 }}>
          <Typography variant="h6" gutterBottom>
            Quick Actions
          </Typography>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={12} sm={6} md={3}>
              <Button
                fullWidth
                variant="contained"
                startIcon={<Business />}
                onClick={() => navigate('/super-admin/organizations/create')}
              >
                Create Organization
              </Button>
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <Button
                fullWidth
                variant="contained"
                color="secondary"
                startIcon={<Business />}
                onClick={() => navigate('/super-admin/organizations')}
              >
                Manage Organizations
              </Button>
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <Button
                fullWidth
                variant="contained"
                color="success"
                startIcon={<Settings />}
                onClick={() => navigate('/super-admin/system-config')}
              >
                System Configuration
              </Button>
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <Button
                fullWidth
                variant="contained"
                color="info"
                startIcon={<Analytics />}
                onClick={() => navigate('/super-admin/analytics')}
              >
                View Analytics
              </Button>
            </Grid>
          </Grid>
        </Paper>

        {/* Organizations by Type & Status */}
        <Grid container spacing={3} sx={{ mb: 4 }}>
          <Grid item xs={12} md={6}>
            <Paper elevation={3} sx={{ p: 3, height: '100%' }}>
              <Typography variant="h6" gutterBottom>
                Organizations by Type
              </Typography>
              <Box sx={{ mt: 2 }}>
                {stats?.organizationsByType &&
                  Object.entries(stats.organizationsByType).map(([type, count]) => (
                    <Box key={type} sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
                      <Typography>{type}</Typography>
                      <Chip label={count} color="primary" size="small" />
                    </Box>
                  ))}
              </Box>
            </Paper>
          </Grid>

          <Grid item xs={12} md={6}>
            <Paper elevation={3} sx={{ p: 3, height: '100%' }}>
              <Typography variant="h6" gutterBottom>
                Organizations by Status
              </Typography>
              <Box sx={{ mt: 2 }}>
                {stats?.organizationsByStatus &&
                  Object.entries(stats.organizationsByStatus).map(([status, count]) => (
                    <Box key={status} sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
                      <Typography>{status}</Typography>
                      <Chip
                        label={count}
                        color={status === 'ACTIVE' ? 'success' : status === 'SUSPENDED' ? 'error' : 'default'}
                        size="small"
                      />
                    </Box>
                  ))}
              </Box>
            </Paper>
          </Grid>
        </Grid>

        {/* Subscription Plans & System Health */}
        <Grid container spacing={3}>
          <Grid item xs={12} md={6}>
            <Paper elevation={3} sx={{ p: 3, height: '100%' }}>
              <Typography variant="h6" gutterBottom>
                Organizations by Plan
              </Typography>
              <Box sx={{ mt: 2 }}>
                {stats?.organizationsByPlan &&
                  Object.entries(stats.organizationsByPlan).map(([plan, count]) => (
                    <Box key={plan} sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
                      <Typography>{plan}</Typography>
                      <Chip label={count} color="info" size="small" />
                    </Box>
                  ))}
              </Box>
            </Paper>
          </Grid>

          <Grid item xs={12} md={6}>
            <Paper elevation={3} sx={{ p: 3, height: '100%' }}>
              <Typography variant="h6" gutterBottom>
                System Health
              </Typography>
              <Box sx={{ mt: 2 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
                  <Typography>Active Users (24h)</Typography>
                  <Chip label={systemHealth?.activeUsers || 0} color="success" size="small" />
                </Box>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
                  <Typography>Active Exams</Typography>
                  <Chip label={systemHealth?.activeExams || 0} color="primary" size="small" />
                </Box>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
                  <Typography>Recent Assessments (24h)</Typography>
                  <Chip label={systemHealth?.recentAssessments || 0} color="info" size="small" />
                </Box>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
                  <Typography>Expiring Subscriptions (30d)</Typography>
                  <Chip label={systemHealth?.expiringSubscriptions || 0} color="warning" size="small" />
                </Box>
              </Box>
            </Paper>
          </Grid>
        </Grid>
      </Box>
    </Container>
  );
};

export default SuperAdminDashboard;
