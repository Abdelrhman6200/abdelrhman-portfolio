import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/NotFound";
import { Route, Switch } from "wouter";
import ErrorBoundary from "./components/ErrorBoundary";
import { ThemeProvider } from "./contexts/ThemeContext";
import ReferenceHome from "@/pages/ReferenceHome";
import SystemCaseFile from "@/pages/SystemCaseFile";
import { CGFoundryDemo, ExcelValidationDemo, QuestionnaireDemo, SessionLinksDemo } from "@/pages/DemoPages";


function Router() {
  return (
    <Switch>
      <Route path={"/"} component={ReferenceHome} />
      <Route path={"/system/:slug"} component={SystemCaseFile} />
      <Route path={"/demo/cgf"} component={CGFoundryDemo} />
      <Route path={"/demo/questionnaire"} component={QuestionnaireDemo} />
      <Route path={"/demo/session-links"} component={SessionLinksDemo} />
      <Route path={"/demo/excel-validation"} component={ExcelValidationDemo} />
      <Route path={"/404"} component={NotFound} />
      {/* Final fallback route */}
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
