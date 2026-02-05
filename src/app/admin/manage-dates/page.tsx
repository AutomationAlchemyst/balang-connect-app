
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
import { Ban, CheckCircle, Loader2, AlertTriangle, Trash2, CalendarOff, Info } from 'lucide-react';
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
        if (isAdmin === false) {
            router.push('/admin/login');
        } else if (isAdmin === true) {
            fetchDates();
        }
    }, [isAdmin, router]);

    const fetchDates = async () => {
        setIsLoading(true);
        setFetchError(null);
        try {
            const dates = await getBlockedDates();
            setBlockedDates(dates);
        } catch (error: any) {
            console.error(error);
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
            setSelectedDates(prev => prev?.filter(d => dateToId(d) !== dateId));
            await fetchDates();
        } else {
            toast({ title: 'Error', description: result.message, variant: 'destructive', duration: 15000 });
        }
        setIsLoading(false);
    };

    if (isAdmin !== true) {
        return (
            <div className="flex justify-center items-center py-12 min-h-screen bg-slate-50">
                <Loader2 className="h-8 w-8 animate-spin text-[#0df2df]" />
            </div>
        );
    }

    const blockedDateObjects = blockedDates.map(d => d.date);

    return (
        <div className="relative min-h-screen bg-slate-50 selection:bg-[#0df2df]/20 selection:text-[#041F1C] pb-24 overflow-x-hidden pt-20">
            {/* Background Decor */}
            <div className="fixed inset-0 z-0 pointer-events-none">
                <div className="absolute top-[-10%] right-[-5%] w-[600px] h-[600px] bg-[#0df2df]/10 rounded-full blur-[120px] animate-pulse" />
                <div className="absolute top-[20%] left-[-10%] w-[500px] h-[500px] bg-[#0bc9b9]/10 rounded-full blur-[100px] animate-blob" />
            </div>

            <div className="container mx-auto px-4 relative z-10 space-y-12">
                <div className="flex flex-col md:flex-row justify-between items-end gap-6 mb-12">
                    <div className="space-y-4">
                        <div className="inline-flex items-center gap-2 bg-white/60 backdrop-blur-xl px-4 py-1.5 rounded-full border border-white/60 shadow-sm">
                            <span className="flex h-2 w-2 relative">
                                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#ef4444] opacity-75"></span>
                                <span className="relative inline-flex rounded-full h-2 w-2 bg-[#ef4444]"></span>
                            </span>
                            <span className="font-black text-[10px] uppercase tracking-[0.2em] text-[#041F1C]">Admin Controls</span>
                        </div>
                        <h1 className="text-5xl md:text-7xl font-black uppercase text-[#041F1C] tracking-tighter leading-none">
                            Manage <br />
                            <span className="breezy-text-gradient italic">Blocked Dates</span>
                        </h1>
                    </div>

                    <div className="breezy-glass-static p-6 flex items-start gap-4 max-w-md shadow-lg">
                        <div className="bg-[#0df2df]/20 p-2.5 rounded-xl text-[#09a093] shrink-0">
                            <Info className="h-5 w-5" strokeWidth={3} />
                        </div>
                        <div>
                            <h4 className="font-black uppercase text-[#041F1C] text-xs tracking-wider mb-1">Quick Guide</h4>
                            <p className="text-[#041F1C]/60 text-xs font-bold leading-relaxed">
                                Select dates on the calendar to block/unblock. Red dates are fully blocked for all bookings.
                            </p>
                        </div>
                    </div>
                </div>

                {fetchError && (
                    <div className="bg-red-50 border-2 border-red-100 rounded-[2rem] p-8 flex items-center gap-6 animate-in fade-in slide-in-from-top-4">
                        <div className="bg-red-100 p-4 rounded-2xl text-red-600">
                            <AlertTriangle className="h-8 w-8" />
                        </div>
                        <div>
                            <h4 className="font-black text-[#041F1C] uppercase tracking-tight text-lg">Error Loading Data</h4>
                            <p className="text-[#041F1C]/60 font-bold">{fetchError}</p>
                        </div>
                    </div>
                )}

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
                    <Card className="lg:col-span-7 breezy-glass-static border-0 overflow-hidden shadow-2xl">
                        <CardHeader className="p-8 border-b border-white/40">
                            <CardTitle className="text-2xl font-black uppercase tracking-tight text-[#041F1C] flex items-center gap-3">
                                <CalendarOff className="h-6 w-6 text-[#09a093]" />
                                Date Selection
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="p-8 flex flex-col md:flex-row gap-12 items-start">
                            <div className="p-6 bg-white/60 rounded-[2.5rem] border border-white/80 shadow-inner group">
                                <Calendar
                                    mode="multiple"
                                    selected={selectedDates}
                                    onSelect={setSelectedDates}
                                    disabled={isLoading || !!fetchError}
                                    modifiers={{ blocked: blockedDateObjects }}
                                    modifiersStyles={{
                                        blocked: {
                                            color: 'white',
                                            backgroundColor: '#ef4444',
                                            opacity: 1,
                                            borderRadius: '1.25rem',
                                            fontWeight: '900'
                                        }
                                    }}
                                    className="rounded-md"
                                    classNames={{
                                        head_cell: "text-[#041F1C]/40 font-black uppercase text-[10px] tracking-widest pt-4 pb-2",
                                        cell: "h-12 w-12 text-center text-sm p-0.5 relative",
                                        day: "h-11 w-11 p-0 font-bold text-[#041F1C]/70 hover:bg-[#0df2df]/20 hover:text-[#041F1C] hover:rounded-2xl transition-all duration-300",
                                        day_selected: "bg-[#0df2df] text-[#041F1C] font-black rounded-2xl shadow-lg shadow-[#0df2df]/20",
                                        day_today: "bg-slate-100 text-[#041F1C] font-black rounded-2xl border-2 border-white",
                                    }}
                                />
                            </div>
                            <div className="space-y-8 flex-grow w-full">
                                <div className="space-y-3">
                                    <Label htmlFor="reason" className="font-black uppercase text-[#041F1C]/40 text-xs tracking-[0.2em] ml-2">Reason (Optional)</Label>
                                    <Input
                                        id="reason"
                                        value={reason}
                                        onChange={(e) => setReason(e.target.value)}
                                        placeholder="e.g., Public Holiday"
                                        disabled={isLoading || !!fetchError}
                                        className="breezy-input h-14"
                                    />
                                </div>
                                <div className="grid grid-cols-1 gap-4 pt-4">
                                    <Button
                                        onClick={handleBlockDates}
                                        className="w-full breezy-btn-primary h-14 text-lg"
                                        disabled={isLoading || !selectedDates?.length || !!fetchError}
                                    >
                                        {isLoading ? <Loader2 className="mr-2 h-5 w-5 animate-spin" /> : <Ban className="mr-2 h-5 w-5" strokeWidth={3} />}
                                        Block Dates
                                    </Button>
                                    <Button
                                        onClick={handleUnblockDates}
                                        variant="outline"
                                        className="w-full h-14 rounded-2xl border-white bg-white/40 hover:bg-white text-[#041F1C] font-black uppercase tracking-widest transition-all duration-300"
                                        disabled={isLoading || !selectedDates?.length || !!fetchError}
                                    >
                                        {isLoading ? <Loader2 className="mr-2 h-5 w-5 animate-spin" /> : <CheckCircle className="mr-2 h-5 w-5" strokeWidth={3} />}
                                        Restore Dates
                                    </Button>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="lg:col-span-5 breezy-glass-static border-0 overflow-hidden shadow-2xl lg:sticky lg:top-32">
                        <CardHeader className="p-8 border-b border-white/40 bg-white/20">
                            <CardTitle className="text-2xl font-black uppercase tracking-tight text-[#041F1C] flex items-center gap-3">
                                <Trash2 className="h-6 w-6 text-[#ef4444]" />
                                Blocked List
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="p-4">
                            {blockedDates.length > 0 ? (
                                <ul className="space-y-3 max-h-[500px] overflow-y-auto p-4 custom-scrollbar">
                                    {blockedDates.sort((a, b) => a.date.getTime() - b.date.getTime()).map((blockedDate) => (
                                        <li key={blockedDate.id} className="group flex items-center justify-between p-5 rounded-[1.5rem] bg-white/40 border border-white/60 hover:bg-white/80 transition-all duration-500 hover:shadow-lg hover:-translate-y-1">
                                            <div className="space-y-1">
                                                <p className="font-black text-[#041F1C] tracking-tight">{format(blockedDate.date, "PPP")}</p>
                                                <p className="text-[10px] text-[#041F1C]/40 font-black uppercase tracking-[0.2em]">{blockedDate.reason || "General Closure"}</p>
                                            </div>
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                onClick={() => handleUnblockSingleDate(blockedDate.id)}
                                                disabled={isLoading}
                                                className="bg-red-50 text-red-500 hover:bg-red-500 hover:text-white rounded-xl transition-all duration-300"
                                            >
                                                <Trash2 className="h-4 w-4" strokeWidth={3} />
                                            </Button>
                                        </li>
                                    ))}
                                </ul>
                            ) : (
                                <div className="text-center py-20 animate-pulse">
                                    <div className="bg-[#0df2df]/10 p-6 rounded-full inline-block mb-4">
                                        <Calendar className="h-10 w-10 text-[#09a093]" />
                                    </div>
                                    <p className="text-[#041F1C]/30 font-black uppercase tracking-widest text-sm">No Active Blocks</p>
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    );
}
