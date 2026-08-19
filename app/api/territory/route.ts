import { authErrorResponse, requireViewer } from "../../../lib/auth";

export const dynamic = "force-dynamic";

type PostcodeRecord = {
  postcode: string;
  quality: number;
  eastings: number | null;
  northings: number | null;
  country: string | null;
  longitude: number | null;
  latitude: number | null;
  region: string | null;
  admin_district: string | null;
  admin_ward: string | null;
  parliamentary_constituency: string | null;
  codes?: { admin_district?: string | null; admin_ward?: string | null };
};

type ApiResponse<T> = { status: number; result?: T; error?: string };

function cleanPostcode(value: string) {
  return value.trim().toUpperCase().replace(/\s+/g, " ");
}

export async function GET(request: Request) {
  try {
    await requireViewer();
  } catch (error) {
    return authErrorResponse(error);
  }
  const input = cleanPostcode(new URL(request.url).searchParams.get("postcode") ?? "");
  if (!/^[A-Z]{1,2}\d[A-Z\d]?\s*\d[A-Z]{2}$/.test(input.replace(/\s/g, ""))) {
    return Response.json({ error: "Enter a complete UK postcode, for example SO21 1BT." }, { status: 400 });
  }

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 9000);
  try {
    const encoded = encodeURIComponent(input.replace(/\s/g, ""));
    const [lookupResponse, nearestResponse] = await Promise.all([
      fetch(`https://api.postcodes.io/postcodes/${encoded}`, { signal: controller.signal, headers: { accept: "application/json" } }),
      fetch(`https://api.postcodes.io/postcodes/${encoded}/nearest?limit=12&radius=20000`, { signal: controller.signal, headers: { accept: "application/json" } }),
    ]);
    const lookup = await lookupResponse.json() as ApiResponse<PostcodeRecord>;
    if (!lookupResponse.ok || !lookup.result) return Response.json({ error: lookup.error || "That postcode could not be found." }, { status: lookupResponse.status === 404 ? 404 : 502 });
    const nearestPayload = nearestResponse.ok ? await nearestResponse.json() as ApiResponse<PostcodeRecord[]> : { status: nearestResponse.status, result: [] };
    const record = lookup.result;
    const seen = new Set<string>();
    const nearest = (nearestPayload.result ?? []).filter((item) => {
      const outcode = item.postcode.split(" ")[0];
      if (outcode === record.postcode.split(" ")[0] || seen.has(outcode)) return false;
      seen.add(outcode); return true;
    }).slice(0, 4).map((item) => ({ postcode: item.postcode, outcode: item.postcode.split(" ")[0], district: item.admin_district, latitude: item.latitude, longitude: item.longitude }));

    return Response.json({
      postcode: record.postcode,
      outcode: record.postcode.split(" ")[0],
      quality: record.quality,
      eastings: record.eastings,
      northings: record.northings,
      country: record.country,
      region: record.region,
      adminDistrict: record.admin_district,
      adminDistrictCode: record.codes?.admin_district ?? null,
      ward: record.admin_ward,
      wardCode: record.codes?.admin_ward ?? null,
      parliamentaryConstituency: record.parliamentary_constituency,
      latitude: record.latitude,
      longitude: record.longitude,
      nearest,
      source: "Postcodes.io · ONS Postcode Directory",
      checkedAt: new Date().toISOString(),
    }, { headers: { "cache-control": "private, max-age=3600" } });
  } catch (error) {
    const message = error instanceof Error && error.name === "AbortError" ? "Postcode lookup timed out. Please try again." : "Live postcode data is temporarily unavailable.";
    return Response.json({ error: message }, { status: 503 });
  } finally {
    clearTimeout(timeout);
  }
}
