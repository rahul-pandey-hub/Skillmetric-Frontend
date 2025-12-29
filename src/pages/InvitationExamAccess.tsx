import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { format } from 'date-fns';
import invitationService from '../services/invitationService';
import { InvitationResponse, InvitationStatus } from '../types/exam';
import { toast } from 'sonner';

export default function InvitationExamAccess() {
  const { token } = useParams<{ token: string }>();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [starting, setStarting] = useState(false);
  const [invitationData, setInvitationData] = useState<InvitationResponse | null>(null);
  const [error, setError] = useState<string>('');

  useEffect(() => {
    if (token) {
      loadInvitationDetails();
    }
  }, [token]);

  const loadInvitationDetails = async () => {
    try {
      setLoading(true);
      setError('');
      const response = await invitationService.getExamByInvitation(token!);
      setInvitationData(response.data);
    } catch (err: any) {
      console.error('Failed to load invitation:', err);
      setError(
        err.response?.data?.message ||
        'Invalid or expired invitation link. Please contact the organization.'
      );
    } finally {
      setLoading(false);
    }
  };

  const handleStartExam = async () => {
    try {
      setStarting(true);
      const response = await invitationService.startExamByInvitation(token!);

      // Store temporary token and exam data
      localStorage.setItem('invitationToken', response.data.temporaryToken);
      localStorage.setItem('invitationSessionId', response.data.sessionId);
      localStorage.setItem('invitationExamData', JSON.stringify(response.data));

      toast.success('Starting exam...');

      // Navigate to exam taking page with invitation context
      navigate(`/exam/invitation/${token}/take`);
    } catch (err: any) {
      console.error('Failed to start exam:', err);
      toast.error(
        err.response?.data?.message ||
        'Failed to start exam. Please try again.'
      );
    } finally {
      setStarting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
        <div className="bg-white rounded-lg shadow-xl p-8 max-w-md w-full text-center">
          <div className="inline-block h-12 w-12 animate-spin rounded-full border-4 border-solid border-primary border-r-transparent mb-4" />
          <p className="text-gray-600">Loading invitation details...</p>
        </div>
      </div>
    );
  }

  if (error || !invitationData || !invitationData.valid) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-red-50 to-pink-100 flex items-center justify-center p-4">
        <div className="bg-white rounded-lg shadow-xl p-8 max-w-md w-full">
          <div className="text-center mb-6">
            <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-red-100 mb-4">
              <svg
                className="h-8 w-8 text-red-600"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Invalid Invitation</h2>
            <p className="text-gray-600">{error}</p>
          </div>
        </div>
      </div>
    );
  }

  const { exam, candidate, invitation, canStart, reason } = invitationData;
  const isExpired = invitation.status === InvitationStatus.EXPIRED;
  const isCompleted = invitation.status === InvitationStatus.COMPLETED;
  const expiryDate = new Date(invitation.expiresAt);
  const isExpiringSoon = !isNaN(expiryDate.getTime()) && expiryDate.getTime() - Date.now() < 24 * 60 * 60 * 1000; // Less than 24 hours

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-purple-600 to-indigo-600 text-white p-8">
          <div className="text-center">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-white/20 mb-4">
              <svg
                className="w-8 h-8"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                />
              </svg>
            </div>
            <h1 className="text-3xl font-bold mb-2">You're Invited!</h1>
            <p className="text-purple-100">Assessment Invitation</p>
          </div>
        </div>

        {/* Content */}
        <div className="p-8">
          {/* Welcome Message */}
          <div className="mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-2">
              Hello, {candidate.name}!
            </h2>
            <p className="text-gray-600">
              You've been invited to take the following assessment:
            </p>
          </div>

          {/* Exam Card */}
          <div className="bg-gradient-to-r from-purple-500 to-indigo-500 rounded-xl p-6 text-white mb-6">
            <h3 className="text-2xl font-bold mb-2">{exam.title}</h3>
            {exam.description && (
              <p className="text-purple-100 mb-4">{exam.description}</p>
            )}
            <div className="flex flex-wrap gap-4 text-sm">
              <div className="flex items-center gap-2">
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
                <span>{exam.duration} minutes</span>
              </div>
              <div className="flex items-center gap-2">
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
                <span>{exam.totalQuestions} questions</span>
              </div>
            </div>
          </div>

          {/* Invitation Details */}
          <div className="bg-gray-50 rounded-lg p-6 mb-6 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-gray-600 font-medium">Your Email:</span>
              <span className="text-gray-900">{candidate.email}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-gray-600 font-medium">Invitation Expires:</span>
              <span className={`font-medium ${isExpiringSoon ? 'text-orange-600' : 'text-gray-900'}`}>
                {!isNaN(expiryDate.getTime()) ? format(expiryDate, 'PPp') : 'N/A'}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-gray-600 font-medium">Status:</span>
              <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
                isCompleted
                  ? 'bg-green-100 text-green-800'
                  : isExpired
                  ? 'bg-red-100 text-red-800'
                  : invitation.status === InvitationStatus.STARTED
                  ? 'bg-yellow-100 text-yellow-800'
                  : 'bg-blue-100 text-blue-800'
              }`}>
                {invitation.status}
              </span>
            </div>
          </div>

          {/* Status Messages */}
          {isExpiringSoon && !isExpired && !isCompleted && (
            <div className="bg-orange-50 border-l-4 border-orange-400 p-4 mb-6">
              <div className="flex items-start">
                <svg
                  className="w-5 h-5 text-orange-400 mt-0.5 mr-3"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    fillRule="evenodd"
                    d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z"
                    clipRule="evenodd"
                  />
                </svg>
                <p className="text-sm text-orange-700">
                  <strong>Expiring Soon:</strong> Your invitation will expire in less than 24 hours.
                  Please complete the assessment soon!
                </p>
              </div>
            </div>
          )}

          {isCompleted && (
            <div className="bg-green-50 border-l-4 border-green-400 p-4 mb-6">
              <div className="flex items-start">
                <svg
                  className="w-5 h-5 text-green-400 mt-0.5 mr-3"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    fillRule="evenodd"
                    d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                    clipRule="evenodd"
                  />
                </svg>
                <p className="text-sm text-green-700">
                  <strong>Completed:</strong> You have already completed this assessment.
                  Thank you for your participation!
                </p>
              </div>
            </div>
          )}

          {isExpired && (
            <div className="bg-red-50 border-l-4 border-red-400 p-4 mb-6">
              <div className="flex items-start">
                <svg
                  className="w-5 h-5 text-red-400 mt-0.5 mr-3"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    fillRule="evenodd"
                    d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                    clipRule="evenodd"
                  />
                </svg>
                <p className="text-sm text-red-700">
                  <strong>Expired:</strong> This invitation has expired.
                  Please contact the organization for a new invitation.
                </p>
              </div>
            </div>
          )}

          {/* Important Notice */}
          {canStart && !isExpired && !isCompleted && (
            <div className="bg-blue-50 border-l-4 border-blue-400 p-4 mb-6">
              <div className="flex items-start">
                <svg
                  className="w-5 h-5 text-blue-400 mt-0.5 mr-3 flex-shrink-0"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    fillRule="evenodd"
                    d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
                    clipRule="evenodd"
                  />
                </svg>
                <div className="text-sm text-blue-700">
                  <p className="font-medium mb-2">Important Notes:</p>
                  <ul className="list-disc list-inside space-y-1">
                    <li>This link is unique to you and can only be used once</li>
                    <li>Make sure you have a stable internet connection</li>
                    <li>Find a quiet environment without distractions</li>
                    <li>You cannot pause once you start the assessment</li>
                  </ul>
                </div>
              </div>
            </div>
          )}

          {/* Action Button */}
          <div className="text-center">
            {canStart && !isExpired && !isCompleted ? (
              <button
                onClick={handleStartExam}
                disabled={starting}
                className="inline-flex items-center justify-center gap-2 bg-gradient-to-r from-purple-600 to-indigo-600 text-white font-semibold py-4 px-8 rounded-lg hover:from-purple-700 hover:to-indigo-700 transition-all duration-200 shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed text-lg"
              >
                {starting ? (
                  <>
                    <div className="h-5 w-5 animate-spin rounded-full border-2 border-white border-r-transparent" />
                    <span>Starting...</span>
                  </>
                ) : (
                  <>
                    <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M13 7l5 5m0 0l-5 5m5-5H6"
                      />
                    </svg>
                    <span>Start Assessment</span>
                  </>
                )}
              </button>
            ) : (
              <p className="text-gray-500 text-sm">
                {isCompleted
                  ? 'Thank you for completing the assessment!'
                  : isExpired
                  ? 'This invitation has expired'
                  : 'Assessment cannot be started at this time'}
              </p>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="bg-gray-50 px-8 py-4 text-center text-sm text-gray-600 border-t">
          <p>
            Powered by <span className="font-semibold text-gray-900">SkillMetric</span>
          </p>
          <p className="mt-1">
            If you have any questions, please contact the organization that sent you this invitation.
          </p>
        </div>
      </div>
    </div>
  );
}
