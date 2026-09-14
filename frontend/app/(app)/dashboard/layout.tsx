"use client";
export const dynamic = "force-dynamic";
import { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import Link from "next/link";
import { useAuthStore } from "@/store/authStore";
import { useWorkspaceStore } from "@/store/workspaceStore";
import { useThemeStore } from "@/store/themeStore";
import { Avatar } from "@/components/app/Avatar";
import { Spinner } from "@/components/app/Spinner";
import api from "@/lib/api";
import { Workspace } from "@/types";
import { 
  FileText, 
  MessageSquare, 
  CheckSquare, 
  Sparkles, 
  LogOut, 
  Copy, 
  Check, 
  ChevronDown, 
  Plus, 
  LayoutDashboard, 
  GitPullRequest, 
  Settings, 
  Workflow,
  PanelLeft,
  PanelLeftClose,
  Sun,
  Moon,
  ChevronLeft,
  ChevronRight
} from "lucide-react";

const NAV = [
  { path: "/dashboard", href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { path: "/flows", href: "/dashboard/flows", label: "Nexus Flow", icon: Workflow },
  { path: "/documents", href: "/dashboard/documents", label: "Documents", icon: FileText },
  { path: "/chat", href: "/dashboard/chat", label: "Chat", icon: MessageSquare },
  { path: "/tasks", href: "/dashboard/tasks", label: "Tasks", icon: CheckSquare },
  { path: "/ai", href: "/dashboard/ai", label: "AI Assistant", icon: Sparkles },
  { path: "/integrations", href: "/dashboard/integrations", label: "GitHub Hub", icon: GitPullRequest },
  { path: "/settings", href: "/dashboard/settings", label: "Settings", icon: Settings },
];

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const { user, setUser,logout } = useAuthStore();
  const { currentWorkspace, setCurrentWorkspace, setWorkspaces } = useWorkspaceStore();
  const { theme, toggleTheme } = useThemeStore();
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [loading, setLoading] = useState(!user || !currentWorkspace);
  const [copied, setCopied] = useState(false);
  const [showWsMenu, setShowWsMenu] = useState(false);
  const [workspaces, setWsList] = useState<Workspace[]>([]);
  const [code, setCode] = useState("");
  const [showCreateWs, setShowCreateWs] = useState(false);
  const [showJoinWs, setShowJoinWs] = useState(false);
  const [newWorkspaceName, setNewWorkspaceName] = useState("");

  useEffect(() => {
    try {
      const stored = localStorage.getItem("nexus-sidebar-collapsed");
      if (stored === "true") {
        setIsCollapsed(true);
      }
    } catch {}
  }, []);

  const handleToggleCollapse = () => {
    setIsCollapsed(prev => {
      const next = !prev;
      try {
        localStorage.setItem("nexus-sidebar-collapsed", String(next));
      } catch {}
      return next;
    });
  };

  useEffect(() => {
    let isMounted = true;

    const init = async () => {
      try {
        // Parallelize user info and workspace list fetching
        const [mePromise, wsPromise] = [
          !user ? api.get("/auth/me") : Promise.resolve({ data: user }),
          api.get("/workspaces/")
        ];

        const [meRes, wsRes] = await Promise.all([mePromise, wsPromise]);
        if (!isMounted) return;

        if (meRes?.data && !user) {
          setUser(meRes.data);
        }

        const ws = wsRes.data || [];
        setWsList(ws);
        setWorkspaces(ws);

        // Validate persisted workspace belongs to this user, otherwise reset
        const belongsToUser = currentWorkspace && ws.some((w: Workspace) => w.id === currentWorkspace.id);
        if (!belongsToUser && ws.length > 0) {
          setCurrentWorkspace(ws[0]);
        } else if (ws.length === 0) {
          setCurrentWorkspace(null as unknown as Workspace);
        }
      } catch (err: unknown) {
        const error = err as { response?: { status?: number } };
        if (error?.response?.status === 401) {
          logout();
          router.push("/login");
        }
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    init();
    return () => {
      isMounted = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
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
      <aside
        className={`${
          isCollapsed ? "w-16" : "w-60"
        } border-r border-nexus-border flex flex-col bg-surface flex-shrink-0 transition-all duration-300 ease-in-out relative z-30 select-none`}
      >
        {/* Workspace switcher */}
        <div className={`p-3 border-b border-nexus-border relative ${isCollapsed ? "flex justify-center" : ""}`}>
          <button
            onClick={() => setShowWsMenu(!showWsMenu)}
            className={`w-full flex items-center gap-2 p-1.5 rounded-lg hover:bg-surface2 transition-colors ${
              isCollapsed ? "justify-center" : ""
            }`}
            title={isCollapsed ? `${currentWorkspace.name} (Switch workspace)` : undefined}
          >
            <div className="w-8 h-8 rounded-lg bg-accent-dim border border-accent-border flex items-center justify-center flex-shrink-0 shadow-sm">
              <span className="text-accent text-xs font-bold font-display">{currentWorkspace.name[0]}</span>
            </div>
            {!isCollapsed && (
              <>
                <div className="flex-1 text-left overflow-hidden">
                  <div className="text-sm font-semibold text-nexus-text truncate">{currentWorkspace.name}</div>
                  <div className="text-[10px] text-nexus-muted font-mono">Workspace</div>
                </div>
                <ChevronDown className="w-3.5 h-3.5 text-nexus-muted flex-shrink-0" />
              </>
            )}
          </button>

          {showWsMenu && (
            <div
              className={`absolute mt-1 bg-surface border border-nexus-border rounded-xl shadow-2xl z-50 overflow-hidden animate-fade-in ${
                isCollapsed ? "top-2 left-16 w-60" : "top-full left-3 right-3"
              }`}
            >
              <div className="p-2 border-b border-nexus-border text-[10px] font-mono tracking-widest text-nexus-muted">
                SELECT WORKSPACE
              </div>
              <div className="max-h-56 overflow-y-auto">
                {workspaces.map((ws) => (
                  <button
                    key={ws.id}
                    onClick={() => {
                      setCurrentWorkspace(ws);
                      setShowWsMenu(false);
                    }}
                    className="w-full flex items-center gap-2.5 px-3 py-2 hover:bg-surface2 text-left transition-colors text-sm text-nexus-text"
                  >
                    <div className="w-6 h-6 rounded bg-accent-dim flex items-center justify-center text-[10px] font-bold text-accent font-display">
                      {ws.name[0]}
                    </div>
                    <span className="truncate flex-1 font-medium">{ws.name}</span>
                    {ws.id === currentWorkspace.id && <Check className="w-3.5 h-3.5 text-accent" />}
                  </button>
                ))}
              </div>
              <div className="h-px bg-nexus-border" />

              <button
                onClick={() => {
                  setShowCreateWs(!showCreateWs);
                  setShowJoinWs(false);
                }}
                className="w-full flex items-center gap-2 px-3 py-2 text-xs text-nexus-muted hover:bg-surface2 hover:text-nexus-text transition-colors"
              >
                <Plus className="w-3.5 h-3.5" />
                Create New Workspace
              </button>

              {showCreateWs && (
                <div className="p-2 border-t border-nexus-border flex gap-2">
                  <input
                    className="nexus-input flex-1 text-xs"
                    placeholder="Workspace name"
                    value={newWorkspaceName}
                    onChange={(e) => setNewWorkspaceName(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && createWorkspace()}
                    autoFocus
                  />
                  <button className="nexus-btn-primary text-xs px-3" onClick={createWorkspace}>
                    Create
                  </button>
                </div>
              )}

              <button
                onClick={() => {
                  setShowJoinWs(!showJoinWs);
                  setShowCreateWs(false);
                }}
                className="w-full flex items-center gap-2 px-3 py-2 text-xs text-nexus-muted hover:bg-surface2 hover:text-nexus-text transition-colors"
              >
                <Plus className="w-3.5 h-3.5" />
                Join Workspace
              </button>

              {showJoinWs && (
                <div className="p-2 border-t border-nexus-border flex gap-2">
                  <input
                    className="nexus-input flex-1 text-xs uppercase tracking-widest"
                    placeholder="Invite code"
                    value={code}
                    onChange={(e) => setCode(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && Join()}
                    autoFocus
                  />
                  <button className="nexus-btn-primary text-xs px-3" onClick={Join}>
                    Join
                  </button>
                </div>
              )}

              <Link
                href="/dashboard/settings"
                onClick={() => setShowWsMenu(false)}
                className="w-full flex items-center gap-2 px-3 py-2 text-xs text-nexus-muted hover:bg-surface2 hover:text-nexus-text transition-colors border-t border-nexus-border"
              >
                <Settings className="w-3.5 h-3.5 text-accent" />
                Workspace Settings
              </Link>
            </div>
          )}
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-2 pt-3 space-y-1 overflow-y-auto overflow-x-hidden">
          {!isCollapsed ? (
            <div className="text-[9px] text-nexus-muted px-2.5 mb-2 font-mono tracking-widest">
              NAVIGATION
            </div>
          ) : (
            <div className="w-6 h-px bg-nexus-border mx-auto mb-2" />
          )}

          {NAV.map(({ href, label, icon: Icon }) => {
            const active = href === "/dashboard" ? pathname === "/dashboard" : pathname.startsWith(href);
            return (
              <Link
                key={href}
                href={href}
                className={`sidebar-nav-item relative group ${active ? "active" : ""} ${
                  isCollapsed ? "justify-center px-0 h-10 w-10 mx-auto" : ""
                }`}
                title={isCollapsed ? label : undefined}
              >
                <Icon className={`w-4 h-4 flex-shrink-0 ${active ? "text-accent" : "text-nexus-muted group-hover:text-nexus-text"}`} />
                {!isCollapsed && <span className="truncate">{label}</span>}

                {/* Floating tooltip on collapsed hover */}
                {isCollapsed && (
                  <div className="absolute left-full ml-3 px-2.5 py-1 bg-surface border border-nexus-border text-xs rounded-md shadow-xl pointer-events-none opacity-0 group-hover:opacity-100 transition-all duration-150 z-50 whitespace-nowrap text-nexus-text">
                    {label}
                  </div>
                )}
              </Link>
            );
          })}
        </nav>

        {/* Bottom controls & Theme Toggle & Sidebar Minimize */}
        <div className="p-2 border-t border-nexus-border space-y-1">
          {/* Theme Toggle in Sidebar */}
          <button
            onClick={toggleTheme}
            className={`w-full flex items-center rounded-lg text-xs text-nexus-muted hover:text-nexus-text hover:bg-surface2 transition-colors relative group ${
              isCollapsed ? "justify-center h-9 w-9 mx-auto p-0" : "gap-2.5 px-2.5 py-2"
            }`}
            title={theme === "dark" ? "Switch to Light Mode" : "Switch to Dark Mode"}
          >
            {theme === "dark" ? (
              <Sun className="w-4 h-4 text-[#ffd166] flex-shrink-0" />
            ) : (
              <Moon className="w-4 h-4 text-[#5b8aff] flex-shrink-0" />
            )}
            {!isCollapsed && <span>{theme === "dark" ? "Light Mode" : "Dark Mode"}</span>}

            {isCollapsed && (
              <div className="absolute left-full ml-3 px-2.5 py-1 bg-surface border border-nexus-border text-xs rounded-md shadow-xl pointer-events-none opacity-0 group-hover:opacity-100 transition-all duration-150 z-50 whitespace-nowrap text-nexus-text">
                {theme === "dark" ? "Light Mode" : "Dark Mode"}
              </div>
            )}
          </button>

          {/* Minimize / Expand Toggle Button */}
          <button
            onClick={handleToggleCollapse}
            className={`w-full flex items-center rounded-lg text-xs text-nexus-muted hover:text-nexus-text hover:bg-surface2 transition-colors relative group ${
              isCollapsed ? "justify-center h-9 w-9 mx-auto p-0" : "gap-2.5 px-2.5 py-2"
            }`}
            title={isCollapsed ? "Expand Sidebar (Ctrl+B)" : "Minimize Sidebar"}
          >
            {isCollapsed ? (
              <ChevronRight className="w-4 h-4 flex-shrink-0" />
            ) : (
              <ChevronLeft className="w-4 h-4 flex-shrink-0" />
            )}
            {!isCollapsed && <span>Minimize Sidebar</span>}

            {isCollapsed && (
              <div className="absolute left-full ml-3 px-2.5 py-1 bg-surface border border-nexus-border text-xs rounded-md shadow-xl pointer-events-none opacity-0 group-hover:opacity-100 transition-all duration-150 z-50 whitespace-nowrap text-nexus-text">
                Expand Sidebar
              </div>
            )}
          </button>

          <div className="h-px bg-nexus-border my-1" />

          {/* User info */}
          <div
            className={`flex items-center rounded-lg ${
              isCollapsed ? "justify-center p-1" : "gap-2 p-1.5"
            }`}
          >
            <div title={user?.email || ""}>
              <Avatar email={user?.email || ""} size={26} />
            </div>
            {!isCollapsed && (
              <div className="flex-1 overflow-hidden">
                <div className="text-xs font-medium text-nexus-text truncate">{user?.email}</div>
              </div>
            )}
            <button
              onClick={handleLogout}
              className="text-nexus-muted hover:text-[#ff6b6b] transition-colors p-1.5 rounded hover:bg-surface2"
              title="Sign out"
            >
              <LogOut className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </aside>

      {/* Main */}
      <div className="flex-1 flex flex-col overflow-hidden bg-bg">
        <header
          className="border-b border-nexus-border bg-surface/50 backdrop-blur-sm flex items-center justify-between px-4 sm:px-6 flex-shrink-0 z-20"
          style={{ height: 52 }}
        >
          <div className="flex items-center gap-3">
            <button
              onClick={handleToggleCollapse}
              className="p-1.5 rounded-lg text-nexus-muted hover:text-nexus-text hover:bg-surface2 transition-colors"
              title={isCollapsed ? "Expand sidebar" : "Minimize sidebar"}
            >
              {isCollapsed ? <PanelLeft className="w-4 h-4 text-accent" /> : <PanelLeftClose className="w-4 h-4" />}
            </button>

            <div className="font-display font-bold text-sm text-nexus-text">
              {NAV.filter((n) => n.href !== "/dashboard" && pathname.startsWith(n.href))[0]?.label ||
                (pathname === "/dashboard" ? "Dashboard" : "Dashboard")}
            </div>
          </div>

          <div className="flex items-center gap-2.5">
            {/* Header Theme Toggle */}
            <button
              onClick={toggleTheme}
              className="flex items-center justify-center w-8 h-8 rounded-lg border border-nexus-border text-nexus-muted hover:text-nexus-text hover:bg-surface2 transition-colors"
              title={theme === "dark" ? "Switch to Light Mode" : "Switch to Dark Mode"}
            >
              {theme === "dark" ? (
                <Sun className="w-4 h-4 text-[#ffd166]" />
              ) : (
                <Moon className="w-4 h-4 text-[#5b8aff]" />
              )}
            </button>

            {(!currentWorkspace.settings_restrict_invites || currentWorkspace.owner_id === user?.id) && (
              <button
                onClick={copyInvite}
                className="flex items-center gap-1.5 px-3 py-1.5 border border-nexus-border rounded-lg text-[11px] font-mono text-nexus-muted hover:border-nexus-border2 hover:text-nexus-text transition-colors bg-surface"
              >
                <span>Invite:</span>
                <span className="text-accent font-semibold">{currentWorkspace.invite_code}</span>
                {copied ? <Check className="w-3 h-3 text-accent" /> : <Copy className="w-3 h-3" />}
              </button>
            )}
          </div>
        </header>

        <main className="flex-1 overflow-auto bg-bg">{children}</main>
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