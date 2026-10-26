
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
    { label: "Overall Care", value: "overall_care" },
    { label: "Caregiver Performance", value: "caregiver_performance" },
    { label: "Communication", value: "communication" },
    { label: "Punctuality", value: "punctuality" },
    { label: "Task Clarity", value: "task_clarity" },
    { label: "App Experience", value: "app_experience" },
    { label: "Other", value: "other" },
] as const;

type PatientFeedbackProps = {
    caregiverId: number | null;
};


type FeedbackCategory = (typeof CATEGORIES)[number]["value"];

export default function PatientFeedback({
    caregiverId,
}: PatientFeedbackProps) {
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

        if (comments.trim().length > 5000) {
            setError("Feedback cannot exceed 5000 characters.");
            return;
        }
        if (
            category === "caregiver_performance" &&
            caregiverId == null
        ) {
            setError(
                "The assigned caregiver ID is unavailable. Please refresh and try again."
            );
            return;
        }
        try {
            setLoading(true);

            const referenceId = await AsyncStorage.getItem("reference_id");

            if (!referenceId || !Number.isFinite(Number(referenceId))) {
                throw new Error(
                    "Patient ID is missing. Please log in again."
                );
            }

            const payload = {
                patient_id: Number(referenceId),

                // Automatically include the currently assigned caregiver ID.
                ...(caregiverId != null
                    ? { caregiver_id: Number(caregiverId) }
                    : {}),

                rating,
                category,
                comments: comments.trim(),
            };

            console.log("Submitting feedback payload:", payload);

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

            setSuccess(data.message || "Thank you! Your feedback was submitted.");
            setRating(0);
            setCategory("overall_care");
            setComments("");
        } catch (err: any) {
            console.error(
                "Patient feedback submission failed:",
                err?.response?.status,
                err?.response?.data || err?.message
            );

            setError(
                err?.response?.data?.message ||
                err?.response?.data?.error ||
                err?.message ||
                "Unable to submit feedback. Please check your connection and try again."
            );
        } finally {
            setLoading(false);
        }
    };

    return (
        <View style={styles.card}>
            <View style={styles.header}>
                <View style={styles.iconContainer}>
                    <Ionicons
                        name="chatbubble-ellipses-outline"
                        size={25}
                        color="#2563eb"
                    />
                </View>

                <View style={styles.headerText}>
                    <Text style={styles.title}>Share Your Feedback</Text>
                    <Text style={styles.subtitle}>
                        Help us improve your care experience.
                    </Text>
                </View>
            </View>

            <Text style={styles.label}>How would you rate your experience?</Text>

            <View style={styles.stars}>
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
                        style={styles.starButton}
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

            <Text style={styles.ratingText}>
                {rating === 0
                    ? "Select a rating"
                    : [
                        "",
                        "Poor",
                        "Fair",
                        "Good",
                        "Very good",
                        "Excellent",
                    ][rating]}
            </Text>

            <Text style={styles.label}>Feedback category</Text>

            <View style={styles.categories}>
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
                                styles.categoryChip,
                                selected && styles.categoryChipSelected,
                            ]}
                            activeOpacity={0.75}
                        >
                            <Text
                                style={[
                                    styles.categoryText,
                                    selected && styles.categoryTextSelected,
                                ]}
                            >
                                {item.label}
                            </Text>
                        </TouchableOpacity>
                    );
                })}
            </View>

            <View style={styles.commentHeader}>
                <Text style={styles.label}>Comments (optional)</Text>
                <Text style={styles.counter}>{comments.length}/5000</Text>
            </View>

            <TextInput
                style={styles.input}
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
                <View style={styles.messageBoxError} accessibilityRole="alert">
                    <Ionicons
                        name="alert-circle-outline"
                        size={20}
                        color="#b91c1c"
                    />
                    <Text style={styles.errorText}>{error}</Text>
                </View>
            ) : null}

            {success ? (
                <View style={styles.messageBoxSuccess} accessibilityRole="alert">
                    <Ionicons
                        name="checkmark-circle-outline"
                        size={20}
                        color="#15803d"
                    />
                    <Text style={styles.successText}>{success}</Text>
                </View>
            ) : null}

            <TouchableOpacity
                style={[styles.submitButton, loading && styles.disabledButton]}
                onPress={handleSubmit}
                disabled={loading}
                activeOpacity={0.85}
                accessibilityRole="button"
                accessibilityLabel="Submit feedback"
            >
                {loading ? (
                    <>
                        <ActivityIndicator size="small" color="#ffffff" />
                        <Text style={styles.submitButtonText}>Submitting...</Text>
                    </>
                ) : (
                    <>
                        <Ionicons
                            name="send-outline"
                            size={19}
                            color="#ffffff"
                        />
                        <Text style={styles.submitButtonText}>Submit Feedback</Text>
                    </>
                )}
            </TouchableOpacity>
        </View>
    );
}

const styles = StyleSheet.create({
    card: {
        backgroundColor: "#ffffff",
        borderRadius: 20,
        padding: 18,
        marginTop: 22,
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
        backgroundColor: "#eff6ff",
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
        borderColor: "#2563eb",
        backgroundColor: "#eff6ff",
    },
    categoryText: {
        fontSize: 12,
        fontWeight: "500",
        color: "#4b5563",
    },
    categoryTextSelected: {
        color: "#1d4ed8",
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
    messageBoxError: {
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
    messageBoxSuccess: {
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
        backgroundColor: "#2563eb",
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
