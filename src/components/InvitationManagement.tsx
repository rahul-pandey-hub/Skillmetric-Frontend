import { useState } from 'react';
import { Mail, Plus, X, Send } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import invitationService from '../services/invitationService';
import { toast } from 'sonner';

interface InvitationManagementProps {
  examId: string;
  examTitle: string;
  onInvitationsSent?: () => void;
}

interface CandidateInput {
  email: string;
  name: string;
  phone?: string;
}

export default function InvitationManagement({
  examId,
  examTitle,
  onInvitationsSent,
}: InvitationManagementProps) {
  const [open, setOpen] = useState(false);
  const [sending, setSending] = useState(false);
  const [candidates, setCandidates] = useState<CandidateInput[]>([
    { email: '', name: '', phone: '' },
  ]);
  const [invitationNote, setInvitationNote] = useState('');
  const [validityDays, setValidityDays] = useState(7);
  const [error, setError] = useState('');

  const addCandidate = () => {
    setCandidates([...candidates, { email: '', name: '', phone: '' }]);
  };

  const removeCandidate = (index: number) => {
    if (candidates.length > 1) {
      setCandidates(candidates.filter((_, i) => i !== index));
    }
  };

  const updateCandidate = (index: number, field: keyof CandidateInput, value: string) => {
    const updated = [...candidates];
    updated[index] = { ...updated[index], [field]: value };
    setCandidates(updated);
  };

  const validateForm = (): boolean => {
    setError('');

    // Check for at least one valid candidate
    const validCandidates = candidates.filter(c => c.email && c.name);
    if (validCandidates.length === 0) {
      setError('Please add at least one candidate with name and email');
      return false;
    }

    // Validate emails
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    for (const candidate of validCandidates) {
      if (!emailRegex.test(candidate.email)) {
        setError(`Invalid email: ${candidate.email}`);
        return false;
      }
    }

    return true;
  };

  const handleSendInvitations = async () => {
    if (!validateForm()) {
      return;
    }

    try {
      setSending(true);
      setError('');

      const validCandidates = candidates.filter(c => c.email && c.name);

      const response = await invitationService.sendInvitations(examId, {
        candidates: validCandidates,
        invitationNote,
        validityDays,
      });

      toast.success(
        `Successfully sent ${response.data.summary.sent} invitation(s)${
          response.data.summary.duplicate > 0
            ? ` (${response.data.summary.duplicate} duplicate(s) skipped)`
            : ''
        }`
      );

      // Reset form
      setCandidates([{ email: '', name: '', phone: '' }]);
      setInvitationNote('');
      setOpen(false);

      if (onInvitationsSent) {
        onInvitationsSent();
      }
    } catch (err: any) {
      console.error('Failed to send invitations:', err);
      setError(err.response?.data?.message || 'Failed to send invitations');
      toast.error('Failed to send invitations');
    } finally {
      setSending(false);
    }
  };

  const handleBulkPaste = (text: string) => {
    // Parse CSV or tab-separated values
    const lines = text.trim().split('\n');
    const newCandidates: CandidateInput[] = [];

    for (const line of lines) {
      const parts = line.split(/[,\t]/).map(p => p.trim());
      if (parts.length >= 2) {
        newCandidates.push({
          name: parts[0],
          email: parts[1],
          phone: parts[2] || '',
        });
      }
    }

    if (newCandidates.length > 0) {
      setCandidates(newCandidates);
      toast.success(`Added ${newCandidates.length} candidate(s)`);
    }
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>Send Invitations</CardTitle>
            <CardDescription>
              Send unique invitation links to candidates
            </CardDescription>
          </div>
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
              <Button>
                <Mail className="h-4 w-4 mr-2" />
                Send Invitations
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Send Exam Invitations</DialogTitle>
                <DialogDescription>
                  Send unique invitation links to candidates for: <strong>{examTitle}</strong>
                </DialogDescription>
              </DialogHeader>

              <div className="space-y-4 py-4">
                {error && (
                  <Alert variant="destructive">
                    <AlertDescription>{error}</AlertDescription>
                  </Alert>
                )}

                {/* Settings */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="validityDays">Link Validity (Days)</Label>
                    <Input
                      id="validityDays"
                      type="number"
                      min={1}
                      max={365}
                      value={validityDays}
                      onChange={(e) => setValidityDays(Number(e.target.value))}
                      className="mt-1.5"
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="invitationNote">Invitation Note (Optional)</Label>
                  <textarea
                    id="invitationNote"
                    value={invitationNote}
                    onChange={(e) => setInvitationNote(e.target.value)}
                    rows={2}
                    className="w-full mt-1.5 px-3 py-2 border border-input rounded-md focus:outline-none focus:ring-2 focus:ring-ring resize-none"
                    placeholder="Add a personal note to the invitation email..."
                  />
                </div>

                {/* Bulk Paste */}
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <h4 className="font-semibold text-sm mb-2 text-blue-900">
                    Quick Bulk Add (CSV/TSV)
                  </h4>
                  <p className="text-xs text-blue-700 mb-2">
                    Paste comma or tab-separated values: Name, Email, Phone (optional)
                  </p>
                  <textarea
                    rows={3}
                    className="w-full px-3 py-2 border border-blue-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none text-sm"
                    placeholder="John Doe, john@example.com, +1234567890&#10;Jane Smith, jane@example.com"
                    onPaste={(e) => {
                      e.preventDefault();
                      handleBulkPaste(e.clipboardData.getData('text'));
                    }}
                  />
                </div>

                {/* Candidates List */}
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <Label>Candidates</Label>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={addCandidate}
                    >
                      <Plus className="h-4 w-4 mr-1" />
                      Add
                    </Button>
                  </div>

                  <div className="space-y-3 max-h-[300px] overflow-y-auto pr-2">
                    {candidates.map((candidate, index) => (
                      <div
                        key={index}
                        className="grid grid-cols-12 gap-2 p-3 bg-gray-50 rounded-lg border"
                      >
                        <div className="col-span-4">
                          <Input
                            placeholder="Full Name *"
                            value={candidate.name}
                            onChange={(e) => updateCandidate(index, 'name', e.target.value)}
                            required
                          />
                        </div>
                        <div className="col-span-4">
                          <Input
                            type="email"
                            placeholder="Email *"
                            value={candidate.email}
                            onChange={(e) => updateCandidate(index, 'email', e.target.value)}
                            required
                          />
                        </div>
                        <div className="col-span-3">
                          <Input
                            placeholder="Phone (optional)"
                            value={candidate.phone}
                            onChange={(e) => updateCandidate(index, 'phone', e.target.value)}
                          />
                        </div>
                        <div className="col-span-1 flex items-center">
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={() => removeCandidate(index)}
                            disabled={candidates.length === 1}
                            className="h-8 w-8 p-0"
                          >
                            <X className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              <DialogFooter>
                <Button variant="outline" onClick={() => setOpen(false)}>
                  Cancel
                </Button>
                <Button onClick={handleSendInvitations} disabled={sending}>
                  {sending ? (
                    <>
                      <div className="h-4 w-4 mr-2 animate-spin rounded-full border-2 border-white border-r-transparent" />
                      Sending...
                    </>
                  ) : (
                    <>
                      <Send className="h-4 w-4 mr-2" />
                      Send Invitations
                    </>
                  )}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </CardHeader>
      <CardContent>
        <p className="text-sm text-muted-foreground">
          Click the button above to send unique invitation links to candidates. Each link will be valid
          for the configured duration and can only be used once.
        </p>
      </CardContent>
    </Card>
  );
}
