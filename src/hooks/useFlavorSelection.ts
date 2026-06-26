import { useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { useToast } from '@/hooks/use-toast';
import { Flavor } from '@/lib/types';

export function useFlavorSelection(flavors: Flavor[]) {
    const [selectedFlavorIds, setSelectedFlavorIds] = useState<string[]>([]);
    const router = useRouter();
    const { toast } = useToast();

    const toggleFlavorSelection = useCallback((flavorId: string) => {
        setSelectedFlavorIds((prev) => {
            if (prev.includes(flavorId)) {
                return prev.filter((id) => id !== flavorId);
            } else {
                return [...prev, flavorId];
            }
        });
    }, []);

    const proceedToEventBuilder = useCallback(() => {
        if (selectedFlavorIds.length === 0) {
            toast({
                title: 'Empty Palette!',
                description: 'Choose at least one flavor to start your coastal journey.',
                variant: 'destructive',
            });
            return;
        }
        const queryParams = new URLSearchParams();
        queryParams.append('defaultPackageId', 'pkg_opt1');
        queryParams.append('addFlavorIds', selectedFlavorIds.join(','));
        router.push(`/event-builder?${queryParams.toString()}`);
    }, [selectedFlavorIds, router, toast]);

    const filterFlavors = useCallback((categoryId: string): Flavor[] => {
        if (categoryId === 'all') return flavors;

        switch (categoryId) {
            case 'featured':
                return flavors.filter(f => f.isFeatured || f.tags?.includes('Best Seller'));
            case 'creamy':
                return flavors.filter(f => f.category === 'creamy' || f.tags?.includes('Milk Base'));
            case 'cordial':
                return flavors.filter(f => f.category === 'cordial');
            case 'tea':
                return flavors.filter(f => f.category === 'tea');
            case 'coffee':
                return flavors.filter(f => f.category === 'coffee');
            default:
                return flavors.filter(f => f.category === categoryId);
        }
    }, [flavors]);

    return {
        selectedFlavorIds,
        toggleFlavorSelection,
        proceedToEventBuilder,
        filterFlavors,
        canProceed: selectedFlavorIds.length > 0
    };
}
