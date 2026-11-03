import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const badgeVariants = cva(
  "inline-flex items-center gap-1 rounded-md px-2 py-0.5 text-xs font-semibold whitespace-nowrap",
  {
    variants: {
      variant: {
        default: "bg-secondary text-foreground",
        outline: "border border-border text-label",
        neon: "bg-neon-dim text-neon",
        live: "bg-live text-white uppercase tracking-wide font-bold",
        yes: "bg-yes-tint text-yes",
        no: "bg-no-tint text-no",
        warning: "bg-warn/15 text-warn",
        danger: "bg-coral/15 text-coral-soft",
        muted: "bg-secondary text-muted-foreground",
      },
    },
    defaultVariants: { variant: "default" },
  }
);

export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement>, VariantProps<typeof badgeVariants> {}
function Badge({ className, variant, ...props }: BadgeProps) {
  return <span className={cn(badgeVariants({ variant }), className)} {...props} />;
}
export { Badge, badgeVariants };
