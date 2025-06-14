import { ReactAction } from "convex/react";
import { FunctionReference, FunctionReturnType, OptionalRestArgs } from "convex/server";
import { useAction as useConvexAction } from "convex/react";
import { useState } from "react";

export function useAction<Action extends FunctionReference<"action">>(
  action: Action,
  opts?: {
    onError?: (e: Error) => void;
    onSuccess?: (result: FunctionReturnType<Action>) => void;
  },
) {
  const [isPending, setIsPending] = useState(false);
  const [error, setError] = useState<Error | undefined>(undefined);
  const mutate: ReactAction<Action> = useConvexAction(action);

  async function runAction(...args: OptionalRestArgs<Action>) {
    setIsPending(true);
    try {
      const result = await mutate(...args);
      opts?.onSuccess?.(result);
      setError(undefined);
      setIsPending(false);
      return { result };
    } catch (err) {
      opts?.onError?.(err as Error);
      setError(err as Error);
      setIsPending(false);
      return { error: err };
    }
  }

  return { run: runAction, isPending, error };
}
