import { useState, useMemo } from 'react';
import { useArtists, useGridAssignments, useCreateArtist, useUpdateArtist, useDeleteArtist, useUpdateGridAssignment } from '@/hooks/useGridAssignments';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from 'sonner';
import { Pencil, Trash2, Upload, Plus, Download, Search } from 'lucide-react';
import { Database } from '@/integrations/supabase/types';

type GridStatus = Database['public']['Enums']['grid_status'];

const STATUS_OPTIONS: { value: GridStatus; label: string }[] = [
  { value: 'registered', label: 'Registered' },
  { value: 'picked_up', label: 'Picked Up' },
  { value: 'dropped_off', label: 'Dropped Off' },
];

export default function Artists() {
  const { data: artists, isLoading } = useArtists();
  const { data: assignments } = useGridAssignments();
  const createArtist = useCreateArtist();
  const updateArtist = useUpdateArtist();
  const deleteArtist = useDeleteArtist();
  const updateGrid = useUpdateGridAssignment();

  const [search, setSearch] = useState('');
  const [showAdd, setShowAdd] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [form, setForm] = useState({ name: '', email: '', phone: '', gridCell: '', status: '' as string });
  const [showImport, setShowImport] = useState(false);

  // Map artist ID to grid assignments
  const artistGridMap = useMemo(() => {
    const map = new Map<string, { grid_cell: string; status: GridStatus }>();
    assignments?.forEach(a => {
      if (a.artist_id) map.set(a.artist_id, { grid_cell: a.grid_cell, status: a.status });
    });
    return map;
  }, [assignments]);

  // Available grid cells (unassigned or currently assigned to editing artist)
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

      // Handle grid assignment
      if (form.gridCell && artistId) {
        await updateGrid.mutateAsync({
          gridCell: form.gridCell,
          artistId,
          status: (form.status as GridStatus) || 'registered',
        });
      }

      // If editing and grid cell changed, clear old assignment
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

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-3">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-white/30" />
          <Input
            placeholder="Search artists, grid cells..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="pl-9 bg-white/5 border-white/10 text-white placeholder:text-white/30 focus:border-amber-500/50"
          />
        </div>
        <Button onClick={() => { setForm(defaultForm); setEditId(null); setShowAdd(true); }} className="bg-amber-500 hover:bg-amber-600 text-white">
          <Plus className="h-4 w-4 mr-1" /> Add Artist
        </Button>
        <Button variant="outline" onClick={() => setShowImport(true)} className="border-white/10 text-white/60 hover:bg-white/5 hover:text-white">
          <Upload className="h-4 w-4 mr-1" /> Import CSV
        </Button>
        <Button variant="outline" onClick={handleExport} className="border-white/10 text-white/60 hover:bg-white/5 hover:text-white">
          <Download className="h-4 w-4 mr-1" /> Export
        </Button>
      </div>

      {isLoading ? (
        <div className="text-white/40 text-center py-8">Loading...</div>
      ) : (
        <div className="rounded-lg border border-white/10 bg-white/3 overflow-auto">
          <Table>
            <TableHeader>
              <TableRow className="border-white/10 hover:bg-transparent">
                <TableHead className="text-white/50">Name</TableHead>
                <TableHead className="text-white/50">Email</TableHead>
                <TableHead className="text-white/50">Phone</TableHead>
                <TableHead className="text-white/50">Grid</TableHead>
                <TableHead className="text-white/50">Status</TableHead>
                <TableHead className="w-[80px]"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered?.map(a => {
                const grid = artistGridMap.get(a.id);
                return (
                  <TableRow key={a.id} className="border-white/5 hover:bg-white/5">
                    <TableCell className="font-medium text-white">{a.name}</TableCell>
                    <TableCell className="text-white/60">{a.email || '—'}</TableCell>
                    <TableCell className="text-white/60">{a.phone || '—'}</TableCell>
                    <TableCell>
                      {grid?.grid_cell ? (
                        <span className="px-2 py-0.5 rounded bg-amber-500/20 text-amber-400 text-xs font-bold border border-amber-500/30">
                          {grid.grid_cell}
                        </span>
                      ) : (
                        <span className="text-white/30">—</span>
                      )}
                    </TableCell>
                    <TableCell className="capitalize text-white/50">{grid?.status?.replace('_', ' ') || '—'}</TableCell>
                    <TableCell>
                      <div className="flex gap-1">
                        <Button variant="ghost" size="icon" onClick={() => { const g = artistGridMap.get(a.id); setForm({ name: a.name, email: a.email || '', phone: a.phone || '', gridCell: g?.grid_cell || '', status: g?.status || '' }); setEditId(a.id); setShowAdd(true); }} className="text-white/40 hover:text-white hover:bg-white/5">
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="icon" onClick={() => handleDelete(a.id, a.name)} className="text-white/40 hover:text-red-400 hover:bg-red-500/10">
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                );
              })}
              {filtered?.length === 0 && (
                <TableRow><TableCell colSpan={6} className="text-center text-white/30 py-8">No artists found</TableCell></TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      )}

      {/* Add/Edit Dialog */}
      <Dialog open={showAdd} onOpenChange={setShowAdd}>
        <DialogContent className="bg-[hsl(222,40%,12%)] border-white/10 text-white">
          <DialogHeader>
            <DialogTitle className="text-white">{editId ? 'Edit Artist' : 'Add Artist'}</DialogTitle>
          </DialogHeader>
          <div className="space-y-3">
            <Input placeholder="Name *" value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} className="bg-white/5 border-white/10 text-white placeholder:text-white/30" />
            <Input placeholder="Email" value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))} className="bg-white/5 border-white/10 text-white placeholder:text-white/30" />
            <Input placeholder="Phone" value={form.phone} onChange={e => setForm(f => ({ ...f, phone: e.target.value }))} className="bg-white/5 border-white/10 text-white placeholder:text-white/30" />
            <div>
              <label className="text-sm font-medium mb-1 block text-white/50">Grid Cell</label>
              <Select value={form.gridCell} onValueChange={v => setForm(f => ({ ...f, gridCell: v }))}>
                <SelectTrigger className="bg-white/5 border-white/10 text-white">
                  <SelectValue placeholder="Select grid cell" />
                </SelectTrigger>
                <SelectContent className="bg-[hsl(222,40%,15%)] border-white/10">
                  {availableGridCells.map(cell => (
                    <SelectItem key={cell} value={cell} className="text-white/80 focus:bg-white/10 focus:text-white">{cell}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="text-sm font-medium mb-1 block text-white/50">Status</label>
              <Select value={form.status} onValueChange={v => setForm(f => ({ ...f, status: v }))}>
                <SelectTrigger className="bg-white/5 border-white/10 text-white">
                  <SelectValue placeholder="Select status" />
                </SelectTrigger>
                <SelectContent className="bg-[hsl(222,40%,15%)] border-white/10">
                  {STATUS_OPTIONS.map(opt => (
                    <SelectItem key={opt.value} value={opt.value} className="text-white/80 focus:bg-white/10 focus:text-white">{opt.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <Button onClick={handleSave} disabled={!form.name.trim()} className="w-full bg-amber-500 hover:bg-amber-600 text-white">
              {editId ? 'Update' : 'Add Artist'}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* CSV Import Dialog */}
      <Dialog open={showImport} onOpenChange={setShowImport}>
        <DialogContent className="bg-[hsl(222,40%,12%)] border-white/10 text-white">
          <DialogHeader>
            <DialogTitle className="text-white">Import Artists from CSV</DialogTitle>
          </DialogHeader>
          <p className="text-sm text-white/50">CSV format: Name, Email, Phone (one per line)</p>
          <Input type="file" accept=".csv" onChange={handleCSVImport} className="bg-white/5 border-white/10 text-white" />
        </DialogContent>
      </Dialog>
    </div>
  );
}
