"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { getCurrentUser } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { setActiveOrganizationCookie } from "@/lib/db/org-context";
import { getOrganizationForUser } from "@/lib/db/queries";
import { slugify } from "@/lib/db/helpers";
import { createOrganizationSchema } from "@/lib/validation/phase3";

export type ActionState = { error?: string; success?: string };

async function requireUser() {
  const user = await getCurrentUser();
  if (!user) redirect("/login");
  return user;
}

export async function createOrganizationAction(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  await requireUser();
  const parsed = createOrganizationSchema.safeParse({
    name: String(formData.get("name") ?? ""),
    slug: slugify(String(formData.get("name") ?? "")),
    description: String(formData.get("description") ?? "") || undefined,
  });
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Invalid organisation details." };
  }
  const supabase = await createClient();
  const { data, error } = await supabase.rpc("create_organization_with_owner", {
    org_name: parsed.data.name,
    org_slug: parsed.data.slug,
    org_description: parsed.data.description ?? null,
  });
  if (error || !data) {
    return {
      error: error?.message.includes("organizations_slug_key")
        ? "An organisation with a similar name already exists. Try a different name."
        : "Organisation could not be created. Please try again.",
    };
  }
  const org = data as { id: string };
  await setActiveOrganizationCookie(org.id);
  revalidatePath("/dashboard");
  redirect("/dashboard");
}

export async function switchOrganizationAction(formData: FormData) {
  const user = await requireUser();
  const organizationId = String(formData.get("organizationId") ?? "");
  const membership = await getOrganizationForUser(user.id, organizationId);
  if (!membership) {
    return;
  }
  await setActiveOrganizationCookie(organizationId);
  revalidatePath("/dashboard");
  redirect("/dashboard");
}
