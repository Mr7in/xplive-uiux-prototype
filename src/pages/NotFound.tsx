import { Link } from "react-router-dom";
import { usePageMeta } from "@/lib/meta";
import { Button } from "@/components/ui/button";

export default function NotFound() {
  usePageMeta("Page not found");
  return (
    <div className="mx-auto flex max-w-xl flex-col items-center gap-4 px-6 py-24 text-center">
      <p className="font-mono text-sm text-neon">404</p>
      <h1 className="font-display text-4xl font-extrabold">This channel or page doesn’t exist</h1>
      <p className="text-muted-foreground">It may have been renamed, or the link has a typo. Old channel names redirect automatically once a rename completes.</p>
      <div className="flex gap-2"><Button asChild><Link to="/">Go home</Link></Button><Button asChild variant="secondary"><Link to="/browse">Browse categories</Link></Button></div>
    </div>
  );
}
