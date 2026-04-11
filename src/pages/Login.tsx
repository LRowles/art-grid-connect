import { useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent } from '@/components/ui/card';
import { toast } from 'sonner';
import { Lock, Mail, Plane } from 'lucide-react';
import { Link } from 'react-router-dom';

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
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <div className="w-full max-w-sm space-y-6">
        {/* Logo area */}
        <div className="text-center space-y-3">
          <div className="w-14 h-14 rounded-2xl bg-amber-500/20 text-amber-400 flex items-center justify-center mx-auto border border-amber-500/30">
            <Plane className="h-7 w-7" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-white">Mural Grid Tracker</h1>
            <p className="text-xs text-white/40 mt-0.5">Admin Dashboard</p>
          </div>
        </div>

        <Card className="shadow-2xl border-0 overflow-hidden bg-[hsl(222,40%,12%)] border border-white/10">
          <div className="hero-gradient p-6 text-center text-white">
            <h2 className="text-lg font-bold">Sign In</h2>
            <p className="text-xs text-white/40 mt-1">Access the admin dashboard</p>
          </div>
          <CardContent className="p-6">
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email" className="text-sm font-semibold flex items-center gap-2 text-white/70">
                  <Mail className="h-3.5 w-3.5 text-white/40" /> Email
                </Label>
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  placeholder="admin@example.com"
                  className="h-11 bg-white/5 border-white/10 text-white placeholder:text-white/30 focus:border-amber-500/50 focus:ring-amber-500/20"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="password" className="text-sm font-semibold flex items-center gap-2 text-white/70">
                  <Lock className="h-3.5 w-3.5 text-white/40" /> Password
                </Label>
                <Input
                  id="password"
                  type="password"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="h-11 bg-white/5 border-white/10 text-white placeholder:text-white/30 focus:border-amber-500/50 focus:ring-amber-500/20"
                  required
                />
              </div>
              <Button
                type="submit"
                className="w-full h-11 text-base font-bold bg-amber-500 hover:bg-amber-600 text-white shadow-lg shadow-amber-500/25"
                disabled={loading}
              >
                {loading ? (
                  <span className="flex items-center gap-2">
                    <span className="h-4 w-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    Signing in...
                  </span>
                ) : (
                  'Sign In'
                )}
              </Button>
            </form>
            <div className="mt-6 text-center">
              <Link to="/" className="text-sm text-white/30 hover:text-amber-400 transition-colors">
                &larr; Back to public site
              </Link>
            </div>
          </CardContent>
        </Card>

        <p className="text-center text-xs text-white/20">
          Art of Aviation Community Mural — Admin Access
        </p>
      </div>
    </div>
  );
}
