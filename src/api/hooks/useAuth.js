import { useSyncExternalStore, useMemo, useEffect, useState } from "react";
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

  return useMemo(() => ({ ready, isAuthed, claim }), [ready, isAuthed, claim]);
}