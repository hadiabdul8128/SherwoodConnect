"use client";

import dynamic from "next/dynamic";
import { useAuth } from "@/lib/auth-context";
import { LoginGate } from "@/components/LoginGate";

const ManagerDashboard = dynamic(
  () =>
    import("@/components/ManagerDashboard").then(
      (mod) => mod.ManagerDashboard,
    ),
  { loading: () => <LoadingScreen /> },
);

const MasterDashboard = dynamic(
  () =>
    import("@/components/MasterDashboard").then((mod) => mod.MasterDashboard),
  { loading: () => <LoadingScreen /> },
);

function LoadingScreen() {
  return (
    <main className="ops-bg flex min-h-screen items-center justify-center px-4 text-cream">
      <div className="pointer-events-none fixed inset-0 grid-overlay opacity-60" />
      <p className="relative text-sm text-cream-muted">Loading…</p>
    </main>
  );
}

export default function Home() {
  const { configured, loading, user, isMaster, needsProfile, emailLinkInUrl } =
    useAuth();

  if (!user && emailLinkInUrl) return <LoginGate />;
  if (configured && loading) return <LoadingScreen />;
  if (!user || needsProfile) return <LoginGate />;
  return isMaster ? <MasterDashboard /> : <ManagerDashboard />;
}
