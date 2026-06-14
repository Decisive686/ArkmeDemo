import type { ArrangementApiSettings } from "@/types/arrangement";

export type AiMode = "mock" | "openai";

export type AnalyzeLifeStreamConfig = {
  mode: AiMode;
  provider: string;
  baseUrl: string;
  model: string;
  apiKey: string;
  aiEnabled: boolean;
  autoCreate: boolean;
  timeoutMs: number;
};

export const defaultAnalyzeLifeStreamConfig: AnalyzeLifeStreamConfig = {
  mode: "mock",
  provider: "OpenAI compatible",
  baseUrl: "https://api.openai.com/v1",
  model: "gpt-4.1-mini",
  apiKey: "",
  aiEnabled: true,
  autoCreate: false,
  timeoutMs: 20000,
};

export function resolveAnalyzeLifeStreamConfig(
  settings?: Partial<ArrangementApiSettings>
): AnalyzeLifeStreamConfig {
  return {
    mode: settings?.mode === "openai" ? "openai" : defaultAnalyzeLifeStreamConfig.mode,
    provider: settings?.provider?.trim() || defaultAnalyzeLifeStreamConfig.provider,
    baseUrl: settings?.baseUrl?.trim() || defaultAnalyzeLifeStreamConfig.baseUrl,
    model: settings?.model?.trim() || defaultAnalyzeLifeStreamConfig.model,
    apiKey: settings?.apiKey?.trim() || defaultAnalyzeLifeStreamConfig.apiKey,
    aiEnabled:
      typeof settings?.aiEnabled === "boolean"
        ? settings.aiEnabled
        : defaultAnalyzeLifeStreamConfig.aiEnabled,
    autoCreate:
      typeof settings?.autoCreate === "boolean"
        ? settings.autoCreate
        : defaultAnalyzeLifeStreamConfig.autoCreate,
    timeoutMs: defaultAnalyzeLifeStreamConfig.timeoutMs,
  };
}
