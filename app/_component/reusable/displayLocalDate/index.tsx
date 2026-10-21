'use client';
import { format as formatDate, isValid, parseISO } from 'date-fns';

interface DisplayLocalDateProps {
    date: Date | string;
    /** date-fns format string (same tokens as before for the common cases: `dd MMM yyyy`, `HH:mm`). */
    format?: string;
    /** How to read `date`: an ISO string shown in local time, a JS Date, or an ISO string shown in UTC. */
    fromFormat?: 'ISO' | 'JSDate' | 'UTC';
}

/** Shifts a date so formatting it in local time prints its UTC wall-clock time. */
const asUtcWallClock = (date: Date) => new Date(date.getTime() + date.getTimezoneOffset() * 60_000);

/** Renders a date in the viewer's time zone (or in UTC with `fromFormat="UTC"`). */
const DisplayLocalDate = ({
    date,
    format = 'dd MMM yyyy',
    fromFormat = 'ISO'
}: DisplayLocalDateProps) => {
    if (!date) return null;

    let value: Date | null = null;
    if (fromFormat === 'JSDate' && date instanceof Date) value = date;
    else if (typeof date === 'string') {
        const parsed = parseISO(date);
        value = fromFormat === 'UTC' ? asUtcWallClock(parsed) : parsed;
    }
    if (!value || !isValid(value)) return null;

    return <time dateTime={value.toISOString()}>{formatDate(value, format)}</time>;
};

export default DisplayLocalDate;
