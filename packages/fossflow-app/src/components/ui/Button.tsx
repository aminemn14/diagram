import * as React from 'react';
import { Slot } from '@radix-ui/react-slot';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '../../lib/utils';

const buttonVariants = cva('sd-button', {
  variants: {
    variant: {
      default: 'sd-button--default',
      secondary: 'sd-button--secondary',
      outline: 'sd-button--outline',
      ghost: 'sd-button--ghost'
    },
    size: {
      sm: 'sd-button--sm',
      icon: 'sd-button--icon'
    }
  },
  defaultVariants: {
    variant: 'default',
    size: 'sm'
  }
});

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : 'button';

    return (
      <Comp
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    );
  }
);

Button.displayName = 'Button';
