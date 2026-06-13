"use client";

import { CrisisModal } from "@/features/crisis/crisis-modal";
import { useCompanionChat } from "@/features/chat/use-companion-chat";
import { Button } from "@/components/ui/button";
import { GlassCard } from "@/components/wellness/glass-card";
import { Textarea } from "@/components/ui/textarea";
import { THERAPY_DISCLAIMER } from "@/features/crisis/helplines";

interface CompanionChatProps {
  examType: string;
}

const QUICK_CHIPS = [
  "I'm anxious about tomorrow's test",
  "Can't focus on studies",
  "Feeling burnt out",
];

/** Empathetic AI companion chat with streaming responses. */
export function CompanionChat({ examType }: CompanionChatProps) {
  const {
    messages,
    input,
    setInput,
    streaming,
    crisisOpen,
    setCrisisOpen,
    liveRef,
    sendMessage,
  } = useCompanionChat();

  return (
    <div className="flex h-[calc(100vh-12rem)] flex-col" aria-labelledby="chat-title">
      <header className="mb-4">
        <h1 id="chat-title" className="font-display text-2xl font-bold">
          Your {examType} Companion
        </h1>
        <p className="text-sm text-muted-foreground">{THERAPY_DISCLAIMER}</p>
      </header>

      <div
        className="glass-card flex-1 space-y-4 overflow-y-auto rounded-xl p-4"
        role="log"
        aria-label="Chat messages"
        aria-live="polite"
      >
        {messages.length === 0 && (
          <p className="text-center text-muted-foreground">
            I&apos;m here whenever you need to talk. How are you feeling today?
          </p>
        )}
        {messages.map((msg, i) => (
          <div
            key={i}
            className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
          >
            <GlassCard
              className={`max-w-[85%] p-3 ${
                msg.role === "user" ? "chat-bubble-user" : "chat-bubble-assistant"
              }`}
              aria-label={msg.role === "user" ? "Your message" : "Companion reply"}
            >
              <p className="text-sm">{msg.content}</p>
              {streaming && i === messages.length - 1 && msg.role === "assistant" && !msg.content && (
                <span className="inline-flex gap-1" aria-label="Companion is typing">
                  <span className="h-2 w-2 animate-pulse rounded-full bg-primary" />
                  <span className="h-2 w-2 animate-pulse rounded-full bg-primary delay-75" />
                  <span className="h-2 w-2 animate-pulse rounded-full bg-primary delay-150" />
                </span>
              )}
            </GlassCard>
          </div>
        ))}
        <div ref={liveRef} className="sr-only" aria-live="polite" />
      </div>

      <div className="mt-4 flex flex-wrap gap-2" role="group" aria-label="Quick message suggestions">
        {QUICK_CHIPS.map((chip) => (
          <Button
            key={chip}
            variant="outline"
            size="sm"
            onClick={() => sendMessage(chip)}
            disabled={streaming}
            aria-label={`Send quick message: ${chip}`}
          >
            {chip}
          </Button>
        ))}
      </div>

      <form
        className="mt-4 flex gap-2"
        onSubmit={(e) => {
          e.preventDefault();
          void sendMessage(input);
        }}
        aria-label="Send a chat message"
      >
        <Textarea
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Share what's on your mind..."
          aria-label="Chat message"
          rows={2}
          className="flex-1 border-white/10 bg-background/50"
          onKeyDown={(e) => {
            if (e.key === "Enter" && !e.shiftKey) {
              e.preventDefault();
              void sendMessage(input);
            }
          }}
        />
        <Button type="submit" disabled={streaming || !input.trim()} aria-label="Send message">
          {streaming ? "…" : "Send"}
        </Button>
      </form>

      <CrisisModal open={crisisOpen} onOpenChange={setCrisisOpen} />
    </div>
  );
}
