import type { RecordItem, RecordSourceConversation } from "@/types/record";
import type {
  ArrangementApiSettings,
  ArrangementDraft,
  ArrangementFocus,
  ArrangementItem,
  ArrangementSourceType,
  ArrangementStatus,
} from "@/types/arrangement";
import type { FunnelArrangementItem, FunnelResult, FunnelSourceChannel } from "@/types/funnel";

export const arrangementsStorageKey = "arkme-demo.arrangements";
export const arrangementApiSettingsStorageKey = "arkme-demo.arrangementApiSettings";

const defaultApiSettings: ArrangementApiSettings = {
  mode: "mock",
  provider: "OpenAI compatible",
  baseUrl: "",
  model: "gpt-4.1-mini",
  apiKey: "",
  aiEnabled: true,
  autoCreate: false,
};

const focusOrder: Record<ArrangementFocus, number> = {
  today: 0,
  recent: 1,
  confirm: 2,
  later: 3,
  quiet: 4,
};

const activeStatusOrder: Record<ArrangementStatus, number> = {
  active: 0,
  maybeDone: 1,
  expired: 2,
  done: 3,
  archived: 4,
};

function readJsonValue(key: string): unknown {
  if (typeof window === "undefined") return null;

  try {
    const value = window.localStorage.getItem(key);
    return value ? JSON.parse(value) : null;
  } catch {
    return null;
  }
}

function writeJsonValue(key: string, value: unknown) {
  if (typeof window === "undefined") return;

  try {
    window.localStorage.setItem(key, JSON.stringify(value));
  } catch {
    // Keep the in-memory demo usable if localStorage is unavailable.
  }
}

function normalizeText(value: unknown) {
  return typeof value === "string" ? value.trim() : "";
}

function normalizeTimestamp(value: unknown, fallback: number) {
  return typeof value === "number" && Number.isFinite(value) ? value : fallback;
}

function normalizeStatus(value: unknown): ArrangementStatus {
  if (
    value === "active" ||
    value === "maybeDone" ||
    value === "done" ||
    value === "expired" ||
    value === "archived"
  ) {
    return value;
  }
  return "active";
}

function normalizeFocus(value: unknown): ArrangementFocus {
  if (
    value === "today" ||
    value === "recent" ||
    value === "confirm" ||
    value === "later" ||
    value === "quiet"
  ) {
    return value;
  }
  return "recent";
}

function normalizeSourceType(value: unknown): ArrangementSourceType {
  if (
    value === "manual" ||
    value === "record" ||
    value === "self" ||
    value === "private" ||
    value === "group" ||
    value === "context"
  ) {
    return value;
  }
  return "manual";
}

function normalizeArrangement(value: unknown, index: number): ArrangementItem | null {
  if (!value || typeof value !== "object") return null;

  const arrangement = value as Partial<ArrangementItem>;
  const title = normalizeText(arrangement.title);
  if (!title) return null;

  const source = arrangement.source && typeof arrangement.source === "object"
    ? arrangement.source
    : null;
  const timestamp = Date.now() + index;

  return {
    uid: normalizeText(arrangement.uid) || `arrangement-${timestamp}`,
    title,
    timeText: normalizeText(arrangement.timeText),
    location: normalizeText(arrangement.location),
    people: Array.isArray(arrangement.people)
      ? arrangement.people.map(normalizeText).filter(Boolean)
      : [],
    note: normalizeText(arrangement.note),
    status: normalizeStatus(arrangement.status),
    focus: normalizeFocus(arrangement.focus),
    source: {
      type: normalizeSourceType(source?.type),
      label: normalizeText(source?.label) || "手动创建",
      snippet: normalizeText(source?.snippet),
      recordUid: normalizeText(source?.recordUid),
      conversation: source?.conversation,
    },
    confidence:
      typeof arrangement.confidence === "number" &&
      Number.isFinite(arrangement.confidence)
        ? arrangement.confidence
        : undefined,
    executionType:
      arrangement.executionType === "aiAuto" ||
      arrangement.executionType === "aiAssist"
        ? arrangement.executionType
        : "user",
    createdAt: normalizeTimestamp(arrangement.createdAt, timestamp),
    updatedAt: normalizeTimestamp(arrangement.updatedAt, timestamp),
  };
}

export function createDefaultArrangements(now = Date.now()): ArrangementItem[] {
  return [
    createArrangementItem(
      {
        title: "后天去医院检查身体",
        timeText: "后天上午",
        location: "医院",
        people: ["我", "家人"],
        note: "先把这件事轻轻放到近期关注里，不用制造逾期压力。",
        status: "active",
        focus: "recent",
        source: {
          type: "self",
          label: "发给自己",
          snippet: "后天去一趟医院",
        },
        confidence: 0.86,
        executionType: "aiAssist",
      },
      now - 1000 * 60 * 34
    ),
    createArrangementItem(
      {
        title: "明天到公司帮对方带早餐",
        timeText: "明天上班前",
        location: "公司",
        people: ["我", "对方"],
        note: "这是一个承诺关系示例：用户答应后才进入自己的安排。",
        status: "active",
        focus: "today",
        source: {
          type: "private",
          label: "私聊承诺",
          snippet: "明天来公司帮我带个早餐。好的。",
        },
        confidence: 0.82,
        executionType: "user",
      },
      now - 1000 * 60 * 18
    ),
    createArrangementItem(
      {
        title: "整理安排模块的首页浮现入口",
        timeText: "最近",
        location: "即我 Demo",
        people: ["我"],
        note: "低置信度或需要判断的内容先放在待确认，不直接打扰用户。",
        status: "active",
        focus: "confirm",
        source: {
          type: "context",
          label: "上下文归集",
          snippet: "安排不要放进底部导航，而是从首页自然浮现。",
        },
        confidence: 0.68,
        executionType: "aiAssist",
      },
      now - 1000 * 60 * 9
    ),
  ];
}

export function getInitialArrangements() {
  const parsedValue = readJsonValue(arrangementsStorageKey);
  if (!Array.isArray(parsedValue)) return createDefaultArrangements();

  const arrangements = parsedValue
    .map(normalizeArrangement)
    .filter((item): item is ArrangementItem => Boolean(item));

  return arrangements.length > 0 ? arrangements : createDefaultArrangements();
}

export function persistArrangements(arrangements: ArrangementItem[]) {
  writeJsonValue(arrangementsStorageKey, arrangements);
}

export function getInitialArrangementApiSettings() {
  const parsedValue = readJsonValue(arrangementApiSettingsStorageKey);
  if (!parsedValue || typeof parsedValue !== "object") return defaultApiSettings;

  const settings = parsedValue as Partial<ArrangementApiSettings>;
  return {
    mode: settings.mode === "openai" ? "openai" : defaultApiSettings.mode,
    provider: normalizeText(settings.provider) || defaultApiSettings.provider,
    baseUrl: normalizeText(settings.baseUrl),
    model: normalizeText(settings.model) || defaultApiSettings.model,
    apiKey: normalizeText(settings.apiKey),
    aiEnabled:
      typeof settings.aiEnabled === "boolean"
        ? settings.aiEnabled
        : defaultApiSettings.aiEnabled,
    autoCreate:
      typeof settings.autoCreate === "boolean"
        ? settings.autoCreate
        : defaultApiSettings.autoCreate,
  };
}

export function persistArrangementApiSettings(settings: ArrangementApiSettings) {
  writeJsonValue(arrangementApiSettingsStorageKey, settings);
}

export function createArrangementItem(
  draft: ArrangementDraft,
  timestamp = Date.now()
): ArrangementItem {
  return {
    ...draft,
    uid: `arrangement-${timestamp}-${Math.random().toString(36).slice(2, 7)}`,
    createdAt: timestamp,
    updatedAt: timestamp,
  };
}

export function sortArrangements(arrangements: ArrangementItem[]) {
  return [...arrangements].sort((a, b) => {
    const statusDelta = activeStatusOrder[a.status] - activeStatusOrder[b.status];
    if (statusDelta !== 0) return statusDelta;
    const focusDelta = focusOrder[a.focus] - focusOrder[b.focus];
    if (focusDelta !== 0) return focusDelta;
    return b.updatedAt - a.updatedAt;
  });
}

export function arrangementDraftFromRecord(record: RecordItem): ArrangementDraft {
  const text = record.text_content.trim();
  const title = inferArrangementTitle(text) || text.slice(0, 28) || "从快记转来的安排";
  const timeText = inferTimeText(text);

  return {
    title,
    timeText,
    location: inferLocation(text),
    people: inferPeople(text),
    note: text,
    status: "active",
    focus: timeText ? "recent" : "confirm",
    source: {
      type: record.sourceConversation?.type === "test"
        ? "private"
        : record.sourceConversation?.type === "self"
          ? "self"
          : "record",
      label: record.sourceConversation?.label || "快记",
      snippet: text,
      recordUid: record.uid,
      conversation: record.sourceConversation,
    },
    confidence: undefined,
    executionType: "user",
  };
}

export function inferArrangementCandidateFromRecord(
  record: RecordItem
): ArrangementDraft | null {
  const text = record.text_content.trim();
  if (!text || text.includes("～～")) return null;

  const hasArrangementSignal =
    /明天|后天|今晚|上午|下午|最近|周[一二三四五六日天]|提醒|记得|带|医院|公司|开会|提交|整理|复盘/.test(
      text
    );

  if (!hasArrangementSignal) return null;

  const draft = arrangementDraftFromRecord(record);
  const confidence = /明天|后天|医院|带|开会|提交/.test(text) ? 0.84 : 0.62;

  return {
    ...draft,
    title: inferArrangementTitle(text) || draft.title,
    status: "active",
    focus: confidence >= 0.78 ? "recent" : "confirm",
    confidence,
    executionType: /整理|写|生成|查/.test(text) ? "aiAssist" : "user",
  };
}

export function inferPrivatePromiseCandidate(
  requestText: string,
  replyRecord: RecordItem,
  requesterName: string
): ArrangementDraft | null {
  const request = requestText.trim();
  const reply = replyRecord.text_content.trim();
  if (!/好|可以|行|没问题|OK|ok/.test(reply)) return null;
  if (!/带|帮|来|拿|买|准备/.test(request)) return null;

  const combinedText = `${request}\n${reply}`;
  const items = extractCarryItems(request);
  const title =
    items.length > 1
      ? `帮${requesterName}带 ${items.join("、")}`
      : inferArrangementTitle(request) || `回应${requesterName}的安排`;

  return {
    title,
    timeText: inferTimeText(request),
    location: inferLocation(request),
    people: ["我", requesterName],
    note: `对方提出：${request}\n我已回应：${reply}`,
    status: "active",
    focus: "today",
    source: {
      type: "private",
      label: `和${requesterName}的私聊`,
      snippet: combinedText,
      recordUid: replyRecord.uid,
      conversation: replyRecord.sourceConversation,
    },
    confidence: 0.82,
    executionType: "user",
  };
}

export function mergeAiRecognitionResultIntoArrangements(
  arrangements: ArrangementItem[],
  result: FunnelResult,
  sourceConversation?: RecordSourceConversation
) {
  const candidateArrangements = result.candidateArrangements.map((candidate, index) =>
    createArrangementFromFunnelCandidate(candidate, result, index, sourceConversation)
  );

  const knownIds = new Set(arrangements.map((arrangement) => arrangement.uid));
  const nextArrangements = [
    ...arrangements,
    ...candidateArrangements.filter((arrangement) => !knownIds.has(arrangement.uid)),
  ];

  return sortArrangements(nextArrangements);
}

function createArrangementFromFunnelCandidate(
  candidate: FunnelArrangementItem,
  result: FunnelResult,
  index: number,
  sourceConversation?: RecordSourceConversation
): ArrangementItem {
  const timestamp = Date.parse(result.generatedAt) || Date.now() + index;
  const primarySource = candidate.sourceRefs[0] ?? result.sourceRefs[0];
  const dedupeSourceKey =
    sourceConversation?.recordUid ?? primarySource?.recordUid ?? `${result.id}-${index}`;

  return {
    uid: `ai-recognition-${dedupeSourceKey}-${candidate.id}`,
    title: candidate.title,
    timeText: candidate.fields.whenText ?? "",
    location: candidate.fields.whereText ?? "",
    people: candidate.fields.who.length > 0 ? candidate.fields.who : ["我"],
    note: [candidate.summary, `Need：${candidate.fields.need}`]
      .filter(Boolean)
      .join("\n\n"),
    status: "active",
    focus: "confirm",
    source: {
      type: mapSourceChannelToArrangementSourceType(primarySource?.channel),
      label: primarySource?.speaker ? `${primarySource.speaker} / AI 识别` : "AI 识别",
      snippet: result.inputText,
      recordUid: primarySource?.recordUid,
      conversation: sourceConversation,
    },
    confidence: candidate.confidence,
    executionType: candidate.executionMode === "aiAuto" ? "aiAssist" : candidate.executionMode,
    createdAt: timestamp,
    updatedAt: timestamp,
  };
}

function mapSourceChannelToArrangementSourceType(channel?: FunnelSourceChannel): ArrangementSourceType {
  if (channel === "self") return "self";
  if (channel === "private") return "private";
  if (channel === "group") return "group";
  if (channel === "note") return "record";
  return "context";
}

function inferTimeText(text: string) {
  if (text.includes("后天")) return "后天";
  if (text.includes("明天")) return "明天";
  if (text.includes("今晚")) return "今晚";
  if (text.includes("上午")) return "上午";
  if (text.includes("下午")) return "下午";
  if (text.includes("最近")) return "最近";
  const weekMatch = text.match(/周[一二三四五六日天]/);
  return weekMatch?.[0] ?? "";
}

function inferLocation(text: string) {
  if (text.includes("医院")) return "医院";
  if (text.includes("公司")) return "公司";
  if (text.includes("学校")) return "学校";
  if (text.includes("家")) return "家";
  if (text.includes("线上")) return "线上";
  return "";
}

function inferPeople(text: string) {
  const people = ["我"];
  if (text.includes("爸爸")) people.push("爸爸");
  if (text.includes("姐姐")) people.push("姐姐");
  if (text.includes("对方") || text.includes("帮我")) people.push("对方");
  return people;
}

function inferArrangementTitle(text: string) {
  if (text.includes("医院")) return "去医院检查身体";
  if (text.includes("早餐")) return "到公司帮对方带早餐";
  if (text.includes("开会")) return "参加会议";
  if (text.includes("提交")) return "提交材料";
  if (text.includes("复盘")) return "做一次复盘";
  if (text.includes("整理")) return "整理相关资料";

  const items = extractCarryItems(text);
  if (items.length > 0) return `帮对方带 ${items.join("、")}`;
  return "";
}

function extractCarryItems(text: string) {
  const items = new Set<string>();
  const compact = text.replace(/\s+/g, "");
  const itemMatches = compact.match(/[A-EＡ-Ｅ]/g) ?? [];
  itemMatches.forEach((item) => items.add(item.toUpperCase()));

  if (text.includes("早餐")) items.add("早餐");
  return Array.from(items);
}
