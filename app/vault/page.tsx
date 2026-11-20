import { PrivateRoute } from "@/components/auth/private-route";
import { UnifiedPlatform } from "@/components/unified-platform";

export default function VaultPage() {
  return (
    <PrivateRoute>
      <UnifiedPlatform initialSection="vault" />
    </PrivateRoute>
  );
}
