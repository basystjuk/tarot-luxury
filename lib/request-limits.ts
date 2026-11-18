/**
 * Size-limited JSON body reader for public API routes. Bounds how much text can
 * reach the AI provider or Telegram from a single request.
 */

import { NextResponse } from "next/server";

/** Comfortably above the largest payload the Studio tools send. */
export const AI_BODY_LIMIT_BYTES = 16 * 1024;

type ReadResult<T> = { data: T; deny?: undefined } | { data?: undefined; deny: NextResponse };

// eslint-disable-next-line @typescript-eslint/no-explicit-any -- routes narrow the fields they read
export async function readJsonBody<T = any>(req: Request, maxBytes: number = AI_BODY_LIMIT_BYTES): Promise<ReadResult<T>> {
  const tooLarge = () => ({ deny: NextResponse.json({ error: "payload_too_large" }, { status: 413 }) });
  const invalid = () => ({ deny: NextResponse.json({ error: "bad_json" }, { status: 400 }) });

  if (Number(req.headers.get("content-length") ?? 0) > maxBytes) return tooLarge();
  let text: string;
  try {
    text = await req.text();
  } catch {
    return invalid();
  }
  if (Buffer.byteLength(text) > maxBytes) return tooLarge();
  try {
    const data: unknown = JSON.parse(text);
    if (!data || typeof data !== "object" || Array.isArray(data)) return invalid();
    return { data: data as T };
  } catch {
    return invalid();
  }
}

/** A trimmed string of at most `max` characters; anything else becomes "". */
export function cleanText(value: unknown, max: number): string {
  return typeof value === "string" ? value.trim().slice(0, max) : "";
}
