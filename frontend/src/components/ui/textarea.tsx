import * as React from 'react'
import { cn } from '@/lib/utils'

export interface TextareaProps
  extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {}

const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ className, ...props }, ref) => {
    return (
      <textarea
        className={cn(
          'flex w-full rounded-md border border-[color:var(--color-edge)] bg-transparent px-3 py-2 text-sm font-mono transition-colors',
          'placeholder:text-[color:var(--color-text-dim)]',
          'focus-visible:outline-none focus-visible:border-[color:var(--color-edge-glow)]',
          'disabled:cursor-not-allowed disabled:opacity-50',
          'min-h-[90px] resize-y',
          className,
        )}
        ref={ref}
        {...props}
      />
    )
  },
)
Textarea.displayName = 'Textarea'

export { Textarea }
