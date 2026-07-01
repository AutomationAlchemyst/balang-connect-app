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
          'font-display text-3xl md:text-5xl font-black uppercase tracking-tighter text-[#041F1C]',
          'inline-block',
          className
        )}
        {...props}
      >
        {children}
      </Comp>
    </div>
  );
}