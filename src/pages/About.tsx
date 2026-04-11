import { PublicNav } from '@/components/PublicNav';
import { Plane, Heart, MapPin, Calendar, Palette, Star, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import artownLogo from '@/assets/artown-logo.jpg';
import socLogo from '@/assets/soc-logo.png';

export default function About() {
  return (
    <div className="min-h-screen bg-background">
      <PublicNav />

      {/* Hero */}
      <section className="hero-gradient hero-glow text-white relative overflow-hidden">
        <div className="max-w-4xl mx-auto px-4 py-16 sm:py-24 text-center space-y-6 relative z-10">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/5 backdrop-blur-sm text-sm font-medium border border-white/10 text-amber-400/90">
            <Plane className="h-4 w-4" />
            <span>About the Project</span>
          </div>
          <h1 className="text-4xl sm:text-5xl font-black tracking-tight leading-[1.1]">
            Art of Aviation<br />
            <span className="text-amber-400">Community Mural</span>
          </h1>
          <p className="text-lg text-white/60 leading-relaxed max-w-2xl mx-auto">
            A collaborative art project celebrating Northern Nevada's rich aviation heritage
            as part of the Reno 250 celebration.
          </p>
        </div>
      </section>

      {/* Content */}
      <section className="max-w-4xl mx-auto px-4 py-12 space-y-12">

        {/* The Vision */}
        <div className="glass-card rounded-2xl p-8 space-y-4">
          <div className="flex items-center gap-3 mb-2">
            <span className="w-10 h-10 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center border border-amber-500/30">
              <Palette className="h-5 w-5" />
            </span>
            <h2 className="text-2xl font-bold text-white">The Vision</h2>
          </div>
          <p className="text-white/60 leading-relaxed">
            This collaborative project brings together the community in celebration of art, innovation,
            and our shared skies. Local artists are invited to claim a square of the mural grid, recreate
            their assigned section, and contribute to a large-scale mosaic-style mural. Each square becomes
            a piece of a stunning whole — a testament to what a community can create together.
          </p>
          <p className="text-white/60 leading-relaxed">
            The completed mural will be installed and on display at{' '}
            <strong className="text-white">The Discovery Museum</strong>, serving as the entrance
            centerpiece to a new aviation-themed exhibition and helping build excitement for the inaugural{' '}
            <strong className="text-white">Red, White, and Flight Drone Show</strong>.
          </p>
        </div>

        {/* How to Participate */}
        <div className="glass-card rounded-2xl p-8 space-y-6">
          <div className="flex items-center gap-3 mb-2">
            <span className="w-10 h-10 rounded-xl bg-blue-500/20 text-blue-400 flex items-center justify-center border border-blue-500/30">
              <Heart className="h-5 w-5" />
            </span>
            <h2 className="text-2xl font-bold text-white">How to Participate</h2>
          </div>
          <div className="grid sm:grid-cols-2 gap-5">
            {[
              {
                icon: <Palette className="h-5 w-5" />,
                title: 'Register for a Square',
                desc: 'Visit the registration page and select an available square from the mural grid. Fill in your details to claim it.',
              },
              {
                icon: <MapPin className="h-5 w-5" />,
                title: 'Pick Up Your Canvas',
                desc: 'After May 1st, pick up your pre-cut canvas square at The Discovery Museum. Each square comes with a reference image.',
              },
              {
                icon: <Star className="h-5 w-5" />,
                title: 'Paint Your Masterpiece',
                desc: 'Use any painting materials you prefer. Try to match the colors of your reference image as closely as possible.',
              },
              {
                icon: <Calendar className="h-5 w-5" />,
                title: 'Return by June 22',
                desc: 'Drop off your completed square at The Discovery Museum by Monday, June 22nd so it can be assembled into the final mural.',
              },
            ].map((item, i) => (
              <div key={i} className="flex items-start gap-4 p-4 rounded-xl bg-white/3 border border-white/5">
                <span className="w-9 h-9 rounded-lg bg-amber-500/15 text-amber-400 flex items-center justify-center shrink-0 border border-amber-500/20">
                  {item.icon}
                </span>
                <div>
                  <h3 className="font-bold text-white text-sm mb-1">{item.title}</h3>
                  <p className="text-white/50 text-sm leading-relaxed">{item.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Community Reception */}
        <div className="glass-card rounded-2xl p-8 space-y-4 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-amber-500/5 rounded-full blur-3xl" />
          <div className="flex items-center gap-3 mb-2">
            <span className="w-10 h-10 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center border border-amber-500/30">
              <Calendar className="h-5 w-5" />
            </span>
            <h2 className="text-2xl font-bold text-white">Community Reception</h2>
          </div>
          <p className="text-white/60 leading-relaxed">
            Join us for a community reception and Artown Kickoff on the evening of <strong className="text-white">July 2nd</strong> at{' '}
            <strong className="text-white">The Discovery Museum</strong>, where we will unveil the final assembled mural.
            Celebrate with fellow artists and community members as we reveal this collaborative masterpiece!
          </p>
        </div>

        {/* Partners */}
        <div className="space-y-8">
          <h2 className="text-2xl font-bold text-white text-center">Our Partners</h2>
          <div className="grid sm:grid-cols-2 gap-6">
            {/* Artown */}
            <div className="glass-card rounded-2xl p-6 flex flex-col items-center text-center space-y-3">
              <img src={artownLogo} alt="Artown" className="h-14 w-auto rounded-lg" />
              <h3 className="font-bold text-white">Artown</h3>
              <p className="text-white/50 text-sm leading-relaxed">
                Funding the Community Mural Event, Artown expands the celebration by inviting local
                artists of all backgrounds to participate. Artown's mission to strengthen the community
                through the arts shines in every square of this project.
              </p>
            </div>

            {/* The Discovery */}
            <div className="glass-card rounded-2xl p-6 flex flex-col items-center text-center space-y-3">
              <div className="w-14 h-14 rounded-xl bg-blue-500/20 text-blue-400 flex items-center justify-center border border-blue-500/30">
                <MapPin className="h-7 w-7" />
              </div>
              <h3 className="font-bold text-white">The Discovery Museum</h3>
              <p className="text-white/50 text-sm leading-relaxed">
                Hosting the event and showcasing the completed mural, The Discovery creates an
                interactive gateway into an aviation-themed exhibit that celebrates exploration,
                discovery, and innovation.
              </p>
            </div>

            {/* Gillemot Foundation */}
            <div className="glass-card rounded-2xl p-6 flex flex-col items-center text-center space-y-3">
              <div className="w-14 h-14 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center border border-amber-500/30">
                <Plane className="h-7 w-7" />
              </div>
              <h3 className="font-bold text-white">The George W. Gillemot Foundation</h3>
              <p className="text-white/50 text-sm leading-relaxed">
                Funded the original professional mural artwork, supporting aviation education and
                innovation while helping inspire the next generation of aerospace leaders.
              </p>
            </div>

            {/* Strengthen our Community */}
            <div className="glass-card rounded-2xl p-6 flex flex-col items-center text-center space-y-3">
              <img src={socLogo} alt="Strengthen our Community" className="h-12 w-auto rounded-lg bg-white/90 px-3 py-1" />
              <h3 className="font-bold text-white">Strengthen our Community</h3>
              <p className="text-white/50 text-sm leading-relaxed">
                Strengthen our Community (SoC) is a nonprofit committed to developing cooperative,
                caring solutions to regional needs, with a special emphasis on education, families,
                good governance, and environmental sustainability.
              </p>
            </div>
          </div>
        </div>

        {/* CTA */}
        <div className="text-center py-6">
          <Link
            to="/"
            className="inline-flex items-center gap-2 px-8 py-3.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-white font-bold text-lg shadow-lg shadow-amber-500/25 transition-all duration-200"
          >
            Register for a Square <ArrowRight className="h-5 w-5" />
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-white/5 bg-[hsl(222,50%,6%)]">
        <div className="max-w-5xl mx-auto px-4 py-10">
          <div className="flex flex-wrap justify-center gap-6 sm:gap-10 items-center mb-6">
            <img src={artownLogo} alt="Artown" className="h-8 w-auto rounded-md opacity-70" />
            <img src={socLogo} alt="Strengthen our Community" className="h-7 w-auto rounded-md opacity-70 bg-white/80 px-2 py-0.5" />
          </div>
          <div className="text-center space-y-2">
            <p className="text-sm text-white/50">
              Art of Aviation Community Mural — A Reno 250 Celebration
            </p>
            <p className="text-xs text-white/30">
              Presented by Artown, The Discovery Museum, The George W. Gillemot Foundation & Strengthen our Community
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
