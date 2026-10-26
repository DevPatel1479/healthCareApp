import { useState } from "react";
import {
    ActivityIndicator,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Ionicons } from "@expo/vector-icons";
import { apiClient } from "@/api/apiClient";
import { ENDPOINTS } from "@/api/endpoints";

const CATEGORIES = [
    { label: "Patient Wellbeing", value: "overall_care" },
    { label: "Communication", value: "communication" },
    { label: "Punctuality", value: "punctuality" },
    { label: "Task Clarity", value: "task_clarity" },
    { label: "App Experience", value: "app_experience" },
    { label: "Other", value: "other" },
] as const;


type FeedbackCategory = (typeof CATEGORIES)[number]["value"];

type CaregiverFeedbackProps = {
    patientId: number | null;
    assignmentId: number | null;
};

export default function CaregiverFeedback({
    patientId,
    assignmentId,
}: CaregiverFeedbackProps) {
    const [rating, setRating] = useState(0);
    const [category, setCategory] =
        useState<FeedbackCategory>("overall_care");
    const [comments, setComments] = useState("");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");

    const handleSubmit = async () => {
        if (loading) return;

        setError("");
        setSuccess("");

        if (rating < 1 || rating > 5) {
            setError("Please select a star rating from 1 to 5.");
            return;
        }

        if (patientId == null || !Number.isInteger(patientId) || patientId <= 0) {
            setError("Patient information is unavailable. Return to the dashboard and try again.");
            return;
        }

        if (comments.trim().length > 5000) {
            setError("Feedback cannot exceed 5000 characters.");
            return;
        }

        try {
            setLoading(true);

            // The backend identifies the caregiver from the auth token.
            // Do not send caregiver_id in caregiver-side feedback.
            const payload = {
                patient_id: patientId,

                ...(assignmentId != null &&
                    Number.isInteger(assignmentId) &&
                    assignmentId > 0
                    ? { assignment_id: assignmentId }
                    : {}),

                rating,
                category,
                comments: comments.trim(),
            };

            console.log("Submitting caregiver feedback:", payload);

            const response = await apiClient.post(
                ENDPOINTS.submitFeedback(),
                payload
            );

            const data = response.data;

            if (data?.success !== true) {
                throw new Error(
                    data?.message || "Failed to submit feedback."
                );
            }

            setSuccess(
                data.message ||
                "Thank you! Your feedback was submitted successfully."
            );

            setRating(0);
            setCategory("overall_care");
            setComments("");
        } catch (err: any) {
            console.error(
                "Caregiver feedback submission failed:",
                err?.response?.status,
                err?.response?.data || err?.message
            );

            setError(
                err?.response?.data?.message ||
                err?.response?.data?.error ||
                err?.message ||
                "Unable to submit feedback. Please try again."
            );
        } finally {
            setLoading(false);
        }
    };

    return (
        <View style={formStyles.card}>
            <View style={formStyles.header}>
                <View style={formStyles.iconContainer}>
                    <Ionicons
                        name="chatbubble-ellipses-outline"
                        size={25}
                        color="#ea580c"
                    />
                </View>

                <View style={formStyles.headerText}>
                    <Text style={formStyles.title}>Share Your Feedback</Text>
                    <Text style={formStyles.subtitle}>
                        Help us improve the care experience.
                    </Text>
                </View>
            </View>

            <Text style={formStyles.label}>
                How would you rate your experience?
            </Text>

            <View style={formStyles.stars}>
                {[1, 2, 3, 4, 5].map((value) => (
                    <TouchableOpacity
                        key={value}
                        accessibilityRole="button"
                        accessibilityLabel={`${value} star${value > 1 ? "s" : ""}`}
                        accessibilityState={{ selected: rating === value }}
                        disabled={loading}
                        onPress={() => {
                            setRating(value);
                            setError("");
                            setSuccess("");
                        }}
                        style={formStyles.starButton}
                        activeOpacity={0.7}
                    >
                        <Ionicons
                            name={value <= rating ? "star" : "star-outline"}
                            size={35}
                            color={value <= rating ? "#f59e0b" : "#9ca3af"}
                        />
                    </TouchableOpacity>
                ))}
            </View>

            <Text style={formStyles.ratingText}>
                {rating === 0
                    ? "Select a rating"
                    : ["", "Poor", "Fair", "Good", "Very good", "Excellent"][rating]}
            </Text>

            <Text style={formStyles.label}>Feedback category</Text>

            <View style={formStyles.categories}>
                {CATEGORIES.map((item) => {
                    const selected = category === item.value;

                    return (
                        <TouchableOpacity
                            key={item.value}
                            disabled={loading}
                            onPress={() => {
                                setCategory(item.value);
                                setError("");
                                setSuccess("");
                            }}
                            style={[
                                formStyles.categoryChip,
                                selected && formStyles.categoryChipSelected,
                            ]}
                            activeOpacity={0.75}
                        >
                            <Text
                                style={[
                                    formStyles.categoryText,
                                    selected && formStyles.categoryTextSelected,
                                ]}
                            >
                                {item.label}
                            </Text>
                        </TouchableOpacity>
                    );
                })}
            </View>

            <View style={formStyles.commentHeader}>
                <Text style={formStyles.label}>Comments (optional)</Text>
                <Text style={formStyles.counter}>{comments.length}/5000</Text>
            </View>

            <TextInput
                style={formStyles.input}
                placeholder="Tell us about your experience..."
                placeholderTextColor="#9ca3af"
                value={comments}
                onChangeText={(value) => {
                    setComments(value);
                    setError("");
                    setSuccess("");
                }}
                multiline
                maxLength={5000}
                editable={!loading}
                textAlignVertical="top"
                scrollEnabled
                accessibilityLabel="Feedback comments"
            />

            {error ? (
                <View style={formStyles.errorBox} accessibilityRole="alert">
                    <Ionicons
                        name="alert-circle-outline"
                        size={20}
                        color="#b91c1c"
                    />
                    <Text style={formStyles.errorText}>{error}</Text>
                </View>
            ) : null}

            {success ? (
                <View style={formStyles.successBox} accessibilityRole="alert">
                    <Ionicons
                        name="checkmark-circle-outline"
                        size={20}
                        color="#15803d"
                    />
                    <Text style={formStyles.successText}>{success}</Text>
                </View>
            ) : null}

            <TouchableOpacity
                style={[
                    formStyles.submitButton,
                    loading && formStyles.disabledButton,
                ]}
                onPress={handleSubmit}
                disabled={loading}
                activeOpacity={0.85}
                accessibilityRole="button"
                accessibilityLabel="Submit caregiver feedback"
            >
                {loading ? (
                    <>
                        <ActivityIndicator size="small" color="#ffffff" />
                        <Text style={formStyles.submitButtonText}>
                            Submitting...
                        </Text>
                    </>
                ) : (
                    <>
                        <Ionicons
                            name="send-outline"
                            size={19}
                            color="#ffffff"
                        />
                        <Text style={formStyles.submitButtonText}>
                            Submit Feedback
                        </Text>
                    </>
                )}
            </TouchableOpacity>
        </View>
    );
}

const formStyles = StyleSheet.create({
    card: {
        backgroundColor: "#ffffff",
        borderRadius: 20,
        padding: 18,
        marginTop: 18,
        marginBottom: 12,
        borderWidth: 1,
        borderColor: "#e5e7eb",
        elevation: 2,
        shadowColor: "#000000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 8,
    },
    header: {
        flexDirection: "row",
        alignItems: "center",
        marginBottom: 22,
    },
    iconContainer: {
        width: 48,
        height: 48,
        borderRadius: 14,
        backgroundColor: "#fff7ed",
        alignItems: "center",
        justifyContent: "center",
    },
    headerText: {
        flex: 1,
        marginLeft: 12,
    },
    title: {
        fontSize: 19,
        fontWeight: "700",
        color: "#111827",
    },
    subtitle: {
        marginTop: 4,
        fontSize: 13,
        color: "#6b7280",
        lineHeight: 19,
    },
    label: {
        fontSize: 14,
        fontWeight: "600",
        color: "#374151",
        marginBottom: 10,
    },
    stars: {
        flexDirection: "row",
        justifyContent: "center",
        alignItems: "center",
        marginVertical: 5,
    },
    starButton: {
        paddingHorizontal: 8,
        paddingVertical: 6,
    },
    ratingText: {
        color: "#92400e",
        textAlign: "center",
        fontWeight: "600",
        fontSize: 14,
        marginBottom: 23,
    },
    categories: {
        flexDirection: "row",
        flexWrap: "wrap",
        marginBottom: 20,
        gap: 8,
    },
    categoryChip: {
        borderWidth: 1,
        borderColor: "#d1d5db",
        borderRadius: 20,
        paddingHorizontal: 12,
        paddingVertical: 9,
        backgroundColor: "#ffffff",
    },
    categoryChipSelected: {
        borderColor: "#ea580c",
        backgroundColor: "#fff7ed",
    },
    categoryText: {
        fontSize: 12,
        fontWeight: "500",
        color: "#4b5563",
    },
    categoryTextSelected: {
        color: "#c2410c",
        fontWeight: "700",
    },
    commentHeader: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
    },
    counter: {
        fontSize: 12,
        color: "#6b7280",
        marginBottom: 10,
    },
    input: {
        height: 125,
        maxHeight: 160,
        borderWidth: 1,
        borderColor: "#d1d5db",
        borderRadius: 12,
        padding: 12,
        color: "#111827",
        fontSize: 16,
        backgroundColor: "#f9fafb",
        marginBottom: 14,
    },
    errorBox: {
        flexDirection: "row",
        alignItems: "flex-start",
        gap: 8,
        padding: 12,
        backgroundColor: "#fef2f2",
        borderRadius: 10,
        marginBottom: 14,
    },
    errorText: {
        flex: 1,
        color: "#b91c1c",
        fontSize: 13,
        lineHeight: 19,
    },
    successBox: {
        flexDirection: "row",
        alignItems: "flex-start",
        gap: 8,
        padding: 12,
        backgroundColor: "#f0fdf4",
        borderRadius: 10,
        marginBottom: 14,
    },
    successText: {
        flex: 1,
        color: "#166534",
        fontSize: 13,
        lineHeight: 19,
    },
    submitButton: {
        backgroundColor: "#ea580c",
        minHeight: 50,
        borderRadius: 12,
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "center",
        gap: 10,
        paddingHorizontal: 16,
    },
    disabledButton: {
        opacity: 0.7,
    },
    submitButtonText: {
        color: "#ffffff",
        fontSize: 15,
        fontWeight: "700",
    },
});