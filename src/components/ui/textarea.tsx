import * as React from 'react';

import {cn} from '@/lib/utils';

const Textarea = React.forwardRef<HTMLTextAreaElement, React.ComponentProps<'textarea'>>(
  ({className, ...props}, ref) => {
    return (
      <textarea
        className={cn(
          "flex min-h-[120px] w-full rounded-none border-2 border-black bg-white px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-0 focus-visible:border-black shadow-[4px_4px_0px_0px_#000000] focus:translate-x-[2px] focus:translate-y-[2px] focus:shadow-none transition-all disabled:cursor-not-allowed disabled:opacity-50 font-body font-medium",
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