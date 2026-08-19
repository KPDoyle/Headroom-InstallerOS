import LoginForm from "./login-form";
import { isSupabaseConfigured } from "../../lib/supabase/config";

export const dynamic = "force-dynamic";

type LoginPageProps = {
  searchParams: Promise<{ error?: string; next?: string }>;
};

export default async function LoginPage({ searchParams }: LoginPageProps) {
  const params = await searchParams;
  return (
    <main className="auth-shell">
      <section className="auth-brand-panel">
        <div className="auth-logo"><span className="auth-logo-mark"><i/><i/><b/></span><strong>headroom</strong></div>
        <span className="auth-product">Installer OS</span>
        <h1>One operating system for every certified installation.</h1>
        <p>Projects, evidence, compliance, MID readiness, customers, products and territory intelligence—secured for your installer team.</p>
        <div className="auth-trust"><span>INDIVIDUAL ACCOUNTS</span><span>ROLE-BASED ACCESS</span><span>SUPABASE SECURED</span></div>
      </section>
      <LoginForm
        configured={isSupabaseConfigured()}
        errorCode={params.error || ""}
        nextPath={params.next?.startsWith("/") ? params.next : "/"}
      />
    </main>
  );
}

