import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Search, UserPlus, Users, Loader2, AlertCircle } from 'lucide-react';
import { orgAdminService, type User } from '@/services/orgAdminService';
import { toast } from 'sonner';

interface CandidateSelectorProps {
  examId: string;
  onEnrollComplete: () => void;
  enrolledCandidateIds?: string[];
}

export function CandidateSelector({ examId, onEnrollComplete, enrolledCandidateIds = [] }: CandidateSelectorProps) {
  const [candidates, setCandidates] = useState<User[]>([]);
  const [filteredCandidates, setFilteredCandidates] = useState<User[]>([]);
  const [selectedCandidateIds, setSelectedCandidateIds] = useState<string[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const [enrolling, setEnrolling] = useState(false);
  const [showSelector, setShowSelector] = useState(false);

  useEffect(() => {
    if (showSelector) {
      fetchCandidates();
    }
  }, [showSelector]);

  useEffect(() => {
    // Filter candidates based on search term
    if (searchTerm.trim()) {
      const filtered = candidates.filter(
        (candidate) =>
          candidate.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          candidate.email.toLowerCase().includes(searchTerm.toLowerCase())
      );
      setFilteredCandidates(filtered);
    } else {
      setFilteredCandidates(candidates);
    }
  }, [searchTerm, candidates]);

  const fetchCandidates = async () => {
    try {
      setLoading(true);
      const response = await orgAdminService.getAllUsers({
        role: 'CANDIDATE',
        page: 1,
        limit: 1000, // Fetch all candidates
      });

      // Filter out already enrolled candidates
      const availableCandidates = response.data.filter(
        (user) => !enrolledCandidateIds.includes(user._id)
      );

      setCandidates(availableCandidates);
      setFilteredCandidates(availableCandidates);
    } catch (error: any) {
      console.error('Error fetching candidates:', error);
      toast.error(error.response?.data?.message || 'Failed to fetch candidates');
    } finally {
      setLoading(false);
    }
  };

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedCandidateIds(filteredCandidates.map((c) => c._id));
    } else {
      setSelectedCandidateIds([]);
    }
  };

  const handleSelectCandidate = (candidateId: string, checked: boolean) => {
    if (checked) {
      setSelectedCandidateIds((prev) => [...prev, candidateId]);
    } else {
      setSelectedCandidateIds((prev) => prev.filter((id) => id !== candidateId));
    }
  };

  const handleEnroll = async () => {
    if (selectedCandidateIds.length === 0) {
      toast.error('Please select at least one candidate');
      return;
    }

    try {
      setEnrolling(true);

      // Get candidate details for enrollment
      const selectedCandidates = candidates.filter((c) =>
        selectedCandidateIds.includes(c._id)
      );

      const candidateData = selectedCandidates.map((c) => ({
        name: c.name,
        email: c.email,
      }));

      // Import examService dynamically to avoid circular dependency
      const { examService } = await import('@/services/examService');
      const response = await examService.enrollCandidates(examId, candidateData);

      const { summary } = response.data;

      toast.success(
        `Successfully enrolled ${summary.enrolled} candidate${summary.enrolled !== 1 ? 's' : ''}` +
        (summary.alreadyEnrolled > 0 ? `. ${summary.alreadyEnrolled} already enrolled` : '')
      );

      setSelectedCandidateIds([]);
      setShowSelector(false);
      onEnrollComplete();
    } catch (error: any) {
      console.error('Error enrolling candidates:', error);
      toast.error(error.response?.data?.message || 'Failed to enroll candidates');
    } finally {
      setEnrolling(false);
    }
  };

  if (!showSelector) {
    return (
      <Button onClick={() => setShowSelector(true)} className="gap-2">
        <UserPlus className="w-4 h-4" />
        Enroll Candidates
      </Button>
    );
  }

  return (
    <Card className="mt-4">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Users className="w-5 h-5" />
            Select Candidates to Enroll
          </CardTitle>
          <Button variant="ghost" onClick={() => setShowSelector(false)}>
            Cancel
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="w-6 h-6 animate-spin text-primary-600 mr-2" />
            <span className="text-gray-600">Loading candidates...</span>
          </div>
        ) : candidates.length === 0 ? (
          <div className="text-center py-8">
            <AlertCircle className="w-12 h-12 text-gray-400 mx-auto mb-3" />
            <p className="text-gray-600">No candidates available for enrollment</p>
            <p className="text-sm text-gray-500 mt-1">
              All organization candidates are already enrolled in this exam
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {/* Search */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <Input
                placeholder="Search by name or email..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>

            {/* Select All */}
            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <div className="flex items-center gap-2">
                <Checkbox
                  checked={
                    filteredCandidates.length > 0 &&
                    selectedCandidateIds.length === filteredCandidates.length
                  }
                  onCheckedChange={handleSelectAll}
                />
                <span className="text-sm font-medium text-gray-700">
                  Select All ({filteredCandidates.length})
                </span>
              </div>
              <Badge variant="outline">
                {selectedCandidateIds.length} selected
              </Badge>
            </div>

            {/* Candidates List */}
            <div className="max-h-96 overflow-y-auto space-y-2 border rounded-lg p-2">
              {filteredCandidates.length === 0 ? (
                <div className="text-center py-4 text-gray-500">
                  No candidates match your search
                </div>
              ) : (
                filteredCandidates.map((candidate) => (
                  <div
                    key={candidate._id}
                    className="flex items-center gap-3 p-3 border rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    <Checkbox
                      checked={selectedCandidateIds.includes(candidate._id)}
                      onCheckedChange={(checked) =>
                        handleSelectCandidate(candidate._id, checked as boolean)
                      }
                    />
                    <div className="flex-1">
                      <p className="font-medium text-gray-900">{candidate.name}</p>
                      <p className="text-sm text-gray-600">{candidate.email}</p>
                      {candidate.metadata?.department && (
                        <p className="text-xs text-gray-500 mt-1">
                          {candidate.metadata.department}
                        </p>
                      )}
                    </div>
                    <Badge
                      variant={candidate.isActive ? 'default' : 'outline'}
                      className={
                        candidate.isActive
                          ? 'bg-success-100 text-success-700'
                          : 'bg-gray-100 text-gray-600'
                      }
                    >
                      {candidate.isActive ? 'Active' : 'Inactive'}
                    </Badge>
                  </div>
                ))
              )}
            </div>

            {/* Action Buttons */}
            <div className="flex justify-end gap-2 pt-4 border-t">
              <Button variant="outline" onClick={() => setShowSelector(false)}>
                Cancel
              </Button>
              <Button
                onClick={handleEnroll}
                disabled={enrolling || selectedCandidateIds.length === 0}
                className="gap-2"
              >
                {enrolling ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Enrolling...
                  </>
                ) : (
                  <>
                    <UserPlus className="w-4 h-4" />
                    Enroll {selectedCandidateIds.length} Candidate
                    {selectedCandidateIds.length !== 1 ? 's' : ''}
                  </>
                )}
              </Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
