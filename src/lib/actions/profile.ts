"use server";

import { revalidatePath } from "next/cache";
import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function updateProfile(formData: FormData) {
  const session = await getSession();
  if (!session?.clientProfileId) throw new Error("Unauthorized");

  await prisma.user.update({
    where: { id: session.id },
    data: { name: String(formData.get("name")) },
  });

  await prisma.clientProfile.update({
    where: { id: session.clientProfileId },
    data: {
      companyName: String(formData.get("companyName") || "") || null,
      phone: String(formData.get("phone") || "") || null,
      address: String(formData.get("address") || "") || null,
    },
  });

  revalidatePath("/dashboard/profile");
}
