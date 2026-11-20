import { PrivateRoute } from "@/components/auth/private-route";
import { UnifiedPlatform } from "@/components/unified-platform";

export default function HomePage() {
  return (
    <PrivateRoute>
      <UnifiedPlatform initialSection="all" />
    </PrivateRoute>
  );
}
