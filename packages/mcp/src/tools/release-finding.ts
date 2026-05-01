import { z } from "zod";
import { db, findings, eq } from "@trst/db";

export const releaseFindingSchema = z.object({
  id: z.string(),
});

export async function releaseFinding(input: z.infer<typeof releaseFindingSchema>) {
  const [row] = await db.select().from(findings).where(eq(findings.id, input.id)).limit(1);
  if (!row) throw new Error(`Finding not found: ${input.id}`);

  if (row.status !== "in-progress") {
    throw new Error(`Finding is not in-progress (current status: "${row.status}"). Nothing to release.`);
  }

  const [updated] = await db
    .update(findings)
    .set({ status: "open", claimedBy: null, claimedAt: null })
    .where(eq(findings.id, input.id))
    .returning();

  return updated;
}
