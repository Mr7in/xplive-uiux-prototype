import { Toaster as Sonner } from "sonner";
import { useTheme } from "@/lib/theme";
export function Toaster() {
  const { resolved } = useTheme();
  return (
    <Sonner
      theme={resolved}
      position="bottom-right"
      toastOptions={{ classNames: { toast: "!bg-popover !border-border !text-foreground !rounded-xl", description: "!text-muted-foreground" } }}
    />
  );
}
