import type {
  FunnelArrangementGroup,
  FunnelArrangementItem,
  FunnelIgnoredItem,
  FunnelResult,
} from "@/types/funnel";

export type FunnelHomeSetAsideItem =
  | {
      type: "candidate";
      item: FunnelArrangementItem;
    }
  | {
      type: "ignored";
      item: FunnelIgnoredItem;
    };

export type FunnelHomeSections = {
  pendingConfirmation: FunnelArrangementItem[];
  formalArrangements: FunnelArrangementItem[];
  setAside: FunnelHomeSetAsideItem[];
  groupsByPrimaryArrangementId: Record<string, FunnelArrangementGroup[]>;
  riskCount: number;
};

export function buildFunnelHomeSections(result: FunnelResult): FunnelHomeSections {
  return {
    pendingConfirmation: result.candidateArrangements.filter(
      (item) => item.attention !== "quiet"
    ),
    formalArrangements: result.formalArrangements,
    setAside: [
      ...result.candidateArrangements
        .filter((item) => item.attention === "quiet")
        .map((item) => ({ type: "candidate" as const, item })),
      ...result.ignoredItems
        .filter((item) => item.canResurface)
        .map((item) => ({ type: "ignored" as const, item })),
    ],
    groupsByPrimaryArrangementId: groupArrangementGroups(result.arrangementGroups),
    riskCount: result.riskItems.length,
  };
}

function groupArrangementGroups(groups: FunnelArrangementGroup[]) {
  return groups.reduce<Record<string, FunnelArrangementGroup[]>>((acc, group) => {
    acc[group.primaryArrangementId] = acc[group.primaryArrangementId] ?? [];
    acc[group.primaryArrangementId].push(group);
    return acc;
  }, {});
}
