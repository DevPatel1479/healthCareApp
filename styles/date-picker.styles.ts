
import { StyleSheet } from "react-native";

export const styles = StyleSheet.create({

    safeArea: {
        flex: 1,
        backgroundColor: "#F7F9FC",
    },

    scrollContent: {
        flexGrow: 1,
        paddingHorizontal: 20,
        paddingVertical: 24,
        justifyContent: "center",
    },

    scrollContentSmall: {
        paddingHorizontal: 16,
        paddingVertical: 20,
    },

    container: {
        width: "100%",
        alignSelf: "center",
    },

    pressed: {
        opacity: 0.75,
    },


    // ----------------------------------------
    // Back
    // ----------------------------------------

    backButton: {
        flexDirection: "row",
        alignItems: "center",
        alignSelf: "flex-start",
        paddingVertical: 8,
        paddingHorizontal: 4,
        marginBottom: 20,
    },

    backIcon: {
        fontSize: 30,
        lineHeight: 30,
        marginRight: 6,
        color: "#344054",
    },

    backText: {
        fontSize: 15,
        fontWeight: "600",
        color: "#344054",
    },


    // ----------------------------------------
    // Header
    // ----------------------------------------

    header: {
        alignItems: "center",
        marginBottom: 28,
    },

    iconContainer: {
        width: 64,
        height: 64,
        borderRadius: 20,
        backgroundColor: "#EAF2FF",
        alignItems: "center",
        justifyContent: "center",
        marginBottom: 16,
    },

    calendarIcon: {
        fontSize: 30,
    },

    title: {
        fontSize: 30,
        lineHeight: 38,
        fontWeight: "800",
        color: "#101828",
        textAlign: "center",
    },

    titleSmall: {
        fontSize: 26,
        lineHeight: 34,
    },

    subtitle: {
        marginTop: 8,
        maxWidth: 450,
        fontSize: 15,
        lineHeight: 23,
        color: "#667085",
        textAlign: "center",
    },

    subtitleSmall: {
        fontSize: 14,
        lineHeight: 21,
    },


    // ----------------------------------------
    // Card
    // ----------------------------------------

    card: {
        width: "100%",
        backgroundColor: "#FFFFFF",
        borderRadius: 20,
        padding: 22,

        shadowColor: "#000",
        shadowOffset: {
            width: 0,
            height: 4,
        },
        shadowOpacity: 0.08,
        shadowRadius: 12,

        elevation: 4,
    },


    // ----------------------------------------
    // Label
    // ----------------------------------------

    label: {
        fontSize: 14,
        fontWeight: "700",
        color: "#344054",
        marginBottom: 10,
    },


    // ----------------------------------------
    // Date Button
    // ----------------------------------------

    dateButton: {
        minHeight: 76,
        width: "100%",
        borderWidth: 1,
        borderColor: "#D0D5DD",
        borderRadius: 14,
        paddingHorizontal: 14,
        paddingVertical: 12,

        flexDirection: "row",
        alignItems: "center",
    },

    dateIconBox: {
        width: 48,
        height: 48,
        borderRadius: 12,
        backgroundColor: "#F2F4F7",
        alignItems: "center",
        justifyContent: "center",
        marginRight: 12,
    },

    dateIcon: {
        fontSize: 22,
    },

    dateTextContainer: {
        flex: 1,
        minWidth: 0,
    },

    dateText: {
        fontSize: 16,
        fontWeight: "700",
        color: "#101828",
    },

    dateTextSmall: {
        fontSize: 14,
    },

    apiDate: {
        marginTop: 3,
        fontSize: 12,
        color: "#667085",
    },

    chevron: {
        fontSize: 28,
        color: "#98A2B3",
        marginLeft: 8,
    },


    // ----------------------------------------
    // Error
    // ----------------------------------------

    errorBox: {
        marginTop: 14,
        paddingHorizontal: 14,
        paddingVertical: 11,
        borderRadius: 10,
        backgroundColor: "#FEF3F2",
        borderWidth: 1,
        borderColor: "#FDA29B",
    },

    errorText: {
        fontSize: 13,
        lineHeight: 19,
        color: "#B42318",
    },


    // ----------------------------------------
    // Information
    // ----------------------------------------

    infoBox: {
        flexDirection: "row",
        alignItems: "flex-start",
        marginTop: 18,
        padding: 13,
        borderRadius: 12,
        backgroundColor: "#F2F4F7",
    },

    infoIcon: {
        fontSize: 16,
        marginRight: 8,
    },

    infoText: {
        flex: 1,
        fontSize: 13,
        lineHeight: 19,
        color: "#667085",
    },


    // ----------------------------------------
    // Continue
    // ----------------------------------------

    continueButton: {
        minHeight: 54,
        marginTop: 22,
        borderRadius: 13,
        backgroundColor: "#2563EB",

        flexDirection: "row",
        alignItems: "center",
        justifyContent: "center",

        paddingHorizontal: 20,
    },

    continueText: {
        fontSize: 16,
        fontWeight: "700",
        color: "#FFFFFF",
    },

    continueArrow: {
        fontSize: 20,
        color: "#FFFFFF",
        marginLeft: 10,
    },


    // ----------------------------------------
    // Footer
    // ----------------------------------------

    footer: {
        marginTop: 22,
        textAlign: "center",
        fontSize: 12,
        lineHeight: 18,
        color: "#98A2B3",
    },

});