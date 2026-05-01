import { z } from "zod";
import { db, findings, eq } from "@trst/db";

export const suppressFindingSchema = z.object({
  id: z.string(),
  reason: z.string().min(1),
});

export async function suppressFinding(input: z.infer<typeof suppressFindingSchema>) {
  const [row] = await db.select({ id: findings.id }).from(findings).where(eq(findings.id, input.id)).limit(1);
  if (!row) throw new Error(`Finding not found: ${input.id}`);

  const [updated] = await db
    .update(findings)
    .set({
      status: "suppressed",
      resolutionNote: input.reason,
      claimedBy: null,
      claimedAt: null,
    })
    .where(eq(findings.id, input.id))
    .returning();

  return updated;
}
