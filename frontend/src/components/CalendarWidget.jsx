import { useState } from 'react';
import { ChevronLeftIcon, ChevronRightIcon } from './Icons';
import './CalendarWidget.css';

const CalendarWidget = ({ highlights = {} }) => {
  const [currentDate, setCurrentDate] = useState(new Date());

  const daysInMonth = (year, month) => new Date(year, month + 1, 0).getDate();
  const startDayOfMonth = (year, month) => new Date(year, month, 1).getDay();

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  const prevMonth = () => setCurrentDate(new Date(year, month - 1, 1));
  const nextMonth = () => setCurrentDate(new Date(year, month + 1, 1));

  const monthName = currentDate.toLocaleString('default', { month: 'long' });
  const dayNames = ['Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa', 'Su'];

  // Adjust start day to Monday (0=Sun, 1=Mon, ..., 6=Sat -> 0=Mon, ..., 6=Sun)
  let firstDay = startDayOfMonth(year, month);
  firstDay = firstDay === 0 ? 6 : firstDay - 1;

  const totalDays = daysInMonth(year, month);
  const calendarGrid = [];

  // Fill empty slots for previous month days
  for (let i = 0; i < firstDay; i++) {
    calendarGrid.push({ day: null, type: 'empty' });
  }

  // Fill actual days
  for (let i = 1; i <= totalDays; i++) {
    const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(i).padStart(2, '0')}`;
    calendarGrid.push({ day: i, dateStr, type: 'actual' });
  }

  // Mock highlights mapping to FoxHR style circles
  const demoHighlights = {
    '2026-04-10': 'orange',
    '2026-04-17': 'purple',
    '2026-04-18': 'green',
    '2026-04-23': 'blue',
    ...highlights
  };

  const isToday = (day) => {
    const today = new Date();
    return today.getDate() === day && today.getMonth() === month && today.getFullYear() === year;
  };

  return (
    <div className="calendar-widget">
      <div className="calendar-header">
        <h3 className="month-year">{monthName} {year}</h3>
        <div className="nav-btns">
          <button onClick={prevMonth} aria-label="Previous Month"><ChevronLeftIcon size={14} /></button>
          <button onClick={nextMonth} aria-label="Next Month"><ChevronRightIcon size={14} /></button>
        </div>
      </div>

      <div className="calendar-body">
        <div className="day-names">
          {dayNames.map(d => <span key={d}>{d}</span>)}
        </div>
        <div className="days-grid">
          {calendarGrid.map((item, idx) => (
            <div 
              key={idx} 
              className={`day-cell ${item.type} ${isToday(item.day) ? 'today' : ''} ${demoHighlights[item.dateStr] ? `highlight-${demoHighlights[item.dateStr]}` : ''}`}
            >
              {item.day}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default CalendarWidget;
