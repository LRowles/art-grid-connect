import { Link } from 'react-router-dom';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { PublicNav } from '@/components/PublicNav';
import { Plane, Palette, MapPin, ArrowRight, Heart } from 'lucide-react';
import artownLogo from '@/assets/artown-logo.jpg';

export default function About() {
  return (
    <div className="min-h-screen bg-background">
      <PublicNav />

      {/* Hero */}
      <section className="hero-gradient text-white">
        <div className="max-w-4xl mx-auto px-4 py-14 sm:py-20 text-center space-y-5">
          <img
            src={artownLogo}
            alt="Artown"
            className="h-20 mx-auto rounded-xl shadow-xl border-2 border-white/20"
          />
          <h1 className="text-3xl sm:text-5xl font-black tracking-tight leading-tight">
            Art of Aviation<br />Community Mural
          </h1>
          <p className="text-base sm:text-lg text-white/80 leading-relaxed max-w-2xl mx-auto">
            A collaborative celebration of Northern Nevada's pioneering spirit, the history of flight,
            and the creativity that defines our region.
          </p>
        </div>
      </section>

      <div className="max-w-3xl mx-auto px-4 py-12 space-y-10">
        {/* About the project */}
        <Card className="shadow-lg border-0 overflow-hidden">
          <div className="h-1 bg-gradient-to-r from-primary via-secondary to-accent" />
          <CardContent className="pt-7 pb-7 space-y-4 text-sm sm:text-base leading-relaxed text-muted-foreground">
            <p>
              This collaborative project brings together the community in celebration of art, innovation,
              and our shared skies. Local artists are invited to claim a square of the mural grid, recreate
              their assigned section, and contribute to a large-scale mosaic-style mural. Each square becomes
              a piece of a stunning whole — a testament to what a community can create together.
            </p>
            <p>
              The completed mural will be installed and on display at{' '}
              <strong className="text-foreground">The Discovery Museum</strong>, serving as the entrance
              centerpiece to a new aviation-themed exhibition and helping build excitement for the inaugural{' '}
              <strong className="text-foreground">Red, White, and Flight Drone Show</strong>.
            </p>
          </CardContent>
        </Card>

        {/* Partners */}
        <div className="space-y-6">
          <h2 className="text-2xl sm:text-3xl font-bold text-foreground text-center">Community Partners</h2>

          <div className="grid gap-4">
            {[
              {
                name: 'Artown',
                icon: Palette,
                color: 'border-l-primary',
                iconBg: 'bg-primary/10 text-primary',
                desc: 'Funding the Community Mural Event, Artown expands the celebration by inviting local artists of all backgrounds to participate in the creation of this landmark piece. Artown\'s mission to strengthen the community through the arts shines in every square of this project.',
              },
              {
                name: 'The Discovery Museum',
                icon: MapPin,
                color: 'border-l-secondary',
                iconBg: 'bg-secondary/10 text-secondary',
                desc: 'Hosting the event and showcasing the completed mural, The Discovery creates an interactive gateway into an aviation-themed exhibit that celebrates exploration, discovery, and innovation. The mural will serve as the entrance centerpiece to the new exhibition.',
              },
              {
                name: 'The George W. Gillemot Foundation',
                icon: Heart,
                color: 'border-l-accent',
                iconBg: 'bg-accent/10 text-accent',
                desc: 'Funded the original professional mural artwork, supporting aviation education and innovation while helping inspire the next generation of aerospace leaders. Their generosity made this project possible.',
              },
            ].map(p => (
              <Card key={p.name} className={`border-l-4 ${p.color} shadow-md hover:shadow-lg transition-shadow`}>
                <CardContent className="pt-5 pb-5">
                  <div className="flex items-center gap-3 mb-2">
                    <div className={`w-9 h-9 rounded-lg ${p.iconBg} flex items-center justify-center`}>
                      <p.icon className="h-4 w-4" />
                    </div>
                    <h3 className="font-bold text-foreground text-lg">{p.name}</h3>
                  </div>
                  <p className="text-sm text-muted-foreground leading-relaxed">{p.desc}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* CTA */}
        <div className="text-center pt-4 pb-8">
          <Link to="/">
            <Button size="lg" className="text-lg px-8 py-6 font-bold shadow-xl shadow-primary/25 group">
              <Palette className="h-5 w-5 mr-2" />
              Register Now — Pick Your Square
              <ArrowRight className="h-5 w-5 ml-2 group-hover:translate-x-1 transition-transform" />
            </Button>
          </Link>
        </div>
      </div>

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
