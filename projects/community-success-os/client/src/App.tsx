/** DESIGN CONTEXT — The Learning Ledger routes keep every operational module inside one coherent workspace. */
import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import DashboardLayout from "@/components/DashboardLayout";
import ErrorBoundary from "./components/ErrorBoundary";
import SignIn from "./pages/SignIn";
import { ThemeProvider } from "./contexts/ThemeContext";
import Home from "./pages/Home";
import { AIAnalystPage, BusinessReviewPage, CommunityPage, ContentPage, CoursePage, EngagementPage, InterventionsPage, RenewalsPage, SessionsPage, SettingsPage, StudentDetailPage, StudentsPage } from "./pages/OperationsPages";
import NotFound from "./pages/NotFound";
import { Route, Switch } from "wouter";

function Protected({ children }: { children: React.ReactNode }) { return <DashboardLayout>{children}</DashboardLayout>; }
function Router() { return <Switch><Route path="/sign-in" component={SignIn} /><Route path="/"><Protected><Home /></Protected></Route><Route path="/students"><Protected><StudentsPage /></Protected></Route><Route path="/students/:id"><Protected><StudentDetailPage /></Protected></Route><Route path="/renewals"><Protected><RenewalsPage /></Protected></Route><Route path="/engagement"><Protected><EngagementPage /></Protected></Route><Route path="/interventions"><Protected><InterventionsPage /></Protected></Route><Route path="/community"><Protected><CommunityPage /></Protected></Route><Route path="/course"><Protected><CoursePage /></Protected></Route><Route path="/sessions"><Protected><SessionsPage /></Protected></Route><Route path="/content"><Protected><ContentPage /></Protected></Route><Route path="/ai"><Protected><AIAnalystPage /></Protected></Route><Route path="/review"><Protected><BusinessReviewPage /></Protected></Route><Route path="/settings"><Protected><SettingsPage /></Protected></Route><Route path="/404" component={NotFound} /><Route component={NotFound} /></Switch>; }
function App() { return <ErrorBoundary><ThemeProvider defaultTheme="light"><TooltipProvider><Toaster position="bottom-right" richColors /><Router /></TooltipProvider></ThemeProvider></ErrorBoundary>; }
export default App;
