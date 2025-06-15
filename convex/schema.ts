import { defineSchema, defineTable } from "convex/server";
import { authTables as allAuthTables } from "@convex-dev/auth/server";
import { v } from "convex/values";

export const tokenProviders = v.union(v.literal("openrouter"));
export const apiProviders = v.union(v.literal("openrouter"));
export const messageStatus = v.union(
  v.literal("done"),
  v.literal("error"),
  v.literal("pending"),
  v.literal("generating"),
);

const { users, ...authTables } = allAuthTables;

export default defineSchema({
  ...authTables,

  users: defineTable({
    name: v.optional(v.string()),
    image: v.optional(v.string()),
    email: v.optional(v.string()),
    emailVerificationTime: v.optional(v.number()),
    phone: v.optional(v.string()),
    phoneVerificationTime: v.optional(v.number()),
    isAnonymous: v.optional(v.boolean()),

    role: v.optional(v.union(v.literal("admin"))),
  })
    .index("email", ["email"])
    .index("phone", ["phone"]),

  tokens: defineTable({
    provider: tokenProviders,
    user: v.id("users"),
    token: v.string(),
  }).index("by_user_and_provider", ["user", "provider"]),

  models: defineTable({
    api: apiProviders,
    api_id: v.string(),
    title: v.string(),
    text_capabilities: v.optional(
      v.object({
        max_input_tokens: v.number(),
        pricing: v.object({
          completion: v.number(),
          image: v.number(),
          prompt: v.number(),
          request: v.number(),
          web_search: v.number(),
        }),
        tokenizer: v.string(),
        features: v.object({
          text_input: v.boolean(),
          image_input: v.boolean(),
          file_input: v.boolean(),
          tools_input: v.boolean(),
          reasoning_output: v.boolean(),
        }),
      }),
    ),
  })
    .index("by_api", ["api"])
    .index("by_title", ["title"]),

  chats: defineTable({
    user: v.id("users"),
    title: v.optional(v.string()),
    prompt_short: v.string(),
    latest_message: v.optional(v.id("messages")),
    latest_message_status: v.optional(messageStatus),
    pinned: v.boolean(),
  })
    .index("by_user_and_pinned", ["user", "pinned"])
    .index("by_chat_and_latest_message_status", ["user", "latest_message_status"]),

  messages: defineTable({
    user: v.id("users"),
    chat: v.id("chats"),
    prompt: v.string(),
    status: messageStatus,
    status_message: v.optional(v.string()),
    cancelled: v.boolean(),
    model: v.id("models"),
    hide_prompt: v.boolean(),
    hide_content: v.boolean(),
    files: v.array(v.id("files")),
    online: v.boolean(),
    content: v.optional(v.string()),
    reasoning: v.optional(v.string()),
    annotations: v.optional(v.array(v.any())),
  })
    .index("by_user_and_chat", ["user", "chat"])
    .index("by_chat", ["chat"]),

  files: defineTable({
    storage: v.id("_storage"),
    name: v.string(),
    user: v.id("users"),
  }).index("by_user", ["user"]),
});
