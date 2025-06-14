import { cn, getErrorMessage } from "@/lib/utils";

export default function ErrorDisplay({ error, className }: { error: Error; className?: string }) {
  const message = getErrorMessage(error);

  return (
    <div className={cn("flex flex-col items-center justify-center", className)}>
      <h3 className="font-special text-lg text-red-500">Error</h3>
      <p className="text-center">{message}</p>
    </div>
  );
}
