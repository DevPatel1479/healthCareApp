import { ENDPOINTS } from "@/api/endpoints";
import { io, Socket } from "socket.io-client";

let socket: Socket | null = null;

export const connectSocket = (caregiverId: number) => {
    if (socket && socket.connected) return socket;

    socket = io(ENDPOINTS.baseWebsocketApiRealTimeUpdates(), {
        transports: ["websocket"],
        reconnection: true,
        reconnectionAttempts: Infinity,

        reconnectionDelay: 1000,

        reconnectionDelayMax: 5000,

        timeout: 20000,
        forceNew: true,
    });

    socket.on("connect", () => {
        console.log("✅ Socket connected:", socket?.id);

        // 🔥 join room after connection
        socket?.emit("join_caregiver", caregiverId);
    });

    socket.on("disconnect", () => {
        console.log("❌ Socket disconnected");
    });

    socket.on("connect_error", (err) => {
        console.log("⚠️ Socket error:", err.message);
    });

    return socket;
};

export const connectPatientSocket = (patientId: number) => {
    if (socket && socket.connected) return socket;

    socket = io(ENDPOINTS.baseWebsocketApiRealTimeUpdates(), {
        transports: ["websocket"],
        reconnection: true,
        reconnectionAttempts: Infinity,
        reconnectionDelay: 1000,
        reconnectionDelayMax: 5000,
        timeout: 20000,
        forceNew: true,
    });

    socket.on("connect", () => {
        console.log("✅ Patient socket connected:", socket?.id);

        socket?.emit("join_patient", patientId); // 🔥 IMPORTANT
    });

    return socket;
};

export const getSocket = () => socket;

export const disconnectSocket = () => {
    if (!socket) return;

    console.log("🔌 Disconnecting socket...");

    // Prevent Socket.IO from automatically reconnecting
    socket.io.opts.reconnection = false;

    socket.removeAllListeners();

    socket.disconnect();

    socket = null;

    console.log("✅ Socket completely disconnected");
};