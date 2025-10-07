"use client";

import { useUser, useClerk } from "@clerk/nextjs";
import { AssistantRuntimeProvider } from "@assistant-ui/react";
import { SidebarProvider, SidebarInset, SidebarTrigger } from "@/components/ui/sidebar";
import { ThreadListSidebar } from "@/components/assistant-ui/threadlist-sidebar";
import { Thread } from "@/components/assistant-ui/thread";
import { useDifyRuntime } from "@/lib/assistant-ui/dify-runtime";
import type { UserProfile } from "@/lib/types";

interface AssistantUIDashboardProps {
  userId: string;
}

export function AssistantUIDashboard({ userId }: AssistantUIDashboardProps) {
  const { user } = useUser();
  const { signOut } = useClerk();

  // Transform Clerk user to UserProfile format
  const userProfile: UserProfile | null = user
    ? {
        id: user.id,
        name: user.fullName || user.firstName || "User",
        email: user.primaryEmailAddress?.emailAddress || "",
        avatar: user.imageUrl,
      }
    : null;

  // Dify runtime with multi-thread support
  const { runtime } = useDifyRuntime(userId);

  return (
    <SidebarProvider>
      <AssistantRuntimeProvider runtime={runtime}>
        <div className="flex h-screen w-full">
          <ThreadListSidebar
            user={userProfile}
            onLogout={() => signOut({ redirectUrl: "/" })}
          />
          <SidebarInset>
            <SidebarTrigger className="absolute top-4 left-4 md:hidden" />
            <Thread />
          </SidebarInset>
        </div>
      </AssistantRuntimeProvider>
    </SidebarProvider>
  );
}
