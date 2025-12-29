import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronDown } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import { examService } from '../services/examService';
import { questionsService } from '../services/questionsService';
import { Question } from '../types/question';
import { ExamCategory, ExamAccessMode } from '../types/exam';

interface ProctoringSettings {
  enabled: boolean;
  violationWarningLimit: number;
  webcamRequired: boolean;
  screenRecording: boolean;
  tabSwitchDetection: boolean;
  copyPasteDetection: boolean;
  rightClickDisabled: boolean;
  devToolsDetection: boolean;
  fullscreenRequired: boolean;
  autoSubmitOnViolation: boolean;
}

interface Schedule {
  startDate: string;
  endDate: string;
  lateSubmissionAllowed: boolean;
}

interface Grading {
  totalMarks: number;
  passingMarks: number;
  negativeMarking: boolean;
  negativeMarkValue: number;
}

interface Settings {
  shuffleQuestions: boolean;
  shuffleOptions: boolean;
  showResultsImmediately: boolean;
  allowReview: boolean;
  attemptsAllowed: number;
}

const CreateExam = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [loadingQuestions, setLoadingQuestions] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Questions
  const [allQuestions, setAllQuestions] = useState<Question[]>([]);
  const [selectedQuestions, setSelectedQuestions] = useState<Set<string>>(new Set());

  // Basic Info
  const [title, setTitle] = useState('');
  const [code, setCode] = useState('');
  const [description, setDescription] = useState('');
  const [duration, setDuration] = useState(60);
  const [status, setStatus] = useState('DRAFT');

  // Proctoring Settings
  const [proctoringSettings, setProctoringSettings] = useState<ProctoringSettings>({
    enabled: true,
    violationWarningLimit: 3,
    webcamRequired: true,
    screenRecording: true,
    tabSwitchDetection: true,
    copyPasteDetection: true,
    rightClickDisabled: true,
    devToolsDetection: true,
    fullscreenRequired: true,
    autoSubmitOnViolation: false,
  });

  // Schedule
  const [schedule, setSchedule] = useState<Schedule>({
    startDate: '',
    endDate: '',
    lateSubmissionAllowed: false,
  });

  // Grading
  const [grading, setGrading] = useState<Grading>({
    totalMarks: 100,
    passingMarks: 40,
    negativeMarking: false,
    negativeMarkValue: 0.25,
  });

  // Settings
  const [settings, setSettings] = useState<Settings>({
    shuffleQuestions: true,
    shuffleOptions: true,
    showResultsImmediately: false,
    allowReview: true,
    attemptsAllowed: 1,
  });

  // New: Category and Access Mode
  const [category, setCategory] = useState<ExamCategory>(ExamCategory.GENERAL_ASSESSMENT);
  const [accessMode, setAccessMode] = useState<ExamAccessMode>(ExamAccessMode.ENROLLMENT_BASED);

  // Auto-set accessMode based on category
  useEffect(() => {
    if (category === ExamCategory.RECRUITMENT) {
      setAccessMode(ExamAccessMode.INVITATION_BASED);
    } else {
      setAccessMode(ExamAccessMode.ENROLLMENT_BASED);
    }
  }, [category]);

  // New: Invitation Settings (for INVITATION_BASED or HYBRID)
  const [invitationSettings, setInvitationSettings] = useState({
    linkValidityDays: 7,
    allowMultipleAccess: true,
    maxAccessCount: 10,
    autoExpireOnSubmit: true,
    sendReminderEmails: true,
    reminderBeforeDays: 1,
  });

  // New: Recruitment Result Settings (for RECRUITMENT category)
  const [recruitmentResultSettings, setRecruitmentResultSettings] = useState({
    showScoreToCandidate: false,
    showRankToCandidate: false,
    showOnlyConfirmation: true,
    candidateResultMessage: 'Thank you for completing the assessment. Your responses have been submitted successfully.',
    recruiterCanExport: true,
  });

  const handleProctoringChange = (field: keyof ProctoringSettings, value: boolean | number) => {
    setProctoringSettings({ ...proctoringSettings, [field]: value });
  };

  const handleScheduleChange = (field: keyof Schedule, value: string | boolean) => {
    setSchedule({ ...schedule, [field]: value });
  };

  const handleGradingChange = (field: keyof Grading, value: number | boolean) => {
    setGrading({ ...grading, [field]: value });
  };

  const handleSettingsChange = (field: keyof Settings, value: boolean | number) => {
    setSettings({ ...settings, [field]: value });
  };

  useEffect(() => {
    fetchQuestions();
  }, []);

  const fetchQuestions = async () => {
    try {
      setLoadingQuestions(true);
      const response = await questionsService.getAllQuestions({ isActive: true, limit: 1000 });
      setAllQuestions(response.data.data);
    } catch (err) {
      console.error('Failed to load questions:', err);
    } finally {
      setLoadingQuestions(false);
    }
  };

  const handleToggleQuestion = (questionId: string) => {
    const newSelected = new Set(selectedQuestions);
    if (newSelected.has(questionId)) {
      newSelected.delete(questionId);
    } else {
      newSelected.add(questionId);
    }
    setSelectedQuestions(newSelected);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);

    // Validation
    if (!title || !code || !schedule.startDate || !schedule.endDate) {
      setError('Please fill in all required fields');
      setLoading(false);
      return;
    }

    if (new Date(schedule.startDate) >= new Date(schedule.endDate)) {
      setError('End date must be after start date');
      setLoading(false);
      return;
    }

    if (grading.passingMarks > grading.totalMarks) {
      setError('Passing marks cannot be greater than total marks');
      setLoading(false);
      return;
    }

    try {
      const examData: any = {
        title,
        code,
        description,
        duration,
        status,
        category,
        accessMode,
        proctoringSettings,
        schedule: {
          startDate: new Date(schedule.startDate).toISOString(),
          endDate: new Date(schedule.endDate).toISOString(),
          lateSubmissionAllowed: schedule.lateSubmissionAllowed,
        },
        grading,
        settings,
        questions: Array.from(selectedQuestions),
      };

      // Add invitation settings if access mode supports it
      if (accessMode === ExamAccessMode.INVITATION_BASED || accessMode === ExamAccessMode.HYBRID) {
        examData.invitationSettings = invitationSettings;
      }

      // Add recruitment result settings if category is RECRUITMENT
      if (category === ExamCategory.RECRUITMENT) {
        examData.recruitmentResultSettings = recruitmentResultSettings;
      }

      const response = await examService.createExam(examData);
      setSuccess('Exam created successfully!');

      // Redirect after 2 seconds
      setTimeout(() => {
        navigate('/admin/exams');
      }, 2000);
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || 'Failed to create exam';
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'EASY':
        return 'bg-green-100 text-green-800 border-green-300';
      case 'MEDIUM':
        return 'bg-yellow-100 text-yellow-800 border-yellow-300';
      case 'HARD':
        return 'bg-red-100 text-red-800 border-red-300';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-300';
    }
  };

  return (
    <div className="container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
      <div className="py-4">
        <h1 className="text-3xl font-bold tracking-tight mb-4">Create New Exam</h1>

        {error && (
          <Alert variant="destructive" className="mt-2 mb-2">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}
        {success && (
          <Alert className="mt-2 mb-2 border-green-500 bg-green-50 text-green-900">
            <AlertDescription>{success}</AlertDescription>
          </Alert>
        )}

        <form onSubmit={handleSubmit}>
          {/* Basic Information */}
          <Card className="mt-3">
            <CardHeader>
              <CardTitle>Basic Information</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="border-t pt-4"></div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="title" className="required">Exam Title</Label>
                  <Input
                    id="title"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    required
                    className="mt-1.5"
                  />
                  <p className="text-xs text-muted-foreground mt-1.5">
                    E.g., Data Structures Final Exam
                  </p>
                </div>
                <div>
                  <Label htmlFor="code" className="required">Exam Code</Label>
                  <Input
                    id="code"
                    value={code}
                    onChange={(e) => setCode(e.target.value)}
                    required
                    className="mt-1.5"
                  />
                  <p className="text-xs text-muted-foreground mt-1.5">
                    Unique code for this exam (e.g., DS-FINAL-2024)
                  </p>
                </div>
                <div className="md:col-span-2">
                  <Label htmlFor="description">Description</Label>
                  <textarea
                    id="description"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    rows={3}
                    className="w-full mt-1.5 px-3 py-2 border border-input rounded-md focus:outline-none focus:ring-2 focus:ring-ring resize-none"
                  />
                  <p className="text-xs text-muted-foreground mt-1.5">
                    Brief description of the exam
                  </p>
                </div>
                <div>
                  <Label htmlFor="duration" className="required">Duration (minutes)</Label>
                  <Input
                    id="duration"
                    type="number"
                    value={duration}
                    onChange={(e) => setDuration(Number(e.target.value))}
                    required
                    min={1}
                    className="mt-1.5"
                  />
                </div>
                <div>
                  <Label htmlFor="status">Status</Label>
                  <Select value={status} onValueChange={setStatus}>
                    <SelectTrigger className="mt-1.5">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="DRAFT">Draft</SelectItem>
                      <SelectItem value="PUBLISHED">Published</SelectItem>
                      <SelectItem value="ACTIVE">Active</SelectItem>
                      <SelectItem value="COMPLETED">Completed</SelectItem>
                      <SelectItem value="ARCHIVED">Archived</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Exam Type & Access */}
          <Card className="mt-3">
            <CardHeader>
              <CardTitle>Exam Type & Access</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="border-t pt-4"></div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="category">Exam Category</Label>
                  <Select value={category} onValueChange={(value) => setCategory(value as ExamCategory)}>
                    <SelectTrigger className="mt-1.5">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value={ExamCategory.INTERNAL_ASSESSMENT}>
                        Internal Assessment
                      </SelectItem>
                      <SelectItem value={ExamCategory.RECRUITMENT}>
                        Recruitment
                      </SelectItem>
                      <SelectItem value={ExamCategory.GENERAL_ASSESSMENT}>
                        General Assessment
                      </SelectItem>
                    </SelectContent>
                  </Select>
                  <p className="text-xs text-muted-foreground mt-1.5">
                    {category === ExamCategory.INTERNAL_ASSESSMENT && 'For internal employees/students'}
                    {category === ExamCategory.RECRUITMENT && 'For recruitment candidates (one-time access)'}
                    {category === ExamCategory.GENERAL_ASSESSMENT && 'For registered external candidates'}
                  </p>
                </div>
                <div>
                  <Label htmlFor="accessMode">Access Mode</Label>
                  <Select value={accessMode} onValueChange={(value) => setAccessMode(value as ExamAccessMode)}>
                    <SelectTrigger className="mt-1.5">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value={ExamAccessMode.ENROLLMENT_BASED}>
                        Enrollment Based
                      </SelectItem>
                      <SelectItem value={ExamAccessMode.INVITATION_BASED}>
                        Invitation Based
                      </SelectItem>
                      <SelectItem value={ExamAccessMode.HYBRID}>
                        Hybrid (Both)
                      </SelectItem>
                    </SelectContent>
                  </Select>
                  <p className="text-xs text-muted-foreground mt-1.5">
                    {accessMode === ExamAccessMode.ENROLLMENT_BASED && 'Students must be enrolled'}
                    {accessMode === ExamAccessMode.INVITATION_BASED && 'Access via unique invitation links'}
                    {accessMode === ExamAccessMode.HYBRID && 'Both enrollment and invitation allowed'}
                  </p>
                </div>
              </div>

              {/* Invitation Settings */}
              {(accessMode === ExamAccessMode.INVITATION_BASED || accessMode === ExamAccessMode.HYBRID) && (
                <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                  <h4 className="font-semibold text-sm mb-4 text-blue-900">Invitation Settings</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="linkValidityDays">Link Validity (Days)</Label>
                      <Input
                        id="linkValidityDays"
                        type="number"
                        min={1}
                        max={365}
                        value={invitationSettings.linkValidityDays}
                        onChange={(e) => setInvitationSettings({
                          ...invitationSettings,
                          linkValidityDays: Number(e.target.value)
                        })}
                        className="mt-1.5"
                      />
                    </div>
                    <div>
                      <Label htmlFor="maxAccessCount">Max Access Count</Label>
                      <Input
                        id="maxAccessCount"
                        type="number"
                        min={1}
                        max={100}
                        value={invitationSettings.maxAccessCount}
                        onChange={(e) => setInvitationSettings({
                          ...invitationSettings,
                          maxAccessCount: Number(e.target.value)
                        })}
                        className="mt-1.5"
                      />
                    </div>
                    <div className="flex items-center justify-between">
                      <Label htmlFor="allowMultipleAccess">Allow Multiple Access</Label>
                      <Switch
                        id="allowMultipleAccess"
                        checked={invitationSettings.allowMultipleAccess}
                        onCheckedChange={(checked) => setInvitationSettings({
                          ...invitationSettings,
                          allowMultipleAccess: checked
                        })}
                      />
                    </div>
                    <div className="flex items-center justify-between">
                      <Label htmlFor="autoExpireOnSubmit">Auto-expire on Submit</Label>
                      <Switch
                        id="autoExpireOnSubmit"
                        checked={invitationSettings.autoExpireOnSubmit}
                        onCheckedChange={(checked) => setInvitationSettings({
                          ...invitationSettings,
                          autoExpireOnSubmit: checked
                        })}
                      />
                    </div>
                    <div className="flex items-center justify-between">
                      <Label htmlFor="sendReminderEmails">Send Reminder Emails</Label>
                      <Switch
                        id="sendReminderEmails"
                        checked={invitationSettings.sendReminderEmails}
                        onCheckedChange={(checked) => setInvitationSettings({
                          ...invitationSettings,
                          sendReminderEmails: checked
                        })}
                      />
                    </div>
                    {invitationSettings.sendReminderEmails && (
                      <div>
                        <Label htmlFor="reminderBeforeDays">Reminder Before (Days)</Label>
                        <Input
                          id="reminderBeforeDays"
                          type="number"
                          min={1}
                          max={30}
                          value={invitationSettings.reminderBeforeDays}
                          onChange={(e) => setInvitationSettings({
                            ...invitationSettings,
                            reminderBeforeDays: Number(e.target.value)
                          })}
                          className="mt-1.5"
                        />
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Recruitment Result Settings */}
              {category === ExamCategory.RECRUITMENT && (
                <div className="mt-6 p-4 bg-purple-50 border border-purple-200 rounded-lg">
                  <h4 className="font-semibold text-sm mb-4 text-purple-900">Recruitment Result Settings</h4>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <Label htmlFor="showScoreToCandidate">Show Score to Candidate</Label>
                        <p className="text-xs text-muted-foreground">Display score immediately after submission</p>
                      </div>
                      <Switch
                        id="showScoreToCandidate"
                        checked={recruitmentResultSettings.showScoreToCandidate}
                        onCheckedChange={(checked) => setRecruitmentResultSettings({
                          ...recruitmentResultSettings,
                          showScoreToCandidate: checked,
                          showOnlyConfirmation: !checked,
                        })}
                      />
                    </div>
                    {recruitmentResultSettings.showScoreToCandidate && (
                      <div className="flex items-center justify-between pl-4">
                        <div>
                          <Label htmlFor="showRankToCandidate">Show Rank to Candidate</Label>
                          <p className="text-xs text-muted-foreground">Display rank among all candidates</p>
                        </div>
                        <Switch
                          id="showRankToCandidate"
                          checked={recruitmentResultSettings.showRankToCandidate}
                          onCheckedChange={(checked) => setRecruitmentResultSettings({
                            ...recruitmentResultSettings,
                            showRankToCandidate: checked
                          })}
                        />
                      </div>
                    )}
                    <div>
                      <Label htmlFor="candidateResultMessage">Result Confirmation Message</Label>
                      <textarea
                        id="candidateResultMessage"
                        value={recruitmentResultSettings.candidateResultMessage}
                        onChange={(e) => setRecruitmentResultSettings({
                          ...recruitmentResultSettings,
                          candidateResultMessage: e.target.value
                        })}
                        rows={3}
                        className="w-full mt-1.5 px-3 py-2 border border-input rounded-md focus:outline-none focus:ring-2 focus:ring-ring resize-none"
                        placeholder="Thank you for completing the assessment..."
                      />
                      <p className="text-xs text-muted-foreground mt-1.5">
                        Message shown to candidates after submission
                      </p>
                    </div>
                    <div className="flex items-center justify-between">
                      <div>
                        <Label htmlFor="recruiterCanExport">Allow Recruiter Export</Label>
                        <p className="text-xs text-muted-foreground">Recruiters can export results as CSV</p>
                      </div>
                      <Switch
                        id="recruiterCanExport"
                        checked={recruitmentResultSettings.recruiterCanExport}
                        onCheckedChange={(checked) => setRecruitmentResultSettings({
                          ...recruitmentResultSettings,
                          recruiterCanExport: checked
                        })}
                      />
                    </div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Schedule */}
          <Card className="mt-3">
            <CardHeader>
              <CardTitle>Schedule</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="border-t pt-4"></div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="startDate" className="required">Start Date & Time</Label>
                  <Input
                    id="startDate"
                    type="datetime-local"
                    value={schedule.startDate}
                    onChange={(e) => handleScheduleChange('startDate', e.target.value)}
                    required
                    className="mt-1.5"
                  />
                </div>
                <div>
                  <Label htmlFor="endDate" className="required">End Date & Time</Label>
                  <Input
                    id="endDate"
                    type="datetime-local"
                    value={schedule.endDate}
                    onChange={(e) => handleScheduleChange('endDate', e.target.value)}
                    required
                    className="mt-1.5"
                  />
                </div>
                <div className="md:col-span-2">
                  <div className="flex items-center space-x-2">
                    <Switch
                      id="lateSubmission"
                      checked={schedule.lateSubmissionAllowed}
                      onCheckedChange={(checked) => handleScheduleChange('lateSubmissionAllowed', checked)}
                    />
                    <Label htmlFor="lateSubmission" className="cursor-pointer">
                      Allow Late Submission
                    </Label>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Grading */}
          <Card className="mt-3">
            <CardHeader>
              <CardTitle>Grading Configuration</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="border-t pt-4"></div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="totalMarks" className="required">Total Marks</Label>
                  <Input
                    id="totalMarks"
                    type="number"
                    value={grading.totalMarks}
                    onChange={(e) => handleGradingChange('totalMarks', Number(e.target.value))}
                    required
                    min={0}
                    className="mt-1.5"
                  />
                </div>
                <div>
                  <Label htmlFor="passingMarks" className="required">Passing Marks</Label>
                  <Input
                    id="passingMarks"
                    type="number"
                    value={grading.passingMarks}
                    onChange={(e) => handleGradingChange('passingMarks', Number(e.target.value))}
                    required
                    min={0}
                    className="mt-1.5"
                  />
                </div>
                <div>
                  <div className="flex items-center space-x-2">
                    <Switch
                      id="negativeMarking"
                      checked={grading.negativeMarking}
                      onCheckedChange={(checked) => handleGradingChange('negativeMarking', checked)}
                    />
                    <Label htmlFor="negativeMarking" className="cursor-pointer">
                      Enable Negative Marking
                    </Label>
                  </div>
                </div>
                {grading.negativeMarking && (
                  <div>
                    <Label htmlFor="negativeMarkValue">Negative Mark Value</Label>
                    <Input
                      id="negativeMarkValue"
                      type="number"
                      value={grading.negativeMarkValue}
                      onChange={(e) => handleGradingChange('negativeMarkValue', Number(e.target.value))}
                      min={0}
                      step={0.25}
                      className="mt-1.5"
                    />
                    <p className="text-xs text-muted-foreground mt-1.5">
                      Marks to deduct per wrong answer
                    </p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Proctoring Settings */}
          <Accordion type="single" collapsible className="mt-3 border rounded-lg">
            <AccordionItem value="proctoring">
              <AccordionTrigger className="px-4 text-lg font-semibold">
                Proctoring Settings
              </AccordionTrigger>
              <AccordionContent className="px-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="md:col-span-2">
                    <div className="flex items-center space-x-2">
                      <Switch
                        id="proctoringEnabled"
                        checked={proctoringSettings.enabled}
                        onCheckedChange={(checked) => handleProctoringChange('enabled', checked)}
                      />
                      <Label htmlFor="proctoringEnabled" className="cursor-pointer">
                        Enable Proctoring
                      </Label>
                    </div>
                  </div>
                  {proctoringSettings.enabled && (
                    <>
                      <div>
                        <Label htmlFor="violationWarningLimit">Violation Warning Limit</Label>
                        <Input
                          id="violationWarningLimit"
                          type="number"
                          value={proctoringSettings.violationWarningLimit}
                          onChange={(e) => handleProctoringChange('violationWarningLimit', Number(e.target.value))}
                          min={0}
                          className="mt-1.5"
                        />
                        <p className="text-xs text-muted-foreground mt-1.5">
                          Number of warnings before action
                        </p>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Switch
                          id="webcamRequired"
                          checked={proctoringSettings.webcamRequired}
                          onCheckedChange={(checked) => handleProctoringChange('webcamRequired', checked)}
                        />
                        <Label htmlFor="webcamRequired" className="cursor-pointer">
                          Webcam Required
                        </Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Switch
                          id="screenRecording"
                          checked={proctoringSettings.screenRecording}
                          onCheckedChange={(checked) => handleProctoringChange('screenRecording', checked)}
                        />
                        <Label htmlFor="screenRecording" className="cursor-pointer">
                          Screen Recording
                        </Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Switch
                          id="tabSwitchDetection"
                          checked={proctoringSettings.tabSwitchDetection}
                          onCheckedChange={(checked) => handleProctoringChange('tabSwitchDetection', checked)}
                        />
                        <Label htmlFor="tabSwitchDetection" className="cursor-pointer">
                          Tab Switch Detection
                        </Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Switch
                          id="copyPasteDetection"
                          checked={proctoringSettings.copyPasteDetection}
                          onCheckedChange={(checked) => handleProctoringChange('copyPasteDetection', checked)}
                        />
                        <Label htmlFor="copyPasteDetection" className="cursor-pointer">
                          Copy/Paste Detection
                        </Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Switch
                          id="rightClickDisabled"
                          checked={proctoringSettings.rightClickDisabled}
                          onCheckedChange={(checked) => handleProctoringChange('rightClickDisabled', checked)}
                        />
                        <Label htmlFor="rightClickDisabled" className="cursor-pointer">
                          Disable Right Click
                        </Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Switch
                          id="devToolsDetection"
                          checked={proctoringSettings.devToolsDetection}
                          onCheckedChange={(checked) => handleProctoringChange('devToolsDetection', checked)}
                        />
                        <Label htmlFor="devToolsDetection" className="cursor-pointer">
                          Dev Tools Detection
                        </Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Switch
                          id="fullscreenRequired"
                          checked={proctoringSettings.fullscreenRequired}
                          onCheckedChange={(checked) => handleProctoringChange('fullscreenRequired', checked)}
                        />
                        <Label htmlFor="fullscreenRequired" className="cursor-pointer">
                          Fullscreen Required
                        </Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Switch
                          id="autoSubmitOnViolation"
                          checked={proctoringSettings.autoSubmitOnViolation}
                          onCheckedChange={(checked) => handleProctoringChange('autoSubmitOnViolation', checked)}
                        />
                        <Label htmlFor="autoSubmitOnViolation" className="cursor-pointer">
                          Auto Submit on Violation
                        </Label>
                      </div>
                    </>
                  )}
                </div>
              </AccordionContent>
            </AccordionItem>
          </Accordion>

          {/* Questions Selection */}
          <Accordion type="single" collapsible className="mt-2 border rounded-lg">
            <AccordionItem value="questions">
              <AccordionTrigger className="px-4 text-lg font-semibold">
                Select Questions ({selectedQuestions.size} selected)
              </AccordionTrigger>
              <AccordionContent className="px-4">
                {loadingQuestions ? (
                  <p className="text-muted-foreground">Loading questions...</p>
                ) : allQuestions.length === 0 ? (
                  <div className="text-center py-4">
                    <p className="text-muted-foreground mb-2">
                      No questions available
                    </p>
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => navigate('/admin/questions/create')}
                    >
                      Create Questions First
                    </Button>
                  </div>
                ) : (
                  <div className="max-h-96 overflow-y-auto">
                    <div className="space-y-2">
                      {allQuestions.map((question) => (
                        <Card
                          key={question._id}
                          className={selectedQuestions.has(question._id) ? 'bg-accent' : ''}
                        >
                          <CardContent className="p-4">
                            <div className="flex items-start">
                              <Checkbox
                                id={`question-${question._id}`}
                                checked={selectedQuestions.has(question._id)}
                                onCheckedChange={() => handleToggleQuestion(question._id)}
                                className="mt-1 mr-3"
                              />
                              <div className="flex-1">
                                <label
                                  htmlFor={`question-${question._id}`}
                                  className="text-sm font-medium cursor-pointer"
                                >
                                  {question.text}
                                </label>
                                <div className="flex gap-2 mt-2 flex-wrap">
                                  <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-300">
                                    {question.type.replace('_', ' ')}
                                  </Badge>
                                  <Badge variant="outline" className={getDifficultyColor(question.difficulty)}>
                                    {question.difficulty}
                                  </Badge>
                                  <Badge variant="outline" className="bg-indigo-50 text-indigo-700 border-indigo-300">
                                    {question.marks} marks
                                  </Badge>
                                  {question.negativeMarks > 0 && (
                                    <Badge variant="outline" className="bg-red-50 text-red-700 border-red-300">
                                      -{question.negativeMarks} negative
                                    </Badge>
                                  )}
                                  {question.category && (
                                    <Badge variant="outline">
                                      {question.category}
                                    </Badge>
                                  )}
                                </div>
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  </div>
                )}
              </AccordionContent>
            </AccordionItem>
          </Accordion>

          {/* Exam Settings */}
          <Accordion type="single" collapsible className="mt-2 border rounded-lg">
            <AccordionItem value="settings">
              <AccordionTrigger className="px-4 text-lg font-semibold">
                Exam Settings
              </AccordionTrigger>
              <AccordionContent className="px-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="flex items-center space-x-2">
                    <Switch
                      id="shuffleQuestions"
                      checked={settings.shuffleQuestions}
                      onCheckedChange={(checked) => handleSettingsChange('shuffleQuestions', checked)}
                    />
                    <Label htmlFor="shuffleQuestions" className="cursor-pointer">
                      Shuffle Questions
                    </Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Switch
                      id="shuffleOptions"
                      checked={settings.shuffleOptions}
                      onCheckedChange={(checked) => handleSettingsChange('shuffleOptions', checked)}
                    />
                    <Label htmlFor="shuffleOptions" className="cursor-pointer">
                      Shuffle Options
                    </Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Switch
                      id="showResultsImmediately"
                      checked={settings.showResultsImmediately}
                      onCheckedChange={(checked) => handleSettingsChange('showResultsImmediately', checked)}
                    />
                    <Label htmlFor="showResultsImmediately" className="cursor-pointer">
                      Show Results Immediately
                    </Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Switch
                      id="allowReview"
                      checked={settings.allowReview}
                      onCheckedChange={(checked) => handleSettingsChange('allowReview', checked)}
                    />
                    <Label htmlFor="allowReview" className="cursor-pointer">
                      Allow Review
                    </Label>
                  </div>
                  <div>
                    <Label htmlFor="attemptsAllowed">Attempts Allowed</Label>
                    <Input
                      id="attemptsAllowed"
                      type="number"
                      value={settings.attemptsAllowed}
                      onChange={(e) => handleSettingsChange('attemptsAllowed', Number(e.target.value))}
                      min={1}
                      className="mt-1.5"
                    />
                    <p className="text-xs text-muted-foreground mt-1.5">
                      Number of attempts allowed per student
                    </p>
                  </div>
                </div>
              </AccordionContent>
            </AccordionItem>
          </Accordion>

          {/* Action Buttons */}
          <div className="mt-4 flex gap-2 justify-end">
            <Button
              type="button"
              variant="outline"
              size="lg"
              onClick={() => navigate('/admin/dashboard')}
              disabled={loading}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              size="lg"
              disabled={loading}
            >
              {loading ? 'Creating...' : 'Create Exam'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateExam;
