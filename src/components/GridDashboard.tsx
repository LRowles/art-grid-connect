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
  registered: 'bg-blue-500/60 border border-blue-400/80 hover:bg-blue-500/80',
  picked_up: 'bg-amber-500/60 border border-amber-400/80 hover:bg-amber-500/80',
  dropped_off: 'bg-emerald-500/60 border border-emerald-400/80 hover:bg-emerald-500/80',
};

const STATUS_LABELS: Record<GridStatus, string> = {
  registered: 'Registered',
  picked_up: 'Picked Up',
  dropped_off: 'Dropped Off',
};

const STATUS_BADGE_COLORS: Record<GridStatus | 'available', string> = {
  available: 'bg-gray-100 text-gray-600 border-gray-200',
  registered: 'bg-blue-50 text-blue-700 border-blue-200',
  picked_up: 'bg-amber-50 text-amber-700 border-amber-200',
  dropped_off: 'bg-emerald-50 text-emerald-700 border-emerald-200',
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
      <div className="flex items-center justify-center h-96 text-muted-foreground">
        <div className="text-center space-y-3">
          <div className="h-8 w-8 border-2 border-primary/30 border-t-primary rounded-full animate-spin mx-auto" />
          <p className="font-medium">Loading grid...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Stats bar */}
      <div className="flex flex-wrap gap-3 text-sm">
        <StatBadge label="Total" count={stats.total} className={STATUS_BADGE_COLORS.available} />
        <StatBadge label="Available" count={stats.available} className={STATUS_BADGE_COLORS.available} />
        <StatBadge label="Registered" count={stats.registered} className={STATUS_BADGE_COLORS.registered} />
        <StatBadge label="Picked Up" count={stats.picked_up} className={STATUS_BADGE_COLORS.picked_up} />
        <StatBadge label="Dropped Off" count={stats.dropped_off} className={STATUS_BADGE_COLORS.dropped_off} />
      </div>

      {/* Grid overlay on mural */}
      <div className="relative rounded-2xl overflow-hidden shadow-2xl ring-1 ring-black/10">
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
                    text-[0.5rem] sm:text-[0.65rem] font-bold text-white/80 hover:text-white
                    hover:scale-105 hover:z-10 relative
                    ${hasArtist
                      ? STATUS_COLORS[status]
                      : 'border border-white/15 bg-white/5 hover:bg-white/20'
                    }
                  `}
                  title={`${cellId} — ${hasArtist ? STATUS_LABELS[status] : 'Available'}${assignment?.artists ? ` (${assignment.artists.name})` : ''}`}
                >
                  <span className="drop-shadow-[0_1px_2px_rgba(0,0,0,0.8)]">{cellId}</span>
                </button>
              );
            })
          )}
        </div>
      </div>

      {/* Legend */}
      <div className="flex flex-wrap gap-4 text-xs">
        <div className="flex items-center gap-1.5">
          <div className="w-4 h-4 rounded border border-dashed border-gray-400 bg-gray-100" />
          <span className="text-muted-foreground font-medium">Available</span>
        </div>
        {(Object.keys(STATUS_COLORS) as GridStatus[]).map(status => (
          <div key={status} className="flex items-center gap-1.5">
            <div className={`w-4 h-4 rounded ${STATUS_COLORS[status]}`} />
            <span className="text-muted-foreground font-medium">{STATUS_LABELS[status]}</span>
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

function StatBadge({ label, count, className }: { label: string; count: number; className: string }) {
  return (
    <span className={`px-3 py-1.5 rounded-lg font-semibold border text-sm ${className}`}>
      {label}: {count}
    </span>
  );
}
