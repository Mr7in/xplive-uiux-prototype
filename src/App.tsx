import { HashRouter, Route, Routes } from "react-router-dom";
import { StoreProvider } from "@/lib/store";
import { AuthDialogProvider } from "@/components/auth";
import { ThemeProvider } from "@/lib/theme";
import { WalletUIProvider } from "@/components/WalletDialogs";
import { TooltipProvider } from "@/components/ui/tooltip";
import { Toaster } from "@/components/ui/sonner";
import SiteLayout from "@/layouts/SiteLayout";
import StudioLayout from "@/layouts/StudioLayout";
import AdminLayout from "@/layouts/AdminLayout";
import Home from "@/pages/Home";
import Browse from "@/pages/Browse";
import Category from "@/pages/Category";
import Markets from "@/pages/Markets";
import Channel from "@/pages/Channel";
import Following from "@/pages/Following";
import Wallet from "@/pages/Wallet";
import Notifications from "@/pages/Notifications";
import Messages from "@/pages/Messages";
import Settings from "@/pages/Settings";
import Search from "@/pages/Search";
import Support from "@/pages/Support";
import History from "@/pages/History";
import Legal from "@/pages/Legal";
import Login from "@/pages/Login";
import NotFound from "@/pages/NotFound";
import HowItWorks from "@/pages/HowItWorks";
import TxRecord from "@/pages/TxRecord";
import { ReceiptProvider } from "@/components/trust";
import StudioDashboard from "@/pages/studio/Dashboard";
import StudioPredictions from "@/pages/studio/Predictions";
import ProposeResult from "@/pages/studio/ProposeResult";
import * as S from "@/pages/studio/Tools";
import * as A from "@/pages/admin/Admin";

/**
 * HashRouter keeps the single-file preview working on any host.
 * In production switch to BrowserRouter (createBrowserRouter) and serve index.html for unknown paths.
 */
export default function App() {
  return (
    <ThemeProvider>
    <StoreProvider>
      <AuthDialogProvider>
        <TooltipProvider delayDuration={200}>
          <HashRouter>
          <WalletUIProvider>
          <ReceiptProvider>
            <Routes>
              <Route path="/login" element={<Login />} />
              <Route path="/signup" element={<Login mode="signup" />} />

              <Route path="/studio" element={<StudioLayout />}>
                <Route index element={<StudioDashboard />} />
                <Route path="stream" element={<S.StreamSetup />} />
                <Route path="predictions" element={<StudioPredictions />} />
                <Route path="predictions/:id/result" element={<ProposeResult />} />
                <Route path="content" element={<S.Content />} />
                <Route path="clips" element={<S.Clips />} />
                <Route path="analytics" element={<S.Analytics />} />
                <Route path="activity" element={<S.ActivityFeed />} />
                <Route path="alerts" element={<S.Alerts />} />
                <Route path="points" element={<S.Points />} />
                <Route path="raids" element={<S.Raids />} />
                <Route path="hype-trains" element={<S.HypeTrains />} />
                <Route path="subscriptions" element={<S.Subscriptions />} />
                <Route path="community/followers" element={<S.Followers />} />
                <Route path="community/mods" element={<S.Mods />} />
                <Route path="community/bans" element={<S.Bans />} />
                <Route path="community/automod" element={<S.AutoMod />} />
                <Route path="community/commands" element={<S.Commands />} />
                <Route path="community/triggers" element={<S.Triggers />} />
                <Route path="community/emotes" element={<S.Emotes />} />
                <Route path="community/badges" element={<S.Badges />} />
                <Route path="payouts" element={<S.Payouts />} />
                <Route path="sponsorships" element={<S.Sponsorships />} />
                <Route path="settings" element={<S.ChannelSettings />} />
                <Route path="messages" element={<S.StudioMessages />} />
                <Route path="support" element={<S.StudioSupport />} />
              </Route>

              <Route path="/admin" element={<AdminLayout />}>
                <Route index element={<A.Overview />} />
                <Route path="markets" element={<A.AdminMarkets />} />
                <Route path="markets/:id" element={<A.MarketReview />} />
                <Route path="disputes" element={<A.Disputes />} />
                <Route path="controls" element={<A.Controls />} />
                <Route path="referrals" element={<A.Referrals />} />
                <Route path="moderation/reports" element={<A.Reports />} />
                <Route path="moderation/sanctions" element={<A.Sanctions />} />
                <Route path="moderation/appeals" element={<A.Appeals />} />
                <Route path="moderation/emotes" element={<A.EmoteReview />} />
                <Route path="moderation/badges" element={<A.BadgeReview />} />
                <Route path="users" element={<A.Users />} />
                <Route path="users/:id" element={<A.UserDetail />} />
                <Route path="channels" element={<A.Channels />} />
                <Route path="handles" element={<A.Handles />} />
                <Route path="categories" element={<A.AdminCategories />} />
                <Route path="payouts" element={<A.AdminPayouts />} />
                <Route path="payments" element={<A.PaymentIssues />} />
                <Route path="revenue" element={<A.Revenue />} />
                <Route path="rewards" element={<A.Rewards />} />
                <Route path="integrity" element={<A.Integrity />} />
                <Route path="support" element={<A.SupportQueue />} />
                <Route path="audit" element={<A.Audit />} />
                <Route path="health" element={<A.Health />} />
              </Route>

              <Route element={<SiteLayout />}>
                <Route path="/" element={<Home />} />
                <Route path="/browse" element={<Browse />} />
                <Route path="/category/:slug" element={<Category />} />
                <Route path="/markets" element={<Markets />} />
                <Route path="/following" element={<Following />} />
                <Route path="/wallet" element={<Wallet />} />
                <Route path="/notifications" element={<Notifications />} />
                <Route path="/messages" element={<Messages />} />
                <Route path="/settings" element={<Settings />} />
                <Route path="/search" element={<Search />} />
                <Route path="/support" element={<Support />} />
                <Route path="/history" element={<History />} />
                <Route path="/legal/:doc" element={<Legal />} />
                <Route path="/how-it-works" element={<HowItWorks />} />
                <Route path="/tx/:hash" element={<TxRecord />} />
                <Route path="/:handle" element={<Channel />} />
                <Route path="*" element={<NotFound />} />
              </Route>
            </Routes>
          </ReceiptProvider>
          </WalletUIProvider>
          </HashRouter>
          <Toaster />
        </TooltipProvider>
      </AuthDialogProvider>
    </StoreProvider>
    </ThemeProvider>
  );
}
