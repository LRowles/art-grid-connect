import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { useArtists, useUpdateGridAssignment, useCreateArtist, useStatusHistory, GridAssignmentWithArtist } from '@/hooks/useGridAssignments';
import { supabase } from '@/integrations/supabase/client';
import { Database } from '@/integrations/supabase/types';
import { toast } from 'sonner';
import { format } from 'date-fns';
import { Users, ArrowRight, Crown } from 'lucide-react';
import { useQueryClient } from '@tanstack/react-query';

type GridStatus = Database['public']['Enums']['grid_status'];

type BackupArtist = {
  id: string;
  name: string;
  email: string | null;
  phone: string | null;
  bio: string | null;
  waitlist_position: number;
  status: string;
};

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
  const queryClient = useQueryClient();
  const { data: artists } = useArtists();
  const { data: history } = useStatusHistory(gridCell);
  const updateAssignment = useUpdateGridAssignment();
  const createArtist = useCreateArtist();

  const [showNewArtist, setShowNewArtist] = useState(false);
  const [showBackupList, setShowBackupList] = useState(false);
  const [backupArtists, setBackupArtists] = useState<BackupArtist[]>([]);
  const [loadingBackup, setLoadingBackup] = useState(false);
  const [newName, setNewName] = useState('');
  const [newEmail, setNewEmail] = useState('');
  const [newPhone, setNewPhone] = useState('');

  // Load backup artists when panel is opened
  useEffect(() => {
    if (showBackupList) {
      setLoadingBackup(true);
      supabase
        .from('backup_artists')
        .select('id, name, email, phone, bio, waitlist_position, status')
        .eq('status', 'waiting')
        .order('waitlist_position')
        .then(({ data, error }) => {
          if (!error && data) setBackupArtists(data);
          setLoadingBackup(false);
        });
    }
  }, [showBackupList]);

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

  const handlePromoteBackupArtist = async (backup: BackupArtist) => {
    try {
      // 1. Create a new artist record from the backup artist data
      const artist = await createArtist.mutateAsync({
        name: backup.name,
        email: backup.email || undefined,
        phone: backup.phone || undefined,
      });

      // 2. Assign them to this grid cell
      await updateAssignment.mutateAsync({ gridCell, artistId: artist.id, status: 'registered' });

      // 3. Update the backup_artists record to 'assigned'
      await supabase
        .from('backup_artists')
        .update({
          status: 'assigned',
          assigned_grid_cell: gridCell,
          promoted_at: new Date().toISOString(),
        })
        .eq('id', backup.id);

      toast.success(`${backup.name} promoted from backup list and assigned to ${gridCell}!`);
      setShowBackupList(false);
      queryClient.invalidateQueries({ queryKey: ['backup_artist_count'] });
      queryClient.invalidateQueries({ queryKey: ['grid_assignments'] });
      queryClient.invalidateQueries({ queryKey: ['artists'] });
    } catch {
      toast.error('Failed to promote backup artist');
    }
  };

  const handleNotesChange = async (notes: string) => {
    try {
      await updateAssignment.mutateAsync({ gridCell, notes });
    } catch {
      toast.error('Failed to update notes');
    }
  };

  const isUnassigned = !assignment?.artist_id;

  return (
    <Dialog open onOpenChange={onClose}>
      <DialogContent className="max-w-md bg-[#0a0a0a] border-white/[0.08] text-white">
        <DialogHeader>
          <DialogTitle className="text-xl text-white">Grid Cell <span className="text-[#dc2626]">{gridCell}</span></DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {/* Status */}
          <div>
            <label className="text-sm font-medium text-white/40" style={{ fontFamily: 'Inter, sans-serif', textTransform: 'none', letterSpacing: 'normal' }}>Status</label>
            <Select value={assignment?.status ?? 'available'} onValueChange={(v) => handleStatusChange(v as GridStatus)}>
              <SelectTrigger className="bg-white/[0.03] border-white/[0.08] text-white">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="bg-[#111] border-white/[0.08]">
                {STATUS_OPTIONS.map(opt => (
                  <SelectItem key={opt.value} value={opt.value} className="text-white/70 focus:bg-white/[0.05] focus:text-white">{opt.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Assigned Artist */}
          <div>
            <label className="text-sm font-medium text-white/40" style={{ fontFamily: 'Inter, sans-serif', textTransform: 'none', letterSpacing: 'normal' }}>Assigned Artist</label>
            <Select
              value={assignment?.artist_id ?? 'none'}
              onValueChange={(v) => handleAssignArtist(v === 'none' ? '' : v)}
            >
              <SelectTrigger className="bg-white/[0.03] border-white/[0.08] text-white">
                <SelectValue placeholder="Select artist..." />
              </SelectTrigger>
              <SelectContent className="bg-[#111] border-white/[0.08]">
                <SelectItem value="none" className="text-white/40 focus:bg-white/[0.05] focus:text-white">— None —</SelectItem>
                {artists?.map(a => (
                  <SelectItem key={a.id} value={a.id} className="text-white/70 focus:bg-white/[0.05] focus:text-white">{a.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Artist Info */}
          {assignment?.artists && (
            <div className="bg-white/[0.02] border border-white/[0.06] rounded-lg p-3 text-sm space-y-1" style={{ fontFamily: 'Inter, sans-serif', textTransform: 'none', letterSpacing: 'normal' }}>
              <div><span className="font-medium text-white/40">Name:</span> <span className="text-white">{assignment.artists.name}</span></div>
              {assignment.artists.email && <div><span className="font-medium text-white/40">Email:</span> <span className="text-white">{assignment.artists.email}</span></div>}
              {assignment.artists.phone && <div><span className="font-medium text-white/40">Phone:</span> <span className="text-white">{assignment.artists.phone}</span></div>}
            </div>
          )}

          {/* Action buttons row */}
          <div className="flex flex-wrap gap-2">
            {/* Quick add new artist */}
            {!showNewArtist && !showBackupList && (
              <Button variant="outline" size="sm" onClick={() => setShowNewArtist(true)} className="border-white/[0.08] text-white/50 hover:bg-white/[0.03] hover:text-[#dc2626] hover:border-[#dc2626]/30">
                + Add New Artist
              </Button>
            )}

            {/* Promote from backup list button — shown when cell is unassigned or to replace */}
            {!showNewArtist && !showBackupList && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowBackupList(true)}
                className="border-[#ffcc00]/20 text-[#ffcc00]/70 hover:bg-[#ffcc00]/10 hover:text-[#ffcc00] hover:border-[#ffcc00]/40"
              >
                <Users className="h-3.5 w-3.5 mr-1" /> Promote from Backup List
              </Button>
            )}
          </div>

          {/* New artist form */}
          {showNewArtist && (
            <div className="space-y-2 border border-white/[0.06] rounded-lg p-3 bg-white/[0.02]">
              <Input placeholder="Name *" value={newName} onChange={e => setNewName(e.target.value)} className="bg-white/[0.03] border-white/[0.08] text-white placeholder:text-white/20" />
              <Input placeholder="Email" value={newEmail} onChange={e => setNewEmail(e.target.value)} className="bg-white/[0.03] border-white/[0.08] text-white placeholder:text-white/20" />
              <Input placeholder="Phone" value={newPhone} onChange={e => setNewPhone(e.target.value)} className="bg-white/[0.03] border-white/[0.08] text-white placeholder:text-white/20" />
              <div className="flex gap-2">
                <Button size="sm" onClick={handleCreateAndAssign} disabled={!newName.trim()} className="btn-neon rounded">Create & Assign</Button>
                <Button size="sm" variant="ghost" onClick={() => setShowNewArtist(false)} className="text-white/40 hover:text-white hover:bg-white/[0.03]">Cancel</Button>
              </div>
            </div>
          )}

          {/* Backup artist list panel */}
          {showBackupList && (
            <div className="border border-[#ffcc00]/20 rounded-lg p-3 bg-[#ffcc00]/[0.03] space-y-2">
              <div className="flex items-center justify-between mb-2">
                <p className="text-sm font-bold text-[#ffcc00] flex items-center gap-1.5">
                  <Users className="h-4 w-4" /> Backup Artist Waitlist
                </p>
                <Button size="sm" variant="ghost" onClick={() => setShowBackupList(false)} className="text-white/40 hover:text-white hover:bg-white/[0.03] h-7 px-2 text-xs">
                  Close
                </Button>
              </div>
              {loadingBackup ? (
                <p className="text-white/30 text-sm text-center py-3">Loading...</p>
              ) : backupArtists.length === 0 ? (
                <p className="text-white/30 text-sm text-center py-3">No backup artists waiting</p>
              ) : (
                <div className="max-h-48 overflow-y-auto space-y-1.5">
                  {backupArtists.map(ba => (
                    <div
                      key={ba.id}
                      className="flex items-center justify-between bg-white/[0.02] border border-white/[0.06] rounded p-2.5 hover:border-[#ffcc00]/30 transition-colors"
                    >
                      <div className="flex items-center gap-2.5 min-w-0">
                        <span className={`text-xs font-black w-7 h-7 flex items-center justify-center shrink-0 ${
                          ba.waitlist_position <= 16
                            ? 'bg-[#ffcc00]/20 text-[#ffcc00] border border-[#ffcc00]/30'
                            : 'bg-white/[0.05] text-white/40 border border-white/[0.08]'
                        }`}>
                          #{ba.waitlist_position}
                        </span>
                        <div className="min-w-0">
                          <p className="text-sm text-white font-medium truncate flex items-center gap-1">
                            {ba.name}
                            {ba.waitlist_position <= 16 && <Crown className="h-3 w-3 text-[#ffcc00]" />}
                          </p>
                          <p className="text-xs text-white/30 truncate" style={{ fontFamily: 'Inter, sans-serif', textTransform: 'none', letterSpacing: 'normal' }}>
                            {ba.email || ba.phone || 'No contact info'}
                          </p>
                        </div>
                      </div>
                      <Button
                        size="sm"
                        onClick={() => handlePromoteBackupArtist(ba)}
                        className="bg-[#ffcc00]/10 hover:bg-[#ffcc00]/20 text-[#ffcc00] border border-[#ffcc00]/30 h-7 px-2.5 text-xs font-bold shrink-0"
                      >
                        Assign <ArrowRight className="h-3 w-3 ml-1" />
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Notes */}
          <div>
            <label className="text-sm font-medium text-white/40" style={{ fontFamily: 'Inter, sans-serif', textTransform: 'none', letterSpacing: 'normal' }}>Notes</label>
            <Textarea
              defaultValue={assignment?.notes ?? ''}
              onBlur={(e) => handleNotesChange(e.target.value)}
              placeholder="Add notes..."
              rows={2}
              className="bg-white/[0.03] border-white/[0.08] text-white placeholder:text-white/20"
            />
          </div>

          {/* Assignment date */}
          {assignment?.assigned_at && (
            <div className="text-xs text-white/20" style={{ fontFamily: 'Inter, sans-serif', textTransform: 'none', letterSpacing: 'normal' }}>
              Assigned: {format(new Date(assignment.assigned_at), 'MMM d, yyyy h:mm a')}
            </div>
          )}

          {/* Status History */}
          {history && history.length > 0 && (
            <div>
              <label className="text-sm font-medium text-white/40" style={{ fontFamily: 'Inter, sans-serif', textTransform: 'none', letterSpacing: 'normal' }}>History</label>
              <div className="max-h-32 overflow-y-auto space-y-1 mt-1">
                {history.map(h => (
                  <div key={h.id} className="text-xs text-white/25 flex justify-between" style={{ fontFamily: 'Inter, sans-serif', textTransform: 'none', letterSpacing: 'normal' }}>
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
