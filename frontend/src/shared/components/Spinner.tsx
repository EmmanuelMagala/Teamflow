import { LoaderCircle } from "lucide-react";

export function Spinner() {
  return (
    <div className="flex h-32 items-center justify-center">
      <LoaderCircle className="h-8 w-8 animate-spin text-primary" />
    </div>
  );
}
