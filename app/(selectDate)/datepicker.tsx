import AsyncStorage from
    "@react-native-async-storage/async-storage";

import {
    useRouter,
} from "expo-router";

import {
    useWindowDimensions,
} from "react-native";

import DateSelectionView from "@/components/date-picker/DateSelectionView";

import { useDateSelection } from "@/hooks/date-picker/useDateSelection";


export default function PatientDatePickerScreen() {

    const router = useRouter();


    // ----------------------------------------
    // Screen dimensions
    // ----------------------------------------

    const {
        width
    } = useWindowDimensions();


    const isSmallScreen =
        width < 360;


    // ----------------------------------------
    // Date selection logic
    // ----------------------------------------

    const {
        selectedDate,
        today,
        showPicker,
        error,
        displayDate,
        apiDate,
        openPicker,
        handleDateChange,
        validateSelectedDate,
        setError,
    } = useDateSelection();


    // ----------------------------------------
    // Continue
    // ----------------------------------------

    const handleContinue = async () => {

        // Clear previous error
        setError("");


        // ----------------------------------------
        // Safety validation
        // ----------------------------------------

        const isValid =
            validateSelectedDate();


        if (!isValid) {
            return;
        }


        try {

            // ----------------------------------------
            // Get user role
            // ----------------------------------------

            const role =
                await AsyncStorage.getItem(
                    "role"
                );


            console.log(
                "Selected date:",
                apiDate
            );

            console.log(
                "Role:",
                role
            );


            // ----------------------------------------
            // Family lead
            // ----------------------------------------

            if (
                role === "family_lead"
            ) {

                router.replace({
                    pathname:
                        "/(patient)/dashboard",

                    params: {
                        date: apiDate,
                    },
                });

                return;
            }


            // ----------------------------------------
            // Caregiver
            // ----------------------------------------

            if (
                role === "caregiver"
            ) {

                router.replace({
                    pathname:
                        "/(caregiver)/dashboard",

                    params: {
                        date: apiDate,
                    },
                });

                return;
            }


            // ----------------------------------------
            // Invalid role
            // ----------------------------------------

            setError(
                "Invalid user role."
            );

        }
        catch (error) {

            console.error(
                "Failed to retrieve user role:",
                error
            );


            setError(
                "Unable to retrieve user information."
            );
        }
    };


    // ----------------------------------------
    // UI
    // ----------------------------------------

    return (
        <DateSelectionView

            selectedDate={
                selectedDate
            }

            today={
                today
            }

            showPicker={
                showPicker
            }

            error={
                error
            }

            displayDate={
                displayDate
            }

            apiDate={
                apiDate
            }

            isSmallScreen={
                isSmallScreen
            }

            onOpenPicker={
                openPicker
            }

            onDateChange={
                handleDateChange
            }

            onContinue={
                handleContinue
            }

        />
    );
}