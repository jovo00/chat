"use client";

import { api } from "@gen/api";
import { useEffect, useState } from "react";
import { OpenRouterModel } from "../../../convex/models/openrouter";
import { useAction } from "../convex/use-action";

export function useOpenRouterModels({ onError }: { onError?: (message: string) => void }) {
  const [data, setData] = useState<OpenRouterModel[]>([]);
  const getOpenRouterModels = useAction(api.models.openrouter.getModels, {
    onSuccess(result) {
      setData(result);
    },
    onError(e) {
      onError?.("Unable to load models from OpenRouter");
    },
  });

  useEffect(() => {
    getOpenRouterModels.run();
  }, []);

  return {
    data,
    isPending: getOpenRouterModels.isPending,
  };
}
