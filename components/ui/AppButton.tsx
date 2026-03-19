// src/components/ui/AppButton.tsx

import {
    ActivityIndicator,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from "react-native";

export default function AppButton({
  title,
  onPress,
  loading,
  disabled,
  arrow = true,
}: any) {
  return (
    <TouchableOpacity
      style={[
        styles.button,
        (disabled || loading) && styles.disabled,
      ]}
      onPress={onPress}
      disabled={disabled || loading}
      activeOpacity={0.8}
    >
      {loading ? (
        <ActivityIndicator color="#fff" />
      ) : (
        <View style={styles.row}>
          <Text style={styles.text}>{title}</Text>
          {arrow && <Text style={styles.arrow}>→</Text>}
        </View>
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  button: {
    backgroundColor: "#ef4444",
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
  },

  disabled: {
    opacity: 0.5,
  },

  row: {
    flexDirection: "row",
    alignItems: "center",
  },

  text: {
    color: "#fff",
    fontSize: 15,
    fontWeight: "700",
  },

  arrow: {
    color: "#fff",
    marginLeft: 6,
    fontSize: 16,
  },
});