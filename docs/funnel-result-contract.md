# FunnelResult 输出契约

`FunnelResult` 是安排信息漏斗的稳定输出结构。它承接一段生活流输入经过四向分流、安排识别、多来源合并和风险判断之后的结果。

类型定义位于：

- `src/types/funnel.ts`

mock 规则和样例位于：

- `src/data/funnelRules.ts`
- `src/data/funnelFixtures.json`
- `src/data/funnelFixtures.ts`
- `src/data/funnelValidationCases.json`
- `src/data/funnelHomeSections.ts`

## 顶层结构

```ts
type FunnelResult = {
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
```

约束：

- `candidateArrangements` 中的安排必须是 `lifecycle: "candidate"`。
- `formalArrangements` 中的安排必须是 `lifecycle: "formal"`。
- `arrangementGroups` 不允许拥有 `lifecycle` 或 `status`，它只负责聚合展示。
- `mergeSuggestions` 必须保留多个 `sourceRefs`，用于解释为什么应该合并。
- 风险或攻击表达进入 `riskItems`，不能因为有时间、地点、动作就生成安排。

## 首页消费方式

首页不直接消费全部底层字段，而是先通过 `buildFunnelHomeSections(result)` 转成页面友好的结构：

- `pendingConfirmation`：来自 `candidateArrangements`，用于“AI 识别 / 待确认”。
- `formalArrangements`：来自 `formalArrangements`，用于正式安排区。
- `setAside`：来自低关注候选安排和可回收的 ignored items，用于“放一边”。
- `groupsByPrimaryArrangementId`：用于在卡片详情或二级视图里展示安排组。
- `riskCount`：用于必要时显示安全/风险提示数量，不进入安排列表。

安排组不会成为首页一级栏目；它只在详情、上下文解释或整理视图中辅助展示。

## 当前 mock 边界

当前实现不接真实 AI：

- `runMockArrangementFunnel(inputText)` 会优先返回 fixtures 中的精确样例。
- `src/data/funnelValidationCases.json` 固化了 6 条验收样例，包含语义切片、四向分流和最终 FunnelResult。
- 未命中样例时，只用简单关键词规则做保守分流。
- 时间、人物、地点、Need、意愿强度、隐喻、安全判断都不是模型推理，只是 mock 契约占位。

后续接入真实 AI 时，应保持 `FunnelResult` 结构稳定，只替换生成逻辑。
