import AdminModels from "@/components/settings/admin-models";
import { preloadPaginatedQuery } from "@/lib/convex/preload";
import { api } from "@gen/api";
import { useAction } from "convex/react";

export default async function FileUploadSettings() {
  const preloadedModels = await preloadPaginatedQuery(api.models.get.many, {}, { initialNumItems: 50 });

  return (
    <>
      <AdminModels preloadedModels={preloadedModels} />
    </>
  );
}
