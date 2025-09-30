import { configureGenkit } from "@genkit-ai/core";
import { googleAI } from "@genkit-ai/googleai";

let isConfigured = false;

export function initGenkit() {
  if (isConfigured) {
    return;
  }

  const apiKey = process.env.GOOGLE_GENAI_API_KEY;
  if (!apiKey) {
    throw new Error(
      "Missing GOOGLE_GENAI_API_KEY environment variable required for Genkit"
    );
  }

  configureGenkit({
    plugins: [
      googleAI({
        apiKey,
        project: process.env.GOOGLE_CLOUD_PROJECT,
        location: process.env.GOOGLE_GENAI_LOCATION ?? "us-central1",
      }),
    ],
  });

  isConfigured = true;
}
