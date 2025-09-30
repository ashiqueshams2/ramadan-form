import { NextRequest } from "next/server";
import { generate } from "@genkit-ai/ai";
import { gemini15Pro } from "@genkit-ai/googleai/models";
import { z } from "zod";
import { initGenkit } from "@/lib/genkit";
import {
  buildContextPrompt,
  sanitizeSheetContext,
} from "@/lib/ai/context";
import type { AssistantMessage, AssistantRequestPayload } from "@/types/ai";
import { encodeSseEvent } from "@/utils/sse";

export const runtime = "edge";

const RequestSchema = z.object({
  prompt: z.string().min(1),
  sheetId: z.string().min(1),
  context: z.object({}).passthrough(),
  conversation: z.array(z.object({}).passthrough()).optional(),
});

interface StreamOptions {
  request: AssistantRequestPayload;
  controller: ReadableStreamDefaultController<Uint8Array>;
}

const CHART_BLOCK_START = "```chart\n";
const CHART_BLOCK_END = "```";

async function streamAssistantResponse({
  request,
  controller,
}: StreamOptions) {
  initGenkit();

  const sanitizedContext = sanitizeSheetContext(request.context);
  const contextPrompt = buildContextPrompt(sanitizedContext);

  let aggregatedText = "";
  let lastSentIndex = 0;
  let capturingChart = false;
  let chartBuffer = "";

  const systemPrompt = `You are an analytical assistant who helps a user understand spreadsheet data. Use the provided sheet context to answer questions and never leak raw row identifiers.

Context Information:
${contextPrompt}

Instructions:
- Provide concise, actionable insights grounded in the context data.
- When chart-worthy trends exist, output a fenced code block formatted as \`\`\`chart\n{ "id": string, "type": "line" | "bar" | "area" | "pie", "xKey": string, "yKeys": string[], "data": any[], "title"?: string, "config"?: object }\n\`\`\`.
- Ensure the response outside of chart blocks is valid Markdown.`;

  const priorMessages = (request.conversation ?? [])
    .filter((message) => message.role !== "system")
    .map((message) => ({
      role: message.role,
      content: message.content,
    }));

  const { stream } = await generate({
    model: gemini15Pro,
    input: [
      { role: "system", content: systemPrompt },
      ...priorMessages,
      { role: "user", content: request.prompt },
    ],
    output: { format: "text" },
    config: {
      temperature: 0.3,
    },
    stream: true,
  });

  for await (const chunk of stream) {
    if (chunk.type !== "output_text") {
      continue;
    }

    const delta = chunk.text();
    if (!delta) {
      continue;
    }

    for (const char of delta) {
      if (capturingChart) {
        chartBuffer += char;
        if (chartBuffer.endsWith(CHART_BLOCK_END)) {
          const raw = chartBuffer.slice(0, -CHART_BLOCK_END.length).trim();
          chartBuffer = "";
          capturingChart = false;
          try {
            const chart = JSON.parse(raw);
            controller.enqueue(encodeSseEvent("chart", { chart }));
          } catch (error) {
            controller.enqueue(
              encodeSseEvent("error", {
                error: "Failed to parse chart specification",
              })
            );
          }
        }
      } else {
        aggregatedText += char;
        if (aggregatedText.endsWith(CHART_BLOCK_START)) {
          aggregatedText = aggregatedText.slice(
            0,
            -CHART_BLOCK_START.length
          );
          capturingChart = true;
          chartBuffer = "";
        }
      }
    }

    const diff = aggregatedText.slice(lastSentIndex);
    if (diff) {
      controller.enqueue(encodeSseEvent("message", { content: diff }));
      lastSentIndex = aggregatedText.length;
    }
  }

  controller.enqueue(encodeSseEvent("done", { content: aggregatedText }));
}

export async function POST(req: NextRequest) {
  const json = await req.json();
  const parsed = RequestSchema.parse(json);

  const payload: AssistantRequestPayload = {
    prompt: parsed.prompt,
    sheetId: parsed.sheetId,
    context: parsed.context as AssistantRequestPayload["context"],
    conversation: parsed.conversation as AssistantMessage[] | undefined,
  };

  const stream = new ReadableStream<Uint8Array>({
    async start(controller) {
      try {
        await streamAssistantResponse({
          request: payload,
          controller,
        });
      } catch (error) {
        controller.enqueue(
          encodeSseEvent("error", {
            error:
              error instanceof Error
                ? error.message
                : "Unknown error generating assistant response",
          })
        );
      } finally {
        controller.close();
      }
    },
  });

  return new Response(stream, {
    status: 200,
    headers: {
      "Content-Type": "text/event-stream",
      Connection: "keep-alive",
      "Cache-Control": "no-cache, no-transform",
    },
  });
}
