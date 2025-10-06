"use client";

import { useState } from "react";
import { useUser, useClerk } from "@clerk/nextjs";
import { AssistantRuntimeProvider } from "@assistant-ui/react";
import { useDifyRuntime } from "@/lib/assistant-ui/dify-runtime";
import { CustomThread } from "@/components/assistant-ui/custom-thread";
import { ChatSidebar } from "@/components/chat-sidebar";
import { useConversations } from "@/hooks/use-conversations";
import type { UserProfile } from "@/lib/types";

interface AssistantUIDashboardProps {
  userId: string;
}

export function AssistantUIDashboard({ userId }: AssistantUIDashboardProps) {
  const { user } = useUser();
  const { signOut } = useClerk();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  // Transform Clerk user to UserProfile format
  const userProfile: UserProfile | null = user
    ? {
        id: user.id,
        name: user.fullName || user.firstName || "User",
        email: user.primaryEmailAddress?.emailAddress || "",
        avatar: user.imageUrl,
      }
    : null;

  // Existing conversation management
  const {
    conversations,
    activeConversationId,
    createConversation,
    deleteConversation,
    renameConversation,
    selectConversation,
  } = useConversations({ userId });

  // New Dify runtime for assistant-ui
  const { runtime, setConversationId, resetConversation } = useDifyRuntime(userId);

  const handleNewChat = () => {
    createConversation();
    resetConversation(); // Reset for new conversation
  };

  const handleSelectConversation = (id: string) => {
    selectConversation(id);
    setConversationId(id);
    // TODO: Implement message loading into assistant-ui runtime when needed
  };

  return (
    <div className="flex h-screen w-full overflow-hidden bg-background">
      {/* Keep existing sidebar */}
      <ChatSidebar
        conversations={conversations}
        activeConversationId={activeConversationId}
        onSelectConversation={handleSelectConversation}
        onNewChat={handleNewChat}
        onDeleteConversation={deleteConversation}
        onRenameConversation={renameConversation}
        isOpen={isSidebarOpen}
        onToggle={() => setIsSidebarOpen(!isSidebarOpen)}
        user={userProfile}
        onLogout={() => signOut({ redirectUrl: "/" })}
      />

      {/* Replace entire chat area with assistant-ui */}
      <div className="flex min-w-0 flex-1 flex-col">
        <AssistantRuntimeProvider runtime={runtime}>
          <CustomThread />
        </AssistantRuntimeProvider>
      </div>
    </div>
  );
}
