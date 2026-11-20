import { Toaster } from "sonner";
import { PrivateRoute } from "@/components/auth/private-route";
import { DeveloperSettingsDashboard } from "@/components/developer-settings-dashboard";

export const metadata = {
  title: "ShieldCode • Developer Settings & B2B API",
  description:
    "Provision SHA-256 hashed bank API keys, view analytics, and integrate ShieldCode into your platform.",
};

export default function DeveloperSettingsPage() {
  return (
    <PrivateRoute>
      <Toaster position="top-right" richColors />
      <DeveloperSettingsDashboard />
    </PrivateRoute>
  );
}
