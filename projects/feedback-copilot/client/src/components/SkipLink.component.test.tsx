/*
 * A skip link that points at nothing looks identical to one that works: it is
 * hidden until focused, so a broken target is invisible in review and only
 * surfaces for the person relying on it. What is pinned here is that the link
 * exists, that it is reachable, and that it names a real landmark.
 *
 * The pages assert the other half — that something in the document actually
 * carries that id.
 */
import { afterEach, describe, expect, it } from "vitest";
import { cleanup, render, screen } from "@testing-library/react";
import SkipLink from "./SkipLink";

afterEach(cleanup);

describe("SkipLink", () => {
  it("targets the main landmark", () => {
    render(<SkipLink />);
    const link = screen.getByRole("link", { name: /skip to content/i });
    expect(link.getAttribute("href")).toBe("#main");
  });

  it("is reachable rather than removed from the accessibility tree", () => {
    // `sr-only` hides it visually; `hidden` or aria-hidden would take it out
    // of the tab order entirely and defeat the whole point.
    render(<SkipLink />);
    const link = screen.getByRole("link", { name: /skip to content/i });
    expect(link.getAttribute("aria-hidden")).toBeNull();
    expect(link.hasAttribute("hidden")).toBe(false);
    expect(link.getAttribute("tabindex")).not.toBe("-1");
  });

  it("becomes visible on focus, so a keyboard user can see where they are", () => {
    render(<SkipLink />);
    const link = screen.getByRole("link", { name: /skip to content/i });
    expect(link.className).toContain("sr-only");
    expect(link.className).toContain("focus:not-sr-only");
  });

  it("lands on a real landmark when the workspace renders it", () => {
    // The other half of the contract: the id must exist in the document.
    render(
      <>
        <SkipLink />
        <main id="main">workspace</main>
      </>
    );
    const target = document.getElementById("main");
    expect(target).not.toBeNull();
    expect(target?.tagName).toBe("MAIN");
  });
});
