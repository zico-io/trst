import { z } from "zod";
import { db, findings, eq } from "@trst/db";

export const claimFindingSchema = z.object({
  id: z.string(),
  agentId: z.string().min(1),
});

export async function claimFinding(input: z.infer<typeof claimFindingSchema>) {
  const [row] = await db.select().from(findings).where(eq(findings.id, input.id)).limit(1);
  if (!row) throw new Error(`Finding not found: ${input.id}`);

  if (row.status === "in-progress" && row.claimedBy !== input.agentId) {
    throw new Error(
      `Finding already claimed by "${row.claimedBy}" since ${row.claimedAt?.toISOString()}. Release it first or use a different finding.`
    );
  }

  const [updated] = await db
    .update(findings)
    .set({ status: "in-progress", claimedBy: input.agentId, claimedAt: new Date() })
    .where(eq(findings.id, input.id))
    .returning();

  return updated;
}
