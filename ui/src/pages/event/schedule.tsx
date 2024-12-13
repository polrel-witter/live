import { useContext, useEffect, useState } from "react";
import { EventContext } from "./context";
import { Session, Sessions } from "@/lib/types";

import {
  areIntervalsOverlapping,
  compareAsc,
  format,
  Interval,
  isEqual,
  parse,
} from "date-fns";
import { TZDate } from "@date-fns/tz";
import { SessionDateSelect } from "@/components/session-date-select";
import { makeArrayOfEventDays } from "@/lib/utils";
import { SessionCard } from "@/components/cards/session";
import { Card } from "@/components/ui/card";

// these are now independent from session-date-select dateFromKey/dateToKey
function dateToKey(d: TZDate): string {
  return format(d, "y-M-ddX");
}

function dateFromKey(d: string): TZDate {
  return parse(d, "y-M-ddX", new TZDate());
}

function sortedDateArrayFromMap(dates: Map<string, TZDate>): TZDate[] {
  return [...dates.values()]
    .sort((date1, date2) => compareAsc(date1, date2));
}

function datesMapFromSessions(sessions: Sessions): Map<string, TZDate> {
  const sessionTimes = Object.values(sessions)
    .map((session) => (session.startTime ? session.startTime : new TZDate(0)));

  const dateStrs = sessionTimes
    .map((date) => dateToKey(date));
  // keep unique values
  const uniqDateStrs = [...new Set(dateStrs)];
  // shape as key value pairs
  const kvps: [string, TZDate][] = uniqDateStrs
    .map((dateStr) => [dateStr, dateFromKey(dateStr)]);
  return new Map(kvps);
}

function datesMapFromEventStartAndEnd(
  startDate: TZDate,
  endDate: TZDate,
): Map<string, TZDate> {
  const days = makeArrayOfEventDays(startDate, endDate);

  const kvps: [string, TZDate][] = days
    .map((day) => [dateToKey(day), day]);

  return new Map(kvps);
}

function hasSessionWithoutStartTime(sessions: Session[]): boolean {
  return sessions
    .map((sessions) => sessions.startTime)
    .includes(null);
}

export function SchedulePage() {
  const ctx = useContext(EventContext);

  if (!ctx) {
    throw new Error("EventContext not set!");
  }

  const [dates, setDates] = useState<Map<string, TZDate>>(new Map());
  const [activeDate, setActiveDate] = useState<TZDate>(new TZDate(0));

  useEffect(() => {
    const { event: { details: { startDate, endDate, timezone, sessions } } } =
      ctx;

    const sessionDatesMap = datesMapFromSessions(sessions);

    if (!startDate || !endDate) {
      setDates(sessionDatesMap);
      return;
    }

    const eventInterval: Interval<TZDate, TZDate> = {
      start: startDate.withTimeZone(timezone),
      end: endDate,
    };

    const sortedSessionDates = sortedDateArrayFromMap(sessionDatesMap);

    const sessionsInterval: Interval<TZDate, TZDate> = {
      start: sortedSessionDates[0],
      end: sortedSessionDates[sortedSessionDates.length - 1],
    };

    // if event time is wrong, prefer dates derived from sessions,
    // so atleast we're displaying something
    if (!areIntervalsOverlapping(eventInterval, sessionsInterval)) {
      setDates(sessionDatesMap);
      return;
    }

    setDates(
      datesMapFromEventStartAndEnd(startDate, endDate),
    );

    // if there's a session witout time we ad a zero date so
    // the date picker knows what to do
    if (hasSessionWithoutStartTime(Object.values(ctx.event.details.sessions))) {
      setDates((dates) => {
        const z = new TZDate(0);
        return new Map([...dates.entries(), [dateToKey(z), z]]);
      });
    }
  }, [ctx]);

  useEffect(() => {
    setActiveDate(() => {
      if (dates.size === 0) {
        return new TZDate(0);
      }

      const sorted = sortedDateArrayFromMap(dates);

      if (isEqual(sorted[0], new Date(0)) && sorted.length > 1) {
        return sorted[1];
      }

      return sorted[0];
    });
  }, [dates]);

  const SessionsOrPlaceholder = () => {
    if (Object.values(ctx.event.details.sessions).length === 0) {
      return (
        <Card className="p-4 px-8 bg-accent text-balance text-center">
          no sessions for this event yet
        </Card>
      );
    }

    const SessionsForDayOrPlaceholder = () => {
      const sessionsOnDay = Object.values(ctx.event.details.sessions)
        .filter(({ startTime }) => {
          let start = startTime ? startTime : new Date(0);
          return start.getDay() === activeDate.getDay();
        })
        .sort((a, b) => {
          if (a.startTime && b.startTime) {
            return compareAsc(a.startTime, b.startTime);
          } else {
            return -1;
          }
        });

      if (sessionsOnDay.length === 0) {
        return (
          <Card className="p-4 px-8 bg-accent text-balance text-center">
            no sessions on { format(activeDate, `LL/dd/yy`) }
          </Card>
        );
      }

      return (
        sessionsOnDay
          .map(({ startTime, endTime, ...session }) => {
            return (
              <li key={session.title}>
                <SessionCard
                  session={{
                    startTime: startTime,
                    endTime: endTime,
                    ...session,
                  }}
                />
              </li>
            );
          })
      );
    };

    return (
      <>
        <SessionDateSelect
          sessionDates={sortedDateArrayFromMap(dates)}
          onDateChange={(newDateKey: TZDate) => {
            const key = dateToKey(newDateKey);

            const newDate = dates.get(key);

            if (!newDate) {
              console.error(`couldn't find date with key ${key}`);
              return;
            }

            return setActiveDate(newDate);
          }}
          currentDate={activeDate}
        />
        <ul className="grid gap-6">
          <SessionsForDayOrPlaceholder />
        </ul>
      </>
    );
  };

  return (
    <div className="grid m-6 md:mx-96 space-y-12 justify-items-center">
      <div className="text-2xl font-medium">schedule</div>
      <SessionsOrPlaceholder />
    </div>
  );
}
