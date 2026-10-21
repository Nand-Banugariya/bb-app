'use client';

import * as React from 'react';
import { format, isSameDay } from 'date-fns';
import type { DateRange } from 'react-day-picker';
import { Popover, PopoverContent, PopoverTrigger } from '../popover';
import { Calendar } from '../calendar';
import { CalendarTodayIcon } from '@components/icons/material';
import { cn } from '@lib/utils';
import { fieldLabelClasses, fieldOpenClasses, fieldVariants } from './field-variants';

export interface BbDateInputProps {
    mode?: 'single' | 'range';
    selected?: Date | DateRange;
    onSelect?: (date: Date | DateRange | undefined) => void;
    placeholder?: string;
    className?: string;
    /** Width classes for the trigger. @default "w-70" (280px) */
    width?: string;
    numberOfMonths?: number;
    label?: string;
    error?: boolean;
    disabled?: boolean;
    disablePastDates?: boolean;
    /** Trigger height: sm 32 · default 36 · lg 44. */
    size?: 'sm' | 'default' | 'lg';
    /** Accessible name when there's no visible `label`. */
    'aria-label'?: string;
}

/**
 * Date (or date range) field: a field-styled trigger opening the Calendar in a popover.
 * Range mode closes after the second click (start, then end).
 */
export function BbDateInput({
    mode = 'single',
    selected,
    onSelect,
    placeholder,
    className,
    width = 'w-70',
    numberOfMonths = 1,
    label,
    error = false,
    disabled = false,
    disablePastDates = false,
    size = 'default',
    'aria-label': ariaLabel
}: BbDateInputProps) {
    const triggerId = React.useId();
    const [date, setDate] = React.useState<Date>();
    const [dateRange, setDateRange] = React.useState<DateRange>();
    const [open, setOpen] = React.useState(false);
    // Range being picked while the calendar is open, and clicks so far.
    const [draftRange, setDraftRange] = React.useState<DateRange>();
    const rangeClicksRef = React.useRef(0);
    const [today] = React.useState(() => {
        const d = new Date();
        d.setHours(0, 0, 0, 0);
        return d;
    });

    const handleOpenChange = (next: boolean) => {
        if (next) {
            rangeClicksRef.current = 0;
            setDraftRange(undefined);
        }
        setOpen(next);
    };

    const isRange = mode === 'range';

    const handleSelect = (next: Date | DateRange | undefined) => {
        if (isRange) {
            const range = next as DateRange | undefined;
            rangeClicksRef.current += 1;
            const isComplete =
                !range ||
                (!!range.from &&
                    !!range.to &&
                    (rangeClicksRef.current >= 2 || !isSameDay(range.from, range.to)));
            setDraftRange(range);
            if (!isComplete) return;
            setOpen(false);
            if (onSelect) onSelect(range);
            else setDateRange(range);
            return;
        }
        setOpen(false);
        if (onSelect) onSelect(next);
        else setDate(next as Date);
    };

    const currentSelected = selected ?? (isRange ? dateRange : date);
    const calendarSelected = isRange && open && draftRange ? draftRange : currentSelected;
    const isEmpty = isRange ? !(currentSelected as DateRange)?.from : !currentSelected;

    const displayText = (() => {
        if (isRange) {
            const range = currentSelected as DateRange | undefined;
            if (range?.from && range.to) {
                return isSameDay(range.from, range.to)
                    ? format(range.from, 'MMM d, yyyy')
                    : `${format(range.from, 'MMM d')} – ${format(range.to, 'MMM d, yyyy')}`;
            }
            return placeholder || 'Start – end date';
        }
        return currentSelected && !('from' in currentSelected)
            ? format(currentSelected as Date, 'PPP')
            : placeholder || 'Pick a date';
    })();

    const disabledDates = disablePastDates ? { before: today } : undefined;

    return (
        <div className={label ? 'flex flex-col gap-1.5' : 'flex items-end'}>
            {label && (
                <label htmlFor={triggerId} className={fieldLabelClasses}>
                    {label}
                </label>
            )}
            <Popover open={open} onOpenChange={handleOpenChange}>
                <PopoverTrigger asChild>
                    <button
                        type="button"
                        id={triggerId}
                        data-invalid={error || undefined}
                        aria-label={ariaLabel}
                        data-empty={isEmpty}
                        disabled={disabled}
                        className={cn(
                            fieldVariants({ size }),
                            fieldOpenClasses,
                            'cursor-pointer items-center gap-2 text-left',
                            error && 'shadow-error',
                            isEmpty ? 'text-muted-foreground' : 'text-foreground',
                            width,
                            className
                        )}>
                        <CalendarTodayIcon
                            aria-hidden
                            className="size-[1.125rem] shrink-0 text-muted-foreground"
                        />
                        <span className="truncate">{displayText}</span>
                    </button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                    {isRange ? (
                        <Calendar
                            mode="range"
                            selected={calendarSelected as DateRange}
                            onSelect={handleSelect}
                            numberOfMonths={numberOfMonths}
                            disabled={disabledDates}
                        />
                    ) : (
                        <Calendar
                            mode="single"
                            selected={currentSelected as Date}
                            onSelect={handleSelect}
                            disabled={disabledDates}
                        />
                    )}
                </PopoverContent>
            </Popover>
        </div>
    );
}

export default BbDateInput;
