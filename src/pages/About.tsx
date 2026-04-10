import { Link } from 'react-router-dom';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { PublicNav } from '@/components/PublicNav';
import artownLogo from '@/assets/artown-logo.jpg';

export default function About() {
  return (
    <div className="min-h-screen bg-background">
      <PublicNav />

      <div className="max-w-3xl mx-auto px-4 py-12 space-y-10">
        {/* Hero */}
        <div className="text-center space-y-4">
          <img src={artownLogo} alt="Artown" className="h-20 mx-auto rounded-lg shadow-md" />
          <h1 className="text-3xl sm:text-4xl font-extrabold text-foreground tracking-tight">
            Art of Aviation Community Mural
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto leading-relaxed">
            A collaborative demonstration of Northern Nevada's pioneering spirit, the history of flight, and the creativity that defines our region.
          </p>
        </div>

        {/* About the project */}
        <Card>
          <CardContent className="pt-6 space-y-4 text-sm sm:text-base leading-relaxed text-muted-foreground">
            <p>
              This collaborative project brings together the community in celebration of art, innovation, and our shared skies. Local artists are invited to claim a square of the mural grid, recreate their assigned section, and contribute to a large-scale mosaic-style mural. Each square becomes a piece of a stunning whole — a testament to what a community can create together.
            </p>
            <p>
              The completed mural will be installed and on display at <span className="font-semibold text-foreground">The Discovery Museum</span>, serving as the entrance centerpiece to a new aviation-themed exhibition and helping build excitement for the inaugural <span className="font-semibold text-foreground">Red, White, and Flight Drone Show</span>.
            </p>
          </CardContent>
        </Card>

        {/* Partners */}
        <div className="space-y-6">
          <h2 className="text-2xl font-bold text-foreground text-center">Community Partners</h2>

          <div className="grid gap-4 sm:grid-cols-1">
            <Card className="border-l-4 border-l-primary">
              <CardContent className="pt-5 pb-5">
                <h3 className="font-bold text-foreground text-lg">Artown</h3>
                <p className="text-sm text-muted-foreground mt-1">
                  Funding the Community Mural Event, Artown expands the celebration by inviting local artists of all backgrounds to participate in the creation of this landmark piece. Artown's mission to strengthen the community through the arts shines in every square of this project.
                </p>
              </CardContent>
            </Card>

            <Card className="border-l-4 border-l-accent">
              <CardContent className="pt-5 pb-5">
                <h3 className="font-bold text-foreground text-lg">The Discovery Museum</h3>
                <p className="text-sm text-muted-foreground mt-1">
                  Hosting the event and showcasing the completed mural, The Discovery creates an interactive gateway into an aviation-themed exhibit that celebrates exploration, discovery, and innovation. The mural will serve as the entrance centerpiece to the new exhibition.
                </p>
              </CardContent>
            </Card>

            <Card className="border-l-4 border-l-green-500">
              <CardContent className="pt-5 pb-5">
                <h3 className="font-bold text-foreground text-lg">The George W. Gillemot Foundation</h3>
                <p className="text-sm text-muted-foreground mt-1">
                  Funded the original professional mural artwork, supporting aviation education and innovation while helping inspire the next generation of aerospace leaders. Their generosity made this project possible.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* CTA */}
        <div className="text-center pt-4 pb-8">
          <Link to="/register">
            <Button size="lg" className="text-lg px-8 py-6 font-bold shadow-lg">
              🎨 Register Now — Pick Your Square
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
