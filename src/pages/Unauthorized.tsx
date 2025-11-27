import { useNavigate } from 'react-router-dom';
import { Container, Paper, Typography, Button, Box } from '@mui/material';
import BlockIcon from '@mui/icons-material/Block';

const Unauthorized = () => {
  const navigate = useNavigate();

  return (
    <Container maxWidth="sm">
      <Box
        sx={{
          minHeight: '100vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <Paper elevation={3} sx={{ p: 4, width: '100%', textAlign: 'center' }}>
          <BlockIcon sx={{ fontSize: 80, color: 'warning.main', mb: 2 }} />
          <Typography variant="h3" component="h1" gutterBottom>
            403
          </Typography>
          <Typography variant="h5" component="h2" gutterBottom>
            Access Denied
          </Typography>
          <Typography variant="body1" color="textSecondary" sx={{ mb: 3 }}>
            You do not have permission to access this page.
          </Typography>
          <Box sx={{ display: 'flex', gap: 2, justifyContent: 'center' }}>
            <Button
              variant="outlined"
              onClick={() => navigate(-1)}
            >
              Go Back
            </Button>
            <Button
              variant="contained"
              onClick={() => navigate('/')}
            >
              Go Home
            </Button>
          </Box>
        </Paper>
      </Box>
    </Container>
  );
};

export default Unauthorized;
