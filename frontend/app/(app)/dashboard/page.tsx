"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/store/authStore";
import { useWorkspaceStore } from "@/store/workspaceStore";
import api from "@/lib/api";
import { Spinner } from "@/components/app/Spinner";
import { DashboardSkeleton } from "@/components/app/LoadingScreen";

import {
  Document,
  Task,
  Message,
  SinceYouWereAway,
  WorkspaceActivityResponse,
  WorkspaceActivityItem,
} from "@/types";
import { formatRelative } from "@/lib/utils";
import {
  FileText,
  MessageSquare,
  CheckSquare,
  Sparkles,
  Plus,
  ArrowRight,
  Users,
  Zap,
  Brain,
  GitPullRequest,
  GitCommit,
  Activity,
  RefreshCw,
  UserPlus,
  GitBranch,
  ShieldAlert,
  Clock,
} from "lucide-react";

export default function DashboardPage() {
  const router = useRouter();
  const { user } = useAuthStore();
  const { currentWorkspace } = useWorkspaceStore();
  const [activityFilter, setActivityFilter] = useState<string>("all");

  const { data: docs = [], isLoading: docsLoading } = useQuery<Document[]>({
    queryKey: ["documents", currentWorkspace?.id],
    queryFn: () => api.get(`/documents/?workspace_id=${currentWorkspace?.id}`).then((r) => r.data),
    enabled: !!currentWorkspace?.id,
  });

  const { data: tasks = [], isLoading: tasksLoading } = useQuery<Task[]>({
    queryKey: ["tasks", currentWorkspace?.id],
    queryFn: () => api.get(`/tasks/?workspace_id=${currentWorkspace?.id}`).then((r) => r.data),
    enabled: !!currentWorkspace?.id,
  });

  const { data: messages = [] } = useQuery<Message[]>({
    queryKey: ["messages", currentWorkspace?.id, { limit: 5 }],
    queryFn: () => api.get(`/chat/${currentWorkspace?.id}/messages?limit=5`).then((r) => r.data),
    enabled: !!currentWorkspace?.id,
  });

  const { data: digest } = useQuery<SinceYouWereAway>({
    queryKey: ["github-digest", currentWorkspace?.id],
    queryFn: () =>
      api.get(`/github/since-last-seen?workspace_id=${currentWorkspace?.id}`).then((r) => r.data),
    enabled: !!currentWorkspace?.id,
    retry: false,
  });

  // Recent Developments Activity Feed (0 LLM, Real-time Aggregation)
  const {
    data: activityData,
    isLoading: activityLoading,
    isFetching: activityFetching,
    refetch: refetchActivity,
  } = useQuery<WorkspaceActivityResponse>({
    queryKey: ["workspace-activity", currentWorkspace?.id],
    queryFn: () => api.get(`/workspaces/${currentWorkspace?.id}/activity`).then((r) => r.data),
    enabled: !!currentWorkspace?.id,
    refetchInterval: 20000,
  });

  const activities = activityData?.activities || [];
  const filteredActivities =
    activityFilter === "all"
      ? activities
      : activities.filter((a) => a.category === activityFilter);

  const messagesList = Array.isArray(messages) ? messages : [];
  const docsList = Array.isArray(docs) ? docs : [];
  const tasksList = Array.isArray(tasks) ? tasks : [];

  const todoTasks = tasksList.filter((t) => t.status === "todo");
  const inProgressTasks = tasksList.filter((t) => t.status === "in_progress");
  const doneTasks = tasksList.filter((t) => t.status === "done");
  const recentDocs = [...docsList]
    .sort((a, b) => new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime())
    .slice(0, 4);

  const greeting = () => {
    const h = new Date().getHours();
    if (h < 12) return "Good morning";
    if (h < 17) return "Good afternoon";
    return "Good evening";
  };

  const getActivityIcon = (category: WorkspaceActivityItem["category"]) => {
    switch (category) {
      case "document":
        return <FileText className="w-3.5 h-3.5 text-[#7fffb2]" />;
      case "task":
        return <CheckSquare className="w-3.5 h-3.5 text-[#ffd166]" />;
      case "chat":
        return <MessageSquare className="w-3.5 h-3.5 text-[#5b8aff]" />;
      case "member":
        return <UserPlus className="w-3.5 h-3.5 text-[#c084fc]" />;
      case "github":
        return <GitBranch className="w-3.5 h-3.5 text-[#ff79c6]" />;
      default:
        return <Activity className="w-3.5 h-3.5 text-accent" />;
    }
  };

  const isLoading = (docsLoading && docs.length === 0) || (tasksLoading && tasks.length === 0);

  if (isLoading) {
    return <DashboardSkeleton />;
  }


  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      {/* Top Greeting Header */}
      <div className="animate-fade-up">
        <div className="text-[10px] text-[#5a5a7a] font-mono tracking-widest mb-1">
          {new Date()
            .toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric" })
            .toUpperCase()}
        </div>
        <h1 className="font-display font-extrabold text-3xl tracking-tight mb-1">
          {greeting()}, {user?.email?.split("@")[0]} 👋
        </h1>
        <p className="text-[#5a5a7a] text-sm">
          Here&apos;s what&apos;s happening in{" "}
          <span className="text-accent font-medium">{currentWorkspace?.name}</span>
        </p>
      </div>

      {/* Since You Were Away Card (GitHub Digest) */}
      {digest && (digest.pull_requests_count > 0 || digest.commits_count > 0) && (
        <div className="nexus-card p-5 border-accent/20 bg-accent/5 animate-[fadeUp_0.5s_0.02s_ease_both]">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 rounded-md bg-accent/20 flex items-center justify-center">
                <Sparkles className="w-3.5 h-3.5 text-accent" />
              </div>
              <span className="font-display font-bold text-sm text-[#e8e8f0]">
                Since You Were Away
              </span>
            </div>
            <button
              onClick={() => router.push("/dashboard/integrations")}
              className="text-[11px] font-mono text-accent hover:underline flex items-center gap-1"
            >
              GitHub Hub <ArrowRight className="w-3 h-3" />
            </button>
          </div>

          <p className="text-xs text-[#e8e8f0] leading-relaxed mb-3">{digest.summary}</p>

          <div className="flex flex-wrap items-center gap-2">
            {digest.pull_requests_count > 0 && (
              <span className="flex items-center gap-1 text-[11px] font-mono px-2 py-0.5 rounded-full bg-[#5b8aff]/10 border border-[#5b8aff]/30 text-[#5b8aff]">
                <GitPullRequest className="w-3 h-3" />
                {digest.pull_requests_count} New PR{digest.pull_requests_count > 1 ? "s" : ""}
              </span>
            )}
            {digest.commits_count > 0 && (
              <span className="flex items-center gap-1 text-[11px] font-mono px-2 py-0.5 rounded-full bg-[#7fffb2]/10 border border-[#7fffb2]/30 text-[#7fffb2]">
                <GitCommit className="w-3 h-3" />
                {digest.commits_count} Recent Commit{digest.commits_count > 1 ? "s" : ""}
              </span>
            )}
          </div>
        </div>
      )}

      {/* Main Grid: Left (Overview & Operations) + Right (Recent Developments Activity Feed) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left / Center Main Area (8 cols) */}
        <div className="lg:col-span-8 space-y-6">
          {/* Stats 4-Card Row */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 animate-[fadeUp_0.5s_0.05s_ease_both]">
            {[
              {
                label: "Documents",
                value: docs.length,
                icon: FileText,
                color: "#7fffb2",
                href: "/dashboard/documents",
              },
              {
                label: "In Progress",
                value: inProgressTasks.length,
                icon: Zap,
                color: "#5b8aff",
                href: "/dashboard/tasks",
              },
              {
                label: "Todo",
                value: todoTasks.length,
                icon: CheckSquare,
                color: "#ffd166",
                href: "/dashboard/tasks",
              },
              {
                label: "Completed",
                value: doneTasks.length,
                icon: CheckSquare,
                color: "#7fffb2",
                href: "/dashboard/tasks",
              },
            ].map((stat) => (
              <button
                key={stat.label}
                onClick={() => router.push(stat.href)}
                className="nexus-card p-4 text-left hover:border-[#2a2a3e] transition-all group"
              >
                <div className="flex items-center justify-between mb-3">
                  <div
                    className="w-8 h-8 rounded-lg flex items-center justify-center"
                    style={{
                      background: stat.color + "15",
                      border: `1px solid ${stat.color}30`,
                    }}
                  >
                    <stat.icon className="w-4 h-4" style={{ color: stat.color }} />
                  </div>
                  <ArrowRight className="w-3.5 h-3.5 text-[#3a3a5a] group-hover:text-[#5a5a7a] transition-colors" />
                </div>
                <div className="font-display font-bold text-2xl mb-0.5">{stat.value}</div>
                <div className="text-[11px] text-[#5a5a7a] font-mono">
                  {stat.label.toUpperCase()}
                </div>
              </button>
            ))}
          </div>

          {/* Middle Sub-Grid: Recent Docs + Quick Actions & Workspace Info */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Recent Documents */}
            <div className="nexus-card p-5 animate-[fadeUp_0.5s_0.1s_ease_both] flex flex-col">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <FileText className="w-4 h-4 text-accent" />
                  <span className="font-semibold text-sm">Recent Documents</span>
                </div>
                <button
                  onClick={() => router.push("/dashboard/documents")}
                  className="text-[11px] text-[#5a5a7a] hover:text-accent transition-colors font-mono flex items-center gap-1"
                >
                  View all <ArrowRight className="w-3 h-3" />
                </button>
              </div>

              <div className="flex flex-col gap-2 flex-1">
                {recentDocs.length > 0 ? (
                  recentDocs.map((doc) => (
                    <button
                      key={doc.id}
                      onClick={() => router.push(`/dashboard/documents/${doc.id}`)}
                      className="flex items-center gap-3 p-2.5 rounded-lg hover:bg-surface2 transition-colors text-left group w-full"
                    >
                      <div className="w-8 h-8 rounded-lg bg-surface2 border border-[#1e1e2e] flex items-center justify-center flex-shrink-0">
                        <FileText className="w-3.5 h-3.5 text-[#5a5a7a]" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="text-sm font-medium truncate">{doc.title}</div>
                        <div className="text-[10px] text-[#5a5a7a] font-mono">
                          Updated {formatRelative(doc.updated_at)}
                        </div>
                      </div>
                      <ArrowRight className="w-3.5 h-3.5 text-[#3a3a5a] group-hover:text-[#5a5a7a] opacity-0 group-hover:opacity-100 transition-all flex-shrink-0" />
                    </button>
                  ))
                ) : (
                  <div className="text-center py-8 text-[#5a5a7a] text-sm">
                    No documents yet.{" "}
                    <button
                      onClick={() => router.push("/dashboard/documents")}
                      className="text-accent hover:underline"
                    >
                      Create one →
                    </button>
                  </div>
                )}
              </div>

              {docs.length > 0 && (
                <button
                  onClick={() => router.push("/dashboard/documents")}
                  className="mt-3 w-full flex items-center justify-center gap-1.5 py-2 border border-dashed border-[#2a2a3e] rounded-lg text-xs text-[#5a5a7a] hover:border-accent hover:text-accent transition-colors"
                >
                  <Plus className="w-3.5 h-3.5" /> New document
                </button>
              )}
            </div>

            {/* Quick Actions & Workspace Info Box */}
            <div className="flex flex-col gap-4 animate-[fadeUp_0.5s_0.15s_ease_both]">
              {/* Quick Actions */}
              <div className="nexus-card p-5">
                <div className="flex items-center gap-2 mb-3.5">
                  <Zap className="w-4 h-4 text-[#ffd166]" />
                  <span className="font-semibold text-sm">Quick Actions</span>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  {[
                    {
                      label: "New Document",
                      icon: FileText,
                      href: "/dashboard/documents",
                      color: "#7fffb2",
                    },
                    {
                      label: "Open Chat",
                      icon: MessageSquare,
                      href: "/dashboard/chat",
                      color: "#5b8aff",
                    },
                    {
                      label: "Task Board",
                      icon: CheckSquare,
                      href: "/dashboard/tasks",
                      color: "#ffd166",
                    },
                    {
                      label: "Ask AI",
                      icon: Sparkles,
                      href: "/dashboard/ai",
                      color: "#c084fc",
                    },
                  ].map((action) => (
                    <button
                      key={action.label}
                      onClick={() => router.push(action.href)}
                      className="flex items-center gap-2 p-2.5 rounded-lg bg-[#11111c] border border-[#1e1e2e] hover:border-[#2e2e46] hover:bg-surface2 transition-all text-left group"
                    >
                      <div
                        className="w-6 h-6 rounded flex items-center justify-center flex-shrink-0"
                        style={{ background: action.color + "15" }}
                      >
                        <action.icon className="w-3.5 h-3.5" style={{ color: action.color }} />
                      </div>
                      <span className="text-xs font-medium text-[#8a8aa8] group-hover:text-white transition-colors truncate">
                        {action.label}
                      </span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Workspace Info Card */}
              <div className="nexus-card p-4">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <Users className="w-4 h-4 text-[#5b8aff]" />
                    <span className="font-semibold text-sm">{currentWorkspace?.name}</span>
                  </div>
                  <button
                    onClick={() => router.push("/dashboard/settings")}
                    className="text-[10px] font-mono text-[#5a5a7a] hover:text-white"
                  >
                    Manage →
                  </button>
                </div>
                <div className="flex items-center justify-between gap-1.5 p-2 bg-[#12121e] rounded-lg border border-[#1e1e2e] mb-2.5">
                  <span className="text-[10px] text-[#5a5a7a] font-mono">INVITE CODE</span>
                  <span className="text-xs font-mono font-bold text-accent tracking-wider">
                    {currentWorkspace?.invite_code}
                  </span>
                </div>
                <div className="flex items-center gap-2 text-[11px] text-[#7a7a9a]">
                  <div className="w-2 h-2 rounded-full bg-accent animate-pulse" />
                  <span>
                    {currentWorkspace?.members?.length || 1} workspace member
                    {(currentWorkspace?.members?.length || 1) > 1 ? "s" : ""} active
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Bottom Row: Active Tasks + Recent Chat */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 animate-[fadeUp_0.5s_0.2s_ease_both]">
            {/* Active Tasks */}
            <div className="nexus-card p-5">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <CheckSquare className="w-4 h-4 text-[#ffd166]" />
                  <span className="font-semibold text-sm">Active Tasks</span>
                </div>
                <button
                  onClick={() => router.push("/dashboard/tasks")}
                  className="text-[11px] text-[#5a5a7a] hover:text-accent transition-colors font-mono flex items-center gap-1"
                >
                  Board <ArrowRight className="w-3 h-3" />
                </button>
              </div>
              <div className="flex flex-col gap-2">
                {[...inProgressTasks, ...todoTasks].slice(0, 4).map((task) => (
                  <div
                    key={task.id}
                    onClick={() => router.push("/dashboard/tasks")}
                    className="flex items-center gap-2.5 p-2.5 rounded-lg hover:bg-surface2 transition-colors cursor-pointer border border-transparent hover:border-[#1e1e2e]"
                  >
                    <div
                      className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${
                        task.status === "in_progress" ? "bg-[#5b8aff]" : "bg-[#ffd166]"
                      }`}
                    />
                    <span className="text-xs text-white font-medium flex-1 truncate">
                      {task.title}
                    </span>
                    <span
                      className={`text-[10px] font-mono px-1.5 py-0.5 rounded border ${
                        task.priority === "high"
                          ? "border-[#ff6b6b]/30 text-[#ff6b6b]"
                          : task.priority === "medium"
                          ? "border-[#ffd166]/30 text-[#ffd166]"
                          : "border-[#1e1e2e] text-[#5a5a7a]"
                      }`}
                    >
                      {task.priority}
                    </span>
                  </div>
                ))}
                {inProgressTasks.length === 0 && todoTasks.length === 0 && (
                  <div className="text-center py-6 text-[#5a5a7a] text-sm">
                    No active tasks.{" "}
                    <button
                      onClick={() => router.push("/dashboard/tasks")}
                      className="text-accent hover:underline"
                    >
                      Add one →
                    </button>
                  </div>
                )}
              </div>
            </div>

            {/* AI Assistant + Recent Chat */}
            <div className="nexus-card p-5 flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <Brain className="w-4 h-4 text-[#c084fc]" />
                    <span className="font-semibold text-sm">Team Chat</span>
                  </div>
                  <button
                    onClick={() => router.push("/dashboard/chat")}
                    className="text-[11px] text-[#5a5a7a] hover:text-accent transition-colors font-mono flex items-center gap-1"
                  >
                    Open <ArrowRight className="w-3 h-3" />
                  </button>
                </div>
                <div className="flex flex-col gap-2 mb-3">
                  {messagesList.slice(-3).map((msg) => (
                    <div key={msg.id} className="flex items-start gap-2">
                      <div className="w-5 h-5 rounded-full bg-accent/10 border border-accent/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                        <span className="text-[9px] font-bold text-accent">
                          {(msg.sender_email?.[0] || "U").toUpperCase()}
                        </span>
                      </div>
                      <div className="flex-1 min-w-0">
                        <span className="text-[10px] text-[#5a5a7a] font-mono mr-1">
                          @{msg.sender_email ? msg.sender_email.split("@")[0] : "user"}:
                        </span>
                        <span className="text-xs text-[#e8e8f0] truncate">{msg.content}</span>
                      </div>
                    </div>
                  ))}
                  {messagesList.length === 0 && (
                    <div className="text-center py-4 text-[#5a5a7a] text-xs">
                      No chat messages yet.
                    </div>
                  )}
                </div>
              </div>

              {/* AI CTA */}
              <button
                onClick={() => router.push("/dashboard/ai")}
                className="w-full flex items-center gap-2.5 p-3 rounded-lg bg-[rgba(127,255,178,0.05)] border border-accent/15 hover:border-accent/30 hover:bg-accent/10 transition-all group"
              >
                <div className="w-7 h-7 rounded-lg bg-accent/10 border border-accent/20 flex items-center justify-center flex-shrink-0">
                  <Sparkles className="w-3.5 h-3.5 text-accent" />
                </div>
                <div className="flex-1 text-left">
                  <div className="text-xs font-semibold text-accent">Ask Nexus AI Hub</div>
                  <div className="text-[10px] text-[#7a7a9a]">
                    Search documents, codebase & team intelligence
                  </div>
                </div>
                <ArrowRight className="w-3.5 h-3.5 text-[#3a3a5a] group-hover:text-accent transition-colors" />
              </button>
            </div>
          </div>
        </div>

        {/* Right Sidebar: Recent Developments & Live Workspace Activity Feed (4 cols) */}
        <div className="lg:col-span-4 nexus-card p-5 animate-[fadeUp_0.5s_0.1s_ease_both] flex flex-col">
          {/* Header */}
          <div className="flex items-center justify-between mb-3 pb-3 border-b border-[#1e1e2e]">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg bg-accent/10 border border-accent/20 flex items-center justify-center">
                <Activity className="w-4 h-4 text-accent" />
              </div>
              <div>
                <h2 className="font-display font-bold text-sm text-white flex items-center gap-2">
                  <span>Recent Developments</span>
                </h2>
                <div className="flex items-center gap-1.5 text-[10px] text-[#5a5a7a] font-mono">
                  <span className="w-1.5 h-1.5 rounded-full bg-accent animate-pulse" />
                  <span>LIVE WORKSPACE FEED</span>
                </div>
              </div>
            </div>

            <button
              onClick={() => refetchActivity()}
              disabled={activityFetching}
              title="Refresh recent activity"
              className="p-1.5 rounded-lg border border-[#1e1e2e] bg-[#12121e] text-[#5a5a7a] hover:text-accent hover:border-accent/40 transition-all"
            >
              <RefreshCw
                className={`w-3.5 h-3.5 ${activityFetching ? "animate-spin text-accent" : ""}`}
              />
            </button>
          </div>

          {/* Category Filter Pills */}
          <div className="flex items-center gap-1 overflow-x-auto pb-2 mb-3 scrollbar-none">
            {[
              { id: "all", label: "All" },
              { id: "task", label: "Tasks" },
              { id: "document", label: "Docs" },
              { id: "chat", label: "Chat" },
              { id: "member", label: "Team" },
              { id: "github", label: "GitHub" },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActivityFilter(tab.id)}
                className={`text-[10px] font-mono px-2 py-1 rounded-md border transition-all flex-shrink-0 ${
                  activityFilter === tab.id
                    ? "bg-accent/15 border-accent text-accent font-semibold"
                    : "bg-[#10101a] border-[#1e1e2e] text-[#60607a] hover:border-[#2e2e46] hover:text-white"
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Activity Timeline List */}
          <div className="flex-1 flex flex-col gap-2.5 max-h-[620px] overflow-y-auto pr-1">
            {activityLoading && activities.length === 0 ? (
              <div className="flex items-center justify-center py-12">
                <Spinner className="w-4 h-4 text-accent" />
              </div>
            ) : filteredActivities.length > 0 ? (
              filteredActivities.map((act) => (
                <div
                  key={act.id}
                  onClick={() => act.target_link && router.push(act.target_link)}
                  className={`group relative p-3 rounded-xl border bg-[#0d0d16] hover:bg-[#131322] transition-all cursor-pointer ${
                    act.category === "task"
                      ? "border-[#ffd166]/20 hover:border-[#ffd166]/50"
                      : act.category === "document"
                      ? "border-[#7fffb2]/20 hover:border-[#7fffb2]/50"
                      : act.category === "chat"
                      ? "border-[#5b8aff]/20 hover:border-[#5b8aff]/50"
                      : act.category === "github"
                      ? "border-[#ff79c6]/20 hover:border-[#ff79c6]/50"
                      : "border-[#1e1e2e] hover:border-[#2e2e46]"
                  }`}
                >
                  <div className="flex items-start gap-2.5">
                    <div className="w-6 h-6 rounded-lg bg-[#141424] border border-[#222238] flex items-center justify-center flex-shrink-0 mt-0.5">
                      {getActivityIcon(act.category)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-1 mb-0.5">
                        <span className="text-[10px] font-mono text-[#60607a] uppercase tracking-wider">
                          {act.action}
                        </span>
                        <span className="text-[10px] text-[#4a4a6a] font-mono flex-shrink-0 flex items-center gap-0.5">
                          <Clock className="w-2.5 h-2.5" />
                          {formatRelative(act.created_at)}
                        </span>
                      </div>

                      <div className="text-xs font-semibold text-white truncate leading-snug group-hover:text-accent transition-colors">
                        {act.title}
                      </div>

                      {act.description && (
                        <div className="text-[11px] text-[#7a7a9a] line-clamp-2 mt-0.5 leading-relaxed">
                          {act.description}
                        </div>
                      )}

                      {act.actor_email && (
                        <div className="flex items-center gap-1.5 mt-1.5">
                          <span className="text-[9px] font-mono px-1.5 py-0.2 rounded bg-[#141422] text-[#8a8aa8] border border-[#1e1e2e]">
                            @{act.actor_email.split("@")[0]}
                          </span>
                          {act.status && (
                            <span className="text-[9px] font-mono uppercase px-1 py-0.2 rounded bg-[#18182a] text-[#ffd166] border border-[#282842]">
                              {act.status}
                            </span>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-12 rounded-xl border border-dashed border-[#1e1e2e] text-xs text-[#5a5a7a] flex flex-col items-center justify-center gap-1.5">
                <Activity className="w-5 h-5 text-[#3a3a5a]" />
                <span>No recent developments recorded.</span>
                <span className="text-[10px] text-[#404060]">
                  Events appear when tasks, documents, or chat updates occur.
                </span>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}