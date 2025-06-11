import { ConvexError } from "convex/values";
import { action, internalAction, query } from "../_generated/server";
import { ActionCache } from "@convex-dev/action-cache";
import { components, internal } from "../_generated/api";
import { getUser } from "../users/get";

export type OpenRouterModel = {
  id: string;
  name: string;
  created: number;
  description: string;
  architecture: {
    input_modalities: string[];
    output_modalities: string[];
    instruct_type: string | null;
    tokenizer: string;
  };
  top_provider: {
    is_moderated: boolean;
    context_length: number;
    max_completion_tokens: number;
  };
  context_length: number | null;
  hugging_face_id: string | null;
  per_request_limits?: { [key: string]: any } | null;
  pricing: {
    prompt: string;
    completion: string;
    image: string;
    request: string;
    input_cache_read: string;
    input_cache_write: string;
    web_search: string;
    internal_reasoning: string;
  };
  supported_parameters: string[] | null;
};

export const fetchOpenRouterModels = internalAction(async () => {
  const url = `${process.env.OPENROUTER_API_URL}/models`;
  const res = await fetch(url);

  if (!res.ok) {
    return [];
  }

  const allModels: OpenRouterModel[] = (await res.json()).data;

  return allModels?.sort((a, b) => a.name.localeCompare(b.name));
});

const openRouterCache = new ActionCache(components.actionCache, {
  action: internal.models.openrouter.fetchOpenRouterModels,
  name: "openrouter-models",
  ttl: 1000 * 60 * 60 * 12, // 12 hours
});

export const getModels = action({
  handler: async (ctx): Promise<OpenRouterModel[]> => {
    const result = await openRouterCache.fetch(ctx, {});

    return result;
  },
});
