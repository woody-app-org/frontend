import { NavLink } from "react-router-dom";
import { Shield, Flag, LifeBuoy } from "lucide-react";
import { cn } from "@/lib/utils";

const links = [
  { to: "/admin/verification", label: "Verificações", Icon: Shield },
  { to: "/admin/reports", label: "Denúncias", Icon: Flag },
  { to: "/admin/support", label: "Suporte", Icon: LifeBuoy },
];

export function AdminNav() {
  return (
    <nav className="mb-5 flex items-center gap-1 rounded-xl border border-black/10 bg-white p-1 shadow-sm w-fit">
      {links.map(({ to, label, Icon }) => (
        <NavLink
          key={to}
          to={to}
          className={({ isActive }) =>
            cn(
              "inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-sm font-medium transition-colors",
              isActive
                ? "bg-[var(--auth-button)]/12 text-[var(--auth-button-hover)]"
                : "text-zinc-500 hover:bg-zinc-50 hover:text-zinc-700"
            )
          }
        >
          <Icon className="size-3.5" aria-hidden />
          {label}
        </NavLink>
      ))}
    </nav>
  );
}
