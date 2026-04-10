import { useState, useMemo } from 'react';
import { useGridAssignments, GridAssignmentWithArtist } from '@/hooks/useGridAssignments';
import { GridCellDetail } from './GridCellDetail';
import { Database } from '@/integrations/supabase/types';

type GridStatus = Database['public']['Enums']['grid_status'];

const COLS = ['A','B','C','D','E','F','G','H','I','J','K','L','M','N','O','P','Q','R'];
const ROWS = Array.from({ length: 13 }, (_, i) => i + 1);

const STATUS_COLORS: Record<GridStatus, string> = {
  available: 'bg-transparent border-2 border-white/60 hover:border-white',
  assigned: 'bg-blue-500/70 border-2 border-blue-400',
  in_progress: 'bg-yellow-500/70 border-2 border-yellow-400',
  completed: 'bg-green-500/70 border-2 border-green-400',
  collected: 'bg-purple-500/70 border-2 border-purple-400',
};

const STATUS_LABELS: Record<GridStatus, string> = {
  available: 'Available',
  assigned: 'Assigned',
  in_progress: 'In Progress',
  completed: 'Completed',
  collected: 'Collected',
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
    if (!assignments) return { available: 0, assigned: 0, in_progress: 0, completed: 0, collected: 0, total: 0 };
    const counts = { available: 0, assigned: 0, in_progress: 0, completed: 0, collected: 0 };
    assignments.forEach(a => { counts[a.status]++; });
    return { ...counts, total: assignments.length };
  }, [assignments]);

  const selectedAssignment = selectedCell ? assignmentMap.get(selectedCell) : null;

  if (isLoading) {
    return <div className="flex items-center justify-center h-96 text-muted-foreground">Loading grid...</div>;
  }

  return (
    <div className="space-y-6">
      {/* Stats bar */}
      <div className="flex flex-wrap gap-3 text-sm">
        <StatBadge label="Total" count={stats.total} className="bg-muted text-muted-foreground" />
        <StatBadge label="Available" count={stats.available} className="bg-gray-200 text-gray-700" />
        <StatBadge label="Assigned" count={stats.assigned} className="bg-blue-100 text-blue-700" />
        <StatBadge label="In Progress" count={stats.in_progress} className="bg-yellow-100 text-yellow-700" />
        <StatBadge label="Completed" count={stats.completed} className="bg-green-100 text-green-700" />
        <StatBadge label="Collected" count={stats.collected} className="bg-purple-100 text-purple-700" />
      </div>

      {/* Grid overlay on mural */}
      <div className="relative rounded-lg overflow-hidden shadow-xl">
        <img
          src="/mural-grid.png"
          alt="Community Mural Grid"
          className="w-full block"
        />
        <div
          className="absolute inset-0 grid"
          style={{
            gridTemplateColumns: `repeat(${COLS.length}, 1fr)`,
            gridTemplateRows: `repeat(${ROWS.length}, 1fr)`,
          }}
        >
          {ROWS.map(row =>
            COLS.map(col => {
              const cellId = `${col}${row}`;
              const assignment = assignmentMap.get(cellId);
              const status: GridStatus = assignment?.status ?? 'available';
              return (
                <button
                  key={cellId}
                  onClick={() => setSelectedCell(cellId)}
                  className={`${STATUS_COLORS[status]} transition-all duration-150 cursor-pointer flex items-center justify-center text-[0.55rem] sm:text-xs font-bold text-white/90 hover:scale-105 hover:z-10 relative`}
                  title={`${cellId} — ${STATUS_LABELS[status]}${assignment?.artists ? ` (${assignment.artists.name})` : ''}`}
                >
                  <span className="drop-shadow-md">{cellId}</span>
                </button>
              );
            })
          )}
        </div>
      </div>

      {/* Legend */}
      <div className="flex flex-wrap gap-4 text-xs">
        {(Object.keys(STATUS_COLORS) as GridStatus[]).map(status => (
          <div key={status} className="flex items-center gap-1.5">
            <div className={`w-4 h-4 rounded ${STATUS_COLORS[status]}`} />
            <span className="text-muted-foreground">{STATUS_LABELS[status]}</span>
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
    <span className={`px-3 py-1 rounded-full font-medium ${className}`}>
      {label}: {count}
    </span>
  );
}
