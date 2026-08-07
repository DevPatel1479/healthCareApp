import { StyleSheet } from "react-native";

export const styles = StyleSheet.create({
    actionContainer: {
        paddingHorizontal: 16,
        gap: 12,
    },

    downloadButton: {
        backgroundColor: "#2563eb",
        borderRadius: 16,
        paddingVertical: 16,
        paddingHorizontal: 20,
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "center",
        gap: 10,
        elevation: 3,
        shadowColor: "#2563eb",
        shadowOpacity: 0.25,
        shadowRadius: 8,
        shadowOffset: {
            width: 0,
            height: 4,
        },
    },

    downloadButtonText: {
        color: "#ffffff",
        fontSize: 16,
        fontWeight: "800",
        letterSpacing: 0.3,
    },
    container: {
        flex: 1,
        backgroundColor: "#f8fafc",
    },

    // ── Header ──
    header: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        paddingHorizontal: 20,
        paddingVertical: 16,
        backgroundColor: "#ffffff",
        borderBottomWidth: 1,
        borderBottomColor: "#e5e7eb",
    },
    backButton: {
        width: 44,
        height: 44,
        borderRadius: 22,
        backgroundColor: "#f3f4f6",
        justifyContent: "center",
        alignItems: "center",
    },
    headerTitle: {
        fontSize: 20,
        fontWeight: "800",
        color: "#111827",
    },

    // ── Date button ──
    dateButton: {
        margin: 16,
        backgroundColor: "#ffffff",
        paddingVertical: 14,
        paddingHorizontal: 20,
        borderRadius: 16,
        flexDirection: "row",
        alignItems: "center",
        gap: 10,
        elevation: 2,
        shadowColor: "#000",
        shadowOpacity: 0.06,
        shadowRadius: 6,
        shadowOffset: { width: 0, height: 2 },
    },
    dateButtonText: {
        flex: 1,
        fontSize: 16,
        fontWeight: "700",
        color: "#111827",
    },

    // ── Center states ──
    center: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
        paddingHorizontal: 24,
        gap: 12,
    },
    loadingText: {
        marginTop: 8,
        fontSize: 16,
        color: "#6b7280",
    },
    emptyTitle: {
        fontSize: 22,
        fontWeight: "800",
        color: "#111827",
    },
    emptySubtitle: {
        fontSize: 15,
        color: "#6b7280",
        textAlign: "center",
    },

    // ── Table ──
    tableContainer: {
        borderRadius: 16,
        overflow: "hidden",
        borderWidth: 1,
        borderColor: "#e2e8f0",
        marginTop: 4,
        backgroundColor: "#ffffff",
    },
    tableHeader: {
        flexDirection: "row",
        backgroundColor: "#1e40af",
        paddingVertical: 13,
        paddingHorizontal: 12,
    },
    headerCell: {
        fontSize: 12,
        fontWeight: "700",
        color: "#ffffff",
        textTransform: "uppercase",
        letterSpacing: 0.6,
        paddingRight: 12,
    },
    tableRowData: {
        flexDirection: "row",
        paddingVertical: 12,
        paddingHorizontal: 12,
        borderBottomWidth: 1,
        borderBottomColor: "#f1f5f9",
        alignItems: "flex-start",
        backgroundColor: "#ffffff",
    },
    tableRowEven: {
        backgroundColor: "#f8fafc",
    },
    cellWrap: {
        paddingRight: 12,
        justifyContent: "flex-start",
    },
    tableCell: {
        fontSize: 13,
        color: "#1e293b",
        lineHeight: 20,
    },
    indexCell: {
        fontWeight: "700",
        color: "#2563eb",
    },
    timeText: {
        fontSize: 11,
        color: "#94a3b8",
        marginTop: 2,
    },
    naText: {
        color: "#94a3b8",
        fontStyle: "italic",
    },
    viewMoreText: {
        fontSize: 12,
        fontWeight: "700",
        color: "#2563eb",
        marginTop: 4,
    },
    viewImageBtn: {
        flexDirection: "row",
        alignItems: "center",
        gap: 4,
        backgroundColor: "#eff6ff",
        paddingHorizontal: 10,
        paddingVertical: 5,
        borderRadius: 8,
        alignSelf: "flex-start",
    },
    link: {
        fontSize: 13,
        fontWeight: "700",
        color: "#2563eb",
    },

    // ── Cards (phone layout) ──
    cardList: {
        padding: 16,
        gap: 14,
        paddingBottom: 32,
    },
    card: {
        backgroundColor: "#ffffff",
        borderRadius: 18,
        overflow: "hidden",
        elevation: 3,
        shadowColor: "#000",
        shadowOpacity: 0.06,
        shadowRadius: 8,
        shadowOffset: { width: 0, height: 2 },
    },
    cardIndexBadge: {
        backgroundColor: "#1e40af",
        paddingHorizontal: 16,
        paddingVertical: 10,
    },
    cardIndexText: {
        fontSize: 13,
        fontWeight: "800",
        color: "#ffffff",
        letterSpacing: 0.5,
    },
    cardRow: {
        flexDirection: "row",
        paddingHorizontal: 16,
        paddingVertical: 12,
        borderBottomWidth: 1,
        borderBottomColor: "#f1f5f9",
        alignItems: "flex-start",
        gap: 12,
    },
    cardRowLast: {
        borderBottomWidth: 0,
    },
    cardLabel: {
        width: 90,
        fontSize: 12,
        fontWeight: "700",
        color: "#64748b",
        textTransform: "uppercase",
        letterSpacing: 0.4,
        paddingTop: 2,
    },
    cardValueWrap: {
        flex: 1,
    },
    cardValue: {
        fontSize: 14,
        color: "#1e293b",
        lineHeight: 21,
    },
});