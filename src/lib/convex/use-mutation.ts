import { ReactMutation } from "convex/react";
import { FunctionReference, FunctionReturnType, OptionalRestArgs } from "convex/server";
import { useMutation as useConvexMutation } from "convex/react";
import { useState } from "react";

export function useMutation<Mutation extends FunctionReference<"mutation">>(
  mutation: Mutation,
  opts?: {
    onError?: (e: Error) => void;
    onSuccess?: (result: FunctionReturnType<Mutation>) => void;
  },
) {
  const [isPending, setIsPending] = useState(false);
  const [error, setError] = useState<Error | undefined>(undefined);
  const mutate: ReactMutation<Mutation> = useConvexMutation(mutation);

  async function runMutation(...args: OptionalRestArgs<Mutation>) {
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

  return { mutate: runMutation, isPending, error };
}
