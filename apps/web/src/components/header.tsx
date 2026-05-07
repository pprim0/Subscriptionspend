import {
  Link,
  useLocation,
  useNavigate,
  useRouter,
} from "@tanstack/react-router";
import { CreditCard, LogOut } from "lucide-react";

import { Button } from "#/components/ui/button";
import { authClient } from "#/lib/auth";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";

function getInitials(email: string) {
  return email.slice(0, 2).toUpperCase();
}

export function Header() {
  const location = useLocation();
  const navigate = useNavigate();
  const router = useRouter();
  const { data: session, isPending } = authClient.useSession();
  const navItems = [
    { label: "Overview", href: "/" },
    { label: "Calendar", href: "/calendar" },
    { label: "Insights", href: "/insights" },
  ];

  async function handleSignOut() {
    await authClient.signOut();
    await navigate({ to: "/login" });
    await router.invalidate();
  }

  return (
    <header className="sticky top-0 z-20 w-full border-b border-[var(--border-soft)] bg-[rgba(245,247,251,0.88)] backdrop-blur-xl">
      <div className="mx-auto flex w-full max-w-7xl items-center justify-between gap-6 px-6 py-4">
        <div className="flex items-center gap-4">
          <Link to="/" className="flex items-center gap-3">
            <div className="flex size-11 items-center justify-center rounded-full bg-[linear-gradient(135deg,#5b7cfa_0%,#7c97ff_100%)] text-[var(--surface-soft)] shadow-[0_10px_24px_rgba(91,124,250,0.22)]">
              <CreditCard className="size-5" />
            </div>
            <div>
              <p className="text-lg font-semibold tracking-tight text-[var(--text-strong)]">
                subscriptionspend
              </p>
              <p className="text-sm text-[var(--text-soft)]">
                Subscription control center
              </p>
            </div>
          </Link>

          {session ? (
            <nav className="hidden items-center rounded-full border border-[var(--border-soft)] bg-white/82 p-1 shadow-[0_8px_18px_rgba(34,28,24,0.04)] md:flex">
              {navItems.map((item, index) => (
                <Link
                  key={`${item.label}-${index}`}
                  to={item.href}
                  className={`rounded-full px-4 py-2 text-sm font-medium transition ${
                    location.pathname === item.href
                      ? "bg-[var(--button-dark)] text-[var(--surface-soft)]"
                      : "text-[var(--text-soft)] hover:text-[var(--text-strong)]"
                  }`}
                >
                  {item.label}
                </Link>
              ))}
            </nav>
          ) : null}
        </div>

        <div className="flex items-center gap-3">
          {isPending ? null : session ? (
            <>
              <div className="hidden items-center gap-3 rounded-full border border-[var(--border-soft)] bg-white/88 px-3 py-2 sm:flex">
                <Avatar>
                  <AvatarImage
                    src={
                      session.user.image ??
                      `https://api.dicebear.com/9.x/thumbs/svg?seed=${session.user.name}`
                    }
                  />
                  <AvatarFallback>
                    {getInitials(session.user.name)}
                  </AvatarFallback>
                </Avatar>
                <div className="min-w-0">
                  <p className="max-w-52 truncate pr-2 text-sm font-medium text-[var(--text-strong)]">
                    {session.user.name}
                  </p>
                </div>
              </div>
              <Button
                variant="outline"
                size="lg"
                onClick={handleSignOut}
                className="h-11 rounded-full border-[var(--border-soft)] bg-white/88 px-4 text-[var(--text-strong)] hover:bg-[var(--surface-tint)]"
              >
                <LogOut className="size-4" />
                Sign out
              </Button>
            </>
          ) : (
            <>
              <Button
                variant="ghost"
                asChild
                size="lg"
                className="h-11 rounded-full px-5 text-[var(--text-strong)]"
              >
                <Link to="/login">Sign in</Link>
              </Button>
              <Button
                asChild
                size="lg"
                className="h-11 rounded-full bg-[var(--button-dark)] px-5 text-[var(--surface-soft)] hover:bg-[var(--button-dark-hover)]"
              >
                <Link to="/signup">Sign up</Link>
              </Button>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
