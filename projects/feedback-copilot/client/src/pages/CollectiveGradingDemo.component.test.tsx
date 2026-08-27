import { fireEvent, render, screen } from "@testing-library/react";
import React from "react";
import { describe, expect, it } from "vitest";
import CollectiveGradingDemo from "./CollectiveGradingDemo";

describe("CollectiveGradingDemo", () => {
  it("uses all fifteen instructor ratings to calculate the subgroup total, certification, rank, and strongest grade", () => {
    render(<CollectiveGradingDemo />);

    expect(screen.getByText("Comparison group")).toBeTruthy();
    expect(screen.getByText("Subgroup to assess")).toBeTruthy();
    expect(screen.getAllByText("Group 1").length).toBeGreaterThan(0);
    expect(screen.getAllByText("Subgroup A").length).toBeGreaterThan(0);
    expect(screen.queryByText("Group window")).toBeNull();
    expect(screen.getByText("Strong collective performance")).toBeTruthy();
    expect(screen.getByText("#2 of 4")).toBeTruthy();
    expect(screen.getAllByText(/59 \/ 75/).length).toBeGreaterThan(0);
    expect(screen.getAllByText("Level 1 Certificate · Achieved").length).toBeGreaterThan(0);

    screen.getAllByRole("button", { name: /: 5$/ }).forEach(button => fireEvent.click(button));
    fireEvent.click(screen.getByRole("button", { name: /collect & calculate/i }));

    expect(screen.getByText("Collective excellence")).toBeTruthy();
    expect(screen.getByText("#1 of 4")).toBeTruthy();
    expect(screen.getAllByText(/75 \/ 75/).length).toBeGreaterThan(0);
    expect(screen.getAllByText("Level 1 Certificate · Distinction").length).toBeGreaterThan(0);
    expect(screen.getAllByText("100%").length).toBeGreaterThan(0);
  });

  it("searches numbered groups and filters rubric criteria without changing the calculated assessment model", () => {
    const view = render(<CollectiveGradingDemo />);

    expect(view.container.textContent).toContain("Certificate title categories");
    expect(view.container.textContent).toContain("Best available title is clear");
    fireEvent.change(view.container.querySelector('[aria-label="Search rubric criteria"]')!, { target: { value: "market" } });
    expect(view.container.textContent).toContain("Understanding of Target Market");
    expect(view.container.textContent).not.toContain("Clarity of Problem Statement");

    fireEvent.change(view.container.querySelector('[aria-label="Search group number"]')!, { target: { value: "1000" } });
    fireEvent.change(view.container.querySelector('select')!, { target: { value: "group-1000" } });
    expect(view.container.textContent).toContain("Group 1000 is a comparison cohort only. This form assesses Subgroup A.");
    expect(view.container.textContent).toContain("#1 of 4");
  });
});
