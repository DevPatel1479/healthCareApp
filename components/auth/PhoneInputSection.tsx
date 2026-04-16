// src/components/auth/PhoneInputSection.tsx

import { StyleSheet, Text, View } from "react-native";
import AppButton from "../ui/AppButton";
import AppInput from "../ui/AppInput";
import { useState } from "react";

export default function PhoneInputSection({
  phone,
  setPhone,
  onSend,
  loading,
}: any) {
  const isValid = phone.replace(/\D/g, "").length === 10;
  const [activeType, setActiveType] = useState<"sms" | "whatsapp" | null>(null);

  return (
    <View>
      {/* Label */}
      <Text style={styles.label}>Mobile Number</Text>

      {/* Input with prefix (UNCHANGED — stable) */}
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

      {/* 🔥 Two Buttons */}
      <View style={styles.buttonRow}>
        <View style={{ flex: 1 }}>
          <AppButton
            title="SMS OTP"
            onPress={() => {
              setActiveType("sms");
              onSend("sms");
            }}
            loading={loading && activeType === "sms"}
            disabled={!isValid || loading}
          />
        </View>

        <View style={{ flex: 1 }}>
          <AppButton
            title="WhatsApp OTP"
            onPress={() => {
              setActiveType("whatsapp");
              onSend("whatsapp");
            }}
            loading={loading && activeType === "whatsapp"}
            disabled={!isValid || loading}
          />
        </View>
      </View>

      {/* Hint */}
      <Text style={styles.hint}>
        Choose how you want to receive OTP
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
    paddingLeft: 45,
  },

  buttonRow: {
    flexDirection: "row",
    gap: 10,
  },

  hint: {
    fontSize: 12,
    color: "#999",
    textAlign: "center",
    marginTop: 12,
  },
});