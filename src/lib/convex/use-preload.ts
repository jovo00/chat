"use client";

import { PaginatedQueryArgs, Preloaded as PreloadedConvex } from "convex/react";
import { FunctionReference, makeFunctionReference } from "convex/server";
import { jsonToConvex } from "convex/values";
import { useMemo } from "react";
import { UsePaginatedQueryWithErrorReturnType, usePaginatedQuery } from "./use-paginated-query";
import { useQuery } from "./use-query";

export type Preloaded<Query extends FunctionReference<"query">> = {
  data: PreloadedConvex<Query>;
  error?: Error;
};

export function usePreloadedPaginatedQuery<Query extends FunctionReference<"query">>(
  preloadedQuery: Preloaded<Query>,
  customArgs?: Partial<PaginatedQueryArgs<Query>>,
): UsePaginatedQueryWithErrorReturnType<Query> {
  const args = useMemo(
    () => jsonToConvex(preloadedQuery.data._argsJSON),
    [preloadedQuery?.data?._argsJSON],
  ) as Query["_args"];
  const preloadedResult = useMemo(
    () => jsonToConvex(preloadedQuery.data._valueJSON),
    [preloadedQuery?.data?._valueJSON],
  );
  const result = usePaginatedQuery(
    makeFunctionReference(preloadedQuery.data._name) as Query,
    { ...args, ...customArgs },
    {
      initialNumItems: args?.paginationOpts?.numItems ?? 50,
    },
  );

  return result?.status === "LoadingFirstPage"
    ? {
        ...result,
        results: (preloadedResult as any)?.page ?? result?.results ?? [],
      }
    : result;
}

export function usePreloadedQuery<Query extends FunctionReference<"query">>(
  preloadedQuery: Preloaded<Query>,
): {
  data: Query["_returnType"];
  error?: Error;
  isError: boolean;
  isLoading: boolean;
} {
  const args = useMemo(
    () => jsonToConvex(preloadedQuery.data._argsJSON),
    [preloadedQuery.data._argsJSON],
  ) as Query["_args"];
  const preloadedResult = useMemo(
    () => ({
      data: jsonToConvex(preloadedQuery.data._valueJSON),
      error: preloadedQuery.error,
      isError: !!preloadedQuery.error,
      isLoading: false,
    }),
    [preloadedQuery.data._valueJSON],
  );
  const result = useQuery(makeFunctionReference(preloadedQuery.data._name) as Query, args);
  return result?.isLoading ? preloadedResult : result;
}
