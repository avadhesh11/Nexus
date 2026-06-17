"use client";
import { useState, useRef, useEffect } from "react";
import { useWorkspaceStore } from "@/store/workspaceStore";
import { useAuthStore } from "@/store/authStore";
import { ChatMessage } from "@/types";
import { Avatar } from "@/components/app/Avatar";
import { Spinner } from "@/components/app/Spinner";
import { Send, Sparkles, Database } from "lucide-react";
import api from "@/lib/api";

interface AIMessage {
  role: "user" | "model";
  content: string;
  sources?: number;
}

interface ContentBlock {
  text?: string;
  content?: string;
}

export default function AIPage() {
  const { currentWorkspace } = useWorkspaceStore();
  const { user } = useAuthStore();
  const [messages, setMessages] = useState<AIMessage[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const sendMessage = async () => {
    if (!input.trim() || loading) return;

    const userMsg: AIMessage = { role: "user", content: input };
    const history: ChatMessage[] = messages.map(m => ({ role: m.role, content: m.content }));
    setMessages(prev => [...prev, userMsg]);
    setInput("");
    setLoading(true);

    try {
      const res = await api.post("/ai/chat", {
        message: input,
        workspace_id: currentWorkspace?.id,
        history,
      });

      const responseText =
        typeof res.data.response === "string"
          ? res.data.response
          : Array.isArray(res.data.response)
          ? res.data.response
              .map((b: ContentBlock) => b.text ?? b.content ?? "")
              .join("")
          : JSON.stringify(res.data.response);

      setMessages(prev => [
        ...prev,
        {
          role: "model",
          content: responseText,
          sources: res.data.sources_used,
        },
      ]);
    } catch {
      setMessages(prev => [
        ...prev,
        {
          role: "model",
          content: "Sorry, something went wrong. Please try again.",
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="border-b border-[#1e1e2e] px-5 py-3 flex items-center gap-2.5">
        <div className="w-7 h-7 rounded-lg bg-accent/10 border border-accent/20 flex items-center justify-center">
          <Sparkles className="w-3.5 h-3.5 text-accent" />
        </div>
        <div>
          <div className="text-sm font-semibold">Nexus AI Assistant</div>
          <div className="text-[10px] text-[#5a5a7a] font-mono">It knows your workspace</div>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-5 py-4">
        <div className="flex flex-col gap-5 max-w-3xl mx-auto">
          {messages.length === 0 && (
            <div className="text-center py-16">
              <div className="w-14 h-14 rounded-2xl bg-accent/10 border border-accent/20 flex items-center justify-center mx-auto mb-4">
                <Sparkles className="w-6 h-6 text-accent" />
              </div>
              <div className="font-display font-bold text-lg mb-2">Ask me anything</div>
              <div className="text-[#5a5a7a] text-sm max-w-sm mx-auto leading-relaxed">
                I have access to all your workspace documents and can answer questions using your team&apos;s actual content.
              </div>
              <div className="flex flex-wrap gap-2 justify-center mt-6">
                {[
                  "What did we decide about the database?",
                  "Summarize our sprint goals",
                  "Who is handling the migration?",
                ].map(q => (
                  <button
                    key={q}
                    onClick={() => setInput(q)}
                    className="px-3 py-1.5 text-xs border border-[#1e1e2e] rounded-full text-[#5a5a7a] hover:border-accent hover:text-accent transition-colors"
                  >
                    {q}
                  </button>
                ))}
              </div>
            </div>
          )}

          {messages.map((msg, i) => (
            <div key={i} className={`flex gap-3 ${i === messages.length - 1 ? "animate-fade-up" : ""}`}>
              <div className="flex-shrink-0 mt-0.5">
                {msg.role === "user" ? (
                  <Avatar email={user?.email || ""} size={28} />
                ) : (
                  <div className="w-7 h-7 rounded-lg bg-accent/10 border border-accent/20 flex items-center justify-center">
                    <Sparkles className="w-3.5 h-3.5 text-accent" />
                  </div>
                )}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-xs font-semibold">
                    {msg.role === "user" ? user?.email?.split("@")[0] ?? "You" : "Nexus AI"}
                  </span>
                  {msg.sources !== undefined && msg.sources > 0 && (
                    <span className="flex items-center gap-1 text-[10px] font-mono text-[#5a5a7a] border border-[#1e1e2e] px-1.5 py-0.5 rounded-full">
                      <Database className="w-2.5 h-2.5" />
                      {msg.sources} sources
                    </span>
                  )}
                </div>
                <div className="text-sm text-[#e8e8f0] leading-relaxed whitespace-pre-wrap">
                  {msg.content}
                </div>
              </div>
            </div>
          ))}

          {loading && (
            <div className="flex gap-3">
              <div className="w-7 h-7 rounded-lg bg-accent/10 border border-accent/20 flex items-center justify-center flex-shrink-0">
                <Sparkles className="w-3.5 h-3.5 text-accent" />
              </div>
              <div className="flex items-center gap-2 text-sm text-[#5a5a7a]">
                <Spinner className="w-3.5 h-3.5" /> Searching workspace...
              </div>
            </div>
          )}

          <div ref={bottomRef} />
        </div>
      </div>

      {/* Input */}
      <div className="border-t border-[#1e1e2e] p-4">
        <div className="flex gap-2 max-w-3xl mx-auto">
          <textarea
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={e => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                sendMessage();
              }
            }}
            placeholder="Ask anything about your workspace..."
            rows={1}
            className="nexus-input resize-none min-h-[40px] max-h-28 leading-relaxed"
          />
          <button
            onClick={sendMessage}
            disabled={loading || !input.trim()}
            className="nexus-btn-primary px-3.5 flex-shrink-0 self-end disabled:opacity-40"
          >
            {loading ? <Spinner /> : <Send className="w-3.5 h-3.5" />}
          </button>
        </div>
        <div className="text-[10px] text-[#3a3a5a] font-mono mt-2 max-w-3xl mx-auto">
          AI can make mistakes, kindly verify all details once
        </div>
      </div>
    </div>
  );
}