import { useEffect, useState } from 'react';
import {
  Container,
  Typography,
  Box,
  Button,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TablePagination,
  Chip,
  IconButton,
  TextField,
  MenuItem,
  CircularProgress,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from '@mui/material';
import { Edit, Delete, Visibility, Add, Block, CheckCircle } from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
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
        return 'error';
      case 'TRIAL':
        return 'info';
      case 'EXPIRED':
        return 'warning';
      default:
        return 'default';
    }
  };

  return (
    <Container maxWidth="xl">
      <Box sx={{ py: 4 }}>
        <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
          <Typography variant="h4">Organizations</Typography>
          <Button
            variant="contained"
            startIcon={<Add />}
            onClick={() => navigate('/super-admin/organizations/create')}
          >
            Create Organization
          </Button>
        </Box>

        <Paper elevation={3} sx={{ p: 3, mb: 3 }}>
          <Box display="flex" gap={2} flexWrap="wrap">
            <TextField
              label="Search"
              variant="outlined"
              size="small"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              sx={{ flexGrow: 1, minWidth: 200 }}
            />
            <TextField
              select
              label="Type"
              variant="outlined"
              size="small"
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
              sx={{ minWidth: 150 }}
            >
              <MenuItem value="">All Types</MenuItem>
              <MenuItem value="COMPANY">Company</MenuItem>
              <MenuItem value="UNIVERSITY">University</MenuItem>
              <MenuItem value="TRAINING_INSTITUTE">Training Institute</MenuItem>
              <MenuItem value="INDIVIDUAL">Individual</MenuItem>
            </TextField>
            <TextField
              select
              label="Status"
              variant="outlined"
              size="small"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              sx={{ minWidth: 150 }}
            >
              <MenuItem value="">All Status</MenuItem>
              <MenuItem value="ACTIVE">Active</MenuItem>
              <MenuItem value="SUSPENDED">Suspended</MenuItem>
              <MenuItem value="TRIAL">Trial</MenuItem>
              <MenuItem value="EXPIRED">Expired</MenuItem>
            </TextField>
            <TextField
              select
              label="Plan"
              variant="outlined"
              size="small"
              value={planFilter}
              onChange={(e) => setPlanFilter(e.target.value)}
              sx={{ minWidth: 150 }}
            >
              <MenuItem value="">All Plans</MenuItem>
              <MenuItem value="FREE">Free</MenuItem>
              <MenuItem value="BASIC">Basic</MenuItem>
              <MenuItem value="PRO">Pro</MenuItem>
              <MenuItem value="ENTERPRISE">Enterprise</MenuItem>
            </TextField>
          </Box>
        </Paper>

        {loading ? (
          <Box display="flex" justifyContent="center" py={4}>
            <CircularProgress />
          </Box>
        ) : (
          <TableContainer component={Paper} elevation={3}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Name</TableCell>
                  <TableCell>Type</TableCell>
                  <TableCell>Status</TableCell>
                  <TableCell>Plan</TableCell>
                  <TableCell align="right">Users</TableCell>
                  <TableCell align="right">Exams</TableCell>
                  <TableCell align="right">Credits Used</TableCell>
                  <TableCell align="center">Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {organizations.map((org) => (
                  <TableRow key={org._id} hover>
                    <TableCell>
                      <Typography variant="body1">{org.name}</Typography>
                      <Typography variant="caption" color="textSecondary">
                        {org.contactInfo.email}
                      </Typography>
                    </TableCell>
                    <TableCell>{org.type}</TableCell>
                    <TableCell>
                      <Chip label={org.status} color={getStatusColor(org.status)} size="small" />
                    </TableCell>
                    <TableCell>
                      <Chip label={org.subscription.plan} color="primary" variant="outlined" size="small" />
                    </TableCell>
                    <TableCell align="right">{org.stats.totalUsers}</TableCell>
                    <TableCell align="right">{org.stats.totalExams}</TableCell>
                    <TableCell align="right">
                      {org.stats.creditsUsed} / {org.subscription.credits}
                    </TableCell>
                    <TableCell align="center">
                      <IconButton
                        size="small"
                        onClick={() => navigate(`/super-admin/organizations/${org._id}`)}
                        title="View Details"
                      >
                        <Visibility />
                      </IconButton>
                      <IconButton
                        size="small"
                        onClick={() => navigate(`/super-admin/organizations/${org._id}/edit`)}
                        title="Edit"
                      >
                        <Edit />
                      </IconButton>
                      <IconButton
                        size="small"
                        onClick={() => handleSuspend(org)}
                        title={org.status === 'SUSPENDED' ? 'Activate' : 'Suspend'}
                        color={org.status === 'SUSPENDED' ? 'success' : 'warning'}
                      >
                        {org.status === 'SUSPENDED' ? <CheckCircle /> : <Block />}
                      </IconButton>
                      <IconButton
                        size="small"
                        onClick={() => setDeleteDialog({ open: true, org })}
                        title="Delete"
                        color="error"
                      >
                        <Delete />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
            <TablePagination
              component="div"
              count={total}
              page={page}
              onPageChange={(_, newPage) => setPage(newPage)}
              rowsPerPage={rowsPerPage}
              onRowsPerPageChange={(e) => {
                setRowsPerPage(parseInt(e.target.value, 10));
                setPage(0);
              }}
            />
          </TableContainer>
        )}
      </Box>

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteDialog.open} onClose={() => setDeleteDialog({ open: false, org: null })}>
        <DialogTitle>Delete Organization</DialogTitle>
        <DialogContent>
          Are you sure you want to delete <strong>{deleteDialog.org?.name}</strong>? This action cannot be undone.
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteDialog({ open: false, org: null })}>Cancel</Button>
          <Button onClick={handleDelete} color="error" variant="contained">
            Delete
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default OrganizationsList;
