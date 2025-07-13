
'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { eventStylistFlow, type EventStylistOutput } from '@/ai/flows/eventStylistFlow';
import { mockFlavors, mockPackages } from '@/lib/data';
import SectionTitle from '@/components/ui/SectionTitle';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Sparkles, Loader2, Wand, Palette, CupSoda, Package, ArrowRight, Lightbulb } from 'lucide-react';
import { Separator } from '@/components/ui/separator';

export default function AiStylistPage() {
  const [eventDescription, setEventDescription] = useState('');
  const [aiResponse, setAiResponse] = useState<EventStylistOutput | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (eventDescription.length < 15) {
      setError('Please provide a more detailed description of your event.');
      return;
    }
    setIsLoading(true);
    setError(null);
    setAiResponse(null);

    try {
      const response = await eventStylistFlow({ eventDescription });
      setAiResponse(response);
    } catch (err: any) {
      console.error(err);
      setError(err.message || 'An unexpected error occurred. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleProceedToBuilder = () => {
    if (!aiResponse) return;

    const flavorIds = aiResponse.suggestedFlavors
        .map(sf => mockFlavors.find(f => f.name === sf.name)?.id)
        .filter(id => !!id);
    
    const packageId = mockPackages.find(p => p.name === aiResponse.suggestedPackage.name)?.id;

    const queryParams = new URLSearchParams();
    if (packageId) {
        queryParams.append('defaultPackageId', packageId);
    }
    if (flavorIds.length > 0) {
        queryParams.append('addFlavorIds', flavorIds.join(','));
    }

    router.push(`/event-builder?${queryParams.toString()}`);
  };

  return (
    <div className="space-y-12">
      <div className="text-center">
        <SectionTitle className="flex items-center justify-center">
            <Wand className="mr-4 h-10 w-10" /> AI Event Stylist
        </SectionTitle>
        <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
          Don't know where to start? Describe your dream event below, and let our AI create a personalized plan for you!
        </p>
      </div>

      <Card className="max-w-3xl mx-auto shadow-2xl">
        <CardHeader>
          <CardTitle>Describe Your Event</CardTitle>
          <CardDescription>
            Tell us about the occasion, the number of guests, the atmosphere you're going for, or any favorite colors or themes. The more detail, the better!
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <Textarea
              value={eventDescription}
              onChange={(e) => setEventDescription(e.target.value)}
              placeholder="e.g., 'A casual, fun-filled Hari Raya open house for about 50 friends and family. I want it to feel modern but traditional.' or 'A surprise 30th birthday party for my husband. He loves classy, minimalist themes and the color green.'"
              className="min-h-[120px] resize-y"
              disabled={isLoading}
            />
            <Button type="submit" className="w-full bg-primary hover:bg-primary/90" disabled={isLoading || !eventDescription}>
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                  Styling Your Event...
                </>
              ) : (
                <>
                  <Sparkles className="mr-2 h-5 w-5" />
                  Generate Ideas
                </>
              )}
            </Button>
          </form>
          {error && <p className="text-sm text-destructive mt-4">{error}</p>}
        </CardContent>
      </Card>

      {isLoading && (
         <div className="text-center p-8">
            <Loader2 className="h-12 w-12 animate-spin text-primary mx-auto" />
            <p className="text-muted-foreground mt-4">Our AI is brewing up some fresh ideas...</p>
         </div>
      )}

      {aiResponse && (
        <div className="mt-12 space-y-8 animate-in fade-in-50 duration-500">
            <SectionTitle>Your Custom Event Plan</SectionTitle>
            
            <Alert variant="default" className="bg-primary/10 border-primary/30">
                <Lightbulb className="h-5 w-5 text-primary" />
                <AlertTitle className="text-primary font-semibold">Here's Your Plan!</AlertTitle>
                <AlertDescription className="text-foreground/90">
                    Below are the AI's suggestions based on your description. Use the button at the bottom to send these ideas straight to the Event Builder!
                </AlertDescription>
            </Alert>
            
            <Card>
                <CardHeader>
                    <CardTitle className="text-accent">{aiResponse.themeName}</CardTitle>
                    <CardDescription>Vibe: <span className="font-semibold">{aiResponse.vibe}</span></CardDescription>
                </CardHeader>
            </Card>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center"><Palette className="mr-2 h-6 w-6 text-primary" />Color Palette</CardTitle>
                    </CardHeader>
                    <CardContent className="flex flex-wrap gap-4">
                        {aiResponse.colorPalette.map(color => (
                            <div key={color.hex} className="text-center">
                                <div className="w-16 h-16 rounded-full border-4 border-card" style={{ backgroundColor: color.hex }}></div>
                                <p className="text-xs mt-2 font-medium">{color.name}</p>
                                <p className="text-xs text-muted-foreground">{color.hex}</p>
                            </div>
                        ))}
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center"><Package className="mr-2 h-6 w-6 text-primary" />Suggested Package</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-2">
                        <h3 className="font-bold text-lg text-accent">{aiResponse.suggestedPackage.name}</h3>
                        <p className="text-sm text-muted-foreground italic">"{aiResponse.suggestedPackage.reason}"</p>
                    </CardContent>
                </Card>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center"><CupSoda className="mr-2 h-6 w-6 text-primary" />Flavor Recommendations</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                    {aiResponse.suggestedFlavors.map(flavor => (
                        <div key={flavor.name} className="p-3 border-l-4 border-secondary rounded-r-md bg-secondary/20">
                            <h4 className="font-semibold text-primary">{flavor.name}</h4>
                            <p className="text-sm text-muted-foreground">{flavor.reason}</p>
                        </div>
                    ))}
                </CardContent>
            </Card>

            <Separator />
            <div className="text-center">
                <Button size="lg" onClick={handleProceedToBuilder} className="bg-accent hover:bg-accent/90 text-accent-foreground">
                    Use These Ideas in Event Builder <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
            </div>
        </div>
      )}
    </div>
  );
}

