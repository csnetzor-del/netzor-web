"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import {
  buildSessionFromUser,
  createSession,
  getSession,
} from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function updateProfile(formData: FormData) {
  const session = await getSession();
  if (!session) {
    redirect("/auth/signin?redirect=/dashboard/profile");
  }

  const name = String(formData.get("name") ?? "").trim();
  if (!name) {
    redirect("/dashboard/profile?error=Name%20is%20required");
  }

  try {
    await prisma.user.update({
      where: { id: session.id },
      data: { name },
    });

    if (session.clientProfileId) {
      await prisma.clientProfile.update({
        where: { id: session.clientProfileId },
        data: {
          companyName: String(formData.get("companyName") || "") || null,
          phone: String(formData.get("phone") || "") || null,
          address: String(formData.get("address") || "") || null,
        },
      });
    }

    const refreshed = await buildSessionFromUser(session.id);
    if (refreshed) {
      await createSession(refreshed);
    }
  } catch (err) {
    console.error("updateProfile failed:", err);
    redirect("/dashboard/profile?error=Could%20not%20save%20profile");
  }

  revalidatePath("/dashboard/profile");
  redirect("/dashboard/profile?saved=1");
}
