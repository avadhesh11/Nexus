"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import api from "@/lib/api";
import { useWorkspaceStore } from "@/store/workspaceStore";
import { useAuthStore } from "@/store/authStore";
import { Task, WorkspaceMemberDetail, WorkspaceSettings } from "@/types";
import { Spinner } from "@/components/app/Spinner";
import { TasksSkeleton } from "@/components/app/LoadingScreen";

import {
  Plus,
  X,
  GripVertical,
  Clock,
  Mail,
  Users,
  UserCheck,
  ShieldCheck,
  Check,
} from "lucide-react";
import { formatDate } from "@/lib/utils";

const COLUMNS = [
  { id: "todo", label: "Todo", color: "#ffd166", dot: "#ffd166", border: "hover:border-[#ffd166]/40" },
  { id: "in_progress", label: "In Progress", color: "#5b8aff", dot: "#5b8aff", border: "hover:border-[#5b8aff]/40" },
  { id: "done", label: "Done", color: "#7fffb2", dot: "#7fffb2", border: "hover:border-[#7fffb2]/40" },
] as const;

function TaskCard({
  task,
  onMove,
  onDelete,
  onDragStart,
  onDragEnd,
  isDragging,
  isAdmin,
}: {
  task: Task;
  onMove: (id: string, status: string) => void;
  onDelete: (id: string) => void;
  onDragStart: (e: React.DragEvent, task: Task) => void;
  onDragEnd: (e: React.DragEvent) => void;
  isDragging: boolean;
  isAdmin: boolean;
}) {
  const priClass =
    { low: "badge-low", medium: "badge-medium", high: "badge-high" }[task.priority] || "badge-low";

  const assigneeEmails = task.assignee_emails?.length
    ? task.assignee_emails
    : task.assignee_email
    ? [task.assignee_email]
    : [];

  return (
    <div
      draggable
      onDragStart={(e) => onDragStart(e, task)}
      onDragEnd={onDragEnd}
      className={`group relative p-3.5 border rounded-xl bg-surface transition-all cursor-grab active:cursor-grabbing select-none ${
        isDragging
          ? "opacity-40 scale-95 border-dashed border-accent"
          : "border-nexus-border hover:border-nexus-border2 hover:bg-surface2 shadow-sm hover:shadow-md"
      }`}
    >
      <div className="flex items-start justify-between gap-2 mb-2">
        <div className="flex items-center gap-1.5 flex-1 min-w-0">
          <GripVertical className="w-3.5 h-3.5 text-nexus-muted group-hover:text-nexus-text transition-colors flex-shrink-0" />
          <div className="text-xs font-semibold leading-snug truncate text-nexus-text">{task.title}</div>
        </div>
        {isAdmin && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              onDelete(task.id);
            }}
            className="opacity-0 group-hover:opacity-100 text-nexus-muted hover:text-red-400 p-0.5 rounded transition-all flex-shrink-0"
            title="Delete task"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        )}
      </div>

      {task.description && (
        <div className="text-[11px] text-nexus-muted mb-3 line-clamp-2 leading-relaxed pl-5">
          {task.description}
        </div>
      )}

      <div className="flex items-center justify-between pl-5 pt-1 gap-2 flex-wrap">
        <div className="flex items-center gap-2">
          <span className={`${priClass} text-[10px] font-mono uppercase`}>{task.priority}</span>
          {assigneeEmails.length > 0 ? (
            <span
              className="flex items-center gap-1 px-1.5 py-0.5 rounded bg-surface2 border border-nexus-border text-[10px] text-nexus-text font-mono"
              title={`Assigned to:\n${assigneeEmails.join("\n")}`}
            >
              <UserCheck className="w-3 h-3 text-accent" />
              <span className="truncate max-w-[80px]">@{assigneeEmails[0].split("@")[0]}</span>
              {assigneeEmails.length > 1 && (
                <span className="text-[9px] font-bold text-accent bg-accent-dim px-1 rounded">
                  +{assigneeEmails.length - 1}
                </span>
              )}
            </span>
          ) : (
            <span
              className="flex items-center gap-1 px-1.5 py-0.5 rounded bg-surface2 border border-nexus-border text-[10px] text-nexus-muted font-mono"
              title="Assigned to all workspace members"
            >
              <Users className="w-3 h-3 text-nexus-muted" />
              <span>All</span>
            </span>
          )}
        </div>

        {task.due_date && (
          <span className="text-[10px] text-nexus-muted font-mono flex items-center gap-1">
            <Clock className="w-3 h-3" />
            {formatDate(task.due_date)}
          </span>
        )}
      </div>

      {/* Quick Move Action Buttons on Hover */}
      {task.status !== "done" && (
        <div className="flex gap-1 mt-2.5 pt-2 border-t border-nexus-border opacity-0 group-hover:opacity-100 transition-opacity">
          {task.status === "todo" && (
            <button
              onClick={() => onMove(task.id, "in_progress")}
              className="text-[10px] px-2 py-0.5 rounded border border-nexus-border text-nexus-muted hover:border-[#5b8aff] hover:text-[#5b8aff] transition-colors font-mono"
            >
              → In Progress
            </button>
          )}
          {task.status === "in_progress" && (
            <button
              onClick={() => onMove(task.id, "done")}
              className="text-[10px] px-2 py-0.5 rounded border border-nexus-border text-nexus-muted hover:border-accent hover:text-accent transition-colors font-mono"
            >
              ✓ Done
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
  const [form, setForm] = useState<{
    title: string;
    description: string;
    priority: "low" | "medium" | "high";
    due_date: string;
    assigned_to_ids: string[];
    notify_assignee: boolean;
  }>({
    title: "",
    description: "",
    priority: "medium",
    due_date: "",
    assigned_to_ids: [],
    notify_assignee: false,
  });
  const [draggingTaskId, setDraggingTaskId] = useState<string | null>(null);
  const [dragOverColumnId, setDragOverColumnId] = useState<string | null>(null);

  // Fetch Workspace Settings (for admin verification)
  const { data: settings } = useQuery<WorkspaceSettings>({
    queryKey: ["workspace-settings", currentWorkspace?.id],
    queryFn: () => api.get(`/workspaces/${currentWorkspace?.id}/settings`).then((r) => r.data),
    enabled: !!currentWorkspace?.id,
  });

  const isAdmin =
    settings?.is_admin ||
    (!!currentWorkspace?.owner_id && !!user?.id && currentWorkspace.owner_id === user.id);

  // Fetch Workspace Members for Assignment Selection
  const { data: members = [] } = useQuery<WorkspaceMemberDetail[]>({
    queryKey: ["workspace-members", currentWorkspace?.id],
    queryFn: () => api.get(`/workspaces/${currentWorkspace?.id}/members`).then((r) => r.data),
    enabled: !!currentWorkspace?.id,
  });

  // Fetch Tasks
  const { data: tasks = [], isLoading } = useQuery<Task[]>({
    queryKey: ["tasks", currentWorkspace?.id],
    queryFn: () => api.get(`/tasks/?workspace_id=${currentWorkspace?.id}`).then((r) => r.data),
    enabled: !!currentWorkspace?.id,
  });

  // Create Task Mutation
  const createMutation = useMutation({
    mutationFn: () =>
      api.post("/tasks/", {
        title: form.title,
        description: form.description || undefined,
        priority: form.priority,
        due_date: form.due_date ? new Date(form.due_date).toISOString() : undefined,
        assigned_to_ids: form.assigned_to_ids.length > 0 ? form.assigned_to_ids : [],
        assigned_to: form.assigned_to_ids.length > 0 ? form.assigned_to_ids[0] : null,
        notify_assignee: form.notify_assignee,
        workspace_id: currentWorkspace?.id,
      }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["tasks", currentWorkspace?.id] });
      qc.invalidateQueries({ queryKey: ["workspace-activity", currentWorkspace?.id] });
      setShowModal(false);
      setForm({
        title: "",
        description: "",
        priority: "medium",
        due_date: "",
        assigned_to_ids: [],
        notify_assignee: false,
      });
    },
  });

  // Update Task (Move status) with Optimistic UI Update
  const updateMutation = useMutation({
    mutationFn: ({ id, status }: { id: string; status: string }) =>
      api.patch(`/tasks/${id}`, { status }),
    onMutate: async ({ id, status }) => {
      await qc.cancelQueries({ queryKey: ["tasks", currentWorkspace?.id] });
      const previousTasks = qc.getQueryData<Task[]>(["tasks", currentWorkspace?.id]);

      if (previousTasks) {
        qc.setQueryData<Task[]>(
          ["tasks", currentWorkspace?.id],
          previousTasks.map((t) => (t.id === id ? { ...t, status: status as Task["status"] } : t))
        );
      }

      return { previousTasks };
    },
    onError: (err, variables, context) => {
      if (context?.previousTasks) {
        qc.setQueryData(["tasks", currentWorkspace?.id], context.previousTasks);
      }
    },
    onSettled: () => {
      qc.invalidateQueries({ queryKey: ["tasks", currentWorkspace?.id] });
      qc.invalidateQueries({ queryKey: ["workspace-activity", currentWorkspace?.id] });
    },
  });

  // Delete Task Mutation
  const deleteMutation = useMutation({
    mutationFn: (id: string) => api.delete(`/tasks/${id}`),
    onMutate: async (id) => {
      await qc.cancelQueries({ queryKey: ["tasks", currentWorkspace?.id] });
      const previousTasks = qc.getQueryData<Task[]>(["tasks", currentWorkspace?.id]);
      if (previousTasks) {
        qc.setQueryData<Task[]>(
          ["tasks", currentWorkspace?.id],
          previousTasks.filter((t) => t.id !== id)
        );
      }
      return { previousTasks };
    },
    onSettled: () => {
      qc.invalidateQueries({ queryKey: ["tasks", currentWorkspace?.id] });
      qc.invalidateQueries({ queryKey: ["workspace-activity", currentWorkspace?.id] });
    },
  });

  // Drag and Drop Handlers
  const handleDragStart = (e: React.DragEvent, task: Task) => {
    setDraggingTaskId(task.id);
    e.dataTransfer.setData("text/plain", task.id);
    e.dataTransfer.effectAllowed = "move";
  };

  const handleDragEnd = () => {
    setDraggingTaskId(null);
    setDragOverColumnId(null);
  };

  const handleDragOver = (e: React.DragEvent, columnId: string) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";
    if (dragOverColumnId !== columnId) {
      setDragOverColumnId(columnId);
    }
  };

  const handleDragLeave = (e: React.DragEvent, columnId: string) => {
    if (e.currentTarget.contains(e.relatedTarget as Node)) return;
    if (dragOverColumnId === columnId) {
      setDragOverColumnId(null);
    }
  };

  const handleDrop = (e: React.DragEvent, targetColumnId: string) => {
    e.preventDefault();
    const taskId = e.dataTransfer.getData("text/plain") || draggingTaskId;
    setDraggingTaskId(null);
    setDragOverColumnId(null);

    if (!taskId) return;

    const task = tasks.find((t) => t.id === taskId);
    if (task && task.status !== targetColumnId) {
      updateMutation.mutate({ id: taskId, status: targetColumnId });
    }
  };

  // Toggle member in multi-assignee list
  const toggleAssignee = (userId: string) => {
    setForm((p) => {
      const exists = p.assigned_to_ids.includes(userId);
      return {
        ...p,
        assigned_to_ids: exists
          ? p.assigned_to_ids.filter((id) => id !== userId)
          : [...p.assigned_to_ids, userId],
      };
    });
  };

  if (isLoading && tasks.length === 0) {
    return <TasksSkeleton />;
  }


  return (
    <div className="p-6 h-full flex flex-col max-w-7xl mx-auto space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between flex-shrink-0 animate-fade-up">
        <div>
          <div className="text-[10px] text-nexus-muted font-mono tracking-widest mb-1 flex items-center gap-2">
            <span>PROJECT MANAGEMENT</span>
            {isAdmin ? (
              <span className="inline-flex items-center gap-1 text-[10px] px-1.5 py-0.2 text-accent bg-accent-dim rounded border border-accent-border font-mono">
                <ShieldCheck className="w-3 h-3" /> Admin
              </span>
            ) : (
              <span className="text-[10px] px-1.5 py-0.2 text-nexus-muted bg-surface2 rounded border border-nexus-border font-mono">
                Member View
              </span>
            )}
          </div>
          <h1 className="font-display font-extrabold text-2xl tracking-tight flex items-center gap-2 text-nexus-text">
            <span>Task Board</span>
            <span className="text-[11px] font-mono font-normal px-2 py-0.5 rounded bg-surface2 border border-nexus-border text-nexus-muted">
              {tasks.length} total tasks
            </span>
          </h1>
          <p className="text-nexus-muted text-xs mt-0.5">
            Drag and drop task cards across columns to seamlessly update their workflow status.
          </p>
        </div>

        {isAdmin ? (
          <button
            className="nexus-btn-primary text-xs px-3.5 py-2 flex items-center gap-1.5 shadow-md shadow-accent/10"
            onClick={() => {
              setForm({
                title: "",
                description: "",
                priority: "medium",
                due_date: "",
                assigned_to_ids: [],
                notify_assignee: false,
              });
              setShowModal(true);
            }}
          >
            <Plus className="w-4 h-4" />
            <span>New Task</span>
          </button>
        ) : (
          <div className="text-[11px] text-nexus-muted font-mono bg-surface border border-nexus-border px-3 py-1.5 rounded-lg flex items-center gap-1.5">
            <span>Admins can create tasks</span>
          </div>
        )}
      </div>

      {/* Kanban Board Columns */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5 flex-1 min-h-0">
        {COLUMNS.map((col) => {
          const colTasks = tasks.filter((t) => t.status === col.id);
          const isOver = dragOverColumnId === col.id;

          return (
            <div
              key={col.id}
              onDragOver={(e) => handleDragOver(e, col.id)}
              onDragLeave={(e) => handleDragLeave(e, col.id)}
              onDrop={(e) => handleDrop(e, col.id)}
              className={`nexus-card flex flex-col overflow-hidden transition-all duration-200 ${
                isOver
                  ? "border-accent/60 bg-accent-dim shadow-lg shadow-accent/5 ring-1 ring-accent/30"
                  : "border-nexus-border bg-surface2/50"
              }`}
            >
              {/* Column Header */}
              <div className="flex items-center gap-2 px-4 py-3 border-b border-nexus-border bg-surface flex-shrink-0">
                <div className="w-2 h-2 rounded-full" style={{ background: col.dot }} />
                <span
                  className="text-xs font-mono font-bold tracking-wider uppercase"
                  style={{ color: col.color }}
                >
                  {col.label}
                </span>
                <span className="ml-auto text-[11px] font-mono px-2 py-0.5 rounded bg-surface2 text-nexus-muted border border-nexus-border">
                  {colTasks.length}
                </span>
              </div>

              {/* Column Dropzone / Task List */}
              <div className="flex-1 overflow-y-auto p-3 flex flex-col gap-2.5">
                {colTasks.map((task) => (
                  <TaskCard
                    key={task.id}
                    task={task}
                    isAdmin={isAdmin}
                    isDragging={draggingTaskId === task.id}
                    onDragStart={handleDragStart}
                    onDragEnd={handleDragEnd}
                    onMove={(id, status) => updateMutation.mutate({ id, status })}
                    onDelete={(id) => deleteMutation.mutate(id)}
                  />
                ))}

                {colTasks.length === 0 && (
                  <div
                    className={`text-center py-12 rounded-xl border border-dashed text-xs transition-colors flex flex-col items-center justify-center gap-1.5 ${
                      isOver
                        ? "border-accent/50 text-accent bg-accent-dim"
                        : "border-nexus-border text-nexus-muted"
                    }`}
                  >
                    <span>{isOver ? "Drop task here" : "No tasks in this column"}</span>
                    <span className="text-[10px] text-nexus-muted">Drag cards here to update status</span>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* New Task Modal */}
      {showModal && (
        <div
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center animate-fade-in p-4"
          onClick={(e) => e.target === e.currentTarget && setShowModal(false)}
        >
          <div className="bg-surface border border-nexus-border rounded-2xl p-6 w-full max-w-lg animate-fade-up shadow-2xl max-h-[92vh] flex flex-col">
            <div className="flex items-center justify-between mb-4 pb-3 border-b border-nexus-border flex-shrink-0">
              <div>
                <h3 className="font-display font-bold text-base text-nexus-text">Create New Task</h3>
                <p className="text-[11px] text-nexus-muted">
                  Assign work to team members with optional email alerts
                </p>
              </div>
              <button
                onClick={() => setShowModal(false)}
                className="text-nexus-muted hover:text-nexus-text transition-colors p-1"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="flex flex-col gap-3.5 overflow-y-auto pr-1 flex-1">
              <div>
                <label className="block text-[11px] font-mono text-nexus-muted mb-1.5">TASK TITLE</label>
                <input
                  autoFocus
                  className="nexus-input text-xs"
                  value={form.title}
                  onChange={(e) => setForm((p) => ({ ...p, title: e.target.value }))}
                  placeholder="e.g. Implement user authentication..."
                  onKeyDown={(e) => e.key === "Enter" && form.title && createMutation.mutate()}
                />
              </div>

              <div>
                <label className="block text-[11px] font-mono text-nexus-muted mb-1.5">
                  DESCRIPTION (OPTIONAL)
                </label>
                <textarea
                  className="nexus-input text-xs resize-none"
                  rows={2}
                  value={form.description}
                  onChange={(e) => setForm((p) => ({ ...p, description: e.target.value }))}
                  placeholder="Provide context, acceptance criteria, or notes..."
                />
              </div>

              {/* Multi-User Assignment Selector */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="text-[11px] font-mono text-nexus-muted">
                    ASSIGN TO{" "}
                    <span className="text-nexus-text font-sans font-medium text-[10px]">
                      {form.assigned_to_ids.length === 0
                        ? "(All Members)"
                        : `(${form.assigned_to_ids.length} selected)`}
                    </span>
                  </label>
                  {form.assigned_to_ids.length > 0 && (
                    <button
                      type="button"
                      onClick={() => setForm((p) => ({ ...p, assigned_to_ids: [] }))}
                      className="text-[10px] text-accent hover:underline font-mono"
                    >
                      Reset to All
                    </button>
                  )}
                </div>

                {/* Default "All Members" button */}
                <div className="flex items-center gap-2 mb-2">
                  <button
                    type="button"
                    onClick={() => setForm((p) => ({ ...p, assigned_to_ids: [] }))}
                    className={`text-xs px-3 py-1.5 rounded-lg border font-mono flex items-center gap-1.5 transition-all ${
                      form.assigned_to_ids.length === 0
                        ? "bg-accent-dim border-accent text-accent font-semibold"
                        : "bg-surface2 border-nexus-border text-nexus-muted hover:border-nexus-border2 hover:text-nexus-text"
                    }`}
                  >
                    <Users className="w-3.5 h-3.5" />
                    <span>All Workspace Members</span>
                    {form.assigned_to_ids.length === 0 && <Check className="w-3 h-3 ml-0.5" />}
                  </button>
                </div>

                {/* Team Members Multi-Select Grid / List */}
                <div className="p-2 bg-surface2 border border-nexus-border rounded-xl max-h-36 overflow-y-auto flex flex-col gap-1">
                  {members.map((m) => {
                    const isSelected = form.assigned_to_ids.includes(m.user_id);
                    return (
                      <div
                        key={m.user_id}
                        onClick={() => toggleAssignee(m.user_id)}
                        className={`flex items-center justify-between p-1.5 px-2.5 rounded-lg text-xs cursor-pointer select-none transition-all ${
                          isSelected
                            ? "bg-accent-dim border border-accent-border text-accent font-medium"
                            : "hover:bg-surface text-nexus-muted hover:text-nexus-text border border-transparent"
                        }`}
                      >
                        <div className="flex items-center gap-2 min-w-0">
                          <div
                            className={`w-3.5 h-3.5 rounded border flex items-center justify-center flex-shrink-0 transition-colors ${
                              isSelected
                                ? "bg-accent border-accent text-black"
                                : "border-nexus-border bg-surface"
                            }`}
                          >
                            {isSelected && <Check className="w-2.5 h-2.5 stroke-[3]" />}
                          </div>
                          <span className="truncate text-xs font-mono">{m.email}</span>
                        </div>
                        <span className="text-[10px] uppercase font-mono px-1.5 py-0.2 rounded bg-surface text-nexus-muted border border-nexus-border">
                          {m.role}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-mono text-nexus-muted mb-1.5">PRIORITY</label>
                  <select
                    className="nexus-input text-xs"
                    value={form.priority}
                    onChange={(e) =>
                      setForm((p) => ({
                        ...p,
                        priority: e.target.value as "low" | "medium" | "high",
                      }))
                    }
                  >
                    <option value="low">Low Priority</option>
                    <option value="medium">Medium Priority</option>
                    <option value="high">High Priority</option>
                  </select>
                </div>
                <div>
                  <label className="block text-[11px] font-mono text-nexus-muted mb-1.5">DUE DATE</label>
                  <input
                    type="date"
                    className="nexus-input text-xs"
                    value={form.due_date}
                    onChange={(e) => setForm((p) => ({ ...p, due_date: e.target.value }))}
                  />
                </div>
              </div>

              {/* Alert Assignee via Email Option */}
              <div className="flex items-start gap-2.5 p-3 rounded-xl bg-surface2 border border-nexus-border mt-1">
                <input
                  id="notify-assignee"
                  type="checkbox"
                  checked={form.notify_assignee}
                  onChange={(e) => setForm((p) => ({ ...p, notify_assignee: e.target.checked }))}
                  className="mt-0.5 rounded border-nexus-border bg-surface text-accent focus:ring-accent/20 focus:ring-offset-0 cursor-pointer"
                />
                <label
                  htmlFor="notify-assignee"
                  className="text-xs text-nexus-muted cursor-pointer select-none"
                >
                  <span className="font-semibold text-nexus-text flex items-center gap-1.5">
                    <Mail className="w-3.5 h-3.5 text-accent" />
                    Alert {form.assigned_to_ids.length === 0
                      ? "all workspace members"
                      : form.assigned_to_ids.length === 1
                      ? "assigned member"
                      : `${form.assigned_to_ids.length} assigned members`}{" "}
                    with email
                  </span>
                  <span className="block text-[11px] text-nexus-muted mt-0.5">
                    Dispatches a formatted task notification with title, priority, and deadline to{" "}
                    {form.assigned_to_ids.length === 0
                      ? "all workspace members"
                      : "the selected assignee(s)"}
                    .
                  </span>
                </label>
              </div>
            </div>

            <div className="flex gap-2.5 mt-4 pt-3 border-t border-nexus-border flex-shrink-0">
              <button
                className="nexus-btn-primary flex-1 justify-center text-xs py-2"
                onClick={() => createMutation.mutate()}
                disabled={!form.title || createMutation.isPending}
              >
                {createMutation.isPending ? <Spinner className="w-3.5 h-3.5" /> : "Create Task"}
              </button>
              <button className="nexus-btn-ghost text-xs" onClick={() => setShowModal(false)}>
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}


