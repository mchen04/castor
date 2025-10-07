"use client";

import type { unstable_RemoteThreadListAdapter as RemoteThreadListAdapter } from "@assistant-ui/react";
import type { AssistantStreamChunk } from "assistant-stream";

interface DifyConversation {
  id: string;
  name: string;
  inputs: Record<string, unknown>;
  status: string;
  introduction: string;
  created_at: number;
  updated_at: number;
}

export function createDifyThreadListAdapter(
  userId: string,
  getToken: () => Promise<string | null>
): RemoteThreadListAdapter {
  const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!;

  return {
    async list() {
      const token = await getToken();
      if (!token) {
        throw new Error("Not authenticated");
      }

      const response = await fetch(
        `${SUPABASE_URL}/functions/v1/dify-conversations?userId=${userId}&limit=100`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const result = await response.json();
      const difyConversations: DifyConversation[] = result.data || [];

      return {
        threads: difyConversations.map((conv) => ({
          status: "regular" as const,
          remoteId: conv.id,
          title: conv.name || "New Conversation",
        })),
      };
    },

    async initialize(threadId: string) {
      // Dify automatically creates conversations on first message
      // We return a temporary ID that will be replaced when first message is sent
      return {
        remoteId: threadId,
        externalId: undefined,
      };
    },

    async rename(remoteId: string, newTitle: string) {
      const token = await getToken();
      if (!token) {
        throw new Error("Not authenticated");
      }

      const response = await fetch(
        `${SUPABASE_URL}/functions/v1/dify-rename`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            conversationId: remoteId,
            name: newTitle,
            userId,
          }),
        }
      );

      if (!response.ok) {
        throw new Error(`Failed to rename conversation: ${response.statusText}`);
      }
    },

    async delete(remoteId: string) {
      const token = await getToken();
      if (!token) {
        throw new Error("Not authenticated");
      }

      const response = await fetch(
        `${SUPABASE_URL}/functions/v1/dify-delete`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            conversationId: remoteId,
            userId,
          }),
        }
      );

      if (!response.ok) {
        throw new Error(`Failed to delete conversation: ${response.statusText}`);
      }
    },

    // Archive not supported by Dify - no-op implementations
    async archive() {
      // No-op: Dify doesn't support archive
    },

    async unarchive() {
      // No-op: Dify doesn't support unarchive
    },

    async generateTitle(remoteId: string) {
      const token = await getToken();
      if (!token) {
        throw new Error("Not authenticated");
      }

      // Call Dify to auto-generate title in the background
      fetch(
        `${SUPABASE_URL}/functions/v1/dify-rename`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            conversationId: remoteId,
            autoGenerate: true,
            userId,
          }),
        }
      ).catch((error) => {
        console.error("Failed to generate title:", error);
      });

      // Return empty stream - title update happens server-side
      // The thread list will refresh when the rename completes
      return new ReadableStream<AssistantStreamChunk>({
        start(controller) {
          controller.close();
        },
      });
    },
  };
}
