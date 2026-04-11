import { useState, useMemo } from 'react';
import { useGridAssignments, GridAssignmentWithArtist } from '@/hooks/useGridAssignments';
import { GridCellDetail } from './GridCellDetail';
import { Database } from '@/integrations/supabase/types';

type GridStatus = Database['public']['Enums']['grid_status'];

const COLS = ['A','B','C','D','E','F','G','H','I','J','K','L','M','N','O','P','Q','R'];
const ROWS = Array.from({ length: 13 }, (_, i) => i + 1);

/* ---- Precise grid coordinates from image analysis ---- */
const IMG_W = 1306;
const IMG_H = 956;
const V_LINES = [38, 107, 176, 245, 314, 384, 453, 522, 591, 660, 730, 799, 868, 937, 1006, 1076, 1145, 1214, 1283];
const H_LINES = [42, 111, 180, 249, 318, 388, 457, 526, 595, 664, 734, 803, 872, 941];
const GRID_LEFT_PCT = (V_LINES[0] / IMG_W) * 100;
const GRID_TOP_PCT = (H_LINES[0] / IMG_H) * 100;
const GRID_WIDTH_PCT = ((V_LINES[V_LINES.length - 1] - V_LINES[0]) / IMG_W) * 100;
const GRID_HEIGHT_PCT = ((H_LINES[H_LINES.length - 1] - H_LINES[0]) / IMG_H) * 100;
const COL_WIDTHS = V_LINES.slice(0, -1).map((v, i) => V_LINES[i + 1] - v);
const COL_FR = COL_WIDTHS.map(w => `${w}fr`).join(' ');
const ROW_HEIGHTS = H_LINES.slice(0, -1).map((h, i) => H_LINES[i + 1] - h);
const ROW_FR = ROW_HEIGHTS.map(h => `${h}fr`).join(' ');

const STATUS_COLORS: Record<GridStatus, string> = {
  registered: 'bg-[#dc2626]/30 border border-[#dc2626]/50 hover:bg-[#dc2626]/50',
  picked_up: 'bg-yellow-500/40 border border-yellow-400/60 hover:bg-yellow-500/60',
  dropped_off: 'bg-emerald-500/40 border border-emerald-400/60 hover:bg-emerald-500/60',
};

const STATUS_LABELS: Record<GridStatus, string> = {
  registered: 'Registered',
  picked_up: 'Picked Up',
  dropped_off: 'Dropped Off',
};

export function GridDashboard() {
  const { data: assignments, isLoading } = useGridAssignments();
  const [selectedCell, setSelectedCell] = useState<string | null>(null);

  const assignmentMap = useMemo(() => {
    const map = new Map<string, GridAssignmentWithArtist>();
    assignments?.forEach(a => map.set(a.grid_cell, a));
    return map;
  }, [assignments]);

  const stats = useMemo(() => {
    if (!assignments) return { available: 0, registered: 0, picked_up: 0, dropped_off: 0, total: 0 };
    const counts = { available: 0, registered: 0, picked_up: 0, dropped_off: 0 };
    assignments.forEach(a => {
      if (!a.artist_id) counts.available++;
      else if (a.status in counts) counts[a.status as keyof typeof counts]++;
    });
    return { ...counts, total: assignments.length };
  }, [assignments]);

  const selectedAssignment = selectedCell ? assignmentMap.get(selectedCell) : null;

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center space-y-3">
          <div className="h-8 w-8 border-2 border-[#dc2626]/30 border-t-[#dc2626] rounded-full animate-spin mx-auto" />
          <p className="font-medium text-white/40">Loading grid...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Stats bar */}
      <div className="flex flex-wrap gap-3 text-sm">
        <StatBadge label="Total" count={stats.total} color="bg-white/[0.03] text-white/60 border-white/[0.08]" />
        <StatBadge label="Available" count={stats.available} color="bg-white/[0.03] text-white/40 border-white/[0.08]" />
        <StatBadge label="Registered" count={stats.registered} color="bg-[#dc2626]/10 text-[#dc2626] border-[#dc2626]/25" />
        <StatBadge label="Picked Up" count={stats.picked_up} color="bg-yellow-500/10 text-yellow-400 border-yellow-500/25" />
        <StatBadge label="Dropped Off" count={stats.dropped_off} color="bg-emerald-500/10 text-emerald-400 border-emerald-500/25" />
      </div>

      {/* Grid overlay on mural */}
      <div className="relative rounded-lg overflow-hidden shadow-2xl ring-1 ring-white/[0.08]">
        <img
          src="/mural-grid.png"
          alt="Community Mural Grid"
          className="w-full block"
        />
        <div
          className="absolute grid"
          style={{
            left: `${GRID_LEFT_PCT}%`,
            top: `${GRID_TOP_PCT}%`,
            width: `${GRID_WIDTH_PCT}%`,
            height: `${GRID_HEIGHT_PCT}%`,
            gridTemplateColumns: COL_FR,
            gridTemplateRows: ROW_FR,
          }}
        >
          {ROWS.map(row =>
            COLS.map(col => {
              const cellId = `${col}${row}`;
              const assignment = assignmentMap.get(cellId);
              const hasArtist = !!assignment?.artist_id;
              const status: GridStatus = assignment?.status ?? 'registered';
              return (
                <button
                  key={cellId}
                  onClick={() => setSelectedCell(cellId)}
                  className={`
                    transition-all duration-200 cursor-pointer flex items-center justify-center
                    text-[0.5rem] sm:text-[0.65rem] font-bold text-white/70 hover:text-white
                    hover:scale-105 hover:z-10 relative
                    ${hasArtist
                      ? STATUS_COLORS[status]
                      : 'border border-white/10 bg-transparent hover:bg-white/15'
                    }
                  `}
                  title={`${cellId} — ${hasArtist ? STATUS_LABELS[status] : 'Available'}${assignment?.artists ? ` (${assignment.artists.name})` : ''}`}
                >
                  <span className="drop-shadow-[0_1px_2px_rgba(0,0,0,0.9)]">{cellId}</span>
                </button>
              );
            })
          )}
        </div>
      </div>

      {/* Legend */}
      <div className="flex flex-wrap gap-4 text-xs" style={{ fontFamily: 'Inter, sans-serif', textTransform: 'none', letterSpacing: 'normal' }}>
        <div className="flex items-center gap-1.5">
          <div className="w-4 h-4 rounded border border-dashed border-white/20 bg-white/[0.03]" />
          <span className="text-white/40 font-medium">Available</span>
        </div>
        {(Object.keys(STATUS_COLORS) as GridStatus[]).map(status => (
          <div key={status} className="flex items-center gap-1.5">
            <div className={`w-4 h-4 rounded ${STATUS_COLORS[status]}`} />
            <span className="text-white/40 font-medium">{STATUS_LABELS[status]}</span>
          </div>
        ))}
      </div>

      {/* Cell detail panel */}
      {selectedCell && (
        <GridCellDetail
          gridCell={selectedCell}
          assignment={selectedAssignment ?? null}
          onClose={() => setSelectedCell(null)}
        />
      )}
    </div>
  );
}

function StatBadge({ label, count, color }: { label: string; count: number; color: string }) {
  return (
    <span className={`px-3 py-1.5 rounded font-bold border text-sm ${color}`} style={{ fontFamily: 'Inter, sans-serif', textTransform: 'none', letterSpacing: 'normal' }}>
      {label}: {count}
    </span>
  );
}
