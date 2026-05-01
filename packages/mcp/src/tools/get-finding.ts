import { z } from "zod";
import { db, findings, eq } from "@trst/db";

export const getFindingSchema = z.object({
  id: z.string(),
});

export async function getFinding(input: z.infer<typeof getFindingSchema>) {
  const [row] = await db.select().from(findings).where(eq(findings.id, input.id)).limit(1);
  if (!row) throw new Error(`Finding not found: ${input.id}`);
  return row;
}
