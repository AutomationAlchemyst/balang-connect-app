import * as React from 'react';

import {cn} from '@/lib/utils';

const Textarea = React.forwardRef<HTMLTextAreaElement, React.ComponentProps<'textarea'>>(
  ({className, ...props}, ref) => {
    return (
      <textarea
        className={cn(
          "flex min-h-[120px] w-full rounded-xl border border-brand-blue/10 bg-white/50 px-4 py-3 text-sm ring-offset-background placeholder:text-brand-blue/40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-cyan/50 focus-visible:bg-white transition-all duration-300 disabled:cursor-not-allowed disabled:opacity-50 font-body font-medium text-brand-blue",
          className
        )}
        ref={ref}
        {...props}
      />
    );
  }
);
Textarea.displayName = 'Textarea';

export {Textarea};