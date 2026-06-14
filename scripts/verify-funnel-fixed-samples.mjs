import fs from "node:fs";
import path from "node:path";

const casesPath = path.resolve("src/data/funnelValidationCases.json");
const cases = JSON.parse(fs.readFileSync(casesPath, "utf8"));

const buckets = [
  "memories",
  "emotions",
  "inspirations",
  "candidateArrangements",
  "formalArrangements",
  "mergeSuggestions",
  "arrangementGroups",
  "ignoredItems",
  "riskItems",
];

function assert(condition, message) {
  if (!condition) throw new Error(message);
}

assert(Array.isArray(cases), "validation cases must be an array");
assert(cases.length === 6, `expected 6 validation cases, got ${cases.length}`);

for (const item of cases) {
  assert(item.id, "case id is required");
  assert(item.inputText, `${item.id}: inputText is required`);
  assert(Array.isArray(item.semanticSlices), `${item.id}: semanticSlices must be an array`);
  assert(item.semanticSlices.length > 0, `${item.id}: semanticSlices cannot be empty`);
  assert(item.routing, `${item.id}: routing is required`);
  assert(item.result, `${item.id}: result is required`);

  for (const bucket of buckets) {
    assert(Array.isArray(item.result[bucket]), `${item.id}: result.${bucket} must be an array`);
    if (typeof item.expected?.[bucket] === "number") {
      assert(
        item.result[bucket].length === item.expected[bucket],
        `${item.id}: ${bucket} expected ${item.expected[bucket]}, got ${item.result[bucket].length}`
      );
    }
  }

  for (const arrangement of item.result.candidateArrangements) {
    assert(arrangement.lifecycle === "candidate", `${item.id}: candidate lifecycle must be candidate`);
    assert(arrangement.sourceRefs.length > 0, `${item.id}: candidate must preserve sourceRefs`);
  }

  for (const arrangement of item.result.formalArrangements) {
    assert(arrangement.lifecycle === "formal", `${item.id}: formal lifecycle must be formal`);
    assert(arrangement.sourceRefs.length > 0, `${item.id}: formal must preserve sourceRefs`);
  }

  for (const group of item.result.arrangementGroups) {
    assert(!("lifecycle" in group), `${item.id}: group must not have lifecycle`);
    assert(!("status" in group), `${item.id}: group must not have status`);
  }
}

const byId = new Map(cases.map((item) => [item.id, item]));

const sample1 = byId.get("sample-1-harbin-strong-intent");
assert(sample1.result.emotions.length === 1, "sample 1 should enter emotions");
assert(sample1.result.candidateArrangements.length === 1, "sample 1 should enter candidate arrangements");
assert(sample1.result.formalArrangements.length === 0, "sample 1 must not enter formal arrangements");

const sample2 = byId.get("sample-2-hangzhou-risk");
assert(sample2.result.formalArrangements.length === 0, "sample 2 must not enter formal arrangements");
assert(sample2.result.candidateArrangements.length === 0, "sample 2 must not keep unsafe action as candidate");
assert(sample2.result.riskItems.length === 1, "sample 2 should enter risk items");

const sample3 = byId.get("sample-3-math-class-prep");
const sample3Arrangement = sample3.result.candidateArrangements[0];
assert(sample3Arrangement.title.includes("数学课"), "sample 3 should recognize math class");
assert(
  sample3Arrangement.prerequisiteItems.some((item) => item.title.includes("课件")),
  "sample 3 should recognize courseware prerequisite"
);
assert(
  sample3Arrangement.prerequisiteItems.some((item) => item.title.includes("电动车")),
  "sample 3 should recognize e-bike charge prerequisite"
);
assert(sample3.result.arrangementGroups.length === 1, "sample 3 should create arrangement group");

const sample4 = byId.get("sample-4-call-insight");
assert(sample4.result.inspirations.length === 1, "sample 4 should enter inspirations");
assert(sample4.result.candidateArrangements.length === 0, "sample 4 must not enter candidate arrangements");
assert(sample4.result.formalArrangements.length === 0, "sample 4 must not enter formal arrangements");

const sample5 = byId.get("sample-5-hospital-merge");
assert(sample5.result.candidateArrangements.length === 1, "sample 5 should produce one merged arrangement");
assert(
  sample5.result.candidateArrangements[0].sourceRefs.length === 4,
  "sample 5 should preserve four sourceRefs"
);
assert(sample5.result.mergeSuggestions.length === 1, "sample 5 should include merge suggestion");

const sample6 = byId.get("sample-6-restaurant-memory-weak-candidate");
assert(sample6.result.memories.length === 2, "sample 6 should enter memories");
assert(sample6.result.emotions.length === 1, "sample 6 should enter emotions");
assert(sample6.result.formalArrangements.length === 0, "sample 6 must not enter formal arrangements");
assert(sample6.result.candidateArrangements.length === 1, "sample 6 should keep weak candidate");
assert(
  sample6.result.candidateArrangements[0].attention === "quiet",
  "sample 6 weak candidate should be quiet"
);

console.log(`fixed funnel sample check passed: ${cases.length} cases`);
