export type FunnelSourceChannel =
  | "self"
  | "note"
  | "private"
  | "group"
  | "manual"
  | "system";

export type FunnelItemKind =
  | "memory"
  | "emotion"
  | "inspiration"
  | "arrangement"
  | "ignored"
  | "risk";

export type ArrangementLifecycle = "candidate" | "formal";

export type ArrangementStatus = "pending" | "done" | "archived";

export type ArrangementAttentionLevel = "today" | "recent" | "later" | "quiet";

export type ArrangementExecutionMode = "user" | "aiAssist" | "aiAuto";

export type FunnelSourceRef = {
  id: string;
  channel: FunnelSourceChannel;
  text: string;
  speaker?: string;
  occurredAtText?: string;
  recordUid?: string;
};

export type FunnelBaseItem = {
  id: string;
  kind: FunnelItemKind;
  title: string;
  summary: string;
  sourceRefs: FunnelSourceRef[];
  confidence: number;
  reason: string;
};

export type FunnelMemoryItem = FunnelBaseItem & {
  kind: "memory";
  memoryType: "fact" | "preference" | "relationship" | "eventContext";
};

export type FunnelEmotionItem = FunnelBaseItem & {
  kind: "emotion";
  emotion: "anxiety" | "longing" | "pressure" | "anger" | "relief" | "mixed";
  intensity: "low" | "medium" | "high";
};

export type FunnelInspirationItem = FunnelBaseItem & {
  kind: "inspiration";
  inspirationType: "insight" | "idea" | "principle" | "question";
};

export type FunnelArrangementFields = {
  who: string[];
  what: string;
  whenText?: string;
  whereText?: string;
  why?: string;
  how?: string;
  need: string;
};

export type FunnelPrerequisiteItem = {
  id: string;
  title: string;
  sourceRefs: FunnelSourceRef[];
};

export type FunnelArrangementItem = FunnelBaseItem & {
  kind: "arrangement";
  lifecycle: ArrangementLifecycle;
  status: ArrangementStatus;
  attention: ArrangementAttentionLevel;
  fields: FunnelArrangementFields;
  executionMode: ArrangementExecutionMode;
  prerequisiteItems: FunnelPrerequisiteItem[];
  relatedEmotionIds: string[];
};

export type FunnelMergeSuggestion = {
  id: string;
  action: "mergeCandidates" | "appendSourcesToExisting" | "mergeIntoExisting";
  title: string;
  targetArrangementId?: string;
  candidateArrangementIds: string[];
  sourceRefs: FunnelSourceRef[];
  confidence: number;
  reason: string;
};

export type FunnelArrangementGroup = {
  id: string;
  title: string;
  primaryArrangementId: string;
  relatedArrangementIds: string[];
  prerequisiteItemIds: string[];
  emotionalContextItemIds: string[];
  sourceRefs: FunnelSourceRef[];
  displayReason: string;
};

export type FunnelIgnoredItem = FunnelBaseItem & {
  kind: "ignored";
  ignoredReason:
    | "notUserRelated"
    | "alreadyClosed"
    | "tooWeakNeed"
    | "pureContext"
    | "duplicateAfterMerge";
  canResurface: boolean;
};

export type FunnelRiskItem = FunnelBaseItem & {
  kind: "risk";
  riskType: "unsafeAction" | "aggressiveLanguage" | "unclearMetaphor" | "privacy";
  suggestedHandling: "doNotCreateArrangement" | "askForClarification" | "softRecordOnly";
};

export type FunnelResult = {
  id: string;
  inputText: string;
  generatedAt: string;
  sourceRefs: FunnelSourceRef[];
  memories: FunnelMemoryItem[];
  emotions: FunnelEmotionItem[];
  inspirations: FunnelInspirationItem[];
  candidateArrangements: FunnelArrangementItem[];
  formalArrangements: FunnelArrangementItem[];
  mergeSuggestions: FunnelMergeSuggestion[];
  arrangementGroups: FunnelArrangementGroup[];
  ignoredItems: FunnelIgnoredItem[];
  riskItems: FunnelRiskItem[];
};

export type FunnelFixtureExpectation = {
  memories?: number;
  emotions?: number;
  inspirations?: number;
  candidateArrangements?: number;
  formalArrangements?: number;
  mergeSuggestions?: number;
  arrangementGroups?: number;
  ignoredItems?: number;
  riskItems?: number;
};

export type FunnelFixture = {
  id: string;
  title: string;
  inputText: string;
  expected: FunnelFixtureExpectation;
  result: FunnelResult;
};
