# xp.live web · developer handoff

Front-end for the three xp.live roles (viewer, creator, admin), built with React 18, TypeScript, Vite, Tailwind CSS and shadcn/ui. Everything runs on mock data so the UI can be reviewed and wired to the real API screen by screen.

## Run it

```bash
npm install
npm run dev            # http://localhost:5173
npm run build          # production build in dist/
npm run build:preview  # one self-contained HTML file in dist-preview/ (used for the hosted preview)
```

Test accounts (any password of 6+ characters works in the mock):

| Role    | Email                     |
|---------|---------------------------|
| Viewer  | test.viewer@xplive.com    |
| Creator | test.streamer@xplive.com (owns the channel Nordic Slots God) |
| Creator | test.marble@xplive.com (owns Marble Rally, has an open question) |
| Admin   | test.admin@xplive.com     |

## Brand (xp.live CVI · Midnight Contrast)

Tokens live in `src/index.css` (shadcn HSL variables) and `tailwind.config.js` (named brand colours).

| Token | Hex | Use |
|---|---|---|
| background | `#0a0a0a` | page (iteration 2: neutral ground) |
| surface / card | `#131313` | cards, panels |
| surface-2 | `#1c1c1c` | raised, inputs on cards |
| border | `#292929` | dividers |
| neon (primary) | `#c8ff00` | primary actions, focus ring, active nav |
| yes | `#34edc5` (CVI cyan) | YES side everywhere (text darkens to `#097c65` in light mode) |
| no | `#a78bfa` (CVI violet) | NO side everywhere (text `#6a44de` in light mode) |
| live | `#ff4d6d` (CVI coral) | LIVE badges, live dot |
| foreground | `#ffffff` | text |
| label / muted | `#b4b4b4` / `#949494` | secondary / meta text (AA on all surfaces) |

YES/NO are cyan and violet rather than green/red so they stay distinguishable for colour-blind viewers and never collide with the coral LIVE badge. They always carry a text label too.

Light and dark mode: tokens are CSS variables in `src/index.css` (`:root` = light, `.dark` = dark). `src/lib/theme.tsx` holds the toggle (Light / Dark / Match my device, saved per browser); the inline script in `index.html` applies it before first paint. Dark is the default. Brand text accents use `text-neon` (lime in dark, olive `#4a6600` in light for contrast); lime fills use `bg-lime` with `text-lime-ink`. The logo `p` switches to the CVI light-mode violet.

Fonts: Outfit for everything, Space Mono only for figures and hashes. Loaded from Google Fonts in `index.html`.

Logo: `src/components/brand/Logo.tsx` (`Logo` wordmark, `LogoMark` app icon). Favicons, app icons and the link-preview image are in `public/`. Source HTML for the icon and OG image is in `brand/`.

## Money and chain

- Predictions, tips, subscriptions and creator payouts are all in **USDC on Polygon**. Dev/staging uses **Polygon Amoy testnet** (chain 80002); production uses Polygon PoS (chain 137). Config: `src/lib/chain.ts`, switch with `VITE_CHAIN=polygon`.
- Every prediction is an on-chain transaction: it shows as *confirming* until the chain confirms, then the pool updates. Failed answers show as “Not placed, nothing left your balance”. Every row links to the transaction on Polygonscan.
- Wallet (`/wallet`): USDC balance, Add funds, Withdraw, payout address, predictions, transactions, tips.
  - **Add funds** (`components/WalletDialogs.tsx`): *Connect wallet* (MetaMask, Coinbase Wallet, Rabby, WalletConnect → amount → confirm in wallet → confirmations progress) or *Send manually* (deposit address + QR, network warning, token contract, “I’ve sent it”, recent deposits). Testnet faucet: 10.00 test USDC once a day, hidden on mainnet.
  - **Payout address**: add or use the connected wallet, verify by signing a message, 72-hour hold on replacement.
  - **Withdraw**: verified address only, minimum 5.00 USDC, manual review above 1,000.00 USDC.
- Wire-up: replace the mocked `connectWallet` / `depositFromWallet` / `withdraw` / `predict` in `lib/store.tsx` with wagmi + viem (or your wallet SDK) and your settlement contract calls.

## Images

- Category box art and stream thumbnails load from the Twitch/IGDB image CDN (`static-cdn.jtvnw.net/ttv-boxart/<id>-<w>x<h>.jpg`), the same source xplive.dev uses today. Ids are in `data/categories.ts` (`boxArt`). Check the image licence terms for production use, or swap in your own art.
- Slots has no art on that CDN, so it uses the generated `CoverArt` fallback. Any image that fails to load falls back the same way.
- **Live video (mock):** every channel plays real footage for its category through a YouTube embed (`components/LivePlayer.tsx`, ids in `data/videos.ts`). It autoplays muted with YouTube's own UI hidden; our controls (play/pause, unmute) talk to it over the IFrame API `postMessage` protocol. The video fades in only once it is actually playing, so a blocked or failed embed simply leaves the still frame.
  - Used on: channel player, home featured stream, category page hero (background video), Studio stream preview, and hover previews on stream cards (after ~0.65 s dwell, desktop only).
  - All 40 ids were tested to play inside an embed. Gambling uploads are often age-restricted (embed error 150), so test any replacement.
  - Production: swap the iframe for your HLS player (hls.js / Video.js) and keep the `PlayerHandle` API.
- **Stream thumbnails** are auto-generated frames from those videos (`i.ytimg.com/vi/<id>/hq1|hq2|hq3.jpg`, 25 / 50 / 75 % in), so they look like live preview frames. Past broadcasts and clips use different frames. Falls back to box art, then generated art. Production: live preview frames from the media service.
- The mock footage is credited in the player bar (“Mock footage: <uploader> via YouTube”). It is for review only; remove before launch.
- Profile pictures are DiceBear “Notionists” (CC0), generated locally from the channel handle (`lib/avatar.ts`). Use uploaded profile images in production and keep these as the default.

## Iteration 2 (Userbrain revision 1 fixes)

What changed, mapped to the brief:

- **One dataset.** `data/markets.ts` (open, awaiting, settled history, voided) + positions and ledger in `lib/store.tsx`. Every repeated figure is computed in `lib/ledger.ts`: track record, public ledger, hero proof line, winners, payout times, card market status. The opening balance (82.00 USDC) is the sum of the wallet ledger; every "back to you" is stake × the pool multiplier.
- **Trust (P0):** receipt side sheet (`components/trust.tsx`, from the position card and every wallet row); status steps Submitting > Recorded > Confirmed on Polygon (testnet); header balance animates once; transaction links open an in-prototype explorer preview (`/tx/:hash`, `pages/TxRecord.tsx`) and never a "not found" page; resolution block on every settled question (result, resolved by the creator with time, evidence frame, dispute line, payout); creator track record (channel header + Past questions); public ledger and wall of numbers on `/markets`.
- **Player:** working fullscreen and theatre mode, quality menu shows "Auto" as the only option with the reason, every channel has distinct footage of 6+ minutes with the start point leaving 6 minutes before the end.
- **Comprehension (P1):** stream cards say "Question open · closes in m:ss" or "Next question soon" (or nothing); game filter row and "Open questions only" toggle (`components/LiveGrid.tsx`); channel rail tabs Live question / Past questions / Chat with a designed empty state; itemised ticket with flashing estimate and "was" value; a ticket whose question closes stays, read-only; `/how-it-works` page.
- **Demo loop:** other viewers keep joining open questions (pools and estimates move). A question that closes during the demo is resolved by its creator 40 s later and paid 5 s after that, so a tester can follow one prediction from ticket to "back to you". Iron Ines closes about 40 s after load: good for testing the closed-ticket state.
- **Design rules:** neutral black ground, Outfit everywhere (Space Mono for figures), lime only on the primary action, the user's own position and positive figures; no gradients, glass or uppercase eyebrows on viewer screens; header nav Browse / Predictions / How it works; outlined Log in beside filled Sign up; full-screen phone menu.

## Streamer companion app

Second-screen controls for the streamer who asked the question, so they can run it from a phone, tablet or second monitor while the game is full screen.

- **Link per channel:** `/control/:handle` (hosted: `ui.xplive.site/#/control/nordic-slots-god`). Only the channel owner's credentials unlock it; any other account gets "This account doesn't own <channel>". Production: `xp.live/control/<handle>` with BrowserRouter.
- **Screens** (`pages/companion/Companion.tsx`): login, Ask (saved quick questions, write a new one, 1/2/5/10 min), Live (big countdown, pools, +30s / +1m / +5m, hold to close, void), Results (big YES / NO hold buttons with pool and viewer counts, auto-clipped evidence, void with reason, auto-void countdown), Recent results, lock screen.
- **Safety:** settle, void and close need a press and hold (Short / Normal / Long, per device). When a question closes the phone vibrates and jumps to Results. Screen Wake Lock keeps the screen on. Desktop hotkeys: hold Y / N to settle the oldest question, C to close.
- **Phone:** tabs Ask/Live, Results, Recent. **Tablet / monitor (768 px and up):** Live and Results side by side.
- **Studio > Companion app** (`pages/studio/Companion.tsx`): link with copy and QR, logged-in devices with log out, quick question editor (feeds the companion), "Built for mid-game" notes. A promo strip links to it from the Live dashboard and Predictions.
- **Sync:** question actions (create, close, extend, settle, void, saved questions) go through `sync()` in `lib/store.tsx` and are mirrored to every open tab with `BroadcastChannel`, so Studio in one window and the companion in another stay in step. Swap for the realtime API.

## Auto-clipped evidence

The creator only says whether it happened. xp.live makes the evidence clip itself.

- **Flow:** hold YES or NO (companion Results, or Studio › Propose result → Confirm) → modal *"Please wait while the evidence clip is created"* (`components/EvidenceClip.tsx`): stream preview with scan line, progress bar with seconds left, steps *Scanning the stream (opened → tap) > Found the moment > Cutting the clip > Attaching it to your result*. When it's ready the result posts with the clip attached. *Stop, don't settle yet* (or X / Esc) cancels and leaves the question waiting; nothing is settled. Void never waits for a clip.
- **Tied to the question length** (`lib/autoclip.ts`, `clipPlan`). Extensions (+30s / +1m / +5m) count towards the length.

  | Open for | Clip | Wait (demo) |
  |---|---|---|
  | up to 1 min | 30 s | ~6 s |
  | up to 2 min | 45 s | ~9 s |
  | up to 5 min | 90 s | ~14 s |
  | up to 10 min | 2 min | ~20 s |
  | longer | 3 min | ~28 s |

- **Data:** `Market.durationSec`, `Market.openedAt`, `Market.clip` (`moment`, `start`, `end`, `sec`, `scannedFrom`, `scannedTo`). `proposeResult(id, result, note, clip)` stores the clip and sets `clipAt` to the moment; it syncs to other tabs like every other question action.
- **Viewers:** the resolution block shows *Watch 45 s clip at 1:10:38*; the evidence dialog says it was clipped automatically and shows the range. Demo auto-resolved questions get clips too. Older seed results keep their single frame.
- Manual evidence type and "Mark now" are gone from the companion and Studio.

## Placeholder register

Search the code for `PLACEHOLDER:` to find each one.

| Placeholder in the mock | Where | Real system it stands for |
|---|---|---|
| Mock dataset (channels, questions, positions, wallet) | `data/*`, `lib/store.tsx` | Platform API and database |
| Channel footage (YouTube embeds) | `data/videos.ts`, `components/LivePlayer.tsx` | Live stream ingest and player (Mux / HLS) |
| Market state per channel (open / soon / none) | `lib/ledger.ts` `channelState` | Creator question lifecycle |
| Pool movement and payout estimates | `lib/store.tsx` tick effect | Pool pricing engine, updated as stakes arrive |
| Submitting > Recorded > Confirmed | `lib/store.tsx` `predict` | Transaction submission and chain confirmation events |
| Tx hashes and explorer preview page | `pages/TxRecord.tsx`, `TxLink` | Real hashes on Polygon Amoy, linked to amoy.polygonscan.com (only hashes that exist) |
| Resolution block, evidence frame | `components/trust.tsx` | Creator resolution flow with evidence capture from the stream |
| Dispute line (2 h window, 5 USDC bond) | `lib/ledger.ts` `disputeLine` | Dispute rule and flow (rule still to be decided) |
| Creator track record | `lib/ledger.ts` `trackRecord` | Aggregates from settled questions |
| Public ledger, hero proof line | `lib/ledger.ts` `ledgerStats` | Aggregates from settled questions and payouts |
| Auto-resolution of questions closing in the demo | `lib/store.tsx` | Creator resolution in Studio |
| "How payouts work" copy | `pages/HowItWorks.tsx` | Final approved copy for custody, withdrawals, resolution |
| Notify me toast | `pages/Channel.tsx` | Notification service (push or email) |
| Wallet balance | `lib/store.tsx` | Balance from chain or custodial ledger |
| Cross-tab question sync (BroadcastChannel) | `lib/store.tsx` `sync` | Realtime channel (WebSocket / SSE) for creator actions |
| Companion quick questions, devices | `data/companion.ts` | Saved questions API, companion sessions from the auth service |
| Auto-clipper (scan, moment detection, clip render, wait times) | `lib/autoclip.ts`, `components/EvidenceClip.tsx` | Clip service on the stream DVR/VOD: progress events, detected moment, clip URL on the media CDN; failure/retry state still to design |
| Companion owner check | `pages/companion/Companion.tsx` | Auth scoped to the channel (owner, later mods) |

## Structure

```
src/
  components/ui/        shadcn/ui primitives (button, card, dialog, tabs, table, select…)
  components/brand/     Logo, CoverArt (generated placeholder art for categories/thumbnails)
  components/xp.tsx     product components: StreamCard, CategoryCard, MarketCard, SplitBar, Stat…
  components/PredictPanel.tsx   the YES/NO prediction slip (viewer)
  components/auth.tsx   login/sign-up dialog, useRequireAuth guard
  components/Inbox.tsx, SupportCenter.tsx   shared by viewer and creator
  layouts/              SiteLayout (viewer), ConsoleLayout (shared shell), StudioLayout, AdminLayout
  pages/                viewer pages
  pages/studio/         Creator Studio
  pages/admin/          Admin console
  data/                 mock data: 20 categories, 40 streamers, 30 markets, studio + admin fixtures
  lib/store.tsx         in-memory app state + actions (replace with API calls / React Query)
  lib/meta.ts           per-page title + link-preview tags
```

## Mock data

- 20 categories (`data/categories.ts`): 11 games, 3 casino, 4 IRL, 2 sports.
- 40 streamers (`data/streamers.ts`), exactly 2 per category, with bio, schedule, language, followers, live status.
- 30 markets (`data/markets.ts`), one per streamer for 30 of the 40:
  - 10 open (voting active, live countdown that closes them automatically),
  - 5 awaiting result (closed, creator must propose the outcome),
  - 10 settled (one has an open dispute for the admin review flow),
  - 5 voided (with reasons).

## Routes

Viewer: `/`, `/browse`, `/how-it-works`, `/tx/:hash` (explorer preview), `/category/:slug`, `/markets`, `/:handle` (channel + predict + chat), `/following`, `/wallet`, `/notifications`, `/messages`, `/settings`, `/search`, `/support`, `/history`, `/legal/:doc`, `/login`, `/signup`.

Companion: `/control/:handle`.

Creator Studio (`/studio`): live dashboard, stream setup, predictions, companion app, propose result (`/studio/predictions/:id/result`), past streams, clips, analytics, activity feed, alerts, channel points, raids, hype trains, subscriptions, followers, moderators, bans, AutoMod, chat commands, chat triggers, emotes, badges, earnings & payouts, sponsorships, channel settings, messages, support.

Admin (`/admin`): overview, all questions, question review/dispute decision (`/admin/markets/:id`), disputes, platform controls, referral programme, reports, sanctions, appeals, emote review, badge review, users, user detail, channels, reserved handles, categories, payouts, deposit & withdrawal issues, revenue splits, limits & fees, treasury & on-chain, support queue, audit log, stream health.

## Product rules encoded in the UI

- Questions have exactly two outcomes, YES and NO. There is no outcome text field (`AskQuestion` in `pages/studio/Predictions.tsx`).
- One open question per channel at a time.
- Creators propose results with buttons, not dropdowns: YES / NO / Void, then evidence or a void reason, then a confirm dialog.
- Unresolved questions auto-void after 60 minutes (shown to creators and admins).
- Viewers can dispute within 2 hours; disputes hold payouts until an admin decides (uphold, overturn, void) with a mandatory reason.
- Every irreversible admin action asks for a reason that goes to the audit log (`ReasonDialog`).
- Predictions, tips, subscriptions and payouts use USDC on Polygon (Amoy testnet in dev). Predictions are 18+.
- Chat text is sanitised (`sanitizeChat` strips Zalgo marks and caps length) and clamped (`.chat-safe`) so it can’t break layout.

## Wiring to the backend

1. Replace `lib/store.tsx` actions with API calls (React Query or similar). The action names map 1:1 to endpoints: `predict`, `createMarket`, `closeMarket`, `extendMarket`, `proposeResult`, `adminDecide`, `toggleFollow`, `signIn`, `signOut`.
2. Replace `data/*` imports with queries. Types (`Market`, `Streamer`, `Category`) are the contract the components expect.
3. Swap `CoverArt` thumbnails for live thumbnails / box art from the media service; keep `CoverArt` as the fallback.
4. Swap `HashRouter` for `BrowserRouter` and serve `index.html` for unknown paths.
5. Link previews: `usePageMeta` updates tags client-side. Crawlers don’t run JS, so render `og:title`, `og:description` and `og:image` server-side per route (channel pages should use the channel name and live title). `public/og-image.png` is the default image.
6. Countdown timers are client-side for the mock; drive them from server `closesAt` timestamps in production.
