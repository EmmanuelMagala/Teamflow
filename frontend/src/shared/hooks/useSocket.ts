import { useAuth } from "@clerk/clerk-react";
import { useEffect } from "react";
import { getClerkToken } from "@/shared/lib/clerkAuth";
import { socket } from "@/shared/lib/socket";

export const useSocket = () => {
  const { isLoaded, isSignedIn } = useAuth();

  useEffect(() => {
    if (!isLoaded) {
      return;
    }

    if (!isSignedIn) {
      socket.disconnect();
      socket.auth = {};
      return;
    }

    let cancelled = false;

    const connectSocket = async () => {
      const token = await getClerkToken();

      if (!token || cancelled) {
        return;
      }

      socket.auth = { token };

      if (!socket.connected) {
        socket.connect();
      }
    };

    void connectSocket();

    return () => {
      cancelled = true;
    };
  }, [isLoaded, isSignedIn]);

  return socket;
};
