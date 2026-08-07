import { StyleSheet } from "react-native";

export const styles = StyleSheet.create({
    disabledCreateTaskBtn: {
        opacity: 0.45,
    },
    selectedDateCard: {
        marginTop: 16,
        marginBottom: 18,

        backgroundColor: "#eff6ff",

        borderWidth: 1,
        borderColor: "#bfdbfe",

        borderRadius: 14,

        paddingHorizontal: 14,
        paddingVertical: 12,

        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
    },

    selectedDateInfo: {
        flexDirection: "row",
        alignItems: "center",
        flex: 1,
        minWidth: 0,
    },

    selectedDateLabel: {
        fontSize: 11,
        color: "#64748b",
        marginBottom: 2,
    },

    selectedDateText: {
        fontSize: 15,
        fontWeight: "700",
        color: "#1e3a8a",
    },

    changeDateButton: {
        flexDirection: "row",
        alignItems: "center",

        paddingHorizontal: 10,
        paddingVertical: 8,

        borderRadius: 9,

        backgroundColor: "#ffffff",

        borderWidth: 1,
        borderColor: "#bfdbfe",

        marginLeft: 10,
    },

    changeDateText: {
        marginLeft: 5,
        fontSize: 13,
        fontWeight: "700",
        color: "#2563eb",
    },

    disabledFab: {
        opacity: 0.4,
    },

    disabledFabIcon: {
        color: "#6b7280",
    },
    imageModalBackdrop: {
        flex: 1,
        backgroundColor: "rgba(0,0,0,0.95)",
        justifyContent: "center",
        alignItems: "center",
        padding: 16,
    },
    imageCloseBtn: {
        position: "absolute",
        top: 50,
        right: 16,
        zIndex: 10,
    },
    imageModalContent: {
        width: "100%",
        height: "80%",
        justifyContent: "center",
        alignItems: "center",
    },
    patientImage: {
        width: "100%",
        height: "100%",
        maxWidth: 900,
        maxHeight: 700,
    },
    imageLoaderOverlay: {
        position: "absolute",
        zIndex: 2,
        alignItems: "center",
    },
    imageLoaderText: {
        color: "#fff",
        marginTop: 12,
        fontSize: 14,
    },
    imageErrorText: {
        color: "#fff",
        fontSize: 16,
        textAlign: "center",
    },
    modalBackdrop: {
        flex: 1,
        backgroundColor: "rgba(0,0,0,0.45)",
        justifyContent: "flex-end",
    },

    bottomSheet: {
        backgroundColor: "#FFF",
        borderTopLeftRadius: 24,
        borderTopRightRadius: 24,
        paddingHorizontal: 20,
        paddingTop: 12,
        paddingBottom: 30,
        maxHeight: "70%",
    },

    sheetHandle: {
        alignSelf: "center",
        width: 50,
        height: 5,
        borderRadius: 3,
        backgroundColor: "#D1D5DB",
        marginBottom: 16,
    },

    sheetHeader: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        marginBottom: 20,
    },

    sheetTitle: {
        fontSize: 20,
        fontWeight: "700",
        color: "#111827",
    },

    closeText: {
        color: "#2563EB",
        fontWeight: "600",
        fontSize: 15,
    },

    contactCard: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        paddingVertical: 14,
        paddingHorizontal: 16,
        borderRadius: 16,
        backgroundColor: "#F9FAFB",
        marginBottom: 12,
    },

    contactName: {
        fontSize: 16,
        fontWeight: "600",
        color: "#111827",
    },

    contactPhone: {
        marginTop: 4,
        color: "#6B7280",
        fontSize: 14,
    },

    callButton: {
        backgroundColor: "#10B981",
        paddingHorizontal: 18,
        paddingVertical: 10,
        borderRadius: 12,
    },

    callButtonText: {
        color: "#FFF",
        fontWeight: "700",
    },

    errorContainer: {
        alignItems: "center",
        paddingVertical: 30,
    },

    errorTitle: {
        fontSize: 18,
        fontWeight: "700",
        marginBottom: 8,
        color: "#DC2626",
    },

    errorMessage: {
        textAlign: "center",
        color: "#6B7280",
    },

    emptyContainer: {
        alignItems: "center",
        paddingVertical: 30,
    },

    emptyText: {
        color: "#6B7280",
        fontSize: 15,
    },
    qrOverlay: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
        backgroundColor: "rgba(0,0,0,0.55)",
    },

    qrModalCard: {
        width: "85%",
        maxWidth: 360,

        backgroundColor: "#fff",

        borderRadius: 24,

        padding: 24,

        alignItems: "center",

        elevation: 8,
    },

    qrClose: {
        position: "absolute",
        right: 15,
        top: 15,
    },

    qrTitle: {
        fontSize: 22,
        fontWeight: "700",
        color: "#111827",
        marginTop: 10,
    },

    qrSubtitle: {
        fontSize: 14,
        color: "#6b7280",
        marginTop: 4,
        marginBottom: 18,
    },

    qrImage: {
        width: 240,
        height: 240,
    },

    emptyQrContainer: {
        alignItems: "center",
        paddingVertical: 30,
    },

    emptyQrText: {
        marginTop: 10,
        color: "#ef4444",
        fontWeight: "600",
    },

    qrButton: {
        marginTop: 20,
        backgroundColor: "#2563eb",
        width: "100%",
        borderRadius: 12,
        paddingVertical: 14,
        alignItems: "center",
    },

    qrButtonText: {
        color: "#fff",
        fontWeight: "700",
        fontSize: 16,
    },

    topHeader: {
        paddingHorizontal: 20,
        marginBottom: 16,
    },

    profileCard: {
        backgroundColor: "#fff",
        borderRadius: 18,
        padding: 16,

        elevation: 4,

        shadowColor: "#000",
        shadowOpacity: 0.08,
        shadowRadius: 8,

        marginBottom: 12,
    },

    profileContent: {
        flexDirection: "row",
        alignItems: "center",
    },

    actionRow: {
        flexDirection: "row",
        justifyContent: "space-between",
    },

    circleBtn: {
        flex: 1,

        backgroundColor: "#fff",

        marginHorizontal: 4,

        height: 52,

        borderRadius: 14,

        justifyContent: "center",
        alignItems: "center",

        elevation: 3,

        shadowColor: "#000",
        shadowOpacity: 0.08,
        shadowRadius: 6,
    },
    createTaskModalBox: {
        width: "100%",
        backgroundColor: "#fff",

        borderTopLeftRadius: 24,
        borderTopRightRadius: 24,

        padding: 22,

        maxHeight: "85%",
    },
    createTaskHeader: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        marginBottom: 20,
    },

    createTaskTitle: {
        fontSize: 22,
        fontWeight: "700",
        color: "#111827",
    },

    inputLabel: {
        fontSize: 14,
        fontWeight: "600",
        color: "#374151",
        marginBottom: 10,
        marginTop: 8,
    },

    createTaskInput: {
        borderWidth: 1,
        borderColor: "#d1d5db",
        borderRadius: 16,
        padding: 16,
        minHeight: 110,
        fontSize: 15,
        color: "#111827",
        textAlignVertical: "top",
        backgroundColor: "#f9fafb",
    },

    categoryContainer: {
        marginTop: 6,
        gap: 12,
    },

    categoryOption: {
        flexDirection: "row",
        alignItems: "center",
        paddingVertical: 14,
        paddingHorizontal: 14,
        borderRadius: 16,
        borderWidth: 1.5,
        borderColor: "#e5e7eb",
        backgroundColor: "#fff",
    },

    categoryOptionActive: {
        borderColor: "#2563eb",
        backgroundColor: "#eff6ff",
    },

    categoryOptionText: {
        marginLeft: 12,
        fontSize: 15,
        color: "#374151",
        fontWeight: "500",
        flex: 1,
    },

    categoryOptionTextActive: {
        color: "#2563eb",
        fontWeight: "700",
    },

    radioOuter: {
        width: 22,
        height: 22,
        borderRadius: 11,
        borderWidth: 2,
        borderColor: "#9ca3af",
        alignItems: "center",
        justifyContent: "center",
    },

    radioOuterActive: {
        borderColor: "#2563eb",
    },

    radioInner: {
        width: 10,
        height: 10,
        borderRadius: 5,
        backgroundColor: "#2563eb",
    },

    createTaskBtn: {

        marginTop: 24,
        backgroundColor: "#2563eb",
        borderRadius: 18,
        paddingVertical: 16,
        alignItems: "center",
        justifyContent: "center",
        flexDirection: "row",
        gap: 10,
    },

    createTaskBtnText: {
        color: "#fff",
        fontWeight: "700",
        fontSize: 16,
    },
    reportCard: {
        backgroundColor: "#ffffff",
        marginTop: 18,
        marginBottom: 6,
        borderRadius: 22,
        paddingVertical: 16,
        paddingHorizontal: 18,
        flexDirection: "row",
        alignItems: "center",
        shadowColor: "#000",
        shadowOpacity: 0.08,
        shadowRadius: 12,
        elevation: 5,
        borderWidth: 1,
        borderColor: "#e0f2fe",
    },

    reportIconContainer: {
        width: 62,
        height: 62,
        borderRadius: 31,
        backgroundColor: "#eff6ff",
        justifyContent: "center",
        alignItems: "center",
        marginRight: 16,
    },

    reportContent: {
        flex: 1,
    },

    reportTitle: {
        fontSize: 18,
        fontWeight: "800",
        color: "#111827",
        marginBottom: 4,
    },

    reportSubtitle: {
        fontSize: 14,
        color: "#6b7280",
        lineHeight: 20,
    },

    reportArrow: {
        marginLeft: 12,
    },
    caregiverModalCard: {
        backgroundColor: "#fff",
        borderRadius: 28,
        padding: 24,
        width: "100%",
        maxWidth: 420,
        alignSelf: "center",
        shadowColor: "#000",
        shadowOpacity: 0.18,
        shadowRadius: 20,
        elevation: 12,
    },

    caregiverHeader: {
        flexDirection: "row",
        alignItems: "center",
        marginBottom: 24,
    },

    caregiverTitle: {
        flex: 1,
        fontSize: 22,
        fontWeight: "800",
        color: "#111827",
        marginLeft: 12,
    },

    caregiverCloseBtn: {
        width: 38,
        height: 38,
        borderRadius: 19,
        backgroundColor: "#f3f4f6",
        justifyContent: "center",
        alignItems: "center",
    },

    caregiverAvatar: {
        width: 92,
        height: 92,
        borderRadius: 46,
        backgroundColor: "#eff6ff",
        justifyContent: "center",
        alignItems: "center",
        alignSelf: "center",
        marginBottom: 24,
    },

    infoCard: {
        backgroundColor: "#f8fafc",
        borderRadius: 20,
        padding: 18,
    },

    infoRow: {
        flexDirection: "row",
        alignItems: "center",
    },

    infoContent: {
        flex: 1,
        marginLeft: 14,
    },

    infoLabel: {
        fontSize: 13,
        color: "#6b7280",
        marginBottom: 4,
    },

    infoValue: {
        fontSize: 17,
        fontWeight: "700",
        color: "#111827",
    },

    infoDivider: {
        height: 1,
        backgroundColor: "#e5e7eb",
        marginVertical: 18,
    },

    emptyState: {
        alignItems: "center",
        paddingVertical: 24,
    },

    emptyTitle: {
        marginTop: 16,
        fontSize: 20,
        fontWeight: "700",
        color: "#111827",
    },

    emptySubtitle: {
        marginTop: 8,
        fontSize: 14,
        color: "#6b7280",
        textAlign: "center",
        lineHeight: 22,
    },
    // profileCard: {
    //     flex: 1,
    //     backgroundColor: "#ffffff",
    //     borderRadius: 20,
    //     marginRight: 12,
    //     shadowColor: "#000",
    //     shadowOpacity: 0.08,
    //     shadowRadius: 10,
    //     elevation: 4,
    // },

    // profileContent: {
    //     flexDirection: "row",
    //     alignItems: "center",
    //     padding: 14,
    // },

    avatarContainer: {
        marginRight: 14,
    },

    profileInfo: {
        flex: 1,
    },

    welcomeText: {
        fontSize: 13,
        color: "#6b7280",
        fontWeight: "500",
    },

    profileName: {
        fontSize: 20,
        fontWeight: "800",
        color: "#111827",
        marginTop: 2,
        flexShrink: 1,
    },

    viewCaregiverText: {
        fontSize: 14,
        color: "#2563eb",
        fontWeight: "600",
        marginTop: 6,
    },
    topBar: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        marginBottom: 20,
        paddingHorizontal: 16,
    },


    profileSubText: {
        fontSize: 12,
        color: "#2563eb",
        marginTop: 2,
    },

    topActions: {
        flexDirection: "row",
        gap: 10,
    },

    actionBtn: {
        width: 48,
        height: 48,
        borderRadius: 24,
        backgroundColor: "#ffffff",
        justifyContent: "center",
        alignItems: "center",
        shadowColor: "#000",
        shadowOpacity: 0.06,
        shadowRadius: 8,
        elevation: 3,
    },
    taskWrapper: {
        marginBottom: 14,
        backgroundColor: "#fff",
        borderRadius: 12,
        padding: 10,
        shadowColor: "#000",
        shadowOpacity: 0.05,
        shadowRadius: 6,
        elevation: 2,
    },

    observationContainer: {
        marginTop: 8,
        paddingTop: 8,
        borderTopWidth: 1,
        borderTopColor: "#e5e7eb",
    },

    observationHeader: {
        flexDirection: "row",
        alignItems: "center",
        gap: 6,
        marginBottom: 6,
    },

    observationLabel: {
        fontSize: 12,
        color: "#0369a1",
        fontWeight: "600",
    },

    observationBtn: {
        flexDirection: "row",
        alignItems: "center",
        gap: 6,
        backgroundColor: "#0284c7",
        paddingVertical: 6,
        paddingHorizontal: 10,
        borderRadius: 8,
        alignSelf: "flex-start",
    },

    observationText: {
        color: "#fff",
        fontSize: 13,
        fontWeight: "600",
    },

    modalCloseBtn: {
        position: "absolute",
        right: 12,
        top: 12,
        zIndex: 10,
        backgroundColor: "#f1f5f9",
        padding: 6,
        borderRadius: 20,
    },
    avatarBtn: {
        backgroundColor: "#f1f5f9",
        padding: 6,
        borderRadius: 20,
    },
    detailText: {
        fontSize: 16,
        marginBottom: 8,
        color: "#111",
    },

    logoutIconBtn: {
        backgroundColor: "#f1f5f9",
        padding: 10,        // 🔥 bigger touch area
        borderRadius: 20,
    },
    screenTitle: {
        fontSize: 20,
        fontWeight: "bold",
        color: "#111",
    },

    logoutBtn: {
        backgroundColor: "#111",
        paddingVertical: 6,
        paddingHorizontal: 12,
        borderRadius: 8,
    },


    modalButtonContainer: {
        marginTop: 10,
        gap: 12,   // 👈 THIS creates spacing between buttons
        alignItems: "center",
    },
    categoryBlock: {
        marginTop: 18,
        padding: 12,
        borderRadius: 12,
        backgroundColor: "#fff",
        shadowColor: "#000",
        shadowOpacity: 0.05,
        shadowRadius: 6,
        elevation: 2,
    },

    categoryHeader: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        marginBottom: 10,
    },

    taskList: {
        paddingLeft: 8,
        borderLeftWidth: 2,
        borderLeftColor: "#e5e7eb",
    },

    countBadge: {
        backgroundColor: "#111",
        paddingHorizontal: 8,
        paddingVertical: 2,
        borderRadius: 10,
    },

    countText: {
        color: "#fff",
        fontSize: 12,
        fontWeight: "bold",
    },

    closeBtn: {
        position: "absolute",
        right: 12,
        top: 12,
        zIndex: 10,
    },

    // closeText: {
    //     fontSize: 20,
    //     fontWeight: "bold",
    //     color: "#000",
    // },
    categoryTitle: {
        fontSize: 16,
        fontWeight: "bold",
        marginBottom: 10,
        color: "#111",
    },

    center: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
    },

    retryBtn: {
        backgroundColor: "black",
        padding: 10,
        borderRadius: 8,
    },

    imageBtn: {
        backgroundColor: "#2563eb",
        paddingVertical: 12,
        paddingHorizontal: 18,
        borderRadius: 10,

        alignSelf: "center",   // 👈 prevents full stretch
        minWidth: 140,         // 👈 consistent button size
        alignItems: "center",
        justifyContent: "center",
    },
    preview: {
        width: "100%",
        height: 180,
        borderRadius: 10,
        marginBottom: 10,
    },
    container: {
        flex: 1,
        backgroundColor: "#f8fafc",
    },

    //  COMPLETE FAB
    completeFabContainer: {
        position: "absolute",
        bottom: 90,
        right: 20,
    },

    completeFab: {
        height: 64,
        width: 64,
        borderRadius: 32,
        backgroundColor: "#ef4444",
        justifyContent: "center",
        alignItems: "center",
        elevation: 8,
    },

    fabIcon: {
        color: "#fff",
        fontSize: 26,
        fontWeight: "bold",
    },

    badge: {
        position: "absolute",
        top: 6,
        right: 6,
        backgroundColor: "#fff",
        minWidth: 20,
        height: 20,
        borderRadius: 10,
        justifyContent: "center",
        alignItems: "center",
    },

    badgeText: {
        color: "#ef4444",
        fontSize: 11,
        fontWeight: "bold",
    },

    //  ADD FAB
    addFab: {
        position: "absolute",
        bottom: 20,
        right: 20,
        height: 64,
        width: 64,
        borderRadius: 32,
        backgroundColor: "#22c55e",
        justifyContent: "center",
        alignItems: "center",
        elevation: 8,
    },

    addIcon: {
        color: "#fff",
        fontSize: 30,
        fontWeight: "bold",
    },

    //  MODAL
    modalOverlay: {
        flex: 1,
        backgroundColor: "rgba(0,0,0,0.5)",

        justifyContent: "flex-end", // 👈 key fix (NOT center)
    },
    modalBox: {
        backgroundColor: "#fff",
        borderRadius: 20,
        padding: 18,

        width: "100%",
        maxWidth: 420,
        alignSelf: "center",

        shadowColor: "#000",
        shadowOpacity: 0.15,
        shadowRadius: 12,
        elevation: 8,
    },

    modalTitle: {
        fontSize: 18,
        fontWeight: "bold",
        marginBottom: 12,
    },

    input: {
        borderWidth: 1,
        borderColor: "#ddd",
        borderRadius: 10,
        padding: 12,
        marginBottom: 16,
    },

    modalActions: {
        flexDirection: "row",
        justifyContent: "flex-end",
        gap: 10,
    },

    cancelBtn: {
        padding: 10,
    },

    addBtn: {
        backgroundColor: "#22c55e",
        paddingVertical: 12,
        paddingHorizontal: 18,
        borderRadius: 10,

        alignSelf: "center",   // 👈 stops stretch
        minWidth: 120,         // 👈 consistent button size
        alignItems: "center",  // 👈 centers text
        justifyContent: "center",
    },
    buttonPrimary: {
        backgroundColor: "#2563eb",
        paddingVertical: 12,
        paddingHorizontal: 18,
        borderRadius: 12,

        alignSelf: "center",
        minWidth: 160,

        alignItems: "center",
        justifyContent: "center",

        flexDirection: "row",
    },

    buttonSuccess: {
        backgroundColor: "#22c55e",
        paddingVertical: 12,
        paddingHorizontal: 18,
        borderRadius: 12,

        alignSelf: "center",
        minWidth: 160,

        alignItems: "center",
        justifyContent: "center",

        flexDirection: "row",
    },
    sosBtn: {
        position: "absolute",
        bottom: 20,
        left: 20,
        height: 70,
        width: 70,
        borderRadius: 35,
        backgroundColor: "#dc2626",
        justifyContent: "center",
        alignItems: "center",
        elevation: 10,
    },

    sosText: {
        color: "#fff",
        fontWeight: "bold",
        fontSize: 18,
    },



});