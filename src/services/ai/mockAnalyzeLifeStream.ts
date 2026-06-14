import { runMockArrangementFunnel } from "@/data/funnelRules";
import type { LifeStreamInput } from "@/services/ai/analyzeLifeStream";
import type { FunnelResult } from "@/types/funnel";

export async function mockAnalyzeLifeStream(
  input: LifeStreamInput
): Promise<FunnelResult> {
  return runMockArrangementFunnel(input.text);
}
