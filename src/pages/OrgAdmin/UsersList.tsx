import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
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
import { Edit, Trash2, Plus, UserMinus, UserPlus, Eye } from 'lucide-react';
import { motion } from 'framer-motion';
import { orgAdminService, User } from '@/services/orgAdminService';
import { useSnackbar } from 'notistack';

export default function UsersList() {
  const navigate = useNavigate();
  const { enqueueSnackbar } = useSnackbar();
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [total, setTotal] = useState(0);
  const [roleFilter, setRoleFilter] = useState('all');
  const [search, setSearch] = useState('');
  const [searchDebounced, setSearchDebounced] = useState('');
  const [deleteDialog, setDeleteDialog] = useState<{ open: boolean; user: User | null }>({
    open: false,
    user: null,
  });

  // Debounce search input
  useEffect(() => {
    const timer = setTimeout(() => {
      setSearchDebounced(search);
      setPage(1); // Reset to first page on search
    }, 500);

    return () => clearTimeout(timer);
  }, [search]);

  // Reset to page 1 when role filter changes
  useEffect(() => {
    setPage(1);
  }, [roleFilter]);

  useEffect(() => {
    fetchUsers();
  }, [page, rowsPerPage, roleFilter, searchDebounced]);

  const fetchUsers = async () => {
    try {
      setLoading(true);

      // DEBUG: Check token
      const token = localStorage.getItem('accessToken');
      if (token) {
        const payload = JSON.parse(atob(token.split('.')[1]));
        console.log('🔐 TOKEN PAYLOAD:', payload);
        console.log('📍 Has organizationId?', !!payload.organizationId);
      }

      // DEBUG: Check request params
      const params = {
        page,
        limit: rowsPerPage,
        role: roleFilter,
        search: searchDebounced || undefined,
      };
      console.log('📤 REQUEST PARAMS:', params);

      const response = await orgAdminService.getAllUsers(params);

      console.log('📥 RESPONSE:', response);
      console.log('👥 Users count:', response.data.length);
      console.log('📊 Total in DB:', response.meta.total);

      setUsers(response.data);
      setTotal(response.meta.total);
    } catch (error: any) {
      console.error('❌ ERROR:', error);
      console.error('❌ ERROR RESPONSE:', error.response?.data);
      enqueueSnackbar(error.response?.data?.message || 'Failed to fetch users', {
        variant: 'error',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteDialog.user) return;
    try {
      await orgAdminService.deleteUser(deleteDialog.user._id);
      enqueueSnackbar('User deleted successfully', { variant: 'success' });
      setDeleteDialog({ open: false, user: null });
      fetchUsers();
    } catch (error: any) {
      console.error('Failed to delete user:', error);
      enqueueSnackbar(error.response?.data?.message || 'Failed to delete user', {
        variant: 'error',
      });
    }
  };

  const handleToggleStatus = async (user: User) => {
    try {
      const result = await orgAdminService.toggleUserStatus(user._id);
      enqueueSnackbar(result.message, { variant: 'success' });
      fetchUsers();
    } catch (error: any) {
      console.error('Failed to toggle user status:', error);
      enqueueSnackbar(error.response?.data?.message || 'Failed to toggle user status', {
        variant: 'error',
      });
    }
  };

  const getRoleVariant = (role: string): 'default' | 'secondary' | 'success' | 'outline' => {
    switch (role) {
      case 'RECRUITER':
        return 'default';
      case 'INSTRUCTOR':
        return 'secondary';
      case 'STUDENT':
        return 'success';
      default:
        return 'outline';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">User Management</h1>
          <p className="text-muted-foreground">Manage organization users and roles</p>
        </div>
        <div className="flex gap-2">
          <Button onClick={() => navigate('/org-admin/users/add')}>
            <Plus className="mr-2 h-4 w-4" />
            Add User
          </Button>
        </div>
      </div>

      {/* Filters */}
      <Card className="p-4">
        <div className="flex flex-wrap gap-4">
          <div className="flex-1 min-w-[200px]">
            <Label htmlFor="search" className="sr-only">Search</Label>
            <Input
              id="search"
              placeholder="Search users..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <div className="w-[180px]">
            <Select value={roleFilter} onValueChange={setRoleFilter}>
              <SelectTrigger>
                <SelectValue placeholder="All Roles" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Roles</SelectItem>
                <SelectItem value="RECRUITER">Recruiter</SelectItem>
                <SelectItem value="INSTRUCTOR">Instructor</SelectItem>
                <SelectItem value="STUDENT">Student</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </Card>

      {/* Users Table */}
      <Card>
        {loading ? (
          <div className="flex justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        ) : (
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Role</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Last Login</TableHead>
                  <TableHead className="text-center">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {users.map((user, index) => (
                  <motion.tr
                    key={user._id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.2, delay: index * 0.05 }}
                    className="group hover:bg-muted/50"
                  >
                    <TableCell className="font-medium">{user.name}</TableCell>
                    <TableCell>{user.email}</TableCell>
                    <TableCell>
                      <Badge variant={getRoleVariant(user.role)}>{user.role}</Badge>
                    </TableCell>
                    <TableCell>
                      <Badge variant={user.isActive ? 'success' : 'outline'}>
                        {user.isActive ? 'Active' : 'Inactive'}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {user.lastLogin ? new Date(user.lastLogin).toLocaleDateString() : 'Never'}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center justify-center gap-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => navigate(`/org-admin/users/${user._id}`)}
                          title="View Profile"
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => navigate(`/org-admin/users/${user._id}/edit`)}
                          title="Edit"
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleToggleStatus(user)}
                          title={user.isActive ? 'Deactivate' : 'Activate'}
                          className={user.isActive ? 'text-warning-600' : 'text-success-600'}
                        >
                          {user.isActive ? <UserMinus className="h-4 w-4" /> : <UserPlus className="h-4 w-4" />}
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setDeleteDialog({ open: true, user })}
                          title="Delete"
                          className="text-destructive hover:text-destructive"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </motion.tr>
                ))}
              </TableBody>
            </Table>
          </div>
        )}

        {/* Pagination */}
        <div className="flex items-center justify-between px-4 py-4 border-t">
          <div className="text-sm text-muted-foreground">
            Showing {(page - 1) * rowsPerPage + 1} to {Math.min(page * rowsPerPage, total)} of {total} users
          </div>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setPage(Math.max(1, page - 1))}
              disabled={page === 1}
            >
              Previous
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setPage(page + 1)}
              disabled={page * rowsPerPage >= total}
            >
              Next
            </Button>
          </div>
        </div>
      </Card>

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteDialog.open} onOpenChange={(open) => setDeleteDialog({ open, user: null })}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete User</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete <strong>{deleteDialog.user?.name}</strong>? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteDialog({ open: false, user: null })}>
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
}
