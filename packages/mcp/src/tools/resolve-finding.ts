import { z } from "zod";
import { db, findings, eq } from "@trst/db";

export const resolveFindingSchema = z.object({
  id: z.string(),
  resolutionNote: z.string().min(1),
});

export async function resolveFinding(input: z.infer<typeof resolveFindingSchema>) {
  const [row] = await db.select({ id: findings.id }).from(findings).where(eq(findings.id, input.id)).limit(1);
  if (!row) throw new Error(`Finding not found: ${input.id}`);

  const [updated] = await db
    .update(findings)
    .set({
      status: "resolved",
      resolutionNote: input.resolutionNote,
      resolvedAt: new Date(),
      claimedBy: null,
      claimedAt: null,
    })
    .where(eq(findings.id, input.id))
    .returning();

  return updated;
}
