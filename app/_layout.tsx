import { Stack } from "expo-router";
import { useEffect } from "react";

export default function Layout() {
  useEffect(() => {
    console.log("🚀 Root mounted");
  }, []);
  return <Stack screenOptions={{ headerShown: false }} />;
}