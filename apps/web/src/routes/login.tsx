import { createFileRoute, Link } from "@tanstack/react-router";
import { LockKeyhole, Mail } from "lucide-react";
import { useState } from "react";
import { Button } from "#/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "#/components/ui/card";
import { Input } from "#/components/ui/input";
import { Label } from "#/components/ui/label";
import { authClient } from "#/lib/auth";

export const Route = createFileRoute("/login")({
  component: LoginPage,
});

function AuthShell({
  title,
  subtitle,
  children,
  footer,
}: {
  title: string;
  subtitle: string;
  children: React.ReactNode;
  footer: React.ReactNode;
}) {
  return (
    <main className="flex min-h-[calc(100vh-81px)] flex-1 bg-[#f7f2ea]">
      <div className="mx-auto grid w-full max-w-6xl gap-8 px-6 py-10 lg:grid-cols-[1.05fr_0.95fr] lg:items-center">
        <section className="flex flex-col justify-between rounded-[28px] border border-[#e8ddcf] bg-[#2e241d] p-8 text-[#f9f5ef] sm:p-10">
          <div className="space-y-5">
            <div className="inline-flex w-fit items-center rounded-full border border-white/15 bg-white/8 px-3 py-1 text-xs font-medium tracking-[0.16em] uppercase text-white/75">
              Subscription control
            </div>
            <div className="space-y-4">
              <h1 className="max-w-xl text-4xl font-semibold tracking-tight sm:text-5xl">
                See every recurring cost before it quietly piles up.
              </h1>
              <p className="max-w-lg text-base leading-7 text-white/72">
                Track monthly spend, organize services by category, and spot the
                subscriptions that deserve a second look.
              </p>
            </div>
          </div>
          <div className="mt-10 grid gap-4 sm:grid-cols-3">
            <div className="rounded-2xl border border-white/10 bg-white/6 p-4">
              <p className="text-xs uppercase tracking-[0.14em] text-white/55">
                Monthly view
              </p>
              <p className="mt-3 text-lg font-semibold">Normalized totals</p>
            </div>
            <div className="rounded-2xl border border-white/10 bg-white/6 p-4">
              <p className="text-xs uppercase tracking-[0.14em] text-white/55">
                Categories
              </p>
              <p className="mt-3 text-lg font-semibold">Cleaner overview</p>
            </div>
            <div className="rounded-2xl border border-white/10 bg-white/6 p-4">
              <p className="text-xs uppercase tracking-[0.14em] text-white/55">
                Decisions
              </p>
              <p className="mt-3 text-lg font-semibold">Cut waste faster</p>
            </div>
          </div>
        </section>

        <section className="flex items-center justify-center">
          <Card className="w-full max-w-md rounded-[28px] border-[#e3d7c8] bg-[#fffdfa] shadow-[0_24px_80px_rgba(46,36,29,0.08)]">
            <CardHeader className="space-y-3 px-8 pt-8">
              <div className="text-sm font-medium uppercase tracking-[0.16em] text-[#8d7f72]">
                subscriptionspend
              </div>
              <div className="space-y-1">
                <CardTitle className="text-3xl tracking-tight text-[#241b15]">
                  {title}
                </CardTitle>
                <p className="text-sm leading-6 text-[#6e6155]">{subtitle}</p>
              </div>
            </CardHeader>
            <CardContent className="px-8 pb-8">{children}</CardContent>
            <div className="border-t border-[#eee4d8] px-8 py-5 text-sm text-[#6e6155]">
              {footer}
            </div>
          </Card>
        </section>
      </div>
    </main>
  );
}

function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const { error } = await authClient.signIn.email({ email, password });

      if (error) {
        setError(error.message ?? "Invalid email or password.");
        setLoading(false);
        return;
      }

      window.location.assign("/");
    } catch (err) {
      console.error("Failed to sign in", err);
      setError("We couldn't finish signing you in. Please try again.");
      setLoading(false);
    }
  }

  return (
    <AuthShell
      title="Welcome back"
      subtitle="Sign in to review your subscriptions, spending, and categories."
      footer={
        <>
          New here?{" "}
          <Link to="/signup" className="font-semibold text-[#2e241d] underline">
            Create an account
          </Link>
        </>
      }
    >
      <form onSubmit={handleSubmit} className="flex flex-col gap-5">
        <div className="grid gap-2">
          <Label htmlFor="email">Email</Label>
          <div className="relative">
            <Mail className="pointer-events-none absolute left-4 top-1/2 size-4 -translate-y-1/2 text-[#8d7f72]" />
            <Input
              id="email"
              type="email"
              placeholder="you@example.com"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              required
              className="h-12 rounded-2xl border-[#d9cdbf] bg-white pl-11"
            />
          </div>
        </div>
        <div className="grid gap-2">
          <Label htmlFor="password">Password</Label>
          <div className="relative">
            <LockKeyhole className="pointer-events-none absolute left-4 top-1/2 size-4 -translate-y-1/2 text-[#8d7f72]" />
            <Input
              id="password"
              type="password"
              placeholder="Enter your password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              required
              className="h-12 rounded-2xl border-[#d9cdbf] bg-white pl-11"
            />
          </div>
        </div>
        {error ? (
          <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            {error}
          </div>
        ) : null}
        <Button
          type="submit"
          disabled={loading}
          className="h-12 rounded-2xl bg-[#2e241d] text-white hover:bg-[#433226]"
        >
          {loading ? "Signing in..." : "Sign in"}
        </Button>
      </form>
    </AuthShell>
  );
}
