import { Badge } from '@/components/ui/badge';
import { ExamFormData } from './index';
import {
  FileText,
  Clock,
  Award,
  BookOpen,
  Shield,
  Camera,
  Monitor,
  AlertTriangle,
  Target,
  Users,
  CheckCircle2,
} from 'lucide-react';

interface Step5Props {
  data: ExamFormData;
}

export default function Step5Review({ data }: Step5Props) {
  return (
    <div className="space-y-6">
      <div className="bg-gradient-to-r from-success-50 to-primary-50 border border-success-200 rounded-lg p-4">
        <div className="flex items-start">
          <CheckCircle2 className="w-5 h-5 text-success-600 mt-0.5 mr-3" />
          <div>
            <h3 className="text-sm font-medium text-success-900">Ready to Publish</h3>
            <p className="text-xs text-success-700 mt-1">
              Review all exam details before publishing. You can edit the exam later if needed.
            </p>
          </div>
        </div>
      </div>

      {/* Basic Information */}
      <div className="border rounded-lg p-5">
        <div className="flex items-center mb-4">
          <FileText className="w-5 h-5 text-primary-600 mr-2" />
          <h3 className="text-lg font-semibold text-gray-900">Basic Information</h3>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <p className="text-sm text-gray-600">Title</p>
            <p className="font-medium text-gray-900">{data.title || 'Not set'}</p>
          </div>
          <div>
            <p className="text-sm text-gray-600">Category</p>
            <p className="font-medium text-gray-900 capitalize">{data.category || 'Not set'}</p>
          </div>
          <div>
            <p className="text-sm text-gray-600">Duration</p>
            <div className="flex items-center">
              <Clock className="w-4 h-4 text-gray-600 mr-1" />
              <p className="font-medium text-gray-900">{data.duration} minutes</p>
            </div>
          </div>
          <div>
            <p className="text-sm text-gray-600">Total Marks</p>
            <div className="flex items-center">
              <Award className="w-4 h-4 text-gray-600 mr-1" />
              <p className="font-medium text-gray-900">{data.totalMarks} marks</p>
            </div>
          </div>
          <div>
            <p className="text-sm text-gray-600">Difficulty</p>
            <Badge
              className={
                data.difficulty === 'hard'
                  ? 'bg-destructive-100 text-destructive-700'
                  : data.difficulty === 'medium'
                  ? 'bg-warning-100 text-warning-700'
                  : 'bg-success-100 text-success-700'
              }
            >
              {data.difficulty}
            </Badge>
          </div>
          <div>
            <p className="text-sm text-gray-600">Passing Percentage</p>
            <p className="font-medium text-gray-900">{data.passingPercentage}%</p>
          </div>
        </div>
        {data.description && (
          <div className="mt-4">
            <p className="text-sm text-gray-600">Description</p>
            <p className="text-gray-900 text-sm mt-1">{data.description}</p>
          </div>
        )}
      </div>

      {/* Questions */}
      <div className="border rounded-lg p-5">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center">
            <BookOpen className="w-5 h-5 text-primary-600 mr-2" />
            <h3 className="text-lg font-semibold text-gray-900">Questions</h3>
          </div>
          <Badge variant="outline">{data.questions.length} selected</Badge>
        </div>
        {data.questions.length > 0 ? (
          <p className="text-sm text-gray-600">
            {data.questions.length} question{data.questions.length !== 1 ? 's' : ''} have been added to
            this exam
          </p>
        ) : (
          <p className="text-sm text-warning-600">No questions selected</p>
        )}
      </div>

      {/* Proctoring Settings */}
      <div className="border rounded-lg p-5">
        <div className="flex items-center mb-4">
          <Shield className="w-5 h-5 text-primary-600 mr-2" />
          <h3 className="text-lg font-semibold text-gray-900">Proctoring Settings</h3>
        </div>
        {data.proctoringSettings.enabled ? (
          <div className="space-y-3">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {data.proctoringSettings.webcamRequired && (
                <div className="flex items-center text-sm">
                  <Camera className="w-4 h-4 text-success-600 mr-2" />
                  <span className="text-gray-700">Webcam Required</span>
                </div>
              )}
              {data.proctoringSettings.screenRecording && (
                <div className="flex items-center text-sm">
                  <Monitor className="w-4 h-4 text-success-600 mr-2" />
                  <span className="text-gray-700">Screen Recording</span>
                </div>
              )}
              {data.proctoringSettings.tabSwitchDetection && (
                <div className="flex items-center text-sm">
                  <AlertTriangle className="w-4 h-4 text-success-600 mr-2" />
                  <span className="text-gray-700">Tab Switch Detection</span>
                </div>
              )}
              {data.proctoringSettings.idVerification && (
                <div className="flex items-center text-sm">
                  <CheckCircle2 className="w-4 h-4 text-success-600 mr-2" />
                  <span className="text-gray-700">ID Verification</span>
                </div>
              )}
            </div>
            <div className="pt-3 border-t">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
                <div>
                  <span className="text-gray-600">Max Tab Switches:</span>
                  <span className="ml-2 font-medium text-gray-900">
                    {data.proctoringSettings.maxTabSwitches}
                  </span>
                </div>
                <div>
                  <span className="text-gray-600">Max Violations:</span>
                  <span className="ml-2 font-medium text-gray-900">
                    {data.proctoringSettings.maxViolations}
                  </span>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <p className="text-sm text-gray-600">Proctoring is disabled for this exam</p>
        )}
      </div>

      {/* Shortlisting Criteria */}
      <div className="border rounded-lg p-5">
        <div className="flex items-center mb-4">
          <Target className="w-5 h-5 text-primary-600 mr-2" />
          <h3 className="text-lg font-semibold text-gray-900">Shortlisting Criteria</h3>
        </div>
        <div className="space-y-2 text-sm">
          <div className="flex items-center">
            <div className="w-2 h-2 bg-primary-500 rounded-full mr-2"></div>
            <span className="text-gray-700">
              Cutoff Percentage:{' '}
              <strong className="text-gray-900">{data.shortlistingCriteria.cutoffPercentage}%</strong>
            </span>
          </div>
          {data.shortlistingCriteria.autoSelect && (
            <div className="flex items-center">
              <Users className="w-4 h-4 text-primary-600 mr-2" />
              <span className="text-gray-700">
                Auto-select top{' '}
                <strong className="text-gray-900">{data.shortlistingCriteria.topNStudents}</strong>{' '}
                students
              </span>
            </div>
          )}
        </div>
      </div>

      {/* Final Note */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <p className="text-sm text-blue-900">
          <strong>Note:</strong> After publishing, students will be able to see and take this exam. You
          can edit exam details or pause the exam anytime from the exam management page.
        </p>
      </div>
    </div>
  );
}
