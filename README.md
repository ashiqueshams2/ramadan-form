# Ramadan Form AI Assistant

This repository now includes scaffolding for an AI-powered assistant panel that can be embedded in a spreadsheet experience. The assistant uses Google Gemini models through Genkit and streams responses – including Markdown and inline chart specifications – back to the UI via server-sent events (SSE).

## Key Pieces

- `components/ai/AssistantPanel.tsx` – client-side sidebar/modal component that opens from a sheet experience, sends prompts, and renders streamed Markdown plus inline chart components.
- `components/ai/InlineChart.tsx` – lightweight chart renderer that supports line, bar, area, and pie charts using Recharts.
- `app/api/ai/assistant/route.ts` – Next.js Edge route that orchestrates Genkit calls, secures the sheet context, and streams SSE updates to the browser.
- `lib/ai/context.ts` – helpers to sanitize sheet context, apply filters, and build the prompt the model receives.
- `lib/genkit/index.ts` – Genkit bootstrap that wires Gemini with API key credentials.

## Environment Variables

The assistant requires the following environment variables:

- `GOOGLE_GENAI_API_KEY` – API key for Google AI Studio / Gemini models.
- `GOOGLE_CLOUD_PROJECT` – (optional) Google Cloud project name for request attribution.
- `GOOGLE_GENAI_LOCATION` – (optional) region, defaults to `us-central1`.

## Running Locally

1. Install dependencies with `npm install`.
2. Export the required environment variables.
3. Run `npm run dev` to start the Next.js development server.

> The legacy static `index.html` is preserved; the new assistant lives in the Next.js application code under `components/` and `app/`.
