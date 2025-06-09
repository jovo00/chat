import { convexAuthNextjsToken } from "@convex-dev/auth/nextjs/server";
import { EmptyObject } from "convex-helpers";
import { NextjsOptions, preloadQuery as preloadQueryConvex } from "convex/nextjs";
import { PaginatedQueryArgs, Preloaded, usePaginatedQuery, useQuery } from "convex/react";
import { ArgsAndOptions, FunctionReference, makeFunctionReference, Query } from "convex/server";
import { jsonToConvex } from "convex/values";
import { useMemo } from "react";

export async function preloadQuery<Query extends FunctionReference<"query">>(
  query: Query,
  ...args: ArgsAndOptions<Query, NextjsOptions>
): Promise<Preloaded<Query>> {
  return preloadQueryConvex(query, args[0], { token: await convexAuthNextjsToken(), ...args[1] });
}

export async function preloadPaginatedQuery<Query extends FunctionReference<"query">>(
  query: Query,
  args: PaginatedQueryArgs<Query> | "skip",
  options: { initialNumItems: number }
): Promise<Preloaded<Query>> {
  return preloadQueryConvex(
    query,
    {
      ...(typeof args == "object" ? args : {}),
      paginationOpts: { cursor: null, numItems: options.initialNumItems },
    } as any,
    { token: await convexAuthNextjsToken() }
  );
}
