'use client';

import { useState, useEffect } from 'react';
import { useAdmin } from '@/context/AdminContext';
import { fetchAddons } from '@/lib/actions/data-actions';
import { createAddon, updateAddon, deleteAddon } from '@/app/admin/actions';
import type { Addon } from '@/lib/types';
import { useToast } from '@/hooks/use-toast';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Loader2, Plus, Search, Edit2, Trash2, Sliders, Droplets, Info } from 'lucide-react';

const CATEGORIES = ['Drinks', 'Food', 'Equipment', 'Services', 'Live Stations'] as const;

export default function AddonManager() {
  const { user } = useAdmin();
  const { toast } = useToast();

  const [addons, setAddons] = useState<Addon[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategoryFilter, setSelectedCategoryFilter] = useState<string>('All');
  const [isLoading, setIsLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingAddon, setEditingAddon] = useState<Addon | null>(null);

  // Form State
  const [customKey, setCustomKey] = useState('');
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [price, setPrice] = useState(10);
  const [category, setCategory] = useState<Addon['category']>('Drinks');
  const [imageUrl, setImageUrl] = useState('');
  const [requiresFlavor, setRequiresFlavor] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    loadAddons();
  }, []);

  const loadAddons = async () => {
    setIsLoading(true);
    try {
      const data = await fetchAddons();
      setAddons(data);
    } catch (error) {
      console.error(error);
      toast({ title: 'Error', description: 'Failed to load addons.', variant: 'destructive' });
    } finally {
      setIsLoading(false);
    }
  };

  const openAddDialog = () => {
    setEditingAddon(null);
    setCustomKey('');
    setName('');
    setDescription('');
    setPrice(10);
    setCategory('Drinks');
    setImageUrl('https://placehold.co/300x200.png');
    setRequiresFlavor(false);
    setIsDialogOpen(true);
  };

  const openEditDialog = (addon: Addon) => {
    setEditingAddon(addon);
    setName(addon.name);
    setDescription(addon.description);
    setPrice(addon.price);
    setCategory(addon.category);
    setImageUrl(addon.imageUrl || '');
    setRequiresFlavor(addon.requiresFlavor || false);
    setIsDialogOpen(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !description) {
      toast({ title: 'Validation Error', description: 'Please fill in all required fields.', variant: 'destructive' });
      return;
    }

    setIsSaving(true);
    try {
      const token = await user?.getIdToken();
      if (!token) throw new Error('Authentication required.');

      const addonData: any = {
        name,
        description,
        price: Number(price),
        category,
        requiresFlavor,
        ...(imageUrl && { imageUrl }),
      };

      if (editingAddon) {
        const result = await updateAddon(editingAddon.id, addonData, token);
        if (result.success) {
          toast({ title: 'Success', description: 'Addon updated successfully.' });
          setIsDialogOpen(false);
          await loadAddons();
        } else {
          toast({ title: 'Error', description: result.message, variant: 'destructive' });
        }
      } else {
        const key = customKey.trim().toLowerCase().replace(/[^a-z0-9_]/g, '_');
        const generatedId = key ? `addon_${key}` : `addon_${Date.now()}`;

        if (addons.some(a => a.id === generatedId)) {
          throw new Error(`An addon with ID "${generatedId}" already exists. Please choose a different unique key.`);
        }

        addonData.customId = generatedId;
        const result = await createAddon(addonData, token);
        if (result.success) {
          toast({ title: 'Success', description: 'Addon created successfully.' });
          setIsDialogOpen(false);
          await loadAddons();
        } else {
          toast({ title: 'Error', description: result.message, variant: 'destructive' });
        }
      }
    } catch (error: any) {
      toast({ title: 'Error', description: error.message || 'Failed to save addon.', variant: 'destructive' });
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this addon?')) return;

    setIsLoading(true);
    try {
      const token = await user?.getIdToken();
      if (!token) throw new Error('Authentication required.');

      const result = await deleteAddon(id, token);
      if (result.success) {
        toast({ title: 'Success', description: 'Addon deleted successfully.' });
        await loadAddons();
      } else {
        toast({ title: 'Error', description: result.message, variant: 'destructive' });
      }
    } catch (error: any) {
      toast({ title: 'Error', description: error.message || 'Failed to delete addon.', variant: 'destructive' });
    } finally {
      setIsLoading(false);
    }
  };

  const filteredAddons = addons.filter(addon => {
    const matchesSearch = addon.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      addon.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategoryFilter === 'All' || addon.category === selectedCategoryFilter;
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div className="space-y-1">
          <h2 className="text-3xl font-black uppercase text-[#041F1C] tracking-tighter">
            Manage <span className="breezy-text-gradient italic">Add-ons</span>
          </h2>
          <p className="text-[#041F1C]/60 text-sm font-bold">
            Create, edit, or remove optional extras, food, drinks, and service add-ons.
          </p>
        </div>
        <Button onClick={openAddDialog} className="breezy-btn-primary flex items-center gap-2 h-12 px-6">
          <Plus size={18} strokeWidth={3} />
          Add Add-on
        </Button>
      </div>

      <div className="flex flex-col md:flex-row gap-4 items-start md:items-center justify-between">
        <div className="relative w-full max-w-md">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-[#041F1C]/45 h-5 w-5" />
          <Input
            placeholder="Search add-ons by name or description..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-12 bg-white/60 backdrop-blur-md border-white/80 shadow-sm rounded-xl h-12 font-bold text-[#041F1C]"
          />
        </div>

        {/* Categories Filtering Tabs */}
        <div className="flex flex-wrap gap-2">
          {['All', ...CATEGORIES].map(cat => (
            <button
              key={cat}
              onClick={() => setSelectedCategoryFilter(cat)}
              className={`px-4 py-2 rounded-xl text-xs font-black uppercase tracking-wider border transition-all duration-300 ${
                selectedCategoryFilter === cat
                  ? 'bg-[#0df2df] border-[#0df2df] text-[#041F1C] shadow-md shadow-[#0df2df]/15'
                  : 'bg-white/40 border-white/60 hover:bg-white text-[#041F1C]/70 hover:text-[#041F1C]'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {isLoading ? (
        <div className="flex justify-center items-center py-24">
          <Loader2 className="h-10 w-10 animate-spin text-[#0df2df]" />
        </div>
      ) : filteredAddons.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredAddons.map(addon => (
            <Card key={addon.id} className="breezy-glass-static border-0 overflow-hidden shadow-lg hover:shadow-xl transition-all duration-300 flex flex-col justify-between group">
              <div className="p-6 pb-2 space-y-4">
                <div className="flex justify-between items-start gap-4">
                  <div className="space-y-1">
                    <span className="bg-[#0df2df]/20 text-[#09a093] text-[9px] font-black uppercase tracking-wider px-2 py-0.5 rounded-md">
                      {addon.category}
                    </span>
                    <h3 className="text-lg font-black uppercase text-[#041F1C] tracking-tight leading-tight mt-1 line-clamp-1">
                      {addon.name}
                    </h3>
                  </div>
                  <span className="text-[#09a093] font-black text-lg">${addon.price.toFixed(2)}</span>
                </div>
                <CardDescription className="text-[#041F1C]/65 text-xs font-bold leading-relaxed line-clamp-3">
                  {addon.description}
                </CardDescription>

                {addon.requiresFlavor && (
                  <div className="flex items-center gap-1.5 bg-yellow-50 text-yellow-700 px-2.5 py-1 rounded-lg border border-yellow-100 w-fit text-[9px] font-black uppercase tracking-wider">
                    <Droplets size={10} />
                    Requires Flavor Selection
                  </div>
                )}
              </div>
              <CardContent className="p-6 pt-3 flex gap-3 border-t border-[#041F1C]/5 bg-white/10">
                <Button
                  onClick={() => openEditDialog(addon)}
                  variant="outline"
                  className="flex-1 rounded-xl border-white/60 bg-white/40 hover:bg-white text-[#041F1C] font-black uppercase tracking-widest text-xs h-10 transition-colors"
                >
                  <Edit2 size={14} className="mr-1.5" strokeWidth={3} />
                  Edit
                </Button>
                <Button
                  onClick={() => handleDelete(addon.id)}
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
          <Sliders className="h-12 w-12 text-[#041F1C]/20 mx-auto mb-3" />
          <p className="text-[#041F1C]/40 font-black uppercase tracking-widest text-sm">No Add-ons Found</p>
        </div>
      )}

      {/* Add/Edit Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-lg bg-[#fdfaf5] dark:bg-[#1a2e2d] border-none shadow-2xl rounded-3xl">
          <form onSubmit={handleSave} className="space-y-6">
            <DialogHeader>
              <DialogTitle className="text-2xl font-black uppercase text-[#041F1C] tracking-tighter">
                {editingAddon ? 'Edit' : 'Add New'} <span className="italic breezy-text-gradient">Add-on</span>
              </DialogTitle>
              <DialogDescription className="text-xs uppercase font-black text-[#041F1C]/40 tracking-wider">
                Specify add-on properties and metadata
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4">
              {!editingAddon && (
                <div className="space-y-2 bg-brand-stitch-structured-primary/5 p-4 rounded-2xl border border-brand-stitch-structured-primary/10">
                  <Label htmlFor="custom-key" className="font-bold text-[#041F1C]">Unique Identifier Key *</Label>
                  <Input
                    id="custom-key"
                    value={customKey}
                    onChange={(e) => setCustomKey(e.target.value)}
                    placeholder="e.g. bartender_2hr"
                    className="breezy-input bg-white"
                    required
                  />
                  <p className="text-[10px] text-[#041F1C]/40 font-bold italic leading-none pl-1">
                    Final ID: addon_{customKey || 'key'}
                  </p>
                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="addon-name" className="font-bold text-[#041F1C]">Add-on Name *</Label>
                  <Input
                    id="addon-name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="e.g. Cups Upgrade"
                    className="breezy-input"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="category" className="font-bold text-[#041F1C]">Category *</Label>
                  <Select value={category} onValueChange={(val: Addon['category']) => setCategory(val)}>
                    <SelectTrigger className="breezy-input bg-white h-12">
                      <SelectValue placeholder="Select Category" />
                    </SelectTrigger>
                    <SelectContent className="bg-white">
                      {CATEGORIES.map(cat => (
                        <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="price" className="font-bold text-[#041F1C]">Price ($) *</Label>
                  <Input
                    id="price"
                    type="number"
                    step="0.01"
                    value={price}
                    onChange={(e) => setPrice(Number(e.target.value))}
                    placeholder="15.00"
                    className="breezy-input"
                    required
                  />
                </div>
                <div className="space-y-2 flex flex-col justify-end pb-3 pl-2">
                  <div className="flex items-center gap-3">
                    <Checkbox
                      id="requires-flavor"
                      checked={requiresFlavor}
                      onCheckedChange={(checked) => setRequiresFlavor(!!checked)}
                      className="border-2 border-brand-stitch-structured-primary data-[state=checked]:bg-brand-stitch-structured-primary data-[state=checked]:text-black"
                    />
                    <Label htmlFor="requires-flavor" className="font-bold text-[#041F1C] cursor-pointer flex items-center gap-1.5">
                      Requires Flavor Selection
                    </Label>
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="description" className="font-bold text-[#041F1C]">Description *</Label>
                <Textarea
                  id="description"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Detail what is included or what service is provided."
                  className="breezy-input min-h-[80px]"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="image-url" className="font-bold text-[#041F1C]">Image URL (Optional)</Label>
                <Input
                  id="image-url"
                  value={imageUrl}
                  onChange={(e) => setImageUrl(e.target.value)}
                  placeholder="e.g. https://images.unsplash.com/..."
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
                Save Add-on
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
