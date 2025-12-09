import type { HTMLAttributes } from 'react';
import { cn } from '@/lib/utils';

interface SectionTitleProps extends HTMLAttributes<HTMLHeadingElement> {
  as?: 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6';
}

export default function SectionTitle({ as: Comp = 'h2', className, children, ...props }: SectionTitleProps) {
  return (
    <div className="text-center mb-10">
      <Comp
        className={cn(
          'font-display text-3xl md:text-5xl font-black uppercase tracking-tighter text-black',
          'bg-brand-yellow px-4 py-2 border-4 border-black shadow-[6px_6px_0px_0px_#000000] inline-block transform -rotate-1',
          className
        )}
        {...props}
      >
        {children}
      </Comp>
    </div>
  );
}