import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

const read = (path) => readFile(new URL(`../${path}`, import.meta.url), "utf8");

test("uses the native Next.js build on Vercel", async () => {
  const packageJson = JSON.parse(await read("package.json"));
  assert.equal(packageJson.scripts.build, "next build");
  assert.equal(packageJson.scripts.dev, "next dev");
  assert.equal(packageJson.engines.node, "24.x");
  assert.equal(packageJson.dependencies["@vercel/blob"], "2.8.0");
  assert.equal(packageJson.dependencies.vinext, undefined);
});

test("persists workspace state and files through private Vercel Blob storage", async () => {
  const workspaceRoute = await read("app/api/workspace/route.ts");
  const filesRoute = await read("app/api/files/route.ts");
  assert.match(workspaceRoute, /access: "private"/);
  assert.match(workspaceRoute, /allowOverwrite: true/);
  assert.match(filesRoute, /access: "private"/);
  assert.match(filesRoute, /fileBlobPrefix/);
});

test("keeps live Territory Intelligence behind a server route", async () => {
  const territoryRoute = await read("app/api/territory/route.ts");
  assert.match(territoryRoute, /api\.postcodes\.io/);
  assert.match(territoryRoute, /Postcodes\.io · ONS Postcode Directory/);
  assert.match(territoryRoute, /cache-control/);
});
