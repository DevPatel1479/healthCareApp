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
import { ENDPOINTS } from "@/api/endpoints";
import { apiClient } from "@/api/apiClient";
import { styles } from "@/styles/caregiver.scanner.styles";


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

      const response = await apiClient.post(
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
          router.replace({
            pathname: "/(selectDate)/datepicker",
            params: {
              role: "caregiver"
            },
          })
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

