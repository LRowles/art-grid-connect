import { useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { CheckCircle, Package, AlertCircle } from 'lucide-react';

export default function Dropoff() {
  const [gridCell, setGridCell] = useState('');
  const [artistName, setArtistName] = useState('');
  const [success, setSuccess] = useState<string | null>(null);
  const [notFound, setNotFound] = useState(false);

  const dropoffMutation = useMutation({
    mutationFn: async () => {
      const cellUpper = gridCell.trim().toUpperCase();
      if (!cellUpper) throw new Error('Please enter your square number');

      // Look up the grid assignment
      const { data: assignment, error: lookupErr } = await supabase
        .from('grid_assignments')
        .select('grid_cell, status, artist_id, artists(name)')
        .eq('grid_cell', cellUpper)
        .single();

      if (lookupErr || !assignment) {
        setNotFound(true);
        throw new Error(`Square ${cellUpper} not found. Please check your square number.`);
      }

      if (!assignment.artist_id) {
        throw new Error(`Square ${cellUpper} has not been claimed yet.`);
      }

      if (assignment.status === 'dropped_off') {
        throw new Error(`Square ${cellUpper} has already been returned. Thank you!`);
      }

      // Update status to dropped_off
      const { error: updateErr } = await supabase
        .from('grid_assignments')
        .update({ status: 'dropped_off' as const })
        .eq('grid_cell', cellUpper);

      if (updateErr) throw updateErr;

      // Log to status_history
      await supabase.from('status_history').insert({
        grid_cell: cellUpper,
        new_status: 'dropped_off',
        changed_by: 'artist_self_service',
        notes: artistName ? `Self-service dropoff by ${artistName}` : 'Self-service dropoff',
      });

      return { cell: cellUpper, name: (assignment as any).artists?.name || artistName };
    },
    onSuccess: (result) => {
      setSuccess(result.cell);
      setNotFound(false);
    },
    onError: () => {
      // Error is handled via mutation.error
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setNotFound(false);
    dropoffMutation.mutate();
  };

  const handleReset = () => {
    setGridCell('');
    setArtistName('');
    setSuccess(null);
    setNotFound(false);
    dropoffMutation.reset();
  };

  if (success) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-gray-900 via-gray-800 to-gray-900 flex items-center justify-center p-6">
        <div className="max-w-md w-full bg-gray-800/80 backdrop-blur-sm border border-green-500/30 rounded-2xl p-8 text-center shadow-2xl">
          <div className="w-20 h-20 mx-auto mb-6 bg-green-500/20 rounded-full flex items-center justify-center">
            <CheckCircle className="w-12 h-12 text-green-400" />
          </div>
          <h1 className="text-3xl font-bold text-white mb-3 font-display uppercase">
            Thank You!
          </h1>
          <p className="text-gray-300 text-lg mb-2">
            Square <span className="text-green-400 font-bold">{success}</span> has been marked as returned.
          </p>
          <p className="text-gray-400 mb-8">
            Your canvas will become part of the community mural. Thank you for contributing to the Art of Aviation!
          </p>
          <button
            onClick={handleReset}
            className="px-6 py-3 bg-red-600 hover:bg-red-700 text-white font-bold rounded-lg transition-colors uppercase tracking-wide"
          >
            Return Another Canvas
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 via-gray-800 to-gray-900 flex items-center justify-center p-6">
      <div className="max-w-md w-full">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="w-16 h-16 mx-auto mb-4 bg-red-600/20 rounded-full flex items-center justify-center">
            <Package className="w-9 h-9 text-red-400" />
          </div>
          <h1 className="text-3xl font-bold text-white mb-2 font-display uppercase">
            Canvas Drop-Off
          </h1>
          <p className="text-gray-400">
            Art of Aviation Community Mural
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="bg-gray-800/80 backdrop-blur-sm border border-gray-700 rounded-2xl p-6 shadow-2xl space-y-5">
          <div>
            <label htmlFor="gridCell" className="block text-sm font-medium text-gray-300 mb-2">
              Square Number <span className="text-red-400">*</span>
            </label>
            <input
              id="gridCell"
              type="text"
              value={gridCell}
              onChange={(e) => setGridCell(e.target.value.toUpperCase())}
              placeholder="e.g. H5, A1, R13"
              className="w-full px-4 py-3 bg-gray-900 border border-gray-600 rounded-lg text-white text-lg font-mono placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
              required
              autoFocus
              autoComplete="off"
            />
            <p className="text-xs text-gray-500 mt-1">
              This is the letter + number written on the back of your canvas (e.g. H5)
            </p>
          </div>

          <div>
            <label htmlFor="artistName" className="block text-sm font-medium text-gray-300 mb-2">
              Your Name <span className="text-gray-500">(optional)</span>
            </label>
            <input
              id="artistName"
              type="text"
              value={artistName}
              onChange={(e) => setArtistName(e.target.value)}
              placeholder="Your full name"
              className="w-full px-4 py-3 bg-gray-900 border border-gray-600 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
              autoComplete="off"
            />
          </div>

          {/* Error Message */}
          {dropoffMutation.isError && (
            <div className="flex items-start gap-3 p-3 bg-red-900/30 border border-red-500/30 rounded-lg">
              <AlertCircle className="w-5 h-5 text-red-400 mt-0.5 flex-shrink-0" />
              <p className="text-red-300 text-sm">
                {dropoffMutation.error?.message || 'Something went wrong. Please try again or ask the front desk for help.'}
              </p>
            </div>
          )}

          <button
            type="submit"
            disabled={dropoffMutation.isPending || !gridCell.trim()}
            className="w-full py-4 bg-red-600 hover:bg-red-700 disabled:bg-gray-600 disabled:cursor-not-allowed text-white font-bold text-lg rounded-lg transition-colors uppercase tracking-wide"
          >
            {dropoffMutation.isPending ? 'Submitting...' : 'Confirm Drop-Off'}
          </button>

          <p className="text-center text-xs text-gray-500">
            Having trouble? Ask the front desk staff for assistance.
          </p>
        </form>

        {/* Footer */}
        <div className="text-center mt-6">
          <p className="text-gray-500 text-xs">
            Art of Aviation Community Mural — A Reno 250 Celebration
          </p>
          <p className="text-gray-600 text-xs mt-1">
            Presented by The George W. Gillemot Foundation
          </p>
        </div>
      </div>
    </div>
  );
}
