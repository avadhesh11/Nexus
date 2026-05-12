export interface User {
  id: string;
  email: string;
  created_at: string;
}

export interface Workspace {
  id: string;
  name: string;
  description?: string;
  invite_code: string;
  owner_id: string;
  created_at: string;
  members: WorkspaceMember[];
}

export interface WorkspaceMember {
  user_id: string;
  role: "admin" | "member" | "viewer";
  joined_at: string;
}

export interface Document {
  id: string;
  title: string;
  content?: string;
  workspace_id: string;
  created_by: string;
  created_at: string;
  updated_at: string;
}

export interface Message {
  id: string;
  content: string;
  workspace_id: string;
  sender_id: string;
  sender_email: string;
  created_at: string;
}

export interface Task {
  id: string;
  title: string;
  description?: string;
  status: "todo" | "in_progress" | "done";
  priority: "low" | "medium" | "high";
  workspace_id: string;
  created_by: string;
  assigned_to?: string;
  due_date?: string;
  created_at: string;
  updated_at: string;
}

export interface ChatMessage {
  role: "user" | "model";
  content: string;
}

export interface AIResponse {
  response: string;
  role: string;
  sources_used: number;
}
