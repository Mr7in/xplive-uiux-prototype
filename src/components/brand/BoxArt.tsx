import * as React from "react";
import { boxArtUrl, type Category } from "@/data/categories";
import { CoverArt } from "./CoverArt";
import { cn } from "@/lib/utils";

/**
 * Real category art from the image CDN, with generated CoverArt as the fallback
 * (no art for the category, offline, or blocked by a sandbox CSP).
 */
export function BoxArt({ c, className, imgClassName, position = "50% 30%", seed = 0, size = [285, 380], dim }: {
  c: Category; className?: string; imgClassName?: string; position?: string; seed?: number; size?: [number, number]; dim?: boolean;
}) {
  const src = boxArtUrl(c, size[0], size[1]);
  const [failed, setFailed] = React.useState(false);
  return (
    <span className={cn("relative block h-full w-full overflow-hidden", className)}>
      {src && !failed ? (
        <img src={src} alt="" loading="lazy" decoding="async" onError={() => setFailed(true)} className={cn("h-full w-full object-cover", dim && "opacity-50 grayscale", imgClassName)} style={{ objectPosition: position }} />
      ) : (
        <CoverArt motif={c.motif} ground={c.ground} accent={c.accent} seed={seed} className={cn(dim && "opacity-50 grayscale", imgClassName)} />
      )}
    </span>
  );
}
