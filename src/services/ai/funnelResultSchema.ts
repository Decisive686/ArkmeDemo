import type { FunnelResult } from "@/types/funnel";

type ValidationResult =
  | { valid: true; errors: [] }
  | { valid: false; errors: string[] };

const sourceRefSchema = {
  type: "object",
  additionalProperties: false,
  required: ["id", "channel", "text"],
  properties: {
    id: { type: "string" },
    channel: {
      type: "string",
      enum: ["self", "note", "private", "group", "manual", "system"],
    },
    text: { type: "string" },
    speaker: { type: "string" },
    occurredAtText: { type: "string" },
    recordUid: { type: "string" },
  },
} as const;

const baseItemProperties = {
  id: { type: "string" },
  kind: { type: "string" },
  title: { type: "string" },
  summary: { type: "string" },
  sourceRefs: { type: "array", items: sourceRefSchema },
  confidence: { type: "number" },
  reason: { type: "string" },
} as const;

const memoryItemSchema = {
  type: "object",
  additionalProperties: false,
  required: [
    "id",
    "kind",
    "title",
    "summary",
    "sourceRefs",
    "confidence",
    "reason",
    "memoryType",
  ],
  properties: {
    ...baseItemProperties,
    kind: { type: "string", enum: ["memory"] },
    memoryType: {
      type: "string",
      enum: ["fact", "preference", "relationship", "eventContext"],
    },
  },
} as const;

const emotionItemSchema = {
  type: "object",
  additionalProperties: false,
  required: [
    "id",
    "kind",
    "title",
    "summary",
    "sourceRefs",
    "confidence",
    "reason",
    "emotion",
    "intensity",
  ],
  properties: {
    ...baseItemProperties,
    kind: { type: "string", enum: ["emotion"] },
    emotion: {
      type: "string",
      enum: ["anxiety", "longing", "pressure", "anger", "relief", "mixed"],
    },
    intensity: { type: "string", enum: ["low", "medium", "high"] },
  },
} as const;

const inspirationItemSchema = {
  type: "object",
  additionalProperties: false,
  required: [
    "id",
    "kind",
    "title",
    "summary",
    "sourceRefs",
    "confidence",
    "reason",
    "inspirationType",
  ],
  properties: {
    ...baseItemProperties,
    kind: { type: "string", enum: ["inspiration"] },
    inspirationType: {
      type: "string",
      enum: ["insight", "idea", "principle", "question"],
    },
  },
} as const;

const prerequisiteItemSchema = {
  type: "object",
  additionalProperties: false,
  required: ["id", "title", "sourceRefs"],
  properties: {
    id: { type: "string" },
    title: { type: "string" },
    sourceRefs: { type: "array", items: sourceRefSchema },
  },
} as const;

const arrangementFieldsSchema = {
  type: "object",
  additionalProperties: false,
  required: ["who", "what", "need"],
  properties: {
    who: { type: "array", items: { type: "string" } },
    what: { type: "string" },
    whenText: { type: "string" },
    whereText: { type: "string" },
    why: { type: "string" },
    how: { type: "string" },
    need: { type: "string" },
  },
} as const;

const arrangementItemSchema = {
  type: "object",
  additionalProperties: false,
  required: [
    "id",
    "kind",
    "title",
    "summary",
    "sourceRefs",
    "confidence",
    "reason",
    "lifecycle",
    "status",
    "attention",
    "fields",
    "executionMode",
    "prerequisiteItems",
    "relatedEmotionIds",
  ],
  properties: {
    ...baseItemProperties,
    kind: { type: "string", enum: ["arrangement"] },
    lifecycle: { type: "string", enum: ["candidate", "formal"] },
    status: { type: "string", enum: ["pending", "done", "archived"] },
    attention: { type: "string", enum: ["today", "recent", "later", "quiet"] },
    fields: arrangementFieldsSchema,
    executionMode: { type: "string", enum: ["user", "aiAssist", "aiAuto"] },
    prerequisiteItems: { type: "array", items: prerequisiteItemSchema },
    relatedEmotionIds: { type: "array", items: { type: "string" } },
  },
} as const;

const mergeSuggestionSchema = {
  type: "object",
  additionalProperties: false,
  required: [
    "id",
    "action",
    "title",
    "candidateArrangementIds",
    "sourceRefs",
    "confidence",
    "reason",
  ],
  properties: {
    id: { type: "string" },
    action: {
      type: "string",
      enum: ["mergeCandidates", "appendSourcesToExisting", "mergeIntoExisting"],
    },
    title: { type: "string" },
    targetArrangementId: { type: "string" },
    candidateArrangementIds: { type: "array", items: { type: "string" } },
    sourceRefs: { type: "array", items: sourceRefSchema },
    confidence: { type: "number" },
    reason: { type: "string" },
  },
} as const;

const arrangementGroupSchema = {
  type: "object",
  additionalProperties: false,
  required: [
    "id",
    "title",
    "primaryArrangementId",
    "relatedArrangementIds",
    "prerequisiteItemIds",
    "emotionalContextItemIds",
    "sourceRefs",
    "displayReason",
  ],
  properties: {
    id: { type: "string" },
    title: { type: "string" },
    primaryArrangementId: { type: "string" },
    relatedArrangementIds: { type: "array", items: { type: "string" } },
    prerequisiteItemIds: { type: "array", items: { type: "string" } },
    emotionalContextItemIds: { type: "array", items: { type: "string" } },
    sourceRefs: { type: "array", items: sourceRefSchema },
    displayReason: { type: "string" },
  },
} as const;

const ignoredItemSchema = {
  type: "object",
  additionalProperties: false,
  required: [
    "id",
    "kind",
    "title",
    "summary",
    "sourceRefs",
    "confidence",
    "reason",
    "ignoredReason",
    "canResurface",
  ],
  properties: {
    ...baseItemProperties,
    kind: { type: "string", enum: ["ignored"] },
    ignoredReason: {
      type: "string",
      enum: [
        "notUserRelated",
        "alreadyClosed",
        "tooWeakNeed",
        "pureContext",
        "duplicateAfterMerge",
      ],
    },
    canResurface: { type: "boolean" },
  },
} as const;

const riskItemSchema = {
  type: "object",
  additionalProperties: false,
  required: [
    "id",
    "kind",
    "title",
    "summary",
    "sourceRefs",
    "confidence",
    "reason",
    "riskType",
    "suggestedHandling",
  ],
  properties: {
    ...baseItemProperties,
    kind: { type: "string", enum: ["risk"] },
    riskType: {
      type: "string",
      enum: ["unsafeAction", "aggressiveLanguage", "unclearMetaphor", "privacy"],
    },
    suggestedHandling: {
      type: "string",
      enum: ["doNotCreateArrangement", "askForClarification", "softRecordOnly"],
    },
  },
} as const;

export const funnelResultJsonSchema = {
  type: "object",
  additionalProperties: false,
  required: [
    "id",
    "inputText",
    "generatedAt",
    "sourceRefs",
    "memories",
    "emotions",
    "inspirations",
    "candidateArrangements",
    "formalArrangements",
    "mergeSuggestions",
    "arrangementGroups",
    "ignoredItems",
    "riskItems",
  ],
  properties: {
    id: { type: "string" },
    inputText: { type: "string" },
    generatedAt: { type: "string" },
    sourceRefs: { type: "array", items: sourceRefSchema },
    memories: { type: "array", items: memoryItemSchema },
    emotions: { type: "array", items: emotionItemSchema },
    inspirations: { type: "array", items: inspirationItemSchema },
    candidateArrangements: { type: "array", items: arrangementItemSchema },
    formalArrangements: { type: "array", items: arrangementItemSchema },
    mergeSuggestions: { type: "array", items: mergeSuggestionSchema },
    arrangementGroups: { type: "array", items: arrangementGroupSchema },
    ignoredItems: { type: "array", items: ignoredItemSchema },
    riskItems: { type: "array", items: riskItemSchema },
  },
} as const;

export function validateFunnelResult(value: unknown): ValidationResult {
  const errors: string[] = [];
  if (!isRecord(value)) {
    return { valid: false, errors: ["result is not an object"] };
  }

  assertString(value.id, "id", errors);
  assertString(value.inputText, "inputText", errors);
  assertString(value.generatedAt, "generatedAt", errors);
  assertArray(value.sourceRefs, "sourceRefs", errors, validateSourceRef);
  assertArray(value.memories, "memories", errors, validateMemoryItem);
  assertArray(value.emotions, "emotions", errors, validateEmotionItem);
  assertArray(value.inspirations, "inspirations", errors, validateInspirationItem);
  assertArray(
    value.candidateArrangements,
    "candidateArrangements",
    errors,
    (item, path) => validateArrangementItem(item, path, errors, "candidate")
  );
  assertArray(
    value.formalArrangements,
    "formalArrangements",
    errors,
    (item, path) => validateArrangementItem(item, path, errors, "formal")
  );
  assertArray(value.mergeSuggestions, "mergeSuggestions", errors, validateMergeSuggestion);
  assertArray(value.arrangementGroups, "arrangementGroups", errors, validateArrangementGroup);
  assertArray(value.ignoredItems, "ignoredItems", errors, validateIgnoredItem);
  assertArray(value.riskItems, "riskItems", errors, validateRiskItem);

  if (errors.length > 0) {
    return { valid: false, errors };
  }

  return { valid: true, errors: [] };
}

export function parseFunnelResult(value: unknown): FunnelResult | null {
  const validated = validateFunnelResult(value);
  if (!validated.valid) return null;
  return value as FunnelResult;
}

function validateSourceRef(value: unknown, path: string, errors: string[]) {
  if (!isRecord(value)) {
    errors.push(`${path} is not an object`);
    return;
  }
  assertString(value.id, `${path}.id`, errors);
  assertEnum(
    value.channel,
    `${path}.channel`,
    ["self", "note", "private", "group", "manual", "system"],
    errors
  );
  assertString(value.text, `${path}.text`, errors);
  assertOptionalString(value.speaker, `${path}.speaker`, errors);
  assertOptionalString(value.occurredAtText, `${path}.occurredAtText`, errors);
  assertOptionalString(value.recordUid, `${path}.recordUid`, errors);
}

function validateBaseItem(value: unknown, path: string, errors: string[]) {
  if (!isRecord(value)) {
    errors.push(`${path} is not an object`);
    return false;
  }
  assertString(value.id, `${path}.id`, errors);
  assertString(value.kind, `${path}.kind`, errors);
  assertString(value.title, `${path}.title`, errors);
  assertString(value.summary, `${path}.summary`, errors);
  assertArray(value.sourceRefs, `${path}.sourceRefs`, errors, validateSourceRef);
  assertNumber(value.confidence, `${path}.confidence`, errors);
  assertString(value.reason, `${path}.reason`, errors);
  return true;
}

function validateMemoryItem(value: unknown, path: string, errors: string[]) {
  if (!validateBaseItem(value, path, errors) || !isRecord(value)) return;
  assertEnum(value.kind, `${path}.kind`, ["memory"], errors);
  assertEnum(
    value.memoryType,
    `${path}.memoryType`,
    ["fact", "preference", "relationship", "eventContext"],
    errors
  );
}

function validateEmotionItem(value: unknown, path: string, errors: string[]) {
  if (!validateBaseItem(value, path, errors) || !isRecord(value)) return;
  assertEnum(value.kind, `${path}.kind`, ["emotion"], errors);
  assertEnum(
    value.emotion,
    `${path}.emotion`,
    ["anxiety", "longing", "pressure", "anger", "relief", "mixed"],
    errors
  );
  assertEnum(value.intensity, `${path}.intensity`, ["low", "medium", "high"], errors);
}

function validateInspirationItem(value: unknown, path: string, errors: string[]) {
  if (!validateBaseItem(value, path, errors) || !isRecord(value)) return;
  assertEnum(value.kind, `${path}.kind`, ["inspiration"], errors);
  assertEnum(
    value.inspirationType,
    `${path}.inspirationType`,
    ["insight", "idea", "principle", "question"],
    errors
  );
}

function validateArrangementItem(
  value: unknown,
  path: string,
  errors: string[],
  expectedLifecycle?: "candidate" | "formal"
) {
  if (!validateBaseItem(value, path, errors) || !isRecord(value)) return;
  assertEnum(value.kind, `${path}.kind`, ["arrangement"], errors);
  assertEnum(
    value.lifecycle,
    `${path}.lifecycle`,
    ["candidate", "formal"],
    errors
  );
  if (expectedLifecycle && value.lifecycle !== expectedLifecycle) {
    errors.push(`${path}.lifecycle must be ${expectedLifecycle}`);
  }
  assertEnum(value.status, `${path}.status`, ["pending", "done", "archived"], errors);
  assertEnum(
    value.attention,
    `${path}.attention`,
    ["today", "recent", "later", "quiet"],
    errors
  );
  validateArrangementFields(value.fields, `${path}.fields`, errors);
  assertEnum(
    value.executionMode,
    `${path}.executionMode`,
    ["user", "aiAssist", "aiAuto"],
    errors
  );
  assertArray(value.prerequisiteItems, `${path}.prerequisiteItems`, errors, validatePrerequisite);
  assertArray(value.relatedEmotionIds, `${path}.relatedEmotionIds`, errors, validateStringNode);
}

function validateArrangementFields(value: unknown, path: string, errors: string[]) {
  if (!isRecord(value)) {
    errors.push(`${path} is not an object`);
    return;
  }
  assertArray(value.who, `${path}.who`, errors, validateStringNode);
  assertString(value.what, `${path}.what`, errors);
  assertOptionalString(value.whenText, `${path}.whenText`, errors);
  assertOptionalString(value.whereText, `${path}.whereText`, errors);
  assertOptionalString(value.why, `${path}.why`, errors);
  assertOptionalString(value.how, `${path}.how`, errors);
  assertString(value.need, `${path}.need`, errors);
}

function validatePrerequisite(value: unknown, path: string, errors: string[]) {
  if (!isRecord(value)) {
    errors.push(`${path} is not an object`);
    return;
  }
  assertString(value.id, `${path}.id`, errors);
  assertString(value.title, `${path}.title`, errors);
  assertArray(value.sourceRefs, `${path}.sourceRefs`, errors, validateSourceRef);
}

function validateMergeSuggestion(value: unknown, path: string, errors: string[]) {
  if (!isRecord(value)) {
    errors.push(`${path} is not an object`);
    return;
  }
  assertString(value.id, `${path}.id`, errors);
  assertEnum(
    value.action,
    `${path}.action`,
    ["mergeCandidates", "appendSourcesToExisting", "mergeIntoExisting"],
    errors
  );
  assertString(value.title, `${path}.title`, errors);
  assertOptionalString(value.targetArrangementId, `${path}.targetArrangementId`, errors);
  assertArray(
    value.candidateArrangementIds,
    `${path}.candidateArrangementIds`,
    errors,
    validateStringNode
  );
  assertArray(value.sourceRefs, `${path}.sourceRefs`, errors, validateSourceRef);
  assertNumber(value.confidence, `${path}.confidence`, errors);
  assertString(value.reason, `${path}.reason`, errors);
}

function validateArrangementGroup(value: unknown, path: string, errors: string[]) {
  if (!isRecord(value)) {
    errors.push(`${path} is not an object`);
    return;
  }
  assertString(value.id, `${path}.id`, errors);
  assertString(value.title, `${path}.title`, errors);
  assertString(value.primaryArrangementId, `${path}.primaryArrangementId`, errors);
  assertArray(
    value.relatedArrangementIds,
    `${path}.relatedArrangementIds`,
    errors,
    validateStringNode
  );
  assertArray(
    value.prerequisiteItemIds,
    `${path}.prerequisiteItemIds`,
    errors,
    validateStringNode
  );
  assertArray(
    value.emotionalContextItemIds,
    `${path}.emotionalContextItemIds`,
    errors,
    validateStringNode
  );
  assertArray(value.sourceRefs, `${path}.sourceRefs`, errors, validateSourceRef);
  assertString(value.displayReason, `${path}.displayReason`, errors);
}

function validateIgnoredItem(value: unknown, path: string, errors: string[]) {
  if (!validateBaseItem(value, path, errors) || !isRecord(value)) return;
  assertEnum(value.kind, `${path}.kind`, ["ignored"], errors);
  assertEnum(
    value.ignoredReason,
    `${path}.ignoredReason`,
    [
      "notUserRelated",
      "alreadyClosed",
      "tooWeakNeed",
      "pureContext",
      "duplicateAfterMerge",
    ],
    errors
  );
  assertBoolean(value.canResurface, `${path}.canResurface`, errors);
}

function validateRiskItem(value: unknown, path: string, errors: string[]) {
  if (!validateBaseItem(value, path, errors) || !isRecord(value)) return;
  assertEnum(value.kind, `${path}.kind`, ["risk"], errors);
  assertEnum(
    value.riskType,
    `${path}.riskType`,
    ["unsafeAction", "aggressiveLanguage", "unclearMetaphor", "privacy"],
    errors
  );
  assertEnum(
    value.suggestedHandling,
    `${path}.suggestedHandling`,
    ["doNotCreateArrangement", "askForClarification", "softRecordOnly"],
    errors
  );
}

function validateStringNode(value: unknown, path: string, errors: string[]) {
  assertString(value, path, errors);
}

function assertArray(
  value: unknown,
  path: string,
  errors: string[],
  validator: (value: unknown, path: string, errors: string[]) => void
) {
  if (!Array.isArray(value)) {
    errors.push(`${path} is not an array`);
    return;
  }
  value.forEach((item, index) => validator(item, `${path}[${index}]`, errors));
}

function assertString(value: unknown, path: string, errors: string[]) {
  if (typeof value !== "string") {
    errors.push(`${path} is not a string`);
  }
}

function assertOptionalString(value: unknown, path: string, errors: string[]) {
  if (typeof value === "undefined") return;
  assertString(value, path, errors);
}

function assertNumber(value: unknown, path: string, errors: string[]) {
  if (typeof value !== "number" || !Number.isFinite(value)) {
    errors.push(`${path} is not a finite number`);
  }
}

function assertBoolean(value: unknown, path: string, errors: string[]) {
  if (typeof value !== "boolean") {
    errors.push(`${path} is not a boolean`);
  }
}

function assertEnum(
  value: unknown,
  path: string,
  allowed: string[],
  errors: string[]
) {
  if (typeof value !== "string" || !allowed.includes(value)) {
    errors.push(`${path} is not one of: ${allowed.join(", ")}`);
  }
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return Boolean(value) && typeof value === "object" && !Array.isArray(value);
}
