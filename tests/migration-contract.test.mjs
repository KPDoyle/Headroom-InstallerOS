import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

const read = (path) => readFile(new URL(`../${path}`, import.meta.url), "utf8");

test("uses the native Next.js build on Vercel", async () => {
  const packageJson = JSON.parse(await read("package.json"));
  assert.equal(packageJson.scripts.build, "next build");
  assert.equal(packageJson.scripts.dev, "next dev");
  assert.equal(packageJson.engines.node, "24.x");
  assert.match(packageJson.dependencies["@supabase/supabase-js"], /^\^2\./);
  assert.match(packageJson.dependencies["@supabase/ssr"], /^\^0\./);
  assert.match(packageJson.dependencies.postgres, /^\^3\./);
  assert.equal(packageJson.dependencies["@vercel/blob"], undefined);
  assert.equal(packageJson.dependencies.vinext, undefined);
});

test("persists organisation workspace and files through Supabase", async () => {
  const workspaceRoute = await read("app/api/workspace/route.ts");
  const filesRoute = await read("app/api/files/route.ts");
  const schema = await read("lib/schema.ts");
  assert.match(workspaceRoute, /organisation_id/);
  assert.match(workspaceRoute, /sql\.json/);
  assert.match(filesRoute, /installer-documents/);
  assert.match(filesRoute, /belongsToOrganisation/);
  assert.match(schema, /enable row level security/);
  assert.match(schema, /headroom_documents_read/);
});

test("protects application routes and exposes real account administration", async () => {
  const proxy = await read("lib/supabase/proxy.ts");
  const publicAccess = await read("lib/public-access.ts");
  const adminUsers = await read("app/api/admin/users/route.ts");
  const adminUser = await read("app/api/admin/users/[id]/route.ts");
  assert.match(proxy, /getClaims/);
  assert.match(proxy, /isPublicAccessEnabled/);
  assert.match(proxy, /\/login/);
  assert.match(publicAccess, /HEADROOM_REQUIRE_LOGIN/);
  assert.match(publicAccess, /public-preview/);
  assert.match(adminUsers, /inviteUserByEmail/);
  assert.match(adminUser, /updateUserById/);
  assert.match(adminUser, /At least one active administrator is required/);
});

test("labels the staged public workspace and preserves the login switch", async () => {
  const installer = await read("app/installer-app.tsx");
  const health = await read("app/api/health/route.ts");
  assert.match(installer, /PUBLIC PREVIEW · LOGIN OFF/);
  assert.match(health, /public-preview/);
  assert.match(health, /authenticated/);
});

test("keeps live Territory Intelligence behind a server route", async () => {
  const territoryRoute = await read("app/api/territory/route.ts");
  assert.match(territoryRoute, /api\.postcodes\.io/);
  assert.match(territoryRoute, /Postcodes\.io · ONS Postcode Directory/);
  assert.match(territoryRoute, /requireViewer/);
  assert.match(territoryRoute, /private, max-age=3600/);
});
