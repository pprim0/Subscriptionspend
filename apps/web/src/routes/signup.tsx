import {
  createFileRoute,
  Link,
  useNavigate,
  useRouter,
} from "@tanstack/react-router";
import { LockKeyhole, Mail, UserRound } from "lucide-react";
import { useState } from "react";
import { Button } from "#/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "#/components/ui/card";
import { Input } from "#/components/ui/input";
import { Label } from "#/components/ui/label";
import { authClient } from "#/lib/auth";

export const Route = createFileRoute("/signup")({
  component: SignupPage,
});

function SignupPage() {
  const navigate = useNavigate();
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    setLoading(true);
    setError(null);

    const { error } = await authClient.signUp.email({ name, email, password });

    if (error) {
      setError(error.message ?? "Invalid email or password.");
      setLoading(false);
      return;
    }

    await navigate({ to: "/" });
    await router.invalidate();
  }

  return (
    <main className="flex min-h-[calc(100vh-81px)] flex-1 bg-[#f7f2ea]">
      <div className="mx-auto grid w-full max-w-6xl gap-8 px-6 py-10 lg:grid-cols-[1fr_1fr] lg:items-center">
        <section className="order-2 flex items-center justify-center lg:order-1">
          <Card className="w-full max-w-md rounded-[28px] border-[#e3d7c8] bg-[#fffdfa] shadow-[0_24px_80px_rgba(46,36,29,0.08)]">
            <CardHeader className="space-y-3 px-8 pt-8">
              <div className="text-sm font-medium uppercase tracking-[0.16em] text-[#8d7f72]">
                subscriptionspend
              </div>
              <div className="space-y-1">
                <CardTitle className="text-3xl tracking-tight text-[#241b15]">
                  Create your workspace
                </CardTitle>
                <p className="text-sm leading-6 text-[#6e6155]">
                  Start with your recurring bills, subscriptions, and
                  categories.
                </p>
              </div>
            </CardHeader>
            <CardContent className="px-8 pb-8">
              <form onSubmit={handleSubmit} className="flex flex-col gap-5">
                <div className="grid gap-2">
                  <Label htmlFor="name">Name</Label>
                  <div className="relative">
                    <UserRound className="pointer-events-none absolute left-4 top-1/2 size-4 -translate-y-1/2 text-[#8d7f72]" />
                    <Input
                      id="name"
                      type="text"
                      placeholder="Your name"
                      value={name}
                      onChange={(event) => setName(event.target.value)}
                      required
                      className="h-12 rounded-2xl border-[#d9cdbf] bg-white pl-11"
                    />
                  </div>
                </div>
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
                      placeholder="Choose a secure password"
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
                  {loading ? "Creating account..." : "Create account"}
                </Button>
              </form>
            </CardContent>
            <div className="border-t border-[#eee4d8] px-8 py-5 text-sm text-[#6e6155]">
              Already have an account?{" "}
              <Link
                to="/login"
                className="font-semibold text-[#2e241d] underline"
              >
                Sign in
              </Link>
            </div>
          </Card>
        </section>

        <section className="order-1 rounded-[28px] border border-[#e8ddcf] bg-[linear-gradient(180deg,#fff8ef_0%,#f0e3d3_100%)] p-8 text-[#2e241d] sm:p-10 lg:order-2">
          <div className="space-y-5">
            <div className="inline-flex w-fit items-center rounded-full border border-[#d9c9b5] bg-white/80 px-3 py-1 text-xs font-medium uppercase tracking-[0.16em] text-[#7d6c5d]">
              Built for recurring spend
            </div>
            <h1 className="max-w-xl text-4xl font-semibold tracking-tight sm:text-5xl">
              Keep every subscription visible, sortable, and hard to ignore.
            </h1>
            <p className="max-w-lg text-base leading-7 text-[#66584d]">
              subscriptionspend helps you keep recurring payments in one place,
              compare categories, and make cleaner budget decisions month after
              month.
            </p>
          </div>
          <div className="mt-10 grid gap-4 sm:grid-cols-3">
            <div className="rounded-2xl border border-[#ddcfbd] bg-white/80 p-4">
              <p className="text-xs uppercase tracking-[0.14em] text-[#8d7f72]">
                Clear totals
              </p>
              <p className="mt-3 text-lg font-semibold">
                Monthly and yearly view
              </p>
            </div>
            <div className="rounded-2xl border border-[#ddcfbd] bg-white/80 p-4">
              <p className="text-xs uppercase tracking-[0.14em] text-[#8d7f72]">
                Better grouping
              </p>
              <p className="mt-3 text-lg font-semibold">
                Categories that stay readable
              </p>
            </div>
            <div className="rounded-2xl border border-[#ddcfbd] bg-white/80 p-4">
              <p className="text-xs uppercase tracking-[0.14em] text-[#8d7f72]">
                Faster reviews
              </p>
              <p className="mt-3 text-lg font-semibold">
                Know what to cancel next
              </p>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}
