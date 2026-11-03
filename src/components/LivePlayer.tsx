import * as React from "react";
import { cn } from "@/lib/utils";
import { frameUrl, startAt, videoFor } from "@/data/videos";
import type { Streamer } from "@/data/streamers";
import { StreamThumb } from "@/components/xp";

/**
 * Mock live video. Plays the channel's footage through the YouTube embed
 * (muted autoplay, no YouTube chrome, our own controls) on top of the
 * thumbnail frame. If the embed can't load (offline, blocked by a sandbox,
 * autoplay refused), the still frame stays, so the layout never breaks.
 *
 * Production: replace the iframe with the HLS player (hls.js / Video.js)
 * and keep the same props + control handle.
 */
export interface PlayerHandle { play(): void; pause(): void; mute(): void; unmute(): void; setVolume(v: number): void }

interface Props {
  s: Streamer;
  className?: string;
  /** Start muted (browsers only allow muted autoplay). */
  muted?: boolean;
  /** Extra zoom to push YouTube's watermark and title bar out of frame. */
  zoom?: number;
  children?: React.ReactNode;
  onPlaying?: (playing: boolean) => void;
}

let uid = 0;

export const LivePlayer = React.forwardRef<PlayerHandle, Props>(function LivePlayer({ s, className, muted = true, zoom = 1.12, children, onPlaying }, ref) {
  const vid = s.live ? videoFor(s.handle) : undefined;
  const frame = React.useRef<HTMLIFrameElement>(null);
  const [visible, setVisible] = React.useState(false);
  const id = React.useMemo(() => ++uid, []);
  const start = React.useMemo(() => startAt(s.handle, s.startedMinsAgo), [s.handle, s.startedMinsAgo]);

  const send = React.useCallback((func: string, args: unknown[] = []) => {
    frame.current?.contentWindow?.postMessage(JSON.stringify({ event: "command", func, args, id, channel: "widget" }), "*");
  }, [id]);

  React.useImperativeHandle(ref, () => ({
    play: () => send("playVideo"),
    pause: () => send("pauseVideo"),
    mute: () => send("mute"),
    unmute: () => { send("unMute"); send("setVolume", [80]); },
    setVolume: (v: number) => send("setVolume", [v]),
  }), [send]);

  React.useEffect(() => {
    setVisible(false);
    if (!vid) return;
    let shownAt: number | undefined;
    const onMsg = (e: MessageEvent) => {
      if (!frame.current || e.source !== frame.current.contentWindow) return;
      let d: { event?: string; info?: { playerState?: number } } | undefined;
      try { d = typeof e.data === "string" ? JSON.parse(e.data) : e.data; } catch { return; }
      const state = d?.info?.playerState;
      if (state === 1) {
        onPlaying?.(true);
        // Wait out YouTube's title bar fade before revealing the video.
        if (!shownAt) shownAt = window.setTimeout(() => setVisible(true), 900);
      } else if (state === 2) onPlaying?.(false);
    };
    window.addEventListener("message", onMsg);
    return () => { window.removeEventListener("message", onMsg); if (shownAt) clearTimeout(shownAt); };
  }, [vid, onPlaying]);

  const listen = () => {
    // Ask the embed to stream state events to us (YouTube IFrame API protocol).
    const ping = () => frame.current?.contentWindow?.postMessage(JSON.stringify({ event: "listening", id, channel: "widget" }), "*");
    ping();
    window.setTimeout(ping, 500);
    window.setTimeout(ping, 1500);
    if (muted) send("mute");
  };

  const params = vid && new URLSearchParams({
    autoplay: "1", mute: "1", controls: "0", disablekb: "1", fs: "0", iv_load_policy: "3", modestbranding: "1",
    playsinline: "1", rel: "0", loop: "1", playlist: vid.id, start: String(start), enablejsapi: "1",
    ...(location.protocol.startsWith("http") ? { origin: location.origin } : {}),
  });

  return (
    <StreamThumb s={s} className={cn("bg-black", className)}>
      {vid && (
        <span className={cn("absolute inset-0 overflow-hidden transition-opacity duration-700", visible ? "opacity-100" : "opacity-0")} aria-hidden={!visible}>
          <iframe
            ref={frame}
            key={vid.id + s.handle}
            title={`${s.name} live video`}
            src={`https://www.youtube-nocookie.com/embed/${vid.id}?${params}`}
            allow="autoplay; encrypted-media; picture-in-picture"
            referrerPolicy="strict-origin-when-cross-origin"
            onLoad={listen}
            tabIndex={-1}
            className="pointer-events-none absolute left-1/2 top-1/2 aspect-video w-full border-0"
            style={{ transform: `translate(-50%, -50%) scale(${zoom})` }}
          />
        </span>
      )}
      {children}
    </StreamThumb>
  );
});

/** Poster URL for places that need just the still. */
export const posterFor = (handle: string) => frameUrl(handle);
