// found https://github.com/huybuidac/shadcn-datetime-picker,
// edited/moved some stuff
import {
  endOfHour,
  endOfMinute,
  format,
  parse,
  setHours,
  setMinutes,
  setSeconds,
  startOfHour,
  startOfMinute,
  setMilliseconds,
  addHours,
  subHours,
  startOfDay,
  endOfDay,
} from "date-fns";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { DateTimePickerProps } from "./date-time-picker";
import { Popover, PopoverContent, PopoverTrigger } from "../popover";
import { ScrollArea } from "../scroll-area";
import { CheckIcon, ChevronDownIcon, Clock } from "lucide-react";
import { Button } from "../button";
import { cn } from "@/lib/utils";

const AM_VALUE = 0;
const PM_VALUE = 1;


export interface TimeOption {
  value: number;
  label: string;
  disabled: boolean;
}

export function TimePicker({
  value,
  onChange,
  use12HourFormat,
  min,
  max,
  timePicker,
  containerRef
}: {
  use12HourFormat?: boolean;
  value: Date;
  onChange: (date: Date) => void;
  min?: Date;
  max?: Date;
  timePicker?: DateTimePickerProps['timePicker'];
  containerRef?: React.RefObject<HTMLElement>
}) {
  // hours24h = HH
  // hours12h = hh
  const formatStr = useMemo(
    () => (use12HourFormat ? 'yyyy-MM-dd hh:mm:ss.SSS a xxxx' : 'yyyy-MM-dd HH:mm:ss.SSS xxxx'),
    [use12HourFormat]
  );
  const [ampm, setAmpm] = useState(format(value, 'a') === 'AM' ? AM_VALUE : PM_VALUE);
  const [hour, setHour] = useState(use12HourFormat ? +format(value, 'hh') : value.getHours());
  const [minute, setMinute] = useState(value.getMinutes());
  const [second, setSecond] = useState(value.getSeconds());

  useEffect(() => {
    onChange(buildTime({ use12HourFormat, value, formatStr, hour, minute, second, ampm }));
  }, [hour, minute, second, ampm, formatStr, use12HourFormat]);

  const _hourIn24h = useMemo(() => {
    // if (use12HourFormat) {
    //   return (hour % 12) + ampm * 12;
    // }
    return use12HourFormat ? (hour % 12) + ampm * 12 : hour;
  }, [value, use12HourFormat, ampm]);

  const hours: TimeOption[] = useMemo(
    () =>
      Array.from({ length: use12HourFormat ? 12 : 24 }, (_, i) => {
        let disabled = false;
        const hourValue = use12HourFormat ? (i === 0 ? 12 : i) : i;
        const hDate = setHours(value, use12HourFormat ? i + ampm * 12 : i);
        const hStart = startOfHour(hDate);
        const hEnd = endOfHour(hDate);
        if (min && hEnd < min) disabled = true;
        if (max && hStart > max) disabled = true;
        return {
          value: hourValue,
          label: hourValue.toString().padStart(2, '0'),
          disabled,
        };
      }),
    [value, min, max, use12HourFormat, ampm]
  );
  const minutes: TimeOption[] = useMemo(() => {
    const anchorDate = setHours(value, _hourIn24h);
    return Array.from({ length: 60 }, (_, i) => {
      let disabled = false;
      const mDate = setMinutes(anchorDate, i);
      const mStart = startOfMinute(mDate);
      const mEnd = endOfMinute(mDate);
      if (min && mEnd < min) disabled = true;
      if (max && mStart > max) disabled = true;
      return {
        value: i,
        label: i.toString().padStart(2, '0'),
        disabled,
      };
    });
  }, [value, min, max, _hourIn24h]);
  const seconds: TimeOption[] = useMemo(() => {
    const anchorDate = setMilliseconds(setMinutes(setHours(value, _hourIn24h), minute), 0);
    const _min = min ? setMilliseconds(min, 0) : undefined;
    const _max = max ? setMilliseconds(max, 0) : undefined;
    return Array.from({ length: 60 }, (_, i) => {
      let disabled = false;
      const sDate = setSeconds(anchorDate, i);
      if (_min && sDate < _min) disabled = true;
      if (_max && sDate > _max) disabled = true;
      return {
        value: i,
        label: i.toString().padStart(2, '0'),
        disabled,
      };
    });
  }, [value, minute, min, max, _hourIn24h]);
  const ampmOptions = useMemo(() => {
    const startD = startOfDay(value);
    const endD = endOfDay(value);
    return [
      { value: AM_VALUE, label: 'AM' },
      { value: PM_VALUE, label: 'PM' },
    ].map((v) => {
      let disabled = false;
      const start = addHours(startD, v.value * 12);
      const end = subHours(endD, (1 - v.value) * 12);
      if (min && end < min) disabled = true;
      if (max && start > max) disabled = true;
      return { ...v, disabled };
    });
  }, [value, min, max]);

  const [open, setOpen] = useState(false);

  const hourRef = useRef<HTMLDivElement>(null);
  const minuteRef = useRef<HTMLDivElement>(null);
  const secondRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (open) {
        hourRef.current?.scrollIntoView({ behavior: 'auto' });
        minuteRef.current?.scrollIntoView({ behavior: 'auto' });
        secondRef.current?.scrollIntoView({ behavior: 'auto' });
      }
    }, 1);
    return () => clearTimeout(timeoutId);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  const onHourChange = useCallback(
    (v: TimeOption) => {
      if (min) {
        let newTime = buildTime({ use12HourFormat, value, formatStr, hour: v.value, minute, second, ampm });
        if (newTime < min) {
          setMinute(min.getMinutes());
          setSecond(min.getSeconds());
        }
      }
      if (max) {
        let newTime = buildTime({ use12HourFormat, value, formatStr, hour: v.value, minute, second, ampm });
        if (newTime > max) {
          setMinute(max.getMinutes());
          setSecond(max.getSeconds());
        }
      }
      setHour(v.value);
    },
    [setHour, use12HourFormat, value, formatStr, minute, second, ampm]
  );

  const onMinuteChange = useCallback(
    (v: TimeOption) => {
      if (min) {
        let newTime = buildTime({ use12HourFormat, value, formatStr, hour: v.value, minute, second, ampm });
        if (newTime < min) {
          setSecond(min.getSeconds());
        }
      }
      if (max) {
        let newTime = buildTime({ use12HourFormat, value, formatStr, hour: v.value, minute, second, ampm });
        if (newTime > max) {
          setSecond(newTime.getSeconds());
        }
      }
      setMinute(v.value);
    },
    [setMinute, use12HourFormat, value, formatStr, hour, second, ampm]
  );

  const onAmpmChange = useCallback(
    (v: TimeOption) => {
      if (min) {
        let newTime = buildTime({ use12HourFormat, value, formatStr, hour, minute, second, ampm: v.value });
        if (newTime < min) {
          const minH = min.getHours() % 12;
          setHour(minH === 0 ? 12 : minH);
          setMinute(min.getMinutes());
          setSecond(min.getSeconds());
        }
      }
      if (max) {
        let newTime = buildTime({ use12HourFormat, value, formatStr, hour, minute, second, ampm: v.value });
        if (newTime > max) {
          const maxH = max.getHours() % 12;
          setHour(maxH === 0 ? 12 : maxH);
          setMinute(max.getMinutes());
          setSecond(max.getSeconds());
        }
      }
      setAmpm(v.value);
    },
    [setAmpm, use12HourFormat, value, formatStr, hour, minute, second, min, max]
  );

  const display = useMemo(() => {
    let arr = [];
    for (const element of ['hour', 'minute', 'second']) {
      if (!timePicker || timePicker[element as keyof typeof timePicker]) {
        if (element === 'hour') {
          arr.push(use12HourFormat ? 'hh' : 'HH');
        } else {
          arr.push(element === 'minute' ? 'mm' : 'ss');
        }
      }
    }
    return format(value, arr.join(':') + (use12HourFormat ? ' a' : ''));
  }, [value, use12HourFormat, timePicker]);

  return (
    <div>
      {/* setting 'modal' fixed and issue where this component inside of a
      * dialog won't work properly;
      * see: https://github.com/shadcn-ui/ui/issues/1511
      */}
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button variant="outline" role="combobox" aria-expanded={open} className="justify-between">
            <Clock className="mr-2 size-4" />
            {display}
            <ChevronDownIcon className="ml-2 size-4 shrink-0 opacity-50" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="p-0" side="top" containerRef={containerRef}>
          <div className="flex-col gap-2 p-2">
            <div className="flex h-56 grow">
              {(!timePicker || timePicker.hour) && (
                <ScrollArea className="h-full flex-grow">
                  <div className="flex grow flex-col items-stretch overflow-y-auto pe-2 pb-48">
                    {hours.map((v) => (
                      <div key={v.value} ref={v.value === hour ? hourRef : undefined}>
                        <TimeItem
                          option={v}
                          selected={v.value === hour}
                          onSelect={onHourChange}
                          className="h-8"
                          disabled={v.disabled}
                        />
                      </div>
                    ))}
                  </div>
                </ScrollArea>
              )}
              {(!timePicker || timePicker.minute) && (
                <ScrollArea className="h-full flex-grow">
                  <div className="flex grow flex-col items-stretch overflow-y-auto pe-2 pb-48">
                    {minutes
                      .filter(({ value }) =>
                        timePicker?.fiveMinuteBlocks
                          ? (value % 5) === 0
                          : true)
                      .map((v) => (
                        <div key={v.value} ref={v.value === minute ? minuteRef : undefined}>
                          <TimeItem
                            option={v}
                            selected={v.value === minute}
                            onSelect={onMinuteChange}
                            className="h-8"
                            disabled={v.disabled}
                          />
                        </div>
                      ))}
                  </div>
                </ScrollArea>
              )}
              {(!timePicker || timePicker.second) && (
                <ScrollArea className="h-full flex-grow">
                  <div className="flex grow flex-col items-stretch overflow-y-auto pe-2 pb-48">
                    {seconds.map((v) => (
                      <div key={v.value} ref={v.value === second ? secondRef : undefined}>
                        <TimeItem
                          option={v}
                          selected={v.value === second}
                          onSelect={(v) => setSecond(v.value)}
                          className="h-8"
                          disabled={v.disabled}
                        />
                      </div>
                    ))}
                  </div>
                </ScrollArea>
              )}
              {use12HourFormat && (
                <ScrollArea className="h-full flex-grow">
                  <div className="flex grow flex-col items-stretch overflow-y-auto pe-2">
                    {ampmOptions.map((v) => (
                      <TimeItem
                        key={v.value}
                        option={v}
                        selected={v.value === ampm}
                        onSelect={onAmpmChange}
                        className="h-8"
                        disabled={v.disabled}
                      />
                    ))}
                  </div>
                </ScrollArea>
              )}
            </div>
          </div>
        </PopoverContent>
      </Popover>
    </div>
  );
}


const TimeItem = ({
  option,
  selected,
  onSelect,
  className,
  disabled,
}: {
  option: TimeOption;
  selected: boolean;
  onSelect: (option: TimeOption) => void;
  className?: string;
  disabled?: boolean;
}) => {
  return (
    <Button
      // any button associated with a form without type="button"
      // are automacally submit buttons:
      // https://developer.mozilla.org/en-US/docs/Web/HTML/Element/button#attributes 
      type="button"
      variant="ghost"
      className={cn('flex justify-center px-1 pe-2 ps-1', className)}
      onClick={() => onSelect(option)}
      disabled={disabled}
    >
      <div className="w-4">{selected && <CheckIcon className="my-auto size-4" />}</div>
      <span className="ms-2">{option.label}</span>
    </Button>
  );
};

interface BuildTimeOptions {
  use12HourFormat?: boolean;
  value: Date;
  formatStr: string;
  hour: number;
  minute: number;
  second: number;
  ampm: number;
}

function buildTime(options: BuildTimeOptions) {
  const { use12HourFormat, value, formatStr, hour, minute, second, ampm } = options;
  let date: Date;
  if (use12HourFormat) {
    const dateStrRaw = format(value, formatStr);
    // yyyy-MM-dd hh:mm:ss.SSS a zzzz
    // 2024-10-14 01:20:07.524 AM GMT+00:00
    let dateStr = dateStrRaw.slice(0, 11) + hour.toString().padStart(2, '0') + dateStrRaw.slice(13);
    dateStr = dateStr.slice(0, 14) + minute.toString().padStart(2, '0') + dateStr.slice(16);
    dateStr = dateStr.slice(0, 17) + second.toString().padStart(2, '0') + dateStr.slice(19);
    dateStr = dateStr.slice(0, 24) + (ampm == AM_VALUE ? 'AM' : 'PM') + dateStr.slice(26);
    date = parse(dateStr, formatStr, value);
  } else {
    date = setHours(setMinutes(setSeconds(value, second), minute), hour);
  }
  return date;
}
