
import type { Metadata } from "next";
import "./globals.css";
import { Providers } from "./providers";

export const metadata: Metadata = {
  title: "Nexus AI — Unified Agentic Workspace",
  description: "Docs, chat, tasks, and AI memory — unified.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="dark">
      <body className="bg-bg text-[#e8e8f0] font-body antialiased">
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
