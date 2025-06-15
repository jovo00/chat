import { ConvexError, v } from "convex/values";
import { action, internalAction, internalMutation, mutation, query } from "../_generated/server";
import { ActionCache } from "@convex-dev/action-cache";
import { api, components, internal } from "../_generated/api";
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
  ttl: 1000 * 60 * 60, // 1 hour
});

export const getModels = action({
  handler: async (ctx): Promise<OpenRouterModel[]> => {
    const result = await openRouterCache.fetch(ctx, {});

    return result;
  },
});

export const updateModelInfo = internalAction({
  args: {},
  async handler(ctx, args) {
    const openrouterModels = await ctx.runAction(api.models.openrouter.getModels);
    await ctx.runMutation(internal.models.openrouter.mutateModelInfo, {
      models: openrouterModels,
    });
  },
});

export const mutateModelInfo = internalMutation({
  args: {
    models: v.array(v.any()),
  },
  async handler(ctx, args) {
    const openrouterModels = args.models as OpenRouterModel[];

    const models = await ctx.db
      .query("models")
      .withIndex("by_api", (q) => q.eq("api", "openrouter"))
      .collect();

    await Promise.allSettled(
      openrouterModels.map((openrouterModel) => {
        const model = models.find((m) => m.api_id === openrouterModel.id);
        if (!model) return Promise.resolve();

        return ctx.db.patch(model?._id, {
          text_capabilities: {
            max_input_tokens: openrouterModel.context_length ?? 0,
            features: {
              text_input: openrouterModel.architecture.input_modalities.includes("text"),
              image_input: openrouterModel.architecture.input_modalities.includes("image"),
              file_input: openrouterModel.architecture.input_modalities.includes("file"),
              tools_input:
                (openrouterModel.supported_parameters?.includes("tools") &&
                  openrouterModel.supported_parameters?.includes("tool_choice")) ??
                false,
              reasoning_output: openrouterModel.supported_parameters?.includes("reasoning") ?? false,
            },
            pricing: {
              completion: parseFloat(openrouterModel.pricing.completion),
              image: parseFloat(openrouterModel.pricing.image),
              prompt: parseFloat(openrouterModel.pricing.prompt),
              request: parseFloat(openrouterModel.pricing.request),
              web_search: parseFloat(openrouterModel.pricing.web_search),
            },
            tokenizer: openrouterModel.architecture.tokenizer,
          },
        });
      }),
    );
  },
});
