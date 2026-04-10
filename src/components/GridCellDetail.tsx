import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { useArtists, useUpdateGridAssignment, useCreateArtist, useStatusHistory, GridAssignmentWithArtist } from '@/hooks/useGridAssignments';
import { Database } from '@/integrations/supabase/types';
import { toast } from 'sonner';
import { format } from 'date-fns';

type GridStatus = Database['public']['Enums']['grid_status'];

const STATUS_OPTIONS: { value: GridStatus; label: string }[] = [
  { value: 'available', label: 'Available' },
  { value: 'assigned', label: 'Assigned' },
  { value: 'in_progress', label: 'In Progress' },
  { value: 'completed', label: 'Completed' },
  { value: 'collected', label: 'Collected' },
];

interface Props {
  gridCell: string;
  assignment: GridAssignmentWithArtist | null;
  onClose: () => void;
}

export function GridCellDetail({ gridCell, assignment, onClose }: Props) {
  const { data: artists } = useArtists();
  const { data: history } = useStatusHistory(gridCell);
  const updateAssignment = useUpdateGridAssignment();
  const createArtist = useCreateArtist();

  const [showNewArtist, setShowNewArtist] = useState(false);
  const [newName, setNewName] = useState('');
  const [newEmail, setNewEmail] = useState('');
  const [newPhone, setNewPhone] = useState('');

  const handleStatusChange = async (status: GridStatus) => {
    try {
      await updateAssignment.mutateAsync({ gridCell, status });
      toast.success(`Status updated to ${status}`);
    } catch {
      toast.error('Failed to update status');
    }
  };

  const handleAssignArtist = async (artistId: string) => {
    try {
      await updateAssignment.mutateAsync({ gridCell, artistId: artistId || null });
      toast.success(artistId ? 'Artist assigned' : 'Artist removed');
    } catch {
      toast.error('Failed to assign artist');
    }
  };

  const handleCreateAndAssign = async () => {
    if (!newName.trim()) return;
    try {
      const artist = await createArtist.mutateAsync({ name: newName, email: newEmail || undefined, phone: newPhone || undefined });
      await updateAssignment.mutateAsync({ gridCell, artistId: artist.id });
      toast.success(`${newName} created and assigned`);
      setShowNewArtist(false);
      setNewName('');
      setNewEmail('');
      setNewPhone('');
    } catch {
      toast.error('Failed to create artist');
    }
  };

  const handleNotesChange = async (notes: string) => {
    try {
      await updateAssignment.mutateAsync({ gridCell, notes });
    } catch {
      toast.error('Failed to update notes');
    }
  };

  return (
    <Dialog open onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="text-xl">Grid Cell {gridCell}</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {/* Status */}
          <div>
            <label className="text-sm font-medium text-muted-foreground">Status</label>
            <Select value={assignment?.status ?? 'available'} onValueChange={(v) => handleStatusChange(v as GridStatus)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {STATUS_OPTIONS.map(opt => (
                  <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Assigned Artist */}
          <div>
            <label className="text-sm font-medium text-muted-foreground">Assigned Artist</label>
            <Select
              value={assignment?.artist_id ?? 'none'}
              onValueChange={(v) => handleAssignArtist(v === 'none' ? '' : v)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select artist..." />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="none">— None —</SelectItem>
                {artists?.map(a => (
                  <SelectItem key={a.id} value={a.id}>{a.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Artist Info */}
          {assignment?.artists && (
            <div className="bg-muted rounded-lg p-3 text-sm space-y-1">
              <div><span className="font-medium">Name:</span> {assignment.artists.name}</div>
              {assignment.artists.email && <div><span className="font-medium">Email:</span> {assignment.artists.email}</div>}
              {assignment.artists.phone && <div><span className="font-medium">Phone:</span> {assignment.artists.phone}</div>}
            </div>
          )}

          {/* Quick add new artist */}
          {!showNewArtist ? (
            <Button variant="outline" size="sm" onClick={() => setShowNewArtist(true)}>
              + Add New Artist
            </Button>
          ) : (
            <div className="space-y-2 border rounded-lg p-3">
              <Input placeholder="Name *" value={newName} onChange={e => setNewName(e.target.value)} />
              <Input placeholder="Email" value={newEmail} onChange={e => setNewEmail(e.target.value)} />
              <Input placeholder="Phone" value={newPhone} onChange={e => setNewPhone(e.target.value)} />
              <div className="flex gap-2">
                <Button size="sm" onClick={handleCreateAndAssign} disabled={!newName.trim()}>Create & Assign</Button>
                <Button size="sm" variant="ghost" onClick={() => setShowNewArtist(false)}>Cancel</Button>
              </div>
            </div>
          )}

          {/* Notes */}
          <div>
            <label className="text-sm font-medium text-muted-foreground">Notes</label>
            <Textarea
              defaultValue={assignment?.notes ?? ''}
              onBlur={(e) => handleNotesChange(e.target.value)}
              placeholder="Add notes..."
              rows={2}
            />
          </div>

          {/* Assignment date */}
          {assignment?.assigned_at && (
            <div className="text-xs text-muted-foreground">
              Assigned: {format(new Date(assignment.assigned_at), 'MMM d, yyyy h:mm a')}
            </div>
          )}

          {/* Status History */}
          {history && history.length > 0 && (
            <div>
              <label className="text-sm font-medium text-muted-foreground">History</label>
              <div className="max-h-32 overflow-y-auto space-y-1 mt-1">
                {history.map(h => (
                  <div key={h.id} className="text-xs text-muted-foreground flex justify-between">
                    <span>{h.old_status ?? '—'} → {h.new_status}</span>
                    <span>{format(new Date(h.created_at), 'M/d h:mm a')}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
