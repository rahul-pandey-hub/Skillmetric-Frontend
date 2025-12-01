import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Container,
  Typography,
  Box,
  Paper,
  Grid,
  Card,
  CardContent,
  Chip,
  Button,
  CircularProgress,
  Divider,
  List,
  ListItem,
  ListItemText,
  Table,
  TableBody,
  TableRow,
  TableCell,
} from '@mui/material';
import { Edit, Delete, Block, CheckCircle, TrendingUp } from '@mui/icons-material';
import superAdminService, { Organization } from '../../services/superAdminService';

const OrganizationDetails = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [organization, setOrganization] = useState<Organization | null>(null);
  const [usage, setUsage] = useState<any>(null);

  useEffect(() => {
    if (id) {
      fetchOrganizationDetails();
    }
  }, [id]);

  const fetchOrganizationDetails = async () => {
    try {
      setLoading(true);
      const [orgData, usageData] = await Promise.all([
        superAdminService.getOrganizationById(id!),
        superAdminService.getOrganizationUsage(id!),
      ]);
      setOrganization(orgData);
      setUsage(usageData);
    } catch (error) {
      console.error('Failed to fetch organization details:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSuspend = async () => {
    if (!organization) return;
    try {
      if (organization.status === 'SUSPENDED') {
        await superAdminService.activateOrganization(organization._id);
      } else {
        await superAdminService.suspendOrganization(organization._id);
      }
      fetchOrganizationDetails();
    } catch (error) {
      console.error('Failed to toggle organization status:', error);
    }
  };

  const handleDelete = async () => {
    if (!organization || !window.confirm(`Delete ${organization.name}? This cannot be undone.`)) return;
    try {
      await superAdminService.deleteOrganization(organization._id);
      navigate('/super-admin/organizations');
    } catch (error) {
      console.error('Failed to delete organization:', error);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'ACTIVE':
        return 'success';
      case 'SUSPENDED':
        return 'error';
      case 'TRIAL':
        return 'info';
      case 'EXPIRED':
        return 'warning';
      default:
        return 'default';
    }
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="80vh">
        <CircularProgress />
      </Box>
    );
  }

  if (!organization) {
    return (
      <Container>
        <Typography variant="h5" sx={{ py: 4 }}>
          Organization not found
        </Typography>
      </Container>
    );
  }

  return (
    <Container maxWidth="xl">
      <Box sx={{ py: 4 }}>
        {/* Header */}
        <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
          <Box>
            <Typography variant="h4">{organization.name}</Typography>
            <Box display="flex" gap={1} mt={1}>
              <Chip label={organization.status} color={getStatusColor(organization.status)} size="small" />
              <Chip label={organization.type} size="small" />
              <Chip label={organization.subscription.plan} color="primary" variant="outlined" size="small" />
            </Box>
          </Box>
          <Box display="flex" gap={1}>
            <Button
              variant="outlined"
              startIcon={<Edit />}
              onClick={() => navigate(`/super-admin/organizations/${id}/edit`)}
            >
              Edit
            </Button>
            <Button
              variant="outlined"
              color={organization.status === 'SUSPENDED' ? 'success' : 'warning'}
              startIcon={organization.status === 'SUSPENDED' ? <CheckCircle /> : <Block />}
              onClick={handleSuspend}
            >
              {organization.status === 'SUSPENDED' ? 'Activate' : 'Suspend'}
            </Button>
            <Button variant="outlined" color="error" startIcon={<Delete />} onClick={handleDelete}>
              Delete
            </Button>
          </Box>
        </Box>

        <Grid container spacing={3}>
          {/* Stats Cards */}
          <Grid item xs={12} md={3}>
            <Card>
              <CardContent>
                <Typography color="textSecondary" gutterBottom>
                  Total Users
                </Typography>
                <Typography variant="h4">{organization.stats.totalUsers}</Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} md={3}>
            <Card>
              <CardContent>
                <Typography color="textSecondary" gutterBottom>
                  Total Exams
                </Typography>
                <Typography variant="h4">{organization.stats.totalExams}</Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} md={3}>
            <Card>
              <CardContent>
                <Typography color="textSecondary" gutterBottom>
                  Total Assessments
                </Typography>
                <Typography variant="h4">{organization.stats.totalAssessments}</Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} md={3}>
            <Card>
              <CardContent>
                <Typography color="textSecondary" gutterBottom>
                  Credits Used
                </Typography>
                <Typography variant="h4">
                  {organization.stats.creditsUsed} / {organization.subscription.credits}
                </Typography>
                {usage && (
                  <Typography variant="caption" color="textSecondary">
                    {usage.usage.usagePercentage.toFixed(1)}% used
                  </Typography>
                )}
              </CardContent>
            </Card>
          </Grid>

          {/* Contact Information */}
          <Grid item xs={12} md={6}>
            <Paper elevation={3} sx={{ p: 3, height: '100%' }}>
              <Typography variant="h6" gutterBottom>
                Contact Information
              </Typography>
              <Divider sx={{ mb: 2 }} />
              <Table size="small">
                <TableBody>
                  <TableRow>
                    <TableCell>
                      <strong>Email:</strong>
                    </TableCell>
                    <TableCell>{organization.contactInfo.email}</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell>
                      <strong>Phone:</strong>
                    </TableCell>
                    <TableCell>{organization.contactInfo.phone || 'N/A'}</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell>
                      <strong>Website:</strong>
                    </TableCell>
                    <TableCell>{organization.contactInfo.website || 'N/A'}</TableCell>
                  </TableRow>
                  {organization.contactInfo.address && (
                    <TableRow>
                      <TableCell>
                        <strong>Address:</strong>
                      </TableCell>
                      <TableCell>
                        {organization.contactInfo.address.street}, {organization.contactInfo.address.city},{' '}
                        {organization.contactInfo.address.state} {organization.contactInfo.address.pincode},{' '}
                        {organization.contactInfo.address.country}
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </Paper>
          </Grid>

          {/* Subscription Details */}
          <Grid item xs={12} md={6}>
            <Paper elevation={3} sx={{ p: 3, height: '100%' }}>
              <Typography variant="h6" gutterBottom>
                Subscription Details
              </Typography>
              <Divider sx={{ mb: 2 }} />
              <Table size="small">
                <TableBody>
                  <TableRow>
                    <TableCell>
                      <strong>Plan:</strong>
                    </TableCell>
                    <TableCell>
                      <Chip label={organization.subscription.plan} color="primary" size="small" />
                    </TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell>
                      <strong>Credits:</strong>
                    </TableCell>
                    <TableCell>{organization.subscription.credits.toLocaleString()}</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell>
                      <strong>Max Concurrent Users:</strong>
                    </TableCell>
                    <TableCell>{organization.subscription.maxConcurrentUsers}</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell>
                      <strong>Max Exams/Month:</strong>
                    </TableCell>
                    <TableCell>{organization.subscription.maxExamsPerMonth}</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell>
                      <strong>Start Date:</strong>
                    </TableCell>
                    <TableCell>{new Date(organization.subscription.startDate).toLocaleDateString()}</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell>
                      <strong>End Date:</strong>
                    </TableCell>
                    <TableCell>{new Date(organization.subscription.endDate).toLocaleDateString()}</TableCell>
                  </TableRow>
                </TableBody>
              </Table>
            </Paper>
          </Grid>

          {/* Features */}
          <Grid item xs={12} md={6}>
            <Paper elevation={3} sx={{ p: 3, height: '100%' }}>
              <Typography variant="h6" gutterBottom>
                Enabled Features
              </Typography>
              <Divider sx={{ mb: 2 }} />
              <List dense>
                {organization.features?.brandingEnabled && (
                  <ListItem>
                    <ListItemText primary="✓ Branding Enabled" />
                  </ListItem>
                )}
                {organization.features?.customEmailTemplates && (
                  <ListItem>
                    <ListItemText primary="✓ Custom Email Templates" />
                  </ListItem>
                )}
                {organization.features?.advancedProctoring && (
                  <ListItem>
                    <ListItemText primary="✓ Advanced Proctoring" />
                  </ListItem>
                )}
                {organization.features?.apiAccess && (
                  <ListItem>
                    <ListItemText primary="✓ API Access" />
                  </ListItem>
                )}
                {organization.features?.bulkOperations && (
                  <ListItem>
                    <ListItemText primary="✓ Bulk Operations" />
                  </ListItem>
                )}
                {organization.features?.analyticsExport && (
                  <ListItem>
                    <ListItemText primary="✓ Analytics Export" />
                  </ListItem>
                )}
              </List>
            </Paper>
          </Grid>

          {/* Usage Statistics */}
          <Grid item xs={12} md={6}>
            <Paper elevation={3} sx={{ p: 3, height: '100%' }}>
              <Typography variant="h6" gutterBottom>
                Usage Statistics
              </Typography>
              <Divider sx={{ mb: 2 }} />
              {usage && (
                <Box>
                  <Box display="flex" justifyContent="space-between" mb={2}>
                    <Typography>Credits Used:</Typography>
                    <Typography>
                      <strong>{usage.usage.creditsUsed.toLocaleString()}</strong>
                    </Typography>
                  </Box>
                  <Box display="flex" justifyContent="space-between" mb={2}>
                    <Typography>Credits Remaining:</Typography>
                    <Typography>
                      <strong>{usage.usage.creditsRemaining.toLocaleString()}</strong>
                    </Typography>
                  </Box>
                  <Box display="flex" justifyContent="space-between" mb={2}>
                    <Typography>Usage Percentage:</Typography>
                    <Typography>
                      <strong>{usage.usage.usagePercentage.toFixed(1)}%</strong>
                    </Typography>
                  </Box>
                  <Box sx={{ width: '100%', bgcolor: '#e0e0e0', borderRadius: 1, height: 10, mt: 2 }}>
                    <Box
                      sx={{
                        width: `${Math.min(usage.usage.usagePercentage, 100)}%`,
                        bgcolor: usage.usage.usagePercentage > 80 ? 'error.main' : 'primary.main',
                        height: '100%',
                        borderRadius: 1,
                      }}
                    />
                  </Box>
                </Box>
              )}
            </Paper>
          </Grid>
        </Grid>
      </Box>
    </Container>
  );
};

export default OrganizationDetails;
