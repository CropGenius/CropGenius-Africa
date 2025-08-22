
import React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const liquidButtonVariants = cva(
  "relative inline-flex items-center justify-center rounded-2xl font-semibold transition-all duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 overflow-hidden",
  {
    variants: {
      variant: {
        default: "bg-primary text-primary-foreground shadow hover:bg-primary/90",
        cool: "bg-gradient-to-r from-cyan-500/90 via-blue-600/90 to-purple-600/90 text-white shadow-2xl backdrop-blur-md border border-white/20 hover:shadow-cyan-500/25 hover:scale-105",
        warm: "bg-gradient-to-r from-orange-500/90 via-red-500/90 to-pink-600/90 text-white shadow-2xl backdrop-blur-md border border-white/20 hover:shadow-orange-500/25 hover:scale-105",
        glass: "bg-white/10 backdrop-blur-md border border-white/20 text-white shadow-2xl hover:bg-white/20 hover:scale-105"
      },
      size: {
        default: "h-10 px-4 py-2",
        sm: "h-9 rounded-md px-3",
        lg: "h-11 rounded-md px-8",
        xl: "h-12 rounded-2xl px-10 text-lg",
        xxl: "h-14 rounded-3xl px-12 text-xl"
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
);

export interface LiquidButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof liquidButtonVariants> {
  asChild?: boolean;
}

const LiquidButton = React.forwardRef<HTMLButtonElement, LiquidButtonProps>(
  ({ className, variant, size, asChild = false, children, ...props }, ref) => {
    const Comp = asChild ? Slot : "button";
    return (
      <Comp
        className={cn(liquidButtonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      >
        <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/20 to-white/0 -skew-x-12 animate-pulse opacity-0 hover:opacity-100 transition-opacity duration-500" />
        <span className="relative z-10">{children}</span>
      </Comp>
    );
  }
);
LiquidButton.displayName = "LiquidButton";

export { LiquidButton, liquidButtonVariants };
