import { usePageMeta } from "@/lib/meta";
import { useStore } from "@/lib/store";
import { conversations, thread } from "@/data/viewer";
import { Inbox } from "@/components/Inbox";
import { EmptyState, PageHeader } from "@/components/xp";
import { Button } from "@/components/ui/button";
import { useAuthDialog } from "@/components/auth";

export default function Messages() {
  usePageMeta("Messages");
  const { user } = useStore();
  const auth = useAuthDialog();
  return (
    <div className="mx-auto max-w-[1280px] px-4 py-8 md:px-8">
      <PageHeader title="Messages" description="Whispers with creators and friends, and replies from support." className="mb-6" />
      {user ? <Inbox convos={conversations} thread={thread} /> : <EmptyState title="Log in to see your messages" action={<Button onClick={() => auth.open("signin")}>Log in</Button>} />}
    </div>
  );
}
