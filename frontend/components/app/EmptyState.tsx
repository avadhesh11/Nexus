import { ReactNode } from "react";

interface EmptyStateProps {
  icon: string;
  title: string;
  desc: string;
  action?: ReactNode;
}

export function EmptyState({ icon, title, desc, action }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-16 px-6 gap-3 text-center">
      <div className="text-4xl opacity-30">{icon}</div>
      <div className="font-display font-bold text-base text-[#e8e8f0]">{title}</div>
      <div className="text-[#5a5a7a] text-sm max-w-xs leading-relaxed">{desc}</div>
      {action && <div className="mt-2">{action}</div>}
    </div>
  );
}
