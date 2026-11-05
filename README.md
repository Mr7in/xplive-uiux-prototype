# balz.tv web (formerly xp.live) · developer handoff

Front-end for the three balz.tv roles (viewer, creator, admin), built with React 18, TypeScript, Vite, Tailwind CSS and shadcn/ui. Everything runs on mock data so the UI can be reviewed and wired to the real API screen by screen.

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
| Admin   | test.admin@xplive.com     |

## Brand (balz.tv design system)

The UI follows the **balz.tv** design system (the Design System artifact "balz.tv": tokens, components, logo files, brand book). balz.tv is the same platform as xp.live, renamed, on the same black / lime / Outfit system.

Tokens live in `src/index.css` (shadcn HSL variables + RGB brand triplets) and `tailwind.config.js` (named brand colours, radius).

| Token | Dark (default) | Light | Use |
|---|---|---|---|
| ground (`background`) | `#000000` | `#FFFFFF` | page |
| surface (`card`) | `#111111` | `#F4F4F2` | cards, rails, header |
| surface-raised (`popover`, `surface-2`) | `#1A1A1A` | `#FFFFFF` | sheets, popovers, the prediction ticket |
| line (`border`) | `#2A2A2A` | `#DADAD5` | 1px hairlines; no shadows on resting surfaces |
| ink / ink-muted (`label`) / ink-meta (`muted-foreground`) | `#FFF` / `#B4B4B4` / `#949494` | `#0A0A0A` / `#4A4A4A` / `#5E5E5E` | text |
| lime (`primary`, `yes-fill`) | `#C8FF00` | `#C8FF00` (fill only) | the one primary action per view, the user's own position, YES |
| yes-ink (`text-yes`, `text-neon`) | `#C8FF00` | `#3F5A00` | YES text and positive figures |
| coral (`no-fill`, `live`) | `#FF4D6D` | `#FF4D6D` | NO and the live dot, nothing else |
| no-ink (`text-no`) | `#FF4D6D` | `#B4133A` | NO text |
| lime-soft / coral-soft (`yes-tint`, `no-tint`) | `#24300A` / `#3A1018` | `#EEFFB8` / `#FFE1E7` | pale pill tints, own-position row |
| violet / teal | `#7B61FF` / `#00D4AA` | same | chart series only, never chrome |

Rules encoded in the components:
- **YES is lime, NO is coral everywhere** (odds ring, odds bar, pills, ticket buttons). Coral is never used for errors: errors are plain ink text inside the block that failed.
- **One filled (lime) button per view.** The header's Log in / Sign up are outlined; the page owns the lime button (hero CTA, ticket confirm). Selected toggles use an ink fill, not lime.
- Status pills (`Badge`) are pale tint with same-hue text, `rounded-full`, sentence case. `LiveBadge` is a coral-soft pill with a coral dot pulsing at 1.6s.
- `OddsRing` (in `components/xp.tsx`) shows live odds as the logo's ring, animating over 400ms; `SplitBar` is the DS OddsBar (8px, 3px gap).
- Radius: 6px tags, 10px buttons and inputs, 16px cards / ticket / player, full for pills.
- Icons: lucide line icons at 1.75px stroke (set globally in `index.css`), `currentColor`; lime is never an icon colour.
- Motion: 150–200ms ease-out.

Light and dark mode: `:root` = light, `.dark` = dark. `src/lib/theme.tsx` holds the toggle (Light / Dark / Match my device, saved per browser); the inline script in `index.html` applies it before first paint. Dark is the default.

Fonts: Outfit for everything, Space Mono only for numbers that matter (odds, stakes, balances, payouts, countdowns, hashes). Loaded from Google Fonts in `index.html`.

Logo: `src/components/brand/Logo.tsx` (`Logo` wordmark with the fixed 62/38 odds-ring "a", letters in `currentColor`; `LogoGlyph` the "a" alone; `LogoMark` the app icon). The logo never animates in product UI and the split never changes. Favicons and app icons in `public/` are rendered from `brand/balz-app-icon.svg` / `brand/balz-favicon-square.svg` with `rsvg-convert`; the link-preview image is rendered from `brand/og.html`.

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
- Stream thumbnails reuse the category art until the media service provides live preview frames.
- Profile pictures are DiceBear “Notionists” (CC0), generated locally from the channel handle (`lib/avatar.ts`). Use uploaded profile images in production and keep these as the default.

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

Viewer: `/`, `/browse`, `/category/:slug`, `/markets`, `/:handle` (channel + predict + chat), `/following`, `/wallet`, `/notifications`, `/messages`, `/settings`, `/search`, `/support`, `/history`, `/legal/:doc`, `/login`, `/signup`.

Creator Studio (`/studio`): live dashboard, stream setup, predictions, propose result (`/studio/predictions/:id/result`), past streams, clips, analytics, activity feed, alerts, channel points, raids, hype trains, subscriptions, followers, moderators, bans, AutoMod, chat commands, chat triggers, emotes, badges, earnings & payouts, sponsorships, channel settings, messages, support.

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
