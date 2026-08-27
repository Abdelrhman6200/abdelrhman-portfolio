/*
 * The CV is generated from the content module, which is the whole point of it
 * — so what these pin is the generation, not the wording. If a system is added
 * to the site and never reaches the CV, or an evidence tier is dropped on the
 * way, that is the failure mode worth catching: a CV is exactly where an
 * unlabelled claim would do the most damage.
 */
import { afterEach, describe, expect, it } from "vitest";
import { cleanup, render, screen } from "@testing-library/react";
import Curriculum from "./Curriculum";
import {
  builtSystems,
  contact,
  evidenceLabels,
  experiences,
  featuredProjects,
  projectArchive,
  services,
} from "@/content/portfolio";

function text(): string {
  return document.body.textContent ?? "";
}

afterEach(cleanup);

describe("Curriculum", () => {
  it("carries every shipped application with its evidence tier", () => {
    render(<Curriculum />);
    for (const system of builtSystems) {
      expect(text()).toContain(system.title);
    }
    // The tier label appears once per shipped system.
    const tiers = screen.getAllByText(evidenceLabels.code.label);
    expect(tiers.length).toBe(builtSystems.length);
  });

  it("carries each shipped system's verifiable claims verbatim", () => {
    render(<Curriculum />);
    for (const system of builtSystems) {
      for (const claim of system.verifiable ?? []) {
        expect(text()).toContain(claim);
      }
    }
  });

  it("lists every operational system and every record entry", () => {
    render(<Curriculum />);
    for (const project of [...featuredProjects, ...projectArchive]) {
      expect(text()).toContain(project.title);
    }
  });

  it("lists every role, and never invents a date for one", () => {
    render(<Curriculum />);
    for (const role of experiences) {
      expect(text()).toContain(role.name);
      expect(text()).toContain(role.role);
    }
    // Periods are a blank seam until the real dates are supplied — a guessed
    // date on a CV is worse than no date, so nothing may render one.
    const invented = experiences.filter((role) => role.period === "");
    expect(invented).toHaveLength(experiences.length);
    expect(document.querySelectorAll(".cv-period")).toHaveLength(0);
  });

  it("names every capability area", () => {
    render(<Curriculum />);
    for (const service of services) {
      expect(text()).toContain(service.label);
    }
  });

  it("gives the reader a way to reach him", () => {
    render(<Curriculum />);
    const mail = screen.getByRole("link", { name: contact.email });
    expect(mail.getAttribute("href")).toBe(`mailto:${contact.email}`);
    expect(screen.getByRole("link", { name: contact.githubHandle }).getAttribute("href")).toBe(contact.github);
    expect(text()).toContain(contact.location);
  });

  it("is one document with one top-level heading", () => {
    render(<Curriculum />);
    const headings = screen.getAllByRole("heading", { level: 1 });
    expect(headings).toHaveLength(1);
    expect(headings[0].textContent).toBe("Abdelrhman Shoman");
  });

  it("offers a print control and a way back to the site", () => {
    render(<Curriculum />);
    expect(screen.getByRole("button", { name: /print/i })).toBeTruthy();
    expect(screen.getByRole("link", { name: /back to the site/i })).toBeTruthy();
  });

  it("keeps the site's skip link, since it is a real page", () => {
    render(<Curriculum />);
    const skip = screen.getByRole("link", { name: /skip to content/i });
    expect(skip.getAttribute("href")).toBe("#cv-main");
    expect(document.getElementById("cv-main")).not.toBeNull();
  });
});
