"use client";

export const dynamic = "force-dynamic";

import { useState, useEffect, useRef, useMemo } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import api from "@/lib/api";
import { supabase } from "@/lib/supabase";
import { useWorkspaceStore } from "@/store/workspaceStore";
import { useAuthStore } from "@/store/authStore";
import { Message, WorkspaceMemberDetail, WorkspaceSettings } from "@/types";
import { Avatar } from "@/components/app/Avatar";
import { Spinner } from "@/components/app/Spinner";
import { formatTime } from "@/lib/utils";
import {
  Send,
  Hash,
  User as UserIcon,
  Shield,
  Search,
  Lock,
  MessageSquare,
  Users,
  AlertCircle
} from "lucide-react";

export default function ChatPage() {
  const { currentWorkspace } = useWorkspaceStore();
  const { user } = useAuthStore();
  const qc = useQueryClient();

  // Active chat target: null = #general public room, string = recipient user_id for DM
  const [selectedRecipientId, setSelectedRecipientId] = useState<string | null>(null);
  const [memberSearch, setMemberSearch] = useState("");
  const [liveMessages, setLiveMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const bottomRef = useRef<HTMLDivElement>(null);

  // 1. Fetch Workspace Settings (to check settings_allow_dm)
  const { data: settings } = useQuery<WorkspaceSettings>({
    queryKey: ["workspace-settings", currentWorkspace?.id],
    queryFn: () => api.get(`/workspaces/${currentWorkspace?.id}/settings`).then((r) => r.data),
    enabled: !!currentWorkspace?.id,
  });

  // 2. Fetch Workspace Members for DM list
  const { data: members = [] } = useQuery<WorkspaceMemberDetail[]>({
    queryKey: ["workspace-members", currentWorkspace?.id],
    queryFn: () => api.get(`/workspaces/${currentWorkspace?.id}/members`).then((r) => r.data),
    enabled: !!currentWorkspace?.id,
    staleTime: 30000,
  });

  // 3. Fetch Initial Messages for current view (Public or DM)
  const { data: initialMessages = [], isLoading } = useQuery<Message[]>({
    queryKey: ["messages", currentWorkspace?.id, selectedRecipientId],
    queryFn: async () => {
      const endpoint = selectedRecipientId
        ? `/chat/${currentWorkspace?.id}/messages?recipient_id=${selectedRecipientId}&limit=100`
        : `/chat/${currentWorkspace?.id}/messages?limit=100`;
      const res = await api.get(endpoint);
      return res.data;
    },
    enabled: !!currentWorkspace?.id,
  });

  // Reset live messages when chat target changes
  useEffect(() => {
    setLiveMessages([]);
  }, [currentWorkspace?.id, selectedRecipientId]);

  // Merge initial + realtime messages
  const messages = useMemo(() => {
    const initial = initialMessages || [];
    const merged = [
      ...initial,
      ...liveMessages.filter((lm) => !initial.some((im) => im.id === lm.id)),
    ];

    return merged.sort(
      (a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
    );
  }, [initialMessages, liveMessages]);

  // Realtime subscription via Supabase
  useEffect(() => {
    if (!currentWorkspace?.id) return;

    const channel = supabase
      .channel(`chat-${currentWorkspace.id}-${selectedRecipientId || "public"}`)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "messages",
          filter: `workspace_id=eq.${currentWorkspace.id}`,
        },
        (payload) => {
          const newMsg = payload.new as Message;

          if (selectedRecipientId) {
            // Check if this new message belongs to our 1-on-1 DM conversation
            const isMyDM =
              (newMsg.sender_id === user?.id && newMsg.recipient_id === selectedRecipientId) ||
              (newMsg.sender_id === selectedRecipientId && newMsg.recipient_id === user?.id);
            if (isMyDM) {
              setLiveMessages((prev) => [...prev, newMsg]);
            }
          } else {
            // Public room message
            if (!newMsg.recipient_id) {
              setLiveMessages((prev) => [...prev, newMsg]);
            }
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [currentWorkspace?.id, selectedRecipientId, user?.id]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Send Message Mutation
  const sendMutation = useMutation({
    mutationFn: (content: string) =>
      api.post(`/chat/${currentWorkspace?.id}/messages`, {
        content,
        recipient_id: selectedRecipientId || undefined,
      }),
    onSuccess: (res) => {
      // Optimistically append sent message
      setLiveMessages((prev) => {
        if (prev.some((m) => m.id === res.data.id)) return prev;
        return [...prev, res.data];
      });
      qc.invalidateQueries({
        queryKey: ["messages", currentWorkspace?.id, selectedRecipientId],
      });
    },
    onError: (err: unknown) => {
      const error = err as { response?: { data?: { detail?: string } } };
      alert(error.response?.data?.detail || "Failed to send message");
    },
  });

  const handleSend = () => {
    if (!input.trim() || sendMutation.isPending) return;
    sendMutation.mutate(input.trim());
    setInput("");
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      e.preventDefault();
      handleSend();
    }
  };

  const otherMembers = useMemo(() => {
    return members.filter((m) => m.user_id !== user?.id);
  }, [members, user?.id]);

  const filteredMembers = useMemo(() => {
    if (!memberSearch.trim()) return otherMembers;
    return otherMembers.filter((m) =>
      m.email.toLowerCase().includes(memberSearch.toLowerCase())
    );
  }, [otherMembers, memberSearch]);

  const selectedMember = useMemo(() => {
    if (!selectedRecipientId) return null;
    return members.find((m) => m.user_id === selectedRecipientId);
  }, [members, selectedRecipientId]);

  const isDMDisabled = settings?.settings_allow_dm === false;

  return (
    <div className="flex h-full overflow-hidden bg-bg">
      {/* Channels & DMs Sidebar */}
      <aside className="w-64 border-r border-[#1e1e2e] bg-[#0c0c14] flex flex-col flex-shrink-0">
        {/* Header */}
        <div className="p-3.5 border-b border-[#1e1e2e] flex items-center justify-between">
          <div className="flex items-center gap-2">
            <MessageSquare className="w-4 h-4 text-accent" />
            <span className="font-display font-bold text-xs tracking-tight">Workspace Chat</span>
          </div>
          <span className="text-[10px] text-[#5a5a7a] font-mono">{members.length} members</span>
        </div>

        {/* Channel / DM List */}
        <div className="flex-1 overflow-y-auto p-2 space-y-4">
          {/* Public Channels */}
          <div>
            <div className="text-[9px] text-[#5a5a7a] px-2.5 mb-1.5 font-mono tracking-wider uppercase flex items-center gap-1">
              <Hash className="w-3 h-3" />
              <span>Channels</span>
            </div>
            <button
              onClick={() => setSelectedRecipientId(null)}
              className={`w-full flex items-center gap-2.5 px-2.5 py-2 rounded-lg text-xs transition-all text-left ${
                selectedRecipientId === null
                  ? "bg-accent/15 border border-accent/30 text-white font-medium"
                  : "text-[#9a9ab0] hover:bg-[#151522] hover:text-white border border-transparent"
              }`}
            >
              <Hash className={`w-3.5 h-3.5 ${selectedRecipientId === null ? "text-accent" : "text-[#5a5a7a]"}`} />
              <div className="flex-1 truncate">
                <span className="font-medium">general</span>
                <span className="text-[10px] text-[#5a5a7a] block">Public workspace room</span>
              </div>
            </button>
          </div>

          {/* Direct Messages */}
          <div>
            <div className="text-[9px] text-[#5a5a7a] px-2.5 mb-1.5 font-mono tracking-wider uppercase flex items-center justify-between">
              <span className="flex items-center gap-1">
                <UserIcon className="w-3 h-3" />
                Direct Messages
              </span>
              {isDMDisabled && (
                <span className="text-[8px] text-[#ff6b6b] border border-[#ff6b6b]/30 px-1 rounded">
                  Disabled
                </span>
              )}
            </div>

            {/* Member search if > 4 */}
            {otherMembers.length > 4 && (
              <div className="px-1 mb-2">
                <div className="flex items-center gap-2 px-2 py-1 rounded-lg bg-[#14141e] border border-[#1e1e2e] text-xs text-[#7a7a9a]">
                  <Search className="w-3 h-3 text-[#5a5a7a]" />
                  <input
                    type="text"
                    placeholder="Find member..."
                    value={memberSearch}
                    onChange={(e) => setMemberSearch(e.target.value)}
                    className="bg-transparent text-white placeholder-[#5a5a7a] outline-none text-[11px] w-full"
                  />
                </div>
              </div>
            )}

            {isDMDisabled ? (
              <div className="p-3 rounded-lg bg-[#ff6b6b]/5 border border-[#ff6b6b]/15 text-[11px] text-[#ff6b6b] flex items-start gap-2">
                <Lock className="w-3.5 h-3.5 mt-0.5 flex-shrink-0" />
                <span>1-on-1 personal chats are disabled by workspace admin.</span>
              </div>
            ) : filteredMembers.length === 0 ? (
              <div className="text-center py-4 text-[11px] text-[#5a5a7a]">
                {memberSearch ? "No members found" : "Invite members to start 1-on-1 chats!"}
              </div>
            ) : (
              <div className="space-y-0.5">
                {filteredMembers.map((m) => {
                  const isSelected = selectedRecipientId === m.user_id;

                  return (
                    <button
                      key={m.user_id}
                      onClick={() => setSelectedRecipientId(m.user_id)}
                      className={`w-full flex items-center gap-2.5 px-2.5 py-2 rounded-lg text-xs transition-all text-left ${
                        isSelected
                          ? "bg-accent/15 border border-accent/30 text-white font-medium shadow-sm"
                          : "text-[#9a9ab0] hover:bg-[#151522] hover:text-white border border-transparent"
                      }`}
                    >
                      <div className="relative flex-shrink-0">
                        <Avatar email={m.email} size={24} />
                        <div className="w-2 h-2 rounded-full bg-emerald-500 absolute -bottom-0.5 -right-0.5 border border-[#0c0c14]" />
                      </div>

                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between gap-1">
                          <span className="truncate">{m.email.split("@")[0]}</span>
                          {m.role === "admin" && (
                            <span className="text-[9px] px-1 py-0.2 rounded bg-[#ffaa00]/10 text-[#ffaa00] font-mono">
                              admin
                            </span>
                          )}
                        </div>
                        <span className="text-[10px] text-[#5a5a7a] truncate block">
                          {m.email}
                        </span>
                      </div>
                    </button>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* User Info Bar */}
        <div className="p-3 border-t border-[#1e1e2e] bg-[#090910] flex items-center gap-2">
          <Avatar email={user?.email || "Me"} size={26} />
          <div className="flex-1 min-w-0">
            <div className="text-xs font-semibold truncate">{user?.email?.split("@")[0]}</div>
            <div className="text-[10px] text-accent flex items-center gap-1">
              <div className="w-1.5 h-1.5 rounded-full bg-accent" />
              <span>Online</span>
            </div>
          </div>
        </div>
      </aside>

      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col h-full overflow-hidden">
        {/* Header */}
        <div className="border-b border-[#1e1e2e] px-5 py-3 flex items-center justify-between bg-[#0a0a12] flex-shrink-0">
          <div className="flex items-center gap-3">
            {selectedMember ? (
              <>
                <Avatar email={selectedMember.email} size={30} />
                <div>
                  <div className="text-sm font-semibold flex items-center gap-2">
                    <span>{selectedMember.email}</span>
                    <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-[#1e1e2e] text-[#7a7a9a]">
                      Direct Message
                    </span>
                  </div>
                  <div className="text-[10px] text-[#5a5a7a] font-mono">
                    Private communication • Role: {selectedMember.role}
                  </div>
                </div>
              </>
            ) : (
              <>
                <div className="w-8 h-8 rounded-lg bg-accent/10 border border-accent/20 flex items-center justify-center text-accent">
                  <Hash className="w-4 h-4" />
                </div>
                <div>
                  <div className="text-sm font-semibold flex items-center gap-2">
                    <span>general</span>
                    <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-accent/10 text-accent border border-accent/20">
                      Public Room
                    </span>
                  </div>
                  <div className="text-[10px] text-[#5a5a7a] font-mono">
                    All workspace members can view and participate
                  </div>
                </div>
              </>
            )}
          </div>

          <div className="flex items-center gap-2">
            <div className="text-[11px] font-mono text-[#5a5a7a] flex items-center gap-1.5 px-2.5 py-1 rounded border border-[#1e1e2e] bg-[#101018]">
              <Users className="w-3 h-3 text-accent" />
              <span>{members.length} members</span>
            </div>
          </div>
        </div>

        {/* Message Stream */}
        <div className="flex-1 overflow-y-auto px-5 py-4">
          {isLoading && messages.length === 0 ? (
            <div className="flex items-center justify-center h-64">
              <Spinner className="w-5 h-5 text-accent" />
            </div>
          ) : messages.length === 0 ? (
            <div className="text-center py-20 text-[#5a5a7a] animate-fade-up">
              <div className="w-12 h-12 rounded-2xl bg-[#141420] border border-[#1e1e2e] flex items-center justify-center mx-auto mb-3">
                {selectedMember ? <UserIcon className="w-6 h-6 text-accent" /> : <Hash className="w-6 h-6 text-accent" />}
              </div>
              <div className="text-sm font-semibold text-white mb-1">
                {selectedMember ? `Start a direct conversation with ${selectedMember.email.split("@")[0]}` : "Welcome to #general"}
              </div>
              <p className="text-xs max-w-sm mx-auto text-[#7a7a9a]">
                {selectedMember
                  ? "Messages in this thread are private between you two."
                  : "This is the workspace public channel for team discussions, announcements, and quick updates."}
              </p>
            </div>
          ) : (
            <div className="flex flex-col gap-1 max-w-3xl mx-auto">
              {messages.map((msg, i) => {
                const isMe = msg.sender_id === user?.id;
                const showHeader = i === 0 || messages[i - 1].sender_id !== msg.sender_id;

                return (
                  <div
                    key={msg.id}
                    className={`flex gap-2.5 pt-1.5 ${
                      i === messages.length - 1 ? "animate-fade-up" : ""
                    }`}
                  >
                    <div className="w-7 flex-shrink-0 mt-0.5">
                      {showHeader ? (
                        <Avatar email={msg.sender_email} size={28} />
                      ) : (
                        <div className="w-7" />
                      )}
                    </div>

                    <div className="flex-1 min-w-0">
                      {showHeader && (
                        <div className="flex items-baseline gap-2 mb-0.5">
                          <span
                            className={`text-xs font-semibold ${
                              isMe ? "text-accent" : "text-[#5b8aff]"
                            }`}
                          >
                            {msg.sender_email.split("@")[0]}
                          </span>
                          <span className="text-[10px] text-[#5a5a7a] font-mono">
                            {formatTime(msg.created_at)}
                          </span>
                        </div>
                      )}
                      <div className="text-xs leading-relaxed text-[#e0e0f0] bg-[#12121e]/40 px-2.5 py-1.5 rounded-lg border border-transparent hover:border-[#1e1e2e] transition-colors inline-block max-w-[90%] break-words">
                        {msg.content}
                      </div>
                    </div>
                  </div>
                );
              })}
              <div ref={bottomRef} />
            </div>
          )}
        </div>

        {/* Input Bar */}
        <div className="p-4 border-t border-[#1e1e2e] bg-[#0a0a12] flex-shrink-0">
          {selectedRecipientId && isDMDisabled ? (
            <div className="max-w-3xl mx-auto p-3 rounded-xl bg-[#ff6b6b]/10 border border-[#ff6b6b]/20 text-xs text-[#ff6b6b] flex items-center gap-2">
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              <span>Direct messaging has been disabled in this workspace by the administrator.</span>
            </div>
          ) : (
            <div className="max-w-3xl mx-auto flex items-center gap-2">
              <div className="flex-1 flex items-center gap-2 bg-[#12121e] border border-[#1e1e2e] focus-within:border-accent/50 rounded-xl px-3 py-2 transition-colors">
                <input
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder={
                    selectedMember
                      ? `Message @${selectedMember.email.split("@")[0]}...`
                      : "Message #general..."
                  }
                  className="flex-1 bg-transparent text-xs text-white placeholder-[#5a5a7a] outline-none"
                />
              </div>
              <button
                onClick={handleSend}
                disabled={!input.trim() || sendMutation.isPending}
                className="nexus-btn-primary p-2.5 rounded-xl disabled:opacity-30 disabled:cursor-not-allowed flex-shrink-0"
              >
                <Send className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}