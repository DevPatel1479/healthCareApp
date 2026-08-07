import { styles } from "@/styles/date-picker.styles";
import DateTimePicker, {
    DateTimePickerEvent,
} from "@react-native-community/datetimepicker";

import { useRouter } from "expo-router";
import { useMemo, useState } from "react";

import {
    Platform,
    Pressable,
    SafeAreaView,
    ScrollView,
    StyleSheet,
    Text,
    View,
    useWindowDimensions,
} from "react-native";


/**
 * Convert Date -> YYYY-MM-DD
 *
 * IMPORTANT:
 * Uses local date components instead of
 * toISOString(), because toISOString()
 * converts to UTC and can cause date shifting.
 */
const formatDateForApi = (date: Date) => {
    const year = date.getFullYear();

    const month = String(
        date.getMonth() + 1
    ).padStart(2, "0");

    const day = String(
        date.getDate()
    ).padStart(2, "0");

    return `${year}-${month}-${day}`;
};


/**
 * Format date for UI
 */
const formatDateForDisplay = (
    date: Date
) => {
    return date.toLocaleDateString(
        "en-IN",
        {
            weekday: "long",
            day: "numeric",
            month: "long",
            year: "numeric",
        }
    );
};


/**
 * Remove time from Date
 */
const startOfDay = (date: Date) => {
    const result = new Date(date);

    result.setHours(
        0,
        0,
        0,
        0
    );

    return result;
};


export default function PatientDatePickerScreen() {

    const router = useRouter();

    const { width } =
        useWindowDimensions();

    const isSmallScreen =
        width < 360;


    // ----------------------------------------
    // Today
    // ----------------------------------------

    const today = useMemo(() => {
        return startOfDay(new Date());
    }, []);


    // ----------------------------------------
    // Selected date
    // Default = today
    // ----------------------------------------

    const [selectedDate, setSelectedDate] =
        useState<Date>(today);


    const [showPicker, setShowPicker] =
        useState(false);


    const [error, setError] =
        useState("");


    // ----------------------------------------
    // Display date
    // ----------------------------------------

    const displayDate =
        formatDateForDisplay(selectedDate);


    // ----------------------------------------
    // API date
    // ----------------------------------------

    const apiDate =
        formatDateForApi(selectedDate);


    // ----------------------------------------
    // Date picker change
    // ----------------------------------------

    const handleDateChange = (
        event: DateTimePickerEvent,
        date?: Date
    ) => {

        // Android:
        // user pressed Cancel
        if (
            Platform.OS === "android"
        ) {
            setShowPicker(false);
        }

        if (
            event.type === "dismissed"
        ) {
            return;
        }

        if (!date) {
            return;
        }

        const selected =
            startOfDay(date);


        // --------------------------------------
        // Don't allow future date
        // --------------------------------------

        if (selected > today) {
            setError(
                "You can only select today or a previous date."
            );

            setSelectedDate(today);

            return;
        }


        setError("");

        setSelectedDate(selected);
    };


    // ----------------------------------------
    // Continue
    // ----------------------------------------

    const handleContinue = () => {

        setError("");


        // Safety validation
        const selected =
            startOfDay(selectedDate);


        // Future date protection
        if (selected > today) {
            setError(
                "Please select today or a previous date."
            );

            return;
        }


        const date =
            formatDateForApi(selected);


        console.log(
            "Selected patient date:",
            date
        );


        router.replace({
            pathname:
                "/(patient)/dashboard",

            params: {
                date,
            },
        });
    };


    // ----------------------------------------
    // Go back
    // ----------------------------------------

    // const handleBack = () => {
    //     router.back();
    // };


    return (
        <SafeAreaView
            style={styles.safeArea}
        >

            <ScrollView
                contentContainerStyle={[
                    styles.scrollContent,
                    isSmallScreen &&
                    styles.scrollContentSmall,
                ]}
                keyboardShouldPersistTaps="handled"
                showsVerticalScrollIndicator={false}
            >

                <View
                    style={[
                        styles.container,
                        {
                            maxWidth:
                                isSmallScreen
                                    ? 500
                                    : 600,
                        },
                    ]}
                >

                    {/* -------------------------------- */}
                    {/* Back */}
                    {/* -------------------------------- */}

                    {/* <Pressable
                        onPress={handleBack}
                        style={({ pressed }) => [
                            styles.backButton,
                            pressed &&
                            styles.pressed,
                        ]}
                    >
                        <Text
                            style={styles.backIcon}
                        >
                            {"‹"}
                        </Text>

                        <Text
                            style={styles.backText}
                        >
                            Back
                        </Text>
                    </Pressable> */}


                    {/* -------------------------------- */}
                    {/* Header */}
                    {/* -------------------------------- */}

                    <View
                        style={styles.header}
                    >

                        <View
                            style={styles.iconContainer}
                        >
                            <Text
                                style={styles.calendarIcon}
                            >
                                📅
                            </Text>
                        </View>

                        <Text
                            style={[
                                styles.title,
                                isSmallScreen &&
                                styles.titleSmall,
                            ]}
                        >
                            Select a date
                        </Text>

                        <Text
                            style={[
                                styles.subtitle,
                                isSmallScreen &&
                                styles.subtitleSmall,
                            ]}
                        >
                            Choose the day for which you
                            want to view your care tasks.
                        </Text>

                    </View>


                    {/* -------------------------------- */}
                    {/* Card */}
                    {/* -------------------------------- */}

                    <View
                        style={styles.card}
                    >

                        <Text
                            style={styles.label}
                        >
                            Selected date
                        </Text>


                        {/* -------------------------------- */}
                        {/* Date Button */}
                        {/* -------------------------------- */}

                        <Pressable
                            onPress={() => {
                                setError("");
                                setShowPicker(true);
                            }}
                            style={({ pressed }) => [
                                styles.dateButton,
                                pressed &&
                                styles.pressed,
                            ]}
                        >

                            <View
                                style={styles.dateIconBox}
                            >
                                <Text
                                    style={styles.dateIcon}
                                >
                                    📅
                                </Text>
                            </View>


                            <View
                                style={styles.dateTextContainer}
                            >

                                <Text
                                    style={[
                                        styles.dateText,
                                        isSmallScreen &&
                                        styles.dateTextSmall,
                                    ]}
                                >
                                    {displayDate}
                                </Text>

                                <Text
                                    style={styles.apiDate}
                                >
                                    {apiDate}
                                </Text>

                            </View>


                            <Text
                                style={styles.chevron}
                            >
                                ›
                            </Text>

                        </Pressable>


                        {/* -------------------------------- */}
                        {/* Native Picker */}
                        {/* -------------------------------- */}

                        {showPicker && (
                            <DateTimePicker
                                value={selectedDate}
                                mode="date"
                                display={
                                    Platform.OS === "ios"
                                        ? "spinner"
                                        : "default"
                                }
                                maximumDate={today}
                                onChange={
                                    handleDateChange
                                }
                            />
                        )}


                        {/* -------------------------------- */}
                        {/* Error */}
                        {/* -------------------------------- */}

                        {error ? (
                            <View
                                style={styles.errorBox}
                            >
                                <Text
                                    style={styles.errorText}
                                >
                                    {error}
                                </Text>
                            </View>
                        ) : null}


                        {/* -------------------------------- */}
                        {/* Information */}
                        {/* -------------------------------- */}

                        <View
                            style={styles.infoBox}
                        >

                            <Text
                                style={styles.infoIcon}
                            >
                                ℹ️
                            </Text>

                            <Text
                                style={styles.infoText}
                            >
                                You can view today's tasks or
                                review tasks from previous days.
                            </Text>

                        </View>


                        {/* -------------------------------- */}
                        {/* Continue */}
                        {/* -------------------------------- */}

                        <Pressable
                            onPress={handleContinue}
                            style={({ pressed }) => [
                                styles.continueButton,
                                pressed &&
                                styles.pressed,
                            ]}
                        >

                            <Text
                                style={styles.continueText}
                            >
                                Continue
                            </Text>

                            <Text
                                style={styles.continueArrow}
                            >
                                →
                            </Text>

                        </Pressable>

                    </View>


                    {/* -------------------------------- */}
                    {/* Footer */}
                    {/* -------------------------------- */}

                    <Text
                        style={styles.footer}
                    >
                        You can change the date later
                        from the patient dashboard.
                    </Text>

                </View>

            </ScrollView>

        </SafeAreaView>
    );
}


