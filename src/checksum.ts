import { createHash } from "node:crypto";
import { readFile } from "node:fs/promises";

/**
 * Return the SHA-1 Git uses for a blob object.
 *
 * Git hashes the bytes `blob <length>\0<content>`, not only the file content.
 */
export function gitBlobSha1(content: Uint8Array): string {
  const header = Buffer.from(`blob ${content.byteLength}\0`, "utf8");

  return createHash("sha1").update(header).update(content).digest("hex");
}

export async function gitBlobSha1ForFile(filePath: string): Promise<string> {
  return gitBlobSha1(await readFile(filePath));
}
