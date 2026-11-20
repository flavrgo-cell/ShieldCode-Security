import { Toaster } from "sonner";
import { AuthGatePortal } from "@/components/auth/auth-gate-portal";

export const metadata = {
  title: "ShieldCode • Create Verified Account",
  description:
    "Strict dual-channel Email and Algerian Mobile (+213) verification gate for ShieldCode.",
};

export default function RegisterPage() {
  return (
    <>
      <Toaster position="top-right" richColors />
      <AuthGatePortal />
    </>
  );
}
