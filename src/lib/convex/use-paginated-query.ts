import {
  PaginatedQueryArgs,
  PaginatedQueryReference,
  useConvex,
  UsePaginatedQueryReturnType,
  useQueries,
} from "convex/react";
import { FunctionReference, getFunctionName, paginationOptsValidator, PaginationResult } from "convex/server";
import { ConvexError, convexToJson, Infer, Value } from "convex/values";
import { useMemo, useState } from "react";

type QueryPageKey = number;

type UsePaginatedQueryState = {
  query: FunctionReference<"query">;
  args: Record<string, Value>;
  id: number;
  nextPageKey: QueryPageKey;
  pageKeys: QueryPageKey[];
  queries: Record<
    QueryPageKey,
    {
      query: FunctionReference<"query">;
      // Use the validator type as a test that it matches the args
      // we generate.
      args: { paginationOpts: Infer<typeof paginationOptsValidator> };
    }
  >;
  ongoingSplits: Record<QueryPageKey, [QueryPageKey, QueryPageKey]>;
  skip: boolean;
};

export type UsePaginatedQueryWithErrorReturnType<Query extends PaginatedQueryReference> =
  | (UsePaginatedQueryReturnType<Query> & { isError: false; error: null })
  | {
      results: [];
      status: "Error";
      isLoading: false;
      loadMore: (numItems: number) => void;
      isError: true;
      error: Error;
    };

let paginationId = 0;

function nextPaginationId(): number {
  paginationId++;
  return paginationId;
}

/**
 * Reset pagination id for tests only, so tests know what it is.
 */
export function resetPaginationId() {
  paginationId = 0;
}

export function usePaginatedQuery<Query extends PaginatedQueryReference>(
  query: Query,
  args: PaginatedQueryArgs<Query> | "skip",
  options: { initialNumItems: number },
): UsePaginatedQueryWithErrorReturnType<Query> {
  if (typeof options?.initialNumItems !== "number" || options.initialNumItems < 0) {
    return {
      results: [],
      status: "Error",
      isLoading: false,
      loadMore: () => {},
      isError: true,
      error: new Error(
        `\`options.initialNumItems\` must be a positive number. Received \`${options?.initialNumItems}\`.`,
      ),
    };
  }

  const skip = args === "skip";
  const argsObject = skip ? {} : args;
  const queryName = getFunctionName(query);
  const createInitialState = useMemo(() => {
    return () => {
      const id = nextPaginationId();
      return {
        query,
        args: argsObject as Record<string, Value>,
        id,
        nextPageKey: 1,
        pageKeys: skip ? [] : [0],
        queries: skip
          ? ({} as UsePaginatedQueryState["queries"])
          : {
              0: {
                query,
                args: {
                  ...argsObject,
                  paginationOpts: {
                    numItems: options.initialNumItems,
                    cursor: null,
                    id,
                  },
                },
              },
            },
        ongoingSplits: {},
        skip,
      };
    };
    // ESLint doesn't like that we're stringifying the args. We do this because
    // we want to avoid rerendering if the args are a different
    // object that serializes to the same result.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    // eslint-disable-next-line react-hooks/exhaustive-deps
    JSON.stringify(convexToJson(argsObject as Value)),
    queryName,
    options.initialNumItems,
    skip,
  ]);

  const [state, setState] = useState<UsePaginatedQueryState>(createInitialState);

  // `currState` is the state that we'll render based on.
  let currState = state;
  if (
    getFunctionName(query) !== getFunctionName(state.query) ||
    JSON.stringify(convexToJson(argsObject as Value)) !== JSON.stringify(convexToJson(state.args)) ||
    skip !== state.skip
  ) {
    currState = createInitialState();
    setState(currState);
  }
  const convexClient = useConvex();
  const logger = convexClient.logger;

  const resultsObject = useQueries(currState.queries);

  const [results, maybeLastResult, error]: [Value[], undefined | PaginationResult<Value>, Error | null] =
    useMemo(() => {
      let currResult = undefined;

      const allItems = [];
      for (const pageKey of currState.pageKeys) {
        currResult = resultsObject[pageKey];
        if (currResult === undefined) {
          break;
        }

        if (currResult instanceof Error) {
          if (
            currResult.message.includes("InvalidCursor") ||
            (currResult instanceof ConvexError &&
              typeof currResult.data === "object" &&
              currResult.data?.isConvexSystemError === true &&
              currResult.data?.paginationError === "InvalidCursor")
          ) {
            // - InvalidCursor: If the cursor is invalid, probably the paginated
            // database query was data-dependent and changed underneath us. The
            // cursor in the params or journal no longer matches the current
            // database query.

            // In all cases, we want to restart pagination to throw away all our
            // existing cursors.
            logger.warn("usePaginatedQuery hit error, resetting pagination state: " + currResult.message);
            setState(createInitialState);
            return [[], undefined, null];
          } else {
            return [[], undefined, currResult];
          }
        }
        const ongoingSplit = currState.ongoingSplits[pageKey];
        if (ongoingSplit !== undefined) {
          if (resultsObject[ongoingSplit[0]] !== undefined && resultsObject[ongoingSplit[1]] !== undefined) {
            // Both pages of the split have results now. Swap them in.
            setState(completeSplitQuery(pageKey));
          }
        } else if (
          currResult.splitCursor &&
          (currResult.pageStatus === "SplitRecommended" ||
            currResult.pageStatus === "SplitRequired" ||
            currResult.page.length > options.initialNumItems * 2)
        ) {
          // If a single page has more than double the expected number of items,
          // or if the server requests a split, split the page into two.
          setState(splitQuery(pageKey, currResult.splitCursor, currResult.continueCursor));
        }
        if (currResult.pageStatus === "SplitRequired") {
          // If pageStatus is 'SplitRequired', it means the server was not able to
          // fetch the full page. So we stop results before the incomplete
          // page and return 'LoadingMore' while the page is splitting.
          return [allItems, undefined, null];
        }
        allItems.push(...currResult.page);
      }
      return [allItems, currResult, null];
    }, [
      resultsObject,
      currState.pageKeys,
      currState.ongoingSplits,
      options.initialNumItems,
      createInitialState,
      logger,
    ]);

  const statusObject = useMemo(() => {
    if (maybeLastResult === undefined) {
      if (currState.nextPageKey === 1) {
        return {
          status: "LoadingFirstPage",
          isLoading: true,
          loadMore: (_numItems: number) => {
            // Intentional noop.
          },
        } as const;
      } else {
        return {
          status: "LoadingMore",
          isLoading: true,
          loadMore: (_numItems: number) => {
            // Intentional noop.
          },
        } as const;
      }
    }
    if (maybeLastResult.isDone) {
      return {
        status: "Exhausted",
        isLoading: false,
        loadMore: (_numItems: number) => {
          // Intentional noop.
        },
      } as const;
    }
    const continueCursor = maybeLastResult.continueCursor;
    let alreadyLoadingMore = false;
    return {
      status: "CanLoadMore",
      isLoading: false,
      loadMore: (numItems: number) => {
        if (!alreadyLoadingMore) {
          alreadyLoadingMore = true;
          setState((prevState) => {
            const pageKeys = [...prevState.pageKeys, prevState.nextPageKey];
            const queries = { ...prevState.queries };
            queries[prevState.nextPageKey] = {
              query: prevState.query,
              args: {
                ...prevState.args,
                paginationOpts: {
                  numItems,
                  cursor: continueCursor,
                  id: prevState.id,
                },
              },
            };
            return {
              ...prevState,
              nextPageKey: prevState.nextPageKey + 1,
              pageKeys,
              queries,
            };
          });
        }
      },
    } as const;
  }, [maybeLastResult, currState.nextPageKey]);

  if (error) {
    return {
      results: [],
      status: "Error",
      isLoading: false,
      loadMore: () => {},
      isError: true,
      error,
    };
  }

  return {
    results,
    isError: false,
    error: null,
    ...statusObject,
  };
}

const completeSplitQuery = (key: QueryPageKey) => (prevState: UsePaginatedQueryState) => {
  const completedSplit = prevState.ongoingSplits[key];
  if (completedSplit === undefined) {
    return prevState;
  }
  const queries = { ...prevState.queries };
  delete queries[key];
  const ongoingSplits = { ...prevState.ongoingSplits };
  delete ongoingSplits[key];
  let pageKeys = prevState.pageKeys.slice();
  const pageIndex = prevState.pageKeys.findIndex((v) => v === key);
  if (pageIndex >= 0) {
    pageKeys = [
      ...prevState.pageKeys.slice(0, pageIndex),
      ...completedSplit,
      ...prevState.pageKeys.slice(pageIndex + 1),
    ];
  }
  return {
    ...prevState,
    queries,
    pageKeys,
    ongoingSplits,
  };
};

const splitQuery =
  (key: QueryPageKey, splitCursor: string, continueCursor: string) => (prevState: UsePaginatedQueryState) => {
    const queries = { ...prevState.queries };
    const splitKey1 = prevState.nextPageKey;
    const splitKey2 = prevState.nextPageKey + 1;
    const nextPageKey = prevState.nextPageKey + 2;
    queries[splitKey1] = {
      query: prevState.query,
      args: {
        ...prevState.args,
        paginationOpts: {
          ...prevState.queries[key].args.paginationOpts,
          endCursor: splitCursor,
        },
      },
    };
    queries[splitKey2] = {
      query: prevState.query,
      args: {
        ...prevState.args,
        paginationOpts: {
          ...prevState.queries[key].args.paginationOpts,
          cursor: splitCursor,
          endCursor: continueCursor,
        },
      },
    };
    const ongoingSplits = { ...prevState.ongoingSplits };
    ongoingSplits[key] = [splitKey1, splitKey2];
    return {
      ...prevState,
      nextPageKey,
      queries,
      ongoingSplits,
    };
  };
