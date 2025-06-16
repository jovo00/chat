import FileUploads from "@/components/settings/file-uploads";
import { preloadPaginatedQuery } from "@/lib/convex/preload";
import { api } from "@gen/api";

export default async function AttachmentSettings() {
  const preloadedFiles = await preloadPaginatedQuery(api.files.get.many, {}, { initialNumItems: 50 });

  return <FileUploads preloadedFiles={preloadedFiles} />;
}
