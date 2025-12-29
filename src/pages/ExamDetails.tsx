import { useEffect, useState } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { ArrowLeft, Edit, Plus, Loader2, AlertCircle, CheckCircle } from 'lucide-react';
import { examService } from '../services/examService';
import { Exam, ExamStatus, ExamAccessMode, ExamCategory } from '../types/exam';
import BulkStudentUpload from '../components/BulkStudentUpload';
import InvitationManagement from '../components/InvitationManagement';

const ExamDetails = () => {
  const { examId } = useParams<{ examId: string }>();
  const navigate = useNavigate();
  const location = useLocation();

  const [exam, setExam] = useState<Exam | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Determine base path from current location (org-admin, recruiter, or admin)
  const basePath = location.pathname.includes('/org-admin')
    ? '/org-admin'
    : location.pathname.includes('/recruiter')
    ? '/recruiter'
    : '/admin';

  useEffect(() => {
    fetchExam();
  }, [examId]);

  const fetchExam = async () => {
    try {
      setLoading(true);
      const response = await examService.getExamById(examId!);
      console.log('Exam data received:', response.data);
      console.log('Access Mode:', response.data.accessMode);
      console.log('Category:', response.data.category);
      setExam(response.data);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to load exam');
    } finally {
      setLoading(false);
    }
  };

  const getStatusVariant = (status: ExamStatus): 'default' | 'secondary' | 'success' | 'destructive' | 'outline' => {
    switch (status) {
      case ExamStatus.DRAFT:
        return 'secondary';
      case ExamStatus.PUBLISHED:
      case ExamStatus.ACTIVE:
        return 'success';
      case ExamStatus.COMPLETED:
        return 'outline';
      case ExamStatus.ARCHIVED:
        return 'destructive';
      default:
        return 'default';
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const handleStudentUpload = async (students: { name: string; email: string }[]) => {
    try {
      setError('');
      setSuccess('');
      const response = await examService.enrollStudents(examId!, students);
      const { summary, details } = response.data;

      console.log('Enrollment response:', response.data);

      if (summary.errors > 0) {
        const errorMessages = details.errors.map((err: any) =>
          `${err.name} (${err.email}): ${err.error}`
        ).join('; ');

        setError(
          `Enrollment partially failed. ${summary.enrolled} enrolled, ${summary.errors} errors. ` +
          `Errors: ${errorMessages}`
        );
      }

      if (summary.enrolled > 0 || summary.created > 0) {
        setSuccess(
          `Successfully enrolled ${summary.enrolled} students. ` +
          `${summary.created > 0 ? `Created ${summary.created} new accounts. ` : ''}` +
          `${summary.alreadyEnrolled > 0 ? `${summary.alreadyEnrolled} already enrolled. ` : ''}`
        );
      }

      fetchExam();
    } catch (err: any) {
      console.error('Enrollment error:', err);
      setError(err.response?.data?.message || 'Failed to enroll students');
    }
  };

  if (loading) {
    return (
      <div className="container max-w-6xl mx-auto px-4 py-8">
        <div className="flex justify-center items-center min-h-[400px]">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      </div>
    );
  }

  if (!exam) {
    return (
      <div className="container max-w-6xl mx-auto px-4 py-8">
        <div className="flex items-center gap-2 p-4 rounded-lg bg-destructive/10 border border-destructive/20 text-destructive">
          <AlertCircle className="h-5 w-5 flex-shrink-0" />
          <p>{error || 'Exam not found'}</p>
        </div>
      </div>
    );
  }

  const questions = Array.isArray(exam.questions) ? exam.questions : [];

  return (
    <div className="container max-w-6xl mx-auto px-4 py-8">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button variant="ghost" onClick={() => navigate(`${basePath}/exams`)}>
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back
            </Button>
            <h1 className="text-3xl font-bold">{exam.title}</h1>
            {exam.category && (
              <Badge variant={exam.category === ExamCategory.RECRUITMENT ? 'default' : 'secondary'}>
                {exam.category === ExamCategory.RECRUITMENT
                  ? 'Recruitment'
                  : exam.category === ExamCategory.INTERNAL_ASSESSMENT
                  ? 'Internal Assessment'
                  : 'General Assessment'}
              </Badge>
            )}
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => navigate(`${basePath}/exams/${examId}/results`)}>
              View Results & Analytics
            </Button>
            {exam.category === ExamCategory.RECRUITMENT && (
              <Button variant="outline" onClick={() => navigate(`${basePath}/exams/${examId}/recruitment-results`)}>
                View Recruitment Results
              </Button>
            )}
            <Button onClick={() => navigate(`${basePath}/exams/${examId}/edit`)}>
              <Edit className="mr-2 h-4 w-4" />
              Manage Questions
            </Button>
          </div>
        </div>

        {/* Alerts */}
        {error && (
          <div className="flex items-center gap-2 p-4 rounded-lg bg-destructive/10 border border-destructive/20 text-destructive">
            <AlertCircle className="h-5 w-5 flex-shrink-0" />
            <p className="text-sm">{error}</p>
          </div>
        )}
        {success && (
          <div className="flex items-center gap-2 p-4 rounded-lg bg-success/10 border border-success/30 text-success-foreground">
            <CheckCircle className="h-5 w-5 flex-shrink-0" />
            <p className="text-sm">{success}</p>
          </div>
        )}

        {/* Basic Info */}
        <Card>
          <CardHeader>
            <CardTitle>Basic Information</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <p className="text-sm text-muted-foreground mb-1">Exam Code</p>
                <p className="text-base font-medium">{exam.code}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground mb-1">Status</p>
                <Badge variant={getStatusVariant(exam.status)}>{exam.status}</Badge>
              </div>
              <div>
                <p className="text-sm text-muted-foreground mb-1">Duration</p>
                <p className="text-base font-medium">{exam.duration} minutes</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground mb-1">Questions</p>
                <p className="text-base font-medium">{questions.length} questions</p>
              </div>
              {exam.accessMode && (
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Access Mode</p>
                  <Badge variant="outline">
                    {exam.accessMode === ExamAccessMode.ENROLLMENT_BASED
                      ? 'Enrollment Based'
                      : exam.accessMode === ExamAccessMode.INVITATION_BASED
                      ? 'Invitation Based'
                      : 'Hybrid (Both)'}
                  </Badge>
                </div>
              )}
              {exam.description && (
                <div className="md:col-span-2">
                  <p className="text-sm text-muted-foreground mb-1">Description</p>
                  <p className="text-base">{exam.description}</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Schedule */}
        <Card>
          <CardHeader>
            <CardTitle>Schedule</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <p className="text-sm text-muted-foreground mb-1">Start Date</p>
                <p className="text-base font-medium">{formatDate(exam.schedule.startDate)}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground mb-1">End Date</p>
                <p className="text-base font-medium">{formatDate(exam.schedule.endDate)}</p>
              </div>
              <div className="md:col-span-2">
                <p className="text-sm text-muted-foreground mb-1">Late Submission</p>
                <p className="text-base font-medium">
                  {exam.schedule.lateSubmissionAllowed ? 'Allowed' : 'Not Allowed'}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Grading */}
        <Card>
          <CardHeader>
            <CardTitle>Grading Configuration</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <p className="text-sm text-muted-foreground mb-1">Total Marks</p>
                <p className="text-base font-medium">{exam.grading.totalMarks}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground mb-1">Passing Marks</p>
                <p className="text-base font-medium">{exam.grading.passingMarks}</p>
              </div>
              <div className="md:col-span-2">
                <p className="text-sm text-muted-foreground mb-1">Negative Marking</p>
                <p className="text-base font-medium">
                  {exam.grading.negativeMarking
                    ? `Yes (${exam.grading.negativeMarkValue} per wrong answer)`
                    : 'No'}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Enrolled Students - Show only for enrollment-based exams */}
        {(exam.accessMode === ExamAccessMode.ENROLLMENT_BASED || exam.accessMode === ExamAccessMode.HYBRID || !exam.accessMode) && (
          <Card>
            <CardHeader>
              <div className="flex justify-between items-center">
                <CardTitle>Enrolled Students ({exam.enrolledStudents?.length || 0})</CardTitle>
                <BulkStudentUpload examId={examId!} onUploadComplete={handleStudentUpload} />
              </div>
            </CardHeader>
            <CardContent>
              {(!exam.enrolledStudents || exam.enrolledStudents.length === 0) ? (
                <div className="text-center py-8">
                  <p className="text-muted-foreground mb-2">No students enrolled yet</p>
                  <p className="text-sm text-muted-foreground">
                    Use the "Bulk Upload Students" button to enroll students via Excel/CSV file
                  </p>
                </div>
              ) : (
                <p className="text-muted-foreground">
                  {exam.enrolledStudents.length} student{exam.enrolledStudents.length !== 1 ? 's' : ''} enrolled
                </p>
              )}
            </CardContent>
          </Card>
        )}

        {/* Invitation Management - Show only for invitation-based exams */}
        {(exam.accessMode === ExamAccessMode.INVITATION_BASED || exam.accessMode === ExamAccessMode.HYBRID) && (
          <InvitationManagement
            examId={examId!}
            examTitle={exam.title}
            onInvitationsSent={fetchExam}
          />
        )}

        {/* Questions */}
        <Card>
          <CardHeader>
            <div className="flex justify-between items-center">
              <CardTitle>Questions ({questions.length})</CardTitle>
              <Button
                variant="outline"
                size="sm"
                onClick={() => navigate(`${basePath}/exams/${examId}/edit`)}
              >
                <Plus className="mr-2 h-4 w-4" />
                Add Questions
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            {questions.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-muted-foreground mb-4">No questions added yet</p>
                <Button onClick={() => navigate(`${basePath}/exams/${examId}/edit`)}>
                  <Plus className="mr-2 h-4 w-4" />
                  Add Questions
                </Button>
              </div>
            ) : (
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-12">#</TableHead>
                      <TableHead>Question</TableHead>
                      <TableHead>Type</TableHead>
                      <TableHead>Difficulty</TableHead>
                      <TableHead className="text-right">Marks</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {questions.map((question: any, index) => (
                      <TableRow key={question._id || index}>
                        <TableCell className="font-medium">{index + 1}</TableCell>
                        <TableCell>{question.questionText || 'N/A'}</TableCell>
                        <TableCell>
                          <Badge variant="outline">{question.type || 'N/A'}</Badge>
                        </TableCell>
                        <TableCell>
                          <Badge variant="secondary">{question.difficulty || 'N/A'}</Badge>
                        </TableCell>
                        <TableCell className="text-right">{question.marks || 0}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default ExamDetails;
