import { useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";

export function useProtectedActionHandler() {
  const { user } = useAuth();
  const navigate = useNavigate();

  const handle = useCallback(
    (action: () => void | Promise<void>) => {
      if (!user) {
        navigate("/auth");
        return;
      }
      void action();
    },
    [user, navigate]
  );

  return { handle, handleAction: handle, isAuthenticated: !!user };
}

export default useProtectedActionHandler;