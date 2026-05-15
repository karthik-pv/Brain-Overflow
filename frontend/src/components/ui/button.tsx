import * as React from 'react'
import { Slot } from '@radix-ui/react-slot'
import { cva, type VariantProps } from 'class-variance-authority'

import { cn } from '@/lib/utils'

const buttonVariants = cva(
  'inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-pixel transition-colors disabled:pointer-events-none disabled:opacity-50 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-[color:var(--color-edge-glow)] [&_svg]:size-4 [&_svg]:shrink-0',
  {
    variants: {
      variant: {
        default:
          'bg-[color:var(--color-surface)] text-[color:var(--color-text)] border border-[color:var(--color-edge)] hover:border-[color:var(--color-edge-glow)]',
        ghost: 'hover:bg-[color:var(--color-surface)] text-[color:var(--color-text-mute)] hover:text-[color:var(--color-text)]',
        outline:
          'border border-[color:var(--color-edge)] hover:border-[color:var(--color-edge-glow)] bg-transparent text-[color:var(--color-text)]',
        destructive:
          'border border-[color:var(--color-weak)]/40 text-[color:var(--color-weak)] hover:border-[color:var(--color-weak)] bg-transparent',
        link: 'text-[color:var(--color-text)] underline-offset-4 hover:underline',
      },
      size: {
        default: 'h-9 px-4 py-2',
        sm: 'h-8 rounded-md px-3 text-xs',
        lg: 'h-11 rounded-md px-6',
        icon: 'h-9 w-9',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'default',
    },
  },
)

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : 'button'
    return (
      <Comp
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    )
  },
)
Button.displayName = 'Button'

export { Button, buttonVariants }
