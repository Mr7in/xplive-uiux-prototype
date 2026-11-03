import { useParams } from "react-router-dom";
import { usePageMeta } from "@/lib/meta";

const docs: Record<string, { title: string; body: string[] }> = {
  terms: { title: "Terms of Service", body: ["These terms govern your use of xp.live. By creating an account you agree to them.", "Your full terms are provided by the legal team and rendered from the CMS."] },
  privacy: { title: "Privacy Policy", body: ["How we collect, use and protect your data.", "Your full policy is provided by the legal team and rendered from the CMS."] },
  "responsible-play": { title: "Responsible play", body: ["Predictions and casino categories are for adults aged 18+, where permitted. Predictions use USDC on the Polygon network. On the test network (Amoy) test USDC has no value.", "Set limits or take a break any time in Settings › Play limits. If gambling stops being fun, visit begambleaware.org."] },
  predictions: { title: "How predictions work", body: ["Creators ask a YES/NO question about something that will be decided on stream. Viewers pick a side with USDC before the question closes. Each answer is a transaction on Polygon.", "When it closes, payouts lock in: winners share the whole pool in proportion to what they put in, minus a 4% fee. The creator confirms the result; viewers can dispute it within 2 hours and an admin reviews the recording.", "If the event can’t be decided fairly, the question is voided and everyone gets their USDC back."] },
};

export default function Legal() {
  const { doc = "terms" } = useParams();
  const d = docs[doc] ?? docs.terms;
  usePageMeta(d.title);
  return (
    <article className="mx-auto max-w-2xl px-4 py-12">
      <h1 className="font-display text-4xl font-extrabold">{d.title}</h1>
      <div className="mt-6 space-y-4 text-lg leading-relaxed text-label">{d.body.map((p) => <p key={p}>{p}</p>)}</div>
    </article>
  );
}
