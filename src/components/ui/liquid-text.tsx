"use client";
import { useEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { cn } from "@/lib/utils";

gsap.registerPlugin(ScrollTrigger);

export const LiquidText = ({
    children,
    className,
    color = "#00E0C6",
}: {
    children: React.ReactNode;
    className?: string;
    color?: string;
}) => {
    const textRef = useRef<HTMLDivElement>(null);
    const maskRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const ctx = gsap.context(() => {
            // The fill animation linked to scroll
            gsap.fromTo(
                maskRef.current,
                { yPercent: 100 },
                {
                    yPercent: 0,
                    ease: "none",
                    scrollTrigger: {
                        trigger: textRef.current,
                        start: "top 80%",
                        end: "top 20%",
                        scrub: 1,
                    },
                }
            );
        }, textRef);
        return () => ctx.revert();
    }, []);

    return (
        <div
            ref={textRef}
            className={cn("relative inline-block overflow-hidden", className)}
        >
            {/* Background/Empty Text */}
            <div className="opacity-20 select-none">
                {children}
            </div>

            {/* Foreground/Filled Text masked */}
            <div
                className="absolute top-0 left-0 w-full h-full overflow-hidden select-none"
                style={{
                    clipPath: "inset(0 0 0 0)",
                    color: color,
                }}
            >
                <div ref={maskRef} className="absolute inset-0 bg-white/10 mix-blend-overlay pointer-events-none"></div>
                {children}
            </div>
        </div>
    );
};
