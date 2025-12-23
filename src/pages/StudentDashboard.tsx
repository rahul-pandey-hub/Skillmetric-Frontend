import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import {
  Clock,
  FileText,
  CheckCircle,
  Calendar,
  Lock,
  Play,
  Info,
  User,
  History,
  Trophy,
  TrendingUp,
  Loader2,
  AlertCircle,
} from 'lucide-react';
import { toast } from 'sonner';
import { useAuthStore } from '../store/authStore';
import api from '../services/api';

interface StudentExam {
  _id: string;
  title: string;
  code: string;
  description?: string;
  duration: number;
  status: string;
  schedule: {
    startDate: string;
    endDate: string;
  };
  proctoringSettings: any;
  grading: {
    totalMarks: number;
    passingMarks: number;
  };
  attemptStatus: string;
  attempts: number;
  canAttempt: boolean;
  examStatus: string;
}

const StudentDashboard = () => {
  const { user } = useAuthStore();
  const navigate = useNavigate();
  const location = useLocation();

  const [exams, setExams] = useState<StudentExam[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedExam, setSelectedExam] = useState<StudentExam | null>(null);
  const [examAccess, setExamAccess] = useState<any>(null);
  const [showInstructionsDialog, setShowInstructionsDialog] = useState(false);

  useEffect(() => {
    fetchExams();

    // Check if redirected with exam result
    if (location.state?.examResult) {
      const result = location.state.examResult;
      if (result.passed) {
        toast.success(`Congratulations! You passed with ${result.score}/${result.totalMarks}`);
      } else {
        toast.info(`Exam submitted. Score: ${result.score}/${result.totalMarks}`);
      }
    }
  }, []);

  const fetchExams = async () => {
    try {
      const response = await api.get('/student/exams');
      setExams(response.data.data);
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to load exams');
    } finally {
      setLoading(false);
    }
  };

  const handleStartExam = async (exam: StudentExam) => {
    try {
      const response = await api.get(`/student/exams/${exam._id}/access`);
      setExamAccess(response.data);
      setSelectedExam(exam);

      if (response.data.canStart) {
        setShowInstructionsDialog(true);
      } else {
        toast.warning(response.data.reason);
      }
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to access exam');
    }
  };

  const confirmStartExam = () => {
    setShowInstructionsDialog(false);
    if (selectedExam) {
      navigate(`/student/exam/${selectedExam._id}`);
    }
  };

  const getExamStatusVariant = (status: string): 'default' | 'secondary' | 'success' | 'destructive' | 'outline' => {
    switch (status) {
      case 'active':
        return 'success';
      case 'upcoming':
        return 'secondary';
      case 'expired':
        return 'destructive';
      default:
        return 'default';
    }
  };

  const getAttemptStatusVariant = (status: string): 'default' | 'secondary' | 'success' | 'destructive' => {
    switch (status) {
      case 'completed':
        return 'success';
      case 'in_progress':
        return 'secondary';
      default:
        return 'default';
    }
  };

  if (loading) {
    return (
      <div className="container max-w-7xl mx-auto px-4 py-8">
        <div className="flex flex-col items-center justify-center min-h-[400px]">
          <Loader2 className="w-12 h-12 animate-spin text-primary mb-4" />
          <p className="text-lg text-muted-foreground">Loading exams...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container max-w-7xl mx-auto px-4 py-8">
      <div className="space-y-8">
        {/* Header */}
        <div>
          <h1 className="text-4xl font-bold mb-2">Student Dashboard</h1>
          <p className="text-lg text-muted-foreground">
            Welcome, {user?.fullName || user?.email}
          </p>
        </div>

        {/* Quick Navigation Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card
            className="cursor-pointer transition-all hover:shadow-lg hover:-translate-y-1"
            onClick={() => navigate('/student/profile')}
          >
            <CardContent className="pt-6 text-center">
              <User className="w-12 h-12 mx-auto mb-3 text-primary" />
              <h3 className="text-lg font-semibold mb-1">My Profile</h3>
              <p className="text-sm text-muted-foreground">View & edit profile</p>
            </CardContent>
          </Card>

          <Card
            className="cursor-pointer transition-all hover:shadow-lg hover:-translate-y-1"
            onClick={() => navigate('/student/history')}
          >
            <CardContent className="pt-6 text-center">
              <History className="w-12 h-12 mx-auto mb-3 text-blue-500" />
              <h3 className="text-lg font-semibold mb-1">Exam History</h3>
              <p className="text-sm text-muted-foreground">View past attempts</p>
            </CardContent>
          </Card>

          <Card className="cursor-pointer transition-all hover:shadow-lg hover:-translate-y-1">
            <CardContent className="pt-6 text-center">
              <Trophy className="w-12 h-12 mx-auto mb-3 text-amber-500" />
              <h3 className="text-lg font-semibold mb-1">Achievements</h3>
              <p className="text-sm text-muted-foreground">
                {exams.filter(e => e.attemptStatus === 'completed').length} completed
              </p>
            </CardContent>
          </Card>

          <Card className="cursor-pointer transition-all hover:shadow-lg hover:-translate-y-1">
            <CardContent className="pt-6 text-center">
              <TrendingUp className="w-12 h-12 mx-auto mb-3 text-green-500" />
              <h3 className="text-lg font-semibold mb-1">Progress</h3>
              <p className="text-sm text-muted-foreground">{exams.length} total exams</p>
            </CardContent>
          </Card>
        </div>

        {/* Exams Section */}
        <Card>
          <CardHeader>
            <CardTitle className="text-2xl">My Exams</CardTitle>
          </CardHeader>
          <CardContent>
            {exams.length === 0 ? (
              <div className="flex items-center gap-2 p-4 rounded-lg bg-blue-50 border border-blue-200 text-blue-800">
                <Info className="h-5 w-5 flex-shrink-0" />
                <p className="text-sm">
                  You are not enrolled in any exams at the moment. Please check back later or contact your administrator.
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                {exams.map((exam) => (
                  <Card key={exam._id} className="shadow-sm">
                    <CardHeader>
                      <div className="flex justify-between items-start mb-2">
                        <CardTitle className="text-xl">{exam.title}</CardTitle>
                        <Badge variant={getExamStatusVariant(exam.examStatus)}>
                          {exam.examStatus}
                        </Badge>
                      </div>
                      {exam.description && (
                        <CardDescription>{exam.description}</CardDescription>
                      )}
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Clock className="w-4 h-4" />
                        <span>Duration: {exam.duration} minutes</span>
                      </div>

                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <FileText className="w-4 h-4" />
                        <span>
                          Total Marks: {exam.grading.totalMarks} | Passing: {exam.grading.passingMarks}
                        </span>
                      </div>

                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Calendar className="w-4 h-4" />
                        <span className="text-xs">
                          {new Date(exam.schedule.startDate).toLocaleString()} -{' '}
                          {new Date(exam.schedule.endDate).toLocaleString()}
                        </span>
                      </div>

                      <div className="flex gap-2 flex-wrap">
                        {exam.attemptStatus !== 'not_started' && (
                          <Badge variant={getAttemptStatusVariant(exam.attemptStatus)}>
                            {exam.attemptStatus === 'completed' ? 'Completed' : 'In Progress'}
                          </Badge>
                        )}

                        {exam.proctoringSettings.enabled && (
                          <Badge variant="outline" className="gap-1">
                            <Lock className="w-3 h-3" />
                            Proctored
                          </Badge>
                        )}
                      </div>
                    </CardContent>
                    <CardFooter>
                      {exam.attemptStatus === 'completed' ? (
                        <Button
                          className="w-full"
                          variant="default"
                          onClick={() => navigate(`/student/results/${exam._id}`)}
                        >
                          <CheckCircle className="mr-2 h-4 w-4" />
                          View Results
                        </Button>
                      ) : (
                        <Button
                          className="w-full"
                          onClick={() => handleStartExam(exam)}
                          disabled={!exam.canAttempt && exam.examStatus !== 'active'}
                        >
                          {exam.canAttempt ? (
                            <>
                              <Play className="mr-2 h-4 w-4" />
                              Start Exam
                            </>
                          ) : (
                            <>
                              <Info className="mr-2 h-4 w-4" />
                              View Info
                            </>
                          )}
                        </Button>
                      )}
                    </CardFooter>
                  </Card>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Instructions Dialog */}
        <Dialog open={showInstructionsDialog} onOpenChange={setShowInstructionsDialog}>
          <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="text-2xl">Exam Instructions</DialogTitle>
              <DialogDescription>{selectedExam?.title}</DialogDescription>
            </DialogHeader>

            {examAccess?.instructions && (
              <div className="space-y-4">
                <div className="flex items-start gap-2 p-4 rounded-lg bg-blue-50 border border-blue-200">
                  <Info className="h-5 w-5 flex-shrink-0 text-blue-600 mt-0.5" />
                  <div className="space-y-1 text-sm">
                    <p><strong>Duration:</strong> {examAccess.instructions.duration} minutes</p>
                    <p><strong>Total Questions:</strong> {examAccess.instructions.totalQuestions}</p>
                  </div>
                </div>

                {examAccess.instructions.proctoringEnabled && (
                  <div className="flex items-start gap-2 p-4 rounded-lg bg-amber-50 border border-amber-200">
                    <AlertCircle className="h-5 w-5 flex-shrink-0 text-amber-600 mt-0.5" />
                    <div className="space-y-2 text-sm">
                      <p className="font-semibold text-amber-900">This exam is proctored. Please note:</p>
                      <ul className="list-disc list-inside space-y-1 text-amber-800">
                        {examAccess.instructions.requirements.map((req: string, index: number) => (
                          <li key={index}>{req}</li>
                        ))}
                      </ul>
                    </div>
                  </div>
                )}

                <div className="flex items-start gap-2 p-4 rounded-lg bg-green-50 border border-green-200">
                  <CheckCircle className="h-5 w-5 flex-shrink-0 text-green-600 mt-0.5" />
                  <div className="space-y-2 text-sm">
                    <p className="font-semibold text-green-900">General Instructions:</p>
                    <ul className="list-disc list-inside space-y-1 text-green-800">
                      <li>Read each question carefully before answering</li>
                      <li>Your answers are auto-saved every 30 seconds</li>
                      <li>You can navigate between questions freely</li>
                      <li>Flag questions you want to review later</li>
                      <li>Submit your exam before time runs out</li>
                    </ul>
                  </div>
                </div>
              </div>
            )}

            <DialogFooter>
              <Button variant="outline" onClick={() => setShowInstructionsDialog(false)}>
                Cancel
              </Button>
              <Button onClick={confirmStartExam}>
                <Play className="mr-2 h-4 w-4" />
                I Understand, Start Exam
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
};

export default StudentDashboard;
