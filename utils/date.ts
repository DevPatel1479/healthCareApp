/**
 * Convert Date -> YYYY-MM-DD
 *
 * IMPORTANT:
 * Uses local date components instead of
 * toISOString(), because toISOString()
 * converts to UTC and can cause date shifting.
 */


export const formatDateForApi = (
    date: Date
): string => {
    const year = date.getFullYear();

    const month = String(
        date.getMonth() + 1
    ).padStart(2, "0");

    const day = String(
        date.getDate()
    ).padStart(2, "0");

    return `${year}-${month}-${day}`;
}



/**
 * Format date for UI
 */

export const formatDateForDisplay = (
    date: Date
): string => {
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

export const startOfDay = (date: Date): Date => {
    const result = new Date(date);

    result.setHours(
        0,
        0,
        0,
        0
    );

    return result;
};

/**
 * Check whether a date is in the future.
 */

export const isFutureDate = (
    date: Date,
    today: Date
): boolean => {
    return startOfDay(date) > startOfDay(today);
};
