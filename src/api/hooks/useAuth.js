import { useSyncExternalStore, useMemo, useCallback, useEffect, useState } from "react";
import { tokenStore } from "@/api/tokenStore.js";
import { AuthService } from "@/api/services/AuthService.js";

export function useAuth() {
  const isAuthed = useSyncExternalStore(
    tokenStore.subscribe,
    () => !!tokenStore.get(),
    () => false
  );

  const claim = useSyncExternalStore(
    tokenStore.subscribe,
    () => tokenStore.getClaim(),
    () => null
  );

  const [ready, setReady] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        if (!tokenStore.get() && tokenStore.getRefresh()) {
          await AuthService.refresh();
        }
      } catch {
        tokenStore.clear();
      } finally {
        setReady(true);
      }
    })();
  }, []);

  const login = useCallback((email, password) => AuthService.login(email, password), []);
  const logout = useCallback(() => AuthService.logout(), []);
  const register = useCallback((email, password, accountType, name = null, companyName = null) => AuthService.register(email, password, accountType, name, companyName), []);

  return useMemo(() => ({ ready, isAuthed, claim, login, logout, register }), [ready, isAuthed, claim, login, logout, register]);
}