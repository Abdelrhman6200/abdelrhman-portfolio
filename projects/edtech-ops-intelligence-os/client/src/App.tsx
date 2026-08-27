import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { Route, Switch } from "wouter";
import ErrorBoundary from "./components/ErrorBoundary";
import OperationsConsole from "./components/OperationsConsole";
import { ThemeProvider } from "./contexts/ThemeContext";
import SignIn from "./pages/SignIn";

function Router() {
  return (
    <Switch>
      <Route path="/sign-in" component={SignIn} />
      {/* The console is a single workspace surface with its own internal
          navigation, so every other path renders it. */}
      <Route component={OperationsConsole} />
    </Switch>
  );
}

function App() {
  return (
    <ErrorBoundary>
      <ThemeProvider defaultTheme="dark">
        <TooltipProvider>
          <Toaster />
          <Router />
        </TooltipProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}

export default App;
