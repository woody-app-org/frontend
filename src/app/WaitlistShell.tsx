import { Outlet } from "react-router-dom";
import { WoodyToaster } from "@/components/ui/woody-toaster";

export function WaitlistShell() {
  return (
    <>
      <WoodyToaster />
      <Outlet />
    </>
  );
}
