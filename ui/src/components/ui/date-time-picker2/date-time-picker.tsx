// found https://github.com/huybuidac/shadcn-datetime-picker,
// edited/moved some stuff
import * as React from 'react';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { CalendarIcon } from 'lucide-react';
import {
  format,
  getMonth,
  getYear,
  setMonth as setMonthFns,
  setYear,
  startOfYear,
  startOfMonth,
  endOfMonth,
  endOfYear,
  addMonths,
  subMonths,
} from 'date-fns';
import {
  ChevronDownIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  ChevronUpIcon,
  XCircle,
} from 'lucide-react';
import { DateRange, DayPicker, Matcher, TZDate } from 'react-day-picker';

import { cn } from '@/lib/utils';
import { Button, buttonVariants } from '@/components/ui/button';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { ScrollArea } from '@/components/ui/scroll-area';
import { TimeOption, TimePicker } from './time-picker';

// changing internal DayPicker to be a range picker and calling it
// if i ever need a date picker also i can abstract away the surronding
// code and make two small components that just inject the DayPicker

export type CalendarProps = Omit<React.ComponentProps<typeof DayPicker>, 'mode'>;

export type DateTimePickerProps = {
  /**
   * The datetime value to display and control for the start of the range.
   */
  fromValue: Date | undefined;
  /**
   * Callback function to handle 'from' changes.
   */
  onFromChange: (date: Date | undefined) => void;
  /**
   * The datetime value to display and control for the end of the range.
   */
  toValue: Date | undefined;
  /**
   * Callback function to handle 'to' changes.
   */
  onToChange: (date: Date | undefined) => void;
  /**
   * The minimum datetime value allowed.
   * @default undefined
   */
  min?: Date;
  /**
   * The maximum datetime value allowed.
   */
  max?: Date;
  /**
   * The timezone to display the datetime in, based on the date-fns.
   * For a complete list of valid time zone identifiers, refer to:
   * https://en.wikipedia.org/wiki/List_of_tz_database_time_zones
   * @default undefined
   */
  timezone?: string;
  /**
   * Whether the datetime picker is disabled.
   * @default false
   */
  disabled?: boolean;
  /**
   * Whether to show the time picker.
   * @default false
   */
  hideTime?: boolean;
  /**
   * Whether to use 12-hour format.
   * @default false
   */
  use12HourFormat?: boolean;
  /**
   * Whether to show the clear button.
   * @default false
   */
  clearable?: boolean;
  /**
   * Custom class names for the component.
   */
  classNames?: {
    /**
     * Custom class names for the trigger (the button that opens the picker).
     */
    trigger?: string;
  };
  timePicker?: {
    hour?: boolean;
    minute?: boolean;
    second?: boolean;
  };
  /**
   * Custom render function for the trigger.
   */
  renderTrigger?: (props: DateTimeRenderTriggerProps) => React.ReactNode;
};

export type DateTimeRenderTriggerProps = {
  value: Date[] | undefined;
  open: boolean;
  timezone?: string;
  disabled?: boolean;
  use12HourFormat?: boolean;
  setOpen: (open: boolean) => void;
};

export function DateTimePicker({
  fromValue,
  toValue,
  onFromChange,
  onToChange,
  renderTrigger,
  min,
  max,
  timezone,
  hideTime,
  use12HourFormat,
  disabled,
  clearable,
  classNames,
  timePicker,
  ...props
}: DateTimePickerProps & CalendarProps) {
  const [open, setOpen] = useState(false);
  const [monthYearPicker, setMonthYearPicker] = useState<'month' | 'year' | false>(false);

  const initFromDate = useMemo(() => new TZDate(fromValue || new Date(), timezone), [fromValue, timezone]);
  const initToDate = useMemo(() => new TZDate(toValue || new Date(), timezone), [toValue, timezone]);

  const [month, setMonth] = useState<Date>(initFromDate);
  const [date, setDate] = useState<Date>(initFromDate);

  const [fromDate, setFromDate] = useState<Date>(initFromDate);
  const [toDate, setToDate] = useState<Date>(initToDate);

  const [dateRange, setDateRange] = useState<DateRange>({ from: initFromDate });

  const endMonth = useMemo(() => {
    return setYear(month, getYear(month) + 1);
  }, [month]);
  const minDate = useMemo(() => (min ? new TZDate(min, timezone) : undefined), [min, timezone]);
  const maxDate = useMemo(() => (max ? new TZDate(max, timezone) : undefined), [max, timezone]);

  const onDayChange = (d: Date, fromToDate: Date, setter: typeof setFromDate) => {
    d.setHours(fromToDate.getHours(), fromToDate.getMinutes(), fromToDate.getSeconds());
    if (min && d < min) {
      d.setHours(min.getHours(), min.getMinutes(), min.getSeconds());
    }
    if (max && d > max) {
      d.setHours(max.getHours(), max.getMinutes(), max.getSeconds());
    }
    setter(d);
  }

  const onDayRangeChanged = useCallback(
    (r: DateRange) => {
      console.log("range", r)
      r.from && onDayChange(r.from, fromDate, setFromDate)
      r.to && onDayChange(r.to, toDate, setToDate)
      setDateRange(r)
    },
    [setDate, setMonth]
  );
  const onSumbit = useCallback(() => {
    onFromChange(new Date(fromDate));
    onToChange(new Date(toDate));
    setOpen(false);
  }, [fromDate, toDate, onFromChange, onToChange]);

  const onMonthYearChanged = useCallback(
    (d: Date, mode: 'month' | 'year') => {
      setMonth(d);
      if (mode === 'year') {
        setMonthYearPicker('month');
      } else {
        setMonthYearPicker(false);
      }
    },
    [setMonth, setMonthYearPicker]
  );
  const onNextMonth = useCallback(() => {
    setMonth(addMonths(month, 1));
  }, [month]);
  const onPrevMonth = useCallback(() => {
    setMonth(subMonths(month, 1));
  }, [month]);

  useEffect(() => {
    if (open) {
      setDate(initFromDate);
      setMonth(initFromDate);
      setMonthYearPicker(false);
    }
  }, [open, initFromDate]);

  const displayValue = useMemo(() => {
    if (!open && !fromValue) return fromValue;
    return open ? [fromDate, toDate] : [initFromDate, initToDate];
  }, [date, fromValue, open]);

  const dislayFormat = useMemo(() => {
    if (!displayValue) return 'Pick a date';
    const fmt = (d: Date) => format(
      d,
      `${!hideTime ? 'MMM' : 'MMMM'} d, yyyy${!hideTime ? (use12HourFormat ? ' hh:mm:ss a' : ' HH:mm:ss') : ''}`
    )
    const [from, to] = displayValue
    return `${fmt(from)} - ${fmt(to)}`;
  }, [displayValue, hideTime, use12HourFormat]);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        {renderTrigger ? (
          renderTrigger({ value: displayValue, open, timezone, disabled, use12HourFormat, setOpen })
        ) : (
          <div
            className={cn(
              'flex w-full cursor-pointer items-center h-9 ps-3 pe-1 font-normal border border-input rounded-md text-sm shadow-sm',
              !displayValue && 'text-muted-foreground',
              (!clearable || !fromValue) && 'pe-3',
              disabled && 'opacity-50 cursor-not-allowed',
              classNames?.trigger
            )}
            tabIndex={0}
          >
            <div className="flex-grow flex items-center">
              <CalendarIcon className="mr-2 size-4" />
              {dislayFormat}
            </div>
            {clearable && fromValue && (
              <Button
                disabled={disabled}
                variant="ghost"
                size="sm"
                role="button"
                aria-label="Clear date"
                className="size-6 p-1 ms-1"
                onClick={(e) => {
                  e.stopPropagation();
                  e.preventDefault();
                  onFromChange(undefined);
                  onToChange(undefined);
                  setOpen(false);
                }}
              >
                <XCircle className="size-4" />
              </Button>
            )}
          </div>
        )}
      </PopoverTrigger>
      <PopoverContent className="w-auto p-2">
        <div className="flex items-center justify-between">
          <div className="text-md font-bold ms-2 flex items-center cursor-pointer">
            <div>
              <span onClick={() => setMonthYearPicker(monthYearPicker === 'month' ? false : 'month')}>
                {format(month, 'MMMM')}
              </span>
              <span className="ms-1" onClick={() => setMonthYearPicker(monthYearPicker === 'year' ? false : 'year')}>
                {format(month, 'yyyy')}
              </span>
            </div>
            <Button variant="ghost" size="icon" onClick={() => setMonthYearPicker(monthYearPicker ? false : 'year')}>
              {monthYearPicker ? <ChevronUpIcon /> : <ChevronDownIcon />}
            </Button>
          </div>
          <div className={cn('flex space-x-2', monthYearPicker ? 'hidden' : '')}>
            <Button variant="ghost" size="icon" onClick={onPrevMonth}>
              <ChevronLeftIcon />
            </Button>
            <Button variant="ghost" size="icon" onClick={onNextMonth}>
              <ChevronRightIcon />
            </Button>
          </div>
        </div>
        <div className="relative overflow-hidden">
          <DayPicker
            timeZone={timezone}
            mode="range"
            selected={dateRange}
            onSelect={(d) => d && onDayRangeChanged(d)}
            month={month}
            endMonth={endMonth}
            disabled={[max ? { after: max } : null, min ? { before: min } : null].filter(Boolean) as Matcher[]}
            onMonthChange={setMonth}
            classNames={{
              dropdowns: 'flex w-full gap-2',
              months: 'flex w-full h-fit',
              month: 'flex flex-col w-full',
              month_caption: 'hidden',
              button_previous: 'hidden',
              button_next: 'hidden',
              month_grid: 'w-full border-collapse',
              weekdays: 'flex justify-between mt-2',
              weekday: 'text-muted-foreground rounded-md w-9 font-normal text-[0.8rem]',
              week: 'flex w-full justify-between mt-2',
              day: 'h-9 w-9 text-center text-sm p-0 relative flex items-center justify-center [&:has([aria-selected].day-range-end)]:rounded-r-md [&:has([aria-selected].day-outside)]:bg-accent/50 [&:has([aria-selected])]:bg-accent first:[&:has([aria-selected])]:rounded-l-md last:[&:has([aria-selected])]:rounded-r-md focus-within:relative focus-within:z-20 rounded-1',
              day_button: cn(
                buttonVariants({ variant: 'ghost' }),
                'size-9 rounded-md p-0 font-normal aria-selected:opacity-100'
              ),
              range_end: 'day-range-end',
              selected:
                'bg-primary text-primary-foreground hover:bg-primary hover:text-primary-foreground focus:bg-primary focus:text-primary-foreground rounded-l-md rounded-r-md',
              today: 'bg-accent text-accent-foreground',
              outside:
                'day-outside text-muted-foreground opacity-50 aria-selected:bg-accent/50 aria-selected:text-muted-foreground aria-selected:opacity-30',
              disabled: 'text-muted-foreground opacity-50',
              range_middle: 'aria-selected:bg-accent aria-selected:text-accent-foreground',
              hidden: 'invisible',
            }}
            showOutsideDays={true}
            {...props}
          />
          <div
            className={cn('absolute top-0 left-0 bottom-0 right-0', monthYearPicker ? 'bg-popover' : 'hidden')}
          ></div>
          <MonthYearPicker
            value={month}
            mode={monthYearPicker as any}
            onChange={onMonthYearChanged}
            minDate={minDate}
            maxDate={maxDate}
            className={cn('absolute top-0 left-0 bottom-0 right-0', monthYearPicker ? '' : 'hidden')}
          />
        </div>
        <div className="flex flex-col gap-2">
          {!hideTime && (
            <div className="flex py-2 space-x-4">
              <div className="flex-col justify-center">
                <p className="text-center">start time</p>
                <TimePicker
                  timePicker={timePicker}
                  value={fromDate}
                  onChange={setFromDate}
                  use12HourFormat={use12HourFormat}
                  min={minDate}
                  max={maxDate}
                />
              </div>
              <div className="flex-col">
                <p className="text-center" >end time</p>
                <TimePicker
                  timePicker={timePicker}
                  value={toDate}
                  onChange={setToDate}
                  use12HourFormat={use12HourFormat}
                  min={minDate}
                  max={maxDate}
                />
              </div>
            </div>
          )}
          <div className="flex flex-row-reverse items-center justify-between">
            <Button className="ms-2 h-7 px-2" onClick={onSumbit}>
              Done
            </Button>
            {timezone && (
              <div className="text-sm">
                <span>Timezone:</span>
                <span className="font-semibold ms-1">{timezone}</span>
              </div>
            )}
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
}

function MonthYearPicker({
  value,
  minDate,
  maxDate,
  mode = 'month',
  onChange,
  className,
}: {
  value: Date;
  mode: 'month' | 'year';
  minDate?: Date;
  maxDate?: Date;
  onChange: (value: Date, mode: 'month' | 'year') => void;
  className?: string;
}) {
  const yearRef = useRef<HTMLDivElement>(null);
  const years = useMemo(() => {
    const years: TimeOption[] = [];
    for (let i = 1912; i < 2100; i++) {
      let disabled = false;
      const startY = startOfYear(setYear(value, i));
      const endY = endOfYear(setYear(value, i));
      if (minDate && endY < minDate) disabled = true;
      if (maxDate && startY > maxDate) disabled = true;
      years.push({ value: i, label: i.toString(), disabled });
    }
    return years;
  }, [value]);
  const months = useMemo(() => {
    const months: TimeOption[] = [];
    for (let i = 0; i < 12; i++) {
      let disabled = false;
      const startM = startOfMonth(setMonthFns(value, i));
      const endM = endOfMonth(setMonthFns(value, i));
      if (minDate && endM < minDate) disabled = true;
      if (maxDate && startM > maxDate) disabled = true;
      months.push({ value: i, label: format(new Date(0, i), 'MMM'), disabled });
    }
    return months;
  }, [value]);

  const onYearChange = useCallback(
    (v: TimeOption) => {
      let newDate = setYear(value, v.value);
      if (minDate && newDate < minDate) {
        newDate = setMonthFns(newDate, getMonth(minDate));
      }
      if (maxDate && newDate > maxDate) {
        newDate = setMonthFns(newDate, getMonth(maxDate));
      }
      onChange(newDate, 'year');
    },
    [onChange, value, minDate, maxDate]
  );

  useEffect(() => {
    if (mode === 'year') {
      yearRef.current?.scrollIntoView({ behavior: 'auto', block: 'center' });
    }
  }, [mode, value]);
  return (
    <div className={cn(className)}>
      <ScrollArea className="h-full">
        {mode === 'year' && (
          <div className="grid grid-cols-4">
            {years.map((year) => (
              <div key={year.value} ref={year.value === getYear(value) ? yearRef : undefined}>
                <Button
                  disabled={year.disabled}
                  variant={getYear(value) === year.value ? 'default' : 'ghost'}
                  className="rounded-full"
                  onClick={() => onYearChange(year)}
                >
                  {year.label}
                </Button>
              </div>
            ))}
          </div>
        )}
        {mode === 'month' && (
          <div className="grid grid-cols-3 gap-4">
            {months.map((month) => (
              <Button
                key={month.value}
                size="lg"
                disabled={month.disabled}
                variant={getMonth(value) === month.value ? 'default' : 'ghost'}
                className="rounded-full"
                onClick={() => onChange(setMonthFns(value, month.value), 'month')}
              >
                {month.label}
              </Button>
            ))}
          </div>
        )}
      </ScrollArea>
    </div>
  );
}
