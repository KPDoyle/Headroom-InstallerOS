import { redirect } from "next/navigation";
import InstallerWorkspace from "./installer-app";
import { getViewer, ViewerAccessError } from "../lib/auth";
import { isSupabaseConfigured } from "../lib/supabase/config";

export const dynamic = "force-dynamic";

function ConfigurationRequired() {
  return (
    <main className="auth-shell">
      <section className="auth-card auth-card-wide">
        <span className="auth-eyebrow">HEADROOM INSTALLER OS</span>
        <h1>Supabase connection required</h1>
        <p>
          The application is ready, but this environment does not have the Supabase URL and
          publishable key supplied by the Vercel Marketplace integration.
        </p>
        <div className="auth-notice error">
          Connect Supabase to this Vercel project for Production, Preview and Development,
          then redeploy the current GitHub main branch.
        </div>
      </section>
    </main>
  );
}

export default async function Home() {
  if (!isSupabaseConfigured()) return <ConfigurationRequired />;

  let viewer = null;
  let accessError = "";
  try {
    viewer = await getViewer();
  } catch (error) {
    accessError = error instanceof ViewerAccessError ? error.code : "access-unavailable";
  }

  if (!viewer) redirect(`/login?error=${encodeURIComponent(accessError || "sign-in-required")}`);
  return <InstallerWorkspace initialViewer={viewer} />;
}
