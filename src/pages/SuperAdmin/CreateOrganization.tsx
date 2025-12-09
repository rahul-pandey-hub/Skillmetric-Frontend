import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Check, AlertCircle } from 'lucide-react';
import { cn } from '@/lib/utils';
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
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="md:col-span-2">
              <Label htmlFor="name">
                Organization Name <span className="text-red-500">*</span>
              </Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => handleChange('name', e.target.value)}
                placeholder="Enter organization name"
                required
              />
            </div>
            <div>
              <Label htmlFor="type">
                Organization Type <span className="text-red-500">*</span>
              </Label>
              <Select value={formData.type} onValueChange={(value) => handleChange('type', value)}>
                <SelectTrigger id="type">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="COMPANY">Company</SelectItem>
                  <SelectItem value="UNIVERSITY">University</SelectItem>
                  <SelectItem value="TRAINING_INSTITUTE">Training Institute</SelectItem>
                  <SelectItem value="INDIVIDUAL">Individual</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="contactEmail">
                Contact Email <span className="text-red-500">*</span>
              </Label>
              <Input
                id="contactEmail"
                type="email"
                value={formData.contactEmail}
                onChange={(e) => handleChange('contactEmail', e.target.value)}
                placeholder="contact@organization.com"
                required
              />
            </div>
            <div>
              <Label htmlFor="contactPhone">Contact Phone</Label>
              <Input
                id="contactPhone"
                value={formData.contactPhone}
                onChange={(e) => handleChange('contactPhone', e.target.value)}
                placeholder="+1 234 567 8900"
              />
            </div>
            <div>
              <Label htmlFor="website">Website</Label>
              <Input
                id="website"
                value={formData.website}
                onChange={(e) => handleChange('website', e.target.value)}
                placeholder="https://organization.com"
              />
            </div>
            <div className="md:col-span-2">
              <Label htmlFor="street">Street Address</Label>
              <Input
                id="street"
                value={formData.street}
                onChange={(e) => handleChange('street', e.target.value)}
                placeholder="123 Main Street"
              />
            </div>
            <div>
              <Label htmlFor="city">City</Label>
              <Input
                id="city"
                value={formData.city}
                onChange={(e) => handleChange('city', e.target.value)}
                placeholder="New York"
              />
            </div>
            <div>
              <Label htmlFor="state">State</Label>
              <Input
                id="state"
                value={formData.state}
                onChange={(e) => handleChange('state', e.target.value)}
                placeholder="NY"
              />
            </div>
            <div>
              <Label htmlFor="country">Country</Label>
              <Input
                id="country"
                value={formData.country}
                onChange={(e) => handleChange('country', e.target.value)}
                placeholder="United States"
              />
            </div>
            <div>
              <Label htmlFor="pincode">Pincode</Label>
              <Input
                id="pincode"
                value={formData.pincode}
                onChange={(e) => handleChange('pincode', e.target.value)}
                placeholder="10001"
              />
            </div>
          </div>
        );

      case 1:
        return (
          <div className="space-y-6">
            <div>
              <Label htmlFor="plan">
                Subscription Plan <span className="text-red-500">*</span>
              </Label>
              <Select value={formData.plan} onValueChange={(value) => handleChange('plan', value)}>
                <SelectTrigger id="plan">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="FREE">Free</SelectItem>
                  <SelectItem value="BASIC">Basic</SelectItem>
                  <SelectItem value="PRO">Pro</SelectItem>
                  <SelectItem value="ENTERPRISE">Enterprise</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <Label htmlFor="credits">
                  Credits <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="credits"
                  type="number"
                  value={formData.credits}
                  onChange={(e) => handleChange('credits', parseInt(e.target.value))}
                  required
                />
              </div>
              <div>
                <Label htmlFor="maxConcurrentUsers">
                  Max Concurrent Users <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="maxConcurrentUsers"
                  type="number"
                  value={formData.maxConcurrentUsers}
                  onChange={(e) => handleChange('maxConcurrentUsers', parseInt(e.target.value))}
                  required
                />
              </div>
              <div>
                <Label htmlFor="maxExamsPerMonth">
                  Max Exams Per Month <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="maxExamsPerMonth"
                  type="number"
                  value={formData.maxExamsPerMonth}
                  onChange={(e) => handleChange('maxExamsPerMonth', parseInt(e.target.value))}
                  required
                />
              </div>
            </div>
          </div>
        );

      case 2:
        return (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="flex items-center space-x-2">
              <Checkbox
                id="brandingEnabled"
                checked={formData.brandingEnabled}
                onCheckedChange={(checked) => handleChange('brandingEnabled', checked)}
              />
              <Label htmlFor="brandingEnabled" className="cursor-pointer font-normal">
                Branding Enabled
              </Label>
            </div>
            <div className="flex items-center space-x-2">
              <Checkbox
                id="customEmailTemplates"
                checked={formData.customEmailTemplates}
                onCheckedChange={(checked) => handleChange('customEmailTemplates', checked)}
              />
              <Label htmlFor="customEmailTemplates" className="cursor-pointer font-normal">
                Custom Email Templates
              </Label>
            </div>
            <div className="flex items-center space-x-2">
              <Checkbox
                id="advancedProctoring"
                checked={formData.advancedProctoring}
                onCheckedChange={(checked) => handleChange('advancedProctoring', checked)}
              />
              <Label htmlFor="advancedProctoring" className="cursor-pointer font-normal">
                Advanced Proctoring
              </Label>
            </div>
            <div className="flex items-center space-x-2">
              <Checkbox
                id="apiAccess"
                checked={formData.apiAccess}
                onCheckedChange={(checked) => handleChange('apiAccess', checked)}
              />
              <Label htmlFor="apiAccess" className="cursor-pointer font-normal">
                API Access
              </Label>
            </div>
            <div className="flex items-center space-x-2">
              <Checkbox
                id="bulkOperations"
                checked={formData.bulkOperations}
                onCheckedChange={(checked) => handleChange('bulkOperations', checked)}
              />
              <Label htmlFor="bulkOperations" className="cursor-pointer font-normal">
                Bulk Operations
              </Label>
            </div>
            <div className="flex items-center space-x-2">
              <Checkbox
                id="analyticsExport"
                checked={formData.analyticsExport}
                onCheckedChange={(checked) => handleChange('analyticsExport', checked)}
              />
              <Label htmlFor="analyticsExport" className="cursor-pointer font-normal">
                Analytics Export
              </Label>
            </div>
          </div>
        );

      case 3:
        return (
          <div className="space-y-6">
            <div className="bg-blue-50 dark:bg-blue-950 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
              <div className="flex gap-3">
                <AlertCircle className="h-5 w-5 text-blue-600 dark:text-blue-400 flex-shrink-0 mt-0.5" />
                <div className="text-sm text-blue-800 dark:text-blue-200">
                  Assign an organization administrator. An email with credentials will be sent automatically.
                </div>
              </div>
            </div>
            <div>
              <Label htmlFor="adminName">Admin Name</Label>
              <Input
                id="adminName"
                value={formData.adminName}
                onChange={(e) => handleChange('adminName', e.target.value)}
                placeholder="John Doe"
              />
            </div>
            <div>
              <Label htmlFor="adminEmail">Admin Email</Label>
              <Input
                id="adminEmail"
                type="email"
                value={formData.adminEmail}
                onChange={(e) => handleChange('adminEmail', e.target.value)}
                placeholder="admin@organization.com"
              />
            </div>
            <div>
              <Label htmlFor="adminPassword">Admin Password (optional)</Label>
              <Input
                id="adminPassword"
                type="password"
                value={formData.adminPassword}
                onChange={(e) => handleChange('adminPassword', e.target.value)}
                placeholder="Leave blank to auto-generate"
              />
              <p className="text-sm text-muted-foreground mt-1">Leave blank to auto-generate a secure password</p>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Create Organization</h1>
        <p className="text-muted-foreground">Set up a new organization on the platform</p>
      </div>

      <Card>
        <CardContent className="pt-6">
          {/* Custom Stepper */}
          <div className="mb-8">
            <div className="flex items-center justify-between">
              {steps.map((label, index) => (
                <div key={label} className="flex items-center flex-1">
                  <div className="flex flex-col items-center flex-1">
                    <div
                      className={cn(
                        'w-10 h-10 rounded-full flex items-center justify-center border-2 transition-colors',
                        index < activeStep
                          ? 'bg-primary border-primary text-primary-foreground'
                          : index === activeStep
                          ? 'bg-primary border-primary text-primary-foreground'
                          : 'bg-background border-muted-foreground/30 text-muted-foreground'
                      )}
                    >
                      {index < activeStep ? <Check className="h-5 w-5" /> : <span>{index + 1}</span>}
                    </div>
                    <div
                      className={cn(
                        'text-sm font-medium mt-2 text-center',
                        index === activeStep ? 'text-foreground' : 'text-muted-foreground'
                      )}
                    >
                      {label}
                    </div>
                  </div>
                  {index < steps.length - 1 && (
                    <div
                      className={cn(
                        'h-0.5 flex-1 mx-2 transition-colors',
                        index < activeStep ? 'bg-primary' : 'bg-muted-foreground/30'
                      )}
                    />
                  )}
                </div>
              ))}
            </div>
          </div>

          {error && (
            <div className="bg-red-50 dark:bg-red-950 border border-red-200 dark:border-red-800 rounded-lg p-4 mb-6">
              <div className="flex gap-3">
                <AlertCircle className="h-5 w-5 text-red-600 dark:text-red-400 flex-shrink-0" />
                <div className="text-sm text-red-800 dark:text-red-200">{error}</div>
              </div>
            </div>
          )}

          <motion.div
            key={activeStep}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.3 }}
          >
            {renderStepContent(activeStep)}
          </motion.div>

          <div className="flex justify-between mt-8 pt-6 border-t">
            <Button variant="outline" onClick={handleBack} disabled={activeStep === 0}>
              Back
            </Button>
            <div className="flex gap-2">
              <Button variant="outline" onClick={() => navigate('/super-admin/organizations')}>
                Cancel
              </Button>
              {activeStep === steps.length - 1 ? (
                <Button onClick={handleSubmit}>Create Organization</Button>
              ) : (
                <Button onClick={handleNext}>Next</Button>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default CreateOrganization;
