import { authErrorResponse, requireViewer, writeAuditEvent } from "../../../lib/auth";
import { createAdminClient } from "../../../lib/supabase/admin";

export const dynamic = "force-dynamic";

const bucket = "installer-documents";

function safeSegment(value: string) {
  return value.replace(/[^a-z0-9._-]/gi, "-").replace(/-+/g, "-").slice(0, 120);
}
function belongsToOrganisation(fileKey: string, organisationId: string) {
  return fileKey.startsWith(`${organisationId}/`);
}

export async function POST(request: Request) {
  try {
    const viewer = await requireViewer();
    if (viewer.role === "Auditor") {
      return Response.json({ error: "Auditor access is read-only" }, { status: 403 });
    }
    const form = await request.formData();
    const file = form.get("file");
    const purpose = safeSegment(String(form.get("purpose") || "uploads"));
    if (!(file instanceof File)) return Response.json({ error: "file is required" }, { status: 400 });
    if (file.size > 10 * 1024 * 1024) {
      return Response.json({ error: "file must be smaller than 10 MB" }, { status: 413 });
    }

    const safeName = safeSegment(file.name || "document");
    const fileKey = `${viewer.organisationId}/${purpose}/${crypto.randomUUID()}-${safeName}`;
    const supabase = createAdminClient();
    const { error } = await supabase.storage.from(bucket).upload(fileKey, file, {
      contentType: file.type || "application/octet-stream",
      cacheControl: "300",
      upsert: false,
    });
    if (error) throw error;
    await writeAuditEvent(viewer, "Document uploaded", `${purpose} · ${file.name}`, "Evidence");
    return Response.json({ fileName: file.name, fileKey }, { status: 201 });
  } catch (error) {
    if (error instanceof Error && !error.message.includes("Authentication")) {
      console.error("[files] upload failed", error);
    }
    return authErrorResponse(error);
  }
}

export async function GET(request: Request) {
  try {
    const viewer = await requireViewer();
    const key = new URL(request.url).searchParams.get("key") || "";
    if (!belongsToOrganisation(key, viewer.organisationId)) {
      return Response.json({ error: "file not found" }, { status: 404 });
    }
    const { data, error } = await createAdminClient().storage.from(bucket).download(key);
    if (error || !data) return Response.json({ error: "file not found" }, { status: 404 });
    const fileName = key.split("/").at(-1)?.replace(/^[0-9a-f-]{36}-/, "") || "document";
    return new Response(await data.arrayBuffer(), {
      headers: {
        "content-type": data.type || "application/octet-stream",
        "content-disposition": `attachment; filename*=UTF-8''${encodeURIComponent(fileName)}`,
        "x-content-type-options": "nosniff",
        "cache-control": "private, max-age=300",
      },
    });
  } catch (error) {
    return authErrorResponse(error);
  }
}

export async function DELETE(request: Request) {
  try {
    const viewer = await requireViewer();
    if (viewer.role === "Auditor") {
      return Response.json({ error: "Auditor access is read-only" }, { status: 403 });
    }
    const key = new URL(request.url).searchParams.get("key") || "";
    if (!belongsToOrganisation(key, viewer.organisationId)) {
      return Response.json({ error: "file not found" }, { status: 404 });
    }
    const { error } = await createAdminClient().storage.from(bucket).remove([key]);
    if (error) throw error;
    await writeAuditEvent(viewer, "Document deleted", key.split("/").at(-1) || key, "Evidence");
    return Response.json({ deleted: true });
  } catch (error) {
    return authErrorResponse(error);
  }
}
