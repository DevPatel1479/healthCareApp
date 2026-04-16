import { useRef } from "react";
import {
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import AppButton from "../ui/AppButton";
import * as Clipboard from "expo-clipboard";
export default function OtpSection({
  otp,
  setOtp,
  onVerify,
  phone,
  onBack,
  loading,
  timer,
  onResend,

}: any) {
  const inputs = useRef<TextInput[]>([]);
  const hiddenInput = useRef<TextInput>(null);
  const digits = Array(6)
    .fill("")
    .map((_, i) => otp[i] || "");


  const extractOtp = (text: string) => {
    const match = text.match(/\d{6}/);
    return match ? match[0] : text;
  };
  const handleChange = (text: string, index: number) => {
    const clean = text.replace(/\D/g, "");

    // 🔥 CASE 1: FULL OTP COMES (autofill / paste)
    if (clean.length > 1) {
      const otpArray = clean.slice(0, 6).split("");
      setOtp(otpArray.join(""));

      // move focus to last filled box
      inputs.current[Math.min(otpArray.length, 5)]?.focus();
      return;
    }

    // 🔥 CASE 2: SINGLE DIGIT
    const newOtp = otp.split("").concat(Array(6).fill("")).slice(0, 6);
    newOtp[index] = clean;

    const updated = newOtp.join("");
    setOtp(updated);

    if (clean && index < 5) {
      inputs.current[index + 1]?.focus();
    }
  };
  const handlePaste = async () => {
    const text = await Clipboard.getStringAsync();
    const extracted = extractOtp(text);

    if (extracted.length === 6) {
      setOtp(extracted);
    }
  };


  const handleKeyPress = (e: any, index: number) => {
    if (e.nativeEvent.key !== "Backspace") return;

    const newOtp = digits;

    if (newOtp[index]) {
      newOtp[index] = "";
      setOtp(newOtp.join(""));
    } else if (index > 0) {
      newOtp[index - 1] = "";
      setOtp(newOtp.join(""));
      inputs.current[index - 1]?.focus();
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

      {/* Hidden OTP input (THIS fixes autofill) */}
      <TextInput
        ref={hiddenInput}
        value={otp}
        onChangeText={(text) => {
          const clean = text.replace(/\D/g, "").slice(0, 6);
          setOtp(clean);
        }}
        keyboardType="number-pad"
        textContentType="oneTimeCode"
        autoComplete="sms-otp"
        importantForAutofill="yes"
        style={styles.hiddenInput}
      />

      {/* UI OTP boxes */}
      <View style={styles.otpRow}>
        {Array(6)
          .fill("")
          .map((_, index) => {
            const digit = otp[index] || "";

            return (
              <TouchableOpacity
                key={index}
                onPress={() => hiddenInput.current?.focus()}
                style={[styles.otpBox, digit && styles.filledBox]}
              >
                <Text style={styles.otpText}>
                  {digit}
                </Text>
              </TouchableOpacity>
            );
          })}
      </View>

      <AppButton
        title="Verify OTP"
        onPress={onVerify}
        loading={loading}
        disabled={!isComplete || loading}
      />


      <TouchableOpacity
        onPress={onResend}
        disabled={timer > 0}
      >
        <Text style={styles.resend}>
          {timer > 0
            ? `Resend OTP in ${timer}s`
            : "Resend OTP"}
        </Text>
      </TouchableOpacity>

      {/* PASTE */}
      <TouchableOpacity onPress={handlePaste}>
        <Text style={styles.paste}>Paste OTP</Text>
      </TouchableOpacity>


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
    justifyContent: "center",   // 🔥 vertical center
    alignItems: "center",       // 🔥 horizontal center
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
  resend: {
    textAlign: "center",
    marginTop: 15,
    color: "#ef4444",
    fontWeight: "600",
  },

  paste: {
    textAlign: "center",
    marginTop: 10,
    color: "#2563eb",
  },


  otpText: {
    fontSize: 22,
    fontWeight: "700",
    textAlign: "center",
    includeFontPadding: false,  // 🔥 Android fix
    textAlignVertical: "center" // 🔥 Android fix
  },
  hiddenInput: {
    position: "absolute",
    top: 0,
    left: 0,
    width: 300,
    height: 50,
    opacity: 0.01,   // ⚠️ NOT 0
    zIndex: -1,
  },
});