/**
 * DESIGN CONTEXT — The Learning Ledger app shell: an editorial, evidence-first
 * navigation frame for a humane education operations workspace.
 */
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Sidebar, SidebarContent, SidebarFooter, SidebarHeader, SidebarInset, SidebarMenu, SidebarMenuButton, SidebarMenuItem, SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { startLogin } from "@/const";
import { useAuth } from "@/_core/hooks/useAuth";
import { BookOpen, CalendarDays, ChartNoAxesCombined, ClipboardCheck, Command, FileText, HeartPulse, LayoutDashboard, MessageSquareText, Settings, Sparkles, UsersRound } from "lucide-react";
import { useLocation } from "wouter";

const assetLogo = "/brand/mark.svg";

const primaryItems = [
  { icon: LayoutDashboard, label: "Control tower", path: "/" },
  { icon: UsersRound, label: "Students", path: "/students" },
  { icon: HeartPulse, label: "Renewals", path: "/renewals" },
  { icon: ChartNoAxesCombined, label: "Engagement", path: "/engagement" },
  { icon: ClipboardCheck, label: "Interventions", path: "/interventions" },
  { icon: MessageSquareText, label: "Community", path: "/community" },
];

const intelligenceItems = [
  { icon: BookOpen, label: "Course knowledge", path: "/course" },
  { icon: CalendarDays, label: "Sessions", path: "/sessions" },
  { icon: FileText, label: "Content plan", path: "/content" },
  { icon: Sparkles, label: "AI analyst", path: "/ai" },
  { icon: Command, label: "Business review", path: "/review" },
];

function NavGroup({ label, items, location, setLocation }: { label: string; items: typeof primaryItems; location: string; setLocation: (value: string) => void }) {
  return <div className="nav-group-ledger"><span>{label}</span><SidebarMenu>{items.map((item) => <SidebarMenuItem key={item.path}><SidebarMenuButton isActive={location === item.path || (item.path === "/students" && location.startsWith("/students/"))} onClick={() => setLocation(item.path)} tooltip={item.label} className="ledger-nav-button"><item.icon className="size-4" /><span>{item.label}</span></SidebarMenuButton></SidebarMenuItem>)}</SidebarMenu></div>;
}

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const { loading, user, logout } = useAuth();
  const [location, setLocation] = useLocation();
  if (loading) return <div className="auth-stage"><div className="auth-mark"><img src={assetLogo} alt="Community Success OS" /></div><span>Opening your workspace…</span></div>;
  if (!user) return <div className="auth-stage"><div className="auth-card"><img src={assetLogo} alt="Community Success OS" /><p className="eyebrow">COMMUNITY SUCCESS OS</p><h1>Operate from evidence, not a spreadsheet.</h1><p>Sign in to access the protected operations workspace.</p><Button onClick={() => startLogin()} className="ledger-primary">Continue to workspace</Button></div></div>;
  return <SidebarProvider><Sidebar className="ledger-sidebar-frame" collapsible="icon"><SidebarHeader className="ledger-sidebar-header"><button className="brand-ledger" onClick={() => setLocation("/")} aria-label="Go to control tower"><img src={assetLogo} alt="" /><span><b>Community</b><small>Success OS</small></span></button><div className="workspace-chip"><i /><span><small>WORKSPACE</small><b>Eloquenta Academy</b></span></div></SidebarHeader><SidebarContent className="ledger-sidebar-content"><NavGroup label="Workspace" items={primaryItems} location={location} setLocation={setLocation} /><NavGroup label="Program intelligence" items={intelligenceItems} location={location} setLocation={setLocation} /></SidebarContent><SidebarFooter className="ledger-sidebar-footer"><SidebarMenu><SidebarMenuItem><SidebarMenuButton isActive={location === "/settings"} onClick={() => setLocation("/settings")} tooltip="Settings" className="ledger-nav-button"><Settings className="size-4" /><span>Settings</span></SidebarMenuButton></SidebarMenuItem></SidebarMenu><button className="account-ledger" onClick={logout}><Avatar className="size-8"><AvatarFallback>{user.name?.slice(0, 2).toUpperCase() || "OS"}</AvatarFallback></Avatar><span><b>{user.name || "Workspace user"}</b><small>{user.role === "admin" ? "System admin" : "Operations member"}</small></span></button></SidebarFooter></Sidebar><SidebarInset className="ledger-inset"><header className="ledger-topbar"><div className="topbar-title"><SidebarTrigger className="md:hidden" /><span className="eyebrow">OPERATIONS WORKSPACE</span><strong>Eloquenta Academy</strong></div><div className="topbar-status"><span><i />Live workspace</span><button onClick={() => setLocation("/ai")}><Sparkles size={14} />Ask analyst</button></div></header><main className="workspace-shell">{children}</main></SidebarInset></SidebarProvider>;
}
