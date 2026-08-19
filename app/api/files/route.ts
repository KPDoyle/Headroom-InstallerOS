import { del, get, put } from "@vercel/blob";
import { blobStorageConfigured, fileBlobPrefix } from "../../../lib/vercel-storage";

export const dynamic = "force-dynamic";

function owner(request: Request) {
  return (request.headers.get("oai-authenticated-user-email") || "owner-workspace").toLowerCase().replace(/[^a-z0-9@._-]/g, "-");
}

export async function POST(request: Request) {
  try {
    if (!blobStorageConfigured()) throw new Error("Vercel Blob is not connected to this project");
    const form = await request.formData(); const file = form.get("file"); const purpose = String(form.get("purpose") || "uploads").replace(/[^a-z0-9/_-]/gi, "-");
    if (!(file instanceof File)) return Response.json({ error: "file is required" }, { status: 400 });
    if (file.size > 10 * 1024 * 1024) return Response.json({ error: "file must be smaller than 10 MB" }, { status: 413 });
    const safeName = file.name.replace(/[^a-z0-9._-]/gi, "-");
    const pathname = `${fileBlobPrefix}${owner(request)}/${purpose}/${safeName}`;
    const blob = await put(pathname, file, { access: "private", addRandomSuffix: true, contentType: file.type || "application/octet-stream" });
    return Response.json({ fileName: file.name, fileKey: blob.pathname }, { status: 201 });
  } catch (error) {
    return Response.json({ error: error instanceof Error ? error.message : "Upload failed" }, { status: 503 });
  }
}

export async function GET(request: Request) {
  try {
    const key = new URL(request.url).searchParams.get("key") || "";
    if (!key.startsWith(`${fileBlobPrefix}${owner(request)}/`)) return Response.json({ error: "file not found" }, { status: 404 });
    const object = await get(key, { access: "private" });
    if (!object || object.statusCode !== 200) return Response.json({ error: "file not found" }, { status: 404 });
    return new Response(object.stream, { headers: { "content-type": object.blob.contentType, "content-disposition": object.blob.contentDisposition, "x-content-type-options": "nosniff", "cache-control": "private, max-age=300" } });
  } catch (error) {
    return Response.json({ error: error instanceof Error ? error.message : "File unavailable" }, { status: 503 });
  }
}

export async function DELETE(request: Request) {
  try {
    const key = new URL(request.url).searchParams.get("key") || "";
    if (!key.startsWith(`${fileBlobPrefix}${owner(request)}/`)) return Response.json({ error: "file not found" }, { status: 404 });
    await del(key); return Response.json({ deleted: true });
  } catch (error) {
    return Response.json({ error: error instanceof Error ? error.message : "Delete failed" }, { status: 503 });
  }
}
