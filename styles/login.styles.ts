import { StyleSheet } from "react-native";

export const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "#f8fafc",
    },
    scroll: {
        flexGrow: 1,
        justifyContent: "center",
        paddingVertical: 40,
    },

    inner: {
        paddingHorizontal: 20,
    },

    header: {
        alignItems: "center",
        marginBottom: 30,
    },
    badge: {
        backgroundColor: "#fee2e2",
        color: "#ef4444",
        paddingHorizontal: 14,
        paddingVertical: 6,
        borderRadius: 20,
        marginBottom: 15,
        fontSize: 12,
    },
    title: {
        fontSize: 26,
        fontWeight: "bold",
        textAlign: "center",
    },
    brand: {
        color: "#ef4444",
    },
    subtitle: {
        marginTop: 8,
        color: "#666",
        textAlign: "center",
    },

    card: {
        backgroundColor: "#fff",
        padding: 20,
        borderRadius: 16,
        elevation: 4,
    },

    steps: {
        flexDirection: "row",
        justifyContent: "center",
        marginBottom: 15,
        gap: 6,
    },
    dot: {
        height: 4,
        width: 20,
        backgroundColor: "#ddd",
        borderRadius: 10,
    },
    activeDot: {
        width: 30,
        backgroundColor: "#ef4444",
    },

    cardTitle: {
        textAlign: "center",
        fontWeight: "bold",
        fontSize: 18,
    },
    cardDesc: {
        textAlign: "center",
        color: "#666",
        marginBottom: 20,
    },

    footer: {
        textAlign: "center",
        marginTop: 20,
        fontSize: 12,
        color: "#999",
    },
    errorBox: {
        backgroundColor: "#fee2e2",
        padding: 12,
        borderRadius: 10,
        marginBottom: 15,
        borderWidth: 1,
        borderColor: "#ef4444",
    },

    errorText: {
        color: "#b91c1c",
        textAlign: "center",
        fontWeight: "600",
    },
});