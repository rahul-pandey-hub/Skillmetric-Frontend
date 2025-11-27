import { Container, Typography, Paper, Box } from '@mui/material';

const ExamMonitoring = () => {
  return (
    <Container maxWidth="lg">
      <Box sx={{ py: 4 }}>
        <Typography variant="h4" gutterBottom>
          Real-time Exam Monitoring
        </Typography>

        <Paper elevation={3} sx={{ p: 3, mt: 3 }}>
          <Typography color="textSecondary">
            Live monitoring dashboard will be implemented here.
          </Typography>
        </Paper>
      </Box>
    </Container>
  );
};

export default ExamMonitoring;
