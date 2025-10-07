"use client";

import { useLocalRuntime } from "@assistant-ui/react";
import { unstable_useRemoteThreadListRuntime as useRemoteThreadListRuntime } from "@assistant-ui/react";
import { useSession } from "@clerk/nextjs";
import { useState, useMemo } from "react";
import type { ChatModelAdapter } from "@assistant-ui/react";
import { createDifyThreadListAdapter } from "./dify-thread-adapter";

export function useDifyRuntime(userId: string) {
  const { session } = useSession();
  const [conversationId, setConversationId] = useState<string>("");

  const chatAdapter: ChatModelAdapter = useMemo(
    () => ({
      async *run({ messages, abortSignal }) {
        const token = await session?.getToken();
        if (!token) {
          throw new Error("Not authenticated");
        }

        // Get last message (user's question)
        const lastMessage = messages[messages.length - 1];
        const query = lastMessage.content
          .filter((part) => part.type === "text")
          .map((part) => (part.type === "text" ? part.text : ""))
          .join("");

        // Call existing Dify Edge Function
        const response = await fetch(
          `${process.env.NEXT_PUBLIC_SUPABASE_URL}/functions/v1/dify-chat`,
          {
            method: "POST",
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              query,
              conversationId: conversationId || "",
              userId,
            }),
            signal: abortSignal,
          }
        );

        if (!response.ok) {
          throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }

        // Parse SSE stream from Dify
        const reader = response.body?.getReader();
        if (!reader) {
          throw new Error("No response body");
        }

        const decoder = new TextDecoder();
        let buffer = "";
        let accumulatedText = "";

        try {
          while (true) {
            const { done, value } = await reader.read();
            if (done) break;

            buffer += decoder.decode(value, { stream: true });
            const lines = buffer.split("\n");
            buffer = lines.pop() || "";

            for (const line of lines) {
              if (line.startsWith("data: ")) {
                try {
                  const data = JSON.parse(line.slice(6));

                  switch (data.event) {
                    case "message":
                      // Accumulate text and yield full message
                      accumulatedText += data.answer;
                      yield {
                        content: [{ type: "text" as const, text: accumulatedText }],
                      };

                      // Store conversation_id for next message
                      if (data.conversation_id && !conversationId) {
                        setConversationId(data.conversation_id);
                      }
                      break;

                    case "message_end":
                      // Streaming complete
                      break;

                    case "error":
                      throw new Error(data.message || "Dify API error");
                  }
                } catch (parseError) {
                  console.error("Failed to parse SSE event:", parseError);
                }
              }
            }
          }
        } finally {
          reader.releaseLock();
        }
      },
    }),
    [session, userId, conversationId]
  );

  // Create thread list adapter
  const threadListAdapter = useMemo(
    () => createDifyThreadListAdapter(userId, () => session?.getToken() || Promise.resolve(null)),
    [userId, session]
  );

  // Upgrade to RemoteThreadListRuntime for multi-thread support
  const runtime = useRemoteThreadListRuntime({
    runtimeHook: function useDifyThreadRuntime() {
      return useLocalRuntime(chatAdapter);
    },
    adapter: threadListAdapter,
  });

  return { runtime };
}
