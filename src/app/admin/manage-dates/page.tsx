
'use client';

import { useState, useEffect } from 'react';
import { useAdmin } from '@/context/AdminContext';
import { useRouter } from 'next/navigation';
import SectionTitle from '@/components/ui/SectionTitle';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Calendar } from '@/components/ui/calendar';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { getBlockedDates, blockDates, unblockDates } from './actions';
import type { BlockedDate } from '@/lib/types';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Ban, CheckCircle, Loader2, AlertTriangle, Trash2, CalendarOff } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { format } from 'date-fns';
import { Separator } from '@/components/ui/separator';

function dateToId(date: Date): string {
    const d = new Date(date);
    d.setUTCHours(0, 0, 0, 0); // Normalize to UTC midnight
    return d.toISOString().split('T')[0];
}

export default function ManageDatesPage() {
    const { isAdmin } = useAdmin();
    const router = useRouter();
    const { toast } = useToast();

    const [blockedDates, setBlockedDates] = useState<BlockedDate[]>([]);
    const [selectedDates, setSelectedDates] = useState<Date[] | undefined>([]);
    const [reason, setReason] = useState('');
    const [isLoading, setIsLoading] = useState(true);
    const [fetchError, setFetchError] = useState<string | null>(null);

    useEffect(() => {
        if (isAdmin === false) { // check for explicit false, as it can be undefined initially
            router.push('/admin/login');
        } else if (isAdmin === true) {
            fetchDates();
        }
    }, [isAdmin, router]);

    const fetchDates = async () => {
        setIsLoading(true);
        setFetchError(null); // Reset error on new fetch
        try {
            const dates = await getBlockedDates();
            setBlockedDates(dates);
        } catch (error: any) {
            console.error(error); // Also log it to the console
            setFetchError(error.message);
        }
        setIsLoading(false);
    };

    const handleBlockDates = async () => {
        if (!selectedDates || selectedDates.length === 0) {
            toast({ title: 'No dates selected', description: 'Please select one or more dates to block.', variant: 'destructive' });
            return;
        }
        setIsLoading(true);
        const result = await blockDates(selectedDates, reason);
        if (result.success) {
            toast({ title: 'Success', description: result.message });
            setSelectedDates([]);
            setReason('');
            await fetchDates();
        } else {
            toast({ title: 'Error', description: result.message, variant: 'destructive', duration: 15000 });
        }
        setIsLoading(false);
    };
    
    const handleUnblockDates = async () => {
        if (!selectedDates || selectedDates.length === 0) {
            toast({ title: 'No dates selected', description: 'Please select dates from the calendar to unblock.', variant: 'destructive' });
            return;
        }

        const dateIdsToUnblock = selectedDates.map(dateToId);

        setIsLoading(true);
        const result = await unblockDates(dateIdsToUnblock);
        if (result.success) {
            toast({ title: 'Success', description: result.message });
            setSelectedDates([]);
            await fetchDates();
        } else {
            toast({ title: 'Error', description: result.message, variant: 'destructive', duration: 15000 });
        }
        setIsLoading(false);
    };

    const handleUnblockSingleDate = async (dateId: string) => {
        setIsLoading(true);
        const result = await unblockDates([dateId]);
        if (result.success) {
            toast({ title: 'Success', description: result.message });
            // Also clear calendar selection if the unblocked date was selected
            setSelectedDates(prev => prev?.filter(d => dateToId(d) !== dateId));
            await fetchDates();
        } else {
            toast({ title: 'Error', description: result.message, variant: 'destructive', duration: 15000 });
        }
        setIsLoading(false);
    };

    if (isAdmin !== true) {
        return (
            <div className="flex justify-center items-center py-12 min-h-screen bg-coast-gradient">
                <Loader2 className="h-8 w-8 animate-spin text-brand-cyan" />
            </div>
        );
    }
    
    const blockedDateObjects = blockedDates.map(d => d.date);

    return (
        <div className="space-y-8 bg-coast-gradient min-h-screen -mt-4 pt-8 pb-12 px-4">
            <SectionTitle>Manage Blocked Dates</SectionTitle>
             <div className="glass-panel-static p-6 flex items-start gap-4">
                <div className="bg-brand-blue/10 p-2 rounded-full text-brand-blue">
                    <Ban className="h-5 w-5" />
                </div>
                <div>
                    <h4 className="font-display font-bold uppercase text-brand-blue text-sm mb-1">How to use this page</h4>
                    <p className="text-brand-blue/70 text-sm leading-relaxed">
                        Select dates on the calendar to block/unblock. Red dates are blocked. Use the list below to remove specific blocks.
                    </p>
                </div>
            </div>

            {fetchError && (
                <div className="bg-red-50 border border-red-200 rounded-2xl p-6 text-red-600">
                    <div className="flex items-center gap-2 font-bold mb-2">
                        <AlertTriangle className="h-5 w-5" /> Error Loading Data
                    </div>
                    <p className="text-sm">{fetchError}</p>
                </div>
            )}

            <Card className="glass-panel-static border-none">
                <CardHeader>
                    <CardTitle className="text-coast-heading text-xl">Date Selection</CardTitle>
                    <CardDescription className="text-brand-blue/60">Select dates to block or unblock.</CardDescription>
                </CardHeader>
                <CardContent className="flex flex-col md:flex-row gap-8 items-start">
                     <div className="p-4 bg-white/60 rounded-3xl border border-brand-blue/5 shadow-sm">
                         <Calendar
                            mode="multiple"
                            selected={selectedDates}
                            onSelect={setSelectedDates}
                            disabled={isLoading || !!fetchError}
                            modifiers={{ blocked: blockedDateObjects }}
                            modifiersStyles={{
                                blocked: {
                                    color: 'white',
                                    backgroundColor: '#ef4444', // Red-500
                                    opacity: 1,
                                    borderRadius: '100%',
                                }
                            }}
                            className="rounded-md"
                            classNames={{
                                head_cell: "text-brand-blue font-bold uppercase text-xs pt-4",
                                cell: "h-9 w-9 text-center text-sm p-0 relative [&:has([aria-selected])]:bg-brand-cyan/10 first:[&:has([aria-selected])]:rounded-l-md last:[&:has([aria-selected])]:rounded-r-md focus-within:relative focus-within:z-20",
                                day: "h-9 w-9 p-0 font-normal aria-selected:opacity-100 hover:bg-brand-cyan/20 hover:font-bold hover:rounded-full transition-all text-brand-blue",
                                day_selected: "bg-brand-cyan text-brand-blue font-bold rounded-full shadow-lg shadow-cyan-500/30",
                                day_today: "bg-gray-100 text-brand-blue font-bold rounded-full",
                            }}
                        />
                     </div>
                    <div className="space-y-4 flex-grow w-full">
                        <div>
                            <Label htmlFor="reason" className="font-display font-bold uppercase text-brand-blue text-sm ml-1">Reason (Optional)</Label>
                            <Input 
                                id="reason" 
                                value={reason} 
                                onChange={(e) => setReason(e.target.value)} 
                                placeholder="e.g., Public Holiday"
                                disabled={isLoading || !!fetchError}
                                className="input-coast h-12 mt-1"
                            />
                        </div>
                        <Button onClick={handleBlockDates} className="w-full btn-coast-primary h-12 shadow-md" disabled={isLoading || !selectedDates?.length || !!fetchError}>
                            {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Ban className="mr-2 h-4 w-4" />}
                            Block Selected
                        </Button>
                        <Button onClick={handleUnblockDates} variant="outline" className="w-full rounded-full border-brand-blue/20 text-brand-blue hover:bg-white h-12 font-bold uppercase" disabled={isLoading || !selectedDates?.length || !!fetchError}>
                            {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <CheckCircle className="mr-2 h-4 w-4" />}
                            Unblock Selected
                        </Button>
                    </div>
                </CardContent>
            </Card>

            <Separator className="bg-brand-blue/10" />

            <Card className="glass-panel-static border-none">
                <CardHeader>
                    <CardTitle className="text-coast-heading text-xl flex items-center gap-2"><CalendarOff className="h-5 w-5"/> Currently Blocked</CardTitle>
                </CardHeader>
                <CardContent>
                    {blockedDates.length > 0 ? (
                        <ul className="space-y-2 max-h-96 overflow-y-auto pr-2 custom-scrollbar">
                            {blockedDates.sort((a, b) => a.date.getTime() - b.date.getTime()).map((blockedDate) => (
                                <li key={blockedDate.id} className="flex items-center justify-between p-4 rounded-2xl bg-white/40 border border-brand-blue/5 hover:bg-white/60 transition-colors">
                                    <div>
                                        <p className="font-bold text-brand-blue">{format(blockedDate.date, "PPP")}</p>
                                        <p className="text-xs text-brand-blue/60 uppercase tracking-wide">{blockedDate.reason || "No reason"}</p>
                                    </div>
                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        onClick={() => handleUnblockSingleDate(blockedDate.id)}
                                        disabled={isLoading}
                                        className="text-red-400 hover:text-red-600 hover:bg-red-50 rounded-full"
                                    >
                                        <Trash2 className="h-4 w-4" />
                                    </Button>
                                </li>
                            ))}
                        </ul>
                    ) : (
                        <p className="text-brand-blue/40 font-medium text-center py-8">No dates are currently blocked.</p>
                    )}
                </CardContent>
            </Card>

        </div>
    );
}
