/**
 * Компонент для отображения календаря мастера
 */
import React, { useState, useEffect } from 'react';
import './MasterCalendar.css';
import { formatDateFull, formatTimeShort, parseDateTime, addTimeMinutes } from '../../../utils/dateUtils';

/**
 * Компонент для отображения календаря мастера со слотами и бронированиями
 * @param {Object} props - свойства компонента
 * @param {Date} props.selectedDate - выбранная дата
 * @param {Function} props.onDateChange - обработчик изменения даты
 * @param {Array} props.appointments - список бронирований и блокировок
 * @param {Function} props.onBookingClick - обработчик клика по бронированию
 * @param {boolean} props.isDayOff - признак выходного дня
 */
const MasterCalendar = ({ 
  selectedDate, 
  onDateChange, 
  appointments,
  onBookingClick,
  isDayOff
}) => {
  const [calendarView, setCalendarView] = useState('day'); // 'day', 'week', 'month'
  const [timeSlots, setTimeSlots] = useState([]);
  const [displayedAppointments, setDisplayedAppointments] = useState([]);
  
  // Генерация временных слотов для выбранной даты
  useEffect(() => {
    const slots = [];
    const startHour = 8; // Начинаем с 8 утра
    const endHour = 22; // Заканчиваем в 10 вечера
    
    for (let hour = startHour; hour < endHour; hour++) {
      for (let minute = 0; minute < 60; minute += 30) {
        const date = new Date(selectedDate);
        date.setHours(hour, minute, 0, 0);
        slots.push(date);
      }
    }
    
    setTimeSlots(slots);
  }, [selectedDate]);
  
  // Фильтрация бронирований для выбранной даты
  useEffect(() => {
    if (!appointments?.length) {
      setDisplayedAppointments([]);
      return;
    }
    
    const selectedDateStr = selectedDate.toISOString().split('T')[0];
    const filteredAppointments = appointments.filter(appointment => {
      const startDate = parseDateTime(appointment.startTime || appointment.date);
      const appointmentDateStr = startDate.toISOString().split('T')[0];
      return appointmentDateStr === selectedDateStr;
    });
    
    setDisplayedAppointments(filteredAppointments);
  }, [appointments, selectedDate]);
  
  // Обработчики навигации по календарю
  const navigateDay = (dayOffset) => {
    const newDate = new Date(selectedDate);
    newDate.setDate(newDate.getDate() + dayOffset);
    onDateChange(newDate);
  };
  
  const navigateToday = () => {
    onDateChange(new Date());
  };
  
  // Определение пересечения временного слота с бронированием
  const getAppointmentForTimeSlot = (timeSlot) => {
    if (!displayedAppointments?.length) return null;
    
    return displayedAppointments.find(appointment => {
      const startTime = parseDateTime(appointment.startTime || appointment.date);
      const endTime = appointment.endTime 
        ? parseDateTime(appointment.endTime) 
        : addTimeMinutes(startTime, appointment.duration || 60);
      
      return timeSlot >= startTime && timeSlot < endTime;
    });
  };
  
  // Определение типа бронирования для отображения
  const getAppointmentType = (appointment) => {
    if (!appointment) return null;
    
    if (appointment.isBlocked) return 'blocked';
    if (appointment.isCustom) return 'custom';
    return 'regular';
  };
  
  // Отображение даты
  const renderDateHeader = () => (
    <div className="calendar-date-header">
      <button 
        className="calendar-nav-button" 
        onClick={() => navigateDay(-1)}
      >
        &lt;
      </button>
      <h2 className="calendar-date">
        {formatDateFull(selectedDate)}
      </h2>
      <button 
        className="calendar-nav-button" 
        onClick={() => navigateDay(1)}
      >
        &gt;
      </button>
    </div>
  );
  
  // Отображение дня
  const renderDayView = () => (
    <div className={`calendar-day-view ${isDayOff ? 'day-off' : ''}`}>
      {isDayOff && (
        <div className="day-off-indicator">
          Выходной день
        </div>
      )}
      
      <div className="calendar-time-slots">
        {timeSlots.map((timeSlot, index) => {
          const appointment = getAppointmentForTimeSlot(timeSlot);
          const appointmentType = getAppointmentType(appointment);
          
          // Если слот занят, и это не первый слот бронирования, пропускаем
          if (appointment && index > 0) {
            const prevSlot = timeSlots[index - 1];
            const prevAppointment = getAppointmentForTimeSlot(prevSlot);
            if (prevAppointment && prevAppointment._id === appointment._id) {
              return null;
            }
          }
          
          // Расчет высоты ячейки бронирования
          let appointmentHeight = 1;
          if (appointment) {
            const startTime = parseDateTime(appointment.startTime || appointment.date);
            const endTime = appointment.endTime 
              ? parseDateTime(appointment.endTime) 
              : addTimeMinutes(startTime, appointment.duration || 60);
            
            const startIndex = timeSlots.findIndex(slot => 
              slot.getHours() === startTime.getHours() && 
              slot.getMinutes() === startTime.getMinutes()
            );
            
            if (startIndex !== -1) {
              let endIndex = timeSlots.findIndex(slot => 
                slot.getHours() === endTime.getHours() && 
                slot.getMinutes() === endTime.getMinutes()
              );
              
              if (endIndex === -1) {
                endIndex = timeSlots.length;
              }
              
              appointmentHeight = endIndex - startIndex;
            }
          }
          
          return (
            <div 
              key={timeSlot.toISOString()}
              className={`calendar-time-slot ${appointment ? 'has-appointment' : ''}`}
            >
              <div className="time-label">
                {formatTimeShort(timeSlot)}
              </div>
              
              {appointment && (
                <div 
                  className={`appointment-card appointment-${appointmentType}`}
                  style={{ height: `${appointmentHeight * 40}px` }}
                  onClick={() => onBookingClick(appointment)}
                >
                  <div className="appointment-time">
                    {formatTimeShort(appointment.startTime || appointment.date)} - 
                    {formatTimeShort(appointment.endTime || 
                      addTimeMinutes(
                        parseDateTime(appointment.startTime || appointment.date), 
                        appointment.duration || 60
                      )
                    )}
                  </div>
                  <div className="appointment-title">
                    {appointment.serviceName || appointment.title || 'Бронирование'}
                  </div>
                  {appointment.clientName && (
                    <div className="appointment-client">
                      {appointment.clientName}
                    </div>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
  
  return (
    <div className="master-calendar">
      <div className="calendar-header">
        <div className="calendar-controls">
          <button 
            className="calendar-today-button"
            onClick={navigateToday}
          >
            Сегодня
          </button>
          <div className="calendar-view-toggle">
            <button 
              className={`view-toggle-button ${calendarView === 'day' ? 'active' : ''}`}
              onClick={() => setCalendarView('day')}
            >
              День
            </button>
            {/* Дополнительные кнопки для недели/месяца будут добавлены в будущем */}
          </div>
        </div>
        {renderDateHeader()}
      </div>
      {renderDayView()}
    </div>
  );
};

export default MasterCalendar;
