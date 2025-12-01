import { useState, useEffect } from 'react';
import {
  Container,
  Typography,
  Box,
  Paper,
  Grid,
  Card,
  CardContent,
  CircularProgress,
} from '@mui/material';
import { TrendingUp, People, Assignment, CheckCircle } from '@mui/icons-material';

const OrgAnalytics = () => {
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

  const StatCard = ({ title, value, icon, color, subtitle }: any) => (
    <Card elevation={3}>
      <CardContent>
        <Box display="flex" justifyContent="space-between" alignItems="center">
          <Box>
            <Typography color="textSecondary" variant="body2">
              {title}
            </Typography>
            <Typography variant="h4" sx={{ mt: 1 }}>
              {value}
            </Typography>
            {subtitle && (
              <Typography variant="caption" color="textSecondary">
                {subtitle}
              </Typography>
            )}
          </Box>
          <Box sx={{ backgroundColor: `${color}20`, borderRadius: 2, p: 1.5 }}>
            {icon}
          </Box>
        </Box>
      </CardContent>
    </Card>
  );

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="80vh">
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Container maxWidth="lg">
      <Box sx={{ py: 4 }}>
        <Typography variant="h4" gutterBottom>
          Organization Analytics
        </Typography>
        <Typography variant="subtitle1" color="textSecondary" gutterBottom>
          Performance metrics and insights
        </Typography>

        <Grid container spacing={3} sx={{ mt: 2 }}>
          <Grid item xs={12} sm={6} md={3}>
            <StatCard
              title="Total Exams Conducted"
              value={stats.totalExams}
              icon={<Assignment sx={{ fontSize: 32, color: '#1976d2' }} />}
              color="#1976d2"
            />
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <StatCard
              title="Total Candidates"
              value={stats.totalCandidates}
              icon={<People sx={{ fontSize: 32, color: '#2e7d32' }} />}
              color="#2e7d32"
            />
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <StatCard
              title="Average Score"
              value={`${stats.avgScore}%`}
              icon={<TrendingUp sx={{ fontSize: 32, color: '#ed6c02' }} />}
              color="#ed6c02"
              subtitle="Across all exams"
            />
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <StatCard
              title="Pass Rate"
              value={`${stats.passRate}%`}
              icon={<CheckCircle sx={{ fontSize: 32, color: '#9c27b0' }} />}
              color="#9c27b0"
            />
          </Grid>
        </Grid>

        <Grid container spacing={3} sx={{ mt: 2 }}>
          <Grid item xs={12} md={6}>
            <Paper elevation={3} sx={{ p: 3, height: '300px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Typography color="textSecondary">
                Department Comparison Chart (Coming Soon)
              </Typography>
            </Paper>
          </Grid>
          <Grid item xs={12} md={6}>
            <Paper elevation={3} sx={{ p: 3, height: '300px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Typography color="textSecondary">
                Score Trend Chart (Coming Soon)
              </Typography>
            </Paper>
          </Grid>
        </Grid>
      </Box>
    </Container>
  );
};

export default OrgAnalytics;
