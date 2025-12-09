import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { StatsCard } from '@/components/shared/StatsCard';
import {
  Table,
  TableBody,
  TableCell,
  TableRow,
} from '@/components/ui/table';
import {
  Edit,
  Trash2,
  Ban,
  CheckCircle,
  Users,
  ClipboardList,
  FileCheck,
  TrendingUp,
  Loader2,
  Check,
} from 'lucide-react';
import { motion } from 'framer-motion';
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
        return 'destructive';
      case 'TRIAL':
        return 'default';
      case 'EXPIRED':
        return 'warning';
      default:
        return 'default';
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[80vh]">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (!organization) {
    return (
      <div className="space-y-6">
        <h1 className="text-3xl font-bold tracking-tight">Organization not found</h1>
      </div>
    );
  }

  const stats = [
    {
      title: 'Total Users',
      value: organization.stats.totalUsers,
      icon: Users,
      iconColor: 'text-primary-600',
      iconBgColor: 'bg-primary-100',
      description: 'Active users',
    },
    {
      title: 'Total Exams',
      value: organization.stats.totalExams,
      icon: ClipboardList,
      iconColor: 'text-success-600',
      iconBgColor: 'bg-success-100',
      description: 'Created exams',
    },
    {
      title: 'Total Assessments',
      value: organization.stats.totalAssessments,
      icon: FileCheck,
      iconColor: 'text-blue-600',
      iconBgColor: 'bg-blue-100',
      description: 'Completed assessments',
    },
    {
      title: 'Credits Used',
      value: `${organization.stats.creditsUsed} / ${organization.subscription.credits}`,
      icon: TrendingUp,
      iconColor: 'text-warning-600',
      iconBgColor: 'bg-warning-100',
      description: usage ? `${usage.usage.usagePercentage.toFixed(1)}% used` : 'Usage data',
    },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">{organization.name}</h1>
          <div className="flex gap-2 mt-2">
            <Badge variant={getStatusColor(organization.status)}>{organization.status}</Badge>
            <Badge variant="outline">{organization.type}</Badge>
            <Badge variant="outline">{organization.subscription.plan}</Badge>
          </div>
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            onClick={() => navigate(`/super-admin/organizations/${id}/edit`)}
          >
            <Edit className="mr-2 h-4 w-4" />
            Edit
          </Button>
          <Button
            variant="outline"
            onClick={handleSuspend}
            className={
              organization.status === 'SUSPENDED'
                ? 'text-green-600 hover:text-green-700'
                : 'text-yellow-600 hover:text-yellow-700'
            }
          >
            {organization.status === 'SUSPENDED' ? (
              <>
                <CheckCircle className="mr-2 h-4 w-4" />
                Activate
              </>
            ) : (
              <>
                <Ban className="mr-2 h-4 w-4" />
                Suspend
              </>
            )}
          </Button>
          <Button variant="outline" onClick={handleDelete} className="text-red-600 hover:text-red-700">
            <Trash2 className="mr-2 h-4 w-4" />
            Delete
          </Button>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid gap-6 grid-cols-1 md:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat, index) => (
          <motion.div
            key={stat.title}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: index * 0.1 }}
          >
            <StatsCard {...stat} />
          </motion.div>
        ))}
      </div>

      <div className="grid gap-6 grid-cols-1 lg:grid-cols-2">
        {/* Contact Information */}
        <Card>
          <CardHeader>
            <CardTitle>Contact Information</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableBody>
                <TableRow>
                  <TableCell className="font-semibold">Email:</TableCell>
                  <TableCell>{organization.contactInfo.email}</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell className="font-semibold">Phone:</TableCell>
                  <TableCell>{organization.contactInfo.phone || 'N/A'}</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell className="font-semibold">Website:</TableCell>
                  <TableCell>{organization.contactInfo.website || 'N/A'}</TableCell>
                </TableRow>
                {organization.contactInfo.address && (
                  <TableRow>
                    <TableCell className="font-semibold">Address:</TableCell>
                    <TableCell>
                      {organization.contactInfo.address.street}, {organization.contactInfo.address.city},{' '}
                      {organization.contactInfo.address.state} {organization.contactInfo.address.pincode},{' '}
                      {organization.contactInfo.address.country}
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        {/* Subscription Details */}
        <Card>
          <CardHeader>
            <CardTitle>Subscription Details</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableBody>
                <TableRow>
                  <TableCell className="font-semibold">Plan:</TableCell>
                  <TableCell>
                    <Badge variant="default">{organization.subscription.plan}</Badge>
                  </TableCell>
                </TableRow>
                <TableRow>
                  <TableCell className="font-semibold">Credits:</TableCell>
                  <TableCell>{organization.subscription.credits.toLocaleString()}</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell className="font-semibold">Max Concurrent Users:</TableCell>
                  <TableCell>{organization.subscription.maxConcurrentUsers}</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell className="font-semibold">Max Exams/Month:</TableCell>
                  <TableCell>{organization.subscription.maxExamsPerMonth}</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell className="font-semibold">Start Date:</TableCell>
                  <TableCell>{new Date(organization.subscription.startDate).toLocaleDateString()}</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell className="font-semibold">End Date:</TableCell>
                  <TableCell>{new Date(organization.subscription.endDate).toLocaleDateString()}</TableCell>
                </TableRow>
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        {/* Features */}
        <Card>
          <CardHeader>
            <CardTitle>Enabled Features</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {organization.features?.brandingEnabled && (
                <div className="flex items-center gap-2">
                  <Check className="h-4 w-4 text-green-600" />
                  <span>Branding Enabled</span>
                </div>
              )}
              {organization.features?.customEmailTemplates && (
                <div className="flex items-center gap-2">
                  <Check className="h-4 w-4 text-green-600" />
                  <span>Custom Email Templates</span>
                </div>
              )}
              {organization.features?.advancedProctoring && (
                <div className="flex items-center gap-2">
                  <Check className="h-4 w-4 text-green-600" />
                  <span>Advanced Proctoring</span>
                </div>
              )}
              {organization.features?.apiAccess && (
                <div className="flex items-center gap-2">
                  <Check className="h-4 w-4 text-green-600" />
                  <span>API Access</span>
                </div>
              )}
              {organization.features?.bulkOperations && (
                <div className="flex items-center gap-2">
                  <Check className="h-4 w-4 text-green-600" />
                  <span>Bulk Operations</span>
                </div>
              )}
              {organization.features?.analyticsExport && (
                <div className="flex items-center gap-2">
                  <Check className="h-4 w-4 text-green-600" />
                  <span>Analytics Export</span>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Usage Statistics */}
        <Card>
          <CardHeader>
            <CardTitle>Usage Statistics</CardTitle>
          </CardHeader>
          <CardContent>
            {usage && (
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">Credits Used:</span>
                  <span className="font-semibold">{usage.usage.creditsUsed.toLocaleString()}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">Credits Remaining:</span>
                  <span className="font-semibold">{usage.usage.creditsRemaining.toLocaleString()}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">Usage Percentage:</span>
                  <span className="font-semibold">{usage.usage.usagePercentage.toFixed(1)}%</span>
                </div>
                <div className="w-full bg-muted rounded-full h-3 mt-4">
                  <div
                    className={`h-3 rounded-full transition-all ${
                      usage.usage.usagePercentage > 80 ? 'bg-red-600' : 'bg-primary'
                    }`}
                    style={{ width: `${Math.min(usage.usage.usagePercentage, 100)}%` }}
                  />
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default OrganizationDetails;
