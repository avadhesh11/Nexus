"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import api from "@/lib/api";
import { useAuthStore } from "@/store/authStore";
import { Spinner } from "@/components/app/Spinner";

export default function RegisterPage() {
  const router = useRouter();
  const { setUser, logout } = useAuthStore();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [checkingAuth, setCheckingAuth] = useState(true);

  useEffect(() => {
    const checkAuth = async () => {
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
  }, [setUser, logout, router]);

  const handleSubmit = async (
    e: React.FormEvent
  ) => {
    e.preventDefault();

    setLoading(true);
    setError("");

    try {
      // Backend sets cookies
      await api.post("/auth/register", {
        email,
        password,
      });

      // Fetch logged in user
      const { data: me } = await api.get(
        "/auth/me"
      );

      setUser(me);

      router.push("/dashboard");

    } catch (err: unknown) {
      const error = err as {
        response?: {
          data?: {
            detail?: string;
          };
        };
      };

      setError(
        error.response?.data?.detail ||
          "Registration failed"
      );

    } finally {
      setLoading(false);
    }
  };

  if (checkingAuth) {
    return (
      <div className="min-h-screen bg-bg flex items-center justify-center">
        <Spinner className="w-6 h-6" />
      </div>
    );
  }
  return (
    <div className="min-h-screen grid-bg flex items-center justify-center px-6">
      <div className="w-full max-w-sm animate-fade-up">
        <Link href="/" className="flex items-center gap-2 mb-10">
          <div className="w-7 h-7 rounded-lg bg-accent/10 border border-accent/20 flex items-center justify-center">
            <span className="text-accent text-xs font-bold font-mono">N</span>
          </div>
          <span className="font-display font-bold">Nexus AI</span>
        </Link>

        <h1 className="font-display font-extrabold text-2xl mb-1">Create account</h1>
        <p className="text-[#5a5a7a] text-sm mb-7">Start building with Nexus AI</p>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div>
            <label className="block text-xs text-[#5a5a7a] mb-1.5 font-medium">Email</label>
            <input className="nexus-input" type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@example.com" required />
          </div>
          <div>
            <label className="block text-xs text-[#5a5a7a] mb-1.5 font-medium">Password</label>
            <input className="nexus-input" type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="min 8 characters" required minLength={8} />
          </div>

          {error && (
            <div className="px-3 py-2.5 bg-[#ff6b6b]/10 border border-[#ff6b6b]/20 rounded-lg text-xs text-[#ff6b6b]">{error}</div>
          )}

          <button className="nexus-btn-primary justify-center py-2.5 mt-1" type="submit" disabled={loading}>
            {loading ? <Spinner /> : "Create account"}
          </button>
        </form>

        <div className="h-px bg-[#1e1e2e] my-5" />
        <p className="text-center text-sm text-[#5a5a7a]">
          Already have an account?{" "}
          <Link href="/login" className="text-accent font-medium hover:underline">Sign in</Link>
        </p>
      </div>
    </div>
  );
}
