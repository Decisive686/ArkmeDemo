import {
  defaultAnalyzeLifeStreamConfig,
  type AnalyzeLifeStreamConfig,
} from "@/services/ai/aiConfig";
import { parseFunnelResult } from "@/services/ai/funnelResultSchema";
import { mockAnalyzeLifeStream } from "@/services/ai/mockAnalyzeLifeStream";
import { openaiAnalyzeLifeStream } from "@/services/ai/openaiAnalyzeLifeStream";
import type { RecordSourceConversation } from "@/types/record";
import type { FunnelSourceChannel, FunnelResult } from "@/types/funnel";

export type LifeStreamInput = {
  text: string;
  channel?: FunnelSourceChannel;
  speaker?: string;
  sourceLabel?: string;
  occurredAt?: string;
  recordUid?: string;
  conversationId?: string;
  sourceConversation?: RecordSourceConversation;
};

export async function analyzeLifeStream(
  input: LifeStreamInput,
  config: AnalyzeLifeStreamConfig = defaultAnalyzeLifeStreamConfig
): Promise<FunnelResult> {
  if (!input.text.trim()) {
    return createEmptyFunnelResult(input);
  }

  if (!config.aiEnabled) {
    return createEmptyFunnelResult(input);
  }

  try {
    const result =
      config.mode === "openai"
        ? await openaiAnalyzeLifeStream(input, config)
        : await mockAnalyzeLifeStream(input);

    return parseFunnelResult(result) ?? createEmptyFunnelResult(input);
  } catch {
    return createEmptyFunnelResult(input);
  }
}

export function createEmptyFunnelResult(input: LifeStreamInput): FunnelResult {
  return {
    id: makeId("funnel"),
    inputText: input.text,
    generatedAt: new Date().toISOString(),
    sourceRefs: [
      {
        id: makeId("src"),
        channel: input.channel ?? "note",
        speaker: input.speaker ?? "我",
        text: input.text,
        occurredAtText: input.occurredAt,
        recordUid: input.recordUid,
      },
    ],
    memories: [],
    emotions: [],
    inspirations: [],
    candidateArrangements: [],
    formalArrangements: [],
    mergeSuggestions: [],
    arrangementGroups: [],
    ignoredItems: [],
    riskItems: [],
  };
}

function makeId(prefix: string) {
  if (typeof crypto !== "undefined" && typeof crypto.randomUUID === "function") {
    return `${prefix}-${crypto.randomUUID()}`;
  }
  return `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}
