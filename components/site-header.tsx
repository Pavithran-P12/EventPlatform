import { getCurrentUser } from "@/lib/auth";
import { SiteHeaderView } from "@/components/site-header-view";

export async function SiteHeader() {
  const user = await getCurrentUser();
  const displayName =
    user?.user_metadata?.full_name ?? user?.email ?? null;
  return <SiteHeaderView displayName={displayName} />;
}
