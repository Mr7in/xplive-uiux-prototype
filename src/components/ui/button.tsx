import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

/* balz.tv buttons: one filled (lime) button per view; everything else outlined or text.
   YES/NO are outlined lime/coral with YES/NO ink text. Destructive actions are outlined ink, never coral. */
const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-lg text-[15px] font-semibold transition-[color,background-color,border-color,filter] duration-150 ease-out focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background disabled:pointer-events-none disabled:opacity-45 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0",
  {
    variants: {
      variant: {
        default: "border border-lime bg-lime font-bold text-lime-ink hover:brightness-105",
        secondary: "border border-border bg-transparent text-foreground hover:border-muted-foreground",
        outline: "border border-border bg-transparent text-foreground hover:border-muted-foreground",
        ghost: "text-label hover:bg-secondary hover:text-foreground",
        destructive: "border border-foreground bg-transparent text-foreground hover:bg-secondary",
        "destructive-outline": "border border-border bg-transparent text-foreground hover:border-foreground",
        yes: "border border-yes-fill bg-transparent text-yes hover:bg-yes-tint",
        no: "border border-no-fill bg-transparent text-no hover:bg-no-tint",
        link: "text-foreground underline-offset-4 hover:underline px-0",
      },
      size: {
        default: "h-11 px-4",
        sm: "h-9 px-3 text-[13px]",
        lg: "h-12 px-6 text-base",
        icon: "h-10 w-10",
        "icon-sm": "h-8 w-8",
      },
    },
    defaultVariants: { variant: "default", size: "default" },
  }
);

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement>, VariantProps<typeof buttonVariants> {
  asChild?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(({ className, variant, size, asChild = false, ...props }, ref) => {
  const Comp = asChild ? Slot : "button";
  return <Comp className={cn(buttonVariants({ variant, size, className }))} ref={ref} {...props} />;
});
Button.displayName = "Button";
export { Button, buttonVariants };
