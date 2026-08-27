import { describe, expect, it } from "vitest";
import { assessmentsForGroup, initialNumberedAssessments, numberedGroups } from "./numberedGroupDemo";

describe("numbered group demo model", () => {
  it("provides groups numbered 1 through 1000", () => {
    expect(numberedGroups).toHaveLength(1000);
    expect(numberedGroups[0]).toMatchObject({ id: "group-1", number: 1, name: "Group 1" });
    expect(numberedGroups[999]).toMatchObject({ id: "group-1000", number: 1000, name: "Group 1000" });
  });

  it("gives every numbered group exactly four A–D subgroups and supplies default assessment records", () => {
    const group = numberedGroups[999]!;
    expect(group.subgroups.map(subgroup => subgroup.code)).toEqual(["A", "B", "C", "D"]);
    expect(assessmentsForGroup(group, initialNumberedAssessments)).toEqual([
      { subgroupId: "group-1000-a", scores: expect.any(Array) },
      { subgroupId: "group-1000-b", scores: expect.any(Array) },
      { subgroupId: "group-1000-c", scores: expect.any(Array) },
      { subgroupId: "group-1000-d", scores: expect.any(Array) },
    ]);
  });
});
