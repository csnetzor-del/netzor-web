import { prisma } from "@/lib/prisma";

/** Detach or reassign records before deleting a user (avoids FK errors). */
export async function deleteUserWithRelations(
  userId: string,
  reassignToUserId: string
) {
  await prisma.$transaction(async (tx) => {
    await tx.ticketMessage.deleteMany({ where: { userId } });

    await tx.ticket.updateMany({
      where: { assignedToId: userId },
      data: { assignedToId: null },
    });

    await tx.ticket.updateMany({
      where: { createdById: userId },
      data: { createdById: reassignToUserId },
    });

    await tx.analyticsEvent.updateMany({
      where: { userId },
      data: { userId: null },
    });

    await tx.user.delete({ where: { id: userId } });
  });
}
