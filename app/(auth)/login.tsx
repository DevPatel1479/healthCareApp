import OtpSection from "@/components/auth/OtpSection";
import PhoneInputSection from "@/components/auth/PhoneInputSection";
import { useState } from "react";
import {
    KeyboardAvoidingView,
    Platform,
    SafeAreaView,
    ScrollView,
    StyleSheet,
    Text,
    View
} from "react-native";

export default function LoginScreen() {
  const [phone, setPhone] = useState("");
  const [otp, setOtp] = useState("");
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState(0);

  const handleSend = () => {
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      setStep(1);
    }, 1800);
  };

  const handleVerify = () => {
    console.log("OTP submitted:", otp);
  };

  const handleBack = () => {
    setStep(0);
    setOtp("");
  };

  return (
  <SafeAreaView style={styles.container}>
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
      <ScrollView
        contentContainerStyle={styles.scroll}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.inner}>

          {/* Header */}
          <View style={styles.header}>
            <Text style={styles.badge}>Welcome back</Text>

            <Text style={styles.title}>
              Sign in to <Text style={styles.brand}>CareConnect</Text>
            </Text>

            <Text style={styles.subtitle}>
              Continue supporting your loved ones
            </Text>
          </View>

          {/* Card */}
          <View style={styles.card}>
            {/* Step Indicator */}
            <View style={styles.steps}>
              <View style={[styles.dot, step === 0 && styles.activeDot]} />
              <View style={[styles.dot, step === 1 && styles.activeDot]} />
            </View>

            <Text style={styles.cardTitle}>
              {step === 0 ? "Phone Verification" : "Enter OTP"}
            </Text>

            <Text style={styles.cardDesc}>
              {step === 0
                ? "Enter your registered mobile number"
                : "A 6-digit code has been sent"}
            </Text>

            {step === 0 ? (
              <PhoneInputSection
                phone={phone}
                setPhone={setPhone}
                onSend={handleSend}
                loading={loading}
              />
            ) : (
              <OtpSection
                otp={otp}
                setOtp={setOtp}
                onVerify={handleVerify}
                phone={phone}
                onBack={handleBack}
              />
            )}
          </View>

          <Text style={styles.footer}>
            By continuing, you agree to Terms & Privacy Policy
          </Text>

        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  </SafeAreaView>
);
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f8fafc",
  },
  scroll: {
    flexGrow: 1,
    justifyContent: "center",
    paddingVertical: 40, // 👈 adds breathing space top/bottom
  },

  inner: {
    paddingHorizontal: 20,
  },

  header: {
    alignItems: "center",
    marginBottom: 30,
  },
  badge: {
    backgroundColor: "#fee2e2",
    color: "#ef4444",
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 20,
    marginBottom: 15,
    fontSize: 12,
  },
  title: {
    fontSize: 26,
    fontWeight: "bold",
    textAlign: "center",
  },
  brand: {
    color: "#ef4444",
  },
  subtitle: {
    marginTop: 8,
    color: "#666",
    textAlign: "center",
  },

  card: {
    backgroundColor: "#fff",
    padding: 20,
    borderRadius: 16,
    elevation: 4,
  },

  steps: {
    flexDirection: "row",
    justifyContent: "center",
    marginBottom: 15,
    gap: 6,
  },
  dot: {
    height: 4,
    width: 20,
    backgroundColor: "#ddd",
    borderRadius: 10,
  },
  activeDot: {
    width: 30,
    backgroundColor: "#ef4444",
  },

  cardTitle: {
    textAlign: "center",
    fontWeight: "bold",
    fontSize: 18,
  },
  cardDesc: {
    textAlign: "center",
    color: "#666",
    marginBottom: 20,
  },

  footer: {
    textAlign: "center",
    marginTop: 20,
    fontSize: 12,
    color: "#999",
  },
});