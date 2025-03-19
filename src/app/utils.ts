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

export function isAlphanumericCharCodeOrDash(charCode: number): boolean {
    return (
        (charCode >= 48 && charCode <= 57) || // Numbers 0-9
        (charCode >= 65 && charCode <= 90) || // Uppercase letters A-Z
        (charCode >= 97 && charCode <= 122) || // Lowercase letters a-z
        charCode === 45 // Dash -
    );
}

export function removeNonAlphanumeric(str: string): string {
    let result = "";
    for (let i = 0; i < str.length; i++) {
        const char = str[i];
        const charCode = str.charCodeAt(i);

        if (
            isAlphanumericCharCodeOrDash(charCode) ||
            charCode === 32 // Space character
        ) {
            result += char;
        }
    }
    return result;
}
