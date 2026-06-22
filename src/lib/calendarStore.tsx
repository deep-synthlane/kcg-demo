import { createContext, useCallback, useContext, useState, type ReactNode } from "react";

export type CalEvent = { label: string; type: "exam" | "holiday" | "event" | "fest" };

export const INITIAL_EVENTS: Record<number, CalEvent> = {
  3: { label: "Convocation", type: "event" },
  7: { label: "Foundation Day", type: "holiday" },
  10: { label: "Founders' Day", type: "holiday" },
  14: { label: "Vacation Begins", type: "holiday" },
  15: { label: "Vacation", type: "holiday" },
  18: { label: "Mid-Sem Begin", type: "exam" },
  19: { label: "Mid-Sem", type: "exam" },
  20: { label: "Mid-Sem", type: "exam" },
  21: { label: "Mid-Sem End", type: "exam" },
  24: { label: "Hackathon", type: "event" },
  27: { label: "Tech Fest", type: "fest" },
  28: { label: "Tech Fest", type: "fest" },
};

type CalendarContextValue = {
  events: Record<number, CalEvent>;
  addEvent: (day: number, event: CalEvent) => void;
  deleteEvent: (day: number) => void;
};

const CalendarContext = createContext<CalendarContextValue | null>(null);

export function CalendarProvider({ children }: { children: ReactNode }) {
  const [events, setEvents] = useState<Record<number, CalEvent>>(INITIAL_EVENTS);

  const addEvent = useCallback((day: number, event: CalEvent) => {
    setEvents((prev) => ({ ...prev, [day]: event }));
  }, []);

  const deleteEvent = useCallback((day: number) => {
    setEvents((prev) => {
      const copy = { ...prev };
      delete copy[day];
      return copy;
    });
  }, []);

  return (
    <CalendarContext.Provider value={{ events, addEvent, deleteEvent }}>
      {children}
    </CalendarContext.Provider>
  );
}

export function useCalendar() {
  const ctx = useContext(CalendarContext);
  if (!ctx) throw new Error("useCalendar must be used within CalendarProvider");
  return ctx;
}
