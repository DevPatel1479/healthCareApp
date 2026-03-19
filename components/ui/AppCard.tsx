// src/components/ui/AppCard.tsx
import { StyleSheet, View } from "react-native";

export default function AppCard({ children }: any) {
  return <View style={styles.card}>{children}</View>;
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: "rgba(255,255,255,0.7)",
    padding: 20,
    borderRadius: 16,
    elevation: 5,
  },
});