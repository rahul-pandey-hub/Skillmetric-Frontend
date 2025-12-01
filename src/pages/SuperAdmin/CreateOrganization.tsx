import { useState } from 'react';
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
  Stepper,
  Step,
  StepLabel,
  Alert,
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import superAdminService from '../../services/superAdminService';

const steps = ['Basic Information', 'Subscription Plan', 'Features', 'Assign Admin'];

const CreateOrganization = () => {
  const navigate = useNavigate();
  const [activeStep, setActiveStep] = useState(0);
  const [error, setError] = useState('');
  const [formData, setFormData] = useState({
    // Basic Info
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

    // Subscription
    plan: 'FREE',
    credits: 1000,
    maxConcurrentUsers: 100,
    maxExamsPerMonth: 10,

    // Features
    brandingEnabled: false,
    customEmailTemplates: false,
    advancedProctoring: false,
    apiAccess: false,
    bulkOperations: false,
    analyticsExport: false,

    // Admin
    adminName: '',
    adminEmail: '',
    adminPassword: '',
  });

  const handleChange = (field: string, value: any) => {
    setFormData({ ...formData, [field]: value });
  };

  const handleNext = () => {
    setActiveStep((prev) => prev + 1);
  };

  const handleBack = () => {
    setActiveStep((prev) => prev - 1);
  };

  const handleSubmit = async () => {
    try {
      setError('');
      const orgData = {
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
          startDate: new Date().toISOString(),
          endDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString(), // 1 year from now
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

      const organization = await superAdminService.createOrganization(orgData);

      // Assign admin if provided
      if (formData.adminEmail && formData.adminName) {
        await superAdminService.assignAdmin(organization._id, {
          name: formData.adminName,
          email: formData.adminEmail,
          password: formData.adminPassword || undefined,
        });
      }

      navigate('/super-admin/organizations');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to create organization');
    }
  };

  const renderStepContent = (step: number) => {
    switch (step) {
      case 0:
        return (
          <Grid container spacing={3}>
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
        );

      case 1:
        return (
          <Grid container spacing={3}>
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
        );

      case 2:
        return (
          <Grid container spacing={2}>
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
        );

      case 3:
        return (
          <Grid container spacing={3}>
            <Grid item xs={12}>
              <Alert severity="info">
                Assign an organization administrator. An email with credentials will be sent automatically.
              </Alert>
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Admin Name"
                value={formData.adminName}
                onChange={(e) => handleChange('adminName', e.target.value)}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Admin Email"
                type="email"
                value={formData.adminEmail}
                onChange={(e) => handleChange('adminEmail', e.target.value)}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Admin Password (optional)"
                type="password"
                helperText="Leave blank to auto-generate"
                value={formData.adminPassword}
                onChange={(e) => handleChange('adminPassword', e.target.value)}
              />
            </Grid>
          </Grid>
        );

      default:
        return null;
    }
  };

  return (
    <Container maxWidth="md">
      <Box sx={{ py: 4 }}>
        <Typography variant="h4" gutterBottom>
          Create Organization
        </Typography>

        <Paper elevation={3} sx={{ p: 3, mt: 3 }}>
          <Stepper activeStep={activeStep} sx={{ mb: 4 }}>
            {steps.map((label) => (
              <Step key={label}>
                <StepLabel>{label}</StepLabel>
              </Step>
            ))}
          </Stepper>

          {error && (
            <Alert severity="error" sx={{ mb: 3 }}>
              {error}
            </Alert>
          )}

          {renderStepContent(activeStep)}

          <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 4 }}>
            <Button disabled={activeStep === 0} onClick={handleBack}>
              Back
            </Button>
            <Box>
              <Button onClick={() => navigate('/super-admin/organizations')} sx={{ mr: 1 }}>
                Cancel
              </Button>
              {activeStep === steps.length - 1 ? (
                <Button variant="contained" onClick={handleSubmit}>
                  Create Organization
                </Button>
              ) : (
                <Button variant="contained" onClick={handleNext}>
                  Next
                </Button>
              )}
            </Box>
          </Box>
        </Paper>
      </Box>
    </Container>
  );
};

export default CreateOrganization;
