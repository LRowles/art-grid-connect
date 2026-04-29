import { useState, useMemo, useRef, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardTitle } from '@/components/ui/card';
import { toast } from '@/hooks/use-toast';
import {
  CheckCircle2, Plane, Palette, MapPin, Calendar, ArrowRight, X, Mail, Phone, User,
  Star, ExternalLink, Rocket, Globe, Instagram, Share2, Twitter, Facebook, Compass,
  PlaneTakeoff, Users, Clock, Heart
} from 'lucide-react';
import { PublicNav } from '@/components/PublicNav';
import { sendConfirmationEmail } from '@/lib/sendConfirmationEmail';
import artownLogo from '@/assets/artown-logo.jpg';
import socLogo from '@/assets/soc-logo.png';
import discoveryLogo from '@/assets/discovery-logo.jpg';
import rwfLogo from '@/assets/rwf-logo.png';
import muralArtwork from '@/assets/mural-artwork.png';
import gillemotLogo from '@/assets/gillemot-logo-white.png';

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

type ArtistProfile = {
  id: string;
  name: string;
  bio: string | null;
  website: string | null;
  social_handle: string | null;
  aviation_connection: boolean;
  aviation_description: string | null;
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

function usePublicArtistProfiles() {
  return useQuery({
    queryKey: ['public_artist_profiles'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('artists')
        .select('id, name, bio, website, social_handle, aviation_connection, aviation_description');
      if (error) throw error;
      return data as ArtistProfile[];
    },
  });
}

function useBackupArtistCount() {
  return useQuery({
    queryKey: ['backup_artist_count'],
    queryFn: async () => {
      const { count, error } = await supabase
        .from('backup_artists')
        .select('*', { count: 'exact', head: true });
      if (error) throw error;
      return count || 0;
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

/* Social sharing helpers */
function getShareUrl() {
  return 'https://artowncommunitymural.com';
}

function shareOnTwitter(cell: string, name: string) {
  const text = `I just claimed Square ${cell} in the Art of Aviation Community Mural! 🎨✈️ Join me in creating a collaborative masterpiece celebrating Northern Nevada's aviation heritage. #ArtOfAviation #Reno250 #Artown`;
  window.open(`https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(getShareUrl())}`, '_blank');
}

function shareOnFacebook(cell: string) {
  window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(getShareUrl())}&quote=${encodeURIComponent(`I just claimed Square ${cell} in the Art of Aviation Community Mural! Join me in creating a collaborative masterpiece.`)}`, '_blank');
}

function copyShareLink(cell: string) {
  const text = `I just claimed Square ${cell} in the Art of Aviation Community Mural! Join me: ${getShareUrl()}`;
  navigator.clipboard.writeText(text).then(() => {
    // Toast handled by caller
  });
}

/* ---- Hover tooltip component ---- */
function ArtistHoverCard({ artist, cellId }: { artist: ArtistProfile | undefined; cellId: string }) {
  if (!artist) return null;
  return (
    <div className="absolute z-50 bottom-full left-1/2 -translate-x-1/2 mb-2 w-56 bg-[#0a0a0a] border border-[#dc2626]/30 shadow-2xl shadow-black/50 p-3 pointer-events-none"
      style={{ fontFamily: 'Inter, sans-serif', textTransform: 'none', letterSpacing: 'normal' }}>
      <p className="text-white font-bold text-sm truncate">{artist.name}</p>
      <p className="text-white/30 text-xs mb-1">Square {cellId}</p>
      {artist.bio && (
        <p className="text-white/50 text-xs leading-relaxed line-clamp-2 mb-1">{artist.bio}</p>
      )}
      {artist.aviation_connection && artist.aviation_description && (
        <p className="text-[#00ccff] text-xs flex items-center gap-1 mb-1">
          <PlaneTakeoff className="h-3 w-3 shrink-0" /> {artist.aviation_description.slice(0, 60)}{artist.aviation_description.length > 60 ? '...' : ''}
        </p>
      )}
      {artist.social_handle && (
        <p className="text-[#dc2626]/70 text-xs truncate">{artist.social_handle}</p>
      )}
    </div>
  );
}

export default function Register() {
  const queryClient = useQueryClient();
  const { data: assignments, isLoading } = usePublicGridAssignments();
  const { data: artistProfiles } = usePublicArtistProfiles();
  const { data: backupCount } = useBackupArtistCount();
  const [selectedCell, setSelectedCell] = useState<string | null>(null);
  const [hoveredCell, setHoveredCell] = useState<string | null>(null);
  const [showBackupForm, setShowBackupForm] = useState(false);
  const [backupSuccess, setBackupSuccess] = useState<number | null>(null);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [bio, setBio] = useState('');
  const [website, setWebsite] = useState('');
  const [socialHandle, setSocialHandle] = useState('');
  const [aviationConnection, setAviationConnection] = useState(false);
  const [aviationDescription, setAviationDescription] = useState('');
  const [success, setSuccess] = useState<string | null>(null);
  const [cellPreview, setCellPreview] = useState<string | null>(null);
  const [showShareMenu, setShowShareMenu] = useState(false);
  const formRef = useRef<HTMLDivElement>(null);

  const assignmentMap = useMemo(() => {
    const map = new Map<string, GridAssignment>();
    assignments?.forEach(a => map.set(a.grid_cell, a));
    return map;
  }, [assignments]);

  const artistProfileMap = useMemo(() => {
    const map = new Map<string, ArtistProfile>();
    artistProfiles?.forEach(a => map.set(a.id, a));
    return map;
  }, [artistProfiles]);

  const takenCount = useMemo(() => {
    if (!assignments) return 0;
    return assignments.filter(a => !!a.artist_id).length;
  }, [assignments]);

  const allSquaresTaken = takenCount >= 234;

  const backupRegisterMutation = useMutation({
    mutationFn: async () => {
      if (!name.trim()) throw new Error('Name is required');

      // Get next position
      const { data: posData, error: posErr } = await supabase.rpc('next_waitlist_position');
      const position = posErr ? (backupCount || 0) + 1 : posData;

      const { data, error } = await supabase
        .from('backup_artists')
        .insert({
          name: name.trim(),
          email: email.trim() || null,
          phone: phone.trim() || null,
          bio: bio.trim() || null,
          website: website.trim() || null,
          social_handle: socialHandle.trim() || null,
          aviation_connection: aviationConnection,
          aviation_description: aviationDescription.trim() || null,
          waitlist_position: position,
        })
        .select()
        .single();
      if (error) throw error;
      return { position: data.waitlist_position, artistName: name.trim(), artistEmail: email.trim() };
    },
    onSuccess: (result) => {
      setBackupSuccess(result.position);
      queryClient.invalidateQueries({ queryKey: ['backup_artist_count'] });
    },
    onError: (err: Error) => {
      toast({ title: 'Registration failed', description: err.message, variant: 'destructive' });
    },
  });

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
        .insert({
          name: name.trim(),
          email: email.trim() || null,
          phone: phone.trim() || null,
          bio: bio.trim() || null,
          website: website.trim() || null,
          social_handle: socialHandle.trim() || null,
          aviation_connection: aviationConnection,
          aviation_description: aviationDescription.trim() || null,
        })
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
      queryClient.invalidateQueries({ queryKey: ['public_artist_profiles'] });

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
            <Plane className="h-12 w-12 text-[#dc2626] animate-pulse mx-auto" />
            <p className="text-white/50 text-lg font-medium">Loading mural grid...</p>
          </div>
        </div>
      </div>
    );
  }

  /* ---------- Backup artist success state ---------- */
  if (backupSuccess !== null) {
    const isPriority = backupSuccess <= 16;
    return (
      <div className="min-h-screen bg-black">
        <PublicNav />
        <div className="flex items-center justify-center p-8 min-h-[70vh]">
          <Card className="max-w-lg w-full text-center shadow-2xl overflow-hidden bg-[#0a0a0a] border border-[#dc2626]/20">
            <div className="bg-black p-8 border-b border-[#dc2626]/20">
              <Heart className="h-16 w-16 text-[#dc2626] mx-auto mb-3" />
              <h2 className="text-4xl font-bold text-white">You're on the List!</h2>
            </div>
            <CardContent className="pt-8 pb-8 space-y-5">
              <div className="inline-flex items-center gap-3 px-6 py-3 bg-[#dc2626]/10 border border-[#dc2626]/30">
                <span className="text-5xl font-black text-[#dc2626]">#{backupSuccess}</span>
                <div className="text-left">
                  <p className="text-white font-bold text-sm">{isPriority ? 'Priority Backup' : 'Waitlist'}</p>
                  <p className="text-white/40 text-xs">{isPriority ? 'First 16 to be called' : 'General waitlist'}</p>
                </div>
              </div>

              <p className="text-white/70 text-lg leading-relaxed" style={{ fontFamily: 'Inter, sans-serif', textTransform: 'none', letterSpacing: 'normal' }}>
                Thank you for joining the backup artist list for the Art of Aviation Community Mural!
                {isPriority
                  ? ' As a priority backup artist, you\'ll be among the first contacted if a square becomes available.'
                  : ' We\'ll contact you if a square becomes available.'}
              </p>

              <div className="bg-white/[0.03] border border-white/[0.08] p-5 text-base text-white/60 space-y-3">
                <div className="flex items-center gap-3">
                  <Clock className="h-5 w-5 text-[#dc2626] shrink-0" />
                  <span>We'll reach out after the <strong className="text-white">June 22nd</strong> deadline if squares are available</span>
                </div>
                <div className="flex items-center gap-3">
                  <Star className="h-5 w-5 text-[#dc2626] shrink-0" />
                  <span>You're still invited to the <strong className="text-white">July 2nd unveiling</strong> at The Discovery!</span>
                </div>
                <div className="flex items-center gap-3">
                  <Users className="h-5 w-5 text-[#dc2626] shrink-0" />
                  <span>Help us reach <strong className="text-white">250 artists</strong> for Reno's 250th — share the project!</span>
                </div>
              </div>

              {/* Social Sharing */}
              <div className="pt-4 space-y-3">
                <p className="text-sm text-white/40 uppercase tracking-wider font-bold">Share on Social Media</p>
                <div className="flex justify-center gap-3">
                  <button
                    onClick={() => {
                      const text = `I just joined the backup artist list for the Art of Aviation Community Mural! 🎨✈️ Help us reach 250 artists for Reno's 250th! #ArtOfAviation #Reno250 #Artown`;
                      window.open(`https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(getShareUrl())}`, '_blank');
                    }}
                    className="flex items-center gap-2 px-4 py-2.5 bg-[#1DA1F2]/10 border border-[#1DA1F2]/30 text-[#1DA1F2] hover:bg-[#1DA1F2]/20 transition-all text-sm font-medium"
                    style={{ fontFamily: 'Inter, sans-serif', textTransform: 'none', letterSpacing: 'normal' }}
                  >
                    <Twitter className="h-4 w-4" /> Twitter / X
                  </button>
                  <button
                    onClick={() => {
                      window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(getShareUrl())}&quote=${encodeURIComponent('I just joined the backup artist list for the Art of Aviation Community Mural! Help us reach 250 artists for Reno\'s 250th!')}`, '_blank');
                    }}
                    className="flex items-center gap-2 px-4 py-2.5 bg-[#1877F2]/10 border border-[#1877F2]/30 text-[#1877F2] hover:bg-[#1877F2]/20 transition-all text-sm font-medium"
                    style={{ fontFamily: 'Inter, sans-serif', textTransform: 'none', letterSpacing: 'normal' }}
                  >
                    <Facebook className="h-4 w-4" /> Facebook
                  </button>
                  <button
                    onClick={() => {
                      navigator.clipboard.writeText(`I just joined the backup artist list for the Art of Aviation Community Mural! Help us reach 250 artists: ${getShareUrl()}`);
                      toast({ title: 'Link copied!', description: 'Share link has been copied to your clipboard.' });
                    }}
                    className="flex items-center gap-2 px-4 py-2.5 bg-white/[0.05] border border-white/[0.15] text-white/60 hover:text-white hover:bg-white/[0.1] transition-all text-sm font-medium"
                    style={{ fontFamily: 'Inter, sans-serif', textTransform: 'none', letterSpacing: 'normal' }}
                  >
                    <Share2 className="h-4 w-4" /> Copy Link
                  </button>
                </div>
              </div>

              <div className="pt-2">
                <Link
                  to="/events"
                  className="inline-flex items-center gap-2 text-[#dc2626] hover:text-[#ef4444] font-bold text-sm uppercase tracking-wider transition-colors"
                >
                  View upcoming events <ArrowRight className="h-4 w-4" />
                </Link>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  /* ---------- Success state with social sharing ---------- */
  if (success) {
    return (
      <div className="min-h-screen bg-black">
        <PublicNav />
        <div className="flex items-center justify-center p-8 min-h-[70vh]">
          <Card className="max-w-lg w-full text-center shadow-2xl overflow-hidden bg-[#0a0a0a] border border-[#dc2626]/20">
            <div className="bg-black p-8 border-b border-[#dc2626]/20">
              <CheckCircle2 className="h-16 w-16 text-[#dc2626] mx-auto mb-3" />
              <h2 className="text-4xl font-bold text-white">You're Registered!</h2>
            </div>
            <CardContent className="pt-8 pb-8 space-y-5">
              {cellPreview && (
                <div className="mx-auto w-44 h-44 overflow-hidden shadow-lg border-2 border-[#dc2626]/30">
                  <img src={cellPreview} alt={`Square ${success}`} className="w-full h-full object-cover" />
                </div>
              )}
              <p className="text-white/70 text-lg leading-relaxed">
                You've been assigned grid square{' '}
                <span className="inline-flex items-center px-3 py-1 bg-[#dc2626] text-white font-bold text-base">
                  {success}
                </span>
              </p>
              <p className="text-white/40 text-base leading-relaxed">
                Thank you for participating in the Art of Aviation Community Mural!
              </p>
              <div className="bg-white/[0.03] border border-white/[0.08] p-5 text-base text-white/60 space-y-3">
                <div className="flex items-center gap-3">
                  <MapPin className="h-5 w-5 text-[#dc2626] shrink-0" />
                  <span>Pick up your canvas at <strong className="text-white">The Discovery Museum</strong></span>
                </div>
                <div className="flex items-center gap-3">
                  <Calendar className="h-5 w-5 text-[#dc2626] shrink-0" />
                  <span>Available after <strong className="text-white">May 1</strong> — due <strong className="text-white">June 22</strong></span>
                </div>
                <div className="flex items-center gap-3">
                  <Star className="h-5 w-5 text-[#dc2626] shrink-0" />
                  <span>Join us for the unveiling at <strong className="text-white">The Discovery</strong> on <strong className="text-white">July 2nd</strong></span>
                </div>
              </div>

              {/* Social Sharing */}
              <div className="pt-4 space-y-3">
                <p className="text-sm text-white/40 uppercase tracking-wider font-bold">Share on Social Media</p>
                <div className="flex justify-center gap-3">
                  <button
                    onClick={() => shareOnTwitter(success, name)}
                    className="flex items-center gap-2 px-4 py-2.5 bg-[#1DA1F2]/10 border border-[#1DA1F2]/30 text-[#1DA1F2] hover:bg-[#1DA1F2]/20 transition-all text-sm font-medium"
                    style={{ fontFamily: 'Inter, sans-serif', textTransform: 'none', letterSpacing: 'normal' }}
                  >
                    <Twitter className="h-4 w-4" /> Twitter / X
                  </button>
                  <button
                    onClick={() => shareOnFacebook(success)}
                    className="flex items-center gap-2 px-4 py-2.5 bg-[#1877F2]/10 border border-[#1877F2]/30 text-[#1877F2] hover:bg-[#1877F2]/20 transition-all text-sm font-medium"
                    style={{ fontFamily: 'Inter, sans-serif', textTransform: 'none', letterSpacing: 'normal' }}
                  >
                    <Facebook className="h-4 w-4" /> Facebook
                  </button>
                  <button
                    onClick={() => {
                      copyShareLink(success);
                      toast({ title: 'Link copied!', description: 'Share link has been copied to your clipboard.' });
                    }}
                    className="flex items-center gap-2 px-4 py-2.5 bg-white/[0.05] border border-white/[0.15] text-white/60 hover:text-white hover:bg-white/[0.1] transition-all text-sm font-medium"
                    style={{ fontFamily: 'Inter, sans-serif', textTransform: 'none', letterSpacing: 'normal' }}
                  >
                    <Share2 className="h-4 w-4" /> Copy Link
                  </button>
                </div>
              </div>

              {email.trim() && (
                <p className="text-sm text-white/30">
                  A confirmation email with your square artwork has been sent to <strong className="text-white/50">{email.trim()}</strong>.
                </p>
              )}

              <div className="pt-2">
                <Link
                  to="/follow-along"
                  className="inline-flex items-center gap-2 text-[#dc2626] hover:text-[#ef4444] font-bold text-sm uppercase tracking-wider transition-colors"
                >
                  Share your progress on Follow Along <ArrowRight className="h-4 w-4" />
                </Link>
              </div>
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
          <div className="inline-flex items-center gap-2 px-5 py-2 bg-white/[0.05] text-base font-bold uppercase tracking-widest border border-white/[0.08] text-[#dc2626]">
            <Plane className="h-5 w-5" />
            <span>Reno 250 Celebration</span>
          </div>
          <h1 className="text-6xl sm:text-8xl font-black tracking-tight leading-[1.05]">
            Art of Aviation<br />
            <span className="text-[#dc2626]">Community Mural</span>
          </h1>
          <p className="text-lg sm:text-xl text-white/50 leading-relaxed max-w-2xl mx-auto" style={{ fontFamily: 'Inter, sans-serif', textTransform: 'none', letterSpacing: 'normal' }}>
            Join us in creating a collaborative mural celebrating Northern Nevada's pioneering spirit
            in aviation. Select a square, paint your masterpiece, and become part of history.
          </p>

          {/* Stats */}
          <div className="flex justify-center gap-8 pt-4">
            <div className="text-center">
              <div className="text-4xl sm:text-6xl font-black text-white">{234 - takenCount}</div>
              <div className="text-xs uppercase tracking-[0.2em] text-white/30 mt-1 font-bold">Available</div>
            </div>
            <div className="w-px bg-[#dc2626]/20 self-stretch" />
            <div className="text-center">
              <div className="text-4xl sm:text-6xl font-black text-[#dc2626]">{takenCount}</div>
              <div className="text-xs uppercase tracking-[0.2em] text-white/30 mt-1 font-bold">Claimed</div>
            </div>
            <div className="w-px bg-[#dc2626]/20 self-stretch" />
            <div className="text-center">
              <div className="text-4xl sm:text-6xl font-black text-white">{takenCount + (backupCount || 0)}</div>
              <div className="text-xs uppercase tracking-[0.2em] text-white/30 mt-1 font-bold">Total Artists</div>
            </div>
            {(backupCount || 0) > 0 && (
              <>
                <div className="w-px bg-[#dc2626]/20 self-stretch" />
                <div className="text-center">
                  <div className="text-4xl sm:text-6xl font-black text-[#ffcc00]">{backupCount}</div>
                  <div className="text-xs uppercase tracking-[0.2em] text-white/30 mt-1 font-bold">Backup</div>
                </div>
              </>
            )}
          </div>

          {/* Goal tracker */}
          <div className="max-w-md mx-auto pt-2">
            <div className="flex justify-between text-xs text-white/30 mb-1 font-bold uppercase tracking-wider">
              <span>{takenCount + (backupCount || 0)} artists</span>
              <span>Goal: 250</span>
            </div>
            <div className="h-2 bg-white/[0.05] overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-[#dc2626] to-[#ffcc00] transition-all duration-1000"
                style={{ width: `${Math.min(((takenCount + (backupCount || 0)) / 250) * 100, 100)}%` }}
              />
            </div>
          </div>
        </div>
      </section>

      {/* Combined: Presented By — Gillemot Foundation listed first, then partner logos */}
      <section className="border-b border-white/[0.05] bg-[#0a0a0a]">
        <div className="max-w-5xl mx-auto px-4 py-8">
          <p className="text-center text-xs uppercase tracking-[0.25em] text-[#dc2626] mb-5 font-bold">Presented By</p>

          {/* Gillemot Foundation — featured first */}
          <div className="text-center mb-6">
            <img src={gillemotLogo} alt="The George W. Gillemot Foundation" className="h-16 sm:h-20 w-auto mx-auto mb-3" />
            <p className="text-base text-white/40 mt-2 max-w-xl mx-auto" style={{ fontFamily: 'Inter, sans-serif', textTransform: 'none', letterSpacing: 'normal' }}>
              Key funder of the original professional mural artwork — supporting aviation education and inspiring the next generation of aerospace leaders.
            </p>
          </div>

          {/* Divider */}
          <div className="w-20 h-px bg-[#dc2626]/30 mx-auto mb-6" />

          {/* Partner logos */}
          <div className="flex flex-wrap justify-center gap-8 sm:gap-12 items-center">
            <img src={artownLogo} alt="Artown" className="h-12 w-auto opacity-90 hover:opacity-100 transition-opacity" />
            <img src={discoveryLogo} alt="The Discovery Museum" className="h-10 w-auto opacity-90 hover:opacity-100 transition-opacity" />
            <img src={socLogo} alt="Strengthen our Community" className="h-10 w-auto opacity-90 hover:opacity-100 transition-opacity bg-white/90 px-2 py-1" />
          </div>
          <div className="text-center mt-5">
            <Link to="/about" className="inline-flex items-center gap-1 text-base text-[#dc2626]/80 hover:text-[#dc2626] font-bold uppercase tracking-wider transition-colors" style={{ fontFamily: 'Inter, sans-serif' }}>
              Learn more about the project & partners <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </section>

      {/* Meet the Artist — Reilly Moss callout */}
      <section className="border-b border-white/[0.05] bg-black">
        <div className="max-w-5xl mx-auto px-4 py-10">
          <div className="flex flex-col sm:flex-row items-center gap-6 sm:gap-8">
            <div className="w-full sm:w-72 shrink-0 overflow-hidden border border-white/[0.08] shadow-xl">
              <img src={muralArtwork} alt="A Sky Written by Dreamers by Reilly Moss" className="w-full h-auto" />
            </div>
            <div className="space-y-3 text-center sm:text-left">
              <p className="text-xs uppercase tracking-[0.25em] text-[#dc2626] font-bold">Meet the Artist</p>
              <h3 className="text-2xl sm:text-3xl font-bold text-white">Reilly Moss</h3>
              <p className="text-base text-white/50 leading-relaxed" style={{ fontFamily: 'Inter, sans-serif', textTransform: 'none', letterSpacing: 'normal' }}>
                "A Sky Written by Dreamers" — a sweeping panorama where America's story of flight unfolds 
                through the Northern Nevada sky, blending past, present, and future into a powerful symbol of possibility.
              </p>
              <div className="flex flex-wrap gap-3 justify-center sm:justify-start">
                <a href="https://www.reillymoss.com" target="_blank" rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 text-sm text-white/50 hover:text-white transition-colors"
                  style={{ fontFamily: 'Inter, sans-serif', textTransform: 'none', letterSpacing: 'normal' }}>
                  <Globe className="h-3.5 w-3.5" /> reillymoss.com
                </a>
                <a href="https://www.instagram.com/reillymossart" target="_blank" rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 text-sm text-white/50 hover:text-white transition-colors"
                  style={{ fontFamily: 'Inter, sans-serif', textTransform: 'none', letterSpacing: 'normal' }}>
                  <Instagram className="h-3.5 w-3.5" /> @reillymossart
                </a>
              </div>
              <Link to="/about" className="inline-flex items-center gap-1 text-sm text-[#dc2626]/80 hover:text-[#dc2626] font-bold uppercase tracking-wider transition-colors">
                Read full artist statement <ArrowRight className="h-3.5 w-3.5" />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="max-w-5xl mx-auto px-4 py-10">
        <div className="glass-card p-8">
          <h3 className="font-bold text-white mb-5 flex items-center gap-3 text-xl">
            <span className="w-9 h-9 bg-[#dc2626] text-white flex items-center justify-center text-base font-black">?</span>
            How It Works
          </h3>
          <div className="grid sm:grid-cols-2 gap-5">
            {[
              { step: '1', text: 'Select an available square below and register with your name and contact info.' },
              { step: '2', text: 'Pick up your canvas at The Discovery Museum after May 1.' },
              { step: '3', text: 'Paint your square — any material welcome, match colors as closely as possible.' },
              { step: '4', text: 'Return your completed square by Monday, June 22nd.' },
            ].map(d => (
              <div key={d.step} className="flex items-start gap-3">
                <span className="w-8 h-8 bg-[#dc2626]/15 text-[#dc2626] flex items-center justify-center text-sm font-black shrink-0 mt-0.5 border border-[#dc2626]/30">
                  {d.step}
                </span>
                <p className="text-base text-white/50 leading-relaxed" style={{ fontFamily: 'Inter, sans-serif', textTransform: 'none', letterSpacing: 'normal' }}>{d.text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Grid section */}
      <section className="max-w-6xl mx-auto px-4 pb-10 space-y-5">
        {/* Legend */}
        <div className="flex items-center justify-between">
          <h2 className="text-2xl sm:text-3xl font-bold text-white">Select Your Square</h2>
          <div className="flex gap-5 text-sm" style={{ fontFamily: 'Inter, sans-serif', textTransform: 'none', letterSpacing: 'normal' }}>
            <div className="flex items-center gap-2">
              <div className="w-5 h-5 border border-dashed border-white/20 bg-white/[0.03]" />
              <span className="text-white/40 font-medium">Available</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-5 h-5 bg-[#dc2626]/30 border border-[#dc2626]/40" />
              <span className="text-white/40 font-medium">Taken</span>
            </div>
          </div>
        </div>

        {/* Grid overlay on mural */}
        <div className="relative overflow-hidden shadow-2xl ring-1 ring-white/[0.08]">
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
                const isHovered = hoveredCell === cellId;
                const artistProfile = taken && assignment?.artist_id ? artistProfileMap.get(assignment.artist_id) : undefined;

                return (
                  <button
                    key={cellId}
                    disabled={taken}
                    onClick={() => !taken && handleCellSelect(cellId)}
                    onMouseEnter={() => taken && setHoveredCell(cellId)}
                    onMouseLeave={() => setHoveredCell(null)}
                    className={`
                      transition-all duration-200 flex items-center justify-center text-[0.55rem] sm:text-[0.7rem] font-bold relative
                      ${taken
                        ? 'grid-cell-taken text-white/60'
                        : isSelected
                          ? 'grid-cell-selected'
                          : 'grid-cell-available text-white/30 hover:text-white'
                      }
                    `}
                    title={taken ? `${cellId} — ${artistProfile?.name || 'Taken'}` : `${cellId} — Available`}
                  >
                    <span className="drop-shadow-[0_1px_2px_rgba(0,0,0,0.9)]">{cellId}</span>
                    {isHovered && taken && artistProfile && (
                      <ArtistHoverCard artist={artistProfile} cellId={cellId} />
                    )}
                  </button>
                );
              })
            )}
          </div>
        </div>

        {/* Registration form */}
        {selectedCell && (
          <div ref={formRef} className="flex justify-center pt-4 pb-8">
            <Card className="max-w-md w-full shadow-2xl overflow-hidden bg-[#0a0a0a] border border-[#dc2626]/15">
              <div className="bg-black p-6 flex items-center justify-between border-b border-[#dc2626]/15">
                <div className="flex items-center gap-4">
                  {cellPreview && (
                    <div className="w-18 h-18 overflow-hidden border-2 border-[#dc2626]/30 shadow-lg shrink-0">
                      <img src={cellPreview} alt={`Square ${selectedCell}`} className="w-full h-full object-cover" />
                    </div>
                  )}
                  <div>
                    <CardTitle className="text-white text-xl">Register for Square {selectedCell}</CardTitle>
                    <p className="text-white/30 text-sm mt-1" style={{ fontFamily: 'Inter, sans-serif', textTransform: 'none', letterSpacing: 'normal' }}>Fill in your details to claim this square</p>
                  </div>
                </div>
                <button
                  onClick={() => { setSelectedCell(null); setCellPreview(null); }}
                  className="text-white/20 hover:text-white transition-colors"
                >
                  <X className="h-6 w-6" />
                </button>
              </div>
              <CardContent className="p-6 space-y-5">
                {/* Required fields */}
                <div className="space-y-2">
                  <Label htmlFor="name" className="text-base font-semibold flex items-center gap-2 text-white/70" style={{ fontFamily: 'Inter, sans-serif', textTransform: 'none', letterSpacing: 'normal' }}>
                    <User className="h-4 w-4 text-white/30" /> Name <span className="text-[#dc2626]">*</span>
                  </Label>
                  <Input
                    id="name"
                    value={name}
                    onChange={e => setName(e.target.value)}
                    placeholder="Your full name"
                    className="h-12 text-base bg-white/[0.03] border-white/[0.08] text-white placeholder:text-white/20 focus:border-[#dc2626]/50 focus:ring-[#dc2626]/20"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email" className="text-base font-semibold flex items-center gap-2 text-white/70" style={{ fontFamily: 'Inter, sans-serif', textTransform: 'none', letterSpacing: 'normal' }}>
                    <Mail className="h-4 w-4 text-white/30" /> Email
                    <span className="text-sm font-normal text-white/30">(for confirmation & updates)</span>
                  </Label>
                  <Input
                    id="email"
                    type="email"
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    placeholder="your@email.com"
                    className="h-12 text-base bg-white/[0.03] border-white/[0.08] text-white placeholder:text-white/20 focus:border-[#dc2626]/50 focus:ring-[#dc2626]/20"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="phone" className="text-base font-semibold flex items-center gap-2 text-white/70" style={{ fontFamily: 'Inter, sans-serif', textTransform: 'none', letterSpacing: 'normal' }}>
                    <Phone className="h-4 w-4 text-white/30" /> Phone
                  </Label>
                  <Input
                    id="phone"
                    type="tel"
                    value={phone}
                    onChange={e => setPhone(e.target.value)}
                    placeholder="(555) 123-4567"
                    className="h-12 text-base bg-white/[0.03] border-white/[0.08] text-white placeholder:text-white/20 focus:border-[#dc2626]/50 focus:ring-[#dc2626]/20"
                  />
                </div>

                {/* Divider */}
                <div className="border-t border-white/[0.06] pt-4">
                  <p className="text-xs uppercase tracking-[0.2em] text-[#dc2626]/70 font-bold mb-4">Artist Profile (Optional)</p>
                </div>

                {/* Bio */}
                <div className="space-y-2">
                  <Label htmlFor="bio" className="text-base font-semibold flex items-center gap-2 text-white/70" style={{ fontFamily: 'Inter, sans-serif', textTransform: 'none', letterSpacing: 'normal' }}>
                    <Palette className="h-4 w-4 text-white/30" /> Short Bio
                  </Label>
                  <Textarea
                    id="bio"
                    value={bio}
                    onChange={e => setBio(e.target.value)}
                    placeholder="Tell us a little about yourself as an artist..."
                    maxLength={300}
                    rows={3}
                    className="text-base bg-white/[0.03] border-white/[0.08] text-white placeholder:text-white/20 focus:border-[#dc2626]/50 focus:ring-[#dc2626]/20 resize-none"
                  />
                  <p className="text-xs text-white/20 text-right">{bio.length}/300</p>
                </div>

                {/* Website / Social */}
                <div className="space-y-2">
                  <Label htmlFor="website" className="text-base font-semibold flex items-center gap-2 text-white/70" style={{ fontFamily: 'Inter, sans-serif', textTransform: 'none', letterSpacing: 'normal' }}>
                    <Globe className="h-4 w-4 text-white/30" /> Website or Social Media
                  </Label>
                  <Input
                    id="website"
                    value={website}
                    onChange={e => setWebsite(e.target.value)}
                    placeholder="https://yoursite.com or @handle"
                    className="h-12 text-base bg-white/[0.03] border-white/[0.08] text-white placeholder:text-white/20 focus:border-[#dc2626]/50 focus:ring-[#dc2626]/20"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="social" className="text-base font-semibold flex items-center gap-2 text-white/70" style={{ fontFamily: 'Inter, sans-serif', textTransform: 'none', letterSpacing: 'normal' }}>
                    <Instagram className="h-4 w-4 text-white/30" /> Social Media Handle
                  </Label>
                  <Input
                    id="social"
                    value={socialHandle}
                    onChange={e => setSocialHandle(e.target.value)}
                    placeholder="@yourusername"
                    className="h-12 text-base bg-white/[0.03] border-white/[0.08] text-white placeholder:text-white/20 focus:border-[#dc2626]/50 focus:ring-[#dc2626]/20"
                  />
                </div>

                {/* Aviation Connection */}
                <div className="space-y-3">
                  <div className="flex items-center gap-3">
                    <button
                      type="button"
                      onClick={() => setAviationConnection(!aviationConnection)}
                      className={`w-6 h-6 border-2 flex items-center justify-center transition-all shrink-0 ${
                        aviationConnection
                          ? 'bg-[#dc2626] border-[#dc2626] text-white'
                          : 'border-white/20 bg-transparent text-transparent hover:border-white/40'
                      }`}
                    >
                      {aviationConnection && <CheckCircle2 className="h-4 w-4" />}
                    </button>
                    <Label className="text-base font-semibold text-white/70 cursor-pointer" onClick={() => setAviationConnection(!aviationConnection)} style={{ fontFamily: 'Inter, sans-serif', textTransform: 'none', letterSpacing: 'normal' }}>
                      <PlaneTakeoff className="h-4 w-4 text-white/30 inline mr-2" />
                      I have a connection to aviation
                    </Label>
                  </div>
                  {aviationConnection && (
                    <Input
                      value={aviationDescription}
                      onChange={e => setAviationDescription(e.target.value)}
                      placeholder="Tell us about your aviation connection..."
                      className="h-12 text-base bg-white/[0.03] border-white/[0.08] text-white placeholder:text-white/20 focus:border-[#dc2626]/50 focus:ring-[#dc2626]/20"
                    />
                  )}
                </div>

                <div className="flex gap-3 pt-2">
                  <Button
                    className="flex-1 h-12 text-lg font-black uppercase tracking-wider btn-neon"
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
                    className="h-12 text-base border-white/[0.08] text-white/40 hover:bg-white/[0.03] hover:text-white"
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

      {/* Backup Artist Waitlist Section */}
      <section className="max-w-5xl mx-auto px-4 py-8">
        <div className="glass-card p-8 relative overflow-hidden">
          <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-[#ffcc00] via-[#dc2626] to-[#ffcc00]" />
          <div className="flex flex-col sm:flex-row items-center gap-6">
            <div className="w-16 h-16 bg-[#ffcc00]/10 text-[#ffcc00] flex items-center justify-center border border-[#ffcc00]/25 shrink-0">
              <Users className="h-8 w-8" />
            </div>
            <div className="text-center sm:text-left space-y-2 flex-1">
              <h3 className="text-xl sm:text-2xl font-bold text-white">
                {allSquaresTaken ? 'All Squares Claimed!' : 'Join the Backup Artist List'}
              </h3>
              <p className="text-base text-white/50 leading-relaxed" style={{ fontFamily: 'Inter, sans-serif', textTransform: 'none', letterSpacing: 'normal' }}>
                {allSquaresTaken
                  ? 'All 234 squares have been claimed, but you can still be part of this project! Join our backup artist list and you\'ll be contacted if a square becomes available. The first 16 backup artists are priority.'
                  : 'Want to help us reach 250 artists for Reno\'s 250th? Even if you don\'t claim a square now, join the backup list to be ready if one opens up. Priority goes to the first 16 signups!'}
              </p>
              {(backupCount || 0) > 0 && (
                <p className="text-sm text-[#ffcc00]/70" style={{ fontFamily: 'Inter, sans-serif', textTransform: 'none', letterSpacing: 'normal' }}>
                  {backupCount} backup artist{backupCount === 1 ? '' : 's'} already on the list
                  {(backupCount || 0) < 16 && ` — ${16 - (backupCount || 0)} priority spots remaining`}
                </p>
              )}
            </div>
            <button
              onClick={() => { setShowBackupForm(true); setTimeout(() => formRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' }), 100); }}
              className="inline-flex items-center gap-2 px-6 py-3 bg-[#ffcc00]/10 hover:bg-[#ffcc00]/20 border border-[#ffcc00]/30 text-[#ffcc00] font-bold text-base uppercase tracking-wider transition-all shrink-0"
            >
              Join Backup List <ArrowRight className="h-4 w-4" />
            </button>
          </div>
        </div>
      </section>

      {/* Backup Registration Form */}
      {showBackupForm && (
        <section className="max-w-5xl mx-auto px-4 pb-8">
          <div ref={formRef} className="flex justify-center">
            <Card className="max-w-md w-full shadow-2xl overflow-hidden bg-[#0a0a0a] border border-[#ffcc00]/15">
              <div className="bg-black p-6 flex items-center justify-between border-b border-[#ffcc00]/15">
                <div>
                  <CardTitle className="text-white text-xl">Join Backup Artist List</CardTitle>
                  <p className="text-white/30 text-sm mt-1" style={{ fontFamily: 'Inter, sans-serif', textTransform: 'none', letterSpacing: 'normal' }}>
                    You'll be #{(backupCount || 0) + 1} on the list
                    {(backupCount || 0) + 1 <= 16 ? ' (Priority!)' : ''}
                  </p>
                </div>
                <button
                  onClick={() => setShowBackupForm(false)}
                  className="text-white/20 hover:text-white transition-colors"
                >
                  <X className="h-6 w-6" />
                </button>
              </div>
              <CardContent className="p-6 space-y-5">
                {/* Required fields */}
                <div className="space-y-2">
                  <Label htmlFor="backup-name" className="text-base font-semibold flex items-center gap-2 text-white/70" style={{ fontFamily: 'Inter, sans-serif', textTransform: 'none', letterSpacing: 'normal' }}>
                    <User className="h-4 w-4 text-white/30" /> Name <span className="text-[#dc2626]">*</span>
                  </Label>
                  <Input
                    id="backup-name"
                    value={name}
                    onChange={e => setName(e.target.value)}
                    placeholder="Your full name"
                    className="h-12 text-base bg-white/[0.03] border-white/[0.08] text-white placeholder:text-white/20 focus:border-[#ffcc00]/50 focus:ring-[#ffcc00]/20"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="backup-email" className="text-base font-semibold flex items-center gap-2 text-white/70" style={{ fontFamily: 'Inter, sans-serif', textTransform: 'none', letterSpacing: 'normal' }}>
                    <Mail className="h-4 w-4 text-white/30" /> Email
                    <span className="text-sm font-normal text-white/30">(so we can reach you)</span>
                  </Label>
                  <Input
                    id="backup-email"
                    type="email"
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    placeholder="your@email.com"
                    className="h-12 text-base bg-white/[0.03] border-white/[0.08] text-white placeholder:text-white/20 focus:border-[#ffcc00]/50 focus:ring-[#ffcc00]/20"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="backup-phone" className="text-base font-semibold flex items-center gap-2 text-white/70" style={{ fontFamily: 'Inter, sans-serif', textTransform: 'none', letterSpacing: 'normal' }}>
                    <Phone className="h-4 w-4 text-white/30" /> Phone
                  </Label>
                  <Input
                    id="backup-phone"
                    type="tel"
                    value={phone}
                    onChange={e => setPhone(e.target.value)}
                    placeholder="(555) 123-4567"
                    className="h-12 text-base bg-white/[0.03] border-white/[0.08] text-white placeholder:text-white/20 focus:border-[#ffcc00]/50 focus:ring-[#ffcc00]/20"
                  />
                </div>

                {/* Divider */}
                <div className="border-t border-white/[0.06] pt-4">
                  <p className="text-xs uppercase tracking-[0.2em] text-[#ffcc00]/70 font-bold mb-4">Artist Profile (Optional)</p>
                </div>

                {/* Bio */}
                <div className="space-y-2">
                  <Label htmlFor="backup-bio" className="text-base font-semibold flex items-center gap-2 text-white/70" style={{ fontFamily: 'Inter, sans-serif', textTransform: 'none', letterSpacing: 'normal' }}>
                    <Palette className="h-4 w-4 text-white/30" /> Short Bio
                  </Label>
                  <Textarea
                    id="backup-bio"
                    value={bio}
                    onChange={e => setBio(e.target.value)}
                    placeholder="Tell us a little about yourself as an artist..."
                    maxLength={300}
                    rows={3}
                    className="text-base bg-white/[0.03] border-white/[0.08] text-white placeholder:text-white/20 focus:border-[#ffcc00]/50 focus:ring-[#ffcc00]/20 resize-none"
                  />
                  <p className="text-xs text-white/20 text-right">{bio.length}/300</p>
                </div>

                {/* Website / Social */}
                <div className="space-y-2">
                  <Label htmlFor="backup-website" className="text-base font-semibold flex items-center gap-2 text-white/70" style={{ fontFamily: 'Inter, sans-serif', textTransform: 'none', letterSpacing: 'normal' }}>
                    <Globe className="h-4 w-4 text-white/30" /> Website or Social Media
                  </Label>
                  <Input
                    id="backup-website"
                    value={website}
                    onChange={e => setWebsite(e.target.value)}
                    placeholder="https://yoursite.com or @handle"
                    className="h-12 text-base bg-white/[0.03] border-white/[0.08] text-white placeholder:text-white/20 focus:border-[#ffcc00]/50 focus:ring-[#ffcc00]/20"
                  />
                </div>

                {/* Aviation Connection */}
                <div className="space-y-3">
                  <div className="flex items-center gap-3">
                    <button
                      type="button"
                      onClick={() => setAviationConnection(!aviationConnection)}
                      className={`w-6 h-6 border-2 flex items-center justify-center transition-all shrink-0 ${
                        aviationConnection
                          ? 'bg-[#ffcc00] border-[#ffcc00] text-black'
                          : 'border-white/20 bg-transparent text-transparent hover:border-white/40'
                      }`}
                    >
                      {aviationConnection && <CheckCircle2 className="h-4 w-4" />}
                    </button>
                    <Label className="text-base font-semibold text-white/70 cursor-pointer" onClick={() => setAviationConnection(!aviationConnection)} style={{ fontFamily: 'Inter, sans-serif', textTransform: 'none', letterSpacing: 'normal' }}>
                      <PlaneTakeoff className="h-4 w-4 text-white/30 inline mr-2" />
                      I have a connection to aviation
                    </Label>
                  </div>
                  {aviationConnection && (
                    <Input
                      value={aviationDescription}
                      onChange={e => setAviationDescription(e.target.value)}
                      placeholder="Tell us about your aviation connection..."
                      className="h-12 text-base bg-white/[0.03] border-white/[0.08] text-white placeholder:text-white/20 focus:border-[#ffcc00]/50 focus:ring-[#ffcc00]/20"
                    />
                  )}
                </div>

                <div className="flex gap-3 pt-2">
                  <Button
                    className="flex-1 h-12 text-lg font-black uppercase tracking-wider bg-[#ffcc00] hover:bg-[#ffd633] text-black"
                    disabled={!name.trim() || backupRegisterMutation.isPending}
                    onClick={() => backupRegisterMutation.mutate()}
                  >
                    {backupRegisterMutation.isPending ? (
                      <span className="flex items-center gap-2">
                        <span className="h-4 w-4 border-2 border-black/30 border-t-black rounded-full animate-spin" />
                        Joining...
                      </span>
                    ) : (
                      'Join Backup List'
                    )}
                  </Button>
                  <Button
                    variant="outline"
                    className="h-12 text-base border-white/[0.08] text-white/40 hover:bg-white/[0.03] hover:text-white"
                    onClick={() => setShowBackupForm(false)}
                  >
                    Cancel
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </section>
      )}

      {/* Pathways to Aviation */}
      <section className="border-t border-white/[0.05] bg-black">
        <div className="max-w-5xl mx-auto px-4 py-10">
          <div className="glass-card p-8 relative overflow-hidden">
            <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-[#00ccff] via-[#dc2626] to-[#ffcc00]" />
            <div className="flex flex-col sm:flex-row items-center gap-6">
              <div className="w-16 h-16 bg-[#00ccff]/10 text-[#00ccff] flex items-center justify-center border border-[#00ccff]/25 shrink-0">
                <Compass className="h-8 w-8" />
              </div>
              <div className="text-center sm:text-left space-y-2 flex-1">
                <h3 className="text-xl sm:text-2xl font-bold text-white">Pathways to Aviation</h3>
                <p className="text-base text-white/50 leading-relaxed" style={{ fontFamily: 'Inter, sans-serif', textTransform: 'none', letterSpacing: 'normal' }}>
                  Inspired by the spirit of flight? Discover your next path in the world of aerospace — from pilot training 
                  to engineering, drone technology to air traffic control.
                </p>
              </div>
              <a
                href="https://pathwaystoaviation.org/"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-6 py-3 bg-[#00ccff]/10 hover:bg-[#00ccff]/20 border border-[#00ccff]/30 text-[#00ccff] font-bold text-base uppercase tracking-wider transition-all shrink-0"
              >
                Find Your Path <ExternalLink className="h-4 w-4" />
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* Red, White & Flight CTA Banner — moved to bottom */}
      <section className="cta-banner">
        <div className="max-w-5xl mx-auto px-4 py-7 flex flex-col sm:flex-row items-center justify-between gap-5">
          <div className="flex items-center gap-5">
            <div className="bg-white rounded-lg p-2 shrink-0 shadow-lg">
              <img src={rwfLogo} alt="Red, White and Flight" className="h-16 w-auto" />
            </div>
            <div>
              <h3 className="text-white font-bold text-lg sm:text-xl" style={{ fontFamily: 'Oswald, sans-serif', textTransform: 'uppercase' }}>
                July 4th Drone Show & Concert
              </h3>
              <p className="text-white/50 text-base mt-1" style={{ fontFamily: 'Inter, sans-serif', textTransform: 'none', letterSpacing: 'normal' }}>
                Free event at Mackay Stadium — drone show, Reno Phil concert & interactive expo
              </p>
            </div>
          </div>
          <a
            href="https://redwhiteandflight.org/"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 px-6 py-3 bg-[#dc2626] hover:bg-[#ef4444] text-white font-bold text-base uppercase tracking-wider transition-all shrink-0 shadow-lg shadow-red-600/20"
          >
            Secure Your Free Spot <ExternalLink className="h-4 w-4" />
          </a>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-white/[0.05] bg-black">
        <div className="artown-dash w-full" />
        <div className="max-w-5xl mx-auto px-4 py-10">
          <div className="flex flex-wrap justify-center gap-8 sm:gap-12 items-center mb-6">
            <img src={gillemotLogo} alt="The George W. Gillemot Foundation" className="h-10 w-auto opacity-70" />
            <img src={artownLogo} alt="Artown" className="h-10 w-auto opacity-70" />
            <img src={discoveryLogo} alt="The Discovery Museum" className="h-9 w-auto opacity-70" />
            <img src={socLogo} alt="Strengthen our Community" className="h-9 w-auto opacity-70 bg-white/80 px-2 py-0.5" />
          </div>
          <div className="text-center space-y-2">
            <p className="text-base text-white/40" style={{ fontFamily: 'Inter, sans-serif', textTransform: 'none', letterSpacing: 'normal' }}>
              Art of Aviation Community Mural — A Reno 250 Celebration
            </p>
            <p className="text-sm text-white/20" style={{ fontFamily: 'Inter, sans-serif', textTransform: 'none', letterSpacing: 'normal' }}>
              Presented by The George W. Gillemot Foundation, Artown, The Discovery Museum & Strengthen our Community
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
