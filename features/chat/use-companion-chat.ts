import { useState, useRef, useEffect, useCallback } from "react";
import { detectCrisis } from "@/lib/ai/crisis-detector";
import { sanitizeAiOutput } from "@/lib/security/sanitize";

export interface ChatMessage {
  role: "user" | "assistant";
  content: string;
}

/**
 * Encapsulates companion chat state, crisis detection, and SSE streaming.
 */
export function useCompanionChat() {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [streaming, setStreaming] = useState(false);
  const [crisisOpen, setCrisisOpen] = useState(false);
  const liveRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (liveRef.current) {
      liveRef.current.textContent = messages[messages.length - 1]?.content ?? "";
    }
  }, [messages]);

  const sendMessage = useCallback(
    async (text: string) => {
      if (!text.trim() || streaming) return;

      const crisis = detectCrisis(text);
      if (crisis.isCrisis && crisis.severity === "high") {
        setCrisisOpen(true);
      }

      const userMessage: ChatMessage = { role: "user", content: text };
      setMessages((prev) => [...prev, userMessage]);
      setInput("");
      setStreaming(true);
      setMessages((prev) => [...prev, { role: "assistant", content: "" }]);

      try {
        const res = await fetch("/api/ai/chat", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ message: text, history: messages.slice(-10) }),
        });

        if (!res.ok) throw new Error("Chat failed");

        const reader = res.body?.getReader();
        const decoder = new TextDecoder();
        if (!reader) throw new Error("No stream");

        let buffer = "";
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;

          buffer += decoder.decode(value, { stream: true });
          const lines = buffer.split("\n");
          buffer = lines.pop() ?? "";

          for (const line of lines) {
            if (!line.startsWith("data: ")) continue;
            const data = line.slice(6);
            if (data === "[DONE]") continue;

            try {
              const parsed = JSON.parse(data) as { text?: string; crisis?: boolean };
              if (parsed.crisis) setCrisisOpen(true);
              if (parsed.text) {
                setMessages((prev) => {
                  const updated = [...prev];
                  const last = updated[updated.length - 1];
                  if (last?.role === "assistant") {
                    last.content += sanitizeAiOutput(parsed.text ?? "");
                  }
                  return updated;
                });
              }
            } catch {
              // skip malformed SSE
            }
          }
        }
      } catch {
        setMessages((prev) => {
          const updated = [...prev];
          const last = updated[updated.length - 1];
          if (last?.role === "assistant") {
            last.content = "I'm having trouble connecting right now. Please try again in a moment.";
          }
          return updated;
        });
      } finally {
        setStreaming(false);
      }
    },
    [messages, streaming],
  );

  return {
    messages,
    input,
    setInput,
    streaming,
    crisisOpen,
    setCrisisOpen,
    liveRef,
    sendMessage,
  };
}
