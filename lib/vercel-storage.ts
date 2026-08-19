export const workspaceBlobPath = "headroom-installer-os/workspace/state.json";
export const fileBlobPrefix = "headroom-installer-os/files/";

export function blobStorageConfigured() {
  return Boolean(
    process.env.BLOB_READ_WRITE_TOKEN ||
    (process.env.VERCEL_OIDC_TOKEN && process.env.BLOB_STORE_ID),
  );
}
