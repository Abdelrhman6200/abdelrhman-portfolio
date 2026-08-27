import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { Route, Switch } from "wouter";
import ErrorBoundary from "./components/ErrorBoundary";
import { ThemeProvider } from "./contexts/ThemeContext";
import CollectiveGradingDemo from "./pages/CollectiveGradingDemo";
import CollectiveAdminDemo from "./pages/CollectiveAdminDemo";
import SignIn from "./pages/SignIn";
import NotFound from "./pages/NotFound";
import Workspace from "./pages/Workspace";

function Router() {
  // make sure to consider if you need authentication for certain routes
  return (
    <Switch>
      <Route path={"/sign-in"} component={SignIn} />
      <Route path={"/workspace"} component={Workspace} />
      <Route path={"/"} component={CollectiveGradingDemo} />
      <Route path={"/rubric"} component={CollectiveGradingDemo} />
      <Route path={"/grading-admin"} component={CollectiveAdminDemo} />
      {/* A bad URL previously rendered the grading demo, so a mistyped or
          truncated link silently looked like a working page. */}
      <Route component={NotFound} />
    </Switch>
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
        defaultTheme="light"
        // switchable
      >
        <TooltipProvider>
          <Toaster />
          <Router />
        </TooltipProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}

export default App;
