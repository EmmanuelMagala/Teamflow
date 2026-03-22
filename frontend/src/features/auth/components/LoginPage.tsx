// src/features/auth/components/LoginPage.tsx
import { SignIn } from "@clerk/clerk-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/shared/components/ui/card";

export function LoginPage() {
  return (
    <div className="flex min-h-screen items-center justify-center px-4 py-10">
      <Card className="w-full max-w-5xl overflow-hidden border-white/60 bg-white/85 shadow-panel">
        <div className="grid min-h-[620px] md:grid-cols-[1.05fr_0.95fr]">
          <div className="hidden bg-slate-950 p-10 text-slate-100 md:flex md:flex-col md:justify-between">
            <div className="space-y-4">
              <p className="text-sm font-medium uppercase tracking-[0.24em] text-sky-300">
                TeamFlow
              </p>
              <h1 className="max-w-md text-4xl font-semibold leading-tight">
                Keep projects, tasks, and team momentum in one calm workspace.
              </h1>
              <p className="max-w-md text-sm text-slate-300">
                A focused project workspace for moving from planning to
                execution without losing context.
              </p>
            </div>
            <div className="rounded-[1.75rem] border border-white/10 bg-white/5 p-6 text-sm text-slate-300">
              “The interface should disappear so the team can focus on the
              work.”
            </div>
          </div>
          <div className="flex items-center justify-center p-6 sm:p-10">
            <div className="w-full max-w-md space-y-6">
              <CardHeader className="px-0 pt-0">
                <CardTitle className="text-3xl">Welcome back</CardTitle>
                <CardDescription>
                  Sign in to access your workspaces and keep your board in sync.
                </CardDescription>
              </CardHeader>
              <CardContent className="px-0 pb-0">
                <SignIn afterSignInUrl="/" />
              </CardContent>
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
}
