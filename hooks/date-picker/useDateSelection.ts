import {
    useMemo,
    useState,
} from "react";

import {
    Platform,
} from "react-native";

import {
    DateTimePickerEvent,
} from "@react-native-community/datetimepicker";

import {
    formatDateForApi,
    formatDateForDisplay,
    isFutureDate,
    startOfDay,
} from "../../utils/date";


export const useDateSelection = () => {

    // ----------------------------------------
    // Today
    // ----------------------------------------

    const today = useMemo(() => {
        return startOfDay(
            new Date()
        );
    }, []);


    // ----------------------------------------
    // Selected date
    // Default = today
    // ----------------------------------------

    const [
        selectedDate,
        setSelectedDate
    ] = useState<Date>(today);


    // ----------------------------------------
    // Picker visibility
    // ----------------------------------------

    const [
        showPicker,
        setShowPicker
    ] = useState(false);


    // ----------------------------------------
    // Error
    // ----------------------------------------

    const [
        error,
        setError
    ] = useState("");


    // ----------------------------------------
    // Open picker
    // ----------------------------------------

    const openPicker = () => {
        setError("");
        setShowPicker(true);
    };


    // ----------------------------------------
    // Date picker change
    // ----------------------------------------

    const handleDateChange = (
        event: DateTimePickerEvent,
        date?: Date
    ) => {

        // Android:
        // User pressed Cancel
        if (
            Platform.OS === "android"
        ) {
            setShowPicker(false);
        }


        // Picker was dismissed
        if (
            event.type === "dismissed"
        ) {
            return;
        }


        // No date returned
        if (!date) {
            return;
        }


        const selected =
            startOfDay(date);


        // --------------------------------------
        // Don't allow future date
        // --------------------------------------

        if (
            isFutureDate(
                selected,
                today
            )
        ) {
            setError(
                "You can only select today or a previous date."
            );

            setSelectedDate(today);

            return;
        }


        // Valid date
        setError("");
        setSelectedDate(selected);
    };


    // ----------------------------------------
    // Validate selected date
    // ----------------------------------------

    const validateSelectedDate = (): boolean => {

        const selected =
            startOfDay(selectedDate);


        if (
            isFutureDate(
                selected,
                today
            )
        ) {
            setError(
                "Please select today or a previous date."
            );

            return false;
        }


        return true;
    };


    // ----------------------------------------
    // Formatted values
    // ----------------------------------------

    const displayDate =
        formatDateForDisplay(
            selectedDate
        );


    const apiDate =
        formatDateForApi(
            selectedDate
        );


    // ----------------------------------------
    // Public API of hook
    // ----------------------------------------

    return {

        // State
        selectedDate,
        today,
        showPicker,
        error,

        // Formatted values
        displayDate,
        apiDate,

        // Actions
        openPicker,
        handleDateChange,
        validateSelectedDate,

        // Useful if parent ever needs
        // to clear/change the error.
        setError,
    };
};