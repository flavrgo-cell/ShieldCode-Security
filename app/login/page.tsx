import { Toaster } from "sonner";
import { AuthGatePortal } from "@/components/auth/auth-gate-portal";

export const metadata = {
  title: "ShieldCode • Verified Access",
  description:
    "Authenticate with verified Email and Algerian Mobile (+213) OTP credentials.",
};

export default function LoginPage() {
  return (
    <>
      <Toaster position="top-right" richColors />
      <AuthGatePortal />
    </>
  );
}
