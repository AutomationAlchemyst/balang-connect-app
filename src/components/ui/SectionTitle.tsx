import type { HTMLAttributes } from 'react';
import { cn } from '@/lib/utils';

interface SectionTitleProps extends HTMLAttributes<HTMLHeadingElement> {
  as?: 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6';
}

export default function SectionTitle({ as: Comp = 'h2', className, children, ...props }: SectionTitleProps) {
  return (
    <Comp
      className={cn('font-headline text-3xl md:text-4xl font-bold text-primary mb-6 tracking-tight text-center', className)}
      {...props}
    >
      {children}
    </Comp>
  );
}
