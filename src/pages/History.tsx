import { Link } from "react-router-dom";
import { usePageMeta } from "@/lib/meta";
import { watchHistory } from "@/data/viewer";
import { streamerByHandle } from "@/data/streamers";
import { PageHeader, StreamThumb } from "@/components/xp";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";

export default function History() {
  usePageMeta("Watch history");
  return (
    <div className="mx-auto max-w-[1280px] px-4 py-8 md:px-8">
      <PageHeader title="Watch history" description="Pick up where you left off." actions={<Button variant="secondary" size="sm">Clear history</Button>} />
      <div className="mt-6 grid grid-cols-1 gap-x-4 gap-y-6 sm:grid-cols-2 lg:grid-cols-3">
        {watchHistory.map((w) => {
          const s = streamerByHandle(w.handle)!;
          return (
            <Link key={w.handle + w.when} to={`/${w.handle}`} className="group">
              <StreamThumb s={{ ...s, live: true }} className="ring-1 ring-transparent group-hover:ring-neon/60"><Progress value={w.progress} className="absolute inset-x-0 bottom-0 h-1 rounded-none bg-black/50" indicatorClassName="bg-live" /></StreamThumb>
              <p className="mt-2 font-semibold group-hover:underline">{w.what}</p>
              <p className="text-sm text-muted-foreground">{s.name} · {w.when}</p>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
