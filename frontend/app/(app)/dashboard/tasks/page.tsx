"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import api from "@/lib/api";
import { useWorkspaceStore } from "@/store/workspaceStore";
import { useAuthStore } from "@/store/authStore";
import { Task } from "@/types";
import { Spinner } from "@/components/app/Spinner";
import { Plus, X } from "lucide-react";
import { formatDate } from "@/lib/utils";

const COLUMNS = [
  { id: "todo", label: "Todo", color: "#5a5a7a", dot: "#5a5a7a" },
  { id: "in_progress", label: "In Progress", color: "#5b8aff", dot: "#5b8aff" },
  { id: "done", label: "Done", color: "#7fffb2", dot: "#7fffb2" },
] as const;

function TaskCard({ task, onMove, onDelete }: { task: Task; onMove: (id: string, status: string) => void; onDelete: (id: string) => void }) {


  const priClass = { low: "badge-low", medium: "badge-medium", high: "badge-high" }[task.priority] || "badge-low";
  return (
    <div className="group p-3 border border-[#1e1e2e] rounded-lg bg-bg hover:border-[#2a2a3e] transition-all">
      <div className="flex items-start justify-between gap-2 mb-2">
        <div className="text-sm font-medium leading-snug flex-1">{task.title}</div>
        <button onClick={() => onDelete(task.id)} className="opacity-0 group-hover:opacity-100 text-[#5a5a7a] hover:text-[#ff6b6b] transition-all flex-shrink-0">
          <X className="w-3.5 h-3.5" />
        </button>
      </div>
      {task.description && <div className="text-xs text-[#5a5a7a] mb-2 leading-relaxed">{task.description}</div>}
      <div className="flex items-center justify-between">
        <span className={priClass}>{task.priority}</span>
        {task.due_date && <span className="text-[10px] text-[#5a5a7a] font-mono">{formatDate(task.due_date)}</span>}
      </div>
      {task.status !== "done" && (
        <div className="flex gap-1 mt-2.5 pt-2.5 border-t border-[#1e1e2e]">
          {task.status === "todo" && (
            <button onClick={() => onMove(task.id, "in_progress")} className="text-[10px] px-2 py-1 rounded border border-[#1e1e2e] text-[#5a5a7a] hover:border-[#5b8aff] hover:text-[#5b8aff] transition-colors">
              → Start
            </button>
          )}
          {task.status === "in_progress" && (
            <button onClick={() => onMove(task.id, "done")} className="text-[10px] px-2 py-1 rounded border border-[#1e1e2e] text-[#5a5a7a] hover:border-accent hover:text-accent transition-colors">
              → Done
            </button>
          )}
        </div>
      )}
    </div>
  );
}

export default function TasksPage() {
  const { user } = useAuthStore();
  const qc = useQueryClient();
  const { currentWorkspace } = useWorkspaceStore();
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState({ title: "", description: "", priority: "medium", due_date: "" });

  const { data: tasks = [], isLoading } = useQuery<Task[]>({
    queryKey: ["tasks", currentWorkspace?.id],
    queryFn: () => api.get(`/tasks/?workspace_id=${currentWorkspace?.id}`).then(r => r.data),
    enabled: !!currentWorkspace?.id,
  });

  const createMutation = useMutation({
    mutationFn: () => api.post("/tasks/", { ...form, workspace_id: currentWorkspace?.id }),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["tasks"] }); setShowModal(false); setForm({ title: "", description: "", priority: "medium", due_date: "" }); },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, status }: { id: string; status: string }) => api.patch(`/tasks/${id}`, { status }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["tasks"] }),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => api.delete(`/tasks/${id}`),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["tasks"] }),
  });

  if (isLoading) return <div className="flex items-center justify-center h-64"><Spinner className="w-5 h-5" /></div>;

  return (
    <div className="p-5 h-full flex flex-col">
      <div className="flex items-center justify-between mb-5 animate-fade-up">
        <div>
          <div className="text-[10px] text-[#5a5a7a] font-mono tracking-widest mb-1">TASK BOARD</div>
          <h2 className="font-display font-bold text-xl">{tasks.length} Tasks</h2>
        </div>
        {user?.id === currentWorkspace?.owner_id && (
          <button className="nexus-btn-primary text-sm" onClick={() => setShowModal(true)}>
            <Plus className="w-3.5 h-3.5" /> New task
          </button>
        )}
      </div>

      <div className="grid grid-cols-3 gap-4 flex-1 min-h-0">
        {COLUMNS.map(col => {
          const colTasks = tasks.filter(t => t.status === col.id);
          return (
            <div key={col.id} className="nexus-card flex flex-col overflow-hidden animate-fade-up">
              <div className="flex items-center gap-2 px-4 py-3 border-b border-[#1e1e2e]">
                <div className="w-1.5 h-1.5 rounded-full" style={{ background: col.dot }} />
                <span className="text-[11px] font-mono font-semibold tracking-widest" style={{ color: col.color }}>{col.label.toUpperCase()}</span>
                <span className="ml-auto text-[11px] font-mono text-[#5a5a7a]">{colTasks.length}</span>
              </div>
              <div className="flex-1 overflow-y-auto p-2.5 flex flex-col gap-2">
                {colTasks.map(task => (
                  <TaskCard key={task.id} task={task}
                    onMove={(id, status) => updateMutation.mutate({ id, status })}
                    onDelete={(id) => deleteMutation.mutate(id)}
                  />
                ))}
                {colTasks.length === 0 && (
                  <div className="text-center py-8 text-[#5a5a7a] text-xs">Empty</div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center animate-fade-in" onClick={e => e.target === e.currentTarget && setShowModal(false)}>
          <div className="bg-surface border border-[#1e1e2e] rounded-2xl p-6 w-full max-w-md animate-fade-up">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="font-display font-bold text-lg">New Task</h3>
                <p className="text-xs text-[#5a5a7a]">Add to Todo column</p>
              </div>
              <button onClick={() => setShowModal(false)} className="text-[#5a5a7a] hover:text-[#e8e8f0] transition-colors"><X className="w-4 h-4" /></button>
            </div>
            <div className="flex flex-col gap-3.5">
              <div>
                <label className="block text-xs text-[#5a5a7a] mb-1.5">Title</label>
                <input autoFocus className="nexus-input" value={form.title} onChange={e => setForm(p => ({ ...p, title: e.target.value }))} placeholder="Task title..." onKeyDown={e => e.key === "Enter" && form.title && createMutation.mutate()} />
              </div>
              <div>
                <label className="block text-xs text-[#5a5a7a] mb-1.5">Description (optional)</label>
                <textarea className="nexus-input resize-none" rows={2} value={form.description} onChange={e => setForm(p => ({ ...p, description: e.target.value }))} placeholder="Brief description..." />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs text-[#5a5a7a] mb-1.5">Priority</label>
                  <select className="nexus-input" value={form.priority} onChange={e => setForm(p => ({ ...p, priority: e.target.value }))}>
                    <option value="low">Low</option>
                    <option value="medium">Medium</option>
                    <option value="high">High</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs text-[#5a5a7a] mb-1.5">Due date</label>
                  <input type="date" className="nexus-input" value={form.due_date} onChange={e => setForm(p => ({ ...p, due_date: e.target.value }))} />
                </div>
              </div>
            </div>
            <div className="flex gap-2 mt-5">
              <button className="nexus-btn-primary flex-1 justify-center" onClick={() => createMutation.mutate()} disabled={!form.title || createMutation.isPending}>
                {createMutation.isPending ? <Spinner /> : "Create task"}
              </button>
              <button className="nexus-btn-ghost" onClick={() => setShowModal(false)}>Cancel</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
