import { useCallback, useEffect, useRef } from "react";

export function useMutation( mutationFn, { autoCancel = true, timeoutMs = 8000, onFinally } = {} ) {
  const ctrlRef = useRef(null);

  const mutate = useCallback(async (vars, opts = {}) => {
    if (autoCancel && ctrlRef.current) ctrlRef.current.abort();

    const ctrl = new AbortController();
    ctrlRef.current = ctrl;

    try {
      const res = await mutationFn(vars, {
        ct: ctrl.signal,
        timeoutMs: opts.timeoutMs ?? timeoutMs,
      });
      return res;
    } 
    catch (ex) {
      if (ex && ex.name === "AbortError") return { aborted: true };
      throw ex;
    } 
    finally {
      const isCurrent = ctrlRef.current === ctrl;
      if (isCurrent) ctrlRef.current = null;
      if (isCurrent) {
        if (typeof opts.onFinally === "function") opts.onFinally();
        if (typeof onFinally === "function") onFinally();
      }
    }
  }, [mutationFn, autoCancel, timeoutMs, onFinally]);

  const abort = useCallback(() => {
    ctrlRef.current?.abort();
  }, []);

  useEffect(() => abort, [abort]);

  return { mutate, abort };
}