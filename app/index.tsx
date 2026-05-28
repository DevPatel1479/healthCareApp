import { Redirect, Href } from "expo-router";
import { useEffect, useState } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { View, ActivityIndicator } from "react-native";

export default function Index() {
  const [route, setRoute] = useState<Href | null>(null); // ✅ FIX

  useEffect(() => {
    const checkAuth = async () => {
      try {

        const values = await AsyncStorage.multiGet([
          "isUserLoggedIn",
          "role",
        ]);

        const data = Object.fromEntries(values);

        const isLoggedIn = data.isUserLoggedIn === "true";
        const role = data.role;

        // NOT LOGGED IN
        if (!isLoggedIn) {
          setRoute("/(auth)/login");
          return;
        }

        // FAMILY LEAD -> PATIENT DASHBOARD
        if (role === "family_lead") {
          setRoute("/(patient)/dashboard");
          return;
        }

        // CAREGIVER -> SCANNER
        if (role === "caregiver") {
          setRoute("/(scanner)");
          return;
        }

        // FALLBACK
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