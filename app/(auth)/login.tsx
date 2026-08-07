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

// import axios from 'axios';
import { ENDPOINTS } from "@/api/endpoints";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { styles } from "../../styles/login.styles";
import { apiClient, publicApiClient } from "@/api/apiClient";
import { tokenStorage } from "@/api/tokenStorage";





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

    if (timer > 0 && !otpVerified) {   // 👈 add this condition
      interval = setInterval(() => {
        setTimer((prev) => prev - 1);
      }, 1000);
    }

    return () => clearInterval(interval);
  }, [timer, otpVerified]); // 👈 add dependency

  // 📩 SEND OTP API
  const handleSend = async (type: "sms" | "whatsapp") => {
    try {
      setLoading(true);
      setError("");
      setOtpType(type);

      const loginRes = await publicApiClient.post(ENDPOINTS.login(), {
        phone_number: phone,
      });
      if (!loginRes.data.success) {
        setError(loginRes.data.message || "User not found");
        return;
      }
      await tokenStorage.save(loginRes.data.token);
      const userData = loginRes.data.data;
      console.log(userData);
      await AsyncStorage.multiSet([
        ["user_id", String(userData.user_id)],
        ["role", String(userData.role)],
        ["reference_id", String(userData.reference_id)],
        ["full_name", String(userData.full_name)],
        ["is_verified", String(userData.is_verified)],
        ["phone_number", phone],
      ]);

      await publicApiClient.post(ENDPOINTS.sendOtp(), {
        phone,
        type
      });

      setStep(1);
      setTimer(30); // start resend timer

    } catch (err: any) {
      console.log("Login/OTP Error", err);
      await AsyncStorage.clear();
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

      const res = await publicApiClient.post(ENDPOINTS.verifyOtp(), {
        phone,
        otp,
      });

      if (res.data.success) {
        setOtpVerified(true);

        setTimer(0);
        await AsyncStorage.setItem('isUserLoggedIn', 'true');
        const role = await AsyncStorage.getItem("role");
        setTimeout(() => {

          // FAMILY LEAD -> PATIENT DASHBOARD
          if (role === "family_lead") {
            // router.replace("/(patient)/dashboard");
            router.replace("/(selectDate)/datepicker");
          }

          // CAREGIVER -> SCANNER
          else if (role === "caregiver") {
            router.replace("/(scanner)");
          }

          // ADMIN / DOCTOR FALLBACK
          else {
            router.replace("/(scanner)");
          }

        }, 700);

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
    if (timer === 0 && otpType && !otpVerified) { // 👈 block after success
      handleSend(otpType);
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
                supporting your loved ones
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

