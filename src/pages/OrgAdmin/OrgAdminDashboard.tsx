import { useEffect, useState } from 'react';
import {
  Container,
  Typography,
  Paper,
  Box,
  Button,
  Grid,
  Card,
  CardContent,
  CircularProgress,
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { RootState } from '../../store';
import { examService } from '../../services/examService';
import { Exam } from '../../types/exam';
import { People, Assignment, QuestionAnswer, BarChart, Settings } from '@mui/icons-material';

const OrgAdminDashboard = () => {
  const navigate = useNavigate();
  const { user } = useSelector((state: RootState) => state.auth);
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

  const StatCard = ({ title, value, icon, color }: any) => (
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
          </Box>
          <Box
            sx={{
              backgroundColor: `${color}20`,
              borderRadius: 2,
              p: 1.5,
              display: 'flex',
            }}
          >
            {icon}
          </Box>
        </Box>
      </CardContent>
    </Card>
  );

  return (
    <Container maxWidth="lg">
      <Box sx={{ py: 4 }}>
        <Typography variant="h4" gutterBottom>
          Organization Dashboard
        </Typography>
        <Typography variant="subtitle1" color="textSecondary" gutterBottom>
          Welcome, {user?.name}
        </Typography>

        {/* Stats Cards */}
        <Grid container spacing={3} sx={{ mt: 2, mb: 4 }}>
          <Grid item xs={12} sm={6} md={3}>
            <StatCard
              title="Total Users"
              value={stats.totalUsers}
              icon={<People sx={{ fontSize: 32, color: '#1976d2' }} />}
              color="#1976d2"
            />
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <StatCard
              title="Total Exams"
              value={stats.totalExams}
              icon={<Assignment sx={{ fontSize: 32, color: '#2e7d32' }} />}
              color="#2e7d32"
            />
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <StatCard
              title="Question Bank"
              value={stats.totalQuestions}
              icon={<QuestionAnswer sx={{ fontSize: 32, color: '#ed6c02' }} />}
              color="#ed6c02"
            />
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <StatCard
              title="Active Exams"
              value={stats.activeExams}
              icon={<BarChart sx={{ fontSize: 32, color: '#9c27b0' }} />}
              color="#9c27b0"
            />
          </Grid>
        </Grid>

        {/* Quick Actions */}
        <Paper elevation={3} sx={{ p: 3, mb: 3 }}>
          <Typography variant="h6" gutterBottom>
            Quick Actions
          </Typography>
          <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap', mt: 2 }}>
            <Button
              variant="contained"
              onClick={() => navigate('/org-admin/users/add')}
              startIcon={<People />}
            >
              Add Users
            </Button>
            <Button
              variant="contained"
              color="secondary"
              onClick={() => navigate('/org-admin/exams/create')}
              startIcon={<Assignment />}
            >
              Create Exam
            </Button>
            <Button
              variant="contained"
              color="success"
              onClick={() => navigate('/org-admin/questions/create')}
              startIcon={<QuestionAnswer />}
            >
              Add Questions
            </Button>
            <Button
              variant="outlined"
              onClick={() => navigate('/org-admin/users')}
            >
              Manage Users
            </Button>
            <Button
              variant="outlined"
              onClick={() => navigate('/org-admin/questions')}
            >
              Question Bank
            </Button>
            <Button
              variant="outlined"
              onClick={() => navigate('/org-admin/analytics')}
              startIcon={<BarChart />}
            >
              View Analytics
            </Button>
            <Button
              variant="outlined"
              onClick={() => navigate('/org-admin/settings')}
              startIcon={<Settings />}
            >
              Settings
            </Button>
          </Box>
        </Paper>

        {/* Recent Exams */}
        <Paper elevation={3} sx={{ p: 3 }}>
          <Typography variant="h6" gutterBottom>
            Recent Exams
          </Typography>

          {loading ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
              <CircularProgress />
            </Box>
          ) : exams.length === 0 ? (
            <Box sx={{ textAlign: 'center', py: 4 }}>
              <Typography color="textSecondary" gutterBottom>
                No exams found. Create your first exam to get started.
              </Typography>
              <Button
                variant="contained"
                onClick={() => navigate('/org-admin/exams/create')}
                sx={{ mt: 2 }}
              >
                Create Your First Exam
              </Button>
            </Box>
          ) : (
            <Grid container spacing={2} sx={{ mt: 1 }}>
              {exams.map((exam) => (
                <Grid item xs={12} sm={6} md={4} key={exam._id}>
                  <Card variant="outlined">
                    <CardContent>
                      <Typography variant="h6" noWrap>
                        {exam.title}
                      </Typography>
                      <Typography variant="body2" color="textSecondary" gutterBottom>
                        Code: {exam.code}
                      </Typography>
                      <Typography variant="body2" color="textSecondary">
                        Duration: {exam.duration} min
                      </Typography>
                      <Box sx={{ mt: 2 }}>
                        <Button
                          size="small"
                          onClick={() => navigate(`/org-admin/exams/${exam._id}`)}
                        >
                          View Details
                        </Button>
                      </Box>
                    </CardContent>
                  </Card>
                </Grid>
              ))}
            </Grid>
          )}
        </Paper>
      </Box>
    </Container>
  );
};

export default OrgAdminDashboard;
