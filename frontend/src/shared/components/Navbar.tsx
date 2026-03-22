import { UserButton } from "@clerk/clerk-react";
import { BriefcaseBusiness } from "lucide-react";
import { Link } from "react-router-dom";

export function Navbar() {
  return (
    <header className="sticky top-0 z-40 border-b border-white/60 bg-white/80 backdrop-blur-xl">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4 sm:px-6 lg:px-8">
        <Link
          to="/"
          className="flex items-center gap-3 font-semibold tracking-tight text-slate-900"
        >
          <span className="flex h-10 w-10 items-center justify-center rounded-2xl bg-primary text-primary-foreground shadow-sm">
            <BriefcaseBusiness className="h-5 w-5" />
          </span>
          <span className="text-lg">TeamFlow</span>
        </Link>
        <div className="flex items-center gap-3">
          <span className="hidden text-sm text-muted-foreground sm:inline">
            Organize work with clarity
          </span>
          <UserButton afterSignOutUrl="/login" />
        </div>
      </div>
    </header>
  );
}
