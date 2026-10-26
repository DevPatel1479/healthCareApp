import { useLocalSearchParams, useRouter } from "expo-router";
import {
    SafeAreaView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from "react-native";
import { KeyboardAwareScrollView } from "react-native-keyboard-aware-scroll-view";
import { Ionicons } from "@expo/vector-icons";

import CaregiverFeedback from "@/components/dashboard/CaregiverFeedback";

export default function CaregiverFeedbackScreen() {
    const router = useRouter();

    const params = useLocalSearchParams<{
        selectedDate?: string | string[];
        patientId?: string | string[];
        assignmentId?: string | string[];
    }>();

    const getParam = (value?: string | string[]) =>
        Array.isArray(value) ? value[0] : value;

    const rawPatientId = getParam(params.patientId);
    const rawAssignmentId = getParam(params.assignmentId);
    const selectedDate = getParam(params.selectedDate);

    const parsedPatientId = Number(rawPatientId);
    const patientId =
        rawPatientId &&
            Number.isInteger(parsedPatientId) &&
            parsedPatientId > 0
            ? parsedPatientId
            : null;

    const parsedAssignmentId = Number(rawAssignmentId);
    const assignmentId =
        rawAssignmentId &&
            Number.isInteger(parsedAssignmentId) &&
            parsedAssignmentId > 0
            ? parsedAssignmentId
            : null;

    return (
        <SafeAreaView style={screenStyles.container}>
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
                        Caregiver Feedback
                    </Text>
                    <Text style={screenStyles.subtitle}>
                        Share your care experience
                    </Text>
                </View>
            </View>

            <KeyboardAwareScrollView
                style={screenStyles.scrollView}
                contentContainerStyle={screenStyles.content}
                enableOnAndroid
                enableAutomaticScroll
                extraHeight={100}
                extraScrollHeight={40}
                keyboardOpeningTime={250}
                keyboardShouldPersistTaps="handled"
                enableResetScrollToCoords={false}
                showsVerticalScrollIndicator={false}
            >
                {selectedDate ? (
                    <View style={screenStyles.dateInfo}>
                        <Ionicons
                            name="calendar-outline"
                            size={19}
                            color="#ea580c"
                        />
                        <Text style={screenStyles.dateText}>
                            Selected dashboard date: {selectedDate}
                        </Text>
                    </View>
                ) : null}

                <CaregiverFeedback
                    patientId={patientId}
                    assignmentId={assignmentId}
                />
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
        backgroundColor: "#fff7ed",
    },
    dateText: {
        flex: 1,
        color: "#c2410c",
        fontSize: 13,
        fontWeight: "600",
    },
});