"use client";

import { useQuery } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/store/authStore";
import { useWorkspaceStore } from "@/store/workspaceStore";
import api from "@/lib/api";
import { Spinner } from "@/components/app/Spinner";
import { Document, Task, Message } from "@/types";
import { formatRelative } from "@/lib/utils";
import {
  FileText, MessageSquare, CheckSquare, Sparkles,
  Plus, ArrowRight, Users, Zap, Brain
} from "lucide-react";

export default function DashboardPage() {
  const router = useRouter();
  const { user } = useAuthStore();
  const { currentWorkspace } = useWorkspaceStore();

  const { data: docs = [], isLoading: docsLoading } = useQuery<Document[]>({
    queryKey: ["documents", currentWorkspace?.id],
    queryFn: () => api.get(`/documents/?workspace_id=${currentWorkspace?.id}`).then(r => r.data),
    enabled: !!currentWorkspace?.id,
  });

  const { data: tasks = [], isLoading: tasksLoading } = useQuery<Task[]>({
    queryKey: ["tasks", currentWorkspace?.id],
    queryFn: () => api.get(`/tasks/?workspace_id=${currentWorkspace?.id}`).then(r => r.data),
    enabled: !!currentWorkspace?.id,
  });

  const { data: messages = [] } = useQuery<Message[]>({
    queryKey: ["messages", currentWorkspace?.id, { limit: 5 }],
    queryFn: () => api.get(`/chat/${currentWorkspace?.id}/messages?limit=5`).then(r => r.data),
    enabled: !!currentWorkspace?.id,
  });

  const todoTasks = tasks.filter(t => t.status === "todo");
  const inProgressTasks = tasks.filter(t => t.status === "in_progress");
  const doneTasks = tasks.filter(t => t.status === "done");
  const recentDocs = [...docs].sort((a, b) =>
    new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime()
  ).slice(0, 4);

  const greeting = () => {
    const h = new Date().getHours();
    if (h < 12) return "Good morning";
    if (h < 17) return "Good afternoon";
    return "Good evening";
  };

  const isLoading = docsLoading || tasksLoading;

  if (isLoading) return (
    <div className="flex items-center justify-center h-64">
      <Spinner className="w-5 h-5" />
    </div>
  );

  return (
    <div className="p-6 max-w-5xl">

      {/* Greeting */}
      <div className="mb-8 animate-fade-up">
        <div className="text-[10px] text-[#5a5a7a] font-mono tracking-widest mb-1">
          {new Date().toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric" }).toUpperCase()}
        </div>
        <h1 className="font-display font-extrabold text-3xl tracking-tight mb-1">
          {greeting()}, {user?.email?.split("@")[0]} 👋
        </h1>
        <p className="text-[#5a5a7a] text-sm">
          Here&apos;s what&apos;s happening in{" "}
          <span className="text-accent font-medium">{currentWorkspace?.name}</span>
        </p>
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6 animate-[fadeUp_0.5s_0.05s_ease_both]">
        {[
          { label: "Documents", value: docs.length, icon: FileText, color: "#7fffb2", href: "/dashboard/documents" },
          { label: "In Progress", value: inProgressTasks.length, icon: Zap, color: "#5b8aff", href: "/dashboard/tasks" },
          { label: "Todo", value: todoTasks.length, icon: CheckSquare, color: "#ffd166", href: "/dashboard/tasks" },
          { label: "Completed", value: doneTasks.length, icon: CheckSquare, color: "#7fffb2", href: "/dashboard/tasks" },
        ].map((stat) => (
          <button key={stat.label} onClick={() => router.push(stat.href)}
            className="nexus-card p-4 text-left hover:border-[#2a2a3e] transition-all group">
            <div className="flex items-center justify-between mb-3">
              <div className="w-8 h-8 rounded-lg flex items-center justify-center"
                style={{ background: stat.color + "15", border: `1px solid ${stat.color}30` }}>
                <stat.icon className="w-4 h-4" style={{ color: stat.color }} />
              </div>
              <ArrowRight className="w-3.5 h-3.5 text-[#3a3a5a] group-hover:text-[#5a5a7a] transition-colors" />
            </div>
            <div className="font-display font-bold text-2xl mb-0.5">{stat.value}</div>
            <div className="text-[11px] text-[#5a5a7a] font-mono">{stat.label.toUpperCase()}</div>
          </button>
        ))}
      </div>

      {/* Main grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">

        {/* Recent Documents */}
        <div className="md:col-span-2 nexus-card p-5 animate-[fadeUp_0.5s_0.1s_ease_both]">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <FileText className="w-4 h-4 text-accent" />
              <span className="font-semibold text-sm">Recent Documents</span>
            </div>
            <button onClick={() => router.push("/dashboard/documents")}
              className="text-[11px] text-[#5a5a7a] hover:text-accent transition-colors font-mono flex items-center gap-1">
              View all <ArrowRight className="w-3 h-3" />
            </button>
          </div>

          <div className="flex flex-col gap-2">
            {recentDocs.length > 0 ? recentDocs.map(doc => (
              <button key={doc.id} onClick={() => router.push(`/dashboard/documents/${doc.id}`)}
                className="flex items-center gap-3 p-2.5 rounded-lg hover:bg-surface2 transition-colors text-left group w-full">
                <div className="w-8 h-8 rounded-lg bg-surface2 border border-[#1e1e2e] flex items-center justify-center flex-shrink-0">
                  <FileText className="w-3.5 h-3.5 text-[#5a5a7a]" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-medium truncate">{doc.title}</div>
                  <div className="text-[10px] text-[#5a5a7a] font-mono">Updated {formatRelative(doc.updated_at)}</div>
                </div>
                <ArrowRight className="w-3.5 h-3.5 text-[#3a3a5a] group-hover:text-[#5a5a7a] opacity-0 group-hover:opacity-100 transition-all flex-shrink-0" />
              </button>
            )) : (
              <div className="text-center py-8 text-[#5a5a7a] text-sm">
                No documents yet.{" "}
                <button onClick={() => router.push("/dashboard/documents")} className="text-accent hover:underline">
                  Create one →
                </button>
              </div>
            )}
          </div>

          {docs.length > 0 && (
            <button onClick={() => router.push("/dashboard/documents")}
              className="mt-3 w-full flex items-center justify-center gap-1.5 py-2 border border-dashed border-[#2a2a3e] rounded-lg text-xs text-[#5a5a7a] hover:border-accent hover:text-accent transition-colors">
              <Plus className="w-3.5 h-3.5" /> New document
            </button>
          )}
        </div>

        {/* Quick Actions */}
        <div className="flex flex-col gap-3 animate-[fadeUp_0.5s_0.15s_ease_both]">
          <div className="nexus-card p-5">
            <div className="flex items-center gap-2 mb-4">
              <Zap className="w-4 h-4 text-[#ffd166]" />
              <span className="font-semibold text-sm">Quick Actions</span>
            </div>
            <div className="flex flex-col gap-2">
              {[
                { label: "New Document", icon: FileText, href: "/dashboard/documents", color: "#7fffb2" },
                { label: "Open Chat", icon: MessageSquare, href: "/dashboard/chat", color: "#5b8aff" },
                { label: "Add Task", icon: CheckSquare, href: "/dashboard/tasks", color: "#ffd166" },
                { label: "Ask AI", icon: Sparkles, href: "/dashboard/ai", color: "#c084fc" },
              ].map(action => (
                <button key={action.label} onClick={() => router.push(action.href)}
                  className="flex items-center gap-2.5 px-3 py-2 rounded-lg hover:bg-surface2 transition-colors text-left w-full group">
                  <div className="w-6 h-6 rounded flex items-center justify-center flex-shrink-0"
                    style={{ background: action.color + "15" }}>
                    <action.icon className="w-3.5 h-3.5" style={{ color: action.color }} />
                  </div>
                  <span className="text-sm text-[#5a5a7a] group-hover:text-[#e8e8f0] transition-colors">{action.label}</span>
                  <ArrowRight className="w-3 h-3 text-[#3a3a5a] ml-auto opacity-0 group-hover:opacity-100 transition-all" />
                </button>
              ))}
            </div>
          </div>

          {/* Workspace info */}
          <div className="nexus-card p-4">
            <div className="flex items-center gap-2 mb-3">
              <Users className="w-4 h-4 text-[#5b8aff]" />
              <span className="font-semibold text-sm">Workspace</span>
            </div>
            <div className="text-lg font-display font-bold mb-1">{currentWorkspace?.name}</div>
            <div className="flex items-center gap-1.5 mb-3">
              <span className="text-[11px] text-[#5a5a7a] font-mono">Invite code:</span>
              <span className="text-[11px] font-mono text-accent">{currentWorkspace?.invite_code}</span>
            </div>
            <div className="flex items-center gap-1.5">
              <div className="w-1.5 h-1.5 rounded-full bg-accent animate-pulse" />
              <span className="text-[11px] text-[#5a5a7a]">{currentWorkspace?.members?.length || 1} member{(currentWorkspace?.members?.length || 1) > 1 ? "s" : ""}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom row */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 animate-[fadeUp_0.5s_0.2s_ease_both]">

        {/* Active Tasks */}
        <div className="nexus-card p-5">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <CheckSquare className="w-4 h-4 text-[#ffd166]" />
              <span className="font-semibold text-sm">Active Tasks</span>
            </div>
            <button onClick={() => router.push("/dashboard/tasks")}
              className="text-[11px] text-[#5a5a7a] hover:text-accent transition-colors font-mono flex items-center gap-1">
              Board <ArrowRight className="w-3 h-3" />
            </button>
          </div>
          <div className="flex flex-col gap-2">
            {[...inProgressTasks, ...todoTasks].slice(0, 4).map(task => (
              <div key={task.id} onClick={() => router.push("/dashboard/tasks")}
                className="flex items-center gap-2.5 p-2.5 rounded-lg hover:bg-surface2 transition-colors cursor-pointer">
                <div className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${task.status === "in_progress" ? "bg-[#5b8aff]" : "bg-[#3a3a5a]"}`} />
                <span className="text-sm flex-1 truncate">{task.title}</span>
                <span className={`text-[10px] font-mono px-1.5 py-0.5 rounded border ${
                  task.priority === "high" ? "border-[#ff6b6b]/30 text-[#ff6b6b]" :
                  task.priority === "medium" ? "border-[#ffd166]/30 text-[#ffd166]" :
                  "border-[#1e1e2e] text-[#5a5a7a]"
                }`}>{task.priority}</span>
              </div>
            ))}
            {inProgressTasks.length === 0 && todoTasks.length === 0 && (
              <div className="text-center py-6 text-[#5a5a7a] text-sm">
                No active tasks.{" "}
                <button onClick={() => router.push("/dashboard/tasks")} className="text-accent hover:underline">
                  Add one →
                </button>
              </div>
            )}
          </div>
        </div>

        {/* AI + Recent chat */}
        <div className="nexus-card p-5">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Brain className="w-4 h-4 text-[#c084fc]" />
              <span className="font-semibold text-sm">Recent Chat</span>
            </div>
            <button onClick={() => router.push("/dashboard/chat")}
              className="text-[11px] text-[#5a5a7a] hover:text-accent transition-colors font-mono flex items-center gap-1">
              Open <ArrowRight className="w-3 h-3" />
            </button>
          </div>
          <div className="flex flex-col gap-2 mb-3">
            {messages.slice(-3).map(msg => (
              <div key={msg.id} className="flex items-start gap-2">
                <div className="w-5 h-5 rounded-full bg-accent/10 border border-accent/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                  <span className="text-[9px] font-bold text-accent">{msg.sender_email[0].toUpperCase()}</span>
                </div>
                <div className="flex-1 min-w-0">
                  <span className="text-[10px] text-[#5a5a7a] font-mono mr-1">{msg.sender_email.split("@")[0]}</span>
                  <span className="text-xs text-[#e8e8f0] truncate">{msg.content}</span>
                </div>
              </div>
            ))}
            {messages.length === 0 && (
              <div className="text-center py-4 text-[#5a5a7a] text-sm">No messages yet.</div>
            )}
          </div>

          {/* AI CTA */}
          <button onClick={() => router.push("/dashboard/ai")}
            className="w-full flex items-center gap-2.5 p-3 rounded-lg bg-[rgba(127,255,178,0.05)] border border-accent/10 hover:border-accent/20 hover:bg-accent/10 transition-all group">
            <div className="w-7 h-7 rounded-lg bg-accent/10 border border-accent/20 flex items-center justify-center flex-shrink-0">
              <Sparkles className="w-3.5 h-3.5 text-accent" />
            </div>
            <div className="flex-1 text-left">
              <div className="text-xs font-semibold text-accent">Ask Nexus AI</div>
              <div className="text-[10px] text-[#5a5a7a]">Searches across all your workspace docs</div>
            </div>
            <ArrowRight className="w-3.5 h-3.5 text-[#3a3a5a] group-hover:text-accent transition-colors" />
          </button>
        </div>
      </div>
    </div>
  );
}