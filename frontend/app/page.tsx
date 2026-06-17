"use client";
import Link from "next/link";
import axios from "axios";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import api from "@/lib/api";
import { useAuthStore } from "@/store/authStore";
import { Spinner } from "@/components/app/Spinner";

export default function LandingPage() {
  const { user, setUser, logout } = useAuthStore();
  const router = useRouter();
  const [checkingAuth, setCheckingAuth] = useState(true);

  useEffect(() => {
    const getHealth = async () => {
      try {
        await axios.get(`${process.env.NEXT_PUBLIC_API_URL}/health`);
      } catch {
        // Ignored
      }
    };
    getHealth();
  }, []);

  useEffect(() => {
    const checkAuth = async () => {
      if (!user) {
        setCheckingAuth(false);
        return;
      }

      try {
        const { data: me } = await api.get("/auth/me");
        setUser(me);
        router.push("/dashboard");
      } catch {
        logout();
        setCheckingAuth(false);
      }
    };

    checkAuth();
  }, [user, setUser, logout, router]);

  if (checkingAuth && user) {
    return (
      <div className="min-h-screen bg-bg flex items-center justify-center">
        <Spinner className="w-6 h-6" />
      </div>
    );
  }

  return (
    <div className="min-h-screen grid-bg flex flex-col">
      {/* Nav */}
      <nav className="glass sticky top-0 z-10 border-b border-[#1e1e2e] flex items-center justify-between px-8 h-14">
        <div className="flex items-center gap-2.5">
          <div className="w-7 h-7 rounded-lg bg-accent/10 border border-accent/20 flex items-center justify-center">
            <span className="text-accent text-xs font-bold font-mono">N</span>
          </div>
          <span className="font-display font-bold text-base">Nexus AI</span>
        </div>
        <div className="flex gap-2">
          <Link href="/login" className="nexus-btn-ghost text-sm px-4 py-1.5">Sign in</Link>
          <Link href="/register" className="nexus-btn-primary text-sm px-4 py-1.5">Get started</Link>
        </div>
      </nav>

      {/* Hero */}
      <main className="flex-1 flex flex-col items-center justify-center px-6 py-20 text-center">
        <div className="animate-fade-up inline-flex items-center gap-2 px-3 py-1 rounded-full border border-accent/20 bg-accent/5 mb-8">
          <span className="w-1.5 h-1.5 rounded-full bg-accent animate-pulse" />
          <span className="font-mono text-[11px] text-accent tracking-widest">NOW IN BETA</span>
        </div>

        <h1 className="animate-[fadeUp_0.5s_0.05s_ease_both] font-display font-extrabold text-5xl md:text-7xl leading-[1.05] tracking-[-0.03em] mb-5 max-w-3xl">
          Your team&apos;s<br />
          <span className="text-accent">second brain.</span>
        </h1>

        <p className="animate-[fadeUp_0.5s_0.1s_ease_both] text-[#5a5a7a] text-lg md:text-xl leading-relaxed max-w-lg mb-10 font-light">
          Docs, chat, tasks, and AI memory — unified. Nexus AI knows everything your team knows.
        </p>

        <div className="animate-[fadeUp_0.5s_0.15s_ease_both] flex gap-3 flex-wrap justify-center">
          <Link href="/register" className="nexus-btn-primary px-6 py-2.5 text-sm">
            Start building free
          </Link>
          <Link href="/dashboard" className="nexus-btn-ghost px-6 py-2.5 text-sm">
            View demo →
          </Link>
        </div>

        {/* Pills */}
        <div className="animate-[fadeUp_0.5s_0.2s_ease_both] flex flex-wrap gap-2 mt-14 justify-center">
          {["Realtime collaboration", "Semantic search", "AI-powered tasks", "Workspace memory", "RAG pipeline"].map((f) => (
            <span key={f} className="px-3 py-1.5 border border-[#1e1e2e] rounded-full text-xs text-[#5a5a7a] bg-surface">
              {f}
            </span>
          ))}
        </div>

        {/* Dashboard preview mockup */}
        <div className="animate-[fadeUp_0.5s_0.25s_ease_both] mt-16 w-full max-w-4xl border border-[#1e1e2e] rounded-2xl overflow-hidden bg-surface shadow-[0_0_80px_rgba(127,255,178,0.05)]">
          <div className="h-9 bg-bg border-b border-[#1e1e2e] flex items-center gap-1.5 px-4">
            {["#ff6b6b","#ffd166","#7fffb2"].map(c => (
              <div key={c} className="w-2.5 h-2.5 rounded-full opacity-60" style={{ background: c }} />
            ))}
            <div className="mx-auto font-mono text-[10px] text-[#3a3a5a]">nexus.ai/dashboard</div>
          </div>
          <div className="flex h-64">
            <div className="w-44 border-r border-[#1e1e2e] p-3 flex flex-col gap-1">
              <div className="font-mono text-[9px] text-[#5a5a7a] px-2 py-1 mb-1 tracking-widest">ENGINEERING</div>
              {[["📄","Documents",true],["💬","Chat",false],["✅","Tasks",false],["🤖","AI",false]].map(([ic,name,active]) => (
                <div key={String(name)} className={`px-2 py-1.5 rounded-lg text-[11px] flex items-center gap-2 ${active ? "bg-accent/10 text-accent" : "text-[#5a5a7a]"}`}>
                  <span>{ic}</span><span>{name}</span>
                </div>
              ))}
            </div>
            <div className="flex-1 p-4">
              <div className="text-xs font-semibold mb-3">Documents</div>
              {["Database Migration Plan","API Architecture","Sprint Planning"].map(d => (
                <div key={d} className="flex items-center gap-2.5 p-2.5 border border-[#1e1e2e] rounded-lg mb-2 bg-bg">
                  <span className="text-[#5a5a7a] text-xs">📄</span>
                  <div>
                    <div className="text-xs font-medium">{d}</div>
                    <div className="text-[9px] text-[#5a5a7a] font-mono">Updated 2 days ago</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </main>

      <footer className="border-t border-[#1e1e2e] py-5 px-8 flex justify-between items-center">
        <span className="font-mono text-[11px] text-[#5a5a7a]">© 2026 Nexus AI</span>
        <span className="font-mono text-[11px] text-[#5a5a7a]">FastAPI + Next.js + Gemini</span>
      </footer>
    </div>
  );
}
