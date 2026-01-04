
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
    <div className="relative min-h-screen bg-slate-50 selection:bg-teal-100 selection:text-teal-900 pb-20">

      {/* Background Decor */}
      <div className="fixed inset-0 z-0 pointer-events-none">
        <div className="absolute top-[-10%] right-[-5%] w-[500px] h-[500px] bg-teal-200/20 rounded-full blur-3xl opacity-50 mix-blend-multiply animate-blob" />
        <div className="absolute top-[20%] left-[-10%] w-[400px] h-[400px] bg-emerald-200/20 rounded-full blur-3xl opacity-50 mix-blend-multiply animate-blob animation-delay-2000" />
        <div className="absolute bottom-[-10%] right-[10%] w-[600px] h-[600px] bg-cyan-200/20 rounded-full blur-3xl opacity-50 mix-blend-multiply animate-blob animation-delay-4000" />
      </div>

      <div className="container mx-auto px-4 relative z-10 pt-24">
        <div className="text-center space-y-6 max-w-4xl mx-auto mb-16">
          <div className="inline-flex items-center gap-2 bg-white/60 backdrop-blur-sm px-4 py-1.5 rounded-full border border-white/40 shadow-sm transition-transform duration-700 hover:rotate-2">
            <Wand size={14} className="text-teal-500" strokeWidth={3} />
            <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-teal-800">AI Powered</span>
          </div>

          <h1 className="font-black text-5xl md:text-7xl lg:text-8xl uppercase leading-[0.85] tracking-tighter text-slate-900 drop-shadow-sm">
            Event <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-teal-700 to-emerald-600">Stylist</span>
          </h1>
          <p className="text-lg text-slate-500 font-medium leading-relaxed max-w-2xl mx-auto pt-4">
            Describe your dream event, and let our AI create a personalized plan for you!
          </p>
        </div>

        <Card className="glass-panel-wet border-none max-w-3xl mx-auto shadow-2xl">
          <CardHeader className="p-8 pb-4">
            <CardTitle className="text-3xl font-black uppercase text-slate-900 tracking-tight">Describe Your Event</CardTitle>
            <CardDescription className="text-slate-500 font-medium text-lg">
              Tell us about the occasion, the number of guests, the atmosphere you're going for, or any favorite colors.
            </CardDescription>
          </CardHeader>
          <CardContent className="p-8 pt-2">
            <form onSubmit={handleSubmit} className="space-y-6">
              <Textarea
                value={eventDescription}
                onChange={(e) => setEventDescription(e.target.value)}
                placeholder="e.g., 'A casual, fun-filled Hari Raya open house for about 50 friends. I want it to feel modern but traditional.'"
                className="bg-white/40 border-white/60 focus:border-teal-500/50 focus:bg-white/80 focus:ring-8 focus:ring-teal-500/10 transition-all duration-500 rounded-[1.5rem] min-h-[150px] resize-y p-6 text-xl text-slate-700 placeholder:text-slate-400/70"
                disabled={isLoading}
              />
              <Button type="submit" className="w-full btn-coast-primary h-14 text-lg shadow-lg" disabled={isLoading || !eventDescription}>
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
            <div className="inline-block p-4 rounded-full bg-white/50 backdrop-blur-md border border-teal-200/50 animate-pulse shadow-lg">
              <Loader2 className="h-12 w-12 animate-spin text-teal-500" />
            </div>
            <p className="text-teal-800/60 font-black uppercase tracking-widest mt-6 text-sm">Styling your event...</p>
          </div>
        )}

        {aiResponse && (
          <div className="mt-16 space-y-8 animate-in fade-in-50 slide-in-from-bottom-10 duration-1000 max-w-5xl mx-auto pb-12">
            <div className="text-center mb-12">
              <h2 className="text-4xl font-black uppercase text-slate-900 tracking-tighter mb-4">Your Custom Plan</h2>
              <div className="h-1.5 w-24 bg-gradient-to-r from-teal-400 to-emerald-400 mx-auto rounded-full" />
            </div>

            <div className="glass-panel-static p-8 border-l-4 border-l-teal-500 bg-teal-50/50 backdrop-blur-md rounded-r-[2rem] rounded-l-lg mx-4 md:mx-0">
              <div className="flex items-start gap-4">
                <Lightbulb className="h-8 w-8 text-teal-500 mt-1 shrink-0" strokeWidth={2.5} />
                <div>
                  <h3 className="font-black text-2xl text-slate-800 mb-2 uppercase tracking-tight">Here's the plan!</h3>
                  <p className="text-slate-600 font-medium text-lg leading-relaxed">
                    Below are the AI's suggestions based on your description.
                  </p>
                </div>
              </div>
            </div>

            <Card className="glass-panel-wet border-none">
              <CardHeader className="p-10 border-b border-white/40">
                <CardTitle className="font-black text-4xl md:text-5xl text-teal-700 uppercase tracking-tighter loading-[0.9]">{aiResponse.themeName}</CardTitle>
                <CardDescription className="text-xl text-slate-500 mt-2 font-medium">Vibe: <span className="font-bold text-slate-800">{aiResponse.vibe}</span></CardDescription>
              </CardHeader>
            </Card>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <Card className="glass-panel-static border-none h-full">
                <CardHeader className="p-8 pb-4">
                  <CardTitle className="flex items-center text-2xl font-black uppercase text-slate-800 tracking-tight"><Palette className="mr-3 h-6 w-6 text-teal-500" />Color Palette</CardTitle>
                </CardHeader>
                <CardContent className="p-8 pt-4 flex flex-wrap gap-6">
                  {aiResponse.colorPalette.map(color => (
                    <div key={color.hex} className="text-center group">
                      <div className="w-24 h-24 rounded-full border-[6px] border-white shadow-xl mx-auto group-hover:scale-110 transition-transform duration-500 ease-out" style={{ backgroundColor: color.hex }}></div>
                      <p className="text-xs mt-4 font-bold uppercase text-slate-700 tracking-wider">{color.name}</p>
                      <p className="text-[10px] text-slate-400 font-mono uppercase">{color.hex}</p>
                    </div>
                  ))}
                </CardContent>
              </Card>
              <Card className="glass-panel-static border-none h-full flex flex-col">
                <CardHeader className="p-8 pb-4">
                  <CardTitle className="flex items-center text-2xl font-black uppercase text-slate-800 tracking-tight"><Package className="mr-3 h-6 w-6 text-teal-500" />Suggested Package</CardTitle>
                </CardHeader>
                <CardContent className="p-8 pt-4 flex-grow">
                  <div className="bg-white/60 p-8 rounded-[2rem] border border-white h-full flex flex-col justify-center text-center shadow-inner">
                    <h3 className="font-black text-3xl text-teal-700 uppercase tracking-tight mb-4">{aiResponse.suggestedPackage.name}</h3>
                    <p className="text-lg text-slate-500 font-medium italic leading-relaxed">"{aiResponse.suggestedPackage.reason}"</p>
                  </div>
                </CardContent>
              </Card>
            </div>

            <Card className="glass-panel-static border-none">
              <CardHeader className="p-8 pb-4">
                <CardTitle className="flex items-center text-2xl font-black uppercase text-slate-800 tracking-tight"><CupSoda className="mr-3 h-6 w-6 text-teal-500" />Flavor Recommendations</CardTitle>
              </CardHeader>
              <CardContent className="p-8 pt-4 grid grid-cols-1 md:grid-cols-3 gap-6">
                {aiResponse.suggestedFlavors.map(flavor => (
                  <div key={flavor.name} className="p-6 rounded-[2rem] bg-white/60 border border-white hover:bg-white transition-all duration-300 shadow-sm hover:shadow-md group">
                    <h4 className="font-black text-xl text-teal-700 uppercase mb-3 tracking-tight group-hover:text-teal-500 transition-colors">{flavor.name}</h4>
                    <p className="text-sm text-slate-500 font-medium leading-relaxed">{flavor.reason}</p>
                  </div>
                ))}
              </CardContent>
            </Card>

            <div className="text-center pt-8">
              <Button size="lg" onClick={handleProceedToBuilder} className="btn-coast-primary h-20 px-12 text-xl shadow-2xl hover:scale-105 transition-transform rounded-full">
                Use These Ideas <ArrowRight className="ml-3 h-6 w-6" strokeWidth={3} />
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

