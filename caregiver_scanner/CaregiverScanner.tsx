import AsyncStorage from "@react-native-async-storage/async-storage";
import { Modal, ActivityIndicator, /* ... */ } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { CameraView, useCameraPermissions } from "expo-camera";
import { useRouter } from "expo-router";
import { useEffect, useRef, useState } from "react";
import {
  Animated,
  StyleSheet,
  Text,
  TouchableOpacity,
  View
} from "react-native";
import axios from "axios";
import { ENDPOINTS } from "@/api/endpoints";


type ScanPhase = "idle" | "verifying" | "success" | "error";


export default function CaregiverScanner() {
  const [permission, requestPermission] = useCameraPermissions();

  const [isScanning, setIsScanning] = useState(false);
  const [scanned, setScanned] = useState(false);

  const [errorMessage, setErrorMessage] = useState("");

  const [phase, setPhase] = useState<ScanPhase>("idle");


  const router = useRouter();
  const scanLock = useRef(false);
  const scanAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (isScanning && !scanned) {
      Animated.loop(
        Animated.sequence([
          Animated.timing(scanAnim, {
            toValue: 220,
            duration: 1500,
            useNativeDriver: true,
          }),
          Animated.timing(scanAnim, {
            toValue: 0,
            duration: 1500,
            useNativeDriver: true,
          }),
        ])
      ).start();
    }
  }, [isScanning, scanned]);
  //  Ask permission automatically when scanning starts
  useEffect(() => {
    if (isScanning && permission && !permission.granted) {
      requestPermission();
    }
  }, [isScanning, permission]);

  if (!permission) return <View />;

  //  Permission denied screen
  if (isScanning && !permission.granted) {
    return (
      <View style={styles.center}>
        <Text>Camera permission required</Text>
        <TouchableOpacity onPress={requestPermission}>
          <Text style={{ color: "blue" }}>Allow Camera</Text>
        </TouchableOpacity>
      </View>
    );
  }

  //  HANDLE SCAN
  const handleScan = async ({ data }: any) => {
    if (scanLock.current) return;

    scanLock.current = true;
    setScanned(true);
    setPhase("verifying");

    setErrorMessage("");

    try {
      const caregiverId =
        await AsyncStorage.getItem("reference_id");

      const phoneNumber =
        await AsyncStorage.getItem("phone_number");

      if (!caregiverId || !phoneNumber) {
        throw new Error("Caregiver information missing");
      }

      let qrData;

      try {
        qrData = JSON.parse(data);
      } catch {
        throw new Error("Invalid QR code");
      }
      console.log(qrData);
      const patientId = qrData;

      if (!patientId) {
        throw new Error(
          "Patient ID not found in QR code"
        );
      }

      const response = await axios.post(
        ENDPOINTS.verifyCaregiverQr(),
        {
          phone_number: phoneNumber,
          caregiver_id: Number(caregiverId),
          patient_id: Number(patientId),
        }
      );

      if (response.data.success) {
        setPhase("success");
        // setResult("success");

        setTimeout(() => {
          router.replace(
            "/(caregiver)/dashboard"
          );
        }, 1000);

        return;
      }

      throw new Error(
        response.data.message ||
        "Verification failed"
      );
    } catch (error: any) {
      console.log(
        "verify caregiver qr error",
        error?.response?.data || error
      );

      // setResult("error");
      setPhase("error");

      setErrorMessage(
        error?.response?.data?.message ||
        error?.message ||
        "Verification failed"
      );

      scanLock.current = false;

    }
  };

  //  INITIAL SCREEN (BEST UX)
  if (!isScanning) {
    return (
      <View style={styles.introContainer}>
        <View style={styles.card}>
          <Text style={styles.titleDark}>Caregiver Access</Text>

          <Text style={styles.description}>
            To continue, please scan the caregiver verification QR code.
          </Text>

          <Text style={styles.subDescription}>
            This ensures secure access to patient tasks and daily care activities.
          </Text>

          <TouchableOpacity
            style={styles.scanBtn}
            onPress={() => setIsScanning(true)}
          >
            <Text style={styles.btnText}>Scan QR Code</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }



  //  SCANNER UI
  return (
    <View style={{ flex: 1 }}>
      {/* CAMERA */}
      <CameraView
        style={StyleSheet.absoluteFillObject}
        barcodeScannerSettings={{ barcodeTypes: ["qr"] }}
        onBarcodeScanned={phase === "idle" ? handleScan : undefined}
      />

      {/* OVERLAY */}
      <View style={styles.overlay}>
        <Text style={styles.title}>Scan QR Code</Text>

        <View style={styles.scanBox}>
          {/*  MOVING LASER */}
          {!scanned && (
            <Animated.View
              style={[
                styles.scanLine,
                { transform: [{ translateY: scanAnim }] },
              ]}
            />
          )}
        </View>

        {!scanned && (
          <Text style={styles.subtitle}>
            Align QR inside the box
          </Text>
        )}


      </View>
      <Modal
        visible={phase !== "idle"}
        transparent
        animationType="fade"
        statusBarTranslucent
      >
        <View style={styles.modalBackdrop}>
          <View style={styles.feedbackCard}>
            {phase === "verifying" && (
              <>
                <ActivityIndicator size="large" color="#2563eb" />
                <Text style={styles.feedbackTitle}>Verifying QR code</Text>
                <Text style={styles.feedbackText}>
                  Please wait while we check the caregiver details.
                </Text>
              </>
            )}

            {phase === "success" && (
              <>
                <Ionicons name="checkmark-circle" size={56} color="#16a34a" />
                <Text style={styles.feedbackTitle}>Verified successfully</Text>
                <Text style={styles.feedbackText}>
                  Redirecting to dashboard...
                </Text>
              </>
            )}

            {phase === "error" && (
              <>
                <Ionicons name="close-circle" size={56} color="#ef4444" />
                <Text style={styles.feedbackTitle}>Verification failed</Text>
                <Text style={styles.feedbackText}>{errorMessage}</Text>

                <TouchableOpacity
                  style={styles.retryBtn}
                  onPress={() => {
                    scanLock.current = false;
                    setScanned(false);
                    setPhase("idle");
                    setErrorMessage("");
                  }}
                >
                  <Text style={styles.btnText}>Scan Again</Text>
                </TouchableOpacity>
              </>
            )}
          </View>
        </View>
      </Modal>
    </View>

  );
}

const styles = StyleSheet.create({
  modalBackdrop: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.45)",
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  feedbackCard: {
    width: "100%",
    maxWidth: 340,
    backgroundColor: "#fff",
    borderRadius: 20,
    paddingVertical: 28,
    paddingHorizontal: 22,
    alignItems: "center",
    elevation: 8,
  },
  feedbackTitle: {
    marginTop: 14,
    fontSize: 20,
    fontWeight: "700",
    color: "#0f172a",
    textAlign: "center",
  },
  feedbackText: {
    marginTop: 8,
    fontSize: 14,
    color: "#475569",
    textAlign: "center",
    lineHeight: 20,
  },
  center: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },

  // 🔥 INTRO SCREEN
  overlay: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },

  scanBox: {
    width: 260,
    height: 260,
    borderWidth: 2,
    borderColor: "#22c55e",
    borderRadius: 16,
    overflow: "hidden",
  },

  scanLine: {
    height: 2,
    width: "100%",
    backgroundColor: "#22c55e",
  },

  title: {
    fontSize: 22,
    fontWeight: "bold",
    color: "#fff",
    marginBottom: 20,
  },

  subtitle: {
    color: "#eee",
    marginTop: 20,
  },

  success: {
    color: "#477af0",
    fontSize: 18,
    marginTop: 20,
  },

  error: {
    color: "#ef4444",
    fontSize: 18,
    marginTop: 20,
  },



  //  OVERLAY

  retryBtn: {
    marginTop: 20,
    backgroundColor: "#ef4444",
    padding: 14,
    borderRadius: 10,
  },


  introContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#f1f5f9", // light grey background
    padding: 20,
  },

  card: {
    width: "100%",
    maxWidth: 380,
    backgroundColor: "#fff",
    borderRadius: 20,
    padding: 24,

    // shadow
    elevation: 6,
  },

  titleDark: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#0f172a", // dark text (fix visibility)
    marginBottom: 12,
    textAlign: "center",
  },

  description: {
    fontSize: 15,
    color: "#334155",
    textAlign: "center",
    marginBottom: 10,
  },

  subDescription: {
    fontSize: 13,
    color: "#64748b",
    textAlign: "center",
    marginBottom: 20,
  },

  scanBtn: {
    backgroundColor: "#22c55e",
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: "center",
  },

  btnText: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: 16,
  },
});