import { useEffect, useState } from 'react';
import {
  Container,
  Typography,
  Box,
  Paper,
  Grid,
  Card,
  CardContent,
  CircularProgress,
  List,
  ListItem,
  ListItemText,
  Divider,
} from '@mui/material';
import { TrendingUp, AccountBalance, People, Assessment } from '@mui/icons-material';
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
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="80vh">
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Container maxWidth="xl">
      <Box sx={{ py: 4 }}>
        <Typography variant="h4" gutterBottom>
          Global Analytics
        </Typography>
        <Typography variant="subtitle1" color="textSecondary" gutterBottom>
          Platform-wide performance metrics and insights
        </Typography>

        {/* Revenue Analytics */}
        <Grid container spacing={3} sx={{ mt: 2, mb: 4 }}>
          <Grid item xs={12} md={3}>
            <Card>
              <CardContent>
                <Box display="flex" alignItems="center" justifyContent="space-between">
                  <Box>
                    <Typography color="textSecondary" gutterBottom>
                      Total Revenue (Monthly)
                    </Typography>
                    <Typography variant="h5">${revenue?.totalMonthlyRevenue?.toLocaleString() || 0}</Typography>
                  </Box>
                  <AccountBalance color="primary" sx={{ fontSize: 40 }} />
                </Box>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} md={3}>
            <Card>
              <CardContent>
                <Box display="flex" alignItems="center" justifyContent="space-between">
                  <Box>
                    <Typography color="textSecondary" gutterBottom>
                      Total Revenue (Yearly)
                    </Typography>
                    <Typography variant="h5">${revenue?.totalYearlyRevenue?.toLocaleString() || 0}</Typography>
                  </Box>
                  <TrendingUp color="success" sx={{ fontSize: 40 }} />
                </Box>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} md={3}>
            <Card>
              <CardContent>
                <Box display="flex" alignItems="center" justifyContent="space-between">
                  <Box>
                    <Typography color="textSecondary" gutterBottom>
                      Active Subscribers
                    </Typography>
                    <Typography variant="h5">{revenue?.activeSubscriptions || 0}</Typography>
                  </Box>
                  <People color="info" sx={{ fontSize: 40 }} />
                </Box>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} md={3}>
            <Card>
              <CardContent>
                <Box display="flex" alignItems="center" justifyContent="space-between">
                  <Box>
                    <Typography color="textSecondary" gutterBottom>
                      Avg Revenue/Org
                    </Typography>
                    <Typography variant="h5">
                      $
                      {revenue?.activeSubscriptions > 0
                        ? Math.round(revenue.totalMonthlyRevenue / revenue.activeSubscriptions)
                        : 0}
                    </Typography>
                  </Box>
                  <Assessment color="warning" sx={{ fontSize: 40 }} />
                </Box>
              </CardContent>
            </Card>
          </Grid>
        </Grid>

        {/* Top Organizations */}
        <Grid container spacing={3}>
          <Grid item xs={12} md={6}>
            <Paper elevation={3} sx={{ p: 3 }}>
              <Typography variant="h6" gutterBottom>
                Top Organizations by Users
              </Typography>
              <List>
                {topOrgs.slice(0, 5).map((org: any, index: number) => (
                  <div key={org._id}>
                    <ListItem>
                      <ListItemText
                        primary={`${index + 1}. ${org.name}`}
                        secondary={`${org.stats.totalUsers} users • ${org.subscription.plan} plan`}
                      />
                    </ListItem>
                    {index < 4 && <Divider />}
                  </div>
                ))}
              </List>
            </Paper>
          </Grid>

          <Grid item xs={12} md={6}>
            <Paper elevation={3} sx={{ p: 3 }}>
              <Typography variant="h6" gutterBottom>
                Top Organizations by Exams
              </Typography>
              <List>
                {topOrgs
                  .sort((a: any, b: any) => b.stats.totalExams - a.stats.totalExams)
                  .slice(0, 5)
                  .map((org: any, index: number) => (
                    <div key={org._id}>
                      <ListItem>
                        <ListItemText
                          primary={`${index + 1}. ${org.name}`}
                          secondary={`${org.stats.totalExams} exams • ${org.stats.totalAssessments} assessments`}
                        />
                      </ListItem>
                      {index < 4 && <Divider />}
                    </div>
                  ))}
              </List>
            </Paper>
          </Grid>

          <Grid item xs={12}>
            <Paper elevation={3} sx={{ p: 3 }}>
              <Typography variant="h6" gutterBottom>
                Subscription Breakdown
              </Typography>
              <Grid container spacing={2} sx={{ mt: 1 }}>
                {revenue?.subscriptionBreakdown &&
                  Object.entries(revenue.subscriptionBreakdown).map(([plan, count]: [string, any]) => (
                    <Grid item xs={6} md={3} key={plan}>
                      <Card variant="outlined">
                        <CardContent>
                          <Typography color="textSecondary" gutterBottom>
                            {plan}
                          </Typography>
                          <Typography variant="h4">{count}</Typography>
                          <Typography variant="caption" color="textSecondary">
                            organizations
                          </Typography>
                        </CardContent>
                      </Card>
                    </Grid>
                  ))}
              </Grid>
            </Paper>
          </Grid>
        </Grid>
      </Box>
    </Container>
  );
};

export default Analytics;
