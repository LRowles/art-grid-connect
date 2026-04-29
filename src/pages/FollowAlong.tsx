import { useState, useMemo } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { PublicNav } from '@/components/PublicNav';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { toast } from '@/hooks/use-toast';
import {
  Camera, Video, Upload, Plane, ArrowRight, ExternalLink, Globe, Instagram,
  PlaneTakeoff, Calendar, Image, Film, User, Search, X, Share2, Twitter, Facebook
} from 'lucide-react';
import { Link } from 'react-router-dom';
import artownLogo from '@/assets/artown-logo.jpg';
import socLogo from '@/assets/soc-logo.png';
import discoveryLogo from '@/assets/discovery-logo.jpg';
import gillemotLogo from '@/assets/gillemot-logo-white.png';

type ArtistPost = {
  id: string;
  artist_id: string;
  grid_cell: string;
  caption: string | null;
  media_url: string;
  media_type: string;
  created_at: string;
  approved: boolean;
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

function useArtistPosts() {
  return useQuery({
    queryKey: ['artist_posts'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('artist_posts')
        .select('*')
        .eq('approved', true)
        .order('created_at', { ascending: false });
      if (error) throw error;
      return data as ArtistPost[];
    },
  });
}

function useArtistProfiles() {
  return useQuery({
    queryKey: ['all_artist_profiles'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('artists')
        .select('id, name, bio, website, social_handle, aviation_connection, aviation_description')
        .order('name');
      if (error) throw error;
      return data as ArtistProfile[];
    },
  });
}

function useRegisteredArtists() {
  return useQuery({
    queryKey: ['registered_artists_with_cells'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('grid_assignments')
        .select('grid_cell, artist_id')
        .not('artist_id', 'is', null);
      if (error) throw error;
      return data as { grid_cell: string; artist_id: string }[];
    },
  });
}

function getShareUrl() {
  return 'https://artowncommunitymural.com/follow-along';
}

function sharePostOnTwitter(artistName: string, cell: string) {
  const text = `Check out the progress on Square ${cell} in the Art of Aviation Community Mural! 🎨✈️ Follow along with all the artists: #ArtOfAviation #Reno250`;
  window.open(`https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(getShareUrl())}`, '_blank');
}

function sharePostOnFacebook() {
  window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(getShareUrl())}`, '_blank');
}

function formatDate(dateStr: string) {
  const d = new Date(dateStr);
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

export default function FollowAlong() {
  const queryClient = useQueryClient();
  const { data: posts, isLoading: postsLoading } = useArtistPosts();
  const { data: profiles } = useArtistProfiles();
  const { data: registrations } = useRegisteredArtists();
  const [showUploadForm, setShowUploadForm] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterCell, setFilterCell] = useState('');

  // Upload form state
  const [uploadEmail, setUploadEmail] = useState('');
  const [uploadCaption, setUploadCaption] = useState('');
  const [uploadFile, setUploadFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);

  const profileMap = useMemo(() => {
    const map = new Map<string, ArtistProfile>();
    profiles?.forEach(p => map.set(p.id, p));
    return map;
  }, [profiles]);

  const cellToArtistMap = useMemo(() => {
    const map = new Map<string, string>();
    registrations?.forEach(r => map.set(r.artist_id, r.grid_cell));
    return map;
  }, [registrations]);

  // Filter posts
  const filteredPosts = useMemo(() => {
    if (!posts) return [];
    return posts.filter(post => {
      const artist = profileMap.get(post.artist_id);
      const matchesSearch = !searchQuery || 
        artist?.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        post.grid_cell.toLowerCase().includes(searchQuery.toLowerCase()) ||
        post.caption?.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesCell = !filterCell || post.grid_cell === filterCell.toUpperCase();
      return matchesSearch && matchesCell;
    });
  }, [posts, profileMap, searchQuery, filterCell]);

  // Registered artists with profiles for the directory
  const artistDirectory = useMemo(() => {
    if (!profiles || !registrations) return [];
    const registeredIds = new Set(registrations.map(r => r.artist_id));
    return profiles.filter(p => registeredIds.has(p.id));
  }, [profiles, registrations]);

  const handleUpload = async () => {
    if (!uploadEmail.trim() || !uploadFile) {
      toast({ title: 'Missing information', description: 'Please provide your email and select a file.', variant: 'destructive' });
      return;
    }

    setUploading(true);
    try {
      // Look up artist by email
      const { data: artist, error: artistErr } = await supabase
        .from('artists')
        .select('id, name')
        .eq('email', uploadEmail.trim())
        .single();

      if (artistErr || !artist) {
        toast({ title: 'Artist not found', description: 'No registered artist found with that email. Please use the email you registered with.', variant: 'destructive' });
        setUploading(false);
        return;
      }

      // Find their grid cell
      const { data: assignment } = await supabase
        .from('grid_assignments')
        .select('grid_cell')
        .eq('artist_id', artist.id)
        .single();

      if (!assignment) {
        toast({ title: 'No square assigned', description: 'Could not find a grid square assigned to your account.', variant: 'destructive' });
        setUploading(false);
        return;
      }

      // Upload file to Supabase Storage
      const fileExt = uploadFile.name.split('.').pop();
      const fileName = `${artist.id}/${Date.now()}.${fileExt}`;
      const mediaType = uploadFile.type.startsWith('video/') ? 'video' : 'image';

      const { data: uploadData, error: uploadErr } = await supabase.storage
        .from('artist-uploads')
        .upload(fileName, uploadFile, { cacheControl: '3600', upsert: false });

      if (uploadErr) {
        // If storage bucket doesn't exist yet, show helpful message
        toast({ 
          title: 'Upload failed', 
          description: 'The upload storage is not yet configured. Please contact the site administrator to set up the artist-uploads storage bucket in Supabase.',
          variant: 'destructive' 
        });
        setUploading(false);
        return;
      }

      // Get public URL
      const { data: urlData } = supabase.storage
        .from('artist-uploads')
        .getPublicUrl(fileName);

      // Create post record
      const { error: postErr } = await supabase
        .from('artist_posts')
        .insert({
          artist_id: artist.id,
          grid_cell: assignment.grid_cell,
          caption: uploadCaption.trim() || null,
          media_url: urlData.publicUrl,
          media_type: mediaType,
        });

      if (postErr) throw postErr;

      toast({ title: 'Shared successfully!', description: 'Your progress has been shared with the community.' });
      setShowUploadForm(false);
      setUploadEmail('');
      setUploadCaption('');
      setUploadFile(null);
      queryClient.invalidateQueries({ queryKey: ['artist_posts'] });
    } catch (err) {
      toast({ title: 'Error', description: err instanceof Error ? err.message : 'Something went wrong', variant: 'destructive' });
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="min-h-screen bg-black">
      <PublicNav />

      {/* Hero */}
      <section className="hero-gradient hero-glow text-white relative overflow-hidden">
        <div className="max-w-4xl mx-auto px-4 py-16 sm:py-24 text-center space-y-6 relative z-10">
          <div className="inline-flex items-center gap-2 px-5 py-2 bg-white/[0.05] text-base font-bold uppercase tracking-widest border border-white/[0.08] text-[#dc2626]">
            <Camera className="h-5 w-5" />
            <span>Artist Community</span>
          </div>
          <h1 className="text-5xl sm:text-7xl font-black tracking-tight leading-[1.05]">
            Follow Along<br />
            <span className="text-[#dc2626]">With the Artists</span>
          </h1>
          <p className="text-lg sm:text-xl text-white/50 leading-relaxed max-w-2xl mx-auto" style={{ fontFamily: 'Inter, sans-serif', textTransform: 'none', letterSpacing: 'normal' }}>
            Watch the Art of Aviation Community Mural come to life! Artists share photos and videos 
            of their creative process as they paint their squares.
          </p>
          <Button
            onClick={() => setShowUploadForm(true)}
            className="btn-neon text-lg px-8 py-6"
          >
            <Upload className="h-5 w-5 mr-2" /> Share Your Progress
          </Button>
        </div>
      </section>

      {/* Upload Form Modal */}
      {showUploadForm && (
        <div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4">
          <div className="bg-[#0a0a0a] border border-[#dc2626]/20 max-w-md w-full shadow-2xl">
            <div className="p-6 border-b border-white/[0.08] flex items-center justify-between">
              <h3 className="text-xl font-bold text-white">Share Your Progress</h3>
              <button onClick={() => setShowUploadForm(false)} className="text-white/30 hover:text-white transition-colors">
                <X className="h-5 w-5" />
              </button>
            </div>
            <div className="p-6 space-y-4">
              <div className="space-y-2">
                <Label className="text-base text-white/70" style={{ fontFamily: 'Inter, sans-serif', textTransform: 'none', letterSpacing: 'normal' }}>
                  Your Registration Email <span className="text-[#dc2626]">*</span>
                </Label>
                <Input
                  type="email"
                  value={uploadEmail}
                  onChange={e => setUploadEmail(e.target.value)}
                  placeholder="The email you registered with"
                  className="h-12 text-base bg-white/[0.03] border-white/[0.08] text-white placeholder:text-white/20"
                />
                <p className="text-xs text-white/30" style={{ fontFamily: 'Inter, sans-serif', textTransform: 'none', letterSpacing: 'normal' }}>
                  We use this to verify you're a registered artist
                </p>
              </div>
              <div className="space-y-2">
                <Label className="text-base text-white/70" style={{ fontFamily: 'Inter, sans-serif', textTransform: 'none', letterSpacing: 'normal' }}>
                  Photo or Video <span className="text-[#dc2626]">*</span>
                </Label>
                <div className="border-2 border-dashed border-white/[0.1] p-6 text-center hover:border-[#dc2626]/30 transition-colors">
                  <input
                    type="file"
                    accept="image/*,video/mp4,video/webm"
                    onChange={e => setUploadFile(e.target.files?.[0] || null)}
                    className="hidden"
                    id="file-upload"
                  />
                  <label htmlFor="file-upload" className="cursor-pointer space-y-2 block">
                    {uploadFile ? (
                      <div className="space-y-1">
                        <p className="text-white font-medium text-sm">{uploadFile.name}</p>
                        <p className="text-white/30 text-xs">{(uploadFile.size / 1024 / 1024).toFixed(1)} MB</p>
                      </div>
                    ) : (
                      <>
                        <div className="flex justify-center gap-3">
                          <Image className="h-8 w-8 text-white/20" />
                          <Film className="h-8 w-8 text-white/20" />
                        </div>
                        <p className="text-white/40 text-sm" style={{ fontFamily: 'Inter, sans-serif', textTransform: 'none', letterSpacing: 'normal' }}>
                          Click to upload a photo or short video
                        </p>
                        <p className="text-white/20 text-xs">JPG, PNG, WebP, MP4, WebM</p>
                      </>
                    )}
                  </label>
                </div>
              </div>
              <div className="space-y-2">
                <Label className="text-base text-white/70" style={{ fontFamily: 'Inter, sans-serif', textTransform: 'none', letterSpacing: 'normal' }}>
                  Caption
                </Label>
                <Textarea
                  value={uploadCaption}
                  onChange={e => setUploadCaption(e.target.value)}
                  placeholder="Tell us about your progress, inspiration, or technique..."
                  maxLength={500}
                  rows={3}
                  className="text-base bg-white/[0.03] border-white/[0.08] text-white placeholder:text-white/20 resize-none"
                />
              </div>
              <Button
                onClick={handleUpload}
                disabled={uploading || !uploadEmail.trim() || !uploadFile}
                className="w-full h-12 btn-neon text-base"
              >
                {uploading ? (
                  <span className="flex items-center gap-2">
                    <span className="h-4 w-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    Uploading...
                  </span>
                ) : (
                  <>
                    <Upload className="h-4 w-4 mr-2" /> Share with Community
                  </>
                )}
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Content */}
      <section className="max-w-6xl mx-auto px-4 py-12">
        
        {/* Search and filter */}
        <div className="flex flex-col sm:flex-row gap-4 mb-8">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-white/30" />
            <Input
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              placeholder="Search by artist name or caption..."
              className="pl-10 h-12 text-base bg-white/[0.03] border-white/[0.08] text-white placeholder:text-white/20"
            />
          </div>
          <Input
            value={filterCell}
            onChange={e => setFilterCell(e.target.value)}
            placeholder="Filter by square (e.g. A1)"
            className="w-full sm:w-40 h-12 text-base bg-white/[0.03] border-white/[0.08] text-white placeholder:text-white/20"
          />
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Main feed */}
          <div className="lg:col-span-2 space-y-6">
            <h2 className="text-2xl font-bold text-white">Artist Updates</h2>
            
            {postsLoading ? (
              <div className="text-center py-16">
                <Plane className="h-12 w-12 text-[#dc2626] animate-pulse mx-auto" />
                <p className="text-white/50 text-lg mt-4">Loading updates...</p>
              </div>
            ) : filteredPosts && filteredPosts.length > 0 ? (
              filteredPosts.map(post => {
                const artist = profileMap.get(post.artist_id);
                return (
                  <div key={post.id} className="glass-card overflow-hidden">
                    {/* Post header */}
                    <div className="p-5 flex items-center gap-3 border-b border-white/[0.05]">
                      <div className="w-10 h-10 bg-[#dc2626]/15 text-[#dc2626] flex items-center justify-center border border-[#dc2626]/25 shrink-0">
                        <User className="h-5 w-5" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-white font-bold text-base truncate">{artist?.name || 'Artist'}</p>
                        <div className="flex items-center gap-3 text-xs text-white/30" style={{ fontFamily: 'Inter, sans-serif', textTransform: 'none', letterSpacing: 'normal' }}>
                          <span>Square {post.grid_cell}</span>
                          <span>{formatDate(post.created_at)}</span>
                          {artist?.aviation_connection && (
                            <span className="flex items-center gap-1 text-[#00ccff]">
                              <PlaneTakeoff className="h-3 w-3" /> Aviation
                            </span>
                          )}
                        </div>
                      </div>
                      <div className="flex gap-1">
                        <button
                          onClick={() => sharePostOnTwitter(artist?.name || 'Artist', post.grid_cell)}
                          className="p-2 text-white/20 hover:text-[#1DA1F2] transition-colors"
                          title="Share on Twitter"
                        >
                          <Twitter className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => sharePostOnFacebook()}
                          className="p-2 text-white/20 hover:text-[#1877F2] transition-colors"
                          title="Share on Facebook"
                        >
                          <Facebook className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                    {/* Media */}
                    <div className="bg-black">
                      {post.media_type === 'video' ? (
                        <video
                          src={post.media_url}
                          controls
                          className="w-full max-h-[500px] object-contain"
                        />
                      ) : (
                        <img
                          src={post.media_url}
                          alt={`Progress on Square ${post.grid_cell}`}
                          className="w-full max-h-[500px] object-contain"
                        />
                      )}
                    </div>
                    {/* Caption */}
                    {post.caption && (
                      <div className="p-5">
                        <p className="text-base text-white/60 leading-relaxed" style={{ fontFamily: 'Inter, sans-serif', textTransform: 'none', letterSpacing: 'normal' }}>
                          {post.caption}
                        </p>
                      </div>
                    )}
                  </div>
                );
              })
            ) : (
              <div className="glass-card p-12 text-center space-y-4">
                <Camera className="h-16 w-16 text-white/10 mx-auto" />
                <h3 className="text-xl font-bold text-white/40">No Updates Yet</h3>
                <p className="text-white/30 text-base max-w-md mx-auto" style={{ fontFamily: 'Inter, sans-serif', textTransform: 'none', letterSpacing: 'normal' }}>
                  Artists are hard at work on their squares! Check back soon to see photos and videos 
                  of the creative process, or be the first to share your progress.
                </p>
                <Button onClick={() => setShowUploadForm(true)} className="btn-neon">
                  <Upload className="h-4 w-4 mr-2" /> Be the First to Share
                </Button>
              </div>
            )}
          </div>

          {/* Artist Directory Sidebar */}
          <div className="space-y-6">
            <h2 className="text-2xl font-bold text-white">Artist Directory</h2>
            
            {artistDirectory.length > 0 ? (
              <div className="space-y-3">
                {artistDirectory.map(artist => {
                  const cell = registrations?.find(r => r.artist_id === artist.id)?.grid_cell;
                  return (
                    <div key={artist.id} className="glass-card p-4 space-y-2">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-[#dc2626]/10 text-[#dc2626] flex items-center justify-center border border-[#dc2626]/20 shrink-0 text-xs font-bold">
                          {cell || '?'}
                        </div>
                        <div className="min-w-0">
                          <p className="text-white font-bold text-sm truncate">{artist.name}</p>
                          {artist.social_handle && (
                            <p className="text-white/30 text-xs truncate">{artist.social_handle}</p>
                          )}
                        </div>
                      </div>
                      {artist.bio && (
                        <p className="text-white/40 text-xs leading-relaxed line-clamp-2" style={{ fontFamily: 'Inter, sans-serif', textTransform: 'none', letterSpacing: 'normal' }}>
                          {artist.bio}
                        </p>
                      )}
                      {artist.aviation_connection && (
                        <span className="inline-flex items-center gap-1 text-[#00ccff] text-xs">
                          <PlaneTakeoff className="h-3 w-3" /> Aviation Connected
                        </span>
                      )}
                      <div className="flex gap-2">
                        {artist.website && (
                          <a href={artist.website.startsWith('http') ? artist.website : `https://${artist.website}`} target="_blank" rel="noopener noreferrer"
                            className="text-white/30 hover:text-white transition-colors">
                            <Globe className="h-3.5 w-3.5" />
                          </a>
                        )}
                        {artist.social_handle && (
                          <a href={`https://instagram.com/${artist.social_handle.replace('@', '')}`} target="_blank" rel="noopener noreferrer"
                            className="text-white/30 hover:text-white transition-colors">
                            <Instagram className="h-3.5 w-3.5" />
                          </a>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="glass-card p-6 text-center">
                <User className="h-10 w-10 text-white/10 mx-auto mb-3" />
                <p className="text-white/30 text-sm" style={{ fontFamily: 'Inter, sans-serif', textTransform: 'none', letterSpacing: 'normal' }}>
                  Artist profiles will appear here as artists register and fill in their details.
                </p>
              </div>
            )}

            {/* CTA to register */}
            <div className="glass-card p-6 text-center space-y-3">
              <Plane className="h-8 w-8 text-[#dc2626] mx-auto" />
              <h3 className="text-lg font-bold text-white">Want to Participate?</h3>
              <p className="text-white/40 text-sm" style={{ fontFamily: 'Inter, sans-serif', textTransform: 'none', letterSpacing: 'normal' }}>
                Squares are still available! Register now and become part of this collaborative masterpiece.
              </p>
              <Link to="/" className="inline-flex items-center gap-2 px-5 py-2.5 btn-neon text-sm">
                Register for a Square <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          </div>
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
