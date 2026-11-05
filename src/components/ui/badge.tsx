import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

/* balz.tv status pills: pale tint with same-hue text, inside rows, never as eyebrows. Sentence case. */
const badgeVariants = cva(
  "inline-flex items-center gap-1 rounded-full border px-2 text-xs font-semibold leading-5 whitespace-nowrap",
  {
    variants: {
      variant: {
        default: "border-border bg-surface-2 text-label",
        outline: "border-border bg-transparent text-label",
        neon: "border-transparent bg-lime-soft text-neon",
        live: "border-transparent bg-coral-tint text-foreground",
        yes: "border-transparent bg-yes-tint text-yes",
        no: "border-transparent bg-no-tint text-no",
        warning: "border-border bg-surface-2 text-foreground",
        danger: "border-foreground/40 bg-transparent text-foreground",
        muted: "border-border bg-surface-2 text-muted-foreground",
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
