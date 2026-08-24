import { StyleSheet } from "react-native";

export const styles = StyleSheet.create({
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