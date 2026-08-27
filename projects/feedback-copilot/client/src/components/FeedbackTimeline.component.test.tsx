/*
 * The timeline is the first UI over the persisted transition log, so its
 * rendering contract is pinned with fixtures — no tRPC involved.
 */
import { afterEach, describe, expect, it } from "vitest";
import { cleanup, render, screen } from "@testing-library/react";
import React from "react";
import FeedbackTimeline from "./FeedbackTimeline";
import type { FeedbackEvent } from "../../../drizzle/schema";

afterEach(cleanup);

const event = (overrides: Partial<FeedbackEvent>): FeedbackEvent => ({
  id: 1,
  feedbackId: 7,
  actorId: 14,
  actorRole: "teacher",
  action: "created draft",
  comment: null,
  createdAt: new Date("2026-08-27T10:00:00Z"),
  ...overrides,
});

describe("FeedbackTimeline", () => {
  it("renders every event with its actor and action", () => {
    render(
      <FeedbackTimeline
        events={[
          event({ id: 1, action: "created draft" }),
          event({ id: 2, action: "submitted for review" }),
          event({ id: 3, actorRole: "coordinator", action: "approved" }),
        ]}
      />
    );

    const list = screen.getByRole("list", { name: /transition history/i });
    expect(list.querySelectorAll("li")).toHaveLength(3);
    expect(screen.getByText("approved")).toBeDefined();
    expect(screen.getAllByText("teacher")).toHaveLength(2);
    expect(screen.getByText("coordinator")).toBeDefined();
  });

  it("shows the coordinator's comment when one was attached", () => {
    render(
      <FeedbackTimeline
        events={[event({ actorRole: "coordinator", action: "returned to draft", comment: "Cite the session." })]}
      />
    );
    expect(screen.getByText(/Cite the session\./)).toBeDefined();
  });

  it("renders machine-readable timestamps", () => {
    const { container } = render(<FeedbackTimeline events={[event({})]} />);
    expect(container.querySelector("time")?.getAttribute("dateTime")).toBe("2026-08-27T10:00:00.000Z");
  });

  it("explains itself when the log is empty rather than rendering nothing", () => {
    render(<FeedbackTimeline events={[]} />);
    expect(screen.getByText(/No transitions recorded yet/)).toBeDefined();
  });
});
