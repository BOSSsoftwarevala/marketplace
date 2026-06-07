import { useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";

export function useProtectedActionHandler() {
  const { user } = useAuth();
  const navigate = useNavigate();

  // Accept either a function action or a string path to navigate to.
  const handle = useCallback(
    (action: any) => {
      if (!user) {
        navigate("/auth");
        return;
      }
      if (typeof action === "function") {
        void action();
      } else if (typeof action === "string") {
        navigate(action);
      }
    },
    [user, navigate]
  );

  return { handle, handleAction: handle, isAuthenticated: !!user };
}

export default useProtectedActionHandler;