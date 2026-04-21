import OtpSection from "@/components/auth/OtpSection";
import PhoneInputSection from "@/components/auth/PhoneInputSection";
import { useRouter } from "expo-router";
import { useEffect, useState } from "react";
import {
  KeyboardAvoidingView,
  Platform,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  View
} from "react-native";

import axios from 'axios';

const BASE_URL = "https://health-care-backend-eight.vercel.app/api";

export default function LoginScreen() {
  const [error, setError] = useState<string>("");
  const [phone, setPhone] = useState("");
  const [otp, setOtp] = useState("");
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState(0);
  const [timer, setTimer] = useState(0);
  const [otpVerified, setOtpVerified] = useState(false);
  const [otpType, setOtpType] = useState<"sms" | "whatsapp" | null>(null);
  const router = useRouter();


  // ⏱ Timer logic
  useEffect(() => {
    let interval: any;
    if (timer > 0) {
      interval = setInterval(() => {
        setTimer((prev) => prev - 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [timer]);


  // 📩 SEND OTP API
  const handleSend = async (type: "sms" | "whatsapp") => {
    try {
      setLoading(true);
      setError("");
      setOtpType(type);

      await axios.post(`${BASE_URL}/send-otp`, {
        phone,
        type
      });

      setStep(1);
      setTimer(30); // start resend timer

    } catch (err: any) {
      setError(
        err?.response?.data?.message ||
        "Failed to send OTP. Check your internet connection."
      );
      console.log("Send OTP error", err);
    } finally {
      setLoading(false);
    }
  };



  // ✅ VERIFY OTP API
  const handleVerify = async () => {
    try {
      setLoading(true);
      setError("");

      const res = await axios.post(`${BASE_URL}/verify-otp`, {
        phone,
        otp,
      });

      if (res.data.success) {
        setOtpVerified(true);
        // router.push("/(scanner)");
      } else {
        setOtpVerified(false);
        setError("Invalid OTP. Please try again.");
      }

    } catch (err: any) {
      setOtpVerified(false);
      setError(
        err?.response?.data?.message ||
        "OTP verification failed or no internet connection."
      );
      console.log("Verify error", err);
    } finally {
      setLoading(false);

    }
  };
  const handleResend = () => {
    if (timer === 0 && otpType) {
      handleSend(otpType); // ✅ now correct
    }
  };
  const handleBack = () => {
    setStep(0);
    setOtp("");
    setTimer(0);
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
              {error ? (
                <View style={styles.errorBox}>
                  <Text style={styles.errorText}>{error}</Text>
                </View>
              ) : null}
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
                  loading={loading}
                  timer={timer}
                  otpVerified={otpVerified}
                  onResend={handleResend}
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
    paddingVertical: 40,
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
  errorBox: {
    backgroundColor: "#fee2e2",
    padding: 12,
    borderRadius: 10,
    marginBottom: 15,
    borderWidth: 1,
    borderColor: "#ef4444",
  },

  errorText: {
    color: "#b91c1c",
    textAlign: "center",
    fontWeight: "600",
  },
});