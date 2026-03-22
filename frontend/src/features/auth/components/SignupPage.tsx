// src/features/auth/components/SignupPage.tsx
import { SignUp } from "@clerk/clerk-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/shared/components/ui/card";

export function SignupPage() {
  return (
    <div className="flex min-h-screen items-center justify-center px-4 py-10">
      <Card className="w-full max-w-5xl overflow-hidden border-white/60 bg-white/85 shadow-panel">
        <div className="grid min-h-[620px] md:grid-cols-[0.95fr_1.05fr]">
          <div className="flex items-center justify-center p-6 sm:p-10">
            <div className="w-full max-w-md space-y-6">
              <CardHeader className="px-0 pt-0">
                <CardTitle className="text-3xl">
                  Create your workspace
                </CardTitle>
                <CardDescription>
                  Set up your account and start organizing projects with a
                  clearer workflow.
                </CardDescription>
              </CardHeader>
              <CardContent className="px-0 pb-0">
                <SignUp afterSignUpUrl="/" />
              </CardContent>
            </div>
          </div>
          <div className="hidden bg-gradient-to-br from-sky-500 via-primary to-slate-950 p-10 text-white md:flex md:flex-col md:justify-between">
            <div className="space-y-4">
              <p className="text-sm font-medium uppercase tracking-[0.24em] text-white/80">
                Move fast without chaos
              </p>
              <h1 className="max-w-md text-4xl font-semibold leading-tight">
                A focused place for workspaces, project plans, and task flow.
              </h1>
            </div>
            <div className="rounded-[1.75rem] border border-white/15 bg-white/10 p-6 text-sm text-white/85">
              Start simple today. Add drag-and-drop execution once the team is
              in motion.
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
}
