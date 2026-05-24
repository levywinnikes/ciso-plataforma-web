import { Spinner } from "./spinner";
import { cn } from "./utils";

interface OverlayLoaderProps {
  message?: string;
  className?: string;
  isFullScreen?: boolean;
}

export function OverlayLoader({
  message,
  className,
  isFullScreen = false,
}: OverlayLoaderProps) {
  return (
    <div
      className={cn(
        "z-50 flex flex-col items-center justify-center bg-white/40 backdrop-blur-sm transition-all duration-300 animate-in fade-in",
        isFullScreen ? "fixed inset-0" : "absolute inset-0 rounded-xl",
        className,
      )}
    >
      <Spinner className="h-10 w-10 text-primary drop-shadow-md" />
      {message && (
        <p className="mt-4 text-sm font-semibold text-gray-800 shadow-white drop-shadow-sm">
          {message}
        </p>
      )}
    </div>
  );
}
