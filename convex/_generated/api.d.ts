/* eslint-disable */
/**
 * Generated `api` utility.
 *
 * THIS CODE IS AUTOMATICALLY GENERATED.
 *
 * To regenerate, run `npx convex dev`.
 * @module
 */

import type {
  ApiFromModules,
  FilterApi,
  FunctionReference,
} from "convex/server";
import type * as auth from "../auth.js";
import type * as errors from "../errors.js";
import type * as files_create_file from "../files/create_file.js";
import type * as files_delete_files from "../files/delete_files.js";
import type * as files_delete_triggers from "../files/delete_triggers.js";
import type * as files_get_file from "../files/get_file.js";
import type * as http from "../http.js";
import type * as tokens_get_tokens from "../tokens/get_tokens.js";
import type * as tokens_modify_tokens from "../tokens/modify_tokens.js";
import type * as users_delete from "../users/delete.js";
import type * as users_delete_triggers from "../users/delete_triggers.js";
import type * as users_update from "../users/update.js";
import type * as users_user from "../users/user.js";

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
  errors: typeof errors;
  "files/create_file": typeof files_create_file;
  "files/delete_files": typeof files_delete_files;
  "files/delete_triggers": typeof files_delete_triggers;
  "files/get_file": typeof files_get_file;
  http: typeof http;
  "tokens/get_tokens": typeof tokens_get_tokens;
  "tokens/modify_tokens": typeof tokens_modify_tokens;
  "users/delete": typeof users_delete;
  "users/delete_triggers": typeof users_delete_triggers;
  "users/update": typeof users_update;
  "users/user": typeof users_user;
}>;
export declare const api: FilterApi<
  typeof fullApi,
  FunctionReference<any, "public">
>;
export declare const internal: FilterApi<
  typeof fullApi,
  FunctionReference<any, "internal">
>;
