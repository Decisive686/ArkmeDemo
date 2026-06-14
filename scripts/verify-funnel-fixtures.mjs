import fs from "node:fs";
import path from "node:path";

const fixturePath = path.resolve("src/data/funnelFixtures.json");
const fixtures = JSON.parse(fs.readFileSync(fixturePath, "utf8"));

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
  if (!condition) {
    throw new Error(message);
  }
}

assert(Array.isArray(fixtures), "fixtures must be an array");
assert(fixtures.length >= 5, "at least 5 funnel fixtures are required");

for (const fixture of fixtures) {
  assert(fixture.id, "fixture id is required");
  assert(fixture.inputText, `${fixture.id}: inputText is required`);
  assert(fixture.result, `${fixture.id}: result is required`);

  for (const bucket of buckets) {
    assert(Array.isArray(fixture.result[bucket]), `${fixture.id}: ${bucket} must be an array`);
    if (typeof fixture.expected?.[bucket] === "number") {
      assert(
        fixture.result[bucket].length === fixture.expected[bucket],
        `${fixture.id}: ${bucket} expected ${fixture.expected[bucket]}, got ${fixture.result[bucket].length}`
      );
    }
  }

  for (const item of fixture.result.candidateArrangements) {
    assert(item.lifecycle === "candidate", `${fixture.id}: candidate arrangement lifecycle must be candidate`);
    assert(item.sourceRefs.length > 0, `${fixture.id}: candidate arrangement must keep sourceRefs`);
  }

  for (const item of fixture.result.formalArrangements) {
    assert(item.lifecycle === "formal", `${fixture.id}: formal arrangement lifecycle must be formal`);
    assert(item.sourceRefs.length > 0, `${fixture.id}: formal arrangement must keep sourceRefs`);
  }

  for (const group of fixture.result.arrangementGroups) {
    assert(!("lifecycle" in group), `${fixture.id}: arrangement group must not have lifecycle`);
    assert(!("status" in group), `${fixture.id}: arrangement group must not have status`);
    assert(group.primaryArrangementId, `${fixture.id}: arrangement group needs primaryArrangementId`);
  }

  for (const suggestion of fixture.result.mergeSuggestions) {
    assert(suggestion.sourceRefs.length > 1, `${fixture.id}: merge suggestion must keep multiple sourceRefs`);
    assert(suggestion.candidateArrangementIds.length > 0, `${fixture.id}: merge suggestion needs arrangement ids`);
  }
}

const hospital = fixtures.find((fixture) => fixture.id === "hospital-multi-source");
assert(hospital, "hospital-multi-source fixture is required");
assert(hospital.result.candidateArrangements.length === 1, "hospital fixture should produce one candidate arrangement");
assert(hospital.result.mergeSuggestions.length === 1, "hospital fixture should produce one merge suggestion");
assert(
  hospital.result.candidateArrangements[0].sourceRefs.length >= 4,
  "hospital arrangement should preserve multiple sourceRefs"
);

const risk = fixtures.find((fixture) => fixture.id === "hangzhou-aggressive-language");
assert(risk, "hangzhou-aggressive-language fixture is required");
assert(risk.result.riskItems.length === 1, "risk fixture should produce a risk item");
assert(
  risk.result.candidateArrangements.length === 0 && risk.result.formalArrangements.length === 0,
  "risk fixture must not produce arrangements"
);

const inspiration = fixtures.find((fixture) => fixture.id === "call-exposes-emotion");
assert(inspiration, "call-exposes-emotion fixture is required");
assert(inspiration.result.inspirations.length === 1, "inspiration fixture should preserve one inspiration");
assert(
  inspiration.result.candidateArrangements.length === 0 && inspiration.result.formalArrangements.length === 0,
  "inspiration fixture must not produce arrangements"
);

console.log(`funnel fixture check passed: ${fixtures.length} scenarios`);
