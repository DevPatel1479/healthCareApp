import { useState } from "react";
import * as Speech from "expo-speech";
import { Ionicons } from "@expo/vector-icons";
import {
    Alert,
    Modal,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from "react-native";

export const TASK_SPEECH_LANGUAGES = [
    { label: "English", value: "en-IN" },
    { label: "Hindi", value: "hi-IN" },
    { label: "Gujarati", value: "gu-IN" },
] as const;

export type SpeechLanguage =
    (typeof TASK_SPEECH_LANGUAGES)[number]["value"];

type TaskSpeechLanguagePickerProps = {
    language: SpeechLanguage;
    onLanguageChange: (language: SpeechLanguage) => void;
};

type TaskSpeechButtonProps = {
    taskId: number;
    text: string;
    language: SpeechLanguage;
    isSpeaking: boolean;
    onSpeechStart: (taskId: number) => void;
    onSpeechEnd: (taskId: number) => void;
};

/**
 * One language selector shared by all task audio buttons
 * through the dashboard's selected-language state.
 */
export function TaskSpeechLanguagePicker({
    language,
    onLanguageChange,
}: TaskSpeechLanguagePickerProps) {
    const [modalVisible, setModalVisible] = useState(false);

    const selectedLanguage =
        TASK_SPEECH_LANGUAGES.find(
            (item) => item.value === language
        ) ?? TASK_SPEECH_LANGUAGES[0];

    const chooseLanguage = (nextLanguage: SpeechLanguage) => {
        onLanguageChange(nextLanguage);
        setModalVisible(false);
    };

    return (
        <>
            <View style={styles.languagePanel}>
                <View style={styles.languageInfo}>
                    <View style={styles.audioIconContainer}>
                        <Ionicons
                            name="volume-high-outline"
                            size={24}
                            color="#1d4ed8"
                        />
                    </View>

                    <View style={styles.languageDescription}>
                        <Text style={styles.panelTitle}>
                            Listen to task instructions
                        </Text>

                        <Text style={styles.panelSubtitle}>
                            Choose a language, then tap Listen on any task.
                        </Text>
                    </View>
                </View>

                <TouchableOpacity
                    accessibilityRole="button"
                    accessibilityLabel={`Choose spoken language. Currently ${selectedLanguage.label}`}
                    activeOpacity={0.8}
                    style={styles.languageButton}
                    onPress={() => setModalVisible(true)}
                >
                    <Ionicons
                        name="language-outline"
                        size={19}
                        color="#1d4ed8"
                    />

                    <View style={styles.selectedLanguageText}>
                        <Text style={styles.languageCaption}>
                            Read in
                        </Text>

                        <Text style={styles.languageValue}>
                            {selectedLanguage.label}
                        </Text>
                    </View>

                    <Ionicons
                        name="chevron-down"
                        size={18}
                        color="#1d4ed8"
                    />
                </TouchableOpacity>
            </View>

            <Modal
                visible={modalVisible}
                transparent
                animationType="fade"
                onRequestClose={() => setModalVisible(false)}
            >
                <View style={styles.modalOverlay}>
                    <View style={styles.languageModal}>
                        <View style={styles.modalHeader}>
                            <View style={{ flex: 1 }}>
                                <Text style={styles.modalTitle}>
                                    Spoken language
                                </Text>

                                <Text style={styles.modalSubtitle}>
                                    Select your preferred language.
                                </Text>
                            </View>

                            <TouchableOpacity
                                accessibilityRole="button"
                                accessibilityLabel="Close language selection"
                                style={styles.closeButton}
                                onPress={() => setModalVisible(false)}
                            >
                                <Ionicons
                                    name="close"
                                    size={24}
                                    color="#374151"
                                />
                            </TouchableOpacity>
                        </View>

                        <ScrollView
                            style={styles.languageList}
                            showsVerticalScrollIndicator={false}
                        >
                            {TASK_SPEECH_LANGUAGES.map((item) => {
                                const selected = item.value === language;

                                return (
                                    <TouchableOpacity
                                        key={item.value}
                                        accessibilityRole="button"
                                        accessibilityState={{ selected }}
                                        activeOpacity={0.7}
                                        onPress={() => chooseLanguage(item.value)}
                                        style={[
                                            styles.languageOption,
                                            selected && styles.selectedLanguageOption,
                                        ]}
                                    >
                                        <Text
                                            style={[
                                                styles.languageOptionText,
                                                selected && styles.selectedLanguageOptionText,
                                            ]}
                                        >
                                            {item.label}
                                        </Text>

                                        {selected && (
                                            <Ionicons
                                                name="checkmark-circle"
                                                size={23}
                                                color="#2563eb"
                                            />
                                        )}
                                    </TouchableOpacity>
                                );
                            })}
                        </ScrollView>
                    </View>
                </View>
            </Modal>
        </>
    );
}

/**
 * A separate speech button for each task.
 *
 * text should contain the translation for the chosen language,
 * when one is available.
 */
export function TaskSpeechButton({
    taskId,
    text,
    language,
    isSpeaking,
    onSpeechStart,
    onSpeechEnd,
}: TaskSpeechButtonProps) {
    const handlePress = async () => {
        const speechText = text.trim();

        if (!speechText) {
            Alert.alert(
                "No task description",
                "There is no text available to read aloud."
            );
            return;
        }

        try {
            // If this task is already speaking, stop it.
            if (isSpeaking) {
                await Speech.stop();
                onSpeechEnd(taskId);
                return;
            }

            // Stop any previous task audio before starting another.
            await Speech.stop();

            onSpeechStart(taskId);

            Speech.speak(speechText, {
                language,
                rate: 0.88,
                pitch: 1.0,
                volume: 1.0,

                onStart: () => {
                    onSpeechStart(taskId);
                },

                onDone: () => {
                    onSpeechEnd(taskId);
                },

                onStopped: () => {
                    onSpeechEnd(taskId);
                },

                onError: () => {
                    onSpeechEnd(taskId);

                    Alert.alert(
                        "Unable to read task",
                        "Speech playback failed. Please check the device's text-to-speech language settings and try again."
                    );
                },
            });
        } catch {
            onSpeechEnd(taskId);

            Alert.alert(
                "Speech playback",
                "Unable to start audio. Please try again."
            );
        }
    };

    return (
        <TouchableOpacity
            accessibilityRole="button"
            accessibilityLabel={
                isSpeaking
                    ? "Stop reading this task"
                    : "Listen to this task"
            }
            accessibilityState={{ selected: isSpeaking }}
            activeOpacity={0.8}
            onPress={handlePress}
            style={[
                styles.speechButton,
                isSpeaking && styles.stopSpeechButton,
            ]}
        >
            <View
                style={[
                    styles.speechButtonIcon,
                    isSpeaking && styles.stopSpeechButtonIcon,
                ]}
            >
                <Ionicons
                    name={
                        isSpeaking
                            ? "stop"
                            : "volume-high"
                    }
                    size={21}
                    color={isSpeaking ? "#b91c1c" : "#1d4ed8"}
                />
            </View>

            <View style={styles.speechButtonTextContainer}>
                <Text
                    style={[
                        styles.speechButtonTitle,
                        isSpeaking && styles.stopSpeechButtonTitle,
                    ]}
                >
                    {isSpeaking ? "Stop reading" : "Listen to task"}
                </Text>

                <Text style={styles.speechButtonSubtitle}>
                    {isSpeaking
                        ? "Tap to stop audio"
                        : "Hear task instructions aloud"}
                </Text>
            </View>

            <Ionicons
                name={
                    isSpeaking
                        ? "stop-circle-outline"
                        : "play-circle-outline"
                }
                size={25}
                color={isSpeaking ? "#b91c1c" : "#1d4ed8"}
            />
        </TouchableOpacity>
    );
}

const styles = StyleSheet.create({
    languagePanel: {
        marginTop: 16,
        marginBottom: 18,
        padding: 14,
        backgroundColor: "#f8fafc",
        borderWidth: 1,
        borderColor: "#dbeafe",
        borderRadius: 14,
        gap: 14,
    },

    languageInfo: {
        flexDirection: "row",
        alignItems: "center",
        gap: 11,
    },

    audioIconContainer: {
        width: 44,
        height: 44,
        borderRadius: 12,
        backgroundColor: "#dbeafe",
        alignItems: "center",
        justifyContent: "center",
    },

    languageDescription: {
        flex: 1,
    },

    panelTitle: {
        fontSize: 15,
        fontWeight: "700",
        color: "#111827",
    },

    panelSubtitle: {
        fontSize: 12,
        color: "#6b7280",
        marginTop: 4,
        lineHeight: 18,
    },

    languageButton: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "center",
        gap: 10,
        paddingHorizontal: 13,
        paddingVertical: 11,
        borderRadius: 10,
        backgroundColor: "#eff6ff",
        borderWidth: 1,
        borderColor: "#bfdbfe",
    },

    selectedLanguageText: {
        flex: 1,
    },

    languageCaption: {
        color: "#64748b",
        fontSize: 11,
    },

    languageValue: {
        color: "#1d4ed8",
        fontSize: 14,
        fontWeight: "700",
        marginTop: 2,
    },

    modalOverlay: {
        flex: 1,
        backgroundColor: "rgba(15, 23, 42, 0.5)",
        justifyContent: "center",
        alignItems: "center",
        padding: 20,
    },

    languageModal: {
        width: "100%",
        maxWidth: 420,
        maxHeight: "80%",
        backgroundColor: "#ffffff",
        borderRadius: 18,
        padding: 18,
    },

    modalHeader: {
        flexDirection: "row",
        alignItems: "center",
        marginBottom: 12,
    },

    modalTitle: {
        fontSize: 19,
        fontWeight: "700",
        color: "#111827",
    },

    modalSubtitle: {
        fontSize: 13,
        color: "#6b7280",
        marginTop: 4,
    },

    closeButton: {
        height: 40,
        width: 40,
        borderRadius: 20,
        backgroundColor: "#f3f4f6",
        justifyContent: "center",
        alignItems: "center",
        marginLeft: 10,
    },

    languageList: {
        flexGrow: 0,
    },

    languageOption: {
        minHeight: 51,
        paddingHorizontal: 12,
        paddingVertical: 12,
        borderRadius: 10,
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        marginTop: 4,
    },

    selectedLanguageOption: {
        backgroundColor: "#eff6ff",
    },

    languageOptionText: {
        fontSize: 15,
        color: "#374151",
    },

    selectedLanguageOptionText: {
        color: "#1d4ed8",
        fontWeight: "700",
    },

    speechButton: {
        flexDirection: "row",
        alignItems: "center",
        gap: 11,
        marginTop: 10,
        marginBottom: 8,
        paddingHorizontal: 12,
        paddingVertical: 12,
        borderRadius: 12,
        backgroundColor: "#eff6ff",
        borderWidth: 1,
        borderColor: "#bfdbfe",
    },

    stopSpeechButton: {
        backgroundColor: "#fef2f2",
        borderColor: "#fecaca",
    },

    speechButtonIcon: {
        width: 40,
        height: 40,
        borderRadius: 10,
        backgroundColor: "#dbeafe",
        alignItems: "center",
        justifyContent: "center",
    },

    stopSpeechButtonIcon: {
        backgroundColor: "#fee2e2",
    },

    speechButtonTextContainer: {
        flex: 1,
    },

    speechButtonTitle: {
        color: "#1d4ed8",
        fontSize: 14,
        fontWeight: "700",
    },

    stopSpeechButtonTitle: {
        color: "#b91c1c",
    },

    speechButtonSubtitle: {
        color: "#64748b",
        fontSize: 11,
        marginTop: 3,
    },
});