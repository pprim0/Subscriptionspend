import type { QueryClient } from "@tanstack/react-query";
import {
  createRootRouteWithContext,
  HeadContent,
  Scripts,
} from "@tanstack/react-router";
import { Header } from "#/components/header";
import appCss from "../styles.css?url";

interface MyRouterContext {
  queryClient: QueryClient;
}

export const Route = createRootRouteWithContext<MyRouterContext>()({
  head: () => ({
    meta: [
      {
        charSet: "utf-8",
      },
      {
        name: "viewport",
        content: "width=device-width, initial-scale=1",
      },
      {
        title: "subscriptionspend",
      },
    ],
    links: [
      {
        rel: "stylesheet",
        href: appCss,
      },
      {
        rel: "icon",
        href: "/favicon.svg",
        type: "image/svg+xml",
      },
      {
        rel: "manifest",
        href: "/manifest.json",
      },
    ],
  }),
  notFoundComponent: () => (
    <main className="flex min-h-[calc(100vh-81px)] flex-1 items-center justify-center px-6">
      <div className="rounded-[28px] border border-[var(--border-soft)] bg-[var(--surface-soft)] px-8 py-10 text-center shadow-[0_24px_80px_rgba(15,23,42,0.08)]">
        <p className="text-sm uppercase tracking-[0.16em] text-[var(--text-soft)]">
          Not found
        </p>
        <h1 className="mt-3 text-3xl font-semibold tracking-tight text-[var(--text-strong)]">
          This page does not exist.
        </h1>
      </div>
    </main>
  ),
  shellComponent: RootDocument,
});

function RootDocument({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="h-full">
      <head>
        <HeadContent />
      </head>
      <body className="min-h-full flex h-full flex-col bg-[var(--background)] antialiased">
        <Header />
        {children}
        <Scripts />
      </body>
    </html>
  );
}
