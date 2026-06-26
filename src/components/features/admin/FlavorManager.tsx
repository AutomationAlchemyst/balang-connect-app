'use client';

import { useState, useEffect } from 'react';
import { useAdmin } from '@/context/AdminContext';
import { fetchFlavors } from '@/lib/actions/data-actions';
import { createFlavor, updateFlavor, deleteFlavor } from '@/app/admin/actions';
import type { Flavor } from '@/lib/types';
import { useToast } from '@/hooks/use-toast';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Loader2, Plus, Search, Edit2, Trash2, Image as ImageIcon, Tag, Palette, Sparkles } from 'lucide-react';

export default function FlavorManager() {
  const { user } = useAdmin();
  const { toast } = useToast();

  const [flavors, setFlavors] = useState<Flavor[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingFlavor, setEditingFlavor] = useState<Flavor | null>(null);

  // Form State
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [pricePerLiter, setPricePerLiter] = useState(5.00);
  const [tags, setTags] = useState('');
  const [color, setColor] = useState('bg-yellow-400');
  const [dataAiHint, setDataAiHint] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    loadFlavors();
  }, []);

  const loadFlavors = async () => {
    setIsLoading(true);
    try {
      const data = await fetchFlavors();
      setFlavors(data);
    } catch (error) {
      console.error(error);
      toast({ title: 'Error', description: 'Failed to load flavors.', variant: 'destructive' });
    } finally {
      setIsLoading(false);
    }
  };

  const openAddDialog = () => {
    setEditingFlavor(null);
    setName('');
    setDescription('');
    setImageUrl('https://placehold.co/300x200.png');
    setPricePerLiter(5.00);
    setTags('');
    setColor('bg-yellow-400');
    setDataAiHint('');
    setIsDialogOpen(true);
  };

  const openEditDialog = (flavor: Flavor) => {
    setEditingFlavor(flavor);
    setName(flavor.name);
    setDescription(flavor.description);
    setImageUrl(flavor.imageUrl);
    setPricePerLiter(flavor.pricePerLiter);
    setTags(flavor.tags?.join(', ') || '');
    setColor(flavor.color || 'bg-yellow-400');
    setDataAiHint(flavor.dataAiHint || '');
    setIsDialogOpen(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !description || !imageUrl) {
      toast({ title: 'Validation Error', description: 'Please fill in all required fields.', variant: 'destructive' });
      return;
    }

    setIsSaving(true);
    try {
      const token = await user?.getIdToken();
      if (!token) throw new Error('Authentication required.');

      const tagsArray = tags.split(',').map(t => t.trim()).filter(Boolean);
      const flavorData = {
        name,
        description,
        imageUrl,
        pricePerLiter: Number(pricePerLiter),
        tags: tagsArray,
        color,
        dataAiHint
      };

      if (editingFlavor) {
        const result = await updateFlavor(editingFlavor.id, flavorData, token);
        if (result.success) {
          toast({ title: 'Success', description: 'Flavor updated successfully.' });
          setIsDialogOpen(false);
          await loadFlavors();
        } else {
          toast({ title: 'Error', description: result.message, variant: 'destructive' });
        }
      } else {
        const result = await createFlavor(flavorData, token);
        if (result.success) {
          toast({ title: 'Success', description: 'Flavor created successfully.' });
          setIsDialogOpen(false);
          await loadFlavors();
        } else {
          toast({ title: 'Error', description: result.message, variant: 'destructive' });
        }
      }
    } catch (error: any) {
      toast({ title: 'Error', description: error.message || 'Failed to save flavor.', variant: 'destructive' });
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this flavor?')) return;

    setIsLoading(true);
    try {
      const token = await user?.getIdToken();
      if (!token) throw new Error('Authentication required.');

      const result = await deleteFlavor(id, token);
      if (result.success) {
        toast({ title: 'Success', description: 'Flavor deleted successfully.' });
        await loadFlavors();
      } else {
        toast({ title: 'Error', description: result.message, variant: 'destructive' });
      }
    } catch (error: any) {
      toast({ title: 'Error', description: error.message || 'Failed to delete flavor.', variant: 'destructive' });
    } finally {
      setIsLoading(false);
    }
  };

  const filteredFlavors = flavors.filter(f =>
    f.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    f.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
    f.tags?.some(t => t.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div className="space-y-1">
          <h2 className="text-3xl font-black uppercase text-[#041F1C] tracking-tighter">
            Manage <span className="breezy-text-gradient italic">Flavors</span>
          </h2>
          <p className="text-[#041F1C]/60 text-sm font-bold">
            Create, edit, or remove ice-blended air balang flavors.
          </p>
        </div>
        <Button onClick={openAddDialog} className="breezy-btn-primary flex items-center gap-2 h-12 px-6">
          <Plus size={18} strokeWidth={3} />
          Add Flavor
        </Button>
      </div>

      <div className="relative w-full max-w-md">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-[#041F1C]/45 h-5 w-5" />
        <Input
          placeholder="Search flavors by name, description, tags..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-12 bg-white/60 backdrop-blur-md border-white/80 shadow-sm rounded-xl h-12 font-bold text-[#041F1C]"
        />
      </div>

      {isLoading ? (
        <div className="flex justify-center items-center py-24">
          <Loader2 className="h-10 w-10 animate-spin text-[#0df2df]" />
        </div>
      ) : filteredFlavors.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredFlavors.map(flavor => (
            <Card key={flavor.id} className="breezy-glass-static border-0 overflow-hidden shadow-lg hover:shadow-xl transition-all duration-300 flex flex-col justify-between group">
              <div className="relative h-48 w-full bg-slate-100 overflow-hidden">
                <img
                  src={flavor.imageUrl}
                  alt={flavor.name}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  onError={(e) => {
                    (e.target as HTMLImageElement).src = 'https://placehold.co/300x200.png?text=No+Image';
                  }}
                />
                <div className="absolute top-4 right-4 flex gap-2">
                  {flavor.tags?.map((tag, idx) => (
                    <span key={idx} className="bg-white/90 backdrop-blur-sm text-[#041F1C] text-[9px] font-black uppercase tracking-wider px-2 py-1 rounded-full border border-white shadow-sm">
                      {tag}
                    </span>
                  ))}
                </div>
                <div className={`absolute bottom-0 left-0 h-2 w-full ${flavor.color || 'bg-yellow-400'}`} />
              </div>
              <CardHeader className="p-5 pb-2">
                <div className="flex justify-between items-baseline gap-2">
                  <h3 className="text-xl font-black uppercase text-[#041F1C] tracking-tight">{flavor.name}</h3>
                  <span className="text-[#09a093] font-black text-sm shrink-0">${flavor.pricePerLiter.toFixed(2)}/L</span>
                </div>
                <CardDescription className="text-[#041F1C]/65 text-xs font-bold leading-relaxed line-clamp-3 mt-1.5">
                  {flavor.description}
                </CardDescription>
              </CardHeader>
              <CardContent className="p-5 pt-2 flex gap-3">
                <Button
                  onClick={() => openEditDialog(flavor)}
                  variant="outline"
                  className="flex-1 rounded-xl border-white/60 bg-white/40 hover:bg-white text-[#041F1C] font-black uppercase tracking-widest text-xs h-10 transition-colors"
                >
                  <Edit2 size={14} className="mr-1.5" strokeWidth={3} />
                  Edit
                </Button>
                <Button
                  onClick={() => handleDelete(flavor.id)}
                  variant="ghost"
                  className="bg-red-50 text-red-500 hover:bg-red-500 hover:text-white rounded-xl h-10 px-4 transition-colors"
                >
                  <Trash2 size={14} strokeWidth={3} />
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <div className="text-center py-20 bg-white/40 rounded-3xl border border-white/60">
          <ImageIcon className="h-12 w-12 text-[#041F1C]/20 mx-auto mb-3" />
          <p className="text-[#041F1C]/40 font-black uppercase tracking-widest text-sm">No Flavors Found</p>
        </div>
      )}

      {/* Add/Edit Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-lg bg-[#fdfaf5] dark:bg-[#1a2e2d] border-none shadow-2xl rounded-3xl">
          <form onSubmit={handleSave} className="space-y-6">
            <DialogHeader>
              <DialogTitle className="text-2xl font-black uppercase text-[#041F1C] tracking-tighter">
                {editingFlavor ? 'Edit' : 'Add New'} <span className="italic breezy-text-gradient">Flavor</span>
              </DialogTitle>
              <DialogDescription className="text-xs uppercase font-black text-[#041F1C]/40 tracking-wider">
                Provide the details of the ice blended flavor option
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="flavor-name" className="font-bold text-[#041F1C]">Flavor Name *</Label>
                  <Input
                    id="flavor-name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="e.g. Lemon Mint Asamboi"
                    className="breezy-input"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="price" className="font-bold text-[#041F1C]">Price Per Liter ($) *</Label>
                  <Input
                    id="price"
                    type="number"
                    step="0.01"
                    value={pricePerLiter}
                    onChange={(e) => setPricePerLiter(Number(e.target.value))}
                    placeholder="5.00"
                    className="breezy-input"
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="description" className="font-bold text-[#041F1C]">Description *</Label>
                <Textarea
                  id="description"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Detail the ingredients, taste profile, and characteristics of the flavor."
                  className="breezy-input min-h-[80px]"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="image-url" className="font-bold text-[#041F1C]">Image URL *</Label>
                <Input
                  id="image-url"
                  value={imageUrl}
                  onChange={(e) => setImageUrl(e.target.value)}
                  placeholder="e.g. https://images.unsplash.com/..."
                  className="breezy-input"
                  required
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="color-class" className="font-bold text-[#041F1C] flex items-center gap-1.5">
                    <Palette size={14} className="text-[#09a093]" />
                    UI Color Class
                  </Label>
                  <Input
                    id="color-class"
                    value={color}
                    onChange={(e) => setColor(e.target.value)}
                    placeholder="e.g. bg-yellow-400"
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
                    placeholder="e.g. lemon citrus mint"
                    className="breezy-input"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="tags" className="font-bold text-[#041F1C] flex items-center gap-1.5">
                  <Tag size={14} className="text-[#09a093]" />
                  Tags (Comma separated)
                </Label>
                <Input
                  id="tags"
                  value={tags}
                  onChange={(e) => setTags(e.target.value)}
                  placeholder="e.g. Best Seller, Non Milk Base"
                  className="breezy-input"
                />
              </div>
            </div>

            <DialogFooter className="gap-2 md:gap-0">
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
                Save Flavor
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
