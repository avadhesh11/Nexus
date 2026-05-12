"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import api from "@/lib/api";
import { useWorkspaceStore } from "@/store/workspaceStore";
import { Document } from "@/types";
import { EmptyState } from "@/components/app/EmptyState";
import { Spinner } from "@/components/app/Spinner";
import { formatRelative } from "@/lib/utils";
import { Plus, FileText, Trash2 } from "lucide-react";

export default function DocumentsPage() {
  const router = useRouter();
  const qc = useQueryClient();
  const { currentWorkspace } = useWorkspaceStore();
  const [showNew, setShowNew] = useState(false);
  const [newTitle, setNewTitle] = useState("");

 const { data: docs = [], isLoading } = useQuery<Document[]>({
  queryKey: ["documents", currentWorkspace?.id],
  queryFn: async () => {
    const res = await api.get(`/documents/?workspace_id=${currentWorkspace?.id}`);
    // console.log("First doc:", res.data[0]); 
    return res.data;
  },
  enabled: !!currentWorkspace?.id,
});

  const createMutation = useMutation({
    mutationFn: () => api.post("/documents/", { title: newTitle || "Untitled", content: "", workspace_id: currentWorkspace?.id }),
    onSuccess: (res) => {
      qc.invalidateQueries({ queryKey: ["documents"] });
      setShowNew(false);
      setNewTitle("");
      router.push(`/dashboard/documents/${res.data.id}`);
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => api.delete(`/documents/${id}`),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["documents"] }),
  });
  const ws=currentWorkspace;
const uploadTxt = async (e: React.ChangeEvent<HTMLInputElement>) => {
  if (!ws) return;

  const file = e.target.files?.[0];
  if (!file) return;

  const text = await file.text();
//  console.log("ws.id:", ws?.id); 
  try {
    const { data } = await api.post("/documents/", {
      title: file.name,
      content: text,
      workspace_id: ws.id,
    });
     console.log(data.id);

     router.push(`/dashboard/documents/${data.id}`);
  } catch (err) {
    console.error(err);
  }
};
  if (isLoading) return <div className="flex items-center justify-center h-64"><Spinner className="w-5 h-5" /></div>;

  return (
    <div className="p-6 max-w-3xl">
      <div className="flex items-center justify-between mb-5 animate-fade-up">
        <div>
          <div className="text-[10px] text-[#5a5a7a] font-mono tracking-widest mb-1">WORKSPACE DOCS</div>
          <h2 className="font-display font-bold text-xl">{docs.length} Documents</h2>
        </div>
        <button className="nexus-btn-primary text-sm" onClick={() => setShowNew(true)}>
          <Plus className="w-3.5 h-3.5" />Write New document/content
        </button>
        OR
         <label className="nexus-btn-primary text-sm">
  Upload TXT
  <input
    type="file"
    accept=".txt"
    onChange={uploadTxt}
    className="hidden"
  />
</label>
      </div>

      {showNew && (
        <div className="border border-accent/20 bg-accent/5 rounded-xl p-4 mb-4 animate-fade-up">
          <input autoFocus className="nexus-input mb-3" value={newTitle} onChange={e => setNewTitle(e.target.value)}
            placeholder="Document title..." onKeyDown={e => e.key === "Enter" && createMutation.mutate()} />
          <div className="flex gap-2">
            <button className="nexus-btn-primary text-xs py-1.5" onClick={() => createMutation.mutate()} disabled={createMutation.isPending}>
              {createMutation.isPending ? <Spinner /> : "Create"}
            </button>
            <button className="nexus-btn-ghost text-xs py-1.5" onClick={() => setShowNew(false)}>Cancel</button>
          </div>
        </div>
      )}

      <div className="flex flex-col gap-2">
        {docs.map((doc, i) => (
        
          <div key={doc.id}
            className="group flex items-center gap-3 p-3.5 border border-[#1e1e2e] rounded-xl bg-surface hover:border-[#2a2a3e] hover:bg-surface2 transition-all cursor-pointer animate-fade-up"
            style={{ animationDelay: i * 0.04 + "s" }}
            onClick={() =>{  router.push(`/dashboard/documents/${doc.id}`)}}
          >
          
            <div className="w-9 h-9 rounded-lg bg-surface2 border border-[#1e1e2e] flex items-center justify-center text-[#5a5a7a] flex-shrink-0">
              <FileText className="w-4 h-4" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="font-medium text-sm truncate">{doc.title}</div>
              <div className="text-[11px] text-[#5a5a7a] font-mono">Updated {formatRelative(doc.updated_at)}</div>
            </div>
            <button onClick={e => { e.stopPropagation(); deleteMutation.mutate(doc.id); }}
              className="opacity-0 group-hover:opacity-100 p-1.5 text-[#5a5a7a] hover:text-[#ff6b6b] transition-all">
              <Trash2 className="w-3.5 h-3.5" />
            </button>
            <span className="text-[#5a5a7a] text-xs">→</span>
          </div>
        ))}
      </div>

      {docs.length === 0 && !showNew && (
        <EmptyState icon="📄" title="No documents yet" desc="Create your first document. The AI will learn from it automatically via the RAG pipeline."
          action={<button className="nexus-btn-primary text-sm" onClick={() => setShowNew(true)}>Create document</button>} />
      )}
    </div>
  );
}
