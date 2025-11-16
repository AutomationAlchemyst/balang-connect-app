
import Link from 'next/link';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import SectionTitle from '@/components/ui/SectionTitle';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { mockFlavors, mockPackages, mockCommunityStories } from '@/lib/data';
import { ArrowRight, CupSoda, Gift, Users } from 'lucide-react';
import { format } from 'date-fns';

export default function Home() {
  const featuredFlavor = mockFlavors[0];
  const featuredPackage = mockPackages[0];
  const featuredStory = mockCommunityStories[0];

  return (
    <div className="space-y-16">
      {/* Hero Section */}
      <section className="text-center py-16 bg-gradient-to-br from-primary/20 to-background rounded-lg shadow-lg">
        <div className="container mx-auto px-4">
          <h1 className="font-headline text-5xl md:text-6xl font-bold text-primary mb-6">
            Welcome to Balang Kepalang!
          </h1>
          <p className="text-xl text-foreground mb-8 max-w-2xl mx-auto">
            Your one-stop solution for refreshing balang drinks, delightful event packages, and heartwarming community connections.
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <Button size="lg" asChild className="bg-accent hover:bg-accent/90 text-accent-foreground">
              <Link href="/flavors">Explore Flavors <ArrowRight className="ml-2 h-5 w-5" /></Link>
            </Button>
            <Button size="lg" variant="outline" asChild>
              <Link href="/packages">View Packages</Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Featured Flavor Section */}
      <section>
        <SectionTitle>Taste the Tradition</SectionTitle>
        <Card className="overflow-hidden shadow-xl hover:shadow-2xl transition-shadow duration-300">
          <div className="md:flex">
            <div className="md:w-1/2">
              <Image
                src={featuredFlavor.imageUrl}
                alt={featuredFlavor.name}
                width={600}
                height={400}
                className="object-cover w-full h-64 md:h-full"
                data-ai-hint="colorful drink"
              />
            </div>
            <div className="md:w-1/2 p-8 md:p-12 flex flex-col justify-center">
              <CardHeader>
                <CardTitle className="font-headline text-3xl text-accent">{featuredFlavor.name}</CardTitle>
                <CardDescription className="text-lg">{featuredFlavor.description}</CardDescription>
              </CardHeader>
              <CardContent>
                <Button asChild>
                  <Link href="/flavors" className="flex items-center">
                    <CupSoda className="mr-2 h-5 w-5" /> See All Flavors
                  </Link>
                </Button>
              </CardContent>
            </div>
          </div>
        </Card>
      </section>

      {/* Featured Package Section */}
      <section>
        <SectionTitle>Perfect for Any Occasion</SectionTitle>
         <Card className="overflow-hidden shadow-xl hover:shadow-2xl transition-shadow duration-300">
          <div className="md:flex">
            <div className="md:w-1/2">
               <Image
                src={featuredPackage.imageUrl}
                alt={featuredPackage.name}
                width={600}
                height={400}
                className="object-cover w-full h-64 md:h-full"
                data-ai-hint="event setup"
              />
            </div>
            <div className="md:w-1/2 p-8 md:p-12 flex flex-col justify-center">
              <CardHeader>
                <CardTitle className="font-headline text-3xl text-accent">{featuredPackage.name}</CardTitle>
                <CardDescription className="text-lg">{featuredPackage.description}</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-2xl font-semibold text-primary mb-4">
                  From ${featuredPackage.price.toFixed(2)}
                </p>
                 <Button asChild>
                  <Link href="/packages" className="flex items-center">
                    <Gift className="mr-2 h-5 w-5" /> Explore Packages
                  </Link>
                </Button>
              </CardContent>
            </div>
          </div>
        </Card>
      </section>
      
      {/* Community Highlight */}
      <section>
        <SectionTitle>Join Our Community</SectionTitle>
        <Card className="shadow-xl hover:shadow-2xl transition-shadow duration-300">
          <CardHeader>
            <div className="flex items-center space-x-4 mb-2">
              {featuredStory.avatarUrl && <Image src={featuredStory.avatarUrl} alt={featuredStory.userName} width={60} height={60} className="rounded-full" data-ai-hint="person portrait" />}
              <div>
                <CardTitle className="font-headline text-2xl text-accent">{featuredStory.userName}</CardTitle>
                <CardDescription className="text-sm">Shared on: {format(new Date(featuredStory.date), 'PPP')}</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-lg mb-4 italic">"{featuredStory.story}"</p>
            {featuredStory.imageUrl && (
                <Image src={featuredStory.imageUrl} alt="Community story image" width={700} height={300} className="rounded-lg object-cover w-full max-h-64 mb-4" data-ai-hint="community event" />
            )}
            <Button asChild>
              <Link href="/community" className="flex items-center">
                <Users className="mr-2 h-5 w-5" /> Read More Stories
              </Link>
            </Button>
          </CardContent>
        </Card>
      </section>
    </div>
  );
}
