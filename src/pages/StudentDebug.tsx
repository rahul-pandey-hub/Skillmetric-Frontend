import { useState, useEffect } from 'react';
import { Container, Typography, Paper, Box, CircularProgress, Button } from '@mui/material';
import { useSelector } from 'react-redux';
import { RootState } from '../store';
import api from '../services/api';

const StudentDebug = () => {
  const { user } = useSelector((state: RootState) => state.auth);
  const [debugData, setDebugData] = useState<any>(null);
  const [examsData, setExamsData] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  const fetchDebugData = async () => {
    setLoading(true);
    try {
      const response = await api.get('/student/exams/debug/enrollment');
      setDebugData(response.data);
    } catch (error) {
      console.error('Debug fetch failed:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchExamsData = async () => {
    setLoading(true);
    try {
      const response = await api.get('/student/exams');
      setExamsData(response.data);
    } catch (error) {
      console.error('Exams fetch failed:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDebugData();
    fetchExamsData();
  }, []);

  return (
    <Container maxWidth="lg">
      <Box sx={{ py: 4 }}>
        <Typography variant="h4" gutterBottom>
          Student Debug Page
        </Typography>

        <Paper elevation={3} sx={{ p: 3, mb: 3 }}>
          <Typography variant="h6" gutterBottom>
            Current User Info
          </Typography>
          <pre>{JSON.stringify(user, null, 2)}</pre>
        </Paper>

        <Paper elevation={3} sx={{ p: 3, mb: 3 }}>
          <Typography variant="h6" gutterBottom>
            Enrollment Debug Data
          </Typography>
          <Button onClick={fetchDebugData} variant="outlined" sx={{ mb: 2 }}>
            Refresh Debug Data
          </Button>
          {loading ? (
            <CircularProgress />
          ) : (
            <pre>{JSON.stringify(debugData, null, 2)}</pre>
          )}
        </Paper>

        <Paper elevation={3} sx={{ p: 3 }}>
          <Typography variant="h6" gutterBottom>
            Exams API Response
          </Typography>
          <Button onClick={fetchExamsData} variant="outlined" sx={{ mb: 2 }}>
            Refresh Exams Data
          </Button>
          {loading ? (
            <CircularProgress />
          ) : (
            <pre>{JSON.stringify(examsData, null, 2)}</pre>
          )}
        </Paper>
      </Box>
    </Container>
  );
};

export default StudentDebug;
