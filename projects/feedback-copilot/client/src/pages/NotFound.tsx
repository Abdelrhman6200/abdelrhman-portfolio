/*
 * 404.
 *
 * Previously unrouted: the catch-all rendered the grading demo, so a mistyped
 * or truncated link silently looked like a working page. Now it is the
 * fallback, and it names the real routes rather than offering a bare "home".
 */
import { AlertCircle, ArrowLeft } from "lucide-react";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";

const ROUTES = [
  { href: "/", label: "Grading workspace" },
  { href: "/grading-admin", label: "Coordinator review" },
  { href: "/sign-in", label: "Sign in" },
];

export default function NotFound() {
  return (
    <main className="flex min-h-screen w-full items-center justify-center bg-background p-8">
      <div className="w-full max-w-md">
        <AlertCircle className="mb-5 h-10 w-10 text-destructive" aria-hidden="true" />
        <h1 className="text-3xl font-semibold tracking-tight text-foreground">Page not found</h1>
        <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
          That address does not match any page in this workspace. If you followed a link, it may have been
          cut short.
        </p>

        <nav aria-label="Available pages" className="mt-6 flex flex-col gap-2">
          {ROUTES.map((route) => (
            <Link
              key={route.href}
              href={route.href}
              className="text-sm text-foreground underline underline-offset-4 hover:no-underline"
            >
              {route.label}
            </Link>
          ))}
        </nav>

        <Button asChild className="mt-7">
          <Link href="/">
            <ArrowLeft className="mr-2 h-4 w-4" aria-hidden="true" />
            Back to the workspace
          </Link>
        </Button>
      </div>
    </main>
  );
}
