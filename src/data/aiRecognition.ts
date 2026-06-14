import type { LifeStreamInput } from "@/services/ai/analyzeLifeStream";
import { parseFunnelResult } from "@/services/ai/funnelResultSchema";
import type { FunnelArrangementItem, FunnelResult } from "@/types/funnel";

export const aiRecognitionStorageKey = "arkme-demo.aiRecognitionResults";

export type AiRecognitionRecord = {
  id: string;
  createdAt: number;
  input: LifeStreamInput;
  result: FunnelResult;
};

export type AiRecognitionCandidateView = {
  id: string;
  recordId: string;
  createdAt: number;
  inputText: string;
  arrangement: FunnelArrangementItem;
};

export function getInitialAiRecognitionRecords() {
  if (typeof window === "undefined") return [] as AiRecognitionRecord[];

  try {
    const raw = window.localStorage.getItem(aiRecognitionStorageKey);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];

    return parsed
      .map(normalizeAiRecognitionRecord)
      .filter((item): item is AiRecognitionRecord => Boolean(item));
  } catch {
    return [];
  }
}

export function persistAiRecognitionRecords(records: AiRecognitionRecord[]) {
  if (typeof window === "undefined") return;

  try {
    window.localStorage.setItem(aiRecognitionStorageKey, JSON.stringify(records));
  } catch {
    // Keep the in-memory experience working if storage is unavailable.
  }
}

export function appendAiRecognitionRecord(record: AiRecognitionRecord) {
  const current = getInitialAiRecognitionRecords();
  persistAiRecognitionRecords([...current, record].slice(-30));
}

export function flattenAiRecognitionCandidates(records: AiRecognitionRecord[]) {
  return records
    .flatMap<AiRecognitionCandidateView>((record) =>
      record.result.candidateArrangements.map((arrangement) => ({
        id: `${record.id}:${arrangement.id}`,
        recordId: record.id,
        createdAt: record.createdAt,
        inputText: record.result.inputText,
        arrangement,
      }))
    )
    .sort((left, right) => right.createdAt - left.createdAt);
}

function normalizeAiRecognitionRecord(value: unknown): AiRecognitionRecord | null {
  if (!value || typeof value !== "object") return null;

  const record = value as Partial<AiRecognitionRecord>;
  if (typeof record.id !== "string") return null;
  if (typeof record.createdAt !== "number" || !Number.isFinite(record.createdAt)) {
    return null;
  }
  if (!record.input || typeof record.input !== "object") return null;

  const normalizedResult = parseFunnelResult(record.result);
  if (!normalizedResult) return null;

  return {
    id: record.id,
    createdAt: record.createdAt,
    input: {
      text: typeof record.input.text === "string" ? record.input.text : "",
      channel: record.input.channel,
      speaker: typeof record.input.speaker === "string" ? record.input.speaker : undefined,
      sourceLabel:
        typeof record.input.sourceLabel === "string" ? record.input.sourceLabel : undefined,
      occurredAt:
        typeof record.input.occurredAt === "string" ? record.input.occurredAt : undefined,
      recordUid:
        typeof record.input.recordUid === "string" ? record.input.recordUid : undefined,
      conversationId:
        typeof record.input.conversationId === "string"
          ? record.input.conversationId
          : undefined,
      sourceConversation:
        record.input.sourceConversation &&
        typeof record.input.sourceConversation === "object"
          ? record.input.sourceConversation
          : undefined,
    },
    result: normalizedResult,
  };
}
