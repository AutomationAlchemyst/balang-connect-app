'use client';

import { useState, useEffect } from 'react';
import { useAdmin } from '@/context/AdminContext';
import { fetchPromotions } from '@/lib/actions/data-actions';
import { createPromotion, updatePromotion, deletePromotion } from '@/app/admin/actions';
import type { Promotion } from '@/lib/types';
import { useToast } from '@/hooks/use-toast';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Loader2, Plus, Search, Edit2, Trash2, Tag, Calendar, Sparkles } from 'lucide-react';
import { format } from 'date-fns';

export default function PromotionManager() {
  const { user } = useAdmin();
  const { toast } = useToast();

  const [promotions, setPromotions] = useState<Promotion[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingPromotion, setEditingPromotion] = useState<Promotion | null>(null);

  // Form State
  const [customKey, setCustomKey] = useState('');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [endDate, setEndDate] = useState('');
  const [terms, setTerms] = useState('');
  const [dataAiHint, setDataAiHint] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    loadPromotions();
  }, []);

  const loadPromotions = async () => {
    setIsLoading(true);
    try {
      const data = await fetchPromotions();
      setPromotions(data);
    } catch (error) {
      console.error(error);
      toast({ title: 'Error', description: 'Failed to load promotions.', variant: 'destructive' });
    } finally {
      setIsLoading(false);
    }
  };

  const openAddDialog = () => {
    setEditingPromotion(null);
    setCustomKey('');
    setTitle('');
    setDescription('');
    setImageUrl('https://placehold.co/600x400.png');
    setEndDate('');
    setTerms('');
    setDataAiHint('');
    setIsDialogOpen(true);
  };

  const openEditDialog = (promo: Promotion) => {
    setEditingPromotion(promo);
    setTitle(promo.title);
    setDescription(promo.description);
    setImageUrl(promo.imageUrl);
    // Convert ISO string back to date input format (YYYY-MM-DDTHH:MM)
    if (promo.endDate) {
      try {
        const d = new Date(promo.endDate);
        setEndDate(d.toISOString().slice(0, 16));
      } catch {
        setEndDate('');
      }
    } else {
      setEndDate('');
    }
    setTerms(promo.terms || '');
    setDataAiHint(promo.dataAiHint || '');
    setIsDialogOpen(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !description || !imageUrl) {
      toast({ title: 'Validation Error', description: 'Please fill in all required fields.', variant: 'destructive' });
      return;
    }

    setIsSaving(true);
    try {
      const token = await user?.getIdToken();
      if (!token) throw new Error('Authentication required.');

      const promoData: any = {
        title,
        description,
        imageUrl,
        terms,
        dataAiHint,
        ...(endDate && { endDate: new Date(endDate).toISOString() }),
      };

      if (editingPromotion) {
        const result = await updatePromotion(editingPromotion.id, promoData, token);
        if (result.success) {
          toast({ title: 'Success', description: 'Promotion updated successfully.' });
          setIsDialogOpen(false);
          await loadPromotions();
        } else {
          toast({ title: 'Error', description: result.message, variant: 'destructive' });
        }
      } else {
        const key = customKey.trim().toLowerCase().replace(/[^a-z0-9_]/g, '_');
        const generatedId = key ? `promo-${key}` : `promo-${Date.now()}`;

        if (promotions.some(p => p.id === generatedId)) {
          throw new Error(`A promotion with ID "${generatedId}" already exists. Please choose a different unique key.`);
        }

        promoData.customId = generatedId;
        const result = await createPromotion(promoData, token);
        if (result.success) {
          toast({ title: 'Success', description: 'Promotion created successfully.' });
          setIsDialogOpen(false);
          await loadPromotions();
        } else {
          toast({ title: 'Error', description: result.message, variant: 'destructive' });
        }
      }
    } catch (error: any) {
      toast({ title: 'Error', description: error.message || 'Failed to save promotion.', variant: 'destructive' });
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this promotion?')) return;

    setIsLoading(true);
    try {
      const token = await user?.getIdToken();
      if (!token) throw new Error('Authentication required.');

      const result = await deletePromotion(id, token);
      if (result.success) {
        toast({ title: 'Success', description: 'Promotion deleted successfully.' });
        await loadPromotions();
      } else {
        toast({ title: 'Error', description: result.message, variant: 'destructive' });
      }
    } catch (error: any) {
      toast({ title: 'Error', description: error.message || 'Failed to delete promotion.', variant: 'destructive' });
    } finally {
      setIsLoading(false);
    }
  };

  const filteredPromotions = promotions.filter(p =>
    p.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    p.description.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div className="space-y-1">
          <h2 className="text-3xl font-black uppercase text-[#041F1C] tracking-tighter">
            Manage <span className="breezy-text-gradient italic">Promotions</span>
          </h2>
          <p className="text-[#041F1C]/60 text-sm font-bold">
            Create, edit, or remove seasonal deals, coupons, and notice board promotions.
          </p>
        </div>
        <Button onClick={openAddDialog} className="breezy-btn-primary flex items-center gap-2 h-12 px-6">
          <Plus size={18} strokeWidth={3} />
          Add Promotion
        </Button>
      </div>

      <div className="relative w-full max-w-md">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-[#041F1C]/45 h-5 w-5" />
        <Input
          placeholder="Search promotions by title or description..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-12 bg-white/60 backdrop-blur-md border-white/80 shadow-sm rounded-xl h-12 font-bold text-[#041F1C]"
        />
      </div>

      {isLoading ? (
        <div className="flex justify-center items-center py-24">
          <Loader2 className="h-10 w-10 animate-spin text-[#0df2df]" />
        </div>
      ) : filteredPromotions.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredPromotions.map(promo => {
            let displayDate = '';
            if (promo.endDate) {
              try {
                displayDate = format(new Date(promo.endDate), 'PPP');
              } catch {
                displayDate = 'Invalid Date';
              }
            }

            return (
              <Card key={promo.id} className="breezy-glass-static border-0 overflow-hidden shadow-lg hover:shadow-xl transition-all duration-300 flex flex-col justify-between group">
                <div className="relative h-48 w-full bg-slate-100 overflow-hidden">
                  <img
                    src={promo.imageUrl}
                    alt={promo.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = 'https://placehold.co/600x400.png?text=No+Image';
                    }}
                  />
                  {displayDate && (
                    <span className="absolute bottom-4 left-4 bg-white/95 backdrop-blur-sm text-[#041F1C] text-[9px] font-black uppercase tracking-wider px-2.5 py-1 rounded-md border border-white shadow-sm flex items-center gap-1">
                      <Calendar size={10} className="text-[#09a093]" />
                      Ends: {displayDate}
                    </span>
                  )}
                </div>
                <CardHeader className="p-5 pb-2">
                  <h3 className="text-xl font-black uppercase text-[#041F1C] tracking-tight leading-tight line-clamp-1">{promo.title}</h3>
                  <CardDescription className="text-[#041F1C]/65 text-xs font-bold leading-relaxed line-clamp-3 mt-2">
                    {promo.description}
                  </CardDescription>

                  {promo.terms && (
                    <div className="mt-4 pt-3 border-t border-[#041F1C]/5">
                      <p className="text-[9px] font-black uppercase text-[#041F1C]/40 tracking-wider">Terms & Conditions</p>
                      <p className="text-[10px] font-bold text-[#041F1C]/60 italic mt-0.5 line-clamp-2">{promo.terms}</p>
                    </div>
                  )}
                </CardHeader>
                <CardContent className="p-5 pt-3 flex gap-3">
                  <Button
                    onClick={() => openEditDialog(promo)}
                    variant="outline"
                    className="flex-1 rounded-xl border-white/60 bg-white/40 hover:bg-white text-[#041F1C] font-black uppercase tracking-widest text-xs h-10 transition-colors"
                  >
                    <Edit2 size={14} className="mr-1.5" strokeWidth={3} />
                    Edit
                  </Button>
                  <Button
                    onClick={() => handleDelete(promo.id)}
                    variant="ghost"
                    className="bg-red-50 text-red-500 hover:bg-red-500 hover:text-white rounded-xl h-10 px-4 transition-colors"
                  >
                    <Trash2 size={14} strokeWidth={3} />
                  </Button>
                </CardContent>
              </Card>
            );
          })}
        </div>
      ) : (
        <div className="text-center py-20 bg-white/40 rounded-3xl border border-white/60">
          <Tag className="h-12 w-12 text-[#041F1C]/20 mx-auto mb-3" />
          <p className="text-[#041F1C]/40 font-black uppercase tracking-widest text-sm">No Promotions Found</p>
        </div>
      )}

      {/* Add/Edit Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-lg bg-[#fdfaf5] dark:bg-[#1a2e2d] border-none shadow-2xl rounded-3xl">
          <form onSubmit={handleSave} className="space-y-6">
            <DialogHeader>
              <DialogTitle className="text-2xl font-black uppercase text-[#041F1C] tracking-tighter">
                {editingPromotion ? 'Edit' : 'Add New'} <span className="italic breezy-text-gradient">Promotion</span>
              </DialogTitle>
              <DialogDescription className="text-xs uppercase font-black text-[#041F1C]/40 tracking-wider">
                Specify promotion metadata and terms
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4">
              {!editingPromotion && (
                <div className="space-y-2 bg-brand-stitch-structured-primary/5 p-4 rounded-2xl border border-brand-stitch-structured-primary/10">
                  <Label htmlFor="custom-key" className="font-bold text-[#041F1C]">Unique Identifier Key *</Label>
                  <Input
                    id="custom-key"
                    value={customKey}
                    onChange={(e) => setCustomKey(e.target.value)}
                    placeholder="e.g. ramadan_specials"
                    className="breezy-input bg-white"
                    required
                  />
                  <p className="text-[10px] text-[#041F1C]/40 font-bold italic leading-none pl-1">
                    Final ID: promo-{customKey || 'key'}
                  </p>
                </div>
              )}

              <div className="space-y-2">
                <Label htmlFor="title" className="font-bold text-[#041F1C]">Promotion Title *</Label>
                <Input
                  id="title"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g. Ramadan Special Lucky Draw"
                  className="breezy-input"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="description" className="font-bold text-[#041F1C]">Description *</Label>
                <Textarea
                  id="description"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Summarize the details of the promotion."
                  className="breezy-input min-h-[80px]"
                  required
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="end-date" className="font-bold text-[#041F1C] flex items-center gap-1.5">
                    <Calendar size={14} className="text-[#09a093]" />
                    Expiration Date
                  </Label>
                  <Input
                    id="end-date"
                    type="datetime-local"
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                    className="breezy-input"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="ai-hint" className="font-bold text-[#041F1C] flex items-center gap-1.5">
                    <Sparkles size={14} className="text-[#09a093]" />
                    AI Stylist Prompt Hint
                  </Label>
                  <Input
                    id="ai-hint"
                    value={dataAiHint}
                    onChange={(e) => setDataAiHint(e.target.value)}
                    placeholder="e.g. ramadan celebration"
                    className="breezy-input"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="imageUrl" className="font-bold text-[#041F1C]">Image URL *</Label>
                <Input
                  id="imageUrl"
                  value={imageUrl}
                  onChange={(e) => setImageUrl(e.target.value)}
                  placeholder="e.g. https://images.unsplash.com/..."
                  className="breezy-input"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="terms" className="font-bold text-[#041F1C]">Terms & Conditions</Label>
                <Input
                  id="terms"
                  value={terms}
                  onChange={(e) => setTerms(e.target.value)}
                  placeholder="e.g. Min. order of 1 package."
                  className="breezy-input"
                />
              </div>
            </div>

            <DialogFooter className="gap-2 md:gap-0 pt-4">
              <Button
                type="button"
                variant="ghost"
                onClick={() => setIsDialogOpen(false)}
                className="rounded-xl font-bold uppercase tracking-widest text-xs h-12"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={isSaving}
                className="breezy-btn-primary h-12 rounded-xl font-bold uppercase tracking-widest text-xs"
              >
                {isSaving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                Save Promotion
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
