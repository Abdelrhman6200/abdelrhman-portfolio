import NotFound from "@/pages/NotFound";
import { Route, Router as WouterRouter, Switch } from "wouter";
import CommandPalette from "./components/CommandPalette";
import ErrorBoundary from "./components/ErrorBoundary";
import RouteAnnouncer from "./components/RouteAnnouncer";
import { ThemeProvider } from "./contexts/ThemeContext";
import ReferenceHome from "@/pages/ReferenceHome";

import DemoPage, { PageLoading } from "@/pages/DemoPage";
import { Suspense, lazy } from "react";

const SystemCaseFile = lazy(() => import("@/pages/SystemCaseFile"));
// The CV is its own document with its own stylesheet — kept out of the home
// page bundle, since most visitors never open it.
const Curriculum = lazy(() => import("@/pages/Curriculum"));


/**
 * Deployment base path, injected by Vite from the build's `base`.
 *
 * "/" when served from a domain root (Netlify, Vercel, Cloudflare, a custom
 * domain), "/<repo>/" for a GitHub Pages project site. wouter wants it without
 * the trailing slash, and empty at the root, so routes resolve either way.
 */
const routerBase = import.meta.env.BASE_URL.replace(/\/$/, "");

function Router() {
  return (
    <WouterRouter base={routerBase}>
      <RouteAnnouncer />
      {/* Inside the Router: the palette navigates, so it needs the location. */}
      <CommandPalette />
      <Switch>
        <Route path={"/"} component={ReferenceHome} />
        <Route path={"/system/:slug"}>
          <Suspense fallback={<PageLoading />}>
            <SystemCaseFile />
          </Suspense>
        </Route>
        <Route path={"/demo/:slug"} component={DemoPage} />
        <Route path={"/cv"}>
          <Suspense fallback={<PageLoading />}>
            <Curriculum />
          </Suspense>
        </Route>
        <Route path={"/404"} component={NotFound} />
        {/* Final fallback route */}
        <Route component={NotFound} />
      </Switch>
    </WouterRouter>
  );
}

// NOTE: About Theme
// - First choose a default theme according to your design style (dark or light bg), than change color palette in index.css
//   to keep consistent foreground/background color across components
// - If you want to make theme switchable, pass `switchable` ThemeProvider and use `useTheme` hook

function App() {
  return (
    <ErrorBoundary>
      <ThemeProvider
        defaultTheme="dark"
        switchable
      >
        <Router />
      </ThemeProvider>
    </ErrorBoundary>
  );
}

export default App;
