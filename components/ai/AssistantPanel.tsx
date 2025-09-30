"use client";

import React, { useCallback, useEffect, useRef, useState } from "react";
import ReactMarkdown from "react-markdown";
import InlineChart from "@/components/ai/InlineChart";
import type {
  AssistantEventMessage,
  AssistantMessage,
  AssistantRequestPayload,
  ChartSpec,
  SheetContextPayload,
} from "@/types/ai";

interface AssistantPanelProps {
  sheetId: string;
  getContext: () => Promise<SheetContextPayload>;
  conversation?: AssistantMessage[];
  onConversationChange?: (messages: AssistantMessage[]) => void;
  endpoint?: string;
}

interface StreamHandlerOptions {
  request: AssistantRequestPayload;
  onChunk: (chunk: AssistantEventMessage) => void;
  signal: AbortSignal;
  endpoint: string;
}

async function streamAssistant({
  request,
  onChunk,
  signal,
  endpoint,
}: StreamHandlerOptions) {
  const response = await fetch(endpoint, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(request),
    signal,
  });

  if (!response.ok || !response.body) {
    throw new Error("Assistant request failed");
  }

  const reader = response.body.getReader();
  const decoder = new TextDecoder("utf-8");
  let buffer = "";

  while (true) {
    const { value, done } = await reader.read();
    if (done) break;
    buffer += decoder.decode(value, { stream: true });

    let separatorIndex;
    while ((separatorIndex = buffer.indexOf("\n\n")) !== -1) {
      const rawEvent = buffer.slice(0, separatorIndex);
      buffer = buffer.slice(separatorIndex + 2);

      if (!rawEvent.trim()) {
        continue;
      }

      const lines = rawEvent.split("\n");
      let eventType = "message";
      const dataChunks: string[] = [];
      for (const line of lines) {
        if (line.startsWith("event:")) {
          eventType = line.slice(6).trim();
        } else if (line.startsWith("data:")) {
          dataChunks.push(line.slice(5).trim());
        }
      }

      try {
        const payload = dataChunks.length ? JSON.parse(dataChunks.join("")) : {};
        const parsed: AssistantEventMessage = {
          type: eventType as AssistantEventMessage["type"],
          ...payload,
        };
        onChunk(parsed);
      } catch (error) {
        console.error("Failed to parse SSE payload", error);
      }
    }
  }
}

const AssistantPanel: React.FC<AssistantPanelProps> = ({
  sheetId,
  getContext,
  conversation,
  onConversationChange,
  endpoint = "/api/ai/assistant",
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState<AssistantMessage[]>(conversation ?? []);
  const [isLoading, setIsLoading] = useState(false);
  const abortController = useRef<AbortController | null>(null);
  const bodyRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (conversation) {
      setMessages(conversation);
    }
  }, [conversation]);

  useEffect(() => {
    onConversationChange?.(messages);
  }, [messages, onConversationChange]);

  const appendMessage = useCallback((message: AssistantMessage) => {
    setMessages((prev) => [...prev, message]);
  }, []);

  const updateMessage = useCallback(
    (id: string, updater: (message: AssistantMessage) => AssistantMessage) => {
      setMessages((prev) =>
        prev.map((message) => (message.id === id ? updater(message) : message))
      );
    },
    []
  );

  const handleOpen = useCallback(() => {
    setIsOpen(true);
    requestAnimationFrame(() => {
      bodyRef.current?.scrollTo({ top: bodyRef.current.scrollHeight });
    });
  }, []);

  const handleClose = useCallback(() => {
    abortController.current?.abort();
    setIsOpen(false);
  }, []);

  const handleSubmit = useCallback(async () => {
    if (!input.trim() || isLoading) {
      return;
    }

    setIsLoading(true);

    const userMessage: AssistantMessage = {
      id: `user-${Date.now()}`,
      role: "user",
      content: input,
      createdAt: Date.now(),
    };

    appendMessage(userMessage);
    setInput("");

    const context = await getContext();

    const assistantMessage: AssistantMessage = {
      id: `assistant-${Date.now()}`,
      role: "assistant",
      content: "",
      createdAt: Date.now(),
      charts: [],
    };
    appendMessage(assistantMessage);

    abortController.current = new AbortController();

    try {
      await streamAssistant({
        request: {
          prompt: userMessage.content,
          sheetId,
          context,
          conversation: [...messages, userMessage],
        },
        onChunk: (event) => {
          if (event.type === "message" && event.content) {
            updateMessage(assistantMessage.id, (prev) => ({
              ...prev,
              content: prev.content + event.content,
            }));
          }
          if (event.type === "chart" && event.chart) {
            updateMessage(assistantMessage.id, (prev) => {
              const charts = new Map(
                (prev.charts ?? []).map((chart) => [chart.id, chart])
              );
              charts.set(event.chart.id, event.chart);
              return {
                ...prev,
                charts: Array.from(charts.values()),
              };
            });
          }
          if (event.type === "error") {
            updateMessage(assistantMessage.id, (prev) => ({
              ...prev,
              content:
                prev.content +
                `\n\n⚠️ ${event.error ?? "The assistant encountered an unexpected error."}`,
            }));
          }
        },
        signal: abortController.current.signal,
        endpoint,
      });
    } catch (error) {
      if ((error as DOMException)?.name === "AbortError") {
        updateMessage(assistantMessage.id, (prev) => ({
          ...prev,
          content: prev.content || "Response cancelled.",
        }));
      } else {
        updateMessage(assistantMessage.id, (prev) => ({
          ...prev,
          content:
            prev.content ||
            "Unable to contact the AI assistant. Please try again shortly.",
        }));
      }
    } finally {
      setIsLoading(false);
      abortController.current = null;
    }
  }, [
    input,
    isLoading,
    appendMessage,
    getContext,
    sheetId,
    updateMessage,
    messages,
    endpoint,
  ]);

  const handleKeyDown = useCallback(
    (event: React.KeyboardEvent<HTMLTextAreaElement>) => {
      if (event.key === "Enter" && !event.shiftKey) {
        event.preventDefault();
        handleSubmit();
      }
    },
    [handleSubmit]
  );

  useEffect(() => {
    if (!isOpen) {
      return;
    }
    bodyRef.current?.scrollTo({ top: bodyRef.current.scrollHeight });
  }, [messages, isOpen]);

  return (
    <>
      <button className="assistant-toggle" onClick={handleOpen}>
        Ask AI
      </button>
      {isOpen && (
        <div className="assistant-panel">
          <div className="assistant-header">
            <h3>Sheet Assistant</h3>
            <button onClick={handleClose} aria-label="Close assistant">
              ×
            </button>
          </div>
          <div className="assistant-body" ref={bodyRef}>
            {messages.map((message) => (
              <div
                key={message.id}
                className={`assistant-message assistant-message--${message.role}`}
              >
                <ReactMarkdown>{message.content}</ReactMarkdown>
                {message.charts?.length ? (
                  <div className="assistant-charts">
                    {message.charts.map((chart: ChartSpec) => (
                      <InlineChart key={chart.id} spec={chart} />
                    ))}
                  </div>
                ) : null}
              </div>
            ))}
          </div>
          <div className="assistant-footer">
            <textarea
              value={input}
              onChange={(event) => setInput(event.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Ask about the current sheet…"
              disabled={isLoading}
            />
            <div className="assistant-actions">
              <button onClick={handleSubmit} disabled={isLoading || !input.trim()}>
                {isLoading ? "Thinking…" : "Send"}
              </button>
              {isLoading && (
                <button
                  type="button"
                  onClick={() => abortController.current?.abort()}
                  className="assistant-cancel"
                >
                  Stop
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default AssistantPanel;
