'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { eventStylistFlow, type EventStylistOutput } from '@/ai/flows/eventStylistFlow';
import { mockFlavors, mockPackages } from '@/lib/data';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Sparkles, Loader2, Wand, Palette, CupSoda, Package, ArrowRight, Lightbulb, Info, RefreshCw, ChevronLeft, CheckCircle2, Plus, Edit3, ShoppingBag, User } from 'lucide-react';
import { cn } from '@/lib/utils';
import Image from 'next/image';

export default function AiStylistPage() {
  const [eventDescription, setEventDescription] = useState('');
  const [aiResponse, setAiResponse] = useState<EventStylistOutput | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    handleGenerate();
  };

  const handleGenerate = async () => {
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

  const handleQuickVibe = (vibe: string) => {
    const newDescription = eventDescription ? `${eventDescription} ${vibe}` : vibe;
    setEventDescription(newDescription);
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

  const activePackage = aiResponse ? mockPackages.find(p => p.name === aiResponse.suggestedPackage.name) : null;
  const packagePrice = activePackage?.price || 1250;

  return (
    <div className={cn(
      "relative min-h-screen overflow-x-hidden transition-colors duration-700",
      aiResponse ? "bg-brand-stitch-dark text-white pb-32" : "bg-[#fcfaf8] text-[#1b140e] pb-24"
    )}>

      {/* STITCH UI HEADER (Input Mode) */}
      {!aiResponse && (
        <div className="sticky top-0 z-50 flex items-center bg-[#fcfaf8]/80 backdrop-blur-md p-4 justify-between border-b border-[#e7dbd0]/30 transition-all duration-500">
          <div className="text-[#1b140e] flex size-12 shrink-0 items-center justify-center cursor-pointer">
            <Link href="/">
              <ChevronLeft className="h-6 w-6" />
            </Link>
          </div>
          <h2 className="text-[#1b140e] text-lg font-bold leading-tight tracking-[-0.015em] flex-1 text-center font-plus-jakarta">Event Stylist</h2>
          <div className="flex w-12 items-center justify-end">
            <button className="flex items-center justify-center rounded-full h-10 w-10 bg-brand-stitch-orange/10 text-brand-stitch-orange">
              <Sparkles size={20} />
            </button>
          </div>
        </div>
      )}

      {/* STITCH UI HEADER (Result Mode) */}
      {aiResponse && (
        <header className="fixed top-0 left-0 right-0 z-50 bg-[#101622]/80 backdrop-blur-md border-b border-white/5 transition-all duration-500">
          <div className="flex items-center px-4 py-3 justify-between max-w-lg mx-auto md:max-w-4xl">
            <div className="text-white flex size-12 shrink-0 items-center justify-start">
              <Button variant="ghost" size="icon" onClick={() => setAiResponse(null)} className="hover:bg-white/10 text-white rounded-full">
                <ChevronLeft />
              </Button>
            </div>
            <h2 className="text-white text-lg font-bold leading-tight tracking-[-0.015em] flex-1 text-center font-plus-jakarta">AI Stylist Results</h2>
            <div className="flex w-12 items-center justify-end">
              <Button variant="ghost" size="icon" onClick={() => { setAiResponse(null); setEventDescription(''); }} className="hover:bg-white/10 text-white rounded-full">
                <RefreshCw size={20} />
              </Button>
            </div>
          </div>
        </header>
      )}

      <div className={cn(
        "container mx-auto px-0 relative z-10 transition-all duration-700",
        aiResponse ? "pt-24 max-w-md md:max-w-4xl px-4" : "max-w-md md:max-w-2xl"
      )}>

        {/* INPUT MODE: Stitch UI Implementation */}
        {!aiResponse && !isLoading && (
          <div className="animate-in fade-in slide-in-from-bottom-4 duration-700">
            {/* Hero Header Section */}
            <div className="px-4 py-3">
              <div className="bg-cover bg-center flex flex-col justify-end overflow-hidden rounded-xl min-h-[280px] relative shadow-lg"
                style={{ backgroundImage: `linear-gradient(180deg, rgba(0, 0, 0, 0) 0%, rgba(33, 25, 17, 0.6) 100%), url("https://lh3.googleusercontent.com/aida-public/AB6AXuAqQYru0F9ePjuatKI4nMk2hSkVC6XH2u6SgBHobJcowm9WpHi8gWsEbYayrYO6zOeaY0Lv_tkFnbGHax_8rM7uyP2l1rFZwB2e3SjfMWe-NWZPCBU3PziVO5TcAUXm9GmUSv2SHwM5tXNu0MJ19m1sqR6pFtLcjHlBA6MQSv_0oIZEXlF6GFDheYe0p_07_TtbBB3hgh2Wl2pttiEc6bJp5VZaXP2Nu2c6JDGKhB-Qrn6CIFkny6qtxfLLT-LKclOMyMnPMxjs6tg")` }}>
                <div className="flex flex-col p-6 space-y-2">
                  <span className="text-brand-stitch-orange font-bold text-sm tracking-widest uppercase bg-black/20 backdrop-blur-md px-2 py-1 rounded w-fit">Concierge AI</span>
                  <h1 className="text-white tracking-tight text-3xl font-extrabold leading-tight shadow-black drop-shadow-lg">Let's Style Your Summer Story</h1>
                </div>
              </div>
            </div>

            {/* Section Title & Description */}
            <div className="px-4 pt-6">
              <h3 className="text-[#1b140e] tracking-tight text-2xl font-bold leading-tight pb-1 font-plus-jakarta">Describe Your Vision</h3>
              <p className="text-[#1b140e]/70 text-base font-normal leading-relaxed">
                Tell our AI about your guest count, color palette, and the vibe you want to create for this event.
              </p>
            </div>

            {/* AI Text Input Area */}
            <div className="px-4 py-4">
              <div className="relative group">
                <Textarea
                  value={eventDescription}
                  onChange={(e) => setEventDescription(e.target.value)}
                  className="flex w-full resize-none overflow-hidden rounded-xl text-[#1b140e] focus:outline-0 focus:ring-2 focus:ring-brand-stitch-orange/50 border border-[#e7dbd0] bg-white focus:border-brand-stitch-orange min-h-48 placeholder:text-[#97734e]/50 p-5 text-lg font-normal leading-relaxed shadow-sm transition-all"
                  placeholder="e.g., A 50-person corporate mixer with a turquoise and gold theme, focused on relaxed networking under the sunset..."
                />
                <div className="absolute bottom-4 right-4 flex items-center gap-2 pointer-events-none text-brand-stitch-orange opacity-50">
                  <Edit3 size={14} />
                  <span className="text-xs font-bold uppercase tracking-tighter">Natural Input</span>
                </div>
              </div>

              {error && (
                <p className="text-red-500 text-xs font-bold mt-2 ml-1 flex items-center gap-1">
                  <Info size={12} /> {error}
                </p>
              )}
            </div>

            {/* Quick Select Chips */}
            <div className="px-4 mb-6">
              <p className="text-xs font-bold text-[#1b140e]/40 uppercase tracking-widest mb-3 px-1">Quick Vibe Selection</p>
              <div className="flex flex-wrap gap-2">
                {['Sunset Chill', 'High Energy', 'Elegant Gala', 'Beach Party'].map((vibe) => (
                  <button
                    key={vibe}
                    onClick={() => handleQuickVibe(vibe)}
                    className={cn(
                      "px-4 py-2 rounded-full text-sm font-semibold transition-colors border",
                      vibe === 'Beach Party'
                        ? "border-brand-stitch-orange bg-brand-stitch-orange/10 text-brand-stitch-orange font-bold"
                        : "border-[#e7dbd0] bg-white text-[#1b140e] hover:border-brand-stitch-orange hover:text-brand-stitch-orange"
                    )}
                  >
                    {vibe}
                  </button>
                ))}
              </div>
            </div>

            {/* Generate Button Section */}
            <div className="px-4 py-6 pb-24">
              <button
                onClick={handleGenerate}
                disabled={!eventDescription}
                className="w-full h-16 bg-brand-stitch-orange text-white rounded-full flex items-center justify-center gap-3 shadow-[0_0_20px_rgba(235,153,71,0.4)] font-extrabold text-lg transition-transform active:scale-95 hover:shadow-lg hover:bg-[#d88635] disabled:opacity-50 disabled:shadow-none"
              >
                <Sparkles className="animate-pulse" />
                Generate Ideas
              </button>
              <p className="text-center text-xs text-[#1b140e]/40 mt-4">Powered by Premium Balang AI Stylist Engine</p>
            </div>
          </div>
        )}

        {/* Loading State */}
        {isLoading && (
          <div className="text-center py-40 animate-in fade-in duration-500 px-4">
            <div className="relative inline-block mb-8">
              <div className="absolute inset-0 bg-brand-stitch-orange/20 blur-2xl rounded-full animate-pulse" />
              <div className="relative p-8 rounded-[2rem] bg-white border border-[#e7dbd0] shadow-xl">
                <Loader2 className="h-16 w-16 animate-spin text-brand-stitch-orange" strokeWidth={2.5} />
              </div>
            </div>
            <h3 className="text-2xl font-bold text-[#1b140e] mb-2">Curating Your Vibe</h3>
            <p className="text-[#1b140e]/60 font-medium">Analyzing palette trends & flavor pairings...</p>
          </div>
        )}

        {/* RESULTS MODE: Stitch UI Implementation */}
        {aiResponse && (
          <div className="space-y-6 animate-in fade-in slide-in-from-bottom-20 duration-1000 pb-20">

            {/* Headline Section */}
            <section className="px-0 pt-2">
              <h2 className="text-white tracking-tight text-[28px] font-bold leading-tight text-left font-plus-jakarta">Your Personalized Plan</h2>
              <p className="text-[#92a4c9] text-sm font-normal leading-normal mt-1">Based on: "{aiResponse.vibe}"</p>
            </section>

            {/* Vibe Board Grid */}
            <section className="mt-4">
              <div className="flex items-center justify-between pb-3">
                <h3 className="text-white text-lg font-bold leading-tight tracking-[-0.015em]">Vibe Board</h3>
                <span className="text-brand-stitch-blue text-xs font-bold uppercase tracking-wider px-2 py-1 bg-brand-stitch-blue/10 rounded">AI Curated</span>
              </div>

              <div className="grid grid-cols-2 gap-3">
                {/* Main Vibe Image (First Flavor as Proxy for visual) */}
                {aiResponse.suggestedFlavors[0] && (
                  <div className="bg-cover bg-center flex flex-col gap-3 rounded-xl justify-end p-4 aspect-[4/5] relative overflow-hidden group shadow-lg"
                    style={{ backgroundImage: `linear-gradient(0deg, rgba(0, 0, 0, 0.7) 0%, rgba(0, 0, 0, 0) 60%), url(${mockFlavors.find(f => f.name === aiResponse.suggestedFlavors[0].name)?.imageUrl || 'https://placehold.co/400x500'})` }}>
                    <div className="absolute top-3 right-3 bg-white/10 backdrop-blur-md rounded-full p-1.5 border border-white/10">
                      <Info size={14} className="text-white" />
                    </div>
                    <div>
                      <p className="text-white text-base font-bold leading-tight">{aiResponse.suggestedFlavors[0].name}</p>
                      <p className="text-white/70 text-xs leading-tight line-clamp-2 mt-1">{aiResponse.suggestedFlavors[0].reason}</p>
                    </div>
                  </div>
                )}

                <div className="flex flex-col gap-3">
                  {/* Colors interpreted as Decor */}
                  <div className="bg-[#1c2230] rounded-xl flex flex-col gap-2 p-4 aspect-square flex-1 relative overflow-hidden border border-white/5 shadow-lg">
                    <p className="text-white text-xs font-bold leading-tight mb-1">Coastal Palette</p>
                    <div className="flex flex-wrap gap-2 justify-center items-center h-full">
                      {aiResponse.colorPalette.map(color => (
                        <div key={color.hex} className="w-8 h-8 rounded-full border-2 border-white/20 shadow-sm" style={{ backgroundColor: color.hex }} title={color.name} />
                      ))}
                    </div>
                  </div>

                  {/* Secondary Flavor / Element */}
                  {aiResponse.suggestedFlavors[1] && (
                    <div className="bg-cover bg-center flex flex-col gap-3 rounded-xl justify-end p-4 aspect-square flex-1 relative overflow-hidden shadow-lg"
                      style={{ backgroundImage: `linear-gradient(0deg, rgba(0, 0, 0, 0.7) 0%, rgba(0, 0, 0, 0) 60%), url(${mockFlavors.find(f => f.name === aiResponse.suggestedFlavors[1].name)?.imageUrl || 'https://placehold.co/400x400'})` }}>
                      <p className="text-white text-xs font-bold leading-tight">{aiResponse.suggestedFlavors[1].name}</p>
                    </div>
                  )}
                </div>
              </div>
            </section>

            {/* Package Recommendation */}
            <section className="mt-4">
              <h3 className="text-white text-lg font-bold leading-tight tracking-[-0.015em] mb-4">Recommended Package</h3>
              <div className="bg-white/5 border border-white/10 rounded-xl p-5 relative overflow-hidden shadow-xl group hover:border-brand-stitch-blue/30 transition-all">
                <div className="absolute -top-12 -right-12 w-32 h-32 bg-brand-stitch-blue/20 blur-3xl rounded-full group-hover:bg-brand-stitch-blue/30 transition-all"></div>

                <div className="flex justify-between items-start mb-4 relative z-10">
                  <div>
                    <h4 className="text-xl font-bold text-white">{aiResponse.suggestedPackage.name}</h4>
                    <p className="text-brand-stitch-blue text-sm font-semibold">Perfect for your guests</p>
                  </div>
                  <div className="text-right">
                    <span className="text-2xl font-bold text-white">${packagePrice}</span>
                    <p className="text-white/40 text-[10px] uppercase tracking-widest">Est. Total</p>
                  </div>
                </div>

                <ul className="space-y-3 mb-6 relative z-10">
                  {/* Mock features for the package */}
                  <li className="flex items-center gap-3 text-sm text-white/80">
                    <CheckCircle2 size={18} className="text-brand-stitch-blue" />
                    <span>Curated Balang Flavors</span>
                  </li>
                  <li className="flex items-center gap-3 text-sm text-white/80">
                    <CheckCircle2 size={18} className="text-brand-stitch-blue" />
                    <span>Professional Setup & Breakdown</span>
                  </li>
                  <li className="flex items-center gap-3 text-sm text-white/80">
                    <CheckCircle2 size={18} className="text-brand-stitch-blue" />
                    <span>Premium Glass Dispenser Set</span>
                  </li>
                </ul>

                <div className="bg-brand-stitch-blue/5 rounded-lg p-3 border border-brand-stitch-blue/20 relative z-10">
                  <div className="flex items-center gap-2 mb-1">
                    <Lightbulb size={14} className="text-brand-stitch-blue" />
                    <span className="text-[11px] font-bold text-brand-stitch-blue uppercase tracking-wider">Why this works</span>
                  </div>
                  <p className="text-white/70 text-xs leading-relaxed italic">
                    "{aiResponse.suggestedPackage.reason}"
                  </p>
                </div>
              </div>
            </section>

            {/* Enhance the Vibe (Add-ons / Remaining Flavors) */}
            <section className="mt-8 mb-24">
              <h3 className="text-white text-lg font-bold leading-tight tracking-[-0.015em] mb-4">Enhance the Vibe</h3>
              <div className="space-y-3">
                {/* Map remaining flavors or add-ons here */}
                {aiResponse.suggestedFlavors.slice(1).map((flavor, index) => {
                  const flavorImg = mockFlavors.find(f => f.name === flavor.name)?.imageUrl;
                  return (
                    <div key={index} className="bg-white/5 border border-white/5 rounded-xl p-3 flex items-center gap-4 hover:bg-white/10 transition-colors cursor-pointer">
                      <div className="size-16 rounded-lg bg-cover bg-center shrink-0 border border-white/10"
                        style={{ backgroundImage: `url('${flavorImg || 'https://placehold.co/100x100'}')` }}></div>
                      <div className="flex-1">
                        <div className="flex justify-between items-start">
                          <h5 className="font-bold text-sm text-white">{flavor.name}</h5>
                          {/* Mock price addition logic if appropriate, else hide */}
                        </div>
                        <p className="text-xs text-white/50 line-clamp-1">{flavor.reason}</p>
                        <div className="flex items-center gap-1 mt-1 text-brand-stitch-blue">
                          <Sparkles size={14} />
                          <span className="text-[10px] font-bold uppercase tracking-tight">AI Recommended</span>
                        </div>
                      </div>
                      <button className="bg-white/10 hover:bg-white/20 p-2 rounded-full transition-colors">
                        <Plus size={16} className="text-white" />
                      </button>
                    </div>
                  );
                })}

                {/* Hardcoded Add-on Example matching Stitch */}
                <div className="bg-white/5 border border-white/5 rounded-xl p-3 flex items-center gap-4 hover:bg-white/10 transition-colors cursor-pointer">
                  <div className="size-16 rounded-lg bg-cover bg-center shrink-0 border border-white/10"
                    style={{ backgroundImage: `url('https://images.unsplash.com/photo-1544145945-f90425340c7e?w=200')` }}></div>
                  <div className="flex-1">
                    <div className="flex justify-between items-start">
                      <h5 className="font-bold text-sm text-white">Infused Water Station</h5>
                      <span className="text-xs font-bold text-white/60">+$120</span>
                    </div>
                    <p className="text-xs text-white/50 line-clamp-1">Cucumber & Lime refreshing station.</p>
                    <div className="flex items-center gap-1 mt-1 text-white/40">
                      <Info size={14} />
                      <span className="text-[10px] font-bold uppercase tracking-tight">Essential for heat</span>
                    </div>
                  </div>
                  <button className="bg-white/10 hover:bg-white/20 p-2 rounded-full transition-colors">
                    <Plus size={16} className="text-white" />
                  </button>
                </div>
              </div>
            </section>

          </div>
        )}

      </div>

      {/* BOTTOM ACTION BAR (Result Mode) */}
      {aiResponse && (
        <div className="fixed bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-[#101622] via-[#101622]/90 to-transparent z-40 pb-8 md:pb-10 animate-in slide-in-from-bottom-full duration-1000">
          <div className="max-w-4xl mx-auto">
            <button
              onClick={handleProceedToBuilder}
              className="w-full bg-brand-stitch-blue text-white font-bold py-4 rounded-xl shadow-lg shadow-brand-stitch-blue/20 flex items-center justify-center gap-2 hover:bg-brand-blue transition-colors active:scale-95"
            >
              <Sparkles size={20} />
              Apply to Event Builder
            </button>
          </div>
        </div>
      )}

      {/* CUSTOM BOTTOM NAV FOR INPUT MODE (Per Stitch Design) */}
      {!aiResponse && (
        <nav className="fixed bottom-0 left-0 right-0 bg-[#fcfaf8]/90 backdrop-blur-xl border-t border-[#e7dbd0]/30 px-6 py-3 pb-8 flex items-center justify-between z-50 md:hidden">
          <div className="flex flex-col items-center gap-1 text-[#1b140e]/50">
            <Link href="/">
              <div className="flex flex-col items-center">
                <ChevronLeft size={24} />
                <span className="text-[10px] font-bold">Back</span>
              </div>
            </Link>
          </div>
          <div className="flex flex-col items-center gap-1 text-[#1b140e]/50">
            <Link href="/flavors">
              <div className="flex flex-col items-center">
                <CupSoda size={24} />
                <span className="text-[10px] font-bold">Flavors</span>
              </div>
            </Link>
          </div>
          <div className="flex flex-col items-center gap-1 text-brand-stitch-orange">
            <div className="relative">
              <Sparkles size={24} className="fill-brand-stitch-orange" />
              <div className="absolute -top-1 -right-1 size-2 bg-brand-stitch-orange rounded-full"></div>
            </div>
            <span className="text-[10px] font-bold">Stylist</span>
          </div>
          <div className="flex flex-col items-center gap-1 text-[#1b140e]/50">
            <Link href="/event-builder">
              <div className="flex flex-col items-center">
                <ShoppingBag size={24} />
                <span className="text-[10px] font-bold">Cart</span>
              </div>
            </Link>
          </div>
        </nav>
      )}

    </div>
  );
}
