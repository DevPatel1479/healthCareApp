import { Redirect, Href } from "expo-router";
import { useEffect, useState } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { View, ActivityIndicator } from "react-native";

export default function Index() {
  const [route, setRoute] = useState<Href | null>(null); // ✅ FIX

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const userData = await AsyncStorage.getItem("user");

        if (userData) {
          const user = JSON.parse(userData);

          if (user?.isLoggedIn) {
            if (user.role === "patient") {
              setRoute("/(patient)/dashboard");
            } else {
              setRoute("/(scanner)");
            }
            return;
          }
        }

        setRoute("/(auth)/login");

      } catch (e) {
        console.log("Auth check error", e);
        setRoute("/(auth)/login");
      }
    };

    checkAuth();
  }, []);

  if (!route) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  return <Redirect href={route} />;
}