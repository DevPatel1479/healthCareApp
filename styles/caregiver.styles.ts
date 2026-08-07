import { Dimensions, StyleSheet } from "react-native";


export const styles = StyleSheet.create({

    fullScreenImageContainer: {
        flex: 1,
        backgroundColor: "#000",
    },

    fullScreenImage: {
        width: Dimensions.get("window").width,
        height: Dimensions.get("window").height,
    },

    imageCloseBtn: {
        position: "absolute",
        top: 55,
        right: 20,
        zIndex: 9999,

        width: 44,
        height: 44,
        borderRadius: 22,

        backgroundColor: "rgba(0,0,0,0.6)",

        justifyContent: "center",
        alignItems: "center",
    },
    observationModalOverlay: {
        flex: 1,
        backgroundColor: "rgba(15,23,42,0.65)",
        justifyContent: "center",
        alignItems: "center",
        padding: 24,
    },

    observationModalCard: {
        width: "100%",
        maxWidth: 420,
        backgroundColor: "#fff",
        borderRadius: 28,
        padding: 24,

        shadowColor: "#000",
        shadowOpacity: 0.2,
        shadowRadius: 20,
        elevation: 12,
    },

    observationHeader: {
        flexDirection: "row",
        alignItems: "center",
        marginBottom: 18,
    },

    observationIcon: {
        width: 46,
        height: 46,
        borderRadius: 23,
        backgroundColor: "#dbeafe",
        justifyContent: "center",
        alignItems: "center",
        marginRight: 12,
    },

    observationTitle: {
        fontSize: 22,
        fontWeight: "800",
        color: "#111827",
    },

    observationContent: {
        backgroundColor: "#f8fafc",
        borderRadius: 18,
        padding: 18,
        minHeight: 120,
    },

    observationTextLarge: {
        fontSize: 16,
        lineHeight: 26,
        color: "#374151",
    },

    observationCloseBtn: {
        marginTop: 20,
        backgroundColor: "#2563eb",
        borderRadius: 16,
        paddingVertical: 14,
        alignItems: "center",
    },

    observationCloseText: {
        color: "#fff",
        fontSize: 16,
        fontWeight: "700",
    },

    imageModalOverlay: {
        flex: 1,
        backgroundColor: "rgba(0,0,0,0.92)",
        justifyContent: "center",
        alignItems: "center",
    },

    imageViewerContainer: {
        width: "100%",
        height: "100%",
        justifyContent: "center",
        alignItems: "center",
    },


    imageCard: {
        width: "92%",
        height: "72%",
        backgroundColor: "#fff",
        borderRadius: 24,
        overflow: "hidden",

        shadowColor: "#000",
        shadowOpacity: 0.25,
        shadowRadius: 20,
        elevation: 12,
    },

    zoomHint: {
        position: "absolute",
        bottom: 30,
        alignSelf: "center",

        backgroundColor: "rgba(255,255,255,0.15)",
        paddingHorizontal: 16,
        paddingVertical: 8,
        borderRadius: 20,
    },

    zoomHintText: {
        color: "#fff",
        fontSize: 13,
        fontWeight: "600",
    },

    observationContainer: {
        marginTop: 10,
        paddingHorizontal: 12,
    },

    observationBtn: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: "#2563eb",
        paddingVertical: 10,
        borderRadius: 10,
    },

    observationText: {
        color: "#fff",
        fontWeight: "600",
        marginLeft: 6,
    },

    detailText: {
        fontSize: 16,
        color: "#374151",
        lineHeight: 24,
        marginTop: 12,
    },

    modalOverlay: {
        flex: 1,
        backgroundColor: "rgba(0,0,0,0.5)",
        justifyContent: "center",
        alignItems: "center",
        padding: 20,
    },

    modalBox: {
        width: "90%",
        backgroundColor: "#fff",
        borderRadius: 16,
        padding: 20,
    },





    profileName: {
        fontSize: 20,
        fontWeight: "800",
        color: "#111827",
        marginTop: 2,
        flexShrink: 1, // allows full name to wrap if needed
    },

    viewPatientText: {
        fontSize: 14,
        color: "#2563eb",
        fontWeight: "600",
        marginTop: 6,
    },
    profileRole: {
        fontSize: 12,
        color: "#2563eb",
        marginTop: 4,
        fontWeight: "600",
    },

    patientModalOverlay: {
        flex: 1,
        backgroundColor: "rgba(0,0,0,0.55)",
        justifyContent: "center",
        padding: 24,
    },

    patientModalCard: {
        backgroundColor: "#ffffff",
        borderRadius: 28,
        padding: 24,
        shadowColor: "#000",
        shadowOpacity: 0.2,
        shadowRadius: 20,
        elevation: 10,
    },

    patientCloseBtn: {
        position: "absolute",
        top: 18,
        right: 18,
        zIndex: 10,
    },

    patientHeader: {
        alignItems: "center",
        marginBottom: 28,
    },

    patientTitle: {
        fontSize: 28,
        fontWeight: "800",
        color: "#111827",
        marginTop: 12,
    },

    patientSubtitle: {
        fontSize: 15,
        color: "#6b7280",
        marginTop: 6,
    },

    patientInfoCard: {
        backgroundColor: "#f8fafc",
        borderRadius: 22,
        padding: 20,
        marginBottom: 24,
    },

    patientRow: {
        flexDirection: "row",
        alignItems: "center",
    },

    patientValue: {
        fontSize: 18,
        fontWeight: "600",
        color: "#111827",
        marginLeft: 14,
        flex: 1,
    },

    patientDivider: {
        height: 1,
        backgroundColor: "#e5e7eb",
        marginVertical: 18,
    },

    closePatientButton: {
        backgroundColor: "#2563eb",
        paddingVertical: 16,
        borderRadius: 18,
        alignItems: "center",
    },

    closePatientButtonText: {
        color: "#ffffff",
        fontSize: 17,
        fontWeight: "700",
    },

    emptyPatientState: {
        alignItems: "center",
        paddingVertical: 20,
    },

    emptyPatientText: {
        marginTop: 14,
        fontSize: 16,
        color: "#6b7280",
    },
    avatarContainer: {
        marginRight: 12,
    },

    profileInfo: {
        flex: 1,
    },

    welcomeText: {
        fontSize: 12,
        color: "#6b7280",
    },



    profileSubText: {
        fontSize: 12,
        color: "#2563eb",
        marginTop: 2,
    },

    profileCard: {
        flex: 1,
        flexDirection: "row",
        alignItems: "center",
        backgroundColor: "#ffffff",
        padding: 12,
        borderRadius: 18,
        marginRight: 12,
        shadowColor: "#000",
        shadowOpacity: 0.06,
        shadowRadius: 8,
        elevation: 3,
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
    topBar: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        marginBottom: 16,
    },

    leftActions: {
        flexDirection: "row",
        alignItems: "center",
        gap: 12,
    },

    iconBtn: {
        backgroundColor: "#ffffff",
        padding: 10,
        borderRadius: 20,
        elevation: 2,
        shadowColor: "#000",
        shadowOpacity: 0.08,
        shadowRadius: 4,
    },

    infoModal: {
        backgroundColor: "#fff",
        borderRadius: 20,
        padding: 24,
        width: "90%",
        maxWidth: 380,
        alignSelf: "center",
    },

    infoTitle: {
        fontSize: 22,
        fontWeight: "bold",
        marginBottom: 20,
        color: "#111",
    },

    infoText: {
        fontSize: 17,
        color: "#374151",
        marginBottom: 12,
    },
    logoutFab: {
        position: "absolute",
        bottom: 20,
        left: 20,   // 👈 opposite side of your green FAB
        height: 56,
        width: 56,
        borderRadius: 28,
        backgroundColor: "#111",
        justifyContent: "center",
        alignItems: "center",
        elevation: 8,
    },

    logoutText: {
        color: "#fff",
        fontSize: 22,
        fontWeight: "bold",
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
    refreshBtn: {
        backgroundColor: "#111",
        paddingVertical: 10,
        borderRadius: 10,
        alignItems: "center",
        marginBottom: 12,
    },
    closeText: {
        fontSize: 20,
        fontWeight: "bold",
        color: "#000",
    },
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
    // modalOverlay: {
    //   flex: 1,
    //   backgroundColor: "rgba(0,0,0,0.4)",
    //   justifyContent: "center",
    //   padding: 20,
    // },
    banner: {
        position: "absolute",
        top: 0,
        left: 0,
        right: 0,
        backgroundColor: "#22c55e",
        padding: 14,
        zIndex: 999,
        alignItems: "center",
    },

    bannerText: {
        color: "#fff",
        fontWeight: "bold",
    },
    // modalBox: {
    //   backgroundColor: "#fff",
    //   borderRadius: 20,
    //   padding: 18,

    //   width: "100%",
    //   maxWidth: 420,
    //   alignSelf: "center",

    //   shadowColor: "#000",
    //   shadowOpacity: 0.15,
    //   shadowRadius: 12,
    //   elevation: 8,
    // },

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
});