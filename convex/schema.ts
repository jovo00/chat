import { defineSchema, defineTable } from "convex/server";
import { authTables } from "@convex-dev/auth/server";
import { v } from "convex/values";

export const tokenProviders = v.union(v.literal("openrouter"), v.literal("replicate"));
export const apiProviders = v.union(v.literal("openrouter"), v.literal("replicate"));
export const modelProviders = v.union(
  v.literal("openai"),
  v.literal("google"),
  v.literal("replicate"),
  v.literal("xai"),
  v.literal("deepseek"),
  v.literal("anthropic"),
  v.literal("meta"),
  v.literal("mistral")
);

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
    provider: modelProviders,
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
      })
    ),
  })
    .index("by_api_id", ["api_id"])
    .index("by_title", ["title"]),

  chats: defineTable({
    user: v.id("users"),
    title: v.string(),
    prompt_short: v.string(),
    last_modified: v.number(),
  }).index("by_user", ["user"]),

  messages: defineTable({
    user: v.id("users"),
    chat: v.id("chats"),
    status: v.union(v.literal("success"), v.literal("error"), v.literal("generating"), v.literal("cancelled")),
    status_message: v.optional(v.string()),
    model: v.id("models"),
    role: v.union(v.literal("user"), v.literal("assistant")),
    hide: v.boolean(),
    files: v.array(v.id("files")),
    content: v.optional(v.string()),
    reasoning: v.optional(v.string()),
    annotations: v.optional(v.array(v.any())),
  }).index("by_user", ["user"]),

  files: defineTable({
    user: v.id("users"),
    file: v.string(),
    size: v.number(),
  }).index("by_user", ["user"]),
});
