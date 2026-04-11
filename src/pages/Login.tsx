import { useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent } from '@/components/ui/card';
import { toast } from 'sonner';
import { Lock, Mail, Plane } from 'lucide-react';
import { Link } from 'react-router-dom';
import artownLogo from '@/assets/artown-logo.jpg';

export default function Login() {
  const { signIn } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await signIn(email, password);
      toast.success('Signed in successfully');
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : 'Sign in failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-black p-4">
      <div className="w-full max-w-sm space-y-6">
        {/* Logo area */}
        <div className="text-center space-y-3">
          <img src={artownLogo} alt="Artown" className="h-14 w-auto rounded-md mx-auto" />
          <div>
            <h1 className="text-xl font-bold text-white">Mural Grid Tracker</h1>
            <p className="text-xs text-[#7fff00] font-bold uppercase tracking-widest mt-0.5">Admin Dashboard</p>
          </div>
        </div>

        <Card className="shadow-2xl border-0 overflow-hidden bg-[#0a0a0a] border border-white/[0.08]">
          <div className="bg-black p-6 text-center text-white border-b border-white/[0.05]">
            <h2 className="text-lg font-bold">Sign In</h2>
            <p className="text-xs text-white/30 mt-1" style={{ fontFamily: 'Inter, sans-serif', textTransform: 'none', letterSpacing: 'normal' }}>Access the admin dashboard</p>
          </div>
          <CardContent className="p-6">
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email" className="text-sm font-semibold flex items-center gap-2 text-white/60" style={{ fontFamily: 'Inter, sans-serif', textTransform: 'none', letterSpacing: 'normal' }}>
                  <Mail className="h-3.5 w-3.5 text-white/30" /> Email
                </Label>
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  placeholder="admin@example.com"
                  className="h-11 bg-white/[0.03] border-white/[0.08] text-white placeholder:text-white/20 focus:border-[#7fff00]/50 focus:ring-[#7fff00]/20"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="password" className="text-sm font-semibold flex items-center gap-2 text-white/60" style={{ fontFamily: 'Inter, sans-serif', textTransform: 'none', letterSpacing: 'normal' }}>
                  <Lock className="h-3.5 w-3.5 text-white/30" /> Password
                </Label>
                <Input
                  id="password"
                  type="password"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="h-11 bg-white/[0.03] border-white/[0.08] text-white placeholder:text-white/20 focus:border-[#7fff00]/50 focus:ring-[#7fff00]/20"
                  required
                />
              </div>
              <Button
                type="submit"
                className="w-full h-11 text-base font-black uppercase tracking-wider btn-neon rounded mt-2"
                disabled={loading}
              >
                {loading ? (
                  <span className="flex items-center gap-2">
                    <span className="h-4 w-4 border-2 border-black/30 border-t-black rounded-full animate-spin" />
                    Signing in...
                  </span>
                ) : (
                  'Sign In'
                )}
              </Button>
            </form>
            <div className="mt-6 text-center">
              <Link to="/" className="text-sm text-white/30 hover:text-[#7fff00] transition-colors" style={{ fontFamily: 'Inter, sans-serif', textTransform: 'none', letterSpacing: 'normal' }}>
                &larr; Back to public site
              </Link>
            </div>
          </CardContent>
        </Card>

        <p className="text-center text-xs text-white/15" style={{ fontFamily: 'Inter, sans-serif', textTransform: 'none', letterSpacing: 'normal' }}>
          Art of Aviation Community Mural — Admin Access
        </p>
      </div>
    </div>
  );
}
