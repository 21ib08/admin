"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { ChevronLeftIcon, ChevronRightIcon } from "lucide-react";
import {
  addMonths,
  format,
  startOfMonth,
  endOfMonth,
  eachDayOfInterval,
  isSameDay,
  isWithinInterval,
} from "date-fns";
import { cs } from "date-fns/locale";
import { ScrollArea } from "@/components/ui/scroll-area";
import supabase from "@/database/supabase";
import { generatePastelColor } from "@/lib/utils";
import { Skeleton } from "@/components/ui/skeleton";

// Add interfaces for type safety
interface Room {
  id: string;
  name: string;
}

interface Reservation {
  id: number;
  first_name: string;
  sure_name: string;
  email: string;
  start_date: Date;
  end_date: Date;
  room_id: number;
}

const CustomCalendar = ({
  reservations,
  onDateClick,
  currentMonth,
  onMonthChange,
}: {
  reservations: Reservation[];
  onDateClick: (reservation: Reservation | null) => void;
  currentMonth: Date;
  onMonthChange: (date: Date) => void;
}) => {
  const monthStart = startOfMonth(currentMonth);
  const monthEnd = endOfMonth(currentMonth);
  const daysInMonth = eachDayOfInterval({ start: monthStart, end: monthEnd });

  // Filter reservations for current month only
  const currentMonthReservations = reservations.filter((res) => {
    const startDate = new Date(res["start_date"]);
    const endDate = new Date(res["end_date"]);
    return (
      (startDate <= monthEnd && startDate >= monthStart) ||
      (endDate <= monthEnd && endDate >= monthStart) ||
      (startDate <= monthStart && endDate >= monthEnd)
    );
  });

  const getReservationForDate = (date: Date): Reservation | null => {
    return (
      currentMonthReservations.find((res) => {
        const start = new Date(res.start_date);
        const end = new Date(res.end_date);
        return (
          isWithinInterval(date, { start, end }) ||
          isSameDay(date, start) ||
          isSameDay(date, end)
        );
      }) || null
    );
  };

  const daysOfWeek = ["Po", "Út", "St", "Čt", "Pá", "So", "Ne"];

  let firstDayOffset = monthStart.getDay() - 1;
  if (firstDayOffset === -1) firstDayOffset = 6;
  const prefixDays = Array(firstDayOffset).fill(null);

  return (
    <div className="p-2 border rounded-lg bg-card dark:bg-card select-none">
      <div className="flex items-center justify-between mb-4">
        <button
          onClick={() => {
            const newMonth = addMonths(currentMonth, -1);
            onMonthChange(newMonth);
          }}
          className="p-2 hover:bg-accent hover:text-accent-foreground rounded-md transition-colors"
          type="button"
        >
          <ChevronLeftIcon className="h-4 w-4" />
        </button>
        <h2 className="text-sm font-medium">
          {format(currentMonth, "LLLL yyyy", { locale: cs })}
        </h2>
        <button
          onClick={() => {
            const newMonth = addMonths(currentMonth, 1);
            onMonthChange(newMonth);
          }}
          className="p-2 hover:bg-accent hover:text-accent-foreground rounded-md transition-colors"
          type="button"
        >
          <ChevronRightIcon className="h-4 w-4" />
        </button>
      </div>

      <div className="grid grid-cols-7 gap-[2px]">
        {daysOfWeek.map((day) => (
          <div
            key={day}
            className="text-xs text-muted-foreground font-medium text-center h-6"
          >
            {day}
          </div>
        ))}

        {prefixDays.map((_, index) => (
          <div key={`prefix-${index}`} className="aspect-square" />
        ))}

        {daysInMonth.map((date) => {
          const reservation = getReservationForDate(date);
          const isReserved = !!reservation;
          const isToday = isSameDay(date, new Date());
          const colors = isReserved
            ? generatePastelColor(reservation.id.toString())
            : null;

          // Map light mode colors to matching dark mode colors
          let darkModeClass = "";
          if (isReserved && colors) {
            if (colors.bg.includes("purple")) {
              darkModeClass = "dark:bg-purple-800 dark:text-purple-100";
            } else if (colors.bg.includes("blue")) {
              darkModeClass = "dark:bg-blue-800 dark:text-blue-100";
            } else if (colors.bg.includes("green")) {
              darkModeClass = "dark:bg-green-800 dark:text-green-100";
            } else if (colors.bg.includes("red")) {
              darkModeClass = "dark:bg-red-800 dark:text-red-100";
            } else if (colors.bg.includes("yellow")) {
              darkModeClass = "dark:bg-yellow-800 dark:text-yellow-100";
            } else if (colors.bg.includes("orange")) {
              darkModeClass = "dark:bg-orange-800 dark:text-orange-100";
            } else if (colors.bg.includes("pink")) {
              darkModeClass = "dark:bg-pink-800 dark:text-pink-100";
            }
          }

          return (
            <div
              key={date.toISOString()}
              onClick={() => isReserved && onDateClick(reservation)}
              className={`
                aspect-square flex items-center justify-center
                text-sm rounded-md transition-colors cursor-pointer
                relative min-h-[24px] min-w-[24px]
                font-medium
                ${
                  isReserved
                    ? `${colors?.bg} ${colors?.text} hover:opacity-80 ${darkModeClass}`
                    : "text-foreground hover:bg-accent hover:text-accent-foreground"
                }
                ${isToday ? "ring-2 ring-primary" : ""}
              `}
            >
              {date.getDate()}
            </div>
          );
        })}
      </div>
    </div>
  );
};

// Create a moderately detailed skeleton component with simplified calendar
const RoomSkeleton = () => {
  return (
    <Card className="border-2">
      <CardHeader className="bg-muted/50 dark:bg-muted/50 border-b">
        <Skeleton className="h-6 w-32" />
      </CardHeader>
      <CardContent className="p-6">
        <div className="flex flex-col lg:flex-row gap-6">
          {/* Calendar area - simplified */}
          <div className="lg:w-[450px] shrink-0">
            <div className="border rounded-lg p-2 bg-card">
              {/* Calendar header */}
              <div className="flex justify-between items-center mb-4">
                <Skeleton className="h-8 w-8 rounded-md" />
                <Skeleton className="h-5 w-32" />
                <Skeleton className="h-8 w-8 rounded-md" />
              </div>

              {/* Calendar grid - simplified to just a few rows */}
              <div className="space-y-2">
                {/* Days of week as a single bar */}
                <Skeleton className="h-6 w-full rounded-md" />

                {/* Calendar weeks as bars */}
                {Array(5)
                  .fill(0)
                  .map((_, i) => (
                    <Skeleton
                      key={`week-${i}`}
                      className="h-10 w-full rounded-md"
                    />
                  ))}
              </div>
            </div>
          </div>

          <Separator orientation="vertical" className="hidden lg:block" />

          {/* Reservation list area */}
          <div className="flex-1">
            <div className="flex justify-between items-center mb-4">
              <Skeleton className="h-6 w-40" />
              <Skeleton className="h-5 w-24" />
            </div>

            <div className="space-y-3">
              {Array(3)
                .fill(0)
                .map((_, i) => (
                  <div key={i} className="border rounded-lg p-4">
                    <div className="flex justify-between">
                      <div className="space-y-2">
                        <Skeleton className="h-5 w-32" />
                        <Skeleton className="h-4 w-24" />
                      </div>
                      <div className="space-y-2">
                        <Skeleton className="h-4 w-20" />
                        <Skeleton className="h-4 w-20" />
                      </div>
                    </div>
                  </div>
                ))}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

const styles = `
  @keyframes borderBounce {
    0% { border-width: 2px; }
    50% { border-width: 8px; }
    100% { border-width: 2px; }
  }
`;

export default function ReservationPage() {
  const [rooms, setRooms] = useState<Room[]>([]);
  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [currentMonths, setCurrentMonths] = useState<{ [key: string]: Date }>(
    {}
  );
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [selectedReservationId, setSelectedReservationId] = useState<
    string | null
  >(null);

  useEffect(() => {
    async function fetchData() {
      try {
        // Fetch rooms with ordering
        const { data: roomsData, error: roomsError } = await supabase
          .from("rooms")
          .select("*")
          .order("id", { ascending: true });

        if (roomsError) throw roomsError;

        const initialMonths = roomsData.reduce((acc, room) => {
          acc[room.id] = new Date();
          return acc;
        }, {});

        setCurrentMonths(initialMonths);
        setRooms(roomsData);

        // Fetch reservations
        const { data: reservationsData, error: reservationsError } =
          await supabase
            .from("reservations")
            .select("*")
            .order("room_id", { ascending: true });

        if (reservationsError) throw reservationsError;
        setReservations(reservationsData);
      } catch (err) {
        setError(err instanceof Error ? err.message : "An error occurred");
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, []);

  const handleMonthChange = (roomId: string, newDate: Date) => {
    setCurrentMonths((prev) => ({
      ...prev,
      [roomId]: newDate,
    }));
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background dark:bg-background py-8 px-4">
        <div className="max-w-[1200px] mx-auto">
          <div className="space-y-6">
            {[1, 2, 3].map((room) => (
              <RoomSkeleton key={`skeleton-${room}`} />
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50/50 flex items-center justify-center">
        <p className="text-red-500">Error: {error}</p>
      </div>
    );
  }

  const handleDateClick = (reservation: Reservation | null) => {
    setSelectedReservationId(reservation?.id?.toString() || null);
  };

  const getCurrentMonthReservations = (roomId: string) => {
    const monthStart = startOfMonth(currentMonths[roomId] || new Date());
    const monthEnd = endOfMonth(currentMonths[roomId] || new Date());

    return reservations.filter((res) => {
      const startDate = new Date(res["start_date"]);
      const endDate = new Date(res["end_date"]);
      return (
        res["room_id"] === Number(roomId) &&
        ((startDate <= monthEnd && startDate >= monthStart) ||
          (endDate <= monthEnd && endDate >= monthStart) ||
          (startDate <= monthStart && endDate >= monthEnd))
      );
    });
  };

  return (
    <>
      <style>{styles}</style>
      <div className="min-h-screen bg-background dark:bg-background py-8 px-4">
        <div className="max-w-[1200px] mx-auto">
          <div className="space-y-6">
            {rooms.map((room) => (
              <Card key={room.id} className="border-2">
                <CardHeader className="bg-muted/50 dark:bg-muted/50 border-b">
                  <div className="flex items-center justify-between">
                    <div className="space-y-1">
                      <CardTitle className="text-xl text-primary">
                        {room.name}
                      </CardTitle>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="p-6">
                  <div className="flex flex-col lg:flex-row gap-6 lg:h-auto">
                    <div className="lg:w-[450px] shrink-0">
                      <div className="h-fit">
                        <CustomCalendar
                          reservations={reservations.filter(
                            (r) => r.room_id === Number(room.id)
                          )}
                          onDateClick={handleDateClick}
                          currentMonth={currentMonths[room.id] || new Date()}
                          onMonthChange={(date) =>
                            handleMonthChange(room.id, date)
                          }
                        />
                      </div>
                    </div>

                    <Separator
                      orientation="vertical"
                      className="hidden lg:block"
                    />

                    <div className="flex-1 flex flex-col lg:max-h-[450px]">
                      <div className="flex items-center justify-between mb-2 sticky top-0 bg-card dark:bg-card py-2 z-10">
                        <h3 className="font-medium text-lg">
                          Aktuální rezervace
                        </h3>
                        <p className="text-sm text-muted-foreground">
                          {format(
                            currentMonths[room.id] || new Date(),
                            "LLLL yyyy",
                            { locale: cs }
                          )}
                        </p>
                      </div>
                      <ScrollArea className="flex-1 h-[250px] lg:h-auto">
                        <div className="space-y-2 pr-4">
                          {getCurrentMonthReservations(room.id).map((res) => {
                            const colors = generatePastelColor(
                              res.id.toString()
                            );
                            const isHighlighted =
                              selectedReservationId == res.id.toString();

                            // Map light mode colors to matching dark mode colors
                            let darkModeClass = "";
                            if (colors.bg.includes("purple")) {
                              darkModeClass =
                                "dark:bg-purple-800 dark:text-purple-100";
                            } else if (colors.bg.includes("blue")) {
                              darkModeClass =
                                "dark:bg-blue-800 dark:text-blue-100";
                            } else if (colors.bg.includes("green")) {
                              darkModeClass =
                                "dark:bg-green-800 dark:text-green-100";
                            } else if (colors.bg.includes("red")) {
                              darkModeClass =
                                "dark:bg-red-800 dark:text-red-100";
                            } else if (colors.bg.includes("yellow")) {
                              darkModeClass =
                                "dark:bg-yellow-800 dark:text-yellow-100";
                            } else if (colors.bg.includes("orange")) {
                              darkModeClass =
                                "dark:bg-orange-800 dark:text-orange-100";
                            } else if (colors.bg.includes("pink")) {
                              darkModeClass =
                                "dark:bg-pink-800 dark:text-pink-100";
                            }

                            return (
                              <div
                                key={res.id}
                                className={`
                                  relative flex items-center gap-2
                                  p-2 lg:p-4 rounded-lg border dark:border-gray-700
                                  ${colors.bg} ${darkModeClass}
                                  hover:opacity-90
                                  cursor-pointer
                                `}
                              >
                                {isHighlighted && (
                                  <div className="absolute -left-2 top-1/2 -translate-y-1/2 h-6 w-1.5 bg-primary rounded-full" />
                                )}
                                <div className="flex-1">
                                  <div className="flex items-center justify-between">
                                    <div>
                                      <p
                                        className={`font-medium ${colors.text} dark:text-white text-xs lg:text-base`}
                                      >
                                        {res.first_name} {res.sure_name}
                                      </p>
                                      <p className="text-[11px] lg:text-sm text-muted-foreground dark:text-gray-300">
                                        {res.email}
                                      </p>
                                    </div>
                                    <div className="text-[11px] lg:text-sm text-muted-foreground dark:text-gray-300 text-right font-medium">
                                      <p>
                                        {new Date(
                                          res.start_date
                                        ).toLocaleDateString("cs-CZ")}
                                      </p>
                                      <p>
                                        {new Date(
                                          res.end_date
                                        ).toLocaleDateString("cs-CZ")}
                                      </p>
                                    </div>
                                  </div>
                                </div>
                              </div>
                            );
                          })}
                          {getCurrentMonthReservations(room.id).length ===
                            0 && (
                            <div className="text-center py-4 lg:py-8 text-muted-foreground">
                              <p>Žádné rezervace v tomto měsíci</p>
                            </div>
                          )}
                        </div>
                      </ScrollArea>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>
    </>
  );
}
