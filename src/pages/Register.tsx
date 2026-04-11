import { useState, useMemo, useRef, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardTitle } from '@/components/ui/card';
import { toast } from '@/hooks/use-toast';
import { CheckCircle2, Plane, Palette, MapPin, Calendar, ArrowRight, X, Mail, Phone, User, Star, ExternalLink, Rocket } from 'lucide-react';
import { PublicNav } from '@/components/PublicNav';
import { sendConfirmationEmail } from '@/lib/sendConfirmationEmail';
import artownLogo from '@/assets/artown-logo.jpg';
import socLogo from '@/assets/soc-logo.png';
import discoveryLogo from '@/assets/discovery-logo.jpg';
import rwfLogo from '@/assets/rwf-logo.png';

const COLS = ['A','B','C','D','E','F','G','H','I','J','K','L','M','N','O','P','Q','R'];
const ROWS = Array.from({ length: 13 }, (_, i) => i + 1);

/* ---- mural-grid.png layout constants (pixels, from image analysis) ---- */
const IMG_W = 1306;
const IMG_H = 956;

const V_LINES = [38, 107, 176, 245, 314, 384, 453, 522, 591, 660, 730, 799, 868, 937, 1006, 1076, 1145, 1214, 1283];
const H_LINES = [42, 111, 180, 249, 318, 388, 457, 526, 595, 664, 734, 803, 872, 941];

const GRID_LEFT_PCT = (V_LINES[0] / IMG_W) * 100;
const GRID_TOP_PCT = (H_LINES[0] / IMG_H) * 100;
const GRID_WIDTH_PCT = ((V_LINES[V_LINES.length - 1] - V_LINES[0]) / IMG_W) * 100;
const GRID_HEIGHT_PCT = ((H_LINES[H_LINES.length - 1] - H_LINES[0]) / IMG_H) * 100;

const COL_WIDTHS = V_LINES.slice(0, -1).map((v, i) => V_LINES[i + 1] - v);
const GRID_TOTAL_W = V_LINES[V_LINES.length - 1] - V_LINES[0];
const COL_FR = COL_WIDTHS.map(w => `${w}fr`).join(' ');

const ROW_HEIGHTS = H_LINES.slice(0, -1).map((h, i) => H_LINES[i + 1] - h);
const GRID_TOTAL_H = H_LINES[H_LINES.length - 1] - H_LINES[0];
const ROW_FR = ROW_HEIGHTS.map(h => `${h}fr`).join(' ');

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

function cropCellFromMural(cellId: string): Promise<string> {
  return new Promise((resolve, reject) => {
    const colIdx = COLS.indexOf(cellId.charAt(0));
    const rowIdx = parseInt(cellId.slice(1), 10) - 1;
    if (colIdx < 0 || rowIdx < 0) return reject('Invalid cell');

    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => {
      const canvas = document.createElement('canvas');
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
      <div className="min-h-screen bg-black">
        <PublicNav />
        <div className="flex items-center justify-center h-[60vh]">
          <div className="text-center space-y-4">
            <Plane className="h-10 w-10 text-[#7fff00] animate-pulse mx-auto" />
            <p className="text-white/50 font-medium">Loading mural grid...</p>
          </div>
        </div>
      </div>
    );
  }

  /* ---------- Success state ---------- */
  if (success) {
    return (
      <div className="min-h-screen bg-black">
        <PublicNav />
        <div className="flex items-center justify-center p-8 min-h-[70vh]">
          <Card className="max-w-lg w-full text-center shadow-2xl border-0 overflow-hidden bg-[#0a0a0a] border border-[#7fff00]/20">
            <div className="bg-black p-8 border-b border-[#7fff00]/20">
              <CheckCircle2 className="h-16 w-16 text-[#7fff00] mx-auto mb-3" />
              <h2 className="text-3xl font-bold text-white">You're Registered!</h2>
            </div>
            <CardContent className="pt-8 pb-8 space-y-5">
              {cellPreview && (
                <div className="mx-auto w-40 h-40 rounded-lg overflow-hidden shadow-lg border-2 border-[#7fff00]/30">
                  <img src={cellPreview} alt={`Square ${success}`} className="w-full h-full object-cover" />
                </div>
              )}
              <p className="text-white/70 leading-relaxed">
                You've been assigned grid square{' '}
                <span className="inline-flex items-center px-3 py-1 rounded bg-[#7fff00] text-black font-bold text-sm">
                  {success}
                </span>
              </p>
              <p className="text-white/40 text-sm leading-relaxed">
                Thank you for participating in the Art of Aviation Community Mural!
              </p>
              <div className="bg-white/[0.03] border border-white/[0.08] rounded-lg p-5 text-sm text-white/60 space-y-3">
                <div className="flex items-center gap-3">
                  <MapPin className="h-4 w-4 text-[#7fff00] shrink-0" />
                  <span>Pick up your canvas at <strong className="text-white">The Discovery Museum</strong></span>
                </div>
                <div className="flex items-center gap-3">
                  <Calendar className="h-4 w-4 text-[#7fff00] shrink-0" />
                  <span>Available after <strong className="text-white">May 1</strong> — due <strong className="text-white">June 22</strong></span>
                </div>
                <div className="flex items-center gap-3">
                  <Star className="h-4 w-4 text-[#7fff00] shrink-0" />
                  <span>Join us for the unveiling at <strong className="text-white">The Discovery</strong> on <strong className="text-white">July 2nd</strong></span>
                </div>
              </div>
              {email.trim() && (
                <p className="text-xs text-white/30">
                  A confirmation email with your square artwork has been sent to <strong className="text-white/50">{email.trim()}</strong>.
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
    <div className="min-h-screen bg-black">
      <PublicNav />

      {/* Hero */}
      <section className="hero-gradient hero-glow text-white relative overflow-hidden">
        <div className="max-w-5xl mx-auto px-4 py-14 sm:py-20 text-center space-y-6 relative z-10">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded bg-white/[0.05] text-sm font-bold uppercase tracking-widest border border-white/[0.08] text-[#7fff00]">
            <Plane className="h-4 w-4" />
            <span>Reno 250 Celebration</span>
          </div>
          <h1 className="text-5xl sm:text-7xl font-black tracking-tight leading-[1.05]">
            Art of Aviation<br />
            <span className="text-[#7fff00]">Community Mural</span>
          </h1>
          <p className="text-base sm:text-lg text-white/50 leading-relaxed max-w-2xl mx-auto font-normal" style={{ fontFamily: 'Inter, sans-serif', textTransform: 'none', letterSpacing: 'normal' }}>
            Join us in creating a collaborative mural celebrating Northern Nevada's pioneering spirit
            in aviation. Select a square, paint your masterpiece, and become part of history.
          </p>

          {/* Stats */}
          <div className="flex justify-center gap-8 pt-4">
            <div className="text-center">
              <div className="text-3xl sm:text-5xl font-black text-white">{234 - takenCount}</div>
              <div className="text-[10px] uppercase tracking-[0.2em] text-white/30 mt-1 font-bold">Available</div>
            </div>
            <div className="w-px bg-[#7fff00]/20 self-stretch" />
            <div className="text-center">
              <div className="text-3xl sm:text-5xl font-black text-[#7fff00]">{takenCount}</div>
              <div className="text-[10px] uppercase tracking-[0.2em] text-white/30 mt-1 font-bold">Claimed</div>
            </div>
            <div className="w-px bg-[#7fff00]/20 self-stretch" />
            <div className="text-center">
              <div className="text-3xl sm:text-5xl font-black text-white">234</div>
              <div className="text-[10px] uppercase tracking-[0.2em] text-white/30 mt-1 font-bold">Total</div>
            </div>
          </div>
        </div>
      </section>

      {/* Partner strip */}
      <section className="border-b border-white/[0.05] bg-[#050505]">
        <div className="max-w-5xl mx-auto px-4 py-6">
          <p className="text-center text-[10px] uppercase tracking-[0.25em] text-white/25 mb-4 font-bold">Presented By</p>
          <div className="flex flex-wrap justify-center gap-6 sm:gap-10 items-center">
            <img src={artownLogo} alt="Artown" className="h-10 w-auto rounded-md opacity-90 hover:opacity-100 transition-opacity" />
            <img src={discoveryLogo} alt="The Discovery Museum" className="h-8 w-auto rounded-md opacity-90 hover:opacity-100 transition-opacity" />
            <img src={socLogo} alt="Strengthen our Community" className="h-8 w-auto rounded-md opacity-90 hover:opacity-100 transition-opacity bg-white/90 px-2 py-1" />
          </div>
          <div className="text-center mt-4">
            <Link to="/about" className="inline-flex items-center gap-1 text-sm text-[#7fff00]/80 hover:text-[#7fff00] font-bold uppercase tracking-wider transition-colors" style={{ fontFamily: 'Inter, sans-serif' }}>
              Learn more about the project & partners <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>
        </div>
      </section>

      {/* Red, White & Flight CTA Banner */}
      <section className="cta-banner">
        <div className="max-w-5xl mx-auto px-4 py-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <img src={rwfLogo} alt="Red, White and Flight" className="h-14 w-auto" />
            <div>
              <h3 className="text-white font-bold text-base" style={{ fontFamily: 'Oswald, sans-serif', textTransform: 'uppercase' }}>
                July 4th Drone Show & Concert
              </h3>
              <p className="text-white/50 text-sm" style={{ fontFamily: 'Inter, sans-serif', textTransform: 'none', letterSpacing: 'normal' }}>
                Free event at Mackay Stadium — drone show, Reno Phil concert & interactive expo
              </p>
            </div>
          </div>
          <a
            href="https://redwhiteandflight.org/"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded bg-red-600 hover:bg-red-700 text-white font-bold text-sm uppercase tracking-wider transition-all shrink-0 shadow-lg shadow-red-600/20"
          >
            Secure Your Free Spot <ExternalLink className="h-3.5 w-3.5" />
          </a>
        </div>
      </section>

      {/* How It Works */}
      <section className="max-w-5xl mx-auto px-4 py-8">
        <div className="glass-card rounded-lg p-6">
          <h3 className="font-bold text-white mb-4 flex items-center gap-3 text-lg">
            <span className="w-8 h-8 rounded bg-[#7fff00] text-black flex items-center justify-center text-sm font-black">?</span>
            How It Works
          </h3>
          <div className="grid sm:grid-cols-2 gap-4">
            {[
              { step: '1', text: 'Select an available square below and register with your name and contact info.' },
              { step: '2', text: 'Pick up your canvas at The Discovery Museum after May 1.' },
              { step: '3', text: 'Paint your square — any material welcome, match colors as closely as possible.' },
              { step: '4', text: 'Return your completed square by Monday, June 22nd.' },
            ].map(d => (
              <div key={d.step} className="flex items-start gap-3">
                <span className="w-7 h-7 rounded bg-[#7fff00]/15 text-[#7fff00] flex items-center justify-center text-xs font-black shrink-0 mt-0.5 border border-[#7fff00]/30">
                  {d.step}
                </span>
                <p className="text-sm text-white/50 leading-relaxed" style={{ fontFamily: 'Inter, sans-serif', textTransform: 'none', letterSpacing: 'normal' }}>{d.text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Grid section */}
      <section className="max-w-6xl mx-auto px-4 pb-10 space-y-5">
        {/* Legend */}
        <div className="flex items-center justify-between">
          <h2 className="text-xl sm:text-2xl font-bold text-white">Select Your Square</h2>
          <div className="flex gap-4 text-xs" style={{ fontFamily: 'Inter, sans-serif', textTransform: 'none', letterSpacing: 'normal' }}>
            <div className="flex items-center gap-1.5">
              <div className="w-4 h-4 rounded border border-dashed border-white/20 bg-white/[0.03]" />
              <span className="text-white/40 font-medium">Available</span>
            </div>
            <div className="flex items-center gap-1.5">
              <div className="w-4 h-4 rounded bg-[#7fff00]/30 border border-[#7fff00]/40" />
              <span className="text-white/40 font-medium">Taken</span>
            </div>
          </div>
        </div>

        {/* Grid overlay on mural */}
        <div className="relative rounded-lg overflow-hidden shadow-2xl ring-1 ring-white/[0.08]">
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
                        ? 'grid-cell-taken text-white/60'
                        : isSelected
                          ? 'grid-cell-selected'
                          : 'grid-cell-available text-white/30 hover:text-white'
                      }
                    `}
                    title={taken ? `${cellId} — Taken` : `${cellId} — Available`}
                  >
                    <span className="drop-shadow-[0_1px_2px_rgba(0,0,0,0.9)]">{cellId}</span>
                  </button>
                );
              })
            )}
          </div>
        </div>

        {/* Registration form */}
        {selectedCell && (
          <div ref={formRef} className="flex justify-center pt-4 pb-8">
            <Card className="max-w-md w-full shadow-2xl border-0 overflow-hidden bg-[#0a0a0a] border border-[#7fff00]/15">
              <div className="bg-black p-5 flex items-center justify-between border-b border-[#7fff00]/15">
                <div className="flex items-center gap-4">
                  {cellPreview && (
                    <div className="w-16 h-16 rounded-lg overflow-hidden border-2 border-[#7fff00]/30 shadow-lg shrink-0">
                      <img src={cellPreview} alt={`Square ${selectedCell}`} className="w-full h-full object-cover" />
                    </div>
                  )}
                  <div>
                    <CardTitle className="text-white text-lg">Register for Square {selectedCell}</CardTitle>
                    <p className="text-white/30 text-xs mt-0.5" style={{ fontFamily: 'Inter, sans-serif', textTransform: 'none', letterSpacing: 'normal' }}>Fill in your details to claim this square</p>
                  </div>
                </div>
                <button
                  onClick={() => { setSelectedCell(null); setCellPreview(null); }}
                  className="text-white/20 hover:text-white transition-colors"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
              <CardContent className="p-6 space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="name" className="text-sm font-semibold flex items-center gap-2 text-white/70" style={{ fontFamily: 'Inter, sans-serif', textTransform: 'none', letterSpacing: 'normal' }}>
                    <User className="h-3.5 w-3.5 text-white/30" /> Name <span className="text-[#7fff00]">*</span>
                  </Label>
                  <Input
                    id="name"
                    value={name}
                    onChange={e => setName(e.target.value)}
                    placeholder="Your full name"
                    className="h-11 bg-white/[0.03] border-white/[0.08] text-white placeholder:text-white/20 focus:border-[#7fff00]/50 focus:ring-[#7fff00]/20"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email" className="text-sm font-semibold flex items-center gap-2 text-white/70" style={{ fontFamily: 'Inter, sans-serif', textTransform: 'none', letterSpacing: 'normal' }}>
                    <Mail className="h-3.5 w-3.5 text-white/30" /> Email
                    <span className="text-xs font-normal text-white/30">(for confirmation)</span>
                  </Label>
                  <Input
                    id="email"
                    type="email"
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    placeholder="your@email.com"
                    className="h-11 bg-white/[0.03] border-white/[0.08] text-white placeholder:text-white/20 focus:border-[#7fff00]/50 focus:ring-[#7fff00]/20"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="phone" className="text-sm font-semibold flex items-center gap-2 text-white/70" style={{ fontFamily: 'Inter, sans-serif', textTransform: 'none', letterSpacing: 'normal' }}>
                    <Phone className="h-3.5 w-3.5 text-white/30" /> Phone
                  </Label>
                  <Input
                    id="phone"
                    type="tel"
                    value={phone}
                    onChange={e => setPhone(e.target.value)}
                    placeholder="(555) 123-4567"
                    className="h-11 bg-white/[0.03] border-white/[0.08] text-white placeholder:text-white/20 focus:border-[#7fff00]/50 focus:ring-[#7fff00]/20"
                  />
                </div>
                <div className="flex gap-2 pt-2">
                  <Button
                    className="flex-1 h-11 text-base font-black uppercase tracking-wider btn-neon rounded"
                    disabled={!name.trim() || registerMutation.isPending}
                    onClick={() => registerMutation.mutate()}
                  >
                    {registerMutation.isPending ? (
                      <span className="flex items-center gap-2">
                        <span className="h-4 w-4 border-2 border-black/30 border-t-black rounded-full animate-spin" />
                        Registering...
                      </span>
                    ) : (
                      'Claim This Square'
                    )}
                  </Button>
                  <Button
                    variant="outline"
                    className="h-11 border-white/[0.08] text-white/40 hover:bg-white/[0.03] hover:text-white rounded"
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
      <footer className="border-t border-white/[0.05] bg-black">
        <div className="artown-dash w-full" />
        <div className="max-w-5xl mx-auto px-4 py-10">
          <div className="flex flex-wrap justify-center gap-6 sm:gap-10 items-center mb-6">
            <img src={artownLogo} alt="Artown" className="h-8 w-auto rounded-md opacity-70" />
            <img src={discoveryLogo} alt="The Discovery Museum" className="h-7 w-auto rounded-md opacity-70" />
            <img src={socLogo} alt="Strengthen our Community" className="h-7 w-auto rounded-md opacity-70 bg-white/80 px-2 py-0.5" />
          </div>
          <div className="text-center space-y-2">
            <p className="text-sm text-white/40" style={{ fontFamily: 'Inter, sans-serif', textTransform: 'none', letterSpacing: 'normal' }}>
              Art of Aviation Community Mural — A Reno 250 Celebration
            </p>
            <p className="text-xs text-white/20" style={{ fontFamily: 'Inter, sans-serif', textTransform: 'none', letterSpacing: 'normal' }}>
              Presented by Artown, The Discovery Museum, The George W. Gillemot Foundation & Strengthen our Community
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
