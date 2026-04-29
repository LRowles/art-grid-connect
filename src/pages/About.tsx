import { PublicNav } from '@/components/PublicNav';
import { Plane, Heart, MapPin, Calendar, Palette, Star, ArrowRight, ExternalLink, Rocket, Globe, Instagram, Compass } from 'lucide-react';
import { Link } from 'react-router-dom';
import artownLogo from '@/assets/artown-logo.jpg';
import socLogo from '@/assets/soc-logo.png';
import discoveryLogo from '@/assets/discovery-logo.jpg';
import rwfLogo from '@/assets/rwf-logo.png';
import muralArtwork from '@/assets/mural-artwork.png';
import gillemotLogo from '@/assets/gillemot-logo-white.png';

export default function About() {
  return (
    <div className="min-h-screen bg-black">
      <PublicNav />

      {/* Hero */}
      <section className="hero-gradient hero-glow text-white relative overflow-hidden">
        <div className="max-w-4xl mx-auto px-4 py-16 sm:py-24 text-center space-y-6 relative z-10">
          <div className="inline-flex items-center gap-2 px-5 py-2 bg-white/[0.05] text-base font-bold uppercase tracking-widest border border-white/[0.08] text-[#dc2626]">
            <Plane className="h-5 w-5" />
            <span>About the Project</span>
          </div>
          <h1 className="text-5xl sm:text-7xl font-black tracking-tight leading-[1.05]">
            Art of Aviation<br />
            <span className="text-[#dc2626]">Community Mural</span>
          </h1>
          <p className="text-lg sm:text-xl text-white/50 leading-relaxed max-w-2xl mx-auto" style={{ fontFamily: 'Inter, sans-serif', textTransform: 'none', letterSpacing: 'normal' }}>
            A collaborative art project celebrating Northern Nevada's rich aviation heritage
            as part of the Reno 250 celebration.
          </p>
        </div>
      </section>

      {/* Content */}
      <section className="max-w-4xl mx-auto px-4 py-12 space-y-12">

        {/* The Vision */}
        <div className="glass-card p-8 space-y-4">
          <div className="flex items-center gap-3 mb-2">
            <span className="w-11 h-11 bg-[#dc2626]/15 text-[#dc2626] flex items-center justify-center border border-[#dc2626]/25">
              <Palette className="h-6 w-6" />
            </span>
            <h2 className="text-3xl font-bold text-white">The Vision</h2>
          </div>
          <p className="text-lg text-white/50 leading-relaxed" style={{ fontFamily: 'Inter, sans-serif', textTransform: 'none', letterSpacing: 'normal' }}>
            This collaborative project brings together the community in celebration of art, innovation,
            and our shared skies. Local artists are invited to claim a square of the mural grid, recreate
            their assigned section, and contribute to a large-scale mosaic-style mural. Each square becomes
            a piece of a stunning whole — a testament to what a community can create together.
          </p>
          <p className="text-lg text-white/50 leading-relaxed" style={{ fontFamily: 'Inter, sans-serif', textTransform: 'none', letterSpacing: 'normal' }}>
            The completed mural will be installed and on display at{' '}
            <strong className="text-white">The Discovery</strong>, serving as the entrance
            centerpiece to a new aviation-themed exhibition and helping build excitement for the inaugural{' '}
            <strong className="text-[#dc2626]">Red, White, and Flight</strong> drone show and concert event.
          </p>
        </div>

        {/* ====== MEET THE ARTIST — Reilly Moss ====== */}
        <div className="glass-card overflow-hidden relative">
          <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-[#dc2626] via-[#ffcc00] to-[#00ccff]" />
          
          {/* Mural artwork image */}
          <div className="w-full overflow-hidden" style={{ maxHeight: '400px' }}>
            <img 
              src={muralArtwork} 
              alt="A Sky Written by Dreamers — Art of Aviation mural by Reilly Moss" 
              className="w-full object-cover object-center"
            />
          </div>
          
          {/* Artist Interview Video */}
          <div className="p-8 pb-0">
            <div className="relative w-full" style={{ paddingBottom: '56.25%' }}>
              <iframe
                className="absolute top-0 left-0 w-full h-full border border-white/[0.08]"
                src="https://www.youtube.com/embed/I_BLYLkRtQI"
                title="Interview with Reilly Moss — 2026 Poster Artist"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              />
            </div>
          </div>

          <div className="p-8 space-y-6">
            <div className="flex items-center gap-3">
              <span className="w-11 h-11 bg-[#dc2626]/15 text-[#dc2626] flex items-center justify-center border border-[#dc2626]/25">
                <Star className="h-6 w-6" />
              </span>
              <div>
                <p className="text-xs uppercase tracking-[0.25em] text-[#dc2626] font-bold">Meet the Artist</p>
                <h2 className="text-3xl font-bold text-white">Reilly Moss</h2>
              </div>
            </div>

            <div className="space-y-4">
              <p className="text-lg text-white/60 leading-relaxed" style={{ fontFamily: 'Inter, sans-serif', textTransform: 'none', letterSpacing: 'normal' }}>
                Reilly Moss is an artist and creative designer from Reno, Nevada. Surrounded by art from a
                young age, she gravitates toward vivid colors and dynamic compositions, using them to inspire
                joy and spark connection. She works across a variety of mediums, including digital illustration,
                chalk pastels and acrylic paint. Her work often celebrates the beauty of the natural world
                through vibrant depictions of wildlife and plant life, while also exploring themes of history,
                innovation and community.
              </p>

              <div className="bg-white/[0.03] border-l-4 border-[#dc2626] p-6 my-6">
                <h3 className="text-xl font-bold text-white mb-3" style={{ fontFamily: 'Oswald, sans-serif', textTransform: 'uppercase' }}>
                  "A Sky Written by Dreamers"
                </h3>
                <p className="text-base text-white/50 leading-relaxed italic" style={{ fontFamily: 'Inter, sans-serif', textTransform: 'none', letterSpacing: 'normal' }}>
                  "This mural honors the United States' 250th anniversary — a reflection on the nation's enduring spirit 
                  of innovation, freedom, and exploration, viewed through the lens of Northern Nevada. Rising from the 
                  desert horizon into an illuminated sky, the composition blends past, present, and future, portraying 
                  aviation as both a technological achievement and a powerful symbol of possibility."
                </p>
              </div>

              <p className="text-base text-white/50 leading-relaxed" style={{ fontFamily: 'Inter, sans-serif', textTransform: 'none', letterSpacing: 'normal' }}>
                The mural is envisioned as a sweeping, twilight-to-night panorama where America's story of
                flight unfolds upward through the Northern Nevada sky. Beginning at the desert horizon, early milestones 
                of flight emerge — a Wright brothers-era aircraft and a U.S. mail service plane — symbolizing the 
                foundational belief that human imagination could overcome gravity. These historic aircraft rise alongside 
                a hot air balloon and military planes, reflecting Reno's deep ties to the Hot Air Balloon Races, Air 
                Races, and Stead Airport.
              </p>

              <p className="text-base text-white/50 leading-relaxed" style={{ fontFamily: 'Inter, sans-serif', textTransform: 'none', letterSpacing: 'normal' }}>
                As the sky deepens, the mural transitions into a dreamlike atmosphere, illuminated by lanterns
                and drones that perform a light show, forming the shape of Nevada — home. A rocket and satellite propel 
                the narrative into the future, symbolizing continued exploration beyond Earth. Anchoring the scene 
                is a young girl holding a paper airplane toward the sky, embodying curiosity, possibility, and the 
                generational passing of dreams. An eagle watches over the composition — representing freedom, 
                vision, and guidance.
              </p>

              <p className="text-base text-white/50 leading-relaxed" style={{ fontFamily: 'Inter, sans-serif', textTransform: 'none', letterSpacing: 'normal' }}>
                In her illustration created for the United States' 250th celebration, Reilly brings these influences
                together to craft a visual story that connects Northern Nevada's pioneering spirit with the
                boundless promise of the future. It invites viewers to look upward — to honor 250 years of progress, 
                to celebrate Northern Nevada's pioneering spirit, and to imagine the boundless horizons still ahead.
              </p>
            </div>

            {/* Artist links */}
            <div className="flex flex-wrap gap-4 pt-2">
              <a
                href="https://www.reillymoss.com"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-5 py-2.5 bg-white/[0.05] border border-white/[0.1] text-white/70 hover:text-white hover:border-[#dc2626]/40 transition-all text-base font-medium"
                style={{ fontFamily: 'Inter, sans-serif', textTransform: 'none', letterSpacing: 'normal' }}
              >
                <Globe className="h-4 w-4" /> reillymoss.com <ExternalLink className="h-3.5 w-3.5 opacity-50" />
              </a>
              <a
                href="https://www.instagram.com/reillymossart"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-5 py-2.5 bg-white/[0.05] border border-white/[0.1] text-white/70 hover:text-white hover:border-[#dc2626]/40 transition-all text-base font-medium"
                style={{ fontFamily: 'Inter, sans-serif', textTransform: 'none', letterSpacing: 'normal' }}
              >
                <Instagram className="h-4 w-4" /> @reillymossart <ExternalLink className="h-3.5 w-3.5 opacity-50" />
              </a>
            </div>
          </div>
        </div>

        {/* How to Participate */}
        <div className="glass-card p-8 space-y-6">
          <div className="flex items-center gap-3 mb-2">
            <span className="w-11 h-11 bg-[#dc2626]/15 text-[#dc2626] flex items-center justify-center border border-[#dc2626]/25">
              <Heart className="h-6 w-6" />
            </span>
            <h2 className="text-3xl font-bold text-white">How to Participate</h2>
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
                title: 'Pick Up Your Canvas (May 1 – June 1)',
                desc: 'Pick up your pre-cut canvas square at The Discovery between May 1 and June 1. Each square comes with a reference image.',
              },
              {
                icon: <Star className="h-5 w-5" />,
                title: 'Paint Your Masterpiece',
                desc: 'Use any painting materials you prefer. Try to match the colors of your reference image as closely as possible.',
              },
              {
                icon: <Compass className="h-5 w-5" />,
                title: 'Label Your Canvas (Important!)',
                desc: 'On the BACK of your canvas, write your square number (e.g. H2), your first and last name, and mark \u201cTOP\u201d at the top edge. This is critical for assembly.',
                highlight: true,
              },
              {
                icon: <Calendar className="h-5 w-5" />,
                title: 'Return by June 15',
                desc: 'Drop off your completed square at The Discovery by Sunday, June 15th so it can be assembled into the final mural.',
              },
            ].map((item, i) => (
              <div key={i} className={`flex items-start gap-4 p-5 border ${(item as any).highlight ? 'bg-[#dc2626]/[0.08] border-[#dc2626]/30' : 'bg-white/[0.02] border-white/[0.05]'}`}>
                <span className="w-10 h-10 bg-[#dc2626]/10 text-[#dc2626] flex items-center justify-center shrink-0 border border-[#dc2626]/20">
                  {item.icon}
                </span>
                <div>
                  <h3 className="font-bold text-white text-base mb-1" style={{ fontFamily: 'Oswald, sans-serif', textTransform: 'uppercase' }}>{item.title}</h3>
                  <p className={`text-base leading-relaxed ${(item as any).highlight ? 'text-[#dc2626]/80 font-medium' : 'text-white/40'}`} style={{ fontFamily: 'Inter, sans-serif', textTransform: 'none', letterSpacing: 'normal' }}>{item.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Community Reception */}
        <div className="glass-card p-8 space-y-4 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-[#dc2626]/[0.03] rounded-full blur-3xl" />
          <div className="flex items-center gap-3 mb-2">
            <span className="w-11 h-11 bg-[#dc2626]/15 text-[#dc2626] flex items-center justify-center border border-[#dc2626]/25">
              <Calendar className="h-6 w-6" />
            </span>
            <h2 className="text-3xl font-bold text-white">Community Reception</h2>
          </div>
          <p className="text-lg text-white/50 leading-relaxed" style={{ fontFamily: 'Inter, sans-serif', textTransform: 'none', letterSpacing: 'normal' }}>
            Join us for a community reception and Artown Kickoff on the evening of <strong className="text-white">July 2nd</strong> at{' '}
            <strong className="text-white">The Discovery</strong>, where we will unveil the final assembled mural.
            Celebrate with fellow artists and community members as we reveal this collaborative masterpiece!
          </p>
          <Link
            to="/events"
            className="inline-flex items-center gap-2 text-[#dc2626] hover:text-[#ef4444] font-bold text-base uppercase tracking-wider transition-colors"
            style={{ fontFamily: 'Inter, sans-serif' }}
          >
            View All Events <ArrowRight className="h-4 w-4" />
          </Link>
        </div>

        {/* Pathways to Aviation */}
        <div className="glass-card p-8 space-y-4 relative overflow-hidden">
          <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-[#00ccff] via-[#dc2626] to-[#ffcc00]" />
          <div className="flex items-center gap-3 mb-2">
            <span className="w-11 h-11 bg-[#00ccff]/15 text-[#00ccff] flex items-center justify-center border border-[#00ccff]/25">
              <Compass className="h-6 w-6" />
            </span>
            <h2 className="text-3xl font-bold text-white">Pathways to Aviation</h2>
          </div>
          <p className="text-lg text-white/50 leading-relaxed" style={{ fontFamily: 'Inter, sans-serif', textTransform: 'none', letterSpacing: 'normal' }}>
            Inspired by the spirit of flight? Whether you're a student, career changer, or lifelong aviation enthusiast,{' '}
            <strong className="text-white">Pathways to Aviation</strong> connects you with the resources, programs, and 
            opportunities to find your next path in the world of aerospace. From pilot training to engineering, 
            drone technology to air traffic control — discover where aviation can take you.
          </p>
          <a
            href="https://pathwaystoaviation.org/"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 px-6 py-3 bg-[#00ccff]/10 hover:bg-[#00ccff]/20 border border-[#00ccff]/30 text-[#00ccff] font-bold text-base uppercase tracking-wider transition-all"
          >
            <Compass className="h-4 w-4" />
            Find Your Path <ExternalLink className="h-4 w-4" />
          </a>
        </div>

        {/* Red, White & Flight CTA */}
        <div className="cta-banner p-8 space-y-4">
          <div className="flex flex-col sm:flex-row items-center gap-6">
            <div className="bg-white rounded-lg p-3 shrink-0 shadow-lg">
              <img src={rwfLogo} alt="Red, White and Flight" className="h-20 w-auto" />
            </div>
            <div className="text-center sm:text-left space-y-3 flex-1">
              <h2 className="text-2xl sm:text-3xl font-bold text-white">Red, White & Flight</h2>
              <p className="text-lg text-white/50 leading-relaxed" style={{ fontFamily: 'Inter, sans-serif', textTransform: 'none', letterSpacing: 'normal' }}>
                Celebrate July 4th with a spectacular drone show, Reno Phil concert, and interactive aerospace expo
                at Mackay Stadium. This free community event is the perfect way to experience the spirit of aviation
                that inspired our community mural.
              </p>
              <a
                href="https://redwhiteandflight.org/"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-6 py-3 bg-[#dc2626] hover:bg-[#ef4444] text-white font-bold text-base uppercase tracking-wider transition-all shadow-lg shadow-red-600/20"
              >
                <Rocket className="h-4 w-4" />
                Secure Your Free Spot <ExternalLink className="h-4 w-4" />
              </a>
            </div>
          </div>
        </div>

        {/* Partners */}
        <div className="space-y-8">
          <h2 className="text-3xl font-bold text-white text-center">Our Partners</h2>

          {/* Gillemot Foundation - Key Funder - Full Width Featured */}
          <div className="glass-card p-8 space-y-4 border-[#dc2626]/20 relative overflow-hidden">
            <div className="absolute top-0 left-0 right-0 h-1 bg-[#dc2626]" />
            <div className="text-center space-y-4">
              <p className="text-xs uppercase tracking-[0.25em] text-[#dc2626] font-bold">Key Funder</p>
              <img src={gillemotLogo} alt="The George W. Gillemot Foundation" className="h-16 sm:h-20 w-auto mx-auto" />
              <p className="text-base text-white/50 leading-relaxed max-w-xl mx-auto" style={{ fontFamily: 'Inter, sans-serif', textTransform: 'none', letterSpacing: 'normal' }}>
                The George W. Gillemot Foundation funded the original professional mural artwork that serves as the
                foundation for this community project. Their commitment to supporting aviation education and innovation
                continues to inspire the next generation of aerospace leaders and makes projects like this possible.
              </p>
            </div>
          </div>

          <div className="grid sm:grid-cols-3 gap-6">
            {/* Artown */}
            <div className="glass-card p-6 flex flex-col items-center text-center space-y-3">
              <img src={artownLogo} alt="Artown" className="h-16 w-auto" />
              <h3 className="font-bold text-white text-lg">Artown</h3>
              <p className="text-white/40 text-base leading-relaxed" style={{ fontFamily: 'Inter, sans-serif', textTransform: 'none', letterSpacing: 'normal' }}>
                Funding the Community Mural Event, Artown expands the celebration by inviting local
                artists of all backgrounds to participate. Artown's mission to strengthen the community
                through the arts shines in every square of this project.
              </p>
            </div>

            {/* The Discovery */}
            <div className="glass-card p-6 flex flex-col items-center text-center space-y-3">
              <img src={discoveryLogo} alt="The Discovery" className="h-16 w-auto" />
              <h3 className="font-bold text-white text-lg">The Discovery</h3>
              <p className="text-white/40 text-base leading-relaxed" style={{ fontFamily: 'Inter, sans-serif', textTransform: 'none', letterSpacing: 'normal' }}>
                Hosting the event and showcasing the completed mural, The Discovery creates an
                interactive gateway into an aviation-themed exhibit that celebrates exploration,
                discovery, and innovation.
              </p>
            </div>

            {/* Strengthen our Community */}
            <div className="glass-card p-6 flex flex-col items-center text-center space-y-3">
              <img src={socLogo} alt="Strengthen our Community" className="h-14 w-auto bg-white/90 px-3 py-1" />
              <h3 className="font-bold text-white text-lg">Strengthen our Community</h3>
              <p className="text-white/40 text-base leading-relaxed" style={{ fontFamily: 'Inter, sans-serif', textTransform: 'none', letterSpacing: 'normal' }}>
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
            <img src={discoveryLogo} alt="The Discovery" className="h-9 w-auto opacity-70" />
            <img src={socLogo} alt="Strengthen our Community" className="h-9 w-auto opacity-70 bg-white/80 px-2 py-0.5" />
          </div>
          <div className="text-center space-y-2">
            <p className="text-base text-white/40" style={{ fontFamily: 'Inter, sans-serif', textTransform: 'none', letterSpacing: 'normal' }}>
              Art of Aviation Community Mural — A Reno 250 Celebration
            </p>
            <p className="text-sm text-white/20" style={{ fontFamily: 'Inter, sans-serif', textTransform: 'none', letterSpacing: 'normal' }}>
              Presented by The George W. Gillemot Foundation, Artown, The Discovery & Strengthen our Community
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
