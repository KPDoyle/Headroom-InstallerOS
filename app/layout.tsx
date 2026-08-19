import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Headroom Installer OS",
  description: "The connected MCS installation workspace for evidence, compliance, certificates, customers, products and territory intelligence.",
  other: { "codex-preview": "development" },
  icons: { icon: "/favicon.svg", shortcut: "/favicon.svg" },
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="en"><body>{children}</body></html>;
}
