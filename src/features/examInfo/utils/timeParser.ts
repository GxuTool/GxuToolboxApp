export type ExamStatus = "upcoming" | "past" | "tbd"; // tbd: to be determined

/**
 * Parses an exam time string (e.g., "2023-01-01(09:00-11:00)") and determines its status.
 * The status is 'past' if the exam's end time is in the past.
 * The returned date is the start time, used for sorting.
 * @param timeStr The string to parse.
 * @param now
 * @returns An object with the parsed start Date and its status.
 */
export function parseExamTime(timeStr: string, now: Date = new Date()): {date: Date | null; status: ExamStatus} {
    // Updated regex to capture start and end times
    const match = timeStr.match(/(\d{4}-\d{2}-\d{2})\((\d{2}:\d{2})-(\d{2}:\d{2})\)/);

    // If format is invalid or time is not specified
    if (!match) {
        return {date: null, status: "tbd"};
    }

    const [, datePart, startTimePart, endTimePart] = match;
    const startDate = new Date(`${datePart}T${startTimePart}:00`);
    const endDate = new Date(`${datePart}T${endTimePart}:00`);

    // Handle cases where the created date is invalid
    if (isNaN(startDate.getTime()) || isNaN(endDate.getTime())) {
        return {date: null, status: "tbd"};
    }

    // Status is determined by the END time of the exam
    const status: ExamStatus = endDate < now ? "past" : "upcoming";

    return {
        date: startDate, // Return the start date for sorting purposes
        status: status,
    };
}
