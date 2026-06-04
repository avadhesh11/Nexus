"use client";
export const dynamic = "force-dynamic";
import { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import Link from "next/link";
import { useAuthStore } from "@/store/authStore";
import { useWorkspaceStore } from "@/store/workspaceStore";
import { Avatar } from "@/components/app/Avatar";
import { Spinner } from "@/components/app/Spinner";
import api from "@/lib/api";
import { Workspace } from "@/types";
import { FileText, MessageSquare, CheckSquare, Sparkles, LogOut, Copy, Check, ChevronDown, Plus ,LayoutDashboard} from "lucide-react";

const NAV = [
  { path:"/dashboard" ,href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  {  path:"/documents" ,href: "/dashboard/documents", label: "Documents", icon: FileText },
  { path:"/chat" , href: "/dashboard/chat", label: "Chat", icon: MessageSquare },
  {  path:"/tasks" ,href: "/dashboard/tasks", label: "Tasks", icon: CheckSquare },
  { path:"/ai" , href: "/dashboard/ai", label: "AI Assistant", icon: Sparkles },
];

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const { user, setUser,logout } = useAuthStore();
  const { currentWorkspace, setCurrentWorkspace, setWorkspaces } = useWorkspaceStore();
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);
  const [showWsMenu, setShowWsMenu] = useState(false);
  const [workspaces, setWsList] = useState<Workspace[]>([]);
  const [code,setCode]=useState("");
  const [showCreateWs, setShowCreateWs] = useState(false);
const [showJoinWs, setShowJoinWs] = useState(false);
const [newWorkspaceName, setNewWorkspaceName] = useState("");
  useEffect(() => {
 

    const init = async () => {
      try {
        // Restore user if missing from store (e.g. after refresh)
        if (!user) {
          const { data: me } = await api.get("/auth/me");
          setUser(me);
        }

        // Fetch workspaces
        const { data: ws } = await api.get("/workspaces/");
        setWsList(ws);
        setWorkspaces(ws);

        // Set first workspace only if none selected
        if (!currentWorkspace && ws.length > 0) {
          setCurrentWorkspace(ws[0]);
        }
      } catch (err: unknown) {
        const error = err as { response?: { status?: number } };
        // ONLY redirect on 401 — not on network errors or 500s
        if (error?.response?.status === 401) {
        logout();
          router.push("/login");
        }
      } finally {
        setLoading(false);
      }
    };

    init();
  }, []);

  const copyInvite = () => {
    if (currentWorkspace) {
      navigator.clipboard.writeText(currentWorkspace.invite_code);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };
  const createWorkspace = async () => {
  try {
    if (!newWorkspaceName.trim()) return;

    const { data } = await api.post("/workspaces/", {
      name: newWorkspaceName,
    });

    const updated = [...workspaces, data];

    setWsList(updated);
    setWorkspaces(updated);
    setCurrentWorkspace(data);

    setNewWorkspaceName("");
    setShowCreateWs(false);
    setShowWsMenu(false);

  } catch (error) {
    console.log(error);
  }
};
  const Join=async()=>{
    try {
       if (!code.trim()) {
      console.log("Invalid code");
      return;
    }
     
        const { data } = await api.post(`/workspaces/join/${code}`);

    console.log(data);

    // update workspace list
    const updatedWorkspaces = [...workspaces, data];

    setWsList(updatedWorkspaces);
    setWorkspaces(updatedWorkspaces);

    // set joined workspace as current
    setCurrentWorkspace(data);

    // clear input
    setCode("");

      
      
    } catch (error: unknown) {
  const err = error as {
    response?: {
      data?: {
        message?: string;
      };
    };
  };

  console.log(
    err?.response?.data?.message || "Failed to join workspace"
  );
}
  }

  const handleLogout = () => {
    logout();
    router.push("/");
  };

  if (loading) return (
    <div className="min-h-screen bg-bg flex items-center justify-center">
      <Spinner className="w-6 h-6" />
    </div>
  );

  if (!currentWorkspace) return (
    <div className="min-h-screen bg-bg grid-bg flex flex-col items-center justify-center gap-4">
      <div className="w-12 h-12 rounded-2xl bg-accent/10 border border-accent/20 flex items-center justify-center mb-2">
        <Plus className="w-5 h-5 text-accent" />
      </div>
      <h2 className="font-display font-bold text-xl">No workspaces yet</h2>
      <p className="text-[#5a5a7a] text-sm">Create your first workspace to get started.</p>
      <CreateWorkspaceInline onCreated={(ws) => {
        setCurrentWorkspace(ws);
        setWsList([ws]);
        setWorkspaces([ws]);
      }} />
      <div className="w-full max-w-sm mt-2">
  <p className="text-[#5a5a7a] text-sm mb-2 text-center">
    OR Join an existing workspace
  </p>

  <div className="flex gap-2">
    <input
      className="nexus-input flex-1 uppercase tracking-widest text-center"
      value={code}
      onChange={(e) => setCode(e.target.value)}
      placeholder="6A45812"
      onKeyDown={(e) => e.key === "Enter" && Join()}
    />

    <button
      className="nexus-btn-primary min-w-[90px]"
      onClick={Join}
      disabled={!code.trim()}
    >
      Join
    </button>
  </div>
</div>
      <button onClick={handleLogout} className="text-xs text-[#5a5a7a] hover:text-[#ff6b6b] mt-4 transition-colors">
        Sign out
      </button>
    </div>
  );

  return (
    <div className="flex h-screen overflow-hidden bg-bg">
      {/* Sidebar */}
      <aside className="w-60 border-r border-[#1e1e2e] flex flex-col bg-surface flex-shrink-0">

        {/* Workspace switcher */}
        <div className="p-3 border-b border-[#1e1e2e] relative">
          <button
            onClick={() => setShowWsMenu(!showWsMenu)}
            className="w-full flex items-center gap-2 p-2 rounded-lg hover:bg-surface2 transition-colors"
          >
            <div className="w-7 h-7 rounded-lg bg-accent/10 border border-accent/20 flex items-center justify-center flex-shrink-0">
              <span className="text-accent text-xs font-bold font-display">{currentWorkspace.name[0]}</span>
            </div>
            <div className="flex-1 text-left overflow-hidden">
              <div className="text-sm font-semibold truncate">{currentWorkspace.name}</div>
              <div className="text-[10px] text-[#5a5a7a] font-mono">Workspace</div>
            </div>
            <ChevronDown className="w-3 h-3 text-[#5a5a7a]" />
          </button>

          {showWsMenu && (
            <div className="absolute top-full left-3 right-3 mt-1 bg-surface border border-[#1e1e2e] rounded-xl shadow-xl z-50 overflow-hidden animate-fade-in">
              {workspaces.map(ws => (
                <button key={ws.id}
                  onClick={() => { setCurrentWorkspace(ws); setShowWsMenu(false); }}
                  className="w-full flex items-center gap-2 px-3 py-2 hover:bg-surface2 text-left transition-colors text-sm"
                >
                  <div className="w-5 h-5 rounded bg-accent/10 flex items-center justify-center text-[10px] font-bold text-accent font-display">{ws.name[0]}</div>
                  <span className="truncate flex-1">{ws.name}</span>
                  {ws.id === currentWorkspace.id && <Check className="w-3 h-3 text-accent" />}
                </button>
              ))}
          <div className="h-px bg-[#1e1e2e]" />

<button
  onClick={() => {
    setShowCreateWs(!showCreateWs);
    setShowJoinWs(false);
  }}
  className="w-full flex items-center gap-2 px-3 py-2 text-xs text-[#5a5a7a] hover:bg-surface2 transition-colors"
>
  <Plus className="w-3 h-3" />
  Create New Workspace
</button>

{showCreateWs && (
  <div className="p-2 border-t border-[#1e1e2e] flex gap-2">
    <input
      className="nexus-input flex-1 text-xs"
      placeholder="Workspace name"
      value={newWorkspaceName}
      onChange={(e) => setNewWorkspaceName(e.target.value)}
      onKeyDown={(e) => e.key === "Enter" && createWorkspace()}
    />

    <button
      className="nexus-btn-primary text-xs px-3"
      onClick={createWorkspace}
    >
      Create
    </button>
  </div>
)}

<button
  onClick={() => {
    setShowJoinWs(!showJoinWs);
    setShowCreateWs(false);
  }}
  className="w-full flex items-center gap-2 px-3 py-2 text-xs text-[#5a5a7a] hover:bg-surface2 transition-colors"
>
  <Plus className="w-3 h-3" />
  Join Workspace
</button>

{showJoinWs && (
  <div className="p-2 border-t border-[#1e1e2e] flex gap-2">
    <input
      className="nexus-input flex-1 text-xs uppercase tracking-widest"
      placeholder="Invite code"
      value={code}
      onChange={(e) => setCode(e.target.value)}
      onKeyDown={(e) => e.key === "Enter" && Join()}
    />

    <button
      className="nexus-btn-primary text-xs px-3"
      onClick={Join}
    >
      Join
    </button>
  </div>
)}
        
        </div>
          )}
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-2 pt-3">
          <div className="text-[9px] text-[#5a5a7a] px-2.5 mb-2 font-mono tracking-widest">NAVIGATION</div>
          {NAV.map(({ href, label, icon: Icon }) => {
            const active = (pathname==href);
            return (
              <Link key={href} href={href}
                className={`sidebar-nav-item mb-0.5 ${active ? "active" : ""}`}
              >
                <Icon className="w-3.5 h-3.5 flex-shrink-0" />
                {label}
              </Link>
            );
          })}
        </nav>

        {/* User */}
        <div className="p-3 border-t border-[#1e1e2e]">
          <div className="flex items-center gap-2 p-2 rounded-lg">
            <Avatar email={user?.email || ""} size={26} />
            <div className="flex-1 overflow-hidden">
              <div className="text-xs font-medium truncate">{user?.email}</div>
            </div>
            <button onClick={handleLogout} className="text-[#5a5a7a] hover:text-[#ff6b6b] transition-colors p-1">
              <LogOut className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </aside>

      {/* Main */}
      <div className="flex-1 flex flex-col overflow-hidden">
        <header className="border-b border-[#1e1e2e] flex items-center justify-between px-5 flex-shrink-0" style={{ height: 52 }}>
          <div className="font-display font-bold text-sm">
            {NAV.find(n => pathname.startsWith(n.href))?.label || "Dashboard"}
          </div>
          <div className="flex items-center gap-2">
            <button onClick={copyInvite}
              className="flex items-center gap-1.5 px-3 py-1.5 border border-[#1e1e2e] rounded-lg text-[11px] font-mono text-[#5a5a7a] hover:border-[#2a2a3e] transition-colors"
            >
              <span>Invite:</span>
              <span className="text-accent">{currentWorkspace.invite_code}</span>
              {copied ? <Check className="w-3 h-3 text-accent" /> : <Copy className="w-3 h-3" />}
            </button>
          </div>
        </header>

        <main className="flex-1 overflow-auto">{children}</main>
      </div>

      {showWsMenu && <div className="fixed inset-0 z-40" onClick={() => setShowWsMenu(false)} />}
    </div>
  );
}

// Shown when user has no workspaces
function CreateWorkspaceInline({ onCreated }: { onCreated: (ws: Workspace) => void }) {
  const [name, setName] = useState("");
  const [loading, setLoading] = useState(false);

  const create = async () => {
    if (!name.trim()) return;
    setLoading(true);
    try {
      const { data } = await api.post("/workspaces/", { name });
      onCreated(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex gap-2 w-full max-w-sm">
      <input
        className="nexus-input flex-1"
        value={name}
        onChange={e => setName(e.target.value)}
        placeholder="Workspace name..."
        onKeyDown={e => e.key === "Enter" && create()}
        autoFocus
      />
      <button className="nexus-btn-primary" onClick={create} disabled={loading || !name.trim()}>
        {loading ? <Spinner /> : "Create"}
      </button>
    </div>
  );
}