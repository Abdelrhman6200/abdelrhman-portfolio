/*
 * Every demo route is linked from the home page, so each one must at minimum
 * mount without throwing and offer a way back into the site.
 */
import { afterEach, describe, expect, it } from "vitest";
import { cleanup, render, screen } from "@testing-library/react";
import { TooltipProvider } from "@/components/ui/tooltip";
import { CGFoundryDemo, ExcelValidationDemo, QuestionnaireDemo, SessionLinksDemo } from "./DemoPages";

afterEach(cleanup);

const demos = [
  ["CG Foundry", CGFoundryDemo],
  ["Questionnaire", QuestionnaireDemo],
  ["Session links", SessionLinksDemo],
  ["Excel validation", ExcelValidationDemo],
] as const;

describe.each(demos)("%s demo", (_name, Demo) => {
  it("mounts and offers a route back to the case files", () => {
    render(
      <TooltipProvider>
        <Demo />
      </TooltipProvider>
    );
    const back = screen.getByRole("link", { name: /back to projects/i });
    expect(back.getAttribute("href")).toBe("/#case-files");
  });
});
