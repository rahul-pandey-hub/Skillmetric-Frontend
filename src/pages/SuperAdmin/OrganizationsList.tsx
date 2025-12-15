import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Edit, Trash2, Eye, Plus, Ban, CheckCircle, Loader2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import superAdminService, { Organization } from '../../services/superAdminService';

const OrganizationsList = () => {
  const navigate = useNavigate();
  const [organizations, setOrganizations] = useState<Organization[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [total, setTotal] = useState(0);
  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [planFilter, setPlanFilter] = useState('');
  const [deleteDialog, setDeleteDialog] = useState<{ open: boolean; org: Organization | null }>({
    open: false,
    org: null,
  });

  useEffect(() => {
    fetchOrganizations();
  }, [page, rowsPerPage, search, typeFilter, statusFilter, planFilter]);

  const fetchOrganizations = async () => {
    try {
      setLoading(true);
      const response = await superAdminService.getAllOrganizations({
        page: page + 1,
        limit: rowsPerPage,
        search,
        type: typeFilter || undefined,
        status: statusFilter || undefined,
        plan: planFilter || undefined,
      });
      setOrganizations(response.data);
      setTotal(response.meta.total);
    } catch (error) {
      console.error('Failed to fetch organizations:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteDialog.org) return;
    try {
      await superAdminService.deleteOrganization(deleteDialog.org._id);
      setDeleteDialog({ open: false, org: null });
      fetchOrganizations();
    } catch (error) {
      console.error('Failed to delete organization:', error);
    }
  };

  const handleSuspend = async (org: Organization) => {
    try {
      if (org.status === 'SUSPENDED') {
        await superAdminService.activateOrganization(org._id);
      } else {
        await superAdminService.suspendOrganization(org._id);
      }
      fetchOrganizations();
    } catch (error) {
      console.error('Failed to toggle organization status:', error);
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

  const totalPages = Math.ceil(total / rowsPerPage);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Organizations</h1>
          <p className="text-muted-foreground">Manage all organizations on the platform</p>
        </div>
        <Button onClick={() => navigate('/super-admin/organizations/create')}>
          <Plus className="mr-2 h-4 w-4" />
          Create Organization
        </Button>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-wrap gap-4">
            <div className="flex-1 min-w-[200px]">
              <Input
                placeholder="Search organizations..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
            <Select value={typeFilter || undefined} onValueChange={(value) => setTypeFilter(value === 'ALL' ? '' : value)}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="All Types" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ALL">All Types</SelectItem>
                <SelectItem value="COMPANY">Company</SelectItem>
                <SelectItem value="UNIVERSITY">University</SelectItem>
                <SelectItem value="TRAINING_INSTITUTE">Training Institute</SelectItem>
                <SelectItem value="INDIVIDUAL">Individual</SelectItem>
              </SelectContent>
            </Select>
            <Select value={statusFilter || undefined} onValueChange={(value) => setStatusFilter(value === 'ALL' ? '' : value)}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="All Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ALL">All Status</SelectItem>
                <SelectItem value="ACTIVE">Active</SelectItem>
                <SelectItem value="SUSPENDED">Suspended</SelectItem>
                <SelectItem value="TRIAL">Trial</SelectItem>
                <SelectItem value="EXPIRED">Expired</SelectItem>
              </SelectContent>
            </Select>
            <Select value={planFilter || undefined} onValueChange={(value) => setPlanFilter(value === 'ALL' ? '' : value)}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="All Plans" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ALL">All Plans</SelectItem>
                <SelectItem value="FREE">Free</SelectItem>
                <SelectItem value="BASIC">Basic</SelectItem>
                <SelectItem value="PRO">Pro</SelectItem>
                <SelectItem value="ENTERPRISE">Enterprise</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Table */}
      <Card>
        <CardContent className="p-0">
          {loading ? (
            <div className="flex justify-center items-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
          ) : (
            <>
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Name</TableHead>
                      <TableHead>Type</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Plan</TableHead>
                      <TableHead className="text-right">Users</TableHead>
                      <TableHead className="text-right">Exams</TableHead>
                      <TableHead className="text-right">Credits Used</TableHead>
                      <TableHead className="text-center">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {organizations.map((org) => (
                      <TableRow key={org._id} className="cursor-pointer hover:bg-accent/50">
                        <TableCell>
                          <div>
                            <div className="font-medium">{org.name}</div>
                            <div className="text-sm text-muted-foreground">{org.contactInfo.email}</div>
                          </div>
                        </TableCell>
                        <TableCell>{org.type}</TableCell>
                        <TableCell>
                          <Badge variant={getStatusColor(org.status)}>{org.status}</Badge>
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline">{org.subscription.plan}</Badge>
                        </TableCell>
                        <TableCell className="text-right">{org.stats.totalUsers}</TableCell>
                        <TableCell className="text-right">{org.stats.totalExams}</TableCell>
                        <TableCell className="text-right">
                          {org.stats.creditsUsed} / {org.subscription.credits}
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center justify-center gap-2">
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => navigate(`/super-admin/organizations/${org._id}`)}
                              title="View Details"
                            >
                              <Eye className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => navigate(`/super-admin/organizations/${org._id}/edit`)}
                              title="Edit"
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => handleSuspend(org)}
                              title={org.status === 'SUSPENDED' ? 'Activate' : 'Suspend'}
                              className={
                                org.status === 'SUSPENDED'
                                  ? 'text-green-600 hover:text-green-700'
                                  : 'text-yellow-600 hover:text-yellow-700'
                              }
                            >
                              {org.status === 'SUSPENDED' ? (
                                <CheckCircle className="h-4 w-4" />
                              ) : (
                                <Ban className="h-4 w-4" />
                              )}
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => setDeleteDialog({ open: true, org })}
                              title="Delete"
                              className="text-red-600 hover:text-red-700"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>

              {/* Pagination */}
              <div className="flex items-center justify-between px-6 py-4 border-t">
                <div className="text-sm text-muted-foreground">
                  Showing {page * rowsPerPage + 1} to {Math.min((page + 1) * rowsPerPage, total)} of {total}{' '}
                  organizations
                </div>
                <div className="flex items-center gap-2">
                  <Select
                    value={rowsPerPage.toString()}
                    onValueChange={(value) => {
                      setRowsPerPage(parseInt(value));
                      setPage(0);
                    }}
                  >
                    <SelectTrigger className="w-[100px]">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="5">5 / page</SelectItem>
                      <SelectItem value="10">10 / page</SelectItem>
                      <SelectItem value="25">25 / page</SelectItem>
                      <SelectItem value="50">50 / page</SelectItem>
                    </SelectContent>
                  </Select>
                  <Button variant="outline" size="sm" onClick={() => setPage(page - 1)} disabled={page === 0}>
                    Previous
                  </Button>
                  <div className="text-sm">
                    Page {page + 1} of {totalPages}
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setPage(page + 1)}
                    disabled={page >= totalPages - 1}
                  >
                    Next
                  </Button>
                </div>
              </div>
            </>
          )}
        </CardContent>
      </Card>

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteDialog.open} onOpenChange={(open) => setDeleteDialog({ open, org: null })}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Organization</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete <strong>{deleteDialog.org?.name}</strong>? This action cannot be
              undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteDialog({ open: false, org: null })}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleDelete}>
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default OrganizationsList;
