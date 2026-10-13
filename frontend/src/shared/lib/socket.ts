import { io } from "socket.io-client";

const apiUrl = import.meta.env.VITE_API_URL ?? "";

const SOCKET_URL = apiUrl.replace(/\/api\/?$/, "");

export const socket = io(SOCKET_URL, {
  autoConnect: false,
  transports: ["websocket", "polling"],
  withCredentials: true,
});
