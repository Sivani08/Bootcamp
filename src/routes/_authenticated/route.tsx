import { createFileRoute, Outlet, useRouter } from "@tanstack/react-router";
import { useEffect } from "react";
import { useAuth } from "@/lib/auth";
import { AppShell } from "@/components/app-shell";
import { SkeletonPage } from "@/components/ui-bits";

export const Route = createFileRoute("/_authenticated")({
  ssr: false,
  component: AuthedLayout,
});

function AuthedLayout() {
  const { loading, session, member, memberChecked, signOut } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !session) void router.navigate({ to: "/auth" });
  }, [loading, session, router]);

  if (session && memberChecked && !member) {
    return (
      <div className="grid min-h-screen place-items-center p-8">
        <div className="panel max-w-md p-6 text-center">
          <h1 className="text-lg font-bold">No workspace profile found</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            This account isn't linked to a BootMind member record yet. Ask an admin to add your work email or
            employee ID, then sign in again.
          </p>
          <button
            onClick={async () => {
              await signOut();
              void router.navigate({ to: "/auth" });
            }}
            className="mt-5 h-10 rounded-lg bg-primary px-4 text-sm font-semibold text-primary-foreground hover:bg-primary/90"
          >
            Back to sign in
          </button>
        </div>
      </div>
    );
  }

  if (loading || !session || !member) {
    return (
      <div className="p-8">
        <SkeletonPage />
      </div>
    );
  }
  return (
    <AppShell>
      <Outlet />
    </AppShell>
  );
}
