import axios from "axios";
import { router } from "expo-router";
import { tokenStorage } from "./tokenStorage";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { disconnectSocket } from "@/services/socket";

const API_BASE_URL = "https://kutumbijan.com/api/v2";




export const apiClient = axios.create({
    baseURL: API_BASE_URL,
    headers: {
        "Content-Type": "application/json",
    },
});






export const publicApiClient = axios.create({
    baseURL: API_BASE_URL,
    headers: {
        "Content-Type": "application/json",
    },
});


const logApiError = (error: any) => {
    console.log("\n========== AXIOS ERROR ==========");
    console.log("URL:", error.config?.url);
    console.log("METHOD:", error.config?.method?.toUpperCase());
    console.log("BASE URL:", error.config?.baseURL);
    console.log(
        "FULL URL:",
        `${error.config?.baseURL ?? ""}${error.config?.url ?? ""}`
    );
    console.log("STATUS:", error.response?.status);
    console.log("RESPONSE DATA:", error.response?.data);
    console.log("=================================\n");

    return Promise.reject(error);
};

apiClient.interceptors.response.use(
    (response) => response,
    logApiError
);

publicApiClient.interceptors.response.use(
    (response) => response,
    logApiError
);

// Add JWT automatically to every authenticated request
apiClient.interceptors.request.use(
    async (config) => {
        const token = await tokenStorage.get();

        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        // console.log(config);
        return config;
    },
    (error) => {
        console.log("API ERROR:", {
            url: error.config?.url,
            method: error.config?.method,
            baseURL: error.config?.baseURL,
            status: error.response?.status,
            data: error.response?.data,
        });

        return Promise.reject(error);
    }
);

// Prevent multiple simultaneous logout operations
let isLoggingOut = false;

const handleAuthenticationFailure = async () => {
    if (isLoggingOut) {
        return;
    }

    isLoggingOut = true;

    try {
        console.log("🔐 Authentication failed. Logging out...");
        disconnectSocket();
        // Remove JWT from your token storage
        await tokenStorage.remove();

        // Clear other locally stored authentication/user information
        await AsyncStorage.clear();

        // Redirect to login
        router.replace("/(auth)/login");
    } catch (error) {
        console.error("Logout cleanup failed:", error);
    } finally {
        isLoggingOut = false;
    }
};

// Handle expired/invalid JWT globally
apiClient.interceptors.response.use(
    (response) => response,

    async (error) => {
        console.log("\n========== API ERROR ==========");
        console.log("URL:", error.config?.url);
        console.log("METHOD:", error.config?.method?.toUpperCase());
        console.log("BASE URL:", error.config?.baseURL);
        console.log("FULL URL:", `${error.config?.baseURL ?? ""}${error.config?.url ?? ""}`);
        console.log("STATUS:", error.response?.status);
        console.log("RESPONSE:", JSON.stringify(error.response?.data, null, 2));
        console.log("===============================\n");
        if (error.response?.status === 401) {
            await handleAuthenticationFailure();
        }

        return Promise.reject(error);
    }
);