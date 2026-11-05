import * as React from "react";
import { toast } from "sonner";
import { BookOpen, CircleHelp, CreditCard, ShieldAlert, Trophy, Video, Search } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export interface Ticket { id: string; subject: string; topic: string; status: "Open" | "Waiting on you" | "Resolved"; updated: string }

const viewerTopics = [
  { icon: Trophy, title: "Predictions & results", body: "How odds work, when results settle, disputes." },
  { icon: CreditCard, title: "Wallet & USDC", body: "Deposits, withdrawals, payout address, test USDC." },
  { icon: ShieldAlert, title: "Safety & reporting", body: "Report a user, block, chat moderation." },
  { icon: CircleHelp, title: "Account & login", body: "Password, email, two-factor, deleting your account." },
];
const creatorTopics = [
  { icon: Video, title: "Going live", body: "Stream keys, OBS settings, ingest health." },
  { icon: Trophy, title: "Running predictions", body: "Good questions, closing, proposing results, voids." },
  { icon: CreditCard, title: "Payouts & tax", body: "USDC payouts on Polygon, minimums, tax forms." },
  { icon: ShieldAlert, title: "Moderation", body: "Mods, AutoMod, bans and appeals." },
];

export function SupportCenter({ audience, tickets }: { audience: "viewer" | "creator"; tickets: Ticket[] }) {
  const topics = audience === "creator" ? creatorTopics : viewerTopics;
  const [subject, setSubject] = React.useState("");
  const [body, setBody] = React.useState("");
  return (
    <Tabs defaultValue="help">
      <TabsList>
        <TabsTrigger value="help">Help centre</TabsTrigger>
        <TabsTrigger value="tickets">My tickets <span className="font-mono text-xs text-muted-foreground">{tickets.length}</span></TabsTrigger>
        <TabsTrigger value="new">Contact support</TabsTrigger>
      </TabsList>
      <TabsContent value="help" className="space-y-5">
        <div className="relative max-w-xl"><Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" /><Input placeholder="Search help articles" className="h-12 pl-9" aria-label="Search help articles" /></div>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {topics.map((t) => (
            <Card key={t.title} className="transition hover:border-input">
              <CardHeader><t.icon className="mb-2 h-6 w-6 text-label" /><CardTitle>{t.title}</CardTitle><CardDescription>{t.body}</CardDescription></CardHeader>
            </Card>
          ))}
        </div>
        <Card>
          <CardHeader><CardTitle className="flex items-center gap-2"><BookOpen className="h-4 w-4" /> Popular articles</CardTitle></CardHeader>
          <CardContent>
            <ul className="divide-y text-sm">
              {(audience === "creator"
                ? ["Set up OBS for balz in 5 minutes", "Writing a YES/NO question viewers can trust", "What happens when I void a prediction?", "When do payouts arrive?", "Adding moderators and AutoMod rules"]
                : ["How are prediction payouts calculated?", "Why was my prediction returned?", "How do I dispute a result?", "Adding USDC on Polygon Amoy", "Setting time and spend limits"]
              ).map((a) => <li key={a}><a href="#" className="block py-2.5 hover:text-foreground">{a}</a></li>)}
            </ul>
          </CardContent>
        </Card>
      </TabsContent>
      <TabsContent value="tickets">
        <Table>
          <TableHeader><TableRow><TableHead>Ticket</TableHead><TableHead>Subject</TableHead><TableHead>Topic</TableHead><TableHead>Status</TableHead><TableHead>Updated</TableHead></TableRow></TableHeader>
          <TableBody>
            {tickets.map((t) => (
              <TableRow key={t.id}>
                <TableCell className="font-mono text-xs text-muted-foreground">{t.id}</TableCell>
                <TableCell className="font-semibold">{t.subject}</TableCell>
                <TableCell className="text-label">{t.topic}</TableCell>
                <TableCell><Badge variant={t.status === "Resolved" ? "muted" : t.status === "Open" ? "neon" : "warning"}>{t.status}</Badge></TableCell>
                <TableCell className="text-muted-foreground">{t.updated}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TabsContent>
      <TabsContent value="new">
        <Card className="max-w-2xl">
          <CardHeader><CardTitle>Contact support</CardTitle><CardDescription>We reply by email and in Messages, usually within 24 hours.</CardDescription></CardHeader>
          <CardContent>
            <form className="grid gap-4" onSubmit={(e) => { e.preventDefault(); if (!subject.trim() || !body.trim()) return; toast.success("Ticket created", { description: "We’ll reply within 24 hours." }); setSubject(""); setBody(""); }}>
              <div className="grid gap-2">
                <Label>Topic</Label>
                <Select defaultValue={topics[0].title}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent>{topics.map((t) => <SelectItem key={t.title} value={t.title}>{t.title}</SelectItem>)}</SelectContent></Select>
              </div>
              <div className="grid gap-2"><Label htmlFor="sub">Subject</Label><Input id="sub" value={subject} onChange={(e) => setSubject(e.target.value)} /></div>
              <div className="grid gap-2"><Label htmlFor="body">What happened?</Label><Textarea id="body" rows={6} value={body} onChange={(e) => setBody(e.target.value)} placeholder="Include links, timestamps or question names where you can." /></div>
              <div className="flex justify-end"><Button type="submit" disabled={!subject.trim() || !body.trim()}>Send to support</Button></div>
            </form>
          </CardContent>
        </Card>
      </TabsContent>
    </Tabs>
  );
}
