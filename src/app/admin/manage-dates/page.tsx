
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
            <div className="flex justify-center items-center py-12">
                <Loader2 className="h-8 w-8 animate-spin" />
            </div>
        );
    }
    
    const blockedDateObjects = blockedDates.map(d => d.date);

    return (
        <div className="space-y-8">
            <SectionTitle>Manage Blocked Dates</SectionTitle>
             <Alert>
                <Ban className="h-4 w-4" />
                <AlertTitle>How to use this page</AlertTitle>
                <AlertDescription>
                    Select one or more dates on the calendar below. Blocked dates will appear in red. You can select existing red dates to unblock them, or select available dates to block them. Use the buttons to confirm your action. You can also manage all blocked dates in the list view at the bottom.
                </AlertDescription>
            </Alert>

            {fetchError && (
                <Alert variant="destructive">
                    <AlertTriangle className="h-4 w-4" />
                    <AlertTitle>Error Loading Data</AlertTitle>
                    <AlertDescription>
                        <p className="mb-2">There was a problem fetching the blocked dates from your Firestore database.</p>
                        <pre className="mt-2 whitespace-pre-wrap rounded-md bg-destructive/10 p-4 font-mono text-xs text-destructive-foreground">
                            {fetchError}
                        </pre>
                    </AlertDescription>
                </Alert>
            )}

            <Card>
                <CardHeader>
                    <CardTitle>Date Selection</CardTitle>
                    <CardDescription>Select dates to block or unblock. Currently blocked dates are highlighted.</CardDescription>
                </CardHeader>
                <CardContent className="flex flex-col md:flex-row gap-8 items-start">
                     <Calendar
                        mode="multiple"
                        selected={selectedDates}
                        onSelect={setSelectedDates}
                        disabled={isLoading || !!fetchError}
                        modifiers={{ blocked: blockedDateObjects }}
                        modifiersStyles={{
                            blocked: {
                                color: 'hsl(var(--destructive-foreground))',
                                backgroundColor: 'hsl(var(--destructive))',
                                opacity: 1,
                            }
                        }}
                        className="rounded-md border"
                    />
                    <div className="space-y-4 flex-grow w-full">
                        <div>
                            <Label htmlFor="reason">Reason for Blocking (Optional)</Label>
                            <Input 
                                id="reason" 
                                value={reason} 
                                onChange={(e) => setReason(e.target.value)} 
                                placeholder="e.g., Public Holiday, Fully Booked"
                                disabled={isLoading || !!fetchError}
                            />
                        </div>
                        <Button onClick={handleBlockDates} className="w-full" disabled={isLoading || !selectedDates?.length || !!fetchError}>
                            {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Ban className="mr-2 h-4 w-4" />}
                            Block Selected Dates
                        </Button>
                        <Button onClick={handleUnblockDates} variant="outline" className="w-full" disabled={isLoading || !selectedDates?.length || !!fetchError}>
                            {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <CheckCircle className="mr-2 h-4 w-4" />}
                            Unblock Selected Dates
                        </Button>
                    </div>
                </CardContent>
            </Card>

            <Separator />

            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center"><CalendarOff className="mr-2 h-6 w-6"/>Currently Blocked Dates</CardTitle>
                    <CardDescription>A list of all dates currently blocked in the system. Unblock them individually here.</CardDescription>
                </CardHeader>
                <CardContent>
                    {blockedDates.length > 0 ? (
                        <ul className="space-y-2 max-h-96 overflow-y-auto pr-2">
                            {blockedDates.sort((a, b) => a.date.getTime() - b.date.getTime()).map((blockedDate) => (
                                <li key={blockedDate.id} className="flex items-center justify-between p-3 border rounded-md bg-secondary/30 hover:bg-secondary/50">
                                    <div>
                                        <p className="font-semibold text-primary">{format(blockedDate.date, "PPP")}</p>
                                        <p className="text-sm text-muted-foreground">{blockedDate.reason || "No reason provided"}</p>
                                    </div>
                                    <Button
                                        variant="destructive"
                                        size="sm"
                                        onClick={() => handleUnblockSingleDate(blockedDate.id)}
                                        disabled={isLoading}
                                        aria-label={`Unblock ${format(blockedDate.date, "PPP")}`}
                                    >
                                        <Trash2 className="mr-2 h-4 w-4" />
                                        Unblock
                                    </Button>
                                </li>
                            ))}
                        </ul>
                    ) : (
                        <p className="text-muted-foreground text-center py-4">No dates are currently blocked.</p>
                    )}
                </CardContent>
            </Card>

        </div>
    );
}
