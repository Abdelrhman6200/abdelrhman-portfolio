/*
 * Test helpers.
 *
 * Pages read theme state through `useTheme`, which deliberately throws outside
 * a provider — a missing provider is a bug, not something to paper over. So
 * tests mount the same providers `App` does, rather than the bare component.
 */
import type { ReactElement } from "react";
import { render, type RenderOptions } from "@testing-library/react";
import { ThemeProvider } from "@/contexts/ThemeContext";

function AppProviders({ children }: { children: React.ReactNode }) {
  return (
    <ThemeProvider defaultTheme="system" switchable>
      {children}
    </ThemeProvider>
  );
}

/** `render`, wrapped in the providers the real app mounts. */
export function renderWithProviders(ui: ReactElement, options?: Omit<RenderOptions, "wrapper">) {
  return render(ui, { wrapper: AppProviders, ...options });
}

export * from "@testing-library/react";
export { renderWithProviders as render };
