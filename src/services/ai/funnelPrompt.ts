import type { LifeStreamInput } from "@/services/ai/analyzeLifeStream";

export const funnelSystemPrompt = `
你不是待办提取器。
你是生活流信息分流器。

你的任务是把一段生活流文本分析为 FunnelResult JSON。
必须严格遵守以下规则：
1. 先把输入切分为语义片段。
2. 再分流为记忆、情绪、灵感、安排可能。
3. 只有安排可能才可以进入 candidateArrangements。
4. 情绪表达不能直接变成安排。
5. 灵感和愿望不能直接变成正式安排。
6. 玩笑、隐喻、暴力表达不能直接变成安排。
7. AI 识别结果默认需要用户确认。
8. 多来源指向同一件事时，生成 mergeSuggestions，不要重复创建多条正式安排。
9. arrangementGroups 只是展示聚合结构，不是第三种安排生命周期。
10. formalArrangements 在当前 V0 默认应为空数组，除非输入本身已经明确提供正式安排结果；不要主动创建正式安排。
11. 所有顶层字段都必须存在；没有内容时返回空数组，不要省略字段。
12. 不要输出解释性长文，只输出符合 schema 的 JSON。
`.trim();

export function buildFunnelUserPrompt(input: LifeStreamInput) {
  return JSON.stringify(
    {
      task: "analyze_life_stream",
      input: {
        text: input.text,
        channel: input.channel ?? "note",
        speaker: input.speaker ?? "我",
        sourceLabel: input.sourceLabel ?? "",
        occurredAt: input.occurredAt ?? "",
        recordUid: input.recordUid ?? "",
        conversationId: input.conversationId ?? "",
      },
      requirements: {
        returnOnlyJson: true,
        formalArrangementsMustDefaultToEmptyArray: true,
        candidateArrangementsNeedUserConfirmation: true,
      },
    },
    null,
    2
  );
}
