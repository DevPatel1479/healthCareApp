import { useLocalSearchParams, useRouter } from "expo-router";
import {
    SafeAreaView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
    Platform,
} from "react-native";
import { KeyboardAwareScrollView } from "react-native-keyboard-aware-scroll-view";
import { Ionicons } from "@expo/vector-icons";

import PatientFeedback from "@/components/dashboard/PatientFeedback";

export default function PatientFeedbackScreen() {
    const router = useRouter();

    const params = useLocalSearchParams<{
        selectedDate?: string;
        caregiverId?: string;
    }>();

    const parsedCaregiverId = Number(params.caregiverId);

    const caregiverId =
        params.caregiverId &&
            Number.isInteger(parsedCaregiverId) &&
            parsedCaregiverId > 0
            ? parsedCaregiverId
            : null;

    return (
        <SafeAreaView style={screenStyles.container}>
            {/* Header stays fixed above the scrolling form */}
            <View style={screenStyles.header}>
                <TouchableOpacity
                    onPress={() => router.back()}
                    style={screenStyles.backButton}
                    accessibilityRole="button"
                    accessibilityLabel="Go back"
                >
                    <Ionicons
                        name="arrow-back"
                        size={23}
                        color="#111827"
                    />
                </TouchableOpacity>

                <View style={screenStyles.headerText}>
                    <Text style={screenStyles.title}>
                        Patient Feedback
                    </Text>

                    <Text style={screenStyles.subtitle}>
                        Share your care experience
                    </Text>
                </View>
            </View>

            {/* Automatically scrolls the focused TextInput above the keyboard */}
            <KeyboardAwareScrollView
                style={screenStyles.scrollView}
                contentContainerStyle={screenStyles.content}
                enableOnAndroid={true}
                enableAutomaticScroll={true}
                extraHeight={100}
                extraScrollHeight={40}
                keyboardOpeningTime={250}
                keyboardShouldPersistTaps="handled"
                enableResetScrollToCoords={false}
                showsVerticalScrollIndicator={false}
                viewIsInsideTabBar={false}
                keyboardDismissMode={
                    Platform.OS === "ios" ? "interactive" : "on-drag"
                }
            >
                {params.selectedDate ? (
                    <View style={screenStyles.dateInfo}>
                        <Ionicons
                            name="calendar-outline"
                            size={19}
                            color="#2563eb"
                        />

                        <Text style={screenStyles.dateText}>
                            Selected dashboard date: {params.selectedDate}
                        </Text>
                    </View>
                ) : null}

                <PatientFeedback caregiverId={caregiverId} />
            </KeyboardAwareScrollView>
        </SafeAreaView>
    );
}

const screenStyles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "#f3f6fb",
    },
    header: {
        flexDirection: "row",
        alignItems: "center",
        paddingHorizontal: 18,
        paddingVertical: 15,
        backgroundColor: "#ffffff",
        borderBottomWidth: 1,
        borderBottomColor: "#e5e7eb",
    },
    backButton: {
        width: 42,
        height: 42,
        borderRadius: 13,
        backgroundColor: "#f3f4f6",
        alignItems: "center",
        justifyContent: "center",
    },
    headerText: {
        flex: 1,
        marginLeft: 12,
    },
    title: {
        fontSize: 20,
        fontWeight: "700",
        color: "#111827",
    },
    subtitle: {
        fontSize: 13,
        color: "#6b7280",
        marginTop: 3,
    },
    scrollView: {
        flex: 1,
    },
    content: {
        flexGrow: 1,
        paddingHorizontal: 16,
        paddingTop: 8,
        paddingBottom: 60,
    },
    dateInfo: {
        flexDirection: "row",
        alignItems: "center",
        gap: 8,
        padding: 12,
        marginTop: 12,
        borderRadius: 12,
        backgroundColor: "#eff6ff",
    },
    dateText: {
        flex: 1,
        color: "#1d4ed8",
        fontSize: 13,
        fontWeight: "600",
    },
});