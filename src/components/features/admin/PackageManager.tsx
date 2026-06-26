'use client';

import { useState, useEffect } from 'react';
import { useAdmin } from '@/context/AdminContext';
import { fetchPackages } from '@/lib/actions/data-actions';
import { createPackage, updatePackage, deletePackage } from '@/app/admin/actions';
import type { EventPackage } from '@/lib/types';
import { useToast } from '@/hooks/use-toast';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Loader2, Plus, Search, Edit2, Trash2, Package, Check, Sparkles, Layers } from 'lucide-react';

export default function PackageManager() {
  const { user } = useAdmin();
  const { toast } = useToast();

  const [packages, setPackages] = useState<EventPackage[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingPackage, setEditingPackage] = useState<EventPackage | null>(null);

  // Form State
  const [packageType, setPackageType] = useState<'regular' | 'corporate'>('regular');
  const [customKey, setCustomKey] = useState('');
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [price, setPrice] = useState(100);
  const [setupFee, setSetupFee] = useState(0);
  const [isAllInclusive, setIsAllInclusive] = useState(false);
  const [includedItems, setIncludedItems] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [pax, setPax] = useState('');
  const [dataAiHint, setDataAiHint] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    loadPackages();
  }, []);

  const loadPackages = async () => {
    setIsLoading(true);
    try {
      const data = await fetchPackages();
      setPackages(data);
    } catch (error) {
      console.error(error);
      toast({ title: 'Error', description: 'Failed to load packages.', variant: 'destructive' });
    } finally {
      setIsLoading(false);
    }
  };

  const openAddDialog = () => {
    setEditingPackage(null);
    setPackageType('regular');
    setCustomKey('');
    setName('');
    setDescription('');
    setPrice(100);
    setSetupFee(0);
    setIsAllInclusive(false);
    setIncludedItems('');
    setImageUrl('https://placehold.co/400x250.png');
    setPax('');
    setDataAiHint('');
    setIsDialogOpen(true);
  };

  const openEditDialog = (pkg: EventPackage) => {
    setEditingPackage(pkg);
    const isCorp = pkg.id.startsWith('corp_') || pkg.id === 'pkg_17l_self_pickup';
    setPackageType(isCorp ? 'corporate' : 'regular');
    setName(pkg.name);
    setDescription(pkg.description);
    setPrice(pkg.price);
    setSetupFee(pkg.setupFee);
    setIsAllInclusive(pkg.isAllInclusive || false);
    setIncludedItems(pkg.includedItems.join('\n'));
    setImageUrl(pkg.imageUrl);
    setPax(pkg.pax || '');
    setDataAiHint(pkg.dataAiHint || '');
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

      const itemsArray = includedItems.split('\n').map(i => i.trim()).filter(Boolean);
      const packageData: any = {
        name,
        description,
        price: Number(price),
        setupFee: Number(setupFee),
        isAllInclusive,
        includedItems: itemsArray,
        imageUrl,
        pax,
        dataAiHint
      };

      if (editingPackage) {
        const result = await updatePackage(editingPackage.id, packageData, token);
        if (result.success) {
          toast({ title: 'Success', description: 'Package updated successfully.' });
          setIsDialogOpen(false);
          await loadPackages();
        } else {
          toast({ title: 'Error', description: result.message, variant: 'destructive' });
        }
      } else {
        // Enforce prefixing for package ID matching
        const prefix = packageType === 'corporate' ? 'corp_' : 'pkg_';
        const key = customKey.trim().toLowerCase().replace(/[^a-z0-9_]/g, '_');
        const generatedId = key ? `${prefix}${key}` : `${prefix}${Date.now()}`;

        // Verify ID uniqueness
        if (packages.some(p => p.id === generatedId)) {
          throw new Error(`A package with ID "${generatedId}" already exists. Please choose a different unique key.`);
        }

        packageData.customId = generatedId;
        const result = await createPackage(packageData, token);
        if (result.success) {
          toast({ title: 'Success', description: 'Package created successfully.' });
          setIsDialogOpen(false);
          await loadPackages();
        } else {
          toast({ title: 'Error', description: result.message, variant: 'destructive' });
        }
      }
    } catch (error: any) {
      toast({ title: 'Error', description: error.message || 'Failed to save package.', variant: 'destructive' });
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this package?')) return;

    setIsLoading(true);
    try {
      const token = await user?.getIdToken();
      if (!token) throw new Error('Authentication required.');

      const result = await deletePackage(id, token);
      if (result.success) {
        toast({ title: 'Success', description: 'Package deleted successfully.' });
        await loadPackages();
      } else {
        toast({ title: 'Error', description: result.message, variant: 'destructive' });
      }
    } catch (error: any) {
      toast({ title: 'Error', description: error.message || 'Failed to delete package.', variant: 'destructive' });
    } finally {
      setIsLoading(false);
    }
  };

  const filteredPackages = packages.filter(p =>
    p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    p.description.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const regularPackages = filteredPackages.filter(p => !p.id.startsWith('corp_') && p.id !== 'pkg_17l_self_pickup');
  const corporatePackages = filteredPackages.filter(p => p.id.startsWith('corp_') || p.id === 'pkg_17l_self_pickup');

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div className="space-y-1">
          <h2 className="text-3xl font-black uppercase text-[#041F1C] tracking-tighter">
            Manage <span className="breezy-text-gradient italic">Packages</span>
          </h2>
          <p className="text-[#041F1C]/60 text-sm font-bold">
            Create, edit, or remove event and corporate packages.
          </p>
        </div>
        <Button onClick={openAddDialog} className="breezy-btn-primary flex items-center gap-2 h-12 px-6">
          <Plus size={18} strokeWidth={3} />
          Add Package
        </Button>
      </div>

      <div className="relative w-full max-w-md">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-[#041F1C]/45 h-5 w-5" />
        <Input
          placeholder="Search packages by name or description..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-12 bg-white/60 backdrop-blur-md border-white/80 shadow-sm rounded-xl h-12 font-bold text-[#041F1C]"
        />
      </div>

      {isLoading ? (
        <div className="flex justify-center items-center py-24">
          <Loader2 className="h-10 w-10 animate-spin text-[#0df2df]" />
        </div>
      ) : (
        <div className="space-y-12">
          {/* Regular Packages Section */}
          <div className="space-y-4">
            <h3 className="text-xl font-black uppercase tracking-tight text-[#041F1C] border-b border-[#041F1C]/10 pb-2 flex items-center gap-2">
              <Layers className="text-[#09a093] h-5 w-5" />
              Regular Event Packages ({regularPackages.length})
            </h3>
            {regularPackages.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {regularPackages.map(pkg => (
                  <PackageCard key={pkg.id} pkg={pkg} onEdit={openEditDialog} onDelete={handleDelete} />
                ))}
              </div>
            ) : (
              <p className="text-[#041F1C]/40 text-sm font-bold italic pl-4">No regular packages found.</p>
            )}
          </div>

          {/* Corporate Packages Section */}
          <div className="space-y-4">
            <h3 className="text-xl font-black uppercase tracking-tight text-[#041F1C] border-b border-[#041F1C]/10 pb-2 flex items-center gap-2">
              <Package className="text-[#09a093] h-5 w-5" />
              Wedding & Corporate Packages ({corporatePackages.length})
            </h3>
            {corporatePackages.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {corporatePackages.map(pkg => (
                  <PackageCard key={pkg.id} pkg={pkg} onEdit={openEditDialog} onDelete={handleDelete} />
                ))}
              </div>
            ) : (
              <p className="text-[#041F1C]/40 text-sm font-bold italic pl-4">No corporate packages found.</p>
            )}
          </div>
        </div>
      )}

      {/* Add/Edit Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-2xl bg-[#fdfaf5] dark:bg-[#1a2e2d] border-none shadow-2xl rounded-3xl overflow-y-auto max-h-[90vh] custom-scrollbar">
          <form onSubmit={handleSave} className="space-y-6">
            <DialogHeader>
              <DialogTitle className="text-2xl font-black uppercase text-[#041F1C] tracking-tighter">
                {editingPackage ? 'Edit' : 'Add New'} <span className="italic breezy-text-gradient">Package</span>
              </DialogTitle>
              <DialogDescription className="text-xs uppercase font-black text-[#041F1C]/40 tracking-wider">
                Specify package parameters and inclusions
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4">
              {!editingPackage && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-brand-stitch-structured-primary/5 p-4 rounded-2xl border border-brand-stitch-structured-primary/10">
                  <div className="space-y-2">
                    <Label htmlFor="package-type" className="font-bold text-[#041F1C]">Package Type</Label>
                    <Select value={packageType} onValueChange={(val: 'regular' | 'corporate') => setPackageType(val)}>
                      <SelectTrigger className="breezy-input bg-white h-12">
                        <SelectValue placeholder="Select type" />
                      </SelectTrigger>
                      <SelectContent className="bg-white">
                        <SelectItem value="regular">Regular Package (pkg_ ID)</SelectItem>
                        <SelectItem value="corporate">Corporate & Wedding (corp_ ID)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="custom-key" className="font-bold text-[#041F1C]">Unique Identifier Key *</Label>
                    <Input
                      id="custom-key"
                      value={customKey}
                      onChange={(e) => setCustomKey(e.target.value)}
                      placeholder="e.g. bongo_player"
                      className="breezy-input bg-white"
                      required
                    />
                    <p className="text-[10px] text-[#041F1C]/40 font-bold italic leading-none pl-1">
                      Final ID: {packageType === 'corporate' ? 'corp_' : 'pkg_'}{customKey || 'key'}
                    </p>
                  </div>
                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="package-name" className="font-bold text-[#041F1C]">Package Name *</Label>
                  <Input
                    id="package-name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="e.g. Charlie's Angels"
                    className="breezy-input"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="pax-text" className="font-bold text-[#041F1C]">Pax Size Hint</Label>
                  <Input
                    id="pax-text"
                    value={pax}
                    onChange={(e) => setPax(e.target.value)}
                    placeholder="e.g. 60-120"
                    className="breezy-input"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="price" className="font-bold text-[#041F1C]">Base Price ($) *</Label>
                  <Input
                    id="price"
                    type="number"
                    value={price}
                    onChange={(e) => setPrice(Number(e.target.value))}
                    placeholder="235.00"
                    className="breezy-input"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="setup-fee" className="font-bold text-[#041F1C]">Setup / Teardown Component ($)</Label>
                  <Input
                    id="setup-fee"
                    type="number"
                    value={setupFee}
                    onChange={(e) => setSetupFee(Number(e.target.value))}
                    placeholder="190.00"
                    className="breezy-input"
                  />
                </div>
                <div className="space-y-2 flex flex-col justify-end pb-3 pl-2">
                  <div className="flex items-center gap-3">
                    <Checkbox
                      id="is-all-inclusive"
                      checked={isAllInclusive}
                      onCheckedChange={(checked) => setIsAllInclusive(!!checked)}
                      className="border-2 border-brand-stitch-structured-primary data-[state=checked]:bg-brand-stitch-structured-primary data-[state=checked]:text-black"
                    />
                    <Label htmlFor="is-all-inclusive" className="font-bold text-[#041F1C] cursor-pointer">
                      All-Inclusive
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
                  placeholder="Summarize package offering details for customers."
                  className="breezy-input min-h-[80px]"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="included-items" className="font-bold text-[#041F1C]">Included Items (One item per line) *</Label>
                <Textarea
                  id="included-items"
                  value={includedItems}
                  onChange={(e) => setIncludedItems(e.target.value)}
                  placeholder="e.g.&#10;2 x 23L Balangs (Choice of 2 Flavors)&#10;Setup & Teardown Service&#10;Cups provided"
                  className="breezy-input min-h-[100px]"
                  required
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                <div className="space-y-2">
                  <Label htmlFor="ai-hint" className="font-bold text-[#041F1C] flex items-center gap-1.5">
                    <Sparkles size={14} className="text-[#09a093]" />
                    AI Stylist Prompt Hint
                  </Label>
                  <Input
                    id="ai-hint"
                    value={dataAiHint}
                    onChange={(e) => setDataAiHint(e.target.value)}
                    placeholder="e.g. wedding drinks catering"
                    className="breezy-input"
                  />
                </div>
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
                Save Package
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}

function PackageCard({ pkg, onEdit, onDelete }: { pkg: EventPackage; onEdit: (pkg: EventPackage) => void; onDelete: (id: string) => void }) {
  return (
    <Card className="breezy-glass-static border-0 overflow-hidden shadow-lg hover:shadow-xl transition-all duration-300 flex flex-col justify-between group">
      <div className="relative h-44 w-full bg-slate-100 overflow-hidden">
        <img
          src={pkg.imageUrl}
          alt={pkg.name}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          onError={(e) => {
            (e.target as HTMLImageElement).src = 'https://placehold.co/400x250.png?text=No+Image';
          }}
        />
        {pkg.pax && (
          <span className="absolute top-4 right-4 bg-white/95 backdrop-blur-sm text-[#041F1C] text-[9px] font-black uppercase tracking-wider px-2.5 py-1 rounded-full border border-white shadow-sm">
            {pkg.pax} Pax
          </span>
        )}
        {pkg.isAllInclusive && (
          <span className="absolute bottom-4 left-4 bg-[#0df2df] text-[#041F1C] text-[9px] font-black uppercase tracking-wider px-2 py-0.5 rounded shadow-md border border-white/20">
            All-Inclusive
          </span>
        )}
      </div>
      <CardHeader className="p-5 pb-2">
        <div className="flex justify-between items-baseline gap-2">
          <h4 className="text-lg font-black uppercase text-[#041F1C] tracking-tight leading-tight line-clamp-1">{pkg.name}</h4>
          <span className="text-[#09a093] font-black text-base shrink-0">${pkg.price.toFixed(2)}</span>
        </div>
        <CardDescription className="text-[#041F1C]/65 text-xs font-bold leading-relaxed line-clamp-3 mt-2">
          {pkg.description}
        </CardDescription>

        <div className="mt-4 space-y-1">
          <p className="text-[9px] font-black uppercase text-[#041F1C]/40 tracking-wider">Inclusions</p>
          <ul className="space-y-0.5">
            {pkg.includedItems.slice(0, 3).map((item, idx) => (
              <li key={idx} className="text-[10px] font-bold text-[#041F1C]/75 flex items-center gap-1.5">
                <Check size={10} className="text-[#09a093]" strokeWidth={4} />
                <span className="line-clamp-1">{item}</span>
              </li>
            ))}
            {pkg.includedItems.length > 3 && (
              <li className="text-[9px] text-[#041F1C]/40 font-bold pl-4">
                + {pkg.includedItems.length - 3} more items...
              </li>
            )}
          </ul>
        </div>
      </CardHeader>
      <CardContent className="p-5 pt-3 flex gap-3">
        <Button
          onClick={() => onEdit(pkg)}
          variant="outline"
          className="flex-1 rounded-xl border-white/60 bg-white/40 hover:bg-white text-[#041F1C] font-black uppercase tracking-widest text-xs h-10 transition-colors"
        >
          <Edit2 size={14} className="mr-1.5" strokeWidth={3} />
          Edit
        </Button>
        <Button
          onClick={() => onDelete(pkg.id)}
          variant="ghost"
          className="bg-red-50 text-red-500 hover:bg-red-500 hover:text-white rounded-xl h-10 px-4 transition-colors"
        >
          <Trash2 size={14} strokeWidth={3} />
        </Button>
      </CardContent>
    </Card>
  );
}
