'use client';

import { useState } from 'react';

import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { FLAVOR_CATEGORIES } from '@/data/mockData';
import { useFlavorSelection } from '@/hooks/useFlavorSelection';
import { Plus, ArrowRight, Droplets, Coffee, Flower2, Star, Waves, Check } from 'lucide-react';
import Image from 'next/image';

/**
 * FlavorsPage Component
 * 
 * Ported from "Iced Paradise" Reference Design.
 * - Theme: Sunny Gold (#f4c025) & Sand (#f8f5ee)
 * - Layout: Responsive Grid (2-col mobile, 4-col desktop), Sticky Header, Horizontal Filter Scroll
 */
export default function FlavorsPage() {
  const {
    selectedFlavorIds,
    toggleFlavorSelection,
    proceedToEventBuilder,
    filterFlavors,
    canProceed
  } = useFlavorSelection();

  const [activeCategory, setActiveCategory] = useState('all');

  return (
    <div className="relative flex min-h-screen w-full flex-col overflow-x-hidden bg-[#fcfbf8] font-plus-jakarta text-[#1c180d] pt-32 md:pt-40">
      {/* Sand Texture Overlay */}
      <div className="fixed inset-0 sand-texture z-0"></div>

      {/* Header Section */}
      <header className="sticky top-24 md:top-28 z-40 flex flex-col bg-[#fcfbf8]/90 px-4 pb-4 pt-2 backdrop-blur-md border-b border-black/5 md:border-none shadow-sm md:shadow-none transition-all">
        <div className="w-full max-w-7xl mx-auto space-y-4">
          <div className="flex items-center justify-center">
            <div className="flex flex-col items-center">
              <h1 className="text-2xl md:text-3xl font-extrabold uppercase italic tracking-tight text-[#1c180d] mt-2">Iced Paradise</h1>
            </div>
          </div>

          <p className="hidden md:block text-center text-base font-medium leading-snug text-[#1c180d]/70 max-w-lg mx-auto">
            Hand-crafted, cold-pressed, and ice-blended excellence. <br /> Select your flavors to begin customizing your event.
          </p>

          {/* Filter Bar (Horizontal Scroll) */}
          <div className="no-scrollbar flex gap-3 overflow-x-auto py-2 md:justify-center">
            {FLAVOR_CATEGORIES.map(cat => {
              const isActive = cat.id === activeCategory;
              return (
                <div
                  key={cat.id}
                  onClick={() => setActiveCategory(cat.id)}
                  className={cn(
                    "flex h-10 shrink-0 items-center justify-center gap-x-2 rounded-full px-6 text-sm font-bold shadow-sm transition-all cursor-pointer select-none",
                    isActive
                      ? "bg-[#f4c025] text-white shadow-[#f4c025]/40 scale-105"
                      : "bg-white border border-[#f4f0e7] text-[#1c180d] hover:bg-gray-50 hover:border-[#f4c025]/30"
                  )}
                >
                  {cat.label}
                </div>
              )
            })}
          </div>
        </div>
      </header>

      {/* Product Catalog Grid */}
      <main className="relative z-10 flex-1 px-4 pb-32 pt-16 md:pt-20">
        <div className="w-full max-w-7xl mx-auto">
          {/* Responsive Grid: 2 cols mobile -> 3 cols tablet -> 4 cols desktop -> 5 cols large screens */}
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 md:gap-6 lg:gap-8">
            {filterFlavors(activeCategory).map((flavor) => {
              const isSelected = selectedFlavorIds.includes(flavor.id);
              return (
                <div
                  key={flavor.id}
                  onClick={() => toggleFlavorSelection(flavor.id)}
                  className={cn(
                    "group flex flex-col overflow-hidden rounded-2xl border transition-all duration-300 cursor-pointer",
                    isSelected
                      ? "border-[#f4c025] ring-4 ring-[#f4c025]/20 shadow-xl scale-[1.02] z-10"
                      : "border-white/50 bg-white hover:shadow-xl hover:-translate-y-1 hover:border-[#f4c025]/30"
                  )}
                  style={{ boxShadow: isSelected ? '0 10px 30px -5px rgba(244, 192, 37, 0.3)' : undefined }}
                >
                  <div
                    className="relative aspect-[3/4] w-full bg-cover bg-center transition-transform duration-700 group-hover:scale-105"
                    style={{
                      backgroundImage: `linear-gradient(180deg, rgba(0, 0, 0, 0) 60%, rgba(0, 0, 0, 0.6) 100%), url(${flavor.imageUrl})`
                    }}
                  >
                    <div className="absolute left-2 top-2 flex flex-wrap gap-1">
                      {flavor.tags?.slice(0, 1).map(tag => (
                        <span key={tag} className="rounded-full bg-[#f4c025] px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-[#1c180d] shadow-sm">
                          {tag}
                        </span>
                      ))}
                    </div>
                    <div className="absolute bottom-3 left-3 right-3 transition-transform duration-300 group-hover:-translate-y-1">
                      <h3 className="leading-tight text-white text-base md:text-lg font-bold drop-shadow-md">{flavor.name}</h3>
                    </div>

                    {/* Selection Overlay */}
                    <div className={cn(
                      "absolute inset-0 bg-[#f4c025]/20 backdrop-blur-[2px] flex items-center justify-center transition-all duration-300",
                      isSelected ? "opacity-100" : "opacity-0 group-hover:opacity-100 bg-black/20"
                    )}>
                      <div className={cn(
                        "bg-white text-[#f4c025] rounded-full p-3 shadow-xl transition-all duration-300 transform",
                        isSelected ? "scale-100" : "scale-75 translate-y-4 group-hover:scale-100 group-hover:translate-y-0"
                      )}>
                        {isSelected ? <Check strokeWidth={4} size={24} /> : <Plus strokeWidth={4} size={24} />}
                      </div>
                    </div>
                  </div>

                  <div className="p-3 md:p-4 bg-white relative z-20">
                    <p className="mb-3 line-clamp-2 text-xs md:text-sm text-[#1c180d]/60 font-medium">
                      {flavor.description}
                    </p>
                    <button
                      className={cn(
                        "w-full flex items-center justify-center gap-2 rounded-xl py-2.5 text-xs md:text-sm font-bold transition-all active:scale-95",
                        isSelected
                          ? "bg-[#f4c025] text-[#1c180d] shadow-lg shadow-[#f4c025]/20"
                          : "bg-[#f4c025]/10 text-[#1c180d] group-hover:bg-[#f4c025] group-hover:text-white"
                      )}
                    >
                      {isSelected ? (
                        <>
                          <Check size={16} strokeWidth={3} /> Selected
                        </>
                      ) : (
                        <>
                          <Plus size={16} strokeWidth={3} /> Select Flavor
                        </>
                      )}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </main>

      {/* Floating Footer Action Bar */}
      <footer className="fixed bottom-0 left-0 right-0 z-50 p-6 pointer-events-none">
        <div className={cn(
          "pointer-events-auto mx-auto flex max-w-sm md:max-w-md items-center justify-between rounded-full border border-white/40 bg-white/90 p-2 shadow-2xl shadow-black/10 backdrop-blur-xl transition-all duration-500 hover:scale-105 hover:shadow-[#f4c025]/10",
          canProceed ? "translate-y-0 opacity-100" : "translate-y-32 opacity-0"
        )}>
          <div className="flex items-center gap-3 pl-5">
            <div className="relative flex size-12 items-center justify-center rounded-full bg-[#008080] text-white shadow-lg shadow-[#008080]/30">
              <Droplets size={22} className="animate-pulse" />
              <div className="absolute -top-1 -right-1 h-5 w-5 rounded-full bg-[#f4c025] border-2 border-white flex items-center justify-center text-[10px] font-bold text-[#1c180d]">
                {selectedFlavorIds.length}
              </div>
            </div>
            <div className="flex flex-col">
              <span className="text-sm font-extrabold leading-none text-[#1c180d]">{selectedFlavorIds.length} Flavors</span>
              <span className="text-[10px] font-bold uppercase tracking-wider text-[#1c180d]/50">Ready to Go</span>
            </div>
          </div>

          <button
            onClick={proceedToEventBuilder}
            className="group flex h-14 items-center justify-center rounded-full bg-[#f4c025] px-8 font-bold text-[#1c180d] shadow-lg shadow-[#f4c025]/30 transition-transform hover:brightness-110 active:scale-95"
          >
            Build Event
            <ArrowRight className="ml-2 group-hover:translate-x-1 transition-transform" strokeWidth={3} size={20} />
          </button>
        </div>
      </footer>

      {/* iOS Home Indicator Mockup (Hidden on desktop if desired, but kept for consistency) */}
      <div className="fixed bottom-1 left-1/2 h-1 w-32 -translate-x-1/2 rounded-full bg-black/10 z-[60] md:hidden"></div>
    </div>
  );
}
