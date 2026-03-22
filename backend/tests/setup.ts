import { vi } from "vitest";

process.env.NODE_ENV = "test";
process.env.CLERK_SECRET_KEY ??= "test_clerk_secret";
process.env.CLIENT_URL ??= "http://localhost:3000";
process.env.DATABASE_URL ??=
  "postgres://postgres:postgres@localhost:5432/teamflow_test";
process.env.PORT ??= "5000";

vi.mock("@clerk/express", () => {
  return {
    clerkMiddleware: () => {
      return (req: any, _res: any, next: () => void) => {
        req.__testAuth = {
          userId: req.header("x-test-user-id") ?? null,
        };

        next();
      };
    },
    getAuth: (req: any) => req.__testAuth ?? { userId: null },
  };
});
