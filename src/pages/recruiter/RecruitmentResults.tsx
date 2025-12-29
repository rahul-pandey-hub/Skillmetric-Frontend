import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Download, Filter, Search, CheckCircle, XCircle, Clock, Mail } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
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
import invitationService from '../../services/invitationService';
import { RecruitmentResult, InvitationStatus } from '../../types/exam';
import { toast } from 'sonner';

export default function RecruitmentResults() {
  const { examId } = useParams<{ examId: string }>();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [results, setResults] = useState<RecruitmentResult[]>([]);
  const [filteredResults, setFilteredResults] = useState<RecruitmentResult[]>([]);
  const [selectedResults, setSelectedResults] = useState<Set<string>>(new Set());
  const [stats, setStats] = useState({
    totalInvited: 0,
    completed: 0,
    pending: 0,
    expired: 0,
    averageScore: 0,
  });

  // Filters
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState<'score' | 'name' | 'email' | 'date'>('score');

  useEffect(() => {
    if (examId) {
      fetchRecruitmentResults();
    }
  }, [examId]);

  useEffect(() => {
    applyFilters();
  }, [statusFilter, searchQuery, sortBy, results]);

  const fetchRecruitmentResults = async () => {
    try {
      setLoading(true);
      const response = await invitationService.getRecruitmentResults(examId!);
      setResults(response.data.data);
      setStats(response.data.stats);
    } catch (err: any) {
      console.error('Failed to load results:', err);
      toast.error(err.response?.data?.message || 'Failed to load results');
    } finally {
      setLoading(false);
    }
  };

  const applyFilters = () => {
    let filtered = [...results];

    // Status filter
    if (statusFilter !== 'all') {
      filtered = filtered.filter(r => r.status === statusFilter);
    }

    // Search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        r =>
          r.candidateName.toLowerCase().includes(query) ||
          r.candidateEmail.toLowerCase().includes(query)
      );
    }

    // Sorting
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'score':
          return (b.score || 0) - (a.score || 0);
        case 'name':
          return a.candidateName.localeCompare(b.candidateName);
        case 'email':
          return a.candidateEmail.localeCompare(b.candidateEmail);
        case 'date':
          return new Date(b.submittedAt || 0).getTime() - new Date(a.submittedAt || 0).getTime();
        default:
          return 0;
      }
    });

    setFilteredResults(filtered);
  };

  const handleToggleSelect = (invitationId: string) => {
    const newSelected = new Set(selectedResults);
    if (newSelected.has(invitationId)) {
      newSelected.delete(invitationId);
    } else {
      newSelected.add(invitationId);
    }
    setSelectedResults(newSelected);
  };

  const handleSelectAll = () => {
    if (selectedResults.size === filteredResults.length) {
      setSelectedResults(new Set());
    } else {
      setSelectedResults(new Set(filteredResults.map(r => r.invitationId)));
    }
  };

  const handleShortlist = async () => {
    if (selectedResults.size === 0) {
      toast.error('Please select candidates to shortlist');
      return;
    }

    try {
      await invitationService.shortlistCandidates(examId!, {
        invitationIds: Array.from(selectedResults),
        action: 'shortlist',
      });
      toast.success(`Shortlisted ${selectedResults.size} candidate(s)`);
      setSelectedResults(new Set());
      await fetchRecruitmentResults();
    } catch (err: any) {
      console.error('Failed to shortlist:', err);
      toast.error(err.response?.data?.message || 'Failed to shortlist candidates');
    }
  };

  const handleReject = async () => {
    if (selectedResults.size === 0) {
      toast.error('Please select candidates to reject');
      return;
    }

    try {
      await invitationService.shortlistCandidates(examId!, {
        invitationIds: Array.from(selectedResults),
        action: 'reject',
      });
      toast.success(`Rejected ${selectedResults.size} candidate(s)`);
      setSelectedResults(new Set());
      await fetchRecruitmentResults();
    } catch (err: any) {
      console.error('Failed to reject:', err);
      toast.error(err.response?.data?.message || 'Failed to reject candidates');
    }
  };

  const handleExport = async (format: 'csv' | 'xlsx' | 'pdf' = 'csv') => {
    try {
      const response = await invitationService.exportRecruitmentResults(examId!, format);

      // Create blob and download
      const blob = new Blob([response.data], {
        type: format === 'pdf' ? 'application/pdf' : 'text/csv',
      });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `recruitment-results-${examId}.${format}`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);

      toast.success(`Results exported as ${format.toUpperCase()}`);
    } catch (err: any) {
      console.error('Failed to export:', err);
      toast.error(err.response?.data?.message || 'Failed to export results');
    }
  };

  const getStatusBadge = (status: InvitationStatus) => {
    const config = {
      [InvitationStatus.COMPLETED]: { color: 'bg-green-100 text-green-800 border-green-300', icon: CheckCircle },
      [InvitationStatus.PENDING]: { color: 'bg-blue-100 text-blue-800 border-blue-300', icon: Mail },
      [InvitationStatus.ACCESSED]: { color: 'bg-yellow-100 text-yellow-800 border-yellow-300', icon: Clock },
      [InvitationStatus.STARTED]: { color: 'bg-purple-100 text-purple-800 border-purple-300', icon: Clock },
      [InvitationStatus.EXPIRED]: { color: 'bg-red-100 text-red-800 border-red-300', icon: XCircle },
      [InvitationStatus.REVOKED]: { color: 'bg-gray-100 text-gray-800 border-gray-300', icon: XCircle },
    };

    const { color, icon: Icon } = config[status] || config[InvitationStatus.PENDING];

    return (
      <Badge variant="outline" className={`${color} flex items-center gap-1`}>
        <Icon className="w-3 h-3" />
        {status}
      </Badge>
    );
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-primary border-r-transparent" />
          <p className="mt-2 text-sm text-muted-foreground">Loading results...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-6">
      {/* Header */}
      <div className="mb-6">
        <Button
          variant="ghost"
          onClick={() => navigate(-1)}
          className="mb-4"
        >
          ← Back
        </Button>
        <h1 className="text-3xl font-bold tracking-tight">Recruitment Results</h1>
        <p className="text-muted-foreground mt-1">
          View and manage recruitment candidates
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-6">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Total Invited
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalInvited}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Completed
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{stats.completed}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Pending
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">{stats.pending}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Expired
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{stats.expired}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Average Score
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-purple-600">
              {stats.averageScore ? `${stats.averageScore.toFixed(1)}%` : 'N/A'}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Actions and Filters */}
      <Card className="mb-6">
        <CardContent className="pt-6">
          <div className="flex flex-col md:flex-row gap-4">
            {/* Search */}
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search by name or email..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-9"
                />
              </div>
            </div>

            {/* Status Filter */}
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-full md:w-[180px]">
                <Filter className="h-4 w-4 mr-2" />
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Statuses</SelectItem>
                <SelectItem value={InvitationStatus.COMPLETED}>Completed</SelectItem>
                <SelectItem value={InvitationStatus.PENDING}>Pending</SelectItem>
                <SelectItem value={InvitationStatus.ACCESSED}>Accessed</SelectItem>
                <SelectItem value={InvitationStatus.STARTED}>Started</SelectItem>
                <SelectItem value={InvitationStatus.EXPIRED}>Expired</SelectItem>
              </SelectContent>
            </Select>

            {/* Sort By */}
            <Select value={sortBy} onValueChange={(value) => setSortBy(value as any)}>
              <SelectTrigger className="w-full md:w-[180px]">
                <SelectValue placeholder="Sort by" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="score">Score (High to Low)</SelectItem>
                <SelectItem value="name">Name (A-Z)</SelectItem>
                <SelectItem value="email">Email (A-Z)</SelectItem>
                <SelectItem value="date">Date (Recent First)</SelectItem>
              </SelectContent>
            </Select>

            {/* Export */}
            <Select onValueChange={(format) => handleExport(format as any)}>
              <SelectTrigger className="w-full md:w-[180px]">
                <Download className="h-4 w-4 mr-2" />
                <SelectValue placeholder="Export" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="csv">Export as CSV</SelectItem>
                <SelectItem value="xlsx">Export as Excel</SelectItem>
                <SelectItem value="pdf">Export as PDF</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Bulk Actions */}
          {selectedResults.size > 0 && (
            <div className="mt-4 flex gap-2">
              <Alert className="flex-1">
                <AlertDescription>
                  {selectedResults.size} candidate(s) selected
                </AlertDescription>
              </Alert>
              <Button onClick={handleShortlist} variant="default" className="bg-green-600 hover:bg-green-700">
                <CheckCircle className="h-4 w-4 mr-2" />
                Shortlist
              </Button>
              <Button onClick={handleReject} variant="destructive">
                <XCircle className="h-4 w-4 mr-2" />
                Reject
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Results Table */}
      <Card>
        <CardHeader>
          <CardTitle>Candidates ({filteredResults.length})</CardTitle>
          <CardDescription>
            {statusFilter !== 'all' ? `Filtered by: ${statusFilter}` : 'All candidates'}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-12">
                    <Checkbox
                      checked={selectedResults.size === filteredResults.length && filteredResults.length > 0}
                      onCheckedChange={handleSelectAll}
                    />
                  </TableHead>
                  <TableHead>Name</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Phone</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Score</TableHead>
                  <TableHead className="text-right">Percentage</TableHead>
                  <TableHead className="text-center">Rank</TableHead>
                  <TableHead className="text-center">Decision</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredResults.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={9} className="text-center py-8 text-muted-foreground">
                      No candidates found
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredResults.map((result) => (
                    <TableRow key={result.invitationId}>
                      <TableCell>
                        <Checkbox
                          checked={selectedResults.has(result.invitationId)}
                          onCheckedChange={() => handleToggleSelect(result.invitationId)}
                        />
                      </TableCell>
                      <TableCell className="font-medium">{result.candidateName}</TableCell>
                      <TableCell>{result.candidateEmail}</TableCell>
                      <TableCell className="text-sm text-muted-foreground">
                        {result.candidatePhone || 'N/A'}
                      </TableCell>
                      <TableCell>{getStatusBadge(result.status)}</TableCell>
                      <TableCell className="text-right">
                        {result.score !== undefined && result.score !== null ? result.score : '-'}
                      </TableCell>
                      <TableCell className="text-right">
                        {result.percentage !== undefined && result.percentage !== null ? `${result.percentage.toFixed(1)}%` : '-'}
                      </TableCell>
                      <TableCell className="text-center">
                        {result.rank !== undefined ? (
                          <Badge variant="outline" className="bg-purple-50 text-purple-700 border-purple-300">
                            #{result.rank}
                          </Badge>
                        ) : (
                          '-'
                        )}
                      </TableCell>
                      <TableCell className="text-center">
                        {result.shortlisted !== undefined ? (
                          result.shortlisted ? (
                            <Badge className="bg-green-100 text-green-800 border-green-300">
                              Shortlisted
                            </Badge>
                          ) : (
                            <Badge variant="outline" className="bg-gray-100 text-gray-600">
                              Not Shortlisted
                            </Badge>
                          )
                        ) : (
                          '-'
                        )}
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
