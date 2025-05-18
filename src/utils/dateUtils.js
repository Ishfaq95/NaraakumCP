import moment from "moment";

/**
 * Formats a date and time string to UTC format
 * @param {string} date - The date in YYYY-MM-DD format
 * @param {string} time - The time in HH:mm format
 * @returns {string} Formatted date and time in UTC (YYYY-MM-DDTHH:mm:ss.SSSZ)
 */
export const formatDateTimeToLocal = (date, time) => {
  try {
    // Combine date and time and create UTC moment
    const dateTimeUTC = moment.utc(`${date}T${time}`);

    // Return formatted string with Z suffix
    return dateTimeUTC.format("YYYY-MM-DDTHH:mm:ss.SSS[Z]");
  } catch (error) {
    console.error("Error formatting date time:", error);
    return null;
  }
};

/**
 * Formats a date and time string to UTC format
 * @param {string} date - The date in YYYY-MM-DD format
 * @param {string} time - The time in HH:mm format
 * @returns {string} Formatted date and time in UTC (YYYY-MM-DDTHH:mm:ss.SSSZ)
 */
export const formatDateTimeToUTC = (date, time) => {
  try {
    // Create UTC moment directly
    const dateTimeUTC = moment.utc(`${date}T${time}`);

    // Return formatted string with Z suffix
    return dateTimeUTC.format("YYYY-MM-DDTHH:mm:ss.SSS[Z]");
  } catch (error) {
    console.error("Error formatting date time:", error);
    return null;
  }
};
