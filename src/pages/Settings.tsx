import { useSearchParams } from "react-router-dom";
import { toast } from "sonner";
import { usePageMeta } from "@/lib/meta";
import { useStore } from "@/lib/store";
import { PageHeader } from "@/components/xp";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

export function ToggleRow({ title, body, defaultChecked }: { title: string; body?: string; defaultChecked?: boolean }) {
  const id = title.replace(/\W+/g, "-").toLowerCase();
  return (
    <div className="flex items-start justify-between gap-6 border-t py-4 first:border-t-0 first:pt-0">
      <label htmlFor={id} className="min-w-0 cursor-pointer"><span className="block font-medium">{title}</span>{body && <span className="block text-sm text-muted-foreground">{body}</span>}</label>
      <Switch id={id} defaultChecked={defaultChecked} />
    </div>
  );
}

const save = () => toast.success("Saved");

export default function Settings() {
  usePageMeta("Settings");
  const { user } = useStore();
  const [params, setParams] = useSearchParams();
  const tab = params.get("tab") ?? "profile";
  return (
    <div className="mx-auto max-w-4xl px-4 py-8 md:px-8">
      <PageHeader title="Settings" />
      <Tabs value={tab} onValueChange={(v) => setParams({ tab: v })} className="mt-6">
        <TabsList>
          {[["profile", "Profile"], ["security", "Security"], ["notifications", "Notifications"], ["privacy", "Privacy"], ["limits", "Play limits"], ["chat", "Chat & viewing"]].map(([v, l]) => <TabsTrigger key={v} value={v}>{l}</TabsTrigger>)}
        </TabsList>
        <TabsContent value="profile" className="space-y-5">
          <Card>
            <CardHeader><CardTitle>Profile</CardTitle><CardDescription>How you appear in chat and on your profile.</CardDescription></CardHeader>
            <CardContent className="grid gap-4">
              <div className="grid gap-2 sm:grid-cols-2 sm:gap-4">
                <div className="grid gap-2"><Label htmlFor="dn">Display name</Label><Input id="dn" defaultValue={user?.name} /></div>
                <div className="grid gap-2"><Label htmlFor="hd">Username</Label><div className="flex items-center rounded-lg border border-input focus-within:ring-2 focus-within:ring-ring"><span className="pl-3 text-sm text-muted-foreground">balz.tv/</span><Input id="hd" defaultValue={user?.handle} className="border-0 pl-1 focus-visible:ring-0" /></div><p className="text-xs text-muted-foreground">3–25 letters, numbers, underscores or hyphens. Old names redirect.</p></div>
              </div>
              <div className="grid gap-2"><Label htmlFor="bio">Bio</Label><Textarea id="bio" placeholder="A short line about you" maxLength={300} /></div>
              <div className="grid gap-2 sm:w-1/2"><Label htmlFor="pr">Pronouns</Label><Input id="pr" placeholder="Optional" /></div>
            </CardContent>
            <CardFooter className="justify-end"><Button onClick={save}>Save profile</Button></CardFooter>
          </Card>
        </TabsContent>
        <TabsContent value="security" className="space-y-5">
          <Card><CardHeader><CardTitle>Email</CardTitle><CardDescription>{user?.email} · verified</CardDescription></CardHeader><CardFooter><Button variant="secondary">Change email</Button></CardFooter></Card>
          <Card><CardHeader><CardTitle>Password</CardTitle><CardDescription>Last changed 3 months ago.</CardDescription></CardHeader><CardFooter><Button variant="secondary">Change password</Button></CardFooter></Card>
          <Card><CardHeader><CardTitle>Two-factor authentication</CardTitle><CardDescription>Required before you can change payout or email details.</CardDescription></CardHeader><CardContent><ToggleRow title="Authenticator app" body="Use an app like 1Password or Google Authenticator." /></CardContent></Card>
          <Card><CardHeader><CardTitle>Sessions</CardTitle><CardDescription>Chrome on macOS · Tallinn · this device</CardDescription></CardHeader><CardFooter><Button variant="destructive-outline">Sign out other sessions</Button></CardFooter></Card>
        </TabsContent>
        <TabsContent value="notifications">
          <Card><CardContent className="pt-5">
            <ToggleRow title="Followed channel goes live" body="Grouped: at most one alert per channel per day." defaultChecked />
            <ToggleRow title="A followed channel asks a question" defaultChecked />
            <ToggleRow title="My prediction settles" body="Won, lost or returned." defaultChecked />
            <ToggleRow title="Someone mentions me in chat" defaultChecked />
            <ToggleRow title="Email digest" body="Weekly summary of your predictions." />
          </CardContent></Card>
        </TabsContent>
        <TabsContent value="privacy">
          <Card><CardContent className="pt-5">
            <ToggleRow title="Show who I follow on my profile" defaultChecked />
            <ToggleRow title="Show my predictions in channel activity" body="Your name appears in the recent predictions list." defaultChecked />
            <ToggleRow title="Allow whispers from people I don’t follow" />
            <ToggleRow title="Analytics cookies" body="Helps us improve balz. Off by default." />
          </CardContent><CardFooter className="justify-between"><Button variant="secondary">Download my data</Button><Button variant="destructive-outline">Delete account</Button></CardFooter></Card>
        </TabsContent>
        <TabsContent value="limits">
          <Card>
            <CardHeader><CardTitle>Play limits</CardTitle><CardDescription>Set limits on what you deposit and predict. Lowering a limit is instant; raising one takes 24 hours.</CardDescription></CardHeader>
            <CardContent className="grid gap-4 sm:grid-cols-2">
              <div className="grid gap-2"><Label>Daily deposit limit</Label><Select defaultValue="none"><SelectTrigger><SelectValue /></SelectTrigger><SelectContent><SelectItem value="none">No limit</SelectItem><SelectItem value="50">50 USDC</SelectItem><SelectItem value="100">100 USDC</SelectItem><SelectItem value="250">250 USDC</SelectItem></SelectContent></Select></div>
              <div className="grid gap-2"><Label>Session reminder</Label><Select defaultValue="60"><SelectTrigger><SelectValue /></SelectTrigger><SelectContent><SelectItem value="30">Every 30 minutes</SelectItem><SelectItem value="60">Every hour</SelectItem><SelectItem value="off">Off</SelectItem></SelectContent></Select></div>
              <div className="sm:col-span-2"><ToggleRow title="Hide casino categories" body="Removes Slots, Virtual Casino and Poker from your home and browse pages." /></div>
            </CardContent>
            <CardFooter className="justify-between"><Button variant="destructive-outline">Take a break (24 h to 6 months)</Button><Button onClick={save}>Save limits</Button></CardFooter>
          </Card>
        </TabsContent>
        <TabsContent value="chat">
          <Card><CardContent className="pt-5">
            <ToggleRow title="Show timestamps in chat" />
            <ToggleRow title="Hide prediction events in chat" />
            <ToggleRow title="Autoplay streams on home" defaultChecked />
            <ToggleRow title="Reduce motion" body="Stops pulsing live dots and animated transitions." />
          </CardContent></Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
