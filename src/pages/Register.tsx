import { useState, useMemo, useRef, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from '@/hooks/use-toast';
import { CheckCircle2, Plane, Palette, MapPin, Calendar, ArrowRight, X, Mail, Phone, User } from 'lucide-react';
import { PublicNav } from '@/components/PublicNav';
import { sendConfirmationEmail } from '@/lib/sendConfirmationEmail';

const COLS = ['A','B','C','D','E','F','G','H','I','J','K','L','M','N','O','P','Q','R'];
const ROWS = Array.from({ length: 13 }, (_, i) => i + 1);

/* ---- mural-grid.png layout constants (pixels, from image analysis) ---- */
const IMG_W = 1306;
const IMG_H = 956;

// Exact vertical grid line centers (19 lines for 18 columns)
const V_LINES = [38, 107, 176, 245, 314, 384, 453, 522, 591, 660, 730, 799, 868, 937, 1006, 1076, 1145, 1214, 1283];
// Exact horizontal grid line centers (14 lines for 13 rows)
const H_LINES = [42, 111, 180, 249, 318, 388, 457, 526, 595, 664, 734, 803, 872, 941];

// Grid area as percentages of image dimensions
const GRID_LEFT_PCT = (V_LINES[0] / IMG_W) * 100;
const GRID_TOP_PCT = (H_LINES[0] / IMG_H) * 100;
const GRID_WIDTH_PCT = ((V_LINES[V_LINES.length - 1] - V_LINES[0]) / IMG_W) * 100;
const GRID_HEIGHT_PCT = ((H_LINES[H_LINES.length - 1] - H_LINES[0]) / IMG_H) * 100;

// Column widths as percentages of the grid area
const COL_WIDTHS = V_LINES.slice(0, -1).map((v, i) => V_LINES[i + 1] - v);
const GRID_TOTAL_W = V_LINES[V_LINES.length - 1] - V_LINES[0];
const COL_FR = COL_WIDTHS.map(w => `${w}fr`).join(' ');

// Row heights as percentages of the grid area
const ROW_HEIGHTS = H_LINES.slice(0, -1).map((h, i) => H_LINES[i + 1] - h);
const GRID_TOTAL_H = H_LINES[H_LINES.length - 1] - H_LINES[0];
const ROW_FR = ROW_HEIGHTS.map(h => `${h}fr`).join(' ');

// For canvas cropping
const CELL_W = GRID_TOTAL_W / COLS.length;
const CELL_H = GRID_TOTAL_H / ROWS.length;

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

/** Crop one cell from the mural image and return a data-URL */
function cropCellFromMural(cellId: string): Promise<string> {
  return new Promise((resolve, reject) => {
    const colIdx = COLS.indexOf(cellId.charAt(0));
    const rowIdx = parseInt(cellId.slice(1), 10) - 1;
    if (colIdx < 0 || rowIdx < 0) return reject('Invalid cell');

    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => {
      const canvas = document.createElement('canvas');
      // Use exact grid line positions for precise cropping
      const sx = V_LINES[colIdx];
      const sy = H_LINES[rowIdx];
      const sw = V_LINES[colIdx + 1] - V_LINES[colIdx];
      const sh = H_LINES[rowIdx + 1] - H_LINES[rowIdx];
      canvas.width = sw;
      canvas.height = sh;
      const ctx = canvas.getContext('2d')!;
      ctx.drawImage(img, sx, sy, sw, sh, 0, 0, sw, sh);
      resolve(canvas.toDataURL('image/png'));
    };
    img.onerror = reject;
    img.src = '/mural-grid.png';
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
  const [cellPreview, setCellPreview] = useState<string | null>(null);
  const formRef = useRef<HTMLDivElement>(null);

  const assignmentMap = useMemo(() => {
    const map = new Map<string, GridAssignment>();
    assignments?.forEach(a => map.set(a.grid_cell, a));
    return map;
  }, [assignments]);

  const takenCount = useMemo(() => {
    if (!assignments) return 0;
    return assignments.filter(a => !!a.artist_id).length;
  }, [assignments]);

  const handleCellSelect = useCallback(async (cellId: string) => {
    setSelectedCell(cellId);
    try {
      const preview = await cropCellFromMural(cellId);
      setCellPreview(preview);
    } catch {
      setCellPreview(null);
    }
    setTimeout(() => {
      formRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }, 100);
  }, []);

  const registerMutation = useMutation({
    mutationFn: async () => {
      if (!selectedCell || !name.trim()) throw new Error('Missing required fields');

      const { data: artist, error: artistErr } = await supabase
        .from('artists')
        .insert({ name: name.trim(), email: email.trim() || null, phone: phone.trim() || null })
        .select()
        .single();
      if (artistErr) throw artistErr;

      const { error: claimErr } = await supabase
        .from('grid_assignments')
        .update({ artist_id: artist.id, status: 'registered' as const, assigned_at: new Date().toISOString() })
        .eq('grid_cell', selectedCell)
        .is('artist_id', null);
      if (claimErr) throw claimErr;

      return { cell: selectedCell, artistName: name.trim(), artistEmail: email.trim() };
    },
    onSuccess: async (result) => {
      setSuccess(result.cell);
      queryClient.invalidateQueries({ queryKey: ['public_grid_assignments'] });

      // Send confirmation email via Resend if email was provided
      if (result.artistEmail) {
        try {
          const emailResult = await sendConfirmationEmail(
            result.artistEmail,
            result.artistName,
            result.cell,
          );
          if (emailResult.success) {
            console.log('Confirmation email sent successfully');
          } else {
            console.warn('Email send issue:', emailResult.error);
          }
        } catch (emailErr) {
          console.warn('Email confirmation failed (non-blocking):', emailErr);
        }
      }
    },
    onError: (err: Error) => {
      toast({ title: 'Registration failed', description: err.message, variant: 'destructive' });
    },
  });

  /* ---------- Loading state ---------- */
  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <PublicNav />
        <div className="flex items-center justify-center h-[60vh]">
          <div className="text-center space-y-4">
            <Plane className="h-10 w-10 text-primary animate-pulse mx-auto" />
            <p className="text-muted-foreground font-medium">Loading mural grid...</p>
          </div>
        </div>
      </div>
    );
  }

  /* ---------- Success state ---------- */
  if (success) {
    return (
      <div className="min-h-screen bg-background">
        <PublicNav />
        <div className="flex items-center justify-center p-8 min-h-[70vh]">
          <Card className="max-w-lg w-full text-center shadow-2xl border-0 overflow-hidden">
            <div className="hero-gradient p-6">
              <CheckCircle2 className="h-16 w-16 text-white mx-auto mb-3" />
              <h2 className="text-3xl font-bold text-white">You're Registered!</h2>
            </div>
            <CardContent className="pt-8 pb-8 space-y-5">
              {cellPreview && (
                <div className="mx-auto w-40 h-40 rounded-xl overflow-hidden shadow-lg border-4 border-secondary/30">
                  <img src={cellPreview} alt={`Square ${success}`} className="w-full h-full object-cover" />
                </div>
              )}
              <p className="text-muted-foreground leading-relaxed">
                You've been assigned grid square{' '}
                <span className="inline-flex items-center px-3 py-1 rounded-full bg-primary text-primary-foreground font-bold text-sm">
                  {success}
                </span>
              </p>
              <p className="text-muted-foreground text-sm leading-relaxed">
                Thank you for participating in the Art of Aviation Community Mural!
              </p>
              <div className="bg-muted/50 rounded-xl p-4 text-sm text-muted-foreground space-y-2">
                <div className="flex items-center gap-2">
                  <MapPin className="h-4 w-4 text-accent shrink-0" />
                  <span>Pick up your canvas at <strong className="text-foreground">The Discovery Museum</strong></span>
                </div>
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-accent shrink-0" />
                  <span>Available after <strong className="text-foreground">May 1</strong> — due <strong className="text-foreground">June 22</strong></span>
                </div>
              </div>
              {email.trim() && (
                <p className="text-xs text-muted-foreground/70">
                  A confirmation email with your square artwork has been sent to <strong>{email.trim()}</strong>.
                </p>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  /* ---------- Main registration view ---------- */
  return (
    <div className="min-h-screen bg-background">
      <PublicNav />

      {/* Hero */}
      <section className="hero-gradient text-white">
        <div className="max-w-5xl mx-auto px-4 py-12 sm:py-16 text-center space-y-5">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/10 backdrop-blur-sm text-sm font-medium border border-white/20">
            <Plane className="h-4 w-4" />
            <span>Reno 250 Celebration</span>
          </div>
          <h1 className="text-3xl sm:text-5xl font-black tracking-tight leading-tight">
            Art of Aviation<br />Community Mural
          </h1>
          <p className="text-base sm:text-lg text-white/80 leading-relaxed max-w-2xl mx-auto">
            Join us in creating a collaborative mural celebrating Northern Nevada's pioneering spirit
            and the history of flight. Select a square, create your piece, and become part of something extraordinary.
          </p>

          {/* Stats */}
          <div className="flex justify-center gap-6 pt-2">
            <div className="text-center">
              <div className="text-2xl sm:text-3xl font-black">{234 - takenCount}</div>
              <div className="text-xs uppercase tracking-wider text-white/60">Available</div>
            </div>
            <div className="w-px bg-white/20" />
            <div className="text-center">
              <div className="text-2xl sm:text-3xl font-black">{takenCount}</div>
              <div className="text-xs uppercase tracking-wider text-white/60">Claimed</div>
            </div>
            <div className="w-px bg-white/20" />
            <div className="text-center">
              <div className="text-2xl sm:text-3xl font-black">234</div>
              <div className="text-xs uppercase tracking-wider text-white/60">Total</div>
            </div>
          </div>
        </div>
      </section>

      {/* Partner strip */}
      <section className="border-b bg-card">
        <div className="max-w-5xl mx-auto px-4 py-5">
          <div className="flex flex-wrap justify-center gap-4 sm:gap-8 items-center">
            {[
              { name: 'Artown', desc: 'Funding the Mural', icon: Palette },
              { name: 'The Discovery Museum', desc: 'Hosting & Showcasing', icon: MapPin },
              { name: 'Gillemot Foundation', desc: 'Original Artwork', icon: Plane },
            ].map(p => (
              <div key={p.name} className="flex items-center gap-3 text-sm">
                <div className="w-9 h-9 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                  <p.icon className="h-4 w-4 text-primary" />
                </div>
                <div>
                  <div className="font-semibold text-foreground leading-tight">{p.name}</div>
                  <div className="text-xs text-muted-foreground">{p.desc}</div>
                </div>
              </div>
            ))}
          </div>
          <div className="text-center mt-3">
            <Link to="/about" className="inline-flex items-center gap-1 text-sm text-primary hover:underline font-medium">
              Learn more about the project & partners <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>
        </div>
      </section>

      {/* Directions */}
      <section className="max-w-5xl mx-auto px-4 py-6">
        <div className="bg-primary/5 border border-primary/15 rounded-xl p-5">
          <h3 className="font-bold text-foreground mb-3 flex items-center gap-2 text-base">
            <span className="w-7 h-7 rounded-lg bg-primary text-primary-foreground flex items-center justify-center text-xs font-bold">?</span>
            How It Works
          </h3>
          <div className="grid sm:grid-cols-2 gap-3">
            {[
              { step: '1', text: 'Select an available square below and register with your name and contact info.' },
              { step: '2', text: 'Pick up your canvas at The Discovery Museum after May 1.' },
              { step: '3', text: 'Paint your square — any material welcome, match colors as closely as possible.' },
              { step: '4', text: 'Return your completed square by Monday, June 22nd.' },
            ].map(d => (
              <div key={d.step} className="flex items-start gap-3">
                <span className="w-6 h-6 rounded-full bg-secondary text-secondary-foreground flex items-center justify-center text-xs font-bold shrink-0 mt-0.5">
                  {d.step}
                </span>
                <p className="text-sm text-muted-foreground leading-relaxed">{d.text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Grid section */}
      <section className="max-w-6xl mx-auto px-4 pb-8 space-y-4">
        {/* Legend */}
        <div className="flex items-center justify-between">
          <h2 className="text-xl sm:text-2xl font-bold text-foreground">Select Your Square</h2>
          <div className="flex gap-4 text-xs">
            <div className="flex items-center gap-1.5">
              <div className="w-4 h-4 rounded border-2 border-dashed border-primary/30 bg-primary/5" />
              <span className="text-muted-foreground font-medium">Available</span>
            </div>
            <div className="flex items-center gap-1.5">
              <div className="w-4 h-4 rounded bg-primary/60 border border-primary/70" />
              <span className="text-muted-foreground font-medium">Taken</span>
            </div>
          </div>
        </div>

        {/* Grid overlay on mural */}
        <div className="relative rounded-2xl overflow-hidden shadow-2xl ring-1 ring-black/10">
          <img src="/mural-grid.png" alt="Community Mural Grid" className="w-full block" />
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
                const taken = !!assignment?.artist_id;
                const isSelected = selectedCell === cellId;

                return (
                  <button
                    key={cellId}
                    disabled={taken}
                    onClick={() => !taken && handleCellSelect(cellId)}
                    className={`
                      transition-all duration-200 flex items-center justify-center text-[0.5rem] sm:text-[0.65rem] font-bold relative
                      ${taken
                        ? 'grid-cell-taken text-white/70'
                        : isSelected
                          ? 'grid-cell-selected'
                          : 'grid-cell-available text-white/50 hover:text-white'
                      }
                    `}
                    title={taken ? `${cellId} — Taken` : `${cellId} — Available`}
                  >
                    <span className="drop-shadow-[0_1px_2px_rgba(0,0,0,0.8)]">{cellId}</span>
                  </button>
                );
              })
            )}
          </div>
        </div>

        {/* Registration form */}
        {selectedCell && (
          <div ref={formRef} className="flex justify-center pt-4 pb-8">
            <Card className="max-w-md w-full shadow-2xl border-0 overflow-hidden">
              <div className="hero-gradient p-5 flex items-center justify-between">
                <div className="flex items-center gap-4">
                  {cellPreview && (
                    <div className="w-16 h-16 rounded-lg overflow-hidden border-2 border-white/30 shadow-lg shrink-0">
                      <img src={cellPreview} alt={`Square ${selectedCell}`} className="w-full h-full object-cover" />
                    </div>
                  )}
                  <div>
                    <CardTitle className="text-white text-lg">Register for Square {selectedCell}</CardTitle>
                    <p className="text-white/60 text-xs mt-0.5">Fill in your details to claim this square</p>
                  </div>
                </div>
                <button
                  onClick={() => { setSelectedCell(null); setCellPreview(null); }}
                  className="text-white/50 hover:text-white transition-colors"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
              <CardContent className="p-6 space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="name" className="text-sm font-semibold flex items-center gap-2">
                    <User className="h-3.5 w-3.5 text-muted-foreground" /> Name <span className="text-destructive">*</span>
                  </Label>
                  <Input
                    id="name"
                    value={name}
                    onChange={e => setName(e.target.value)}
                    placeholder="Your full name"
                    className="h-11"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email" className="text-sm font-semibold flex items-center gap-2">
                    <Mail className="h-3.5 w-3.5 text-muted-foreground" /> Email
                    <span className="text-xs font-normal text-muted-foreground">(for confirmation)</span>
                  </Label>
                  <Input
                    id="email"
                    type="email"
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    placeholder="your@email.com"
                    className="h-11"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="phone" className="text-sm font-semibold flex items-center gap-2">
                    <Phone className="h-3.5 w-3.5 text-muted-foreground" /> Phone
                  </Label>
                  <Input
                    id="phone"
                    type="tel"
                    value={phone}
                    onChange={e => setPhone(e.target.value)}
                    placeholder="(555) 123-4567"
                    className="h-11"
                  />
                </div>
                <div className="flex gap-2 pt-2">
                  <Button
                    className="flex-1 h-11 text-base font-bold shadow-lg shadow-primary/25"
                    disabled={!name.trim() || registerMutation.isPending}
                    onClick={() => registerMutation.mutate()}
                  >
                    {registerMutation.isPending ? (
                      <span className="flex items-center gap-2">
                        <span className="h-4 w-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        Registering...
                      </span>
                    ) : (
                      'Claim This Square'
                    )}
                  </Button>
                  <Button
                    variant="outline"
                    className="h-11"
                    onClick={() => { setSelectedCell(null); setCellPreview(null); }}
                  >
                    Cancel
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </section>

      {/* Footer */}
      <footer className="border-t bg-card py-8">
        <div className="max-w-5xl mx-auto px-4 text-center space-y-2">
          <p className="text-sm text-muted-foreground">
            Art of Aviation Community Mural — A Reno 250 Celebration
          </p>
          <p className="text-xs text-muted-foreground/60">
            Presented by Artown, The Discovery Museum & The George W. Gillemot Foundation
          </p>
        </div>
      </footer>
    </div>
  );
}
