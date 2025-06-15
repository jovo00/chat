import { cn } from "@/lib/utils";

export default function Loader({ small }: { small?: boolean }) {
  return (
    <div
      className={cn(
        "bounce-loader absolute top-1/2 left-1/2 flex size-16 -translate-x-1/2 -translate-y-1/2 items-center justify-center gap-1 opacity-80",
        small && "size-10",
      )}
    >
      <div className={cn("bounce-loader-1 size-1.5 rounded-full bg-white", small && "size-1")}></div>
      <div className={cn("bounce-loader-2 size-1.5 rounded-full bg-white", small && "size-1")}></div>
      <div className={cn("bounce-loader-3 size-1.5 rounded-full bg-white", small && "size-1")}></div>
    </div>
  );
}
