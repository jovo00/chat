import { OptionalRestArgsOrSkip, RequestForQueries, useQueries } from "convex/react";
import { FunctionReference, getFunctionName, makeFunctionReference } from "convex/server";
import { convexToJson, Value } from "convex/values";
import { useMemo } from "react";

function parseArgs(args: Record<string, Value> | undefined): Record<string, Value> {
  if (args === undefined) {
    return {};
  }
  if (!isSimpleObject(args)) {
    throw new Error(`The arguments to a Convex function must be an object. Received: ${args as any}`);
  }
  return args;
}

export function isSimpleObject(value: unknown) {
  const isObject = typeof value === "object";
  const prototype = Object.getPrototypeOf(value);
  const isSimple =
    prototype === null ||
    prototype === Object.prototype ||
    // Objects generated from other contexts (e.g. across Node.js `vm` modules) will not satisfy the previous
    // conditions but are still simple objects.
    prototype?.constructor?.name === "Object";
  return isObject && isSimple;
}

export function useQuery<Query extends FunctionReference<"query">>(
  query: Query,
  ...args: OptionalRestArgsOrSkip<Query>
): {
  data: Query["_returnType"] | undefined;
  error: Error | undefined;
  isError: boolean;
  isLoading: boolean;
} {
  const skip = args[0] === "skip";
  const argsObject = args[0] === "skip" ? {} : parseArgs(args[0]);

  const queryReference = typeof query === "string" ? makeFunctionReference<"query", any, any>(query) : query;

  const queryName = getFunctionName(queryReference);

  const queries = useMemo(
    () => (skip ? ({} as RequestForQueries) : { query: { query: queryReference, args: argsObject } }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [JSON.stringify(convexToJson(argsObject)), queryName, skip],
  );

  const results = useQueries(queries);
  const result = results["query"];

  const hasError = result instanceof Error;
  const isLoading = !skip && result === undefined && !hasError;

  if (hasError) {
    return {
      data: undefined,
      isError: true,
      error: result,
      isLoading: false,
    };
  }

  return {
    data: result,
    isError: false,
    error: undefined,
    isLoading: isLoading,
  };
}
