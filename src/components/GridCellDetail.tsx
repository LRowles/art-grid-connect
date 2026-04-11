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
  { value: 'registered', label: 'Registered' },
  { value: 'picked_up', label: 'Picked Up' },
  { value: 'dropped_off', label: 'Dropped Off' },
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
      <DialogContent className="max-w-md bg-[hsl(222,40%,12%)] border-white/10 text-white">
        <DialogHeader>
          <DialogTitle className="text-xl text-white">Grid Cell {gridCell}</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {/* Status */}
          <div>
            <label className="text-sm font-medium text-white/50">Status</label>
            <Select value={assignment?.status ?? 'available'} onValueChange={(v) => handleStatusChange(v as GridStatus)}>
              <SelectTrigger className="bg-white/5 border-white/10 text-white">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="bg-[hsl(222,40%,15%)] border-white/10">
                {STATUS_OPTIONS.map(opt => (
                  <SelectItem key={opt.value} value={opt.value} className="text-white/80 focus:bg-white/10 focus:text-white">{opt.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Assigned Artist */}
          <div>
            <label className="text-sm font-medium text-white/50">Assigned Artist</label>
            <Select
              value={assignment?.artist_id ?? 'none'}
              onValueChange={(v) => handleAssignArtist(v === 'none' ? '' : v)}
            >
              <SelectTrigger className="bg-white/5 border-white/10 text-white">
                <SelectValue placeholder="Select artist..." />
              </SelectTrigger>
              <SelectContent className="bg-[hsl(222,40%,15%)] border-white/10">
                <SelectItem value="none" className="text-white/50 focus:bg-white/10 focus:text-white">— None —</SelectItem>
                {artists?.map(a => (
                  <SelectItem key={a.id} value={a.id} className="text-white/80 focus:bg-white/10 focus:text-white">{a.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Artist Info */}
          {assignment?.artists && (
            <div className="bg-white/5 border border-white/10 rounded-lg p-3 text-sm space-y-1">
              <div><span className="font-medium text-white/50">Name:</span> <span className="text-white">{assignment.artists.name}</span></div>
              {assignment.artists.email && <div><span className="font-medium text-white/50">Email:</span> <span className="text-white">{assignment.artists.email}</span></div>}
              {assignment.artists.phone && <div><span className="font-medium text-white/50">Phone:</span> <span className="text-white">{assignment.artists.phone}</span></div>}
            </div>
          )}

          {/* Quick add new artist */}
          {!showNewArtist ? (
            <Button variant="outline" size="sm" onClick={() => setShowNewArtist(true)} className="border-white/10 text-white/60 hover:bg-white/5 hover:text-white">
              + Add New Artist
            </Button>
          ) : (
            <div className="space-y-2 border border-white/10 rounded-lg p-3 bg-white/3">
              <Input placeholder="Name *" value={newName} onChange={e => setNewName(e.target.value)} className="bg-white/5 border-white/10 text-white placeholder:text-white/30" />
              <Input placeholder="Email" value={newEmail} onChange={e => setNewEmail(e.target.value)} className="bg-white/5 border-white/10 text-white placeholder:text-white/30" />
              <Input placeholder="Phone" value={newPhone} onChange={e => setNewPhone(e.target.value)} className="bg-white/5 border-white/10 text-white placeholder:text-white/30" />
              <div className="flex gap-2">
                <Button size="sm" onClick={handleCreateAndAssign} disabled={!newName.trim()} className="bg-amber-500 hover:bg-amber-600 text-white">Create & Assign</Button>
                <Button size="sm" variant="ghost" onClick={() => setShowNewArtist(false)} className="text-white/50 hover:text-white hover:bg-white/5">Cancel</Button>
              </div>
            </div>
          )}

          {/* Notes */}
          <div>
            <label className="text-sm font-medium text-white/50">Notes</label>
            <Textarea
              defaultValue={assignment?.notes ?? ''}
              onBlur={(e) => handleNotesChange(e.target.value)}
              placeholder="Add notes..."
              rows={2}
              className="bg-white/5 border-white/10 text-white placeholder:text-white/30"
            />
          </div>

          {/* Assignment date */}
          {assignment?.assigned_at && (
            <div className="text-xs text-white/30">
              Assigned: {format(new Date(assignment.assigned_at), 'MMM d, yyyy h:mm a')}
            </div>
          )}

          {/* Status History */}
          {history && history.length > 0 && (
            <div>
              <label className="text-sm font-medium text-white/50">History</label>
              <div className="max-h-32 overflow-y-auto space-y-1 mt-1">
                {history.map(h => (
                  <div key={h.id} className="text-xs text-white/30 flex justify-between">
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
