"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/db";
import { getSession } from "@/server/session";

export async function updateNotificationPreferenceAction(
  formData: FormData
): Promise<void> {
  const session = await getSession();
  if (!session) redirect("/auth/login?from=/alerts");

  const marketingEmailOptIn = formData.get("marketingEmailOptIn") === "on";
  const marketingPushOptIn = formData.get("marketingPushOptIn") === "on";

  await prisma.notificationPreference.upsert({
    where: { userId: session.sub },
    update: { marketingEmailOptIn, marketingPushOptIn },
    create: { userId: session.sub, marketingEmailOptIn, marketingPushOptIn },
  });

  revalidatePath("/alerts");
}
