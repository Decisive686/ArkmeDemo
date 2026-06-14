import {
  buildFunnelUserPrompt,
  funnelSystemPrompt,
} from "@/services/ai/funnelPrompt";
import { funnelResultJsonSchema, parseFunnelResult } from "@/services/ai/funnelResultSchema";
import type {
  AnalyzeLifeStreamConfig,
} from "@/services/ai/aiConfig";
import type { LifeStreamInput } from "@/services/ai/analyzeLifeStream";
import type { FunnelResult } from "@/types/funnel";

type OpenAiChatCompletionResponse = {
  choices?: Array<{
    message?: {
      content?: string | null;
    };
  }>;
};

export async function openaiAnalyzeLifeStream(
  input: LifeStreamInput,
  config: AnalyzeLifeStreamConfig
): Promise<FunnelResult> {
  if (!config.apiKey) {
    throw new Error("Missing OpenAI API key.");
  }

  if (!config.model) {
    throw new Error("Missing OpenAI model.");
  }

  const controller = new AbortController();
  const timeout = window.setTimeout(() => controller.abort(), config.timeoutMs);

  try {
    const response = await fetch(`${trimTrailingSlash(config.baseUrl)}/chat/completions`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${config.apiKey}`,
      },
      body: JSON.stringify({
        model: config.model,
        temperature: 0.1,
        messages: [
          { role: "system", content: funnelSystemPrompt },
          { role: "user", content: buildFunnelUserPrompt(input) },
        ],
        response_format: {
          type: "json_schema",
          json_schema: {
            name: "funnel_result",
            strict: true,
            schema: funnelResultJsonSchema,
          },
        },
      }),
      signal: controller.signal,
    });

    if (!response.ok) {
      throw new Error(`OpenAI request failed with status ${response.status}.`);
    }

    const json = (await response.json()) as OpenAiChatCompletionResponse;
    const content = json.choices?.[0]?.message?.content;
    if (!content) {
      throw new Error("OpenAI returned empty content.");
    }

    const parsed = parseFunnelResult(JSON.parse(content));
    if (!parsed) {
      throw new Error("OpenAI returned invalid FunnelResult JSON.");
    }

    return parsed;
  } finally {
    window.clearTimeout(timeout);
  }
}

function trimTrailingSlash(value: string) {
  return value.replace(/\/+$/, "");
}
