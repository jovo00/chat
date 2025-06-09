"use client";

import { convexAuthNextjsToken } from "@convex-dev/auth/nextjs/server";
import { EmptyObject } from "convex-helpers";
import { NextjsOptions, preloadQuery as preloadQueryConvex } from "convex/nextjs";
import { PaginatedQueryArgs, Preloaded, usePaginatedQuery, UsePaginatedQueryReturnType, useQuery } from "convex/react";
import { ArgsAndOptions, FunctionReference, makeFunctionReference, Query } from "convex/server";
import { jsonToConvex } from "convex/values";
import { useMemo } from "react";

export function usePreloadedPaginatedQuery<Query extends FunctionReference<"query">>(
  preloadedQuery: Preloaded<Query>,
  customArgs?: Partial<PaginatedQueryArgs<Query>>,
): UsePaginatedQueryReturnType<Query> {
  const args = useMemo(() => jsonToConvex(preloadedQuery._argsJSON), [preloadedQuery._argsJSON]) as Query["_args"];
  const preloadedResult = useMemo(() => jsonToConvex(preloadedQuery._valueJSON), [preloadedQuery._valueJSON]);
  const result = usePaginatedQuery(
    makeFunctionReference(preloadedQuery._name) as Query,
    { ...args, ...customArgs },
    {
      initialNumItems: args?.paginationOpts?.numItems ?? 50,
    },
  );

  return result?.status === "LoadingFirstPage"
    ? {
        ...result,
        results: (preloadedResult as any)?.page ?? result?.results,
      }
    : result;
}
