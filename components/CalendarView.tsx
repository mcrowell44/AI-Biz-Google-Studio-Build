
import React, { useState } from 'react';
import { ChevronLeft, ChevronRight, Plus, Calendar as CalendarIcon } from 'lucide-react';

interface Appointment {
  date: Date;
  title: string;
  description: string;
  color: 'blue' | 'green' | 'red' | 'purple' | 'yellow';
}

const mockAppointments: Appointment[] = [
  { date: new Date(2026, 0, 12), title: 'Client Onboarding - Acme Corp', description: 'Initial setup and walkthrough of AI features.', color: 'blue' },
  { date: new Date(2026, 0, 15), title: 'Demo Call - Sarah P.', description: 'Product demo for potential lead.', color: 'green' },
  { date: new Date(2026, 0, 20), title: 'Team Sync - Strategy', description: 'Weekly strategy meeting with AI agents team.', color: 'purple' },
  { date: new Date(2026, 0, 12), title: 'Follow-up Email Prep', description: 'Prepare follow-up for Acme Corp.', color: 'yellow' },
  { date: new Date(2026, 1, 5), title: 'Q1 Review - AI Performance', description: 'Review Q1 AI agent performance metrics.', color: 'red' }, // Feb 5th, 2026
  { date: new Date(2026, 1, 10), title: 'New Feature Brainstorm', description: 'Brainstorming session for upcoming AI features.', color: 'blue' }, // Feb 10th, 2026
];


const CalendarView: React.FC = () => {
  // Initialize currentDate to January 8, 2026 (month is 0-indexed, so January is 0)
  const [currentDate, setCurrentDate] = useState<Date>(new Date(2026, 0, 8));
  const [currentCalendarView, setCurrentCalendarView] = useState<'day' | 'week' | 'month'>('month');
  const [selectedDay, setSelectedDay] = useState<Date | null>(null); // New state for selected day

  const daysOfWeek = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  const getMonthName = (date: Date) => {
    return date.toLocaleString('default', { month: 'long' });
  };

  const isSameDay = (d1: Date, d2: Date) => {
    return d1.getFullYear() === d2.getFullYear() &&
           d1.getMonth() === d2.getMonth() &&
           d1.getDate() === d2.getDate();
  };

  const goToPreviousMonth = () => {
    setCurrentDate(prevDate => {
      const newDate = new Date(prevDate.getFullYear(), prevDate.getMonth() - 1, 1);
      setSelectedDay(null); // Clear selected day on month change
      return newDate;
    });
  };

  const goToNextMonth = () => {
    setCurrentDate(prevDate => {
      const newDate = new Date(prevDate.getFullYear(), prevDate.getMonth() + 1, 1);
      setSelectedDay(null); // Clear selected day on month change
      return newDate;
    });
  };

  const handleDayClick = (day: Date | null) => {
    if (day && day.getMonth() === currentDate.getMonth()) { // Only allow selection of days in the current displayed month
      if (selectedDay && isSameDay(selectedDay, day)) {
        setSelectedDay(null); // Deselect if the same day is clicked again
      } else {
        setSelectedDay(day);
      }
    } else {
      setSelectedDay(null); // Clear selection if clicking an 'empty' day or a day from another month
    }
  };

  const renderCalendarDays = () => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth(); // 0-indexed month
    const today = new Date(); // Real current date for highlighting "today"

    const firstDayOfMonth = new Date(year, month, 1).getDay(); // 0 for Sunday, 1 for Monday, etc.
    const daysInMonth = new Date(year, month + 1, 0).getDate(); // Last day of the current month

    const calendarDays: (Date | null)[] = [];

    // Add leading empty cells for days before the 1st of the month
    for (let i = 0; i < firstDayOfMonth; i++) {
      calendarDays.push(null);
    }

    // Add actual days of the month
    for (let i = 1; i <= daysInMonth; i++) {
      calendarDays.push(new Date(year, month, i));
    }

    // Add trailing empty cells to fill the last week (ensure 42 cells total for a consistent grid)
    while (calendarDays.length < 42) { // 6 weeks * 7 days
      calendarDays.push(null);
    }

    return calendarDays.map((day, index) => {
      const isCurrentMonthDay = day !== null && day.getMonth() === month;
      const isToday = day !== null && isSameDay(day, today);
      const dayAppointments = day ? mockAppointments.filter(app => isSameDay(app.date, day)) : [];
      const hasAppointments = dayAppointments.length > 0;
      const isSelected = day !== null && selectedDay !== null && isSameDay(day, selectedDay);

      return (
        <div 
          key={index} 
          className={`h-24 p-2 rounded-xl flex flex-col relative overflow-hidden transition-all duration-150 ${
            isCurrentMonthDay 
              ? 'bg-slate-900 border border-slate-800 cursor-pointer' 
              : 'bg-slate-950 border border-slate-900 text-slate-600 cursor-not-allowed'
          } ${isToday ? 'ring-2 ring-yellow-500 ring-offset-2 ring-offset-slate-900 shadow-lg' : ''}
            ${isSelected ? 'border-yellow-500 ring-1 ring-yellow-500/80 shadow-md' : 'hover:border-yellow-500/50'}
          `}
          onClick={() => handleDayClick(day)}
        >
          <span className={`text-sm font-bold ${isToday ? 'text-yellow-500' : (isCurrentMonthDay ? 'text-white' : 'text-slate-600')}`}>
            {day ? day.getDate() : ''}
          </span>
          {hasAppointments && (
            <div className="absolute bottom-2 left-1/2 -translate-x-1/2 w-1.5 h-1.5 rounded-full bg-yellow-500" />
          )}
        </div>
      );
    });
  };

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-3xl font-bold">Appointment Calendar</h2>
        <p className="text-slate-400">Manage all your AI-scheduled appointments and tasks.</p>
      </div>

      <div className="bg-slate-900 border border-slate-800 p-8 rounded-3xl shadow-xl">
        {/* Calendar Header */}
        <div className="flex justify-between items-center mb-6">
          <div className="flex items-center gap-4">
            <button 
              onClick={goToPreviousMonth}
              className="p-2 rounded-full hover:bg-slate-800 text-slate-400 hover:text-white transition-colors"
            >
              <ChevronLeft size={20} />
            </button>
            <h3 className="text-2xl font-bold">
              {getMonthName(currentDate)} {currentDate.getFullYear()}
            </h3>
            <button 
              onClick={goToNextMonth}
              className="p-2 rounded-full hover:bg-slate-800 text-slate-400 hover:text-white transition-colors"
            >
              <ChevronRight size={20} />
            </button>
          </div>
          
          <div className="flex gap-2 bg-slate-800 p-1 rounded-xl border border-slate-700">
            <button 
              onClick={() => setCurrentCalendarView('day')}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${currentCalendarView === 'day' ? 'bg-slate-700 text-white shadow-lg' : 'text-slate-400 hover:text-white'}`}
            >
              Day
            </button>
            <button 
              onClick={() => setCurrentCalendarView('week')}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${currentCalendarView === 'week' ? 'bg-slate-700 text-white shadow-lg' : 'text-slate-400 hover:text-white'}`}
            >
              Week
            </button>
            <button 
              onClick={() => setCurrentCalendarView('month')}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${currentCalendarView === 'month' ? 'bg-slate-700 text-white shadow-lg' : 'text-slate-400 hover:text-white'}`}
            >
              Month
            </button>
          </div>

          <button className="bg-yellow-500 text-slate-950 px-5 py-2 rounded-xl font-bold flex items-center gap-2 hover:bg-yellow-400 transition-all">
            <Plus size={18} />
            New Event
          </button>
        </div>

        {/* Calendar Grid */}
        {currentCalendarView === 'month' && (
          <div className="grid grid-cols-7 gap-2">
            {/* Days of the week header */}
            {daysOfWeek.map(day => (
              <div key={day} className="text-center text-sm font-bold text-slate-500 py-2">
                {day}
              </div>
            ))}
            {/* Calendar days */}
            {renderCalendarDays()}
          </div>
        )}

        {/* Placeholder for Day/Week View */}
        {currentCalendarView !== 'month' && (
          <div className="h-96 flex items-center justify-center bg-slate-950 rounded-2xl border border-slate-800 text-slate-500 text-lg">
            {`"${currentCalendarView.charAt(0).toUpperCase() + currentCalendarView.slice(1)}" View Coming Soon!`}
          </div>
        )}
      </div>

      {/* Daily Schedule List */}
      {selectedDay && (
        <div className="mt-8 bg-slate-900 border border-slate-800 p-8 rounded-3xl shadow-xl">
          <h3 className="text-xl font-bold mb-6 flex items-center gap-3">
            <CalendarIcon size={24} className="text-yellow-500" />
            Schedule for {selectedDay.toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
          </h3>

          {mockAppointments.filter(app => isSameDay(app.date, selectedDay)).length > 0 ? (
            <div className="space-y-4 max-h-80 overflow-y-auto pr-2 custom-scrollbar">
              {mockAppointments
                .filter(app => isSameDay(app.date, selectedDay))
                .map((app, appIdx) => (
                  <div key={appIdx} className="flex items-center gap-4 bg-slate-950 p-4 rounded-xl border border-slate-800">
                    <div className={`w-3 h-3 rounded-full bg-${app.color}-500 flex-shrink-0`} />
                    <div>
                      <p className="font-semibold text-white">{app.title}</p>
                      <p className="text-sm text-slate-400">{app.description}</p>
                    </div>
                  </div>
                ))}
            </div>
          ) : (
            <div className="text-slate-500 text-center py-10 bg-slate-950 rounded-xl border border-slate-800">
              No events scheduled for this day.
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default CalendarView;
