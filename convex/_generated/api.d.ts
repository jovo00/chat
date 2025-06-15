/* eslint-disable */
/**
 * Generated `api` utility.
 *
 * THIS CODE IS AUTOMATICALLY GENERATED.
 *
 * To regenerate, run `npx convex dev`.
 * @module
 */

import type * as auth from "../auth.js";
import type * as chat_context from "../chat/context.js";
import type * as chat_create from "../chat/create.js";
import type * as chat_delete from "../chat/delete.js";
import type * as chat_encoding from "../chat/encoding.js";
import type * as chat_generate from "../chat/generate.js";
import type * as chat_get from "../chat/get.js";
import type * as chat_incremental_updates from "../chat/incremental_updates.js";
import type * as chat_update from "../chat/update.js";
import type * as crons from "../crons.js";
import type * as delete_triggers from "../delete_triggers.js";
import type * as encryption from "../encryption.js";
import type * as files_actions from "../files/actions.js";
import type * as files_create from "../files/create.js";
import type * as files_delete from "../files/delete.js";
import type * as files_get from "../files/get.js";
import type * as http from "../http.js";
import type * as models_create from "../models/create.js";
import type * as models_delete from "../models/delete.js";
import type * as models_get from "../models/get.js";
import type * as models_openrouter from "../models/openrouter.js";
import type * as models_update from "../models/update.js";
import type * as preflight from "../preflight.js";
import type * as tokens_actions from "../tokens/actions.js";
import type * as tokens_get from "../tokens/get.js";
import type * as tokens_update from "../tokens/update.js";
import type * as users_delete from "../users/delete.js";
import type * as users_get from "../users/get.js";
import type * as users_update from "../users/update.js";

import type {
  ApiFromModules,
  FilterApi,
  FunctionReference,
} from "convex/server";

/**
 * A utility for referencing Convex functions in your app's API.
 *
 * Usage:
 * ```js
 * const myFunctionReference = api.myModule.myFunction;
 * ```
 */
declare const fullApi: ApiFromModules<{
  auth: typeof auth;
  "chat/context": typeof chat_context;
  "chat/create": typeof chat_create;
  "chat/delete": typeof chat_delete;
  "chat/encoding": typeof chat_encoding;
  "chat/generate": typeof chat_generate;
  "chat/get": typeof chat_get;
  "chat/incremental_updates": typeof chat_incremental_updates;
  "chat/update": typeof chat_update;
  crons: typeof crons;
  delete_triggers: typeof delete_triggers;
  encryption: typeof encryption;
  "files/actions": typeof files_actions;
  "files/create": typeof files_create;
  "files/delete": typeof files_delete;
  "files/get": typeof files_get;
  http: typeof http;
  "models/create": typeof models_create;
  "models/delete": typeof models_delete;
  "models/get": typeof models_get;
  "models/openrouter": typeof models_openrouter;
  "models/update": typeof models_update;
  preflight: typeof preflight;
  "tokens/actions": typeof tokens_actions;
  "tokens/get": typeof tokens_get;
  "tokens/update": typeof tokens_update;
  "users/delete": typeof users_delete;
  "users/get": typeof users_get;
  "users/update": typeof users_update;
}>;
declare const fullApiWithMounts: typeof fullApi;

export declare const api: FilterApi<
  typeof fullApiWithMounts,
  FunctionReference<any, "public">
>;
export declare const internal: FilterApi<
  typeof fullApiWithMounts,
  FunctionReference<any, "internal">
>;

export declare const components: {
  actionCache: {
    crons: {
      purge: FunctionReference<
        "mutation",
        "internal",
        { expiresAt?: number },
        null
      >;
    };
    lib: {
      get: FunctionReference<
        "query",
        "internal",
        { args: any; name: string; ttl: number | null },
        { kind: "hit"; value: any } | { expiredEntry?: string; kind: "miss" }
      >;
      put: FunctionReference<
        "mutation",
        "internal",
        {
          args: any;
          expiredEntry?: string;
          name: string;
          ttl: number | null;
          value: any;
        },
        null
      >;
      remove: FunctionReference<
        "mutation",
        "internal",
        { args: any; name: string },
        null
      >;
      removeAll: FunctionReference<
        "mutation",
        "internal",
        { batchSize?: number; before?: number; name?: string },
        null
      >;
    };
    public: {
      fetch: FunctionReference<
        "action",
        "internal",
        { args: any; expiration: number | null; fn: string; name: string },
        any
      >;
      remove: FunctionReference<
        "mutation",
        "internal",
        { args: any; name: string },
        null
      >;
      removeAll: FunctionReference<
        "mutation",
        "internal",
        { before?: number; name?: string },
        null
      >;
    };
  };
};
