
import { useState } from "react";
import {
    ActivityIndicator,
    Alert,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import {
    ExpoSpeechRecognitionModule,
    useSpeechRecognitionEvent,
} from "expo-speech-recognition";

type SpeechToTaskButtonProps = {
    onTranscript: (text: string) => void;
    onTranscriptComplete: (text: string) => void;
    disabled?: boolean;
};

const LANGUAGES = [
    { label: "English", value: "en-IN" },
    { label: "Hindi", value: "hi-IN" },
    { label: "Gujarati", value: "gu-IN" },
    { label: "Marathi", value: "mr-IN" },
    { label: "Bengali", value: "bn-IN" },
    { label: "Tamil", value: "ta-IN" },
    { label: "Telugu", value: "te-IN" },
    { label: "Punjabi", value: "pa-IN" },
    { label: "Kannada", value: "kn-IN" },
    { label: "Malayalam", value: "ml-IN" },
    { label: "Urdu", value: "ur-IN" },
];

export default function SpeechToTaskButton({
    onTranscript,
    onTranscriptComplete,
    disabled = false,
}: SpeechToTaskButtonProps) {
    const [recognizing, setRecognizing] = useState(false);
    const [starting, setStarting] = useState(false);
    const [language, setLanguage] = useState("en-IN");
    const [languageLabel, setLanguageLabel] = useState("English");
    const [transcript, setTranscript] = useState("");

    // Indicates that we are waiting for the final transcription.
    const [waitingForFinal, setWaitingForFinal] = useState(false);

    useSpeechRecognitionEvent("start", () => {
        setStarting(false);
        setRecognizing(true);
    });

    useSpeechRecognitionEvent("result", (event) => {
        const text = event.results?.[0]?.transcript?.trim();

        if (!text) return;

        setTranscript(text);
        onTranscript(text);

        if (event.isFinal) {
            setWaitingForFinal(false);
            setRecognizing(false);
            onTranscriptComplete(text);
        }
    });

    useSpeechRecognitionEvent("end", () => {
        setRecognizing(false);
        setStarting(false);

        // Some recognition providers deliver the final result
        // immediately before "end". Do not open the modal twice.
        setWaitingForFinal(false);
    });

    useSpeechRecognitionEvent("error", (event) => {
        setRecognizing(false);
        setStarting(false);
        setWaitingForFinal(false);

        if (event.error === "aborted") return;

        const message =
            event.error === "not-allowed"
                ? "Microphone or speech recognition permission was denied. Please enable it in your device settings."
                : event.error === "no-speech"
                    ? "No speech was detected. Please try speaking again."
                    : event.message || "Speech recognition failed.";

        Alert.alert("Speech to Text", message);
    });

    const chooseLanguage = () => {
        Alert.alert(
            "Choose Speech Language",
            "Select the language you will speak.",
            [
                ...LANGUAGES.map((item) => ({
                    text: item.label,
                    onPress: () => {
                        setLanguage(item.value);
                        setLanguageLabel(item.label);
                    },
                })),
                { text: "Cancel", style: "cancel" as const },
            ]
        );
    };

    const startListening = async () => {
        if (disabled || starting || recognizing) return;

        try {
            setTranscript("");
            onTranscript("");
            setStarting(true);
            setWaitingForFinal(false);

            const permission =
                await ExpoSpeechRecognitionModule.requestPermissionsAsync();

            if (!permission.granted) {
                setStarting(false);
                Alert.alert(
                    "Permission Required",
                    "Please allow microphone and speech recognition access to dictate a task."
                );
                return;
            }

            ExpoSpeechRecognitionModule.start({
                lang: language,
                interimResults: true,
                continuous: false,
                maxAlternatives: 1,
                addsPunctuation: true,
            });
        } catch (error: any) {
            setStarting(false);
            setRecognizing(false);

            Alert.alert(
                "Unable to Start",
                error?.message ||
                "Could not start speech recognition. Please try again."
            );
        }
    };

    const stopListening = () => {
        if (recognizing || starting) {
            setWaitingForFinal(true);
            ExpoSpeechRecognitionModule.stop();
        }
    };

    return (
        <View style={styles.container}>
            <View style={styles.controls}>
                <TouchableOpacity
                    activeOpacity={0.8}
                    onPress={chooseLanguage}
                    style={styles.languageButton}
                    disabled={recognizing || starting}
                >
                    <Ionicons
                        name="language-outline"
                        size={17}
                        color="#1d4ed8"
                    />
                    <Text style={styles.languageText}>
                        {languageLabel}
                    </Text>
                    <Ionicons
                        name="chevron-down"
                        size={15}
                        color="#1d4ed8"
                    />
                </TouchableOpacity>

                <TouchableOpacity
                    activeOpacity={0.8}
                    onPress={
                        recognizing || starting
                            ? stopListening
                            : startListening
                    }
                    disabled={disabled}
                    style={[
                        styles.micButton,
                        (recognizing || starting) && styles.listeningButton,
                        disabled && styles.disabledButton,
                    ]}
                >
                    {starting ? (
                        <ActivityIndicator size="small" color="#fff" />
                    ) : (
                        <Ionicons
                            name={
                                recognizing
                                    ? "stop-circle-outline"
                                    : "mic-outline"
                            }
                            size={21}
                            color="#fff"
                        />
                    )}

                    <Text style={styles.micButtonText}>
                        {starting
                            ? "Starting..."
                            : recognizing
                                ? "Stop speaking"
                                : "Speak task"}
                    </Text>
                </TouchableOpacity>
            </View>

            {recognizing && (
                <View style={styles.statusRow}>
                    <View style={styles.recordingDot} />
                    <Text style={styles.statusText}>
                        Listening... Speak clearly, then tap Stop if needed.
                    </Text>
                </View>
            )}

            {waitingForFinal && (
                <Text style={styles.statusText}>
                    Processing your speech...
                </Text>
            )}

            {!!transcript && (
                <Text style={styles.previewText} numberOfLines={3}>
                    Recognized: {transcript}
                </Text>
            )}
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        marginBottom: 16,
    },
    controls: {
        flexDirection: "row",
        alignItems: "center",
        flexWrap: "wrap",
        gap: 8,
    },
    languageButton: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "center",
        gap: 5,
        borderWidth: 1,
        borderColor: "#bfdbfe",
        backgroundColor: "#eff6ff",
        paddingHorizontal: 10,
        paddingVertical: 11,
        borderRadius: 10,
    },
    languageText: {
        color: "#1d4ed8",
        fontSize: 12,
        fontWeight: "600",
    },
    micButton: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "center",
        gap: 7,
        backgroundColor: "#2563eb",
        paddingHorizontal: 14,
        paddingVertical: 11,
        borderRadius: 10,
        flex: 1,
    },
    listeningButton: {
        backgroundColor: "#dc2626",
    },
    disabledButton: {
        opacity: 0.5,
    },
    micButtonText: {
        color: "#fff",
        fontSize: 13,
        fontWeight: "700",
    },
    statusRow: {
        flexDirection: "row",
        alignItems: "center",
        marginTop: 10,
        gap: 7,
    },
    recordingDot: {
        width: 8,
        height: 8,
        borderRadius: 4,
        backgroundColor: "#dc2626",
    },
    statusText: {
        color: "#6b7280",
        fontSize: 12,
        marginTop: 8,
        flexShrink: 1,
    },
    previewText: {
        color: "#374151",
        fontSize: 13,
        marginTop: 8,
        lineHeight: 19,
    },
});
