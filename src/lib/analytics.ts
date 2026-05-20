import { prisma } from "./prisma";

export async function trackEvent(
  type: string,
  path?: string,
  userId?: string,
  metadata?: Record<string, unknown>
) {
  try {
    await prisma.analyticsEvent.create({
      data: {
        type,
        path,
        userId,
        metadata: metadata ? JSON.stringify(metadata) : null,
      },
    });
  } catch {
    // non-blocking
  }
}
