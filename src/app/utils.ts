export function formatDateRelativeAuto(date: Date, locale = "en") {
    const SECONDS_IN_MINUTE = 60;
    const SECONDS_IN_HOUR = SECONDS_IN_MINUTE * 60;
    const SECONDS_IN_DAY = SECONDS_IN_HOUR * 24;
    const SECONDS_IN_WEEK = SECONDS_IN_DAY * 7;
    const SECONDS_IN_MONTH = SECONDS_IN_DAY * 30; // Approximation
    const SECONDS_IN_YEAR = SECONDS_IN_DAY * 365; // Approximation

    const now = new Date();
    const diffInSeconds = Math.round((date.valueOf() - now.valueOf()) / 1000);

    const rtf = new Intl.RelativeTimeFormat(locale, { style: 'short', numeric: "auto" });

    if (Math.abs(diffInSeconds) >= SECONDS_IN_YEAR) {
        return rtf.format(Math.round(diffInSeconds / SECONDS_IN_YEAR), "year");
    } else if (Math.abs(diffInSeconds) >= SECONDS_IN_MONTH) {
        return rtf.format(
            Math.round(diffInSeconds / SECONDS_IN_MONTH),
            "month",
        );
    } else if (Math.abs(diffInSeconds) >= SECONDS_IN_WEEK) {
        return rtf.format(Math.round(diffInSeconds / SECONDS_IN_WEEK), "week");
    } else if (Math.abs(diffInSeconds) >= SECONDS_IN_DAY) {
        return rtf.format(Math.round(diffInSeconds / SECONDS_IN_DAY), "day");
    } else if (Math.abs(diffInSeconds) >= SECONDS_IN_HOUR) {
        return rtf.format(Math.round(diffInSeconds / SECONDS_IN_HOUR), "hour");
    } else if (Math.abs(diffInSeconds) >= SECONDS_IN_MINUTE) {
        return rtf.format(
            Math.round(diffInSeconds / SECONDS_IN_MINUTE),
            "minute",
        );
    } else {
        return rtf.format(diffInSeconds, "second");
    }
}
