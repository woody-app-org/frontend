import { useState, type ReactNode } from "react";
import { Link } from "react-router-dom";
import { useSubscriptionCapabilities } from "../useSubscriptionCapabilities";
import { ProCreateCommunityPaywallDialog } from "./ProCreateCommunityPaywallDialog";

export interface CreateCommunityEntryProps {
  className?: string;
  children: ReactNode;
}

/**
 * Utilizadoras Pro seguem para o formulário; Free abrem paywall contextual (sem navegar para /communities/nova).
 */
export function CreateCommunityEntry({ className, children }: CreateCommunityEntryProps) {
  const { isProUser } = useSubscriptionCapabilities();
  const [paywallOpen, setPaywallOpen] = useState(false);

  if (isProUser) {
    return (
      <Link to="/communities/nova" className={className}>
        {children}
      </Link>
    );
  }

  return (
    <>
      <button type="button" className={className} onClick={() => setPaywallOpen(true)}>
        {children}
      </button>
      <ProCreateCommunityPaywallDialog open={paywallOpen} onOpenChange={setPaywallOpen} />
    </>
  );
}
