import { useState, useMemo } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from '@/hooks/use-toast';
import { CheckCircle2 } from 'lucide-react';

const COLS = ['A','B','C','D','E','F','G','H','I','J','K','L','M','N','O','P','Q','R'];
const ROWS = Array.from({ length: 13 }, (_, i) => i + 1);

type GridAssignment = {
  grid_cell: string;
  artist_id: string | null;
  status: string;
};

function usePublicGridAssignments() {
  return useQuery({
    queryKey: ['public_grid_assignments'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('grid_assignments')
        .select('grid_cell, artist_id, status')
        .order('grid_cell');
      if (error) throw error;
      return data as GridAssignment[];
    },
  });
}

export default function Register() {
  const queryClient = useQueryClient();
  const { data: assignments, isLoading } = usePublicGridAssignments();
  const [selectedCell, setSelectedCell] = useState<string | null>(null);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [success, setSuccess] = useState<string | null>(null);

  const assignmentMap = useMemo(() => {
    const map = new Map<string, GridAssignment>();
    assignments?.forEach(a => map.set(a.grid_cell, a));
    return map;
  }, [assignments]);

  const registerMutation = useMutation({
    mutationFn: async () => {
      if (!selectedCell || !name.trim()) throw new Error('Missing required fields');

      // Create artist
      const { data: artist, error: artistErr } = await supabase
        .from('artists')
        .insert({ name: name.trim(), email: email.trim() || null, phone: phone.trim() || null })
        .select()
        .single();
      if (artistErr) throw artistErr;

      // Claim grid cell
      const { error: claimErr } = await supabase
        .from('grid_assignments')
        .update({ artist_id: artist.id, status: 'registered' as const, assigned_at: new Date().toISOString() })
        .eq('grid_cell', selectedCell)
        .is('artist_id', null);
      if (claimErr) throw claimErr;

      return selectedCell;
    },
    onSuccess: (cell) => {
      setSuccess(cell);
      queryClient.invalidateQueries({ queryKey: ['public_grid_assignments'] });
    },
    onError: (err: Error) => {
      toast({ title: 'Registration failed', description: err.message, variant: 'destructive' });
    },
  });

  if (isLoading) {
    return <div className="min-h-screen flex items-center justify-center text-muted-foreground">Loading grid...</div>;
  }

  if (success) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background p-4">
        <Card className="max-w-md w-full text-center">
          <CardContent className="pt-8 pb-8 space-y-4">
            <CheckCircle2 className="h-16 w-16 text-green-500 mx-auto" />
            <h2 className="text-2xl font-bold">You're Registered!</h2>
            <p className="text-muted-foreground">
              You've been assigned grid cell <span className="font-bold text-foreground">{success}</span>. 
              Thank you for participating in the community mural!
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b bg-card px-6 py-6">
        <div className="max-w-4xl mx-auto space-y-6">
          <h1 className="text-2xl sm:text-3xl font-bold text-foreground">🎨 Art of Aviation Community Mural</h1>

          <p className="text-sm sm:text-base text-muted-foreground leading-relaxed">
            Welcome to the inaugural <span className="font-semibold text-foreground">Art of Aviation Community Mural</span>, a collaborative demonstration of Northern Nevada's pioneering spirit, the history of flight, and the creativity that defines our region. The completed mural will be installed and on display at <span className="font-semibold text-foreground">The Discovery Museum</span>, serving as the entrance centerpiece to a new aviation-themed exhibition and helping build excitement for the inaugural <span className="font-semibold text-foreground">Red, White, and Flight Drone Show</span>.
          </p>

          <div className="space-y-3">
            <h2 className="text-base sm:text-lg font-semibold text-foreground">Community Partners</h2>
            <ul className="space-y-2 text-sm text-muted-foreground leading-relaxed">
              <li>
                <span className="font-semibold text-foreground">The George W. Gillemot Foundation</span> — funded the original professional mural artwork, supporting aviation education and innovation while helping inspire the next generation of aerospace leaders.
              </li>
              <li>
                <span className="font-semibold text-foreground">Artown</span> — funding the Community Mural Event, expanding the celebration by inviting local artists of all backgrounds to participate in the creation of this landmark piece.
              </li>
              <li>
                <span className="font-semibold text-foreground">The Discovery Museum</span> — hosting the event and showcasing the completed mural, creating an interactive gateway into an aviation-themed exhibit that celebrates exploration, discovery, and innovation.
              </li>
            </ul>
          </div>

          <Card className="bg-muted/50 border-primary/20">
            <CardContent className="pt-5 pb-5 space-y-2">
              <h3 className="font-semibold text-foreground">📋 Directions</h3>
              <ul className="list-disc list-inside space-y-1 text-sm text-muted-foreground">
                <li>Select an available square below and register with your <span className="font-medium text-foreground">name</span> and <span className="font-medium text-foreground">phone number</span>.</li>
                <li>Canvases can be picked up at <span className="font-medium text-foreground">The Discovery Museum</span> anytime after <span className="font-medium text-foreground">May 1</span>.</li>
                <li>Completed squares must be dropped off at The Discovery no later than <span className="font-medium text-foreground">Monday, June 22nd</span>.</li>
                <li>Artists may use any material to recreate the grid, but we ask that colors are matched as closely as possible.</li>
              </ul>
            </CardContent>
          </Card>
        </div>
      </header>

      <div className="max-w-7xl mx-auto p-4 space-y-6">
        {/* Legend */}
        <div className="flex flex-wrap gap-4 text-xs">
          <div className="flex items-center gap-1.5">
            <div className="w-4 h-4 rounded border-2 border-dashed border-muted-foreground/40" />
            <span className="text-muted-foreground">Available</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-4 h-4 rounded bg-blue-500/70 border-2 border-blue-400" />
            <span className="text-muted-foreground">Taken</span>
          </div>
        </div>

        {/* Grid */}
        <div className="relative rounded-lg overflow-hidden shadow-xl">
          <img src="/mural-grid.png" alt="Community Mural Grid" className="w-full block" />
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
                const taken = !!assignment?.artist_id;
                const isSelected = selectedCell === cellId;

                return (
                  <button
                    key={cellId}
                    disabled={taken}
                    onClick={() => setSelectedCell(taken ? null : cellId)}
                    className={`
                      transition-all duration-150 flex items-center justify-center text-[0.55rem] sm:text-xs font-bold relative
                      ${taken
                        ? 'bg-blue-500/70 border-2 border-blue-400 text-white/90 cursor-not-allowed'
                        : isSelected
                          ? 'bg-primary/80 border-2 border-primary text-primary-foreground ring-2 ring-primary ring-offset-1 z-10 scale-110'
                          : 'border border-dashed border-muted-foreground/30 text-muted-foreground/60 hover:bg-primary/10 hover:border-primary/50 cursor-pointer'
                      }
                    `}
                    title={taken ? `${cellId} — Taken` : `${cellId} — Available`}
                  >
                    <span className="drop-shadow-md">{cellId}</span>
                  </button>
                );
              })
            )}
          </div>
        </div>

        {/* Registration form */}
        {selectedCell && (
          <Card className="max-w-md mx-auto">
            <CardHeader>
              <CardTitle className="text-lg">Register for Cell {selectedCell}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">Name *</Label>
                <Input id="name" value={name} onChange={e => setName(e.target.value)} placeholder="Your name" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input id="email" type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="your@email.com" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="phone">Phone</Label>
                <Input id="phone" type="tel" value={phone} onChange={e => setPhone(e.target.value)} placeholder="(555) 123-4567" />
              </div>
              <div className="flex gap-2">
                <Button
                  className="flex-1"
                  disabled={!name.trim() || registerMutation.isPending}
                  onClick={() => registerMutation.mutate()}
                >
                  {registerMutation.isPending ? 'Registering...' : 'Register'}
                </Button>
                <Button variant="outline" onClick={() => setSelectedCell(null)}>Cancel</Button>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
