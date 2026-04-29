import { PublicNav } from '@/components/PublicNav';
import { Calendar, MapPin, Clock, Plane, ArrowRight, ExternalLink, Rocket, Star, Music, Compass } from 'lucide-react';
import { Link } from 'react-router-dom';
import artownLogo from '@/assets/artown-logo.jpg';
import socLogo from '@/assets/soc-logo.png';
import discoveryLogo from '@/assets/discovery-logo.jpg';
import rwfLogo from '@/assets/rwf-logo.png';
import gillemotLogo from '@/assets/gillemot-logo-white.png';

const events = [
  {
    id: 'canvas-pickup',
    date: 'May 1, 2026',
    dateShort: 'MAY 1',
    title: 'Canvas Pickup Begins',
    location: 'The Discovery Museum',
    description: 'Registered artists can begin picking up their pre-cut canvas squares along with a reference image of their assigned section. Each canvas is ready to paint — bring your creativity and any painting materials you prefer.',
    icon: <Star className="h-6 w-6" />,
    color: '#ffcc00',
    ongoing: true,
    ongoingText: 'Ongoing through June',
  },
  {
    id: 'canvas-deadline',
    date: 'June 22, 2026',
    dateShort: 'JUN 22',
    title: 'Canvas Return Deadline',
    location: 'The Discovery Museum',
    description: 'All completed canvas squares must be returned to The Discovery Museum by this date. This gives the team time to assemble all 234 squares into the final collaborative mural before the unveiling.',
    icon: <Calendar className="h-6 w-6" />,
    color: '#dc2626',
    highlight: true,
  },
  {
    id: 'artown-kickoff',
    date: 'July 2, 2026',
    dateShort: 'JUL 2',
    title: 'Community Reception & Artown Kickoff',
    location: 'The Discovery Museum',
    time: 'Evening',
    description: 'Join us for a community reception and the official Artown Kickoff! We will unveil the completed Art of Aviation Community Mural assembled from all 234 artist squares. Celebrate with fellow artists, community members, and partners as we reveal this collaborative masterpiece. The mural will serve as the entrance centerpiece to The Discovery\'s new aviation-themed exhibition.',
    icon: <Music className="h-6 w-6" />,
    color: '#dc2626',
    featured: true,
    links: [
      { text: 'Learn About Artown', url: 'https://artown.org/', external: true },
    ],
  },
  {
    id: 'aviation-exhibit',
    date: 'July 2, 2026 — Ongoing',
    dateShort: 'JUL 2+',
    title: 'Aviation Exhibition at The Discovery',
    location: 'The Discovery Museum',
    description: 'The Discovery Museum opens its new aviation-themed exhibition, with the Art of Aviation Community Mural as the entrance centerpiece. Explore interactive exhibits celebrating the history of flight, Northern Nevada\'s aviation heritage, and the future of aerospace. The exhibition features hands-on activities for all ages, connecting art, science, and the spirit of exploration.',
    icon: <Plane className="h-6 w-6" />,
    color: '#00ccff',
    featured: true,
    links: [
      { text: 'Visit The Discovery', url: 'https://nvdm.org/', external: true },
    ],
  },
  {
    id: 'red-white-flight',
    date: 'July 4, 2026',
    dateShort: 'JUL 4',
    title: 'Red, White & Flight',
    location: 'Mackay Stadium, Reno',
    description: 'Celebrate Independence Day with a spectacular drone show, a Reno Philharmonic concert, and an interactive aerospace expo — all completely free! This inaugural event brings together the spirit of aviation, community celebration, and American innovation. The Art of Aviation Community Mural was created in anticipation of this landmark event.',
    icon: <Rocket className="h-6 w-6" />,
    color: '#dc2626',
    featured: true,
    links: [
      { text: 'Secure Your Free Spot', url: 'https://redwhiteandflight.org/', external: true, primary: true },
    ],
  },
];

export default function Events() {
  return (
    <div className="min-h-screen bg-black">
      <PublicNav />

      {/* Hero */}
      <section className="hero-gradient hero-glow text-white relative overflow-hidden">
        <div className="max-w-4xl mx-auto px-4 py-16 sm:py-24 text-center space-y-6 relative z-10">
          <div className="inline-flex items-center gap-2 px-5 py-2 bg-white/[0.05] text-base font-bold uppercase tracking-widest border border-white/[0.08] text-[#dc2626]">
            <Calendar className="h-5 w-5" />
            <span>Summer 2026</span>
          </div>
          <h1 className="text-5xl sm:text-7xl font-black tracking-tight leading-[1.05]">
            Events &<br />
            <span className="text-[#dc2626]">Celebrations</span>
          </h1>
          <p className="text-lg sm:text-xl text-white/50 leading-relaxed max-w-2xl mx-auto" style={{ fontFamily: 'Inter, sans-serif', textTransform: 'none', letterSpacing: 'normal' }}>
            From canvas pickup to the grand unveiling, from Artown Kickoff to the July 4th drone show — 
            here's everything happening around the Art of Aviation Community Mural.
          </p>
        </div>
      </section>

      {/* Timeline */}
      <section className="max-w-4xl mx-auto px-4 py-12 space-y-8">
        
        {/* Events list */}
        {events.map((event, index) => (
          <div key={event.id} className={`glass-card overflow-hidden relative ${event.featured ? 'border-l-4' : ''}`} style={event.featured ? { borderLeftColor: event.color } : {}}>
            {event.highlight && (
              <div className="absolute top-0 left-0 right-0 h-1" style={{ background: event.color }} />
            )}
            <div className="p-8">
              <div className="flex flex-col sm:flex-row gap-6">
                {/* Date badge */}
                <div className="shrink-0 text-center sm:text-left">
                  <div className="inline-flex flex-col items-center px-4 py-3 border border-white/[0.08] bg-white/[0.02]">
                    <span className="text-2xl font-black" style={{ color: event.color }}>{event.dateShort.split(' ')[0]}</span>
                    <span className="text-3xl font-black text-white leading-none">{event.dateShort.split(' ')[1]}</span>
                  </div>
                </div>

                {/* Content */}
                <div className="flex-1 space-y-3">
                  <div className="flex items-start gap-3">
                    <span className="w-10 h-10 flex items-center justify-center border shrink-0 mt-0.5" style={{ background: `${event.color}15`, color: event.color, borderColor: `${event.color}40` }}>
                      {event.icon}
                    </span>
                    <div>
                      <h3 className="text-2xl font-bold text-white">{event.title}</h3>
                      <div className="flex flex-wrap gap-4 mt-1">
                        <span className="flex items-center gap-1.5 text-sm text-white/40" style={{ fontFamily: 'Inter, sans-serif', textTransform: 'none', letterSpacing: 'normal' }}>
                          <MapPin className="h-3.5 w-3.5" /> {event.location}
                        </span>
                        <span className="flex items-center gap-1.5 text-sm text-white/40" style={{ fontFamily: 'Inter, sans-serif', textTransform: 'none', letterSpacing: 'normal' }}>
                          <Calendar className="h-3.5 w-3.5" /> {event.date}
                        </span>
                        {event.time && (
                          <span className="flex items-center gap-1.5 text-sm text-white/40" style={{ fontFamily: 'Inter, sans-serif', textTransform: 'none', letterSpacing: 'normal' }}>
                            <Clock className="h-3.5 w-3.5" /> {event.time}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  <p className="text-base text-white/50 leading-relaxed" style={{ fontFamily: 'Inter, sans-serif', textTransform: 'none', letterSpacing: 'normal' }}>
                    {event.description}
                  </p>

                  {event.ongoing && (
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-[#ffcc00]/10 border border-[#ffcc00]/20 text-[#ffcc00] text-xs font-bold uppercase tracking-wider">
                      {event.ongoingText}
                    </span>
                  )}

                  {event.links && (
                    <div className="flex flex-wrap gap-3 pt-1">
                      {event.links.map((link, i) => (
                        <a
                          key={i}
                          href={link.url}
                          target={link.external ? '_blank' : undefined}
                          rel={link.external ? 'noopener noreferrer' : undefined}
                          className={`inline-flex items-center gap-2 px-5 py-2.5 font-bold text-sm uppercase tracking-wider transition-all ${
                            link.primary
                              ? 'bg-[#dc2626] hover:bg-[#ef4444] text-white shadow-lg shadow-red-600/20'
                              : 'bg-white/[0.05] border border-white/[0.1] text-white/70 hover:text-white hover:border-white/[0.2]'
                          }`}
                        >
                          {link.text} {link.external && <ExternalLink className="h-3.5 w-3.5" />}
                        </a>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        ))}

        {/* Pathways to Aviation */}
        <div className="glass-card p-8 relative overflow-hidden">
          <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-[#00ccff] via-[#dc2626] to-[#ffcc00]" />
          <div className="flex flex-col sm:flex-row items-center gap-6">
            <div className="w-16 h-16 bg-[#00ccff]/10 text-[#00ccff] flex items-center justify-center border border-[#00ccff]/25 shrink-0">
              <Compass className="h-8 w-8" />
            </div>
            <div className="text-center sm:text-left space-y-2 flex-1">
              <h3 className="text-xl sm:text-2xl font-bold text-white">Pathways to Aviation</h3>
              <p className="text-base text-white/50 leading-relaxed" style={{ fontFamily: 'Inter, sans-serif', textTransform: 'none', letterSpacing: 'normal' }}>
                Inspired by the spirit of flight? Whether you're a student, career changer, or lifelong aviation enthusiast, 
                Pathways to Aviation connects you with the resources, programs, and opportunities to find your next path 
                in the world of aerospace.
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

        {/* CTA */}
        <div className="text-center py-6">
          <Link
            to="/"
            className="inline-flex items-center gap-2 px-8 py-4 btn-neon text-xl"
          >
            Register for a Square <ArrowRight className="h-5 w-5" />
          </Link>
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
