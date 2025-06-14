import { convexAuthNextjsToken } from "@convex-dev/auth/nextjs/server";
import { fetchQuery, NextjsOptions } from "convex/nextjs";
import { PaginatedQueryArgs, Preloaded } from "convex/react";
import { ArgsAndOptions, FunctionReference, getFunctionName } from "convex/server";
import { convexToJson } from "convex/values";

async function preload<Query extends FunctionReference<"query">>(
  query: Query,
  ...args: ArgsAndOptions<Query, NextjsOptions>
): Promise<{ data: Preloaded<Query>; error?: Error }> {
  try {
    const value = await fetchQuery(query, ...args);
    const preloaded = {
      _name: getFunctionName(query),
      _argsJSON: convexToJson(args[0] ?? {}),
      _valueJSON: convexToJson(value),
    };
    return { data: preloaded as any, error: undefined };
  } catch (err) {
    const preloaded = {
      _name: getFunctionName(query),
      _argsJSON: convexToJson(args[0] ?? {}),
      _valueJSON: convexToJson(null),
    };
    return { data: preloaded as any, error: err as Error };
  }
}

export async function preloadQuery<Query extends FunctionReference<"query">>(
  query: Query,
  ...args: ArgsAndOptions<Query, NextjsOptions>
): Promise<{ data: Preloaded<Query>; error?: Error }> {
  return preload(query, args[0], { token: await convexAuthNextjsToken(), ...args[1] });
}

export async function preloadPaginatedQuery<Query extends FunctionReference<"query">>(
  query: Query,
  args: PaginatedQueryArgs<Query> | "skip",
  options: { initialNumItems: number },
): Promise<{ data: Preloaded<Query>; error?: Error }> {
  return preload(
    query,
    {
      ...(typeof args == "object" ? args : {}),
      paginationOpts: { cursor: null, numItems: options.initialNumItems },
    } as any,
    { token: await convexAuthNextjsToken() },
  );
}
