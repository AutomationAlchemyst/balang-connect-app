'use client';

import { useState, useEffect } from 'react';

interface TimeLeft {
    days: number;
    hours: number;
    minutes: number;
    seconds: number;
}

interface CountdownTimerProps {
    targetDate: string;
    variant?: 'featured' | 'flash';
}

export function CountdownTimer({ targetDate, variant = 'featured' }: CountdownTimerProps) {
    const [timeLeft, setTimeLeft] = useState<TimeLeft | null>(null);

    useEffect(() => {
        const calculateTimeLeft = () => {
            const difference = +new Date(targetDate) - +new Date();
            let timeLeft: TimeLeft | null = null;

            if (difference > 0) {
                timeLeft = {
                    days: Math.floor(difference / (1000 * 60 * 60 * 24)),
                    hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
                    minutes: Math.floor((difference / 1000 / 60) % 60),
                    seconds: Math.floor((difference / 1000) % 60),
                };
            }

            return timeLeft;
        };

        const timer = setInterval(() => {
            setTimeLeft(calculateTimeLeft());
        }, 1000);

        setTimeLeft(calculateTimeLeft());

        return () => clearInterval(timer);
    }, [targetDate]);

    if (!timeLeft) return null;

    const bgClass = variant === 'featured'
        ? "bg-slate-100 dark:bg-slate-900/50"
        : "bg-orange-500/10 border border-orange-500/20";

    const textClass = variant === 'featured' ? "text-primary" : "text-orange-600";
    const sizeClass = variant === 'featured' ? "h-12" : "h-10";

    return (
        <div className="flex gap-2">
            <TimerBlock value={timeLeft.days} label="Days" bg={bgClass} text={textClass} size={sizeClass} />
            <TimerBlock value={timeLeft.hours} label="Hrs" bg={bgClass} text={textClass} size={sizeClass} />
            <TimerBlock value={timeLeft.minutes} label="Mins" bg={bgClass} text={textClass} size={sizeClass} />
            {variant === 'flash' && (
                <TimerBlock value={timeLeft.seconds} label="Sec" bg={bgClass} text={textClass} size={sizeClass} />
            )}
        </div>
    );
}

function TimerBlock({ value, label, bg, text, size }: { value: number, label: string, bg: string, text: string, size: string }) {
    return (
        <div className="flex grow basis-0 flex-col items-stretch gap-1">
            <div className={`flex ${size} grow items-center justify-center rounded-xl px-2 ${bg}`}>
                <p className={`text-lg font-extrabold ${text}`}>
                    {value.toString().padStart(2, '0')}
                </p>
            </div>
            <div className="flex items-center justify-center">
                <p className="text-[10px] font-bold uppercase opacity-40">{label}</p>
            </div>
        </div>
    );
}
