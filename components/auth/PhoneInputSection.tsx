// src/components/auth/PhoneInputSection.tsx

import { StyleSheet, Text, View } from "react-native";
import AppButton from "../ui/AppButton";
import AppInput from "../ui/AppInput";

export default function PhoneInputSection({
  phone,
  setPhone,
  onSend,
  loading,
}: any) {
  const isValid = phone.replace(/\D/g, "").length === 10;

  return (
    <View>
      {/* Label */}
      <Text style={styles.label}>Mobile Number</Text>

      {/* Input with prefix */}
      <View style={styles.inputWrap}>
        <Text style={styles.prefix}>+91</Text>

        <AppInput
          placeholder="00000 00000"
          keyboardType="number-pad"
          value={phone}
          onChangeText={(text: string) =>
            setPhone(text.replace(/\D/g, "").slice(0, 10))
          }
          style={styles.input}
          maxLength={10}
        />
      </View>

      {/* Button */}
      <AppButton
        title="Send OTP"
        onPress={onSend}
        loading={loading}
        disabled={!isValid || loading}
      />

      {/* Hint */}
      <Text style={styles.hint}>
        We'll send a 6-digit code to verify your number
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  label: {
    fontSize: 12,
    fontWeight: "600",
    color: "#666",
    marginBottom: 6,
  },

  inputWrap: {
    position: "relative",
    marginBottom: 15,
  },

  prefix: {
    position: "absolute",
    left: 12,
    top: 14,
    zIndex: 1,
    fontWeight: "600",
    color: "#666",
  },

  input: {
    paddingLeft: 45, // space for +91
  },

  hint: {
    fontSize: 12,
    color: "#999",
    textAlign: "center",
    marginTop: 12,
  },
});