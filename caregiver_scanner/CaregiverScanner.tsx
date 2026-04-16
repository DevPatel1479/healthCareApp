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

export default function CaregiverScanner() {
  const [permission, requestPermission] = useCameraPermissions();

  const [isScanning, setIsScanning] = useState(false); 
  const [scanned, setScanned] = useState(false);
  const [result, setResult] = useState<"success" | "error" | null>(null);

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
  const handleScan = ({ data }: any) => {
    if (scanLock.current) return;

    scanLock.current = true;
    setScanned(true);

    if (data) {
      setResult("success");

      //  AUTO NAVIGATE (NO BUTTON)
      setTimeout(() => {
        router.replace("/(caregiver)/dashboard");
      }, 600);
    } else {
      setResult("error");
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
  onBarcodeScanned={scanned ? undefined : handleScan}
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

  {/*  ERROR */}
  {scanned && result === "error" && (
    <>
      <Text style={styles.error}>❌ Invalid QR</Text>

      <TouchableOpacity
        style={styles.retryBtn}
        onPress={() => {
          scanLock.current = false;
          setScanned(false);
          setResult(null);
        }}
      >
        <Text style={styles.btnText}>Scan Again</Text>
      </TouchableOpacity>
    </>
  )}

  {/*  SUCCESS  */}
  {scanned && result === "success" && (
    <Text style={styles.success}>
      ✅ Verified! Redirecting...
    </Text>
  )}
</View>
    </View>
  );
}

const styles = StyleSheet.create({
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