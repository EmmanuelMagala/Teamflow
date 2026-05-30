type ClerkWindow = Window & {
  Clerk?: {
    session?: {
      getToken: () => Promise<string | null>;
    };
  };
};

export const getClerkToken = async () => {
  return (window as ClerkWindow).Clerk?.session?.getToken() ?? null;
};
