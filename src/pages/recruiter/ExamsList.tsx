import { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useExams } from '@/hooks/useExams';
import { examService } from '@/services/examService';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Search,
  Plus,
  Eye,
  Edit,
  Trash2,
  Copy,
  MoreVertical,
  Filter,
  Calendar,
  Users,
  FileText,
} from 'lucide-react';
import { motion } from 'framer-motion';
import { formatDistanceToNow } from 'date-fns';

type ExamStatus = 'draft' | 'active' | 'scheduled' | 'completed' | 'archived';

export default function ExamsList() {
  const navigate = useNavigate();
  const location = useLocation();
  const { data: exams, isLoading, refetch } = useExams();
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | ExamStatus>('all');
  const [deletingId, setDeletingId] = useState<string | null>(null);

  // Determine base path from current location (org-admin or recruiter)
  const basePath = location.pathname.includes('/org-admin')
    ? '/org-admin'
    : '/recruiter';

  const handleDeleteExam = async (examId: string, examTitle: string) => {
    if (!window.confirm(`Are you sure you want to delete "${examTitle}"?\n\nThis action cannot be undone.`)) {
      return;
    }

    try {
      setDeletingId(examId);
      await examService.deleteExam(examId);

      // Show success message
      alert('Exam deleted successfully!');

      // Refresh the exam list
      refetch();
    } catch (error: any) {
      console.error('Delete error:', error);
      alert(error.response?.data?.message || 'Failed to delete exam. Please try again.');
    } finally {
      setDeletingId(null);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'bg-success-100 text-success-700 border-success-200';
      case 'scheduled':
        return 'bg-blue-100 text-blue-700 border-blue-200';
      case 'completed':
        return 'bg-gray-100 text-gray-700 border-gray-200';
      case 'draft':
        return 'bg-warning-100 text-warning-700 border-warning-200';
      case 'archived':
        return 'bg-gray-100 text-gray-600 border-gray-200';
      default:
        return 'bg-gray-100 text-gray-700 border-gray-200';
    }
  };

  const filteredExams = exams?.filter((exam: any) => {
    const matchesSearch =
      exam.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      exam.category?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || exam.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const stats = [
    {
      label: 'Total Exams',
      value: exams?.length || 0,
      icon: FileText,
      color: 'text-primary-600',
      bgColor: 'bg-primary-100',
    },
    {
      label: 'Active',
      value: exams?.filter((e: any) => e.status === 'active').length || 0,
      icon: Eye,
      color: 'text-success-600',
      bgColor: 'bg-success-100',
    },
    {
      label: 'Scheduled',
      value: exams?.filter((e: any) => e.status === 'scheduled').length || 0,
      icon: Calendar,
      color: 'text-blue-600',
      bgColor: 'bg-blue-100',
    },
    {
      label: 'Completed',
      value: exams?.filter((e: any) => e.status === 'completed').length || 0,
      icon: Users,
      color: 'text-gray-600',
      bgColor: 'bg-gray-100',
    },
  ];

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Exams</h1>
          <p className="text-gray-600 mt-2">Manage all your assessments and exams</p>
        </div>
        <Button onClick={() => navigate(`${basePath}/exams/create`)} className="gap-2">
          <Plus className="w-4 h-4" />
          Create Exam
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {stats.map((stat, index) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
          >
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">{stat.label}</p>
                    <p className="text-2xl font-bold text-gray-900 mt-1">{stat.value}</p>
                  </div>
                  <div className={`p-3 rounded-lg ${stat.bgColor}`}>
                    <stat.icon className={`w-6 h-6 ${stat.color}`} />
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      {/* Filters and Search */}
      <Card className="mb-6">
        <CardContent className="p-4">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <Input
                placeholder="Search exams by title or category..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <div className="flex gap-2">
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value as any)}
                className="px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 bg-white"
              >
                <option value="all">All Status</option>
                <option value="draft">Draft</option>
                <option value="active">Active</option>
                <option value="scheduled">Scheduled</option>
                <option value="completed">Completed</option>
                <option value="archived">Archived</option>
              </select>
              <Button variant="outline">
                <Filter className="w-4 h-4 mr-2" />
                More Filters
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Exams Table */}
      <Card>
        <CardHeader>
          <CardTitle>All Exams ({filteredExams?.length || 0})</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="text-center py-12">
              <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-primary border-r-transparent" />
              <p className="mt-2 text-sm text-gray-600">Loading exams...</p>
            </div>
          ) : filteredExams && filteredExams.length > 0 ? (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Title</TableHead>
                    <TableHead>Category</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Duration</TableHead>
                    <TableHead>Questions</TableHead>
                    <TableHead>Created</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredExams.map((exam: any) => (
                    <TableRow key={exam._id || exam.id} className="hover:bg-gray-50">
                      <TableCell className="font-medium">{exam.title}</TableCell>
                      <TableCell className="capitalize">{exam.category || 'N/A'}</TableCell>
                      <TableCell>
                        <Badge className={getStatusColor(exam.status || 'draft')}>
                          {exam.status || 'draft'}
                        </Badge>
                      </TableCell>
                      <TableCell>{exam.duration || 0} min</TableCell>
                      <TableCell>{exam.questions?.length || 0}</TableCell>
                      <TableCell className="text-sm text-gray-600">
                        {exam.createdAt
                          ? formatDistanceToNow(new Date(exam.createdAt), { addSuffix: true })
                          : 'N/A'}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => navigate(`${basePath}/exams/${exam._id || exam.id}`)}
                            title="View Exam Details"
                          >
                            <Eye className="w-4 h-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => navigate(`${basePath}/exams/${exam._id || exam.id}/edit`)}
                            title="Manage Questions"
                          >
                            <Edit className="w-4 h-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            title="Duplicate Exam (Coming Soon)"
                          >
                            <Copy className="w-4 h-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="text-destructive-600 hover:text-destructive-700"
                            onClick={() => handleDeleteExam(exam._id || exam.id, exam.title)}
                            disabled={deletingId === (exam._id || exam.id)}
                            title="Delete Exam"
                          >
                            {deletingId === (exam._id || exam.id) ? (
                              <div className="h-4 w-4 animate-spin rounded-full border-2 border-solid border-current border-r-transparent" />
                            ) : (
                              <Trash2 className="w-4 h-4" />
                            )}
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          ) : (
            <div className="text-center py-12">
              <FileText className="w-12 h-12 text-gray-400 mx-auto mb-3" />
              <p className="text-gray-600 mb-4">No exams found</p>
              <Button onClick={() => navigate(`${basePath}/exams/create`)}>
                <Plus className="w-4 h-4 mr-2" />
                Create Your First Exam
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
