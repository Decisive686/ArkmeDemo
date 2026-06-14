import { funnelFixtures } from "@/data/funnelFixtures";
import rawValidationCases from "@/data/funnelValidationCases.json";
import type {
  FunnelArrangementItem,
  FunnelResult,
  FunnelSourceRef,
} from "@/types/funnel";

const emptyGeneratedAt = "2026-06-13T04:30:00.000Z";
const funnelValidationCases = rawValidationCases as Array<{
  inputText: string;
  result: FunnelResult;
}>;

export function runMockArrangementFunnel(inputText: string): FunnelResult {
  const validationCase = funnelValidationCases.find((item) =>
    isSameInput(item.inputText, inputText)
  );

  if (validationCase) {
    return cloneResult(validationCase.result);
  }

  const exactFixture = funnelFixtures.find((fixture) =>
    isSameInput(fixture.inputText, inputText)
  );

  if (exactFixture) {
    return cloneResult(exactFixture.result);
  }

  const sourceRef: FunnelSourceRef = {
    id: "src-mock-fallback",
    channel: "note",
    speaker: "我",
    text: inputText,
  };

  if (hasRiskSignal(inputText)) {
    return {
      ...createEmptyResult(inputText, sourceRef),
      emotions: [
        {
          id: "emo-mock-risk",
          kind: "emotion",
          title: "可能包含强烈情绪",
          summary: "规则 mock 识别到攻击或高风险表达。",
          sourceRefs: [sourceRef],
          confidence: 0.62,
          reason: "当前仍是规则 mock，只做保守分流。",
          emotion: "anger",
          intensity: "medium",
        },
      ],
      riskItems: [
        {
          id: "risk-mock-unsafe",
          kind: "risk",
          title: "风险表达不转安排",
          summary: "该输入包含风险或攻击性信号，不能直接生成安排。",
          sourceRefs: [sourceRef],
          confidence: 0.68,
          reason: "语气/安全判断优先于时间地点动作抽取。",
          riskType: "aggressiveLanguage",
          suggestedHandling: "doNotCreateArrangement",
        },
      ],
    };
  }

  if (hasArrangementSignal(inputText)) {
    const arrangement = createMockCandidateArrangement(inputText, sourceRef);
    return {
      ...createEmptyResult(inputText, sourceRef),
      candidateArrangements: [arrangement],
    };
  }

  if (hasInspirationSignal(inputText)) {
    return {
      ...createEmptyResult(inputText, sourceRef),
      inspirations: [
        {
          id: "ins-mock-general",
          kind: "inspiration",
          title: inputText.slice(0, 24) || "未命名灵感",
          summary: "规则 mock 将该输入保留为灵感。",
          sourceRefs: [sourceRef],
          confidence: 0.58,
          reason: "没有明显未来执行信号，更像观点或判断。",
          inspirationType: "insight",
        },
      ],
    };
  }

  return {
    ...createEmptyResult(inputText, sourceRef),
    ignoredItems: [
      {
        id: "ignored-mock-low-need",
        kind: "ignored",
        title: inputText.slice(0, 24) || "低承接价值内容",
        summary: "规则 mock 未识别到足够的安排、记忆、情绪或灵感价值。",
        sourceRefs: [sourceRef],
        confidence: 0.45,
        reason: "当前未接真实 AI，低置信内容先不处理。",
        ignoredReason: "tooWeakNeed",
        canResurface: true,
      },
    ],
  };
}

function createEmptyResult(inputText: string, sourceRef: FunnelSourceRef): FunnelResult {
  return {
    id: "funnel-mock-fallback",
    inputText,
    generatedAt: emptyGeneratedAt,
    sourceRefs: [sourceRef],
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

function createMockCandidateArrangement(
  inputText: string,
  sourceRef: FunnelSourceRef
): FunnelArrangementItem {
  return {
    id: "arr-mock-candidate",
    kind: "arrangement",
    title: inferTitle(inputText),
    summary: "规则 mock 识别到未来事项，先放入候选安排。",
    sourceRefs: [sourceRef],
    confidence: 0.56,
    reason: "包含未来时间或提醒/准备信号，但未接真实 AI，默认候选。",
    lifecycle: "candidate",
    status: "pending",
    attention: "recent",
    fields: {
      who: ["我"],
      what: inferTitle(inputText),
      whenText: inferWhenText(inputText),
      need: "等待用户确认是否值得承接",
    },
    executionMode: "user",
    prerequisiteItems: [],
    relatedEmotionIds: [],
  };
}

function cloneResult(result: FunnelResult): FunnelResult {
  return JSON.parse(JSON.stringify(result)) as FunnelResult;
}

function normalizeText(value: string) {
  return value.replace(/\s+/g, "").replace(/[，。！？：,.!?:]/g, "");
}

function isSameInput(left: string, right: string) {
  const normalizedLeft = normalizeText(left).replace(/就/g, "");
  const normalizedRight = normalizeText(right).replace(/就/g, "");
  return normalizedLeft === normalizedRight;
}

function hasArrangementSignal(value: string) {
  return /明天|后天|今晚|周[一二三四五六日天]|提醒|记得|准备|带|去|复诊|开会/.test(
    value
  );
}

function hasRiskSignal(value: string) {
  return /揍|打死|杀|报复|弄死|威胁/.test(value);
}

function hasInspirationSignal(value: string) {
  return /是|意味着|本质|洞察|想法|原则|判断/.test(value);
}

function inferWhenText(value: string) {
  const match = value.match(/明天|后天|今晚|周[一二三四五六日天](?:上午|下午|晚上)?/);
  return match?.[0];
}

function inferTitle(value: string) {
  if (value.includes("医院")) return "去医院";
  if (value.includes("牙科")) return "去牙科";
  if (value.includes("开会")) return "参加会议";
  return value.slice(0, 24) || "未命名候选安排";
}
