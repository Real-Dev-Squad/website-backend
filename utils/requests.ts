/**
 * Calculates the new deadline based on the current date, the old end date, and the additional duration in milliseconds.
 *
 * @param {number} currentDate - The current date as a timestamp in milliseconds.
 * @param {number} oldEndsOn - The previous end date as a timestamp in milliseconds.
 * @param {number} numberOfDaysInMillisecond - The duration to extend the deadline, in milliseconds.
 * @returns {number} The new deadline as a timestamp in milliseconds.
*/
export const getNewDeadline = (currentDate: number, oldEndsOn: number, numberOfDaysInMillisecond: number): number => {
    if (currentDate > oldEndsOn) {
        return currentDate + numberOfDaysInMillisecond;
    }
    return oldEndsOn + numberOfDaysInMillisecond;
};

/**
 * Converts a date string into a timestamp in milliseconds.
 * Validates whether the provided string is a valid date format.
 *
 * @param {string} date - The date string to convert (e.g., "2024-10-17T16:10:52.668Z").
 * @returns {{ isDate: boolean, milliseconds?: number }} An object indicating validity and the timestamp if valid.
 */
export const convertDateStringToMilliseconds = (date: string): { isDate: boolean; milliseconds?: number; } => {
    const milliseconds = Date.parse(date);
    if (!milliseconds) {
        return {
            isDate: false,
        };
    }
    return {
        isDate: true,
        milliseconds,
    };
};