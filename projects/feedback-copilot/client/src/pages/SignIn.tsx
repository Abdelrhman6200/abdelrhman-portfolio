/*
 * Sign-in / registration.
 *
 * Replaces the hosted OAuth redirect this app previously depended on. Both
 * flows post to the app's own /api/auth endpoints and, on success, reload so
 * every tRPC query refetches under the new session cookie.
 */
import { useState, type FormEvent } from "react";
import { AuthError, MIN_PASSWORD_LENGTH, login, register } from "@/const";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

type Mode = "sign-in" | "register";

export default function SignIn() {
  const [mode, setMode] = useState<Mode>("sign-in");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [role, setRole] = useState<"teacher" | "coordinator">("teacher");
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const registering = mode === "register";

  async function onSubmit(event: FormEvent) {
    event.preventDefault();
    setError(null);

    if (registering && password.length < MIN_PASSWORD_LENGTH) {
      setError(`Password must be at least ${MIN_PASSWORD_LENGTH} characters.`);
      return;
    }

    setBusy(true);
    try {
      if (registering) {
        await register({ email, password, name, role });
      } else {
        await login(email, password);
      }
      // Full reload so cached queries refetch with the new session.
      window.location.href = "/";
    } catch (caught) {
      setError(caught instanceof AuthError ? caught.message : "Something went wrong. Please try again.");
      setBusy(false);
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4 py-12">
      <div className="w-full max-w-sm">
        <div className="mb-8">
          <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
            Feedback Copilot
          </p>
          <h1 className="mt-2 text-2xl font-semibold tracking-tight">
            {registering ? "Create your account" : "Sign in"}
          </h1>
          <p className="mt-2 text-sm text-muted-foreground">
            {registering
              ? "Teachers draft feedback; coordinators review and approve it."
              : "Use the email and password for your workspace account."}
          </p>
        </div>

        <form onSubmit={onSubmit} className="space-y-4">
          {registering && (
            <div className="space-y-2">
              <Label htmlFor="name">Full name</Label>
              <Input
                id="name"
                value={name}
                onChange={(event) => setName(event.target.value)}
                autoComplete="name"
                required
              />
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              autoComplete="email"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="password">Password</Label>
            <Input
              id="password"
              type="password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              autoComplete={registering ? "new-password" : "current-password"}
              minLength={registering ? MIN_PASSWORD_LENGTH : undefined}
              required
            />
            {registering && (
              <p className="text-xs text-muted-foreground">
                At least {MIN_PASSWORD_LENGTH} characters.
              </p>
            )}
          </div>

          {registering && (
            <fieldset className="space-y-2">
              <legend className="text-sm font-medium">Role</legend>
              <div className="flex gap-2">
                {(["teacher", "coordinator"] as const).map((option) => (
                  <button
                    key={option}
                    type="button"
                    onClick={() => setRole(option)}
                    aria-pressed={role === option}
                    className={`flex-1 rounded-md border px-3 py-2 text-sm capitalize transition ${
                      role === option
                        ? "border-primary bg-primary text-primary-foreground"
                        : "border-border hover:bg-muted"
                    }`}
                  >
                    {option}
                  </button>
                ))}
              </div>
            </fieldset>
          )}

          {error && (
            <p role="alert" className="text-sm text-destructive">
              {error}
            </p>
          )}

          <Button type="submit" className="w-full" disabled={busy}>
            {busy ? "Please wait…" : registering ? "Create account" : "Sign in"}
          </Button>
        </form>

        <p className="mt-6 text-center text-sm text-muted-foreground">
          {registering ? "Already have an account?" : "Need an account?"}{" "}
          <button
            type="button"
            className="font-medium text-foreground underline underline-offset-4"
            onClick={() => {
              setMode(registering ? "sign-in" : "register");
              setError(null);
            }}
          >
            {registering ? "Sign in" : "Create one"}
          </button>
        </p>
      </div>
    </div>
  );
}
