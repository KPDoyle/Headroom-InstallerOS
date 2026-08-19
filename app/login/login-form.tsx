"use client";

import { ArrowRight, CheckCircle2, LockKeyhole, LogOut, Mail } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { createClient } from "../../lib/supabase/client";

const errorMessages: Record<string, string> = {
  suspended: "This workspace account is suspended. Contact an administrator for access.",
  "not-provisioned": "This account has not been invited to the installer workspace.",
  "access-unavailable": "Workspace access is temporarily unavailable. Please try again.",
  "auth-confirmation-failed": "The sign-in link is invalid or has expired. Request a new link below.",
};

type LoginFormProps = { configured: boolean; errorCode: string; nextPath: string };

export default function LoginForm({ configured, errorCode, nextPath }: LoginFormProps) {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [fullName, setFullName] = useState("");
  const [firstAdministrator, setFirstAdministrator] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState(errorMessages[errorCode] || "");

  useEffect(() => {
    if (!configured || errorCode) return;
    const supabase = createClient();
    void supabase.auth.getSession().then((result) => {
      if (result.data.session) router.replace(nextPath);
    });
  }, [configured, errorCode, nextPath, router]);

  const requestLink = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!configured) return;
    setSubmitting(true); setError(""); setMessage("");
    const supabase = createClient();
    const redirectTo = `${window.location.origin}/auth/confirm?next=${encodeURIComponent(nextPath)}`;
    const { error: authError } = await supabase.auth.signInWithOtp({
      email: email.trim().toLowerCase(),
      options: {
        shouldCreateUser: firstAdministrator,
        emailRedirectTo: redirectTo,
        data: firstAdministrator ? { full_name: fullName.trim(), organisation_name: "Headroom Installer Organisation" } : undefined,
      },
    });
    setSubmitting(false);
    if (authError) {
      setError(authError.message);
      return;
    }
    setMessage("Check your inbox for a secure sign-in link. It expires automatically.");
  };

  const signOut = async () => {
    if (!configured) return;
    await createClient().auth.signOut();
    setError("");
    router.replace("/login");
    router.refresh();
  };

  return (
    <section className="auth-card">
      <span className="auth-eyebrow">SECURE WORKSPACE ACCESS</span>
      <h2>Sign in to Installer OS</h2>
      <p>Use the email address assigned by your workspace administrator.</p>
      {!configured && <div className="auth-notice error">Supabase environment variables are not connected to this deployment.</div>}
      {error && <div className="auth-notice error"><LockKeyhole size={17}/><span>{error}</span></div>}
      {message && <div className="auth-notice success"><CheckCircle2 size={17}/><span>{message}</span></div>}
      <form className="auth-form" onSubmit={requestLink}>
        {firstAdministrator && <label>Full name<input value={fullName} onChange={(event) => setFullName(event.target.value)} required autoComplete="name"/></label>}
        <label>Email address<input type="email" value={email} onChange={(event) => setEmail(event.target.value)} required autoComplete="email" placeholder="name@installer.co.uk"/></label>
        <button type="submit" disabled={!configured || submitting}><Mail size={17}/>{submitting ? "Sending secure link…" : "Email me a secure sign-in link"}<ArrowRight size={16}/></button>
      </form>
      <label className="auth-bootstrap"><input type="checkbox" checked={firstAdministrator} onChange={(event) => setFirstAdministrator(event.target.checked)}/><span><strong>First administrator setup</strong><small>Use only once, before any workspace account has been created.</small></span></label>
      {errorCode && <button className="auth-signout" type="button" onClick={signOut}><LogOut size={15}/>Clear this session and use another account</button>}
      <div className="auth-footnote"><LockKeyhole size={14}/><span>Passwordless links are single-use. Your role and organisation access are verified again on every server request.</span></div>
    </section>
  );
}
