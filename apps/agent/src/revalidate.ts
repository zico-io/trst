export async function revalidateTrustCenter(repoId: string): Promise<void> {
  const revalidateUrl = process.env.REVALIDATE_URL;
  const revalidateSecret = process.env.REVALIDATE_SECRET;

  if (!revalidateUrl || !revalidateSecret) {
    console.warn("[revalidate] REVALIDATE_URL or REVALIDATE_SECRET not set — skipping ISR revalidation");
    return;
  }

  const response = await fetch(revalidateUrl, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-revalidate-secret": revalidateSecret,
    },
    body: JSON.stringify({ repoId }),
  });

  if (!response.ok) {
    const text = await response.text();
    throw new Error(
      `[revalidate] Trust center revalidation failed: ${response.status} ${text}`
    );
  }
}
