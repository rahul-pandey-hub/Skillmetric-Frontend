import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
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
import { Loader2, AlertCircle } from 'lucide-react';
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
      <div className="flex justify-center items-center min-h-[80vh]">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Edit Organization</h1>
        <p className="text-muted-foreground">Update organization details and settings</p>
      </div>

      <form onSubmit={handleSubmit}>
        <div className="space-y-6">
          {error && (
            <div className="bg-red-50 dark:bg-red-950 border border-red-200 dark:border-red-800 rounded-lg p-4">
              <div className="flex gap-3">
                <AlertCircle className="h-5 w-5 text-red-600 dark:text-red-400 flex-shrink-0" />
                <div className="text-sm text-red-800 dark:text-red-200">{error}</div>
              </div>
            </div>
          )}

          {/* Basic Information */}
          <Card>
            <CardHeader>
              <CardTitle>Basic Information</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="md:col-span-2">
                  <Label htmlFor="name">
                    Organization Name <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => handleChange('name', e.target.value)}
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
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="contactPhone">Contact Phone</Label>
                  <Input
                    id="contactPhone"
                    value={formData.contactPhone}
                    onChange={(e) => handleChange('contactPhone', e.target.value)}
                  />
                </div>
                <div>
                  <Label htmlFor="website">Website</Label>
                  <Input
                    id="website"
                    value={formData.website}
                    onChange={(e) => handleChange('website', e.target.value)}
                  />
                </div>
                <div className="md:col-span-2">
                  <Label htmlFor="street">Street Address</Label>
                  <Input
                    id="street"
                    value={formData.street}
                    onChange={(e) => handleChange('street', e.target.value)}
                  />
                </div>
                <div>
                  <Label htmlFor="city">City</Label>
                  <Input id="city" value={formData.city} onChange={(e) => handleChange('city', e.target.value)} />
                </div>
                <div>
                  <Label htmlFor="state">State</Label>
                  <Input id="state" value={formData.state} onChange={(e) => handleChange('state', e.target.value)} />
                </div>
                <div>
                  <Label htmlFor="country">Country</Label>
                  <Input
                    id="country"
                    value={formData.country}
                    onChange={(e) => handleChange('country', e.target.value)}
                  />
                </div>
                <div>
                  <Label htmlFor="pincode">Pincode</Label>
                  <Input
                    id="pincode"
                    value={formData.pincode}
                    onChange={(e) => handleChange('pincode', e.target.value)}
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Subscription Plan */}
          <Card>
            <CardHeader>
              <CardTitle>Subscription Plan</CardTitle>
            </CardHeader>
            <CardContent>
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
            </CardContent>
          </Card>

          {/* Features */}
          <Card>
            <CardHeader>
              <CardTitle>Features</CardTitle>
            </CardHeader>
            <CardContent>
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
            </CardContent>
          </Card>

          <div className="flex justify-between">
            <Button type="button" variant="outline" onClick={() => navigate(`/super-admin/organizations/${id}`)}>
              Cancel
            </Button>
            <Button type="submit">Save Changes</Button>
          </div>
        </div>
      </form>
    </div>
  );
};

export default EditOrganization;
