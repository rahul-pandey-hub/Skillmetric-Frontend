import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
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
import {
  Search,
  Trash2,
  UserMinus,
  Mail,
  User,
  AlertTriangle,
  Loader2,
} from 'lucide-react';
import { examService } from '@/services/examService';
import { toast } from 'sonner';

interface Candidate {
  _id: string;
  name?: string;
  email?: string;
  metadata?: {
    department?: string;
    batch?: string;
  };
  enrolledAt?: string;
}

interface EnrolledCandidatesListProps {
  examId: string;
  candidates: Candidate[];
  onUpdate: () => void;
}

export function EnrolledCandidatesList({
  examId,
  candidates,
  onUpdate,
}: EnrolledCandidatesListProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [removing, setRemoving] = useState(false);
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [candidateToRemove, setCandidateToRemove] = useState<string | null>(null);

  // Debug: Log candidates to see what data we're receiving
  console.log('EnrolledCandidatesList - candidates:', candidates);

  // Filter candidates based on search
  const filteredCandidates = candidates.filter((candidate) => {
    if (!searchTerm.trim()) {
      return true; // Show all candidates when search is empty
    }

    const searchLower = searchTerm.toLowerCase();
    return (
      candidate.name?.toLowerCase().includes(searchLower) ||
      candidate.email?.toLowerCase().includes(searchLower) ||
      candidate.metadata?.department?.toLowerCase().includes(searchLower) ||
      candidate.metadata?.batch?.toLowerCase().includes(searchLower)
    );
  });

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedIds(filteredCandidates.map((c) => c._id));
    } else {
      setSelectedIds([]);
    }
  };

  const handleSelectCandidate = (candidateId: string, checked: boolean) => {
    if (checked) {
      setSelectedIds((prev) => [...prev, candidateId]);
    } else {
      setSelectedIds((prev) => prev.filter((id) => id !== candidateId));
    }
  };

  const handleRemoveSingle = (candidateId: string) => {
    setCandidateToRemove(candidateId);
    setShowConfirmDialog(true);
  };

  const handleRemoveSelected = () => {
    if (selectedIds.length === 0) {
      toast.error('Please select at least one candidate to remove');
      return;
    }
    setCandidateToRemove(null);
    setShowConfirmDialog(true);
  };

  const confirmRemove = async () => {
    const idsToRemove = candidateToRemove ? [candidateToRemove] : selectedIds;

    if (idsToRemove.length === 0) {
      return;
    }

    try {
      setRemoving(true);
      const response = await examService.unenrollCandidates(examId, idsToRemove);

      toast.success(
        `Successfully removed ${response.data.unenrolled} candidate${
          response.data.unenrolled !== 1 ? 's' : ''
        }`
      );

      setSelectedIds([]);
      setCandidateToRemove(null);
      setShowConfirmDialog(false);
      onUpdate();
    } catch (error: any) {
      console.error('Error removing candidates:', error);
      toast.error(error.response?.data?.message || 'Failed to remove candidates');
    } finally {
      setRemoving(false);
    }
  };

  if (!candidates || candidates.length === 0) {
    return null;
  }

  return (
    <div className="space-y-4">
      {/* Search and Actions */}
      <div className="flex items-center justify-between gap-4">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <Input
            placeholder="Search candidates..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>

        {selectedIds.length > 0 && (
          <Button
            variant="destructive"
            onClick={handleRemoveSelected}
            disabled={removing}
            className="gap-2"
          >
            {removing ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Removing...
              </>
            ) : (
              <>
                <UserMinus className="w-4 h-4" />
                Remove {selectedIds.length} Selected
              </>
            )}
          </Button>
        )}
      </div>

      {/* Candidates Table */}
      <div className="border rounded-lg">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-12">
                <Checkbox
                  checked={
                    filteredCandidates.length > 0 &&
                    selectedIds.length === filteredCandidates.length
                  }
                  onCheckedChange={handleSelectAll}
                />
              </TableHead>
              <TableHead>Candidate</TableHead>
              <TableHead>Email</TableHead>
              <TableHead className="w-24">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredCandidates.length === 0 ? (
              <TableRow>
                <TableCell colSpan={4} className="text-center py-8 text-gray-500">
                  {searchTerm ? 'No candidates match your search' : 'No enrolled candidates'}
                </TableCell>
              </TableRow>
            ) : (
              filteredCandidates.map((candidate) => (
                <TableRow key={candidate._id}>
                  <TableCell>
                    <Checkbox
                      checked={selectedIds.includes(candidate._id)}
                      onCheckedChange={(checked) =>
                        handleSelectCandidate(candidate._id, checked as boolean)
                      }
                    />
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <User className="w-4 h-4 text-gray-400" />
                      <span className="font-medium">{candidate.name || 'N/A'}</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Mail className="w-4 h-4 text-gray-400" />
                      <span className="text-sm text-gray-600">{candidate.email || 'N/A'}</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleRemoveSingle(candidate._id)}
                      disabled={removing}
                      className="text-destructive hover:text-destructive hover:bg-destructive/10"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {/* Summary */}
      <div className="flex items-center justify-between text-sm text-gray-600">
        <span>
          Showing {filteredCandidates.length} of {candidates.length} enrolled candidate
          {candidates.length !== 1 ? 's' : ''}
        </span>
        {selectedIds.length > 0 && (
          <span className="font-medium text-primary-600">
            {selectedIds.length} selected
          </span>
        )}
      </div>

      {/* Confirmation Dialog */}
      <Dialog open={showConfirmDialog} onOpenChange={setShowConfirmDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-destructive" />
              Confirm Removal
            </DialogTitle>
            <DialogDescription>
              {candidateToRemove
                ? 'Are you sure you want to remove this candidate from the exam? This action cannot be undone.'
                : `Are you sure you want to remove ${selectedIds.length} selected candidate${
                    selectedIds.length !== 1 ? 's' : ''
                  } from the exam? This action cannot be undone.`}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setShowConfirmDialog(false)}
              disabled={removing}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={confirmRemove}
              disabled={removing}
            >
              {removing ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Removing...
                </>
              ) : (
                'Remove'
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
