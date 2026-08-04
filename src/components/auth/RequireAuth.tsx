import { ReactNode, forwardRef } from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { Loader2 } from "lucide-react";
import { AUTH_BYPASS } from "@/config/authBypass";

type RequireAuthProps = {
  children: ReactNode;
};

const RequireAuth = forwardRef<HTMLDivElement, RequireAuthProps>(
  ({ children }, ref) => {
    const { user, loading } = useAuth();

    // TEMPORARY: login disabled for testing
    if (AUTH_BYPASS) return <div ref={ref}>{children}</div>;

    if (loading) {
      return (
        <div ref={ref} className="min-h-screen bg-background flex items-center justify-center">
          <Loader2 className="w-10 h-10 animate-spin text-primary" />
        </div>
      );
    }

    if (!user) return <Navigate to="/auth" replace />;

    return <div ref={ref}>{children}</div>;
  }
);

RequireAuth.displayName = "RequireAuth";

export default RequireAuth;
