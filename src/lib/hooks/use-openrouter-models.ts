"use client";

import { api } from "@gen/api";
import { useAction } from "convex/react";
import { useEffect, useState } from "react";
import { OpenRouterModel } from "../../../convex/models/openrouter";

export function useOpenRouterModels({ onError }: { onError?: (message: string) => void }) {
  const getOpenRouterModels = useAction(api.models.openrouter.getModels);
  const [data, setData] = useState<OpenRouterModel[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  async function loadOpenRouterModels() {
    setIsLoading(true);
    try {
      setData(await getOpenRouterModels());
    } catch (err) {
      onError?.("Unable to load models from OpenRouter");
    }
    setIsLoading(false);
  }
  useEffect(() => {
    loadOpenRouterModels();
  }, []);

  return {
    data,
    isLoading,
  };
}
