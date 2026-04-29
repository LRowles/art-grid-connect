import { useState, useMemo, useRef } from 'react';
import { useGridAssignments, GridAssignmentWithArtist } from '@/hooks/useGridAssignments';
import { Database } from '@/integrations/supabase/types';
import { Download, Printer, Search, Filter, CheckCircle2, Circle, Truck } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { format } from 'date-fns';

type GridStatus = Database['public']['Enums']['grid_status'];

const STATUS_CONFIG: Record<GridStatus, { label: string; color: string; icon: typeof Circle }> = {
  registered: { label: 'Registered', color: 'text-[#dc2626]', icon: Circle },
  picked_up: { label: 'Picked Up', color: 'text-yellow-400', icon: Truck },
  dropped_off: { label: 'Returned', color: 'text-emerald-400', icon: CheckCircle2 },
};

type FilterStatus = 'all' | GridStatus;

export default function Tracking() {
  const { data: assignments, isLoading } = useGridAssignments();
  const [search, setSearch] = useState('');
  const [filterStatus, setFilterStatus] = useState<FilterStatus>('all');
  const printRef = useRef<HTMLDivElement>(null);

  // Filter to only assigned cells
  const assignedCells = useMemo(() => {
    if (!assignments) return [];
    return assignments
      .filter(a => !!a.artist_id)
      .sort((a, b) => a.grid_cell.localeCompare(b.grid_cell, undefined, { numeric: true }));
  }, [assignments]);

  // Apply search and status filter
  const filteredCells = useMemo(() => {
    let result = assignedCells;
    if (filterStatus !== 'all') {
      result = result.filter(a => a.status === filterStatus);
    }
    if (search.trim()) {
      const q = search.toLowerCase();
      result = result.filter(a =>
        a.grid_cell.toLowerCase().includes(q) ||
        a.artists?.name?.toLowerCase().includes(q) ||
        a.artists?.email?.toLowerCase().includes(q)
      );
    }
    return result;
  }, [assignedCells, filterStatus, search]);

  // Stats
  const stats = useMemo(() => {
    const counts = { total: assignedCells.length, registered: 0, picked_up: 0, dropped_off: 0 };
    assignedCells.forEach(a => {
      if (a.status in counts) counts[a.status as keyof Omit<typeof counts, 'total'>]++;
    });
    return counts;
  }, [assignedCells]);

  // CSV Export
  const handleExportCSV = () => {
    const headers = ['Square', 'Artist Name', 'Email', 'Phone', 'Status', 'Registered Date', 'Notes'];
    const rows = filteredCells.map(a => [
      a.grid_cell,
      a.artists?.name || '',
      a.artists?.email || '',
      a.artists?.phone || '',
      STATUS_CONFIG[a.status as GridStatus]?.label || a.status,
      a.assigned_at ? format(new Date(a.assigned_at), 'M/d/yyyy') : '',
      (a.notes || '').replace(/,/g, ';'),
    ]);
    const csv = [headers.join(','), ...rows.map(r => r.map(c => `"${c}"`).join(','))].join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `mural-tracking-${format(new Date(), 'yyyy-MM-dd')}.csv`;
    link.click();
    URL.revokeObjectURL(url);
  };

  // Print checklist
  const handlePrint = () => {
    const printContent = printRef.current;
    if (!printContent) return;
    const printWindow = window.open('', '_blank');
    if (!printWindow) return;
    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
      <head>
        <title>Art of Aviation — Canvas ${filterStatus === 'registered' ? 'Pickup' : filterStatus === 'picked_up' ? 'Return' : ''} Checklist</title>
        <style>
          body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; padding: 20px; color: #111; }
          h1 { font-size: 20px; margin-bottom: 4px; }
          h2 { font-size: 14px; color: #666; font-weight: normal; margin-bottom: 20px; }
          table { width: 100%; border-collapse: collapse; font-size: 13px; }
          th { text-align: left; padding: 8px 12px; border-bottom: 2px solid #333; font-weight: 700; }
          td { padding: 8px 12px; border-bottom: 1px solid #ddd; }
          tr:nth-child(even) { background: #f9f9f9; }
          .checkbox { width: 18px; height: 18px; border: 2px solid #333; display: inline-block; vertical-align: middle; }
          .status { font-size: 11px; padding: 2px 8px; border-radius: 3px; font-weight: 600; }
          .status-registered { background: #fee2e2; color: #dc2626; }
          .status-picked_up { background: #fef9c3; color: #a16207; }
          .status-dropped_off { background: #d1fae5; color: #059669; }
          .stats { display: flex; gap: 20px; margin-bottom: 16px; font-size: 13px; }
          .stats span { font-weight: 700; }
          @media print { body { padding: 10px; } }
        </style>
      </head>
      <body>
        <h1>Art of Aviation Community Mural — ${filterStatus === 'registered' ? 'Pickup' : filterStatus === 'picked_up' ? 'Return' : 'Tracking'} Checklist</h1>
        <h2>Printed ${format(new Date(), 'MMMM d, yyyy h:mm a')} • ${filteredCells.length} entries</h2>
        <div class="stats">
          <div>Registered: <span>${stats.registered}</span></div>
          <div>Picked Up: <span>${stats.picked_up}</span></div>
          <div>Returned: <span>${stats.dropped_off}</span></div>
        </div>
        <table>
          <thead>
            <tr>
              <th style="width:30px">✓</th>
              <th style="width:60px">Square</th>
              <th>Artist Name</th>
              <th>Email</th>
              <th style="width:90px">Status</th>
              <th style="width:120px">Notes</th>
            </tr>
          </thead>
          <tbody>
            ${filteredCells.map(a => `
              <tr>
                <td><span class="checkbox"></span></td>
                <td><strong>${a.grid_cell}</strong></td>
                <td>${a.artists?.name || '—'}</td>
                <td>${a.artists?.email || '—'}</td>
                <td><span class="status status-${a.status}">${STATUS_CONFIG[a.status as GridStatus]?.label || a.status}</span></td>
                <td>${a.notes || ''}</td>
              </tr>
            `).join('')}
          </tbody>
        </table>
      </body>
      </html>
    `);
    printWindow.document.close();
    printWindow.print();
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center space-y-3">
          <div className="h-8 w-8 border-2 border-[#dc2626]/30 border-t-[#dc2626] rounded-full animate-spin mx-auto" />
          <p className="font-medium text-white/40">Loading tracking data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white">Pickup & Return Tracking</h1>
          <p className="text-sm text-white/40 mt-1" style={{ fontFamily: 'Inter, sans-serif', textTransform: 'none', letterSpacing: 'normal' }}>
            Track canvas pickup and return status for all registered artists
          </p>
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={handleExportCSV}
            className="border-white/[0.08] text-white/50 hover:bg-white/[0.03] hover:text-white hover:border-white/20"
          >
            <Download className="h-4 w-4 mr-1.5" /> Export CSV
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={handlePrint}
            className="border-white/[0.08] text-white/50 hover:bg-white/[0.03] hover:text-white hover:border-white/20"
          >
            <Printer className="h-4 w-4 mr-1.5" /> Print Checklist
          </Button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <StatCard label="Total Assigned" count={stats.total} color="border-white/[0.08] text-white" />
        <StatCard label="Registered" count={stats.registered} color="border-[#dc2626]/30 text-[#dc2626]" />
        <StatCard label="Picked Up" count={stats.picked_up} color="border-yellow-500/30 text-yellow-400" />
        <StatCard label="Returned" count={stats.dropped_off} color="border-emerald-500/30 text-emerald-400" />
      </div>

      {/* Progress bar */}
      <div className="bg-white/[0.03] border border-white/[0.08] rounded-lg p-4">
        <div className="flex justify-between text-xs text-white/40 mb-2" style={{ fontFamily: 'Inter, sans-serif', textTransform: 'none', letterSpacing: 'normal' }}>
          <span>Overall Progress</span>
          <span>{stats.total > 0 ? Math.round((stats.dropped_off / stats.total) * 100) : 0}% returned</span>
        </div>
        <div className="h-3 bg-white/[0.05] rounded-full overflow-hidden flex">
          {stats.dropped_off > 0 && (
            <div className="bg-emerald-500 h-full transition-all" style={{ width: `${(stats.dropped_off / stats.total) * 100}%` }} />
          )}
          {stats.picked_up > 0 && (
            <div className="bg-yellow-500 h-full transition-all" style={{ width: `${(stats.picked_up / stats.total) * 100}%` }} />
          )}
          {stats.registered > 0 && (
            <div className="bg-[#dc2626]/60 h-full transition-all" style={{ width: `${(stats.registered / stats.total) * 100}%` }} />
          )}
        </div>
        <div className="flex gap-4 mt-2 text-xs" style={{ fontFamily: 'Inter, sans-serif', textTransform: 'none', letterSpacing: 'normal' }}>
          <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-[#dc2626]/60" /> Registered</span>
          <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-yellow-500" /> Picked Up</span>
          <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-emerald-500" /> Returned</span>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-white/30" />
          <Input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search by square, name, or email..."
            className="pl-10 h-10 bg-white/[0.03] border-white/[0.08] text-white placeholder:text-white/20"
          />
        </div>
        <div className="flex gap-1.5">
          {(['all', 'registered', 'picked_up', 'dropped_off'] as FilterStatus[]).map(status => (
            <button
              key={status}
              onClick={() => setFilterStatus(status)}
              className={`px-3 py-2 text-xs font-bold uppercase tracking-wider rounded transition-all ${
                filterStatus === status
                  ? 'bg-[#dc2626] text-white'
                  : 'bg-white/[0.03] text-white/40 border border-white/[0.08] hover:text-white hover:border-white/20'
              }`}
            >
              {status === 'all' ? 'All' : STATUS_CONFIG[status].label}
            </button>
          ))}
        </div>
      </div>

      {/* Table */}
      <div ref={printRef} className="border border-white/[0.08] rounded-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-white/[0.03] border-b border-white/[0.08]">
                <th className="text-left px-4 py-3 text-white/50 font-bold text-xs uppercase tracking-wider">Square</th>
                <th className="text-left px-4 py-3 text-white/50 font-bold text-xs uppercase tracking-wider">Artist</th>
                <th className="text-left px-4 py-3 text-white/50 font-bold text-xs uppercase tracking-wider hidden sm:table-cell">Email</th>
                <th className="text-left px-4 py-3 text-white/50 font-bold text-xs uppercase tracking-wider">Status</th>
                <th className="text-left px-4 py-3 text-white/50 font-bold text-xs uppercase tracking-wider hidden md:table-cell">Registered</th>
                <th className="text-left px-4 py-3 text-white/50 font-bold text-xs uppercase tracking-wider hidden lg:table-cell">Notes</th>
              </tr>
            </thead>
            <tbody>
              {filteredCells.length === 0 ? (
                <tr>
                  <td colSpan={6} className="text-center py-12 text-white/30">
                    {search || filterStatus !== 'all' ? 'No results match your filters' : 'No artists registered yet'}
                  </td>
                </tr>
              ) : (
                filteredCells.map(a => {
                  const statusConfig = STATUS_CONFIG[a.status as GridStatus];
                  const StatusIcon = statusConfig?.icon || Circle;
                  return (
                    <tr key={a.grid_cell} className="border-b border-white/[0.04] hover:bg-white/[0.02] transition-colors">
                      <td className="px-4 py-3">
                        <span className="font-bold text-white text-base">{a.grid_cell}</span>
                      </td>
                      <td className="px-4 py-3">
                        <span className="text-white/80 font-medium" style={{ fontFamily: 'Inter, sans-serif', textTransform: 'none', letterSpacing: 'normal' }}>
                          {a.artists?.name || '—'}
                        </span>
                      </td>
                      <td className="px-4 py-3 hidden sm:table-cell">
                        <span className="text-white/40" style={{ fontFamily: 'Inter, sans-serif', textTransform: 'none', letterSpacing: 'normal' }}>
                          {a.artists?.email || '—'}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <span className={`inline-flex items-center gap-1.5 text-xs font-bold ${statusConfig?.color || 'text-white/40'}`}>
                          <StatusIcon className="h-3.5 w-3.5" />
                          {statusConfig?.label || a.status}
                        </span>
                      </td>
                      <td className="px-4 py-3 hidden md:table-cell">
                        <span className="text-white/30 text-xs" style={{ fontFamily: 'Inter, sans-serif', textTransform: 'none', letterSpacing: 'normal' }}>
                          {a.assigned_at ? format(new Date(a.assigned_at), 'M/d/yy') : '—'}
                        </span>
                      </td>
                      <td className="px-4 py-3 hidden lg:table-cell">
                        <span className="text-white/25 text-xs truncate max-w-[200px] block" style={{ fontFamily: 'Inter, sans-serif', textTransform: 'none', letterSpacing: 'normal' }}>
                          {a.notes || '—'}
                        </span>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Footer count */}
      <p className="text-xs text-white/20 text-right" style={{ fontFamily: 'Inter, sans-serif', textTransform: 'none', letterSpacing: 'normal' }}>
        Showing {filteredCells.length} of {assignedCells.length} assigned squares
      </p>
    </div>
  );
}

function StatCard({ label, count, color }: { label: string; count: number; color: string }) {
  return (
    <div className={`border rounded-lg p-4 bg-white/[0.02] ${color}`}>
      <div className="text-3xl font-black">{count}</div>
      <div className="text-xs font-bold uppercase tracking-wider mt-1 opacity-60">{label}</div>
    </div>
  );
}
