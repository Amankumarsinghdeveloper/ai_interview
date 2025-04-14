import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap text-sm font-medium transition-all duration-200 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg:not([class*='size-'])]:size-4 shrink-0 [&_svg]:shrink-0 outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-primary-200/50",
  {
    variants: {
      variant: {
        default:
          "bg-primary-200 text-white shadow-md shadow-primary-200/20 hover:bg-primary-200/90",
        destructive:
          "bg-destructive-100 text-white shadow-md shadow-destructive-100/20 hover:bg-destructive-100/90 focus-visible:ring-destructive-100/30",
        outline:
          "border border-light-800/20 bg-dark-200 shadow-sm hover:bg-dark-300 text-light-100",
        secondary:
          "bg-dark-200 text-light-100 shadow-md shadow-dark-300/10 border border-light-800/20 hover:bg-dark-300",
        ghost: "hover:bg-dark-300/50 text-light-100",
        link: "text-primary-200 underline-offset-4 hover:underline",
      },
      size: {
        default: "h-10 px-6 py-2.5 rounded-full",
        sm: "h-9 rounded-full gap-1.5 px-4",
        lg: "h-12 rounded-full px-8 text-base",
        icon: "h-10 w-10 rounded-full",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
);

function Button({
  className,
  variant,
  size,
  asChild = false,
  ...props
}: React.ComponentProps<"button"> &
  VariantProps<typeof buttonVariants> & {
    asChild?: boolean;
  }) {
  const Comp = asChild ? Slot : "button";

  return (
    <Comp
      data-slot="button"
      className={cn(buttonVariants({ variant, size, className }))}
      {...props}
    />
  );
}

export { Button, buttonVariants };
