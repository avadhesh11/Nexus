"use client";

import { useState, useEffect, useRef } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import api from "@/lib/api";
import { supabase } from "@/lib/supabase";
import { useWorkspaceStore } from "@/store/workspaceStore";
import { useAuthStore } from "@/store/authStore";
import { Message } from "@/types";
import { Avatar } from "@/components/app/Avatar";
import { Spinner } from "@/components/app/Spinner";
import { formatTime } from "@/lib/utils";
import { Send } from "lucide-react";

export default function ChatPage() {
  const { currentWorkspace } = useWorkspaceStore();
  const { user } = useAuthStore();
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const bottomRef = useRef<HTMLDivElement>(null);

  const { data: initialMessages, isLoading } = useQuery<Message[]>({
    queryKey: ["messages", currentWorkspace?.id],
    queryFn: () => api.get(`/chat/${currentWorkspace?.id}/messages?limit=50`).then(r => r.data),
    enabled: !!currentWorkspace?.id,
  });

  useEffect(() => {
    if (initialMessages) setMessages(initialMessages);
  }, [initialMessages]);

  useEffect(() => {
    if (!currentWorkspace?.id) return;
    const channel = supabase
      .channel("workspace-" + currentWorkspace.id)
      .on("postgres_changes", {
        event: "INSERT", schema: "public", table: "messages",
        filter: "workspace_id=eq." + currentWorkspace.id,
      }, (payload) => {
        setMessages(prev => {
          const exists = prev.find(m => m.id === (payload.new as Message).id);
          if (exists) return prev;
          return [...prev, payload.new as Message];
        });
      })
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, [currentWorkspace?.id]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const sendMutation = useMutation({
    mutationFn: (content: string) =>
      api.post(`/chat/${currentWorkspace?.id}/messages`, { content }),
    onSuccess: (res) => {
      setMessages(prev => {
        const exists = prev.find(m => m.id === res.data.id);
        if (exists) return prev;
        return [...prev, res.data];
      });
    },
  });

  const sendMessage = () => {
    if (!input.trim() || sendMutation.isPending) return;
    sendMutation.mutate(input.trim());
    setInput("");
  };

  if (isLoading) return <div className="flex items-center justify-center h-64"><Spinner className="w-5 h-5" /></div>;

  return (
    <div className="flex flex-col h-full">
      <div className="flex-1 overflow-y-auto px-5 py-4">
        <div className="flex flex-col gap-0.5 max-w-3xl mx-auto">
          {messages.map((msg, i) => {
            const isMe = msg.sender_id === user?.id;
            const showHeader = i === 0 || messages[i-1].sender_id !== msg.sender_id;
            return (
              <div key={msg.id} className={`flex gap-2.5 pt-1 ${i === messages.length - 1 ? "animate-fade-up" : ""}`}>
                <div className="w-7 flex-shrink-0 mt-0.5">
                  {showHeader && <Avatar email={msg.sender_email} size={28} />}
                </div>
                <div className="flex-1">
                  {showHeader && (
                    <div className="flex items-baseline gap-2 mb-0.5">
                      <span className={`text-xs font-semibold ${isMe ? "text-accent" : "text-[#5b8aff]"}`}>
                        {msg.sender_email.split("@")[0]}
                      </span>
                      <span className="text-[10px] text-[#5a5a7a] font-mono">{formatTime(msg.created_at)}</span>
                    </div>
                  )}
                  <div className="text-sm text-[#e8e8f0] leading-relaxed">{msg.content}</div>
                </div>
              </div>
            );
          })}
          {messages.length === 0 && (
            <div className="text-center py-16 text-[#5a5a7a] text-sm">No messages yet. Start the conversation!</div>
          )}
          <div ref={bottomRef} />
        </div>
      </div>
      <div className="border-t border-[#1e1e2e] p-4">
        <div className="flex gap-2 max-w-3xl mx-auto">
          <textarea value={input} onChange={e => setInput(e.target.value)}
            onKeyDown={e => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); sendMessage(); } }}
            placeholder="Message the team... (Enter to send)" rows={1}
            className="nexus-input resize-none min-h-[40px] max-h-28 leading-relaxed" />
          <button onClick={sendMessage} disabled={sendMutation.isPending || !input.trim()}
            className="nexus-btn-primary px-3.5 flex-shrink-0 self-end disabled:opacity-40">
            {sendMutation.isPending ? <Spinner /> : <Send className="w-3.5 h-3.5" />}
          </button>
        </div>
      </div>
    </div>
  );
}
