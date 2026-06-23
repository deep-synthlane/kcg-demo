import { createFileRoute, Outlet, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Bot, Radio, ShieldCheck, MessageSquareHeart } from "lucide-react";
import { RoleShell, type NavItem } from "@/components/RoleShell";
import { canAccessAi, getSession } from "@/lib/session";
import type { Role } from "@/lib/mockData";
import { toast } from "sonner";

const NAV: NavItem[] = [
  { label: "Proctoring", to: "/ai/proctoring", icon: ShieldCheck },
  { label: "AI Interview Assistant", to: "/ai/interview", icon: Bot },
  { label: "Meeting Intelligence", to: "/ai/meeting", icon: Radio },
  { label: "Feedback Engine", to: "/ai/feedback", icon: MessageSquareHeart },
];

function AiLayout() {
  const navigate = useNavigate();
  const [ready, setReady] = useState(false);
  const [role, setRole] = useState<Role>("admin");

  useEffect(() => {
    const session = getSession();
    if (!session) {
      navigate({ to: "/" });
      return;
    }
    if (!canAccessAi(session.role)) {
      toast("Access denied — redirecting to your dashboard");
      navigate({ to: `/${session.role}/dashboard` });
      return;
    }
    setRole(session.role);
    setReady(true);
  }, [navigate]);

  if (!ready) return null;

  return (
    <RoleShell
      role={role}
      nav={NAV}
      backTo={{ label: "Back to Dashboard", to: `/${role}/dashboard` }}
    >
      <Outlet />
    </RoleShell>
  );
}

export const Route = createFileRoute("/ai")({
  component: AiLayout,
});
