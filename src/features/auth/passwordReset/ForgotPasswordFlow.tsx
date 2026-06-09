import { Link, Outlet, useLocation } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import { AuthLayout } from "../components/AuthLayout";
import { PasswordResetProvider } from "./PasswordResetContext";
import { cn } from "@/lib/utils";

/**
 * Layout do fluxo de recuperação de senha — estado em memória via PasswordResetProvider.
 */
export function ForgotPasswordFlow() {
  return (
    <PasswordResetProvider>
      <ForgotPasswordFlowLayout />
    </PasswordResetProvider>
  );
}

function ForgotPasswordFlowLayout() {
  const { pathname } = useLocation();
  const backTo = pathname.includes("/verify")
    ? "/auth/forgot-password"
    : pathname.includes("/new-password")
      ? "/auth/forgot-password/verify"
      : "/auth/login";

  return (
    <AuthLayout>
      <div className="w-full max-w-lg flex flex-col gap-3 sm:gap-4">
        <div className="flex items-center shrink-0">
          <Link
            to={backTo}
            className={cn(
              "inline-flex items-center gap-2 min-h-10 text-sm font-medium text-[var(--auth-text-on-beige)]",
              "rounded-xl px-2.5 py-2 -ml-1 hover:bg-black/5 active:scale-[0.99] transition-[colors,transform] duration-200 ease-out",
              "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--auth-button)]/50"
            )}
          >
            <ArrowLeft className="size-4 shrink-0" aria-hidden />
            Voltar
          </Link>
        </div>

        <div
          key={pathname}
          className={cn(
            "relative rounded-2xl md:rounded-3xl bg-white text-[var(--auth-text-on-maroon)] border border-black/10",
            "p-4 sm:p-6 md:p-8 shadow-none md:shadow-xl md:shadow-black/10 overflow-x-hidden",
            "animate-in fade-in slide-in-from-bottom-2 duration-500 ease-out"
          )}
        >
          <div
            className="pointer-events-none absolute left-4 sm:left-6 md:left-7 top-5 bottom-5 hidden sm:block w-1 rounded-full bg-[var(--auth-button)]/95"
            aria-hidden
          />
          <div className="sm:pl-5 md:pl-6">
            <Outlet />
          </div>
        </div>
      </div>
    </AuthLayout>
  );
}
