import { Container, Typography, Paper, Box } from '@mui/material';

const BulkUpload = () => {
  return (
    <Container maxWidth="lg">
      <Box sx={{ py: 4 }}>
        <Typography variant="h4" gutterBottom>
          Bulk Upload Students
        </Typography>

        <Paper elevation={3} sx={{ p: 3, mt: 3 }}>
          <Typography color="textSecondary">
            Bulk upload functionality will be implemented here.
          </Typography>
        </Paper>
      </Box>
    </Container>
  );
};

export default BulkUpload;
