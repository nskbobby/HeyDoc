'use client';
import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import type { AppDispatch, RootState } from '../../store';
import { checkDateAvailability } from '../../store/appointmentsSlice';
import { Calendar as CalendarIcon } from 'lucide-react';

interface DatePickerProps {
  doctorId: number;
  value: string;
  onChange: (date: string) => void;
  error?: string;
  label?: string;
  className?: string;
}

const DatePicker: React.FC<DatePickerProps> = ({
  doctorId,
  value,
  onChange,
  error,
  label = "Appointment Date",
  className = ""
}) => {
  const dispatch = useDispatch<AppDispatch>();
  const { dateAvailability } = useSelector((state: RootState) => state.appointments);
  const [selectedDate, setSelectedDate] = useState(value);

  // Generate dates for the next 30 days
  const generateDates = () => {
    const dates = [];
    const today = new Date();
    
    for (let i = 0; i < 30; i++) {
      const date = new Date(today);
      date.setDate(today.getDate() + i);
      dates.push(date.toISOString().split('T')[0]);
    }
    
    return dates;
  };

  const availableDates = generateDates();

  // Check availability for all dates when component mounts or doctor changes
  useEffect(() => {
    availableDates.forEach(date => {
      const key = `${doctorId}-${date}`;
      if (dateAvailability[key] === undefined) {
        dispatch(checkDateAvailability({ doctorId, date }));
      }
    });
  }, [doctorId, dispatch, availableDates, dateAvailability]);

  const handleDateChange = (date: string) => {
    setSelectedDate(date);
    onChange(date);
  };

  const isDateAvailable = (date: string) => {
    const key = `${doctorId}-${date}`;
    return dateAvailability[key] !== false; // Allow if unknown or true
  };

  const isWeekend = (dateString: string) => {
    const date = new Date(dateString);
    const day = date.getDay();
    return day === 0 || day === 6; // Sunday = 0, Saturday = 6
  };

  return (
    <div className={className}>
      <label className="block text-sm font-medium text-gray-700 mb-2">
        <CalendarIcon className="inline w-4 h-4 mr-1" />
        {label}
      </label>
      
      <div className="grid grid-cols-7 gap-1 p-4 border rounded-lg bg-white">
        {/* Header with day names */}
        {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
          <div key={day} className="text-center text-xs font-medium text-gray-500 py-2">
            {day}
          </div>
        ))}
        
        {/* Calendar dates */}
        {availableDates.slice(0, 28).map((date, index) => {
          const dateObj = new Date(date);
          const isSelected = selectedDate === date;
          const isAvailable = isDateAvailable(date) && !isWeekend(date);
          const isToday = date === new Date().toISOString().split('T')[0];
          
          return (
            <button
              key={date}
              type="button"
              onClick={() => isAvailable ? handleDateChange(date) : null}
              disabled={!isAvailable}
              className={`
                h-8 text-sm rounded transition-colors
                ${isSelected 
                  ? 'bg-primary-600 text-white' 
                  : isAvailable 
                    ? 'hover:bg-primary-50 bg-white text-gray-900' 
                    : 'bg-gray-100 text-gray-400 cursor-not-allowed'
                }
                ${isToday ? 'ring-1 ring-primary-600' : ''}
                ${isWeekend(date) ? 'text-gray-400' : ''}
              `}
              title={
                isWeekend(date) 
                  ? 'Weekends not available' 
                  : !isAvailable 
                    ? 'No available slots' 
                    : `Select ${dateObj.toLocaleDateString()}`
              }
            >
              {dateObj.getDate()}
            </button>
          );
        })}
      </div>
      
      {selectedDate && (
        <div className="mt-2 text-sm text-gray-600">
          Selected: {new Date(selectedDate).toLocaleDateString('en-US', { 
            weekday: 'long', 
            year: 'numeric', 
            month: 'long', 
            day: 'numeric' 
          })}
        </div>
      )}
      
      {error && (
        <p className="mt-1 text-sm text-red-600">{error}</p>
      )}
      
      {/* Hidden input for form compatibility */}
      <input
        type="hidden"
        value={selectedDate}
        readOnly
      />
    </div>
  );
};

export default DatePicker;