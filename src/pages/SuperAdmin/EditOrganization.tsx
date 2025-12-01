import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Container,
  Typography,
  Box,
  Paper,
  TextField,
  Button,
  Grid,
  MenuItem,
  FormControlLabel,
  Checkbox,
  CircularProgress,
  Alert,
} from '@mui/material';
import superAdminService, { Organization } from '../../services/superAdminService';

const EditOrganization = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [formData, setFormData] = useState({
    name: '',
    type: 'COMPANY',
    contactEmail: '',
    contactPhone: '',
    website: '',
    street: '',
    city: '',
    state: '',
    country: '',
    pincode: '',
    plan: 'FREE',
    credits: 1000,
    maxConcurrentUsers: 100,
    maxExamsPerMonth: 10,
    brandingEnabled: false,
    customEmailTemplates: false,
    advancedProctoring: false,
    apiAccess: false,
    bulkOperations: false,
    analyticsExport: false,
  });

  useEffect(() => {
    if (id) {
      fetchOrganization();
    }
  }, [id]);

  const fetchOrganization = async () => {
    try {
      setLoading(true);
      const org: Organization = await superAdminService.getOrganizationById(id!);
      setFormData({
        name: org.name,
        type: org.type,
        contactEmail: org.contactInfo.email,
        contactPhone: org.contactInfo.phone || '',
        website: org.contactInfo.website || '',
        street: org.contactInfo.address?.street || '',
        city: org.contactInfo.address?.city || '',
        state: org.contactInfo.address?.state || '',
        country: org.contactInfo.address?.country || '',
        pincode: org.contactInfo.address?.pincode || '',
        plan: org.subscription.plan,
        credits: org.subscription.credits,
        maxConcurrentUsers: org.subscription.maxConcurrentUsers,
        maxExamsPerMonth: org.subscription.maxExamsPerMonth,
        brandingEnabled: org.features?.brandingEnabled || false,
        customEmailTemplates: org.features?.customEmailTemplates || false,
        advancedProctoring: org.features?.advancedProctoring || false,
        apiAccess: org.features?.apiAccess || false,
        bulkOperations: org.features?.bulkOperations || false,
        analyticsExport: org.features?.analyticsExport || false,
      });
    } catch (err) {
      console.error('Failed to fetch organization:', err);
      setError('Failed to load organization');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (field: string, value: any) => {
    setFormData({ ...formData, [field]: value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setError('');
      const updateData = {
        name: formData.name,
        type: formData.type,
        contactInfo: {
          email: formData.contactEmail,
          phone: formData.contactPhone,
          website: formData.website,
          address: {
            street: formData.street,
            city: formData.city,
            state: formData.state,
            country: formData.country,
            pincode: formData.pincode,
          },
        },
        subscription: {
          plan: formData.plan,
          credits: formData.credits,
          maxConcurrentUsers: formData.maxConcurrentUsers,
          maxExamsPerMonth: formData.maxExamsPerMonth,
        },
        features: {
          brandingEnabled: formData.brandingEnabled,
          customEmailTemplates: formData.customEmailTemplates,
          advancedProctoring: formData.advancedProctoring,
          apiAccess: formData.apiAccess,
          bulkOperations: formData.bulkOperations,
          analyticsExport: formData.analyticsExport,
        },
      };

      await superAdminService.updateOrganization(id!, updateData);
      navigate(`/super-admin/organizations/${id}`);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to update organization');
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
    <Container maxWidth="md">
      <Box sx={{ py: 4 }}>
        <Typography variant="h4" gutterBottom>
          Edit Organization
        </Typography>

        <Paper elevation={3} sx={{ p: 3, mt: 3 }}>
          <form onSubmit={handleSubmit}>
            {error && (
              <Alert severity="error" sx={{ mb: 3 }}>
                {error}
              </Alert>
            )}

            {/* Basic Information */}
            <Typography variant="h6" gutterBottom>
              Basic Information
            </Typography>
            <Grid container spacing={3} sx={{ mb: 3 }}>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Organization Name"
                  required
                  value={formData.name}
                  onChange={(e) => handleChange('name', e.target.value)}
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  select
                  label="Organization Type"
                  required
                  value={formData.type}
                  onChange={(e) => handleChange('type', e.target.value)}
                >
                  <MenuItem value="COMPANY">Company</MenuItem>
                  <MenuItem value="UNIVERSITY">University</MenuItem>
                  <MenuItem value="TRAINING_INSTITUTE">Training Institute</MenuItem>
                  <MenuItem value="INDIVIDUAL">Individual</MenuItem>
                </TextField>
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Contact Email"
                  type="email"
                  required
                  value={formData.contactEmail}
                  onChange={(e) => handleChange('contactEmail', e.target.value)}
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Contact Phone"
                  value={formData.contactPhone}
                  onChange={(e) => handleChange('contactPhone', e.target.value)}
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Website"
                  value={formData.website}
                  onChange={(e) => handleChange('website', e.target.value)}
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Street Address"
                  value={formData.street}
                  onChange={(e) => handleChange('street', e.target.value)}
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="City"
                  value={formData.city}
                  onChange={(e) => handleChange('city', e.target.value)}
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="State"
                  value={formData.state}
                  onChange={(e) => handleChange('state', e.target.value)}
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Country"
                  value={formData.country}
                  onChange={(e) => handleChange('country', e.target.value)}
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Pincode"
                  value={formData.pincode}
                  onChange={(e) => handleChange('pincode', e.target.value)}
                />
              </Grid>
            </Grid>

            {/* Subscription */}
            <Typography variant="h6" gutterBottom sx={{ mt: 3 }}>
              Subscription Plan
            </Typography>
            <Grid container spacing={3} sx={{ mb: 3 }}>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  select
                  label="Subscription Plan"
                  required
                  value={formData.plan}
                  onChange={(e) => handleChange('plan', e.target.value)}
                >
                  <MenuItem value="FREE">Free</MenuItem>
                  <MenuItem value="BASIC">Basic</MenuItem>
                  <MenuItem value="PRO">Pro</MenuItem>
                  <MenuItem value="ENTERPRISE">Enterprise</MenuItem>
                </TextField>
              </Grid>
              <Grid item xs={12} md={4}>
                <TextField
                  fullWidth
                  label="Credits"
                  type="number"
                  required
                  value={formData.credits}
                  onChange={(e) => handleChange('credits', parseInt(e.target.value))}
                />
              </Grid>
              <Grid item xs={12} md={4}>
                <TextField
                  fullWidth
                  label="Max Concurrent Users"
                  type="number"
                  required
                  value={formData.maxConcurrentUsers}
                  onChange={(e) => handleChange('maxConcurrentUsers', parseInt(e.target.value))}
                />
              </Grid>
              <Grid item xs={12} md={4}>
                <TextField
                  fullWidth
                  label="Max Exams Per Month"
                  type="number"
                  required
                  value={formData.maxExamsPerMonth}
                  onChange={(e) => handleChange('maxExamsPerMonth', parseInt(e.target.value))}
                />
              </Grid>
            </Grid>

            {/* Features */}
            <Typography variant="h6" gutterBottom sx={{ mt: 3 }}>
              Features
            </Typography>
            <Grid container spacing={2} sx={{ mb: 3 }}>
              <Grid item xs={12} md={6}>
                <FormControlLabel
                  control={
                    <Checkbox
                      checked={formData.brandingEnabled}
                      onChange={(e) => handleChange('brandingEnabled', e.target.checked)}
                    />
                  }
                  label="Branding Enabled"
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <FormControlLabel
                  control={
                    <Checkbox
                      checked={formData.customEmailTemplates}
                      onChange={(e) => handleChange('customEmailTemplates', e.target.checked)}
                    />
                  }
                  label="Custom Email Templates"
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <FormControlLabel
                  control={
                    <Checkbox
                      checked={formData.advancedProctoring}
                      onChange={(e) => handleChange('advancedProctoring', e.target.checked)}
                    />
                  }
                  label="Advanced Proctoring"
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <FormControlLabel
                  control={
                    <Checkbox
                      checked={formData.apiAccess}
                      onChange={(e) => handleChange('apiAccess', e.target.checked)}
                    />
                  }
                  label="API Access"
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <FormControlLabel
                  control={
                    <Checkbox
                      checked={formData.bulkOperations}
                      onChange={(e) => handleChange('bulkOperations', e.target.checked)}
                    />
                  }
                  label="Bulk Operations"
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <FormControlLabel
                  control={
                    <Checkbox
                      checked={formData.analyticsExport}
                      onChange={(e) => handleChange('analyticsExport', e.target.checked)}
                    />
                  }
                  label="Analytics Export"
                />
              </Grid>
            </Grid>

            <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 4 }}>
              <Button onClick={() => navigate(`/super-admin/organizations/${id}`)}>Cancel</Button>
              <Button type="submit" variant="contained">
                Save Changes
              </Button>
            </Box>
          </form>
        </Paper>
      </Box>
    </Container>
  );
};

export default EditOrganization;
