
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
    <div className="bg-coast-gradient min-h-screen -mt-10 pt-16 pb-24 px-4">
      <div className="text-center space-y-4 max-w-3xl mx-auto mb-12">
        <div className="inline-flex items-center gap-2 bg-white/50 backdrop-blur-sm border border-brand-blue/10 px-4 py-1 rounded-full text-brand-blue/60 text-xs font-bold uppercase tracking-widest mb-2">
            <Wand size={14} /> AI Powered
        </div>
        <h1 className="text-coast-heading text-4xl md:text-6xl text-brand-blue drop-shadow-sm">
            Event <span className="text-brand-cyan">Stylist</span>
        </h1>
        <p className="text-xl text-brand-blue/70 font-medium leading-relaxed">
          Describe your dream event, and let our AI create a personalized plan for you!
        </p>
      </div>

      <Card className="glass-panel-wet border-none max-w-3xl mx-auto shadow-2xl">
        <CardHeader className="p-8 pb-4">
          <CardTitle className="text-coast-heading text-2xl text-brand-blue">Describe Your Event</CardTitle>
          <CardDescription className="text-brand-blue/60 font-medium">
            Tell us about the occasion, the number of guests, the atmosphere you're going for, or any favorite colors.
          </CardDescription>
        </CardHeader>
        <CardContent className="p-8 pt-2">
          <form onSubmit={handleSubmit} className="space-y-6">
            <Textarea
              value={eventDescription}
              onChange={(e) => setEventDescription(e.target.value)}
              placeholder="e.g., 'A casual, fun-filled Hari Raya open house for about 50 friends. I want it to feel modern but traditional.'"
              className="input-coast min-h-[150px] resize-y p-4 text-lg"
              disabled={isLoading}
            />
            <Button type="submit" className="w-full btn-coast-primary h-14 text-xl shadow-lg" disabled={isLoading || !eventDescription}>
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-6 w-6 animate-spin" />
                  Brewing Ideas...
                </>
              ) : (
                <>
                  <Sparkles className="mr-2 h-6 w-6" />
                  Generate Ideas
                </>
              )}
            </Button>
          </form>
          {error && <p className="text-sm text-red-500 font-bold mt-4 text-center">{error}</p>}
        </CardContent>
      </Card>

      {/* Loading State - Custom Styled */}
      {isLoading && (
         <div className="text-center p-12">
            <div className="inline-block p-4 rounded-full bg-white/50 backdrop-blur-md border border-brand-cyan/20 animate-pulse">
                <Loader2 className="h-12 w-12 animate-spin text-brand-cyan" />
            </div>
            <p className="text-brand-blue/60 font-bold uppercase tracking-widest mt-6">Styling your event...</p>
         </div>
      )}

      {aiResponse && (
        <div className="mt-16 space-y-8 animate-in fade-in-50 slide-in-from-bottom-10 duration-700 max-w-5xl mx-auto">
            <div className="text-center">
                <h2 className="text-coast-heading text-3xl text-brand-blue mb-2">Your Custom Plan</h2>
                <div className="h-1 w-24 bg-gradient-to-r from-brand-cyan to-brand-blue mx-auto rounded-full opacity-30" />
            </div>
            
            <div className="glass-panel-static p-6 border-l-4 border-l-brand-cyan bg-brand-cyan/5">
                <div className="flex items-start gap-4">
                    <Lightbulb className="h-6 w-6 text-brand-cyan mt-1 shrink-0" />
                    <div>
                        <h3 className="font-display font-bold text-xl text-brand-blue mb-1">Here's the plan!</h3>
                        <p className="text-brand-blue/80 font-medium">
                            Below are the AI's suggestions based on your description.
                        </p>
                    </div>
                </div>
            </div>
            
            <Card className="glass-panel-wet border-none">
                <CardHeader className="p-8 border-b border-brand-blue/5">
                    <CardTitle className="font-display font-black text-4xl text-brand-cyan uppercase tracking-tight">{aiResponse.themeName}</CardTitle>
                    <CardDescription className="text-lg text-brand-blue/70">Vibe: <span className="font-bold text-brand-blue">{aiResponse.vibe}</span></CardDescription>
                </CardHeader>
            </Card>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <Card className="glass-panel-static border-none">
                    <CardHeader className="p-6 pb-2">
                        <CardTitle className="flex items-center text-coast-heading text-xl text-brand-blue"><Palette className="mr-2 h-5 w-5 text-brand-cyan" />Color Palette</CardTitle>
                    </CardHeader>
                    <CardContent className="p-6 flex flex-wrap gap-6">
                        {aiResponse.colorPalette.map(color => (
                            <div key={color.hex} className="text-center group">
                                <div className="w-20 h-20 rounded-full border-4 border-white shadow-md mx-auto group-hover:scale-110 transition-transform duration-300" style={{ backgroundColor: color.hex }}></div>
                                <p className="text-xs mt-3 font-bold uppercase text-brand-blue">{color.name}</p>
                                <p className="text-[10px] text-brand-blue/50 font-mono">{color.hex}</p>
                            </div>
                        ))}
                    </CardContent>
                </Card>
                <Card className="glass-panel-static border-none">
                    <CardHeader className="p-6 pb-2">
                        <CardTitle className="flex items-center text-coast-heading text-xl text-brand-blue"><Package className="mr-2 h-5 w-5 text-brand-cyan" />Suggested Package</CardTitle>
                    </CardHeader>
                    <CardContent className="p-6 space-y-4">
                        <div className="bg-white/60 p-4 rounded-2xl border border-brand-blue/10">
                            <h3 className="font-display font-bold text-2xl text-brand-blue uppercase">{aiResponse.suggestedPackage.name}</h3>
                            <p className="text-sm text-brand-blue/70 italic mt-2 leading-relaxed">"{aiResponse.suggestedPackage.reason}"</p>
                        </div>
                    </CardContent>
                </Card>
            </div>

            <Card className="glass-panel-static border-none">
                <CardHeader className="p-6 pb-2">
                    <CardTitle className="flex items-center text-coast-heading text-xl text-brand-blue"><CupSoda className="mr-2 h-5 w-5 text-brand-cyan" />Flavor Recommendations</CardTitle>
                </CardHeader>
                <CardContent className="p-6 grid grid-cols-1 md:grid-cols-3 gap-4">
                    {aiResponse.suggestedFlavors.map(flavor => (
                        <div key={flavor.name} className="p-4 rounded-2xl bg-white/60 border border-brand-blue/5 hover:bg-white transition-colors">
                            <h4 className="font-display font-bold text-lg text-brand-blue uppercase mb-2">{flavor.name}</h4>
                            <p className="text-xs text-brand-blue/60 font-medium leading-relaxed">{flavor.reason}</p>
                        </div>
                    ))}
                </CardContent>
            </Card>

            <div className="text-center pt-8">
                <Button size="lg" onClick={handleProceedToBuilder} className="btn-coast-primary h-16 px-10 text-xl shadow-xl hover:scale-105 transition-transform">
                    Use These Ideas <ArrowRight className="ml-2 h-6 w-6" />
                </Button>
            </div>
        </div>
      )}
    </div>
  );
}

