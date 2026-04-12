import { useState, useMemo, useEffect } from 'react';
import { useArtists, useGridAssignments, useCreateArtist, useUpdateArtist, useDeleteArtist, useUpdateGridAssignment } from '@/hooks/useGridAssignments';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { Pencil, Trash2, Upload, Plus, Download, Search, Users, Crown, ArrowRight, X } from 'lucide-react';
import { Database } from '@/integrations/supabase/types';
import { useQueryClient } from '@tanstack/react-query';

type GridStatus = Database['public']['Enums']['grid_status'];

type BackupArtist = {
  id: string;
  name: string;
  email: string | null;
  phone: string | null;
  bio: string | null;
  website: string | null;
  social_handle: string | null;
  aviation_connection: boolean | null;
  aviation_description: string | null;
  waitlist_position: number;
  status: string;
  assigned_grid_cell: string | null;
  promoted_at: string | null;
  created_at: string;
};

const STATUS_OPTIONS: { value: GridStatus; label: string }[] = [
  { value: 'registered', label: 'Registered' },
  { value: 'picked_up', label: 'Picked Up' },
  { value: 'dropped_off', label: 'Dropped Off' },
];

export default function Artists() {
  const queryClient = useQueryClient();
  const { data: artists, isLoading } = useArtists();
  const { data: assignments } = useGridAssignments();
  const createArtist = useCreateArtist();
  const updateArtist = useUpdateArtist();
  const deleteArtist = useDeleteArtist();
  const updateGrid = useUpdateGridAssignment();

  const [activeTab, setActiveTab] = useState<'primary' | 'backup'>('primary');
  const [search, setSearch] = useState('');
  const [showAdd, setShowAdd] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [form, setForm] = useState({ name: '', email: '', phone: '', gridCell: '', status: '' as string });
  const [showImport, setShowImport] = useState(false);

  // Backup artist state
  const [backupArtists, setBackupArtists] = useState<BackupArtist[]>([]);
  const [loadingBackup, setLoadingBackup] = useState(false);
  const [backupSearch, setBackupSearch] = useState('');

  // Load backup artists
  const loadBackupArtists = async () => {
    setLoadingBackup(true);
    const { data, error } = await supabase
      .from('backup_artists')
      .select('*')
      .order('waitlist_position');
    if (!error && data) setBackupArtists(data as BackupArtist[]);
    setLoadingBackup(false);
  };

  useEffect(() => {
    if (activeTab === 'backup') loadBackupArtists();
  }, [activeTab]);

  const artistGridMap = useMemo(() => {
    const map = new Map<string, { grid_cell: string; status: GridStatus }>();
    assignments?.forEach(a => {
      if (a.artist_id) map.set(a.artist_id, { grid_cell: a.grid_cell, status: a.status });
    });
    return map;
  }, [assignments]);

  const availableGridCells = useMemo(() => {
    if (!assignments) return [];
    return assignments
      .filter(a => !a.artist_id || a.artist_id === editId)
      .map(a => a.grid_cell)
      .sort((a, b) => {
        const [aCol, aRow] = [a[0], parseInt(a.slice(1))];
        const [bCol, bRow] = [b[0], parseInt(b.slice(1))];
        return aCol === bCol ? aRow - bRow : aCol.localeCompare(bCol);
      });
  }, [assignments, editId]);

  const defaultForm = { name: '', email: '', phone: '', gridCell: '', status: '' };

  const filtered = useMemo(() => {
    if (!artists) return [];
    if (!search) return artists;
    const q = search.toLowerCase();
    return artists.filter(a =>
      a.name.toLowerCase().includes(q) ||
      a.email?.toLowerCase().includes(q) ||
      a.phone?.includes(q) ||
      artistGridMap.get(a.id)?.grid_cell.toLowerCase().includes(q)
    );
  }, [artists, search, artistGridMap]);

  const filteredBackup = useMemo(() => {
    if (!backupSearch) return backupArtists;
    const q = backupSearch.toLowerCase();
    return backupArtists.filter(a =>
      a.name.toLowerCase().includes(q) ||
      a.email?.toLowerCase().includes(q) ||
      a.phone?.includes(q)
    );
  }, [backupArtists, backupSearch]);

  const backupStats = useMemo(() => {
    const waiting = backupArtists.filter(a => a.status === 'waiting').length;
    const assigned = backupArtists.filter(a => a.status === 'assigned').length;
    const priority = backupArtists.filter(a => a.waitlist_position <= 16 && a.status === 'waiting').length;
    return { total: backupArtists.length, waiting, assigned, priority };
  }, [backupArtists]);

  const handleSave = async () => {
    if (!form.name.trim()) return;
    try {
      let artistId = editId;
      if (editId) {
        await updateArtist.mutateAsync({ id: editId, name: form.name, email: form.email, phone: form.phone });
        toast.success('Artist updated');
      } else {
        const created = await createArtist.mutateAsync({ name: form.name, email: form.email, phone: form.phone });
        artistId = created.id;
        toast.success('Artist added');
      }

      if (form.gridCell && artistId) {
        await updateGrid.mutateAsync({
          gridCell: form.gridCell,
          artistId,
          status: (form.status as GridStatus) || 'registered',
        });
      }

      if (editId) {
        const oldGrid = artistGridMap.get(editId);
        if (oldGrid && oldGrid.grid_cell !== form.gridCell) {
          await updateGrid.mutateAsync({
            gridCell: oldGrid.grid_cell,
            artistId: null,
            status: 'registered',
          });
        }
      }

      setShowAdd(false);
      setEditId(null);
      setForm(defaultForm);
    } catch {
      toast.error('Failed to save artist');
    }
  };

  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`Remove ${name}?`)) return;
    try {
      await deleteArtist.mutateAsync(id);
      toast.success('Artist removed');
    } catch {
      toast.error('Failed to remove artist');
    }
  };

  const handleDeleteBackup = async (id: string, name: string) => {
    if (!confirm(`Remove backup artist ${name}?`)) return;
    try {
      const { error } = await supabase.from('backup_artists').delete().eq('id', id);
      if (error) throw error;
      toast.success('Backup artist removed');
      loadBackupArtists();
    } catch {
      toast.error('Failed to remove backup artist');
    }
  };

  const handlePromoteBackup = async (backup: BackupArtist) => {
    if (availableGridCells.length === 0) {
      toast.error('No available grid cells to assign');
      return;
    }
    const gridCell = prompt(`Assign ${backup.name} to which grid cell?\n\nAvailable: ${availableGridCells.slice(0, 20).join(', ')}${availableGridCells.length > 20 ? '...' : ''}`);
    if (!gridCell) return;

    if (!availableGridCells.includes(gridCell.toUpperCase())) {
      toast.error(`Grid cell ${gridCell} is not available`);
      return;
    }

    try {
      const artist = await createArtist.mutateAsync({
        name: backup.name,
        email: backup.email || undefined,
        phone: backup.phone || undefined,
      });

      await updateGrid.mutateAsync({ gridCell: gridCell.toUpperCase(), artistId: artist.id, status: 'registered' });

      await supabase
        .from('backup_artists')
        .update({
          status: 'assigned',
          assigned_grid_cell: gridCell.toUpperCase(),
          promoted_at: new Date().toISOString(),
        })
        .eq('id', backup.id);

      toast.success(`${backup.name} promoted and assigned to ${gridCell.toUpperCase()}!`);
      loadBackupArtists();
      queryClient.invalidateQueries({ queryKey: ['artists'] });
      queryClient.invalidateQueries({ queryKey: ['grid_assignments'] });
    } catch {
      toast.error('Failed to promote backup artist');
    }
  };

  const handleCSVImport = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const text = await file.text();
    const lines = text.split('\n').filter(l => l.trim());
    const header = lines[0].toLowerCase();
    const hasHeader = header.includes('name');
    const dataLines = hasHeader ? lines.slice(1) : lines;

    let count = 0;
    for (const line of dataLines) {
      const parts = line.split(',').map(s => s.trim().replace(/^"|"$/g, ''));
      if (parts[0]) {
        try {
          await createArtist.mutateAsync({ name: parts[0], email: parts[1] || undefined, phone: parts[2] || undefined });
          count++;
        } catch { /* skip duplicates */ }
      }
    }
    toast.success(`Imported ${count} artists`);
    setShowImport(false);
  };

  const handleExport = () => {
    if (!artists) return;
    const rows = [['Name', 'Email', 'Phone', 'Grid Cell', 'Status']];
    artists.forEach(a => {
      const grid = artistGridMap.get(a.id);
      rows.push([a.name, a.email || '', a.phone || '', grid?.grid_cell || '', grid?.status || '']);
    });
    const csv = rows.map(r => r.map(c => `"${c}"`).join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'mural-artists.csv';
    link.click();
    URL.revokeObjectURL(url);
  };

  const handleExportBackup = () => {
    const rows = [['Position', 'Name', 'Email', 'Phone', 'Bio', 'Status', 'Assigned Cell']];
    backupArtists.forEach(a => {
      rows.push([
        String(a.waitlist_position),
        a.name,
        a.email || '',
        a.phone || '',
        a.bio || '',
        a.status,
        a.assigned_grid_cell || '',
      ]);
    });
    const csv = rows.map(r => r.map(c => `"${c}"`).join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'backup-artists.csv';
    link.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-4">
      {/* Tab Switcher */}
      <div className="flex items-center gap-1 bg-white/[0.02] border border-white/[0.06] rounded-lg p-1">
        <button
          onClick={() => setActiveTab('primary')}
          className={`flex-1 px-4 py-2.5 text-sm font-bold uppercase tracking-wider rounded transition-all ${
            activeTab === 'primary'
              ? 'bg-[#dc2626]/15 text-[#dc2626] border border-[#dc2626]/25'
              : 'text-white/40 hover:text-white/60 border border-transparent'
          }`}
        >
          Primary Artists ({artists?.length || 0})
        </button>
        <button
          onClick={() => setActiveTab('backup')}
          className={`flex-1 px-4 py-2.5 text-sm font-bold uppercase tracking-wider rounded transition-all flex items-center justify-center gap-2 ${
            activeTab === 'backup'
              ? 'bg-[#ffcc00]/15 text-[#ffcc00] border border-[#ffcc00]/25'
              : 'text-white/40 hover:text-white/60 border border-transparent'
          }`}
        >
          <Users className="h-4 w-4" /> Backup Waitlist ({backupStats.total})
        </button>
      </div>

      {/* ========== PRIMARY ARTISTS TAB ========== */}
      {activeTab === 'primary' && (
        <>
          <div className="flex flex-wrap items-center gap-3">
            <div className="relative flex-1 min-w-[200px]">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-white/20" />
              <Input
                placeholder="Search artists, grid cells..."
                value={search}
                onChange={e => setSearch(e.target.value)}
                className="pl-9 bg-white/[0.03] border-white/[0.08] text-white placeholder:text-white/20 focus:border-[#dc2626]/50"
              />
            </div>
            <Button onClick={() => { setForm(defaultForm); setEditId(null); setShowAdd(true); }} className="btn-neon rounded">
              <Plus className="h-4 w-4 mr-1" /> Add Artist
            </Button>
            <Button variant="outline" onClick={() => setShowImport(true)} className="border-white/[0.08] text-white/50 hover:bg-white/[0.03] hover:text-[#dc2626] hover:border-[#dc2626]/30">
              <Upload className="h-4 w-4 mr-1" /> Import CSV
            </Button>
            <Button variant="outline" onClick={handleExport} className="border-white/[0.08] text-white/50 hover:bg-white/[0.03] hover:text-[#dc2626] hover:border-[#dc2626]/30">
              <Download className="h-4 w-4 mr-1" /> Export
            </Button>
          </div>

          {isLoading ? (
            <div className="text-white/30 text-center py-8">Loading...</div>
          ) : (
            <div className="rounded-lg border border-white/[0.06] bg-white/[0.01] overflow-auto">
              <Table>
                <TableHeader>
                  <TableRow className="border-white/[0.06] hover:bg-transparent">
                    <TableHead className="text-white/40 font-bold uppercase text-xs tracking-wider">Name</TableHead>
                    <TableHead className="text-white/40 font-bold uppercase text-xs tracking-wider">Email</TableHead>
                    <TableHead className="text-white/40 font-bold uppercase text-xs tracking-wider">Phone</TableHead>
                    <TableHead className="text-white/40 font-bold uppercase text-xs tracking-wider">Grid</TableHead>
                    <TableHead className="text-white/40 font-bold uppercase text-xs tracking-wider">Status</TableHead>
                    <TableHead className="w-[80px]"></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filtered?.map(a => {
                    const grid = artistGridMap.get(a.id);
                    return (
                      <TableRow key={a.id} className="border-white/[0.04] hover:bg-white/[0.02]">
                        <TableCell className="font-medium text-white">{a.name}</TableCell>
                        <TableCell className="text-white/50" style={{ fontFamily: 'Inter, sans-serif', textTransform: 'none', letterSpacing: 'normal' }}>{a.email || '—'}</TableCell>
                        <TableCell className="text-white/50" style={{ fontFamily: 'Inter, sans-serif', textTransform: 'none', letterSpacing: 'normal' }}>{a.phone || '—'}</TableCell>
                        <TableCell>
                          {grid?.grid_cell ? (
                            <span className="px-2 py-0.5 rounded bg-[#dc2626]/15 text-[#dc2626] text-xs font-bold border border-[#dc2626]/25">
                              {grid.grid_cell}
                            </span>
                          ) : (
                            <span className="text-white/20">—</span>
                          )}
                        </TableCell>
                        <TableCell className="capitalize text-white/40" style={{ fontFamily: 'Inter, sans-serif', textTransform: 'none', letterSpacing: 'normal' }}>{grid?.status?.replace('_', ' ') || '—'}</TableCell>
                        <TableCell>
                          <div className="flex gap-1">
                            <Button variant="ghost" size="icon" onClick={() => { const g = artistGridMap.get(a.id); setForm({ name: a.name, email: a.email || '', phone: a.phone || '', gridCell: g?.grid_cell || '', status: g?.status || '' }); setEditId(a.id); setShowAdd(true); }} className="text-white/30 hover:text-[#dc2626] hover:bg-white/[0.03]">
                              <Pencil className="h-4 w-4" />
                            </Button>
                            <Button variant="ghost" size="icon" onClick={() => handleDelete(a.id, a.name)} className="text-white/30 hover:text-red-400 hover:bg-red-500/10">
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                  {filtered?.length === 0 && (
                    <TableRow><TableCell colSpan={6} className="text-center text-white/20 py-8">No artists found</TableCell></TableRow>
                  )}
                </TableBody>
              </Table>
            </div>
          )}
        </>
      )}

      {/* ========== BACKUP WAITLIST TAB ========== */}
      {activeTab === 'backup' && (
        <>
          {/* Stats bar */}
          <div className="grid grid-cols-4 gap-3">
            <div className="bg-white/[0.02] border border-white/[0.06] rounded-lg p-3 text-center">
              <div className="text-2xl font-black text-white">{backupStats.total}</div>
              <div className="text-xs text-white/30 uppercase tracking-wider font-bold mt-0.5">Total</div>
            </div>
            <div className="bg-[#ffcc00]/[0.05] border border-[#ffcc00]/20 rounded-lg p-3 text-center">
              <div className="text-2xl font-black text-[#ffcc00]">{backupStats.priority}</div>
              <div className="text-xs text-[#ffcc00]/50 uppercase tracking-wider font-bold mt-0.5">Priority</div>
            </div>
            <div className="bg-white/[0.02] border border-white/[0.06] rounded-lg p-3 text-center">
              <div className="text-2xl font-black text-white">{backupStats.waiting}</div>
              <div className="text-xs text-white/30 uppercase tracking-wider font-bold mt-0.5">Waiting</div>
            </div>
            <div className="bg-green-500/[0.05] border border-green-500/20 rounded-lg p-3 text-center">
              <div className="text-2xl font-black text-green-400">{backupStats.assigned}</div>
              <div className="text-xs text-green-400/50 uppercase tracking-wider font-bold mt-0.5">Promoted</div>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <div className="relative flex-1 min-w-[200px]">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-white/20" />
              <Input
                placeholder="Search backup artists..."
                value={backupSearch}
                onChange={e => setBackupSearch(e.target.value)}
                className="pl-9 bg-white/[0.03] border-white/[0.08] text-white placeholder:text-white/20 focus:border-[#ffcc00]/50"
              />
            </div>
            <Button variant="outline" onClick={handleExportBackup} className="border-white/[0.08] text-white/50 hover:bg-white/[0.03] hover:text-[#ffcc00] hover:border-[#ffcc00]/30">
              <Download className="h-4 w-4 mr-1" /> Export CSV
            </Button>
            <Button variant="outline" onClick={loadBackupArtists} className="border-white/[0.08] text-white/50 hover:bg-white/[0.03] hover:text-[#ffcc00] hover:border-[#ffcc00]/30">
              Refresh
            </Button>
          </div>

          {loadingBackup ? (
            <div className="text-white/30 text-center py-8">Loading...</div>
          ) : (
            <div className="rounded-lg border border-white/[0.06] bg-white/[0.01] overflow-auto">
              <Table>
                <TableHeader>
                  <TableRow className="border-white/[0.06] hover:bg-transparent">
                    <TableHead className="text-white/40 font-bold uppercase text-xs tracking-wider w-[60px]">#</TableHead>
                    <TableHead className="text-white/40 font-bold uppercase text-xs tracking-wider">Name</TableHead>
                    <TableHead className="text-white/40 font-bold uppercase text-xs tracking-wider">Email</TableHead>
                    <TableHead className="text-white/40 font-bold uppercase text-xs tracking-wider">Phone</TableHead>
                    <TableHead className="text-white/40 font-bold uppercase text-xs tracking-wider">Status</TableHead>
                    <TableHead className="text-white/40 font-bold uppercase text-xs tracking-wider">Assigned</TableHead>
                    <TableHead className="w-[120px]"></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredBackup.map(ba => (
                    <TableRow key={ba.id} className="border-white/[0.04] hover:bg-white/[0.02]">
                      <TableCell>
                        <span className={`inline-flex items-center justify-center w-8 h-8 text-xs font-black ${
                          ba.waitlist_position <= 16
                            ? 'bg-[#ffcc00]/15 text-[#ffcc00] border border-[#ffcc00]/25'
                            : 'bg-white/[0.05] text-white/40 border border-white/[0.08]'
                        }`}>
                          {ba.waitlist_position}
                          {ba.waitlist_position <= 16 && <Crown className="h-2.5 w-2.5 ml-0.5" />}
                        </span>
                      </TableCell>
                      <TableCell className="font-medium text-white">{ba.name}</TableCell>
                      <TableCell className="text-white/50" style={{ fontFamily: 'Inter, sans-serif', textTransform: 'none', letterSpacing: 'normal' }}>{ba.email || '—'}</TableCell>
                      <TableCell className="text-white/50" style={{ fontFamily: 'Inter, sans-serif', textTransform: 'none', letterSpacing: 'normal' }}>{ba.phone || '—'}</TableCell>
                      <TableCell>
                        <span className={`px-2 py-0.5 rounded text-xs font-bold border ${
                          ba.status === 'waiting'
                            ? 'bg-[#ffcc00]/10 text-[#ffcc00] border-[#ffcc00]/25'
                            : ba.status === 'assigned'
                            ? 'bg-green-500/10 text-green-400 border-green-500/25'
                            : ba.status === 'declined'
                            ? 'bg-red-500/10 text-red-400 border-red-500/25'
                            : 'bg-blue-500/10 text-blue-400 border-blue-500/25'
                        }`}>
                          {ba.status}
                        </span>
                      </TableCell>
                      <TableCell>
                        {ba.assigned_grid_cell ? (
                          <span className="px-2 py-0.5 rounded bg-green-500/15 text-green-400 text-xs font-bold border border-green-500/25">
                            {ba.assigned_grid_cell}
                          </span>
                        ) : (
                          <span className="text-white/20">—</span>
                        )}
                      </TableCell>
                      <TableCell>
                        <div className="flex gap-1">
                          {ba.status === 'waiting' && (
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handlePromoteBackup(ba)}
                              className="text-[#ffcc00]/60 hover:text-[#ffcc00] hover:bg-[#ffcc00]/10 h-7 px-2 text-xs font-bold"
                            >
                              Promote <ArrowRight className="h-3 w-3 ml-1" />
                            </Button>
                          )}
                          <Button variant="ghost" size="icon" onClick={() => handleDeleteBackup(ba.id, ba.name)} className="text-white/30 hover:text-red-400 hover:bg-red-500/10 h-7 w-7">
                            <Trash2 className="h-3.5 w-3.5" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                  {filteredBackup.length === 0 && (
                    <TableRow><TableCell colSpan={7} className="text-center text-white/20 py-8">No backup artists found</TableCell></TableRow>
                  )}
                </TableBody>
              </Table>
            </div>
          )}
        </>
      )}

      {/* Add/Edit Dialog */}
      <Dialog open={showAdd} onOpenChange={setShowAdd}>
        <DialogContent className="bg-[#0a0a0a] border-white/[0.08] text-white">
          <DialogHeader>
            <DialogTitle className="text-white">{editId ? 'Edit Artist' : 'Add Artist'}</DialogTitle>
          </DialogHeader>
          <div className="space-y-3">
            <Input placeholder="Name *" value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} className="bg-white/[0.03] border-white/[0.08] text-white placeholder:text-white/20" />
            <Input placeholder="Email" value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))} className="bg-white/[0.03] border-white/[0.08] text-white placeholder:text-white/20" />
            <Input placeholder="Phone" value={form.phone} onChange={e => setForm(f => ({ ...f, phone: e.target.value }))} className="bg-white/[0.03] border-white/[0.08] text-white placeholder:text-white/20" />
            <div>
              <label className="text-sm font-medium mb-1 block text-white/40" style={{ fontFamily: 'Inter, sans-serif', textTransform: 'none', letterSpacing: 'normal' }}>Grid Cell</label>
              <Select value={form.gridCell} onValueChange={v => setForm(f => ({ ...f, gridCell: v }))}>
                <SelectTrigger className="bg-white/[0.03] border-white/[0.08] text-white">
                  <SelectValue placeholder="Select grid cell" />
                </SelectTrigger>
                <SelectContent className="bg-[#111] border-white/[0.08]">
                  {availableGridCells.map(cell => (
                    <SelectItem key={cell} value={cell} className="text-white/70 focus:bg-white/[0.05] focus:text-white">{cell}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="text-sm font-medium mb-1 block text-white/40" style={{ fontFamily: 'Inter, sans-serif', textTransform: 'none', letterSpacing: 'normal' }}>Status</label>
              <Select value={form.status} onValueChange={v => setForm(f => ({ ...f, status: v }))}>
                <SelectTrigger className="bg-white/[0.03] border-white/[0.08] text-white">
                  <SelectValue placeholder="Select status" />
                </SelectTrigger>
                <SelectContent className="bg-[#111] border-white/[0.08]">
                  {STATUS_OPTIONS.map(opt => (
                    <SelectItem key={opt.value} value={opt.value} className="text-white/70 focus:bg-white/[0.05] focus:text-white">{opt.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <Button onClick={handleSave} disabled={!form.name.trim()} className="w-full btn-neon rounded">
              {editId ? 'Update' : 'Add Artist'}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* CSV Import Dialog */}
      <Dialog open={showImport} onOpenChange={setShowImport}>
        <DialogContent className="bg-[#0a0a0a] border-white/[0.08] text-white">
          <DialogHeader>
            <DialogTitle className="text-white">Import Artists from CSV</DialogTitle>
          </DialogHeader>
          <p className="text-sm text-white/40" style={{ fontFamily: 'Inter, sans-serif', textTransform: 'none', letterSpacing: 'normal' }}>CSV format: Name, Email, Phone (one per line)</p>
          <Input type="file" accept=".csv" onChange={handleCSVImport} className="bg-white/[0.03] border-white/[0.08] text-white" />
        </DialogContent>
      </Dialog>
    </div>
  );
}
