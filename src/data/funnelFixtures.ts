import rawFixtures from "@/data/funnelFixtures.json";
import type { FunnelFixture, FunnelResult } from "@/types/funnel";

export const funnelFixtures = rawFixtures as FunnelFixture[];

export const funnelResultSamples: FunnelResult[] = funnelFixtures.map(
  (fixture) => fixture.result
);

export function getFunnelFixtureById(id: string) {
  return funnelFixtures.find((fixture) => fixture.id === id) ?? null;
}
