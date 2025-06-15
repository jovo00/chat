export function MessageStatus({
  status,
  statusMessage,
  cancelled,
}: {
  status?: string;
  statusMessage?: string;
  cancelled: boolean;
}) {
  if (status === "error") {
    return (
      <div className="inline-flex w-fit items-center justify-center gap-1 rounded-full bg-red-500/10 px-4 py-[0.15rem] text-sm font-medium text-red-500 select-none">
        <strong className="mr-1">ERROR</strong>
        {statusMessage ?? "Error while chat completion"}
      </div>
    );
  }

  if (cancelled) {
    return (
      <div className="bg-card inline-flex h-7 w-fit items-center justify-center gap-1 rounded-full px-4 py-[0.15rem] text-sm font-medium text-white/50 select-none">
        Generation Stopped
      </div>
    );
  }

  return null;
}
