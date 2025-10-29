import React, { useState } from "react";
import PropTypes from "prop-types";
import { Link } from "react-router-dom";

const CalendarView = ({ sessions, userRole = "member", onSessionClick }) => {
  const [currentWeek, setCurrentWeek] = useState(getWeekDates());

  // Generate dates for the current week
  function getWeekDates(startDate = new Date()) {
    const dates = [];
    const day = startDate.getDay(); // 0-6, where 0 is Sunday
    const diff = startDate.getDate() - day + (day === 0 ? -6 : 1); // Adjust to get Monday as first day

    const monday = new Date(startDate);
    monday.setDate(diff);

    for (let i = 0; i < 7; i++) {
      const date = new Date(monday);
      date.setDate(monday.getDate() + i);
      dates.push({
        date,
        formattedDate: date.toISOString().split("T")[0],
        dayName: date.toLocaleDateString("en-US", { weekday: "short" }),
        dayNumber: date.getDate(),
        isToday: date.toDateString() === new Date().toDateString(),
      });
    }

    return dates;
  }

  const goToPreviousWeek = () => {
    const prevWeekStart = new Date(currentWeek[0].date);
    prevWeekStart.setDate(prevWeekStart.getDate() - 7);
    setCurrentWeek(getWeekDates(prevWeekStart));
  };

  const goToNextWeek = () => {
    const nextWeekStart = new Date(currentWeek[0].date);
    nextWeekStart.setDate(nextWeekStart.getDate() + 7);
    setCurrentWeek(getWeekDates(nextWeekStart));
  };

  const getSessionsForDate = (formattedDate) => {
    return sessions.filter((session) => session.date === formattedDate);
  };

  return (
    <div className="bg-white rounded-lg shadow overflow-hidden">
      {/* Calendar header with navigation */}
      <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
        <h3 className="text-lg font-semibold text-gray-800">Schedule</h3>
        <div className="flex items-center space-x-4">
          <button
            onClick={goToPreviousWeek}
            className="p-2 rounded-full hover:bg-gray-100"
          >
            <svg
              className="h-5 w-5 text-gray-600"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M15 19l-7-7 7-7"
              />
            </svg>
          </button>

          <button
            onClick={() => setCurrentWeek(getWeekDates())}
            className="px-3 py-1 text-sm bg-gray-100 hover:bg-gray-200 rounded-md"
          >
            Today
          </button>

          <button
            onClick={goToNextWeek}
            className="p-2 rounded-full hover:bg-gray-100"
          >
            <svg
              className="h-5 w-5 text-gray-600"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 5l7 7-7 7"
              />
            </svg>
          </button>
        </div>
      </div>

      {/* Calendar grid */}
      <div className="p-6">
        <div className="grid grid-cols-7 gap-2">
          {currentWeek.map((day) => (
            <div key={day.formattedDate} className="text-center">
              <div className="text-sm font-medium text-gray-500">
                {day.dayName}
              </div>
              <div
                className={`text-lg font-semibold rounded-full w-10 h-10 flex items-center justify-center mx-auto 
                ${day.isToday ? "bg-green-500 text-white" : "text-gray-800"}`}
              >
                {day.dayNumber}
              </div>
            </div>
          ))}

          {currentWeek.map((day) => {
            const daySessions = getSessionsForDate(day.formattedDate);

            return (
              <div
                key={`sessions-${day.formattedDate}`}
                className="min-h-[200px] border border-gray-100 rounded-md p-2 overflow-y-auto"
              >
                {daySessions.length > 0 ? (
                  daySessions.map((session, idx) => (
                    <div
                      key={idx}
                      onClick={() => onSessionClick && onSessionClick(session)}
                      className={`mb-2 p-2 rounded-md text-xs border-l-4 
                        ${
                          session.type === "advanced"
                            ? "bg-purple-50 border-purple-500"
                            : session.type === "beginner"
                              ? "bg-blue-50 border-blue-500"
                              : "bg-green-50 border-green-500"
                        }
                        ${onSessionClick ? "cursor-pointer hover:shadow-md transition-shadow" : ""}
                      `}
                    >
                      <div className="font-medium">
                        {session.startTime} - {session.endTime}
                      </div>
                      <div className="font-medium">{session.title}</div>
                      <div className="text-gray-500">
                        Coach: {session.coach}
                      </div>

                      {session.status === "cancelled" && (
                        <div className="mt-1 inline-block px-2 py-0.5 bg-red-100 text-red-800 text-xs rounded-full">
                          Cancelled
                        </div>
                      )}
                    </div>
                  ))
                ) : (
                  <div className="h-full flex items-center justify-center">
                    <p className="text-gray-400 text-xs">No sessions</p>
                  </div>
                )}

                {/* Add session button for admin */}
                {userRole === "admin" && (
                  <Link to={`/admin/schedule/create?date=${day.formattedDate}`}>
                    <button className="w-full mt-2 py-1 text-xs text-center text-gray-500 hover:text-green-600 border border-dashed border-gray-300 rounded-md hover:border-green-500">
                      + Add Session
                    </button>
                  </Link>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

CalendarView.propTypes = {
  sessions: PropTypes.arrayOf(
    PropTypes.shape({
      id: PropTypes.string,
      title: PropTypes.string,
      date: PropTypes.string,
      startTime: PropTypes.string,
      endTime: PropTypes.string,
      coach: PropTypes.string,
      type: PropTypes.string,
      status: PropTypes.string,
    }),
  ).isRequired,
  userRole: PropTypes.string,
  onSessionClick: PropTypes.func,
};

export default CalendarView;
