"use client";

import { useState, useRef, useEffect, useMemo } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useWorkspaceStore } from "@/store/workspaceStore";
import { useAuthStore } from "@/store/authStore";
import { ChatMessage, AIChatMessage, AIChatSession, WorkspaceSettings } from "@/types";
import { Avatar } from "@/components/app/Avatar";
import { Spinner } from "@/components/app/Spinner";
import {
  Send,
  Sparkles,
  Database,
  Trash2,
  Plus,
  MessageSquare,
  Edit2,
  Check,
  X,
  Copy,
  ChevronLeft,
  ChevronRight,
  Zap,
  Clock,
  Search,
  Bot
} from "lucide-react";
import api from "@/lib/api";

interface AIMessage {
  id?: string;
  role: "user" | "model";
  content: string;
  sources?: number;
  created_at?: string;
}

interface ContentBlock {
  text?: string;
  content?: string;
}

export default function AIPage() {
  const { currentWorkspace } = useWorkspaceStore();
  const { user } = useAuthStore();
  const queryClient = useQueryClient();

  const [activeSessionId, setActiveSessionId] = useState<string | null>(null);
  const [messages, setMessages] = useState<AIMessage[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [editingSessionId, setEditingSessionId] = useState<string | null>(null);
  const [editTitle, setEditTitle] = useState("");
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);
  const [errorBanner, setErrorBanner] = useState<string | null>(null);

  const bottomRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  // 1. Fetch AI Sessions list
  const { data: sessions, isLoading: loadingSessions } = useQuery<AIChatSession[]>({
    queryKey: ["ai-sessions", currentWorkspace?.id],
    queryFn: () => api.get(`/ai/${currentWorkspace?.id}/sessions`).then((r) => r.data),
    enabled: !!currentWorkspace?.id,
    staleTime: 10000,
  });

  const sessionList = useMemo(() => sessions || [], [sessions]);

  // 2. Fetch Workspace Settings & Daily Quota
  const { data: settings } = useQuery<WorkspaceSettings>({
    queryKey: ["workspace-settings", currentWorkspace?.id],
    queryFn: () => api.get(`/workspaces/${currentWorkspace?.id}/settings`).then((r) => r.data),
    enabled: !!currentWorkspace?.id,
  });

  // Auto-select latest session if none selected and sessions exist
  useEffect(() => {
    if (sessions && sessions.length > 0 && !activeSessionId) {
      setActiveSessionId(sessions[0].id);
    }
  }, [sessions, activeSessionId]);

  // 3. Fetch messages for the currently active session
  const { data: sessionMessages, isLoading: loadingMessages } = useQuery<AIChatMessage[]>({
    queryKey: ["ai-session-messages", currentWorkspace?.id, activeSessionId],
    queryFn: () =>
      activeSessionId
        ? api.get(`/ai/${currentWorkspace?.id}/sessions/${activeSessionId}/messages`).then((r) => r.data)
        : Promise.resolve([]),
    enabled: !!currentWorkspace?.id && !!activeSessionId,
    staleTime: 30000,
  });

  useEffect(() => {
    if (!activeSessionId) {
      setMessages([]);
    } else if (sessionMessages) {
      setMessages(
        sessionMessages.map((m) => ({
          id: m.id,
          role: m.role,
          content: m.message,
          created_at: m.created_at,
        }))
      );
    }
  }, [sessionMessages, activeSessionId]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  // Handle New Chat creation
  const handleNewChat = () => {
    setActiveSessionId(null);
    setMessages([]);
    setInput("");
    setErrorBanner(null);
    inputRef.current?.focus();
  };

  // Rename Session Mutation
  const renameMutation = useMutation({
    mutationFn: ({ id, title }: { id: string; title: string }) =>
      api.patch(`/ai/${currentWorkspace?.id}/sessions/${id}`, { title }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["ai-sessions", currentWorkspace?.id] });
      setEditingSessionId(null);
      setEditTitle("");
    },
  });

  // Delete Session Mutation
  const deleteMutation = useMutation({
    mutationFn: (id: string) => api.delete(`/ai/${currentWorkspace?.id}/sessions/${id}`),
    onSuccess: (_, deletedId) => {
      queryClient.invalidateQueries({ queryKey: ["ai-sessions", currentWorkspace?.id] });
      if (activeSessionId === deletedId) {
        const remaining = sessionList.filter((s) => s.id !== deletedId);
        if (remaining.length > 0) {
          setActiveSessionId(remaining[0].id);
        } else {
          handleNewChat();
        }
      }
    },
  });

  // Clear All History Mutation
  const clearAllMutation = useMutation({
    mutationFn: () => api.delete(`/ai/${currentWorkspace?.id}/history`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["ai-sessions", currentWorkspace?.id] });
      queryClient.invalidateQueries({ queryKey: ["workspace-settings", currentWorkspace?.id] });
      handleNewChat();
    },
  });

  const handleStartRename = (s: AIChatSession, e: React.MouseEvent) => {
    e.stopPropagation();
    setEditingSessionId(s.id);
    setEditTitle(s.title);
  };

  const handleSaveRename = (s: AIChatSession, e: React.MouseEvent | React.FormEvent) => {
    e.stopPropagation();
    if (!editTitle.trim()) return;
    renameMutation.mutate({ id: s.id, title: editTitle.trim() });
  };

  const handleCancelRename = (e: React.MouseEvent) => {
    e.stopPropagation();
    setEditingSessionId(null);
    setEditTitle("");
  };

  const copyToClipboard = (text: string, index: number) => {
    navigator.clipboard.writeText(text);
    setCopiedIndex(index);
    setTimeout(() => setCopiedIndex(null), 2000);
  };

  const sendMessage = async () => {
    if (!input.trim() || loading || !currentWorkspace?.id) return;

    const userText = input.trim();
    const userMsg: AIMessage = { role: "user", content: userText };
    const history: ChatMessage[] = messages.map((m) => ({ role: m.role, content: m.content }));

    setMessages((prev) => [...prev, userMsg]);
    setInput("");
    setLoading(true);
    setErrorBanner(null);

    try {
      const res = await api.post("/ai/chat", {
        message: userText,
        workspace_id: currentWorkspace.id,
        session_id: activeSessionId || undefined,
        history,
      });

      const responseText =
        typeof res.data.response === "string"
          ? res.data.response
          : Array.isArray(res.data.response)
          ? res.data.response
              .map((b: ContentBlock) => b.text || b.content || "")
              .join("")
          : JSON.stringify(res.data.response);

      const aiMsg: AIMessage = {
        role: "model",
        content: responseText || "I couldn't process that response.",
        sources: res.data.sources_used,
      };

      setMessages((prev) => [...prev, aiMsg]);

      // If new session was generated, update active session ID & invalidate sessions list
      if (res.data.session_id && res.data.session_id !== activeSessionId) {
        setActiveSessionId(res.data.session_id);
      }

      queryClient.invalidateQueries({ queryKey: ["ai-sessions", currentWorkspace.id] });
      queryClient.invalidateQueries({ queryKey: ["workspace-settings", currentWorkspace.id] });
    } catch (err: unknown) {
      const error = err as { response?: { status?: number; data?: { detail?: string } } };
      const errorMessage =
        error.response?.data?.detail || "Something went wrong while connecting to Nexus AI. Please try again.";
      setErrorBanner(errorMessage);
      setMessages((prev) => [
        ...prev,
        {
          role: "model",
          content: `⚠️ **Error:** ${errorMessage}`,
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const filteredSessions = useMemo(() => {
    if (!searchQuery.trim()) return sessionList;
    return sessionList.filter((s) => s.title.toLowerCase().includes(searchQuery.toLowerCase()));
  }, [sessionList, searchQuery]);

  const quotaRemaining = settings?.ai_daily_limit
    ? Math.max(0, settings.ai_daily_limit - (settings.ai_today_usage || 0))
    : null;

  return (
    <div className="flex h-full overflow-hidden bg-bg relative">
      {/* Sessions Sidebar */}
      <aside
        className={`border-r border-[#1e1e2e] bg-[#0c0c14] flex flex-col transition-all duration-300 z-20 ${
          sidebarOpen ? "w-64" : "w-0 -translate-x-full overflow-hidden border-none"
        }`}
      >
        <div className="p-3 border-b border-[#1e1e2e] flex items-center justify-between gap-2">
          <button
            onClick={handleNewChat}
            className="flex-1 flex items-center justify-center gap-2 px-3 py-2 rounded-lg bg-accent/10 border border-accent/30 text-accent hover:bg-accent/20 transition-all font-medium text-xs shadow-sm hover:shadow-accent/10"
          >
            <Plus className="w-4 h-4" />
            <span>New Chat</span>
          </button>
          {sessionList.length > 0 && (
            <button
              onClick={() => {
                if (confirm("Are you sure you want to clear all chat sessions?")) {
                  clearAllMutation.mutate();
                }
              }}
              className="p-2 text-[#5a5a7a] hover:text-[#ff6b6b] hover:bg-[#ff6b6b]/10 rounded-lg transition-colors"
              title="Clear all chats"
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {/* Search */}
        {sessionList.length > 3 && (
          <div className="px-3 pt-2">
            <div className="flex items-center gap-2 px-2.5 py-1.5 rounded-lg bg-[#14141e] border border-[#1e1e2e] text-xs text-[#7a7a9a]">
              <Search className="w-3.5 h-3.5 text-[#5a5a7a]" />
              <input
                type="text"
                placeholder="Search chats..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="bg-transparent text-white placeholder-[#5a5a7a] outline-none text-xs w-full"
              />
            </div>
          </div>
        )}

        {/* Session List */}
        <div className="flex-1 overflow-y-auto p-2 space-y-1">
          <div className="text-[9px] text-[#5a5a7a] px-2.5 py-1 font-mono tracking-wider uppercase">
            Chat History ({filteredSessions.length})
          </div>

          {loadingSessions && sessionList.length === 0 ? (
            <div className="flex justify-center py-6">
              <Spinner className="w-4 h-4 text-accent" />
            </div>
          ) : filteredSessions.length === 0 ? (
            <div className="text-center py-8 text-xs text-[#5a5a7a] px-3">
              {searchQuery ? "No matching chats" : "No past conversations. Click 'New Chat' to start!"}
            </div>
          ) : (
            filteredSessions.map((s) => {
              const isActive = activeSessionId === s.id;
              const isEditing = editingSessionId === s.id;

              return (
                <div
                  key={s.id}
                  onClick={() => !isEditing && setActiveSessionId(s.id)}
                  className={`group relative flex items-center justify-between px-2.5 py-2 rounded-lg text-xs transition-all cursor-pointer ${
                    isActive
                      ? "bg-accent/10 border border-accent/30 text-white font-medium shadow-sm"
                      : "text-[#9a9ab0] hover:bg-[#151522] hover:text-white border border-transparent"
                  }`}
                >
                  <div className="flex items-center gap-2 min-w-0 flex-1 mr-1">
                    <MessageSquare
                      className={`w-3.5 h-3.5 flex-shrink-0 ${isActive ? "text-accent" : "text-[#5a5a7a]"}`}
                    />
                    {isEditing ? (
                      <input
                        type="text"
                        value={editTitle}
                        onChange={(e) => setEditTitle(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === "Enter") handleSaveRename(s, e);
                          if (e.key === "Escape") handleCancelRename(e as unknown as React.MouseEvent);
                        }}
                        autoFocus
                        className="bg-[#1e1e2e] text-white text-xs px-1.5 py-0.5 rounded outline-none border border-accent w-full"
                      />
                    ) : (
                      <span className="truncate">{s.title}</span>
                    )}
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    {isEditing ? (
                      <>
                        <button
                          onClick={(e) => handleSaveRename(s, e)}
                          className="p-1 hover:text-accent text-[#7a7a9a]"
                          title="Save"
                        >
                          <Check className="w-3 h-3" />
                        </button>
                        <button
                          onClick={handleCancelRename}
                          className="p-1 hover:text-[#ff6b6b] text-[#7a7a9a]"
                          title="Cancel"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </>
                    ) : (
                      <>
                        <button
                          onClick={(e) => handleStartRename(s, e)}
                          className="p-1 hover:text-white text-[#5a5a7a]"
                          title="Rename"
                        >
                          <Edit2 className="w-3 h-3" />
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            deleteMutation.mutate(s.id);
                          }}
                          className="p-1 hover:text-[#ff6b6b] text-[#5a5a7a]"
                          title="Delete"
                        >
                          <Trash2 className="w-3 h-3" />
                        </button>
                      </>
                    )}
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Quota Footer */}
        {settings && (
          <div className="p-3 border-t border-[#1e1e2e] bg-[#090910] text-[11px] text-[#7a7a9a] flex items-center justify-between">
            <div className="flex items-center gap-1.5">
              <Zap className="w-3.5 h-3.5 text-accent" />
              <span>Daily AI Limit</span>
            </div>
            <span className="font-mono text-accent">
              {settings.settings_ai_daily_limit > 0
                ? `${settings.ai_today_usage} / ${settings.settings_ai_daily_limit}`
                : "Unlimited"}
            </span>
          </div>
        )}
      </aside>

      {/* Main Chat Interface */}
      <div className="flex-1 flex flex-col h-full overflow-hidden">
        {/* Header */}
        <div className="border-b border-[#1e1e2e] px-4 py-2.5 flex items-center justify-between bg-[#0a0a12] flex-shrink-0">
          <div className="flex items-center gap-2.5">
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="p-1.5 rounded-lg border border-[#1e1e2e] hover:border-[#2a2a3e] text-[#7a7a9a] hover:text-white transition-colors"
              title={sidebarOpen ? "Hide sidebar" : "Show sidebar"}
            >
              {sidebarOpen ? <ChevronLeft className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
            </button>
            <div className="w-7 h-7 rounded-lg bg-accent/10 border border-accent/20 flex items-center justify-center">
              <Sparkles className="w-3.5 h-3.5 text-accent" />
            </div>
            <div>
              <div className="text-xs font-bold flex items-center gap-2">
                <span>
                  {activeSessionId ? sessionList.find((s) => s.id === activeSessionId)?.title || "AI Session" : "New Chat"}
                </span>
                <span className="px-1.5 py-0.5 rounded text-[9px] font-mono bg-accent/10 border border-accent/20 text-accent">
                  Gemini 2.5 Flash
                </span>
              </div>
              <div className="text-[10px] text-[#5a5a7a] font-mono">Workspace Grounded Intelligence</div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {quotaRemaining !== null && (
              <div
                className={`text-[10px] font-mono px-2 py-1 rounded border ${
                  quotaRemaining <= 5
                    ? "bg-[#ff6b6b]/10 border-[#ff6b6b]/30 text-[#ff6b6b]"
                    : "bg-[#141420] border-[#1e1e2e] text-[#7a7a9a]"
                }`}
              >
                {quotaRemaining} prompts remaining today
              </div>
            )}
            <button
              onClick={handleNewChat}
              className="nexus-btn-ghost text-xs px-2.5 py-1.5 flex items-center gap-1"
            >
              <Plus className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">New Chat</span>
            </button>
          </div>
        </div>

        {/* Error Banner */}
        {errorBanner && (
          <div className="bg-[#ff6b6b]/10 border-b border-[#ff6b6b]/20 px-4 py-2 text-xs text-[#ff6b6b] flex items-center justify-between">
            <span>{errorBanner}</span>
            <button onClick={() => setErrorBanner(null)}>
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        )}

        {/* Messages Stream */}
        <div className="flex-1 overflow-y-auto px-4 py-4 space-y-4">
          <div className="max-w-3xl mx-auto space-y-4">
            {loadingMessages && messages.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-20 gap-3 text-[#5a5a7a] text-sm">
                <Spinner className="w-6 h-6 text-accent" />
                <span>Loading conversation...</span>
              </div>
            ) : messages.length === 0 ? (
              <div className="text-center py-16 animate-fade-up">
                <div className="w-14 h-14 rounded-2xl bg-accent/10 border border-accent/20 flex items-center justify-center mx-auto mb-4 shadow-lg shadow-accent/5">
                  <Bot className="w-7 h-7 text-accent" />
                </div>
                <h2 className="font-display font-bold text-xl mb-2">How can I assist your workspace today?</h2>
                <p className="text-[#5a5a7a] text-xs max-w-md mx-auto leading-relaxed mb-8">
                  Nexus AI has real-time context of your team&apos;s documents, tasks, and connected GitHub repositories.
                </p>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 max-w-lg mx-auto text-left">
                  {[
                    {
                      title: "Summarize sprint goals",
                      desc: "Extract key objectives from workspace documents",
                    },
                    {
                      title: "Check open Pull Requests",
                      desc: "Review recent code activity and commits",
                    },
                    {
                      title: "Draft architecture proposal",
                      desc: "Generate technical documentation for new features",
                    },
                    {
                      title: "Workspace Task Status",
                      desc: "Overview of pending and completed tasks",
                    },
                  ].map((prompt, i) => (
                    <button
                      key={i}
                      onClick={() => setInput(prompt.title)}
                      className="p-3 rounded-xl border border-[#1e1e2e] bg-[#10101a] hover:border-accent/40 hover:bg-accent/5 transition-all text-left group"
                    >
                      <div className="text-xs font-semibold text-white group-hover:text-accent transition-colors">
                        {prompt.title}
                      </div>
                      <div className="text-[11px] text-[#5a5a7a] mt-0.5">{prompt.desc}</div>
                    </button>
                  ))}
                </div>
              </div>
            ) : (
              messages.map((msg, index) => {
                const isUser = msg.role === "user";

                return (
                  <div
                    key={index}
                    className={`flex gap-3 animate-fade-up ${
                      isUser ? "flex-row-reverse" : "flex-row"
                    }`}
                  >
                    <div className="flex-shrink-0 mt-0.5">
                      {isUser ? (
                        <Avatar email={user?.email || "User"} size={28} />
                      ) : (
                        <div className="w-7 h-7 rounded-lg bg-accent/10 border border-accent/30 flex items-center justify-center text-accent">
                          <Sparkles className="w-3.5 h-3.5" />
                        </div>
                      )}
                    </div>

                    <div
                      className={`relative group max-w-[82%] rounded-2xl px-4 py-3 text-xs leading-relaxed ${
                        isUser
                          ? "bg-accent text-[#080811] font-medium rounded-tr-none shadow-md shadow-accent/10"
                          : "bg-[#12121e] border border-[#1e1e2e] text-[#e0e0f0] rounded-tl-none"
                      }`}
                    >
                      {/* Copy Action for AI Messages */}
                      {!isUser && (
                        <button
                          onClick={() => copyToClipboard(msg.content, index)}
                          className="absolute top-2 right-2 p-1.5 rounded-md bg-[#1a1a2a] border border-[#2a2a3e] text-[#7a7a9a] hover:text-white opacity-0 group-hover:opacity-100 transition-all"
                          title="Copy response"
                        >
                          {copiedIndex === index ? (
                            <Check className="w-3 h-3 text-accent" />
                          ) : (
                            <Copy className="w-3 h-3" />
                          )}
                        </button>
                      )}

                      <div className="whitespace-pre-wrap break-words">{msg.content}</div>

                      {/* Source attribution badge */}
                      {msg.sources && msg.sources > 0 && (
                        <div className="mt-2.5 pt-2 border-t border-[#1e1e2e] flex items-center gap-1.5 text-[10px] text-[#7a7a9a] font-mono">
                          <Database className="w-3 h-3 text-accent" />
                          <span>Grounding: {msg.sources} document(s) referenced</span>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })
            )}

            {loading && (
              <div className="flex gap-3 animate-fade-up">
                <div className="w-7 h-7 rounded-lg bg-accent/10 border border-accent/30 flex items-center justify-center text-accent flex-shrink-0">
                  <Sparkles className="w-3.5 h-3.5 animate-spin" />
                </div>
                <div className="bg-[#12121e] border border-[#1e1e2e] rounded-2xl rounded-tl-none px-4 py-3 flex items-center gap-2 text-xs text-[#7a7a9a]">
                  <Spinner className="w-3.5 h-3.5 text-accent" />
                  <span>Nexus AI is thinking & retrieving context...</span>
                </div>
              </div>
            )}
            <div ref={bottomRef} />
          </div>
        </div>

        {/* Input Bar */}
        <div className="p-3 sm:p-4 border-t border-[#1e1e2e] bg-[#0a0a12] flex-shrink-0">
          <div className="max-w-3xl mx-auto">
            <div className="flex items-end gap-2 bg-[#12121e] border border-[#1e1e2e] focus-within:border-accent/50 rounded-2xl p-2 transition-colors">
              <textarea
                ref={inputRef}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Ask Nexus AI about your workspace, tasks, documents, or code..."
                rows={1}
                className="flex-1 bg-transparent text-xs text-white placeholder-[#5a5a7a] resize-none outline-none py-1.5 px-2 max-h-32 min-h-[24px]"
              />
              <button
                onClick={sendMessage}
                disabled={!input.trim() || loading}
                className="p-2 rounded-xl bg-accent text-[#080811] hover:bg-accent/90 disabled:opacity-30 disabled:cursor-not-allowed transition-all shadow-md shadow-accent/10 flex-shrink-0"
              >
                <Send className="w-4 h-4" />
              </button>
            </div>
            <div className="flex items-center justify-between text-[10px] text-[#5a5a7a] mt-1.5 px-1 font-mono">
              <span>Shift + Enter for new line • Enter to send</span>
              <span>Nexus Grounded AI v2.5</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}