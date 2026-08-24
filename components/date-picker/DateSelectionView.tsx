import DateTimePicker, { DateTimePickerEvent } from "@react-native-community/datetimepicker";

import {
    Platform,
    Pressable,
    SafeAreaView,
    ScrollView,
    Text,
    View,
} from "react-native";

import { styles } from "@/styles/date-picker.styles";


type DateSelectionViewProps = {

    selectedDate: Date;

    today: Date;

    showPicker: boolean;

    error: string;

    displayDate: string;

    apiDate: string;

    isSmallScreen: boolean;

    onOpenPicker: () => void;

    onDateChange: (
        event: DateTimePickerEvent,
        date?: Date
    ) => void;

    onContinue: () => void;
};


export default function DateSelectionView({
    selectedDate,
    today,
    showPicker,
    error,
    displayDate,
    apiDate,
    isSmallScreen,
    onOpenPicker,
    onDateChange,
    onContinue,
}: DateSelectionViewProps) {

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
                            onPress={onOpenPicker}
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
                                style={
                                    styles.dateTextContainer
                                }
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
                                    onDateChange
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
                                    style={
                                        styles.errorText
                                    }
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
                            onPress={onContinue}
                            style={({ pressed }) => [
                                styles.continueButton,
                                pressed &&
                                styles.pressed,
                            ]}
                        >

                            <Text
                                style={
                                    styles.continueText
                                }
                            >
                                Continue
                            </Text>


                            <Text
                                style={
                                    styles.continueArrow
                                }
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