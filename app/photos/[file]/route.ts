import fs from "node:fs/promises";
import path from "node:path";
import { uploadDir } from "@/lib/db";

export async function GET(_: Request, { params }: { params: Promise<{ file: string }> }) {
  const { file } = await params;
  if (!/^[\w-]+\.jpg$/.test(file)) return new Response(null, { status: 404 });
  try {
    const data = await fs.readFile(path.join(uploadDir, file));
    return new Response(data, {
      headers: { "Content-Type": "image/jpeg", "Cache-Control": "public, max-age=31536000, immutable" },
    });
  } catch {
    return new Response(null, { status: 404 });
  }
}
