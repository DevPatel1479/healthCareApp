import { useRef } from "react";
import {
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from "react-native";
import AppButton from "../ui/AppButton";

export default function OtpSection({
  otp,
  setOtp,
  onVerify,
  phone,
  onBack,
}: any) {
  const inputs = useRef<TextInput[]>([]);

  const digits = otp.split("").concat(Array(6).fill("")).slice(0, 6);

  const handleChange = (text: string, index: number) => {
    const clean = text.replace(/\D/g, "");

    if (!clean) {
      // clear current box
      const newOtp = [...digits];
      newOtp[index] = "";
      setOtp(newOtp.join(""));
      return;
    }

    // always take last digit (important fix)
    const value = clean.slice(-1);

    const newOtp = [...digits];
    newOtp[index] = value;

    setOtp(newOtp.join(""));

    // 🚀 always move forward after typing
    if (index < 5) {
      inputs.current[index + 1]?.focus();
    }
  };

  const handleKeyPress = (e: any, index: number) => {
    if (e.nativeEvent.key === "Backspace") {
      if (digits[index]) {
        // clear current digit
        const newOtp = [...digits];
        newOtp[index] = "";
        setOtp(newOtp.join(""));
      } else if (index > 0) {
        // move back if already empty
        inputs.current[index - 1]?.focus();

        const newOtp = [...digits];
        newOtp[index - 1] = "";
        setOtp(newOtp.join(""));
      }
    }
  };

  const maskedPhone =
    phone.slice(0, 2) + "XXXXXX" + phone.slice(-2);

  const isComplete = otp.length === 6;

  return (
    <View>
      <Text style={styles.info}>
        Code sent to {maskedPhone}
      </Text>

      {/* OTP BOXES */}
      <View style={styles.otpRow}>
        {digits.map((digit: string, index: number) => (
          <TextInput
            key={index}
            ref={(ref) => {
              if (ref) inputs.current[index] = ref;
            }}
            value={digit}
            onChangeText={(text) => handleChange(text, index)}
            onKeyPress={(e) => handleKeyPress(e, index)}
            keyboardType="number-pad"
            maxLength={1}
            style={[
              styles.otpBox,
              digit && styles.filledBox,
            ]}
            textAlign="center"
          />
        ))}
      </View>

      <AppButton
        title="Verify OTP"
        onPress={onVerify}
        disabled={!isComplete}
      />

      <TouchableOpacity onPress={onBack}>
        <Text style={styles.back}>← Change Number</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  info: {
    textAlign: "center",
    marginBottom: 15,
    color: "#666",
  },

  otpRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 20,
  },

  otpBox: {
    width: 45,
    height: 50,
    borderWidth: 1.5,
    borderColor: "#ddd",
    borderRadius: 10,
    fontSize: 20,
    fontWeight: "bold",
  },

  filledBox: {
    borderColor: "#ef4444",
    backgroundColor: "#fee2e2",
  },

  back: {
    marginTop: 15,
    textAlign: "center",
    color: "#ef4444",
  },
});