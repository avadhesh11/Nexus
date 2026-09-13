"use client";

import React from "react";
import { Sparkles } from "lucide-react";

export function LoadingScreen({
  title = "Loading Nexus AI...",
  subtitle = "Synchronizing workspace context and intelligence",
}: {
  title?: string;
  subtitle?: string;
}) {
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] w-full p-8 animate-fade-up">
      <div className="relative mb-6">
        {/* Glowing aura */}
        <div className="absolute -inset-4 bg-accent/20 rounded-full blur-xl animate-pulse" />
        
        {/* Core logo container */}
        <div className="relative w-14 h-14 rounded-2xl bg-[#12121a] border border-accent/40 flex items-center justify-center shadow-[0_0_25px_rgba(0,255,178,0.2)]">
          <Sparkles className="w-7 h-7 text-accent animate-pulse" />
        </div>

        {/* Orbiting spinner ring */}
        <div className="absolute -inset-1 rounded-2xl border border-transparent border-t-accent/80 border-r-accent/30 animate-spin" />
      </div>

      <h3 className="font-display font-bold text-base text-[#e8e8f0] tracking-tight mb-1">
        {title}
      </h3>
      <p className="text-xs text-[#5a5a7a] max-w-sm text-center font-mono">
        {subtitle}
      </p>

      {/* Progress bar shimmer */}
      <div className="w-48 h-1 bg-[#1e1e2e] rounded-full mt-6 overflow-hidden relative">
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-accent to-transparent w-full animate-[shimmer_1.5s_infinite]" />
      </div>
    </div>
  );
}

export function Skeleton({ className = "" }: { className?: string }) {
  return (
    <div
      className={`bg-surface2/40 border border-[#1e1e2e] rounded-lg animate-pulse ${className}`}
    />
  );
}

export function DashboardSkeleton() {
  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6 animate-fade-up">
      {/* Header */}
      <div className="space-y-2">
        <Skeleton className="h-3 w-32" />
        <Skeleton className="h-8 w-64" />
        <Skeleton className="h-4 w-48" />
      </div>

      {/* Grid Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols */}
        <div className="lg:col-span-2 space-y-6">
          {/* Stat Cards */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {[1, 2, 3, 4].map((i) => (
              <Skeleton key={i} className="h-24 rounded-xl" />
            ))}
          </div>

          {/* Recent Docs */}
          <Skeleton className="h-56 rounded-xl" />

          {/* Quick Actions */}
          <Skeleton className="h-36 rounded-xl" />
        </div>

        {/* Right 1 Col (Recent Developments Feed) */}
        <div className="lg:col-span-1">
          <Skeleton className="h-[520px] rounded-xl" />
        </div>
      </div>
    </div>
  );
}

export function IntegrationsSkeleton() {
  return (
    <div className="p-6 max-w-5xl space-y-6 animate-fade-up">
      {/* Header */}
      <div className="space-y-2">
        <Skeleton className="h-3 w-36" />
        <Skeleton className="h-8 w-56" />
        <Skeleton className="h-4 w-80" />
      </div>

      {/* Connection Card */}
      <Skeleton className="h-28 rounded-xl" />

      {/* Monitored Repos Card */}
      <Skeleton className="h-40 rounded-xl" />

      {/* Activity Feed Card */}
      <Skeleton className="h-72 rounded-xl" />

      {/* Bottom Info Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Skeleton className="h-44 rounded-xl" />
        <Skeleton className="h-44 rounded-xl" />
      </div>
    </div>
  );
}

export function TasksSkeleton() {
  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6 animate-fade-up">
      <div className="flex items-center justify-between">
        <div className="space-y-2">
          <Skeleton className="h-3 w-28" />
          <Skeleton className="h-8 w-48" />
        </div>
        <Skeleton className="h-9 w-32 rounded-lg" />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {[1, 2, 3].map((col) => (
          <div key={col} className="space-y-3">
            <Skeleton className="h-10 rounded-lg" />
            <Skeleton className="h-32 rounded-xl" />
            <Skeleton className="h-32 rounded-xl" />
          </div>
        ))}
      </div>
    </div>
  );
}

export function DocumentsSkeleton() {
  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6 animate-fade-up">
      <div className="flex items-center justify-between">
        <div className="space-y-2">
          <Skeleton className="h-3 w-28" />
          <Skeleton className="h-8 w-48" />
        </div>
        <Skeleton className="h-9 w-36 rounded-lg" />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
        {[1, 2, 3, 4, 5, 6].map((i) => (
          <Skeleton key={i} className="h-44 rounded-xl" />
        ))}
      </div>
    </div>
  );
}
