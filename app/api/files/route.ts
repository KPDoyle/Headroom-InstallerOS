import { env } from "cloudflare:workers";

export const dynamic = "force-dynamic";

type StoredObject = { body: ReadableStream; httpEtag: string; httpMetadata?: { contentType?: string }; writeHttpMetadata: (headers: Headers) => void };
type Bucket = {
  put: (key: string, value: ArrayBuffer, options: { httpMetadata: { contentType: string }; customMetadata: Record<string, string> }) => Promise<unknown>;
  get: (key: string) => Promise<StoredObject | null>;
  delete: (key: string) => Promise<void>;
};

function getBucket() {
  const bucket = (env as unknown as { BUCKET?: Bucket }).BUCKET;
  if (!bucket) throw new Error("File storage is unavailable");
  return bucket;
}

function owner(request: Request) {
  return (request.headers.get("oai-authenticated-user-email") || "owner-workspace").toLowerCase().replace(/[^a-z0-9@._-]/g, "-");
}

export async function POST(request: Request) {
  try {
    const form = await request.formData(); const file = form.get("file"); const purpose = String(form.get("purpose") || "uploads").replace(/[^a-z0-9/_-]/gi, "-");
    if (!(file instanceof File)) return Response.json({ error: "file is required" }, { status: 400 });
    if (file.size > 10 * 1024 * 1024) return Response.json({ error: "file must be smaller than 10 MB" }, { status: 413 });
    const safeName = file.name.replace(/[^a-z0-9._-]/gi, "-"); const key = `${owner(request)}/${purpose}/${crypto.randomUUID()}-${safeName}`;
    await getBucket().put(key, await file.arrayBuffer(), { httpMetadata: { contentType: file.type || "application/octet-stream" }, customMetadata: { originalName: file.name, uploadedAt: new Date().toISOString() } });
    return Response.json({ fileName: file.name, fileKey: key }, { status: 201 });
  } catch (error) {
    return Response.json({ error: error instanceof Error ? error.message : "Upload failed" }, { status: 503 });
  }
}

export async function GET(request: Request) {
  try {
    const key = new URL(request.url).searchParams.get("key") || "";
    if (!key.startsWith(`${owner(request)}/`)) return Response.json({ error: "file not found" }, { status: 404 });
    const object = await getBucket().get(key); if (!object) return Response.json({ error: "file not found" }, { status: 404 });
    const headers = new Headers(); object.writeHttpMetadata(headers); headers.set("etag", object.httpEtag); headers.set("cache-control", "private, max-age=300");
    return new Response(object.body, { headers });
  } catch (error) {
    return Response.json({ error: error instanceof Error ? error.message : "File unavailable" }, { status: 503 });
  }
}

export async function DELETE(request: Request) {
  try {
    const key = new URL(request.url).searchParams.get("key") || "";
    if (!key.startsWith(`${owner(request)}/`)) return Response.json({ error: "file not found" }, { status: 404 });
    await getBucket().delete(key); return Response.json({ deleted: true });
  } catch (error) {
    return Response.json({ error: error instanceof Error ? error.message : "Delete failed" }, { status: 503 });
  }
}
