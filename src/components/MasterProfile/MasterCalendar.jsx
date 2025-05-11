import React, { useState, useEffect } from "react";
import "./MasterCalendar.css";

function MasterCalendar({
  bookings: propBookings,
  selectedDate,
  onDateChange,
  onSelectBooking,
  master_id,
}) {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [apiBookings, setApiBookings] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [serviceNames, setServiceNames] = useState({});

  async function getServiceNameById(serviceId) {
    try {
      const response = await fetch(
        `https://api.kuchizu.online/services/${serviceId}`,
        {
          headers: { accept: "application/json" },
        }
      );
      if (!response.ok) {
        throw new Error(`Service ${serviceId} not found`);
      }
      const data = await response.json();
      return data.service_name;
    } catch (error) {
      console.error(error);
      return null;
    }
  }
  // Получение записей с API
  useEffect(() => {
    const fetchBookings = async () => {
      setIsLoading(true);
      setError(null);
      try {
        // Получаем стандартные записи
        const responseAppointments = await fetch("https://api.kuchizu.online/appointments");
        if (!responseAppointments.ok) {
          throw new Error("Не удалось загрузить данные о бронированиях");
        }
        const appointmentsData = await responseAppointments.json();
        const filteredAppointments = appointmentsData.filter(
          (item) => item.master_id === master_id && item.status === 'booked'
        );

        // Получаем кастомные записи
        const responseCustom = await fetch("https://api.kuchizu.online/custom_appointments");
        if (!responseCustom.ok) {
          throw new Error("Не удалось загрузить данные о кастомных бронированиях");
        }
        const customData = await responseCustom.json();
        const filteredCustom = customData.filter(
          (item) => item.master_id === master_id && item.status === 'booked'
        );
        
        // Получаем уникальные service_id из всех бронирований
        const uniqueServiceIds = [...new Set(filteredAppointments.map(booking => booking.service_id))];
        
        // Получаем названия услуг для всех уникальных service_id
        const serviceNamesMap = {};
        for (const serviceId of uniqueServiceIds) {
          if (serviceId) {
            const serviceName = await getServiceNameById(serviceId);
            serviceNamesMap[serviceId] = serviceName;
          }
        }
        setServiceNames(serviceNamesMap);
        
        // Объединяем стандартные и кастомные записи
        setApiBookings([...filteredAppointments, ...filteredCustom]);
      } catch (err) {
        console.error("Ошибка при загрузке бронирований:", err);
        setError(err.message);
      } finally {
        setIsLoading(false);
      }
    };

    fetchBookings();
  }, [master_id]);
  // Комбинируем бронирования из пропсов и API
  const allBookings = [
    ...(propBookings || []),
    ...apiBookings.map((booking) => {
      // Проверяем, является ли бронирование кастомным (по наличию полей start_time и end_time в формате YYYY-MM-DD HH:MM)
      const isCustom = booking.start_time && booking.start_time.includes(' ');
      
      if (isCustom) {
        // Обработка кастомного бронирования
        return {
          id: booking.id,
          client_name: booking.client_name,
          service_name: booking.service_name, // У кастомных есть сразу service_name
          start_time: booking.start_time,
          end_time: booking.end_time,
          is_blocked: booking.status === "blocked",
          is_personal: booking.status === "personal",
          comment: booking.comment,
          is_custom: true,
          original_data: booking,
        };
      } else {
        // Обработка стандартного бронирования
        return {
          id: booking.id,
          client_name: booking.client_name,
          service_id: booking.service_id,
          service_name: serviceNames[booking.service_id] || "Услуга",
          appointment_datetime: booking.appointment_datetime,
          start_time: booking.appointment_datetime, // Для обратной совместимости
          is_blocked: booking.status === "blocked",
          is_personal: booking.status === "personal",
          comment: booking.comment,
          is_custom: false,
          original_data: booking,
        };
      }
    }),
  ];

  // Переход к предыдущему дню
  const prevDay = () => {
    const newDate = new Date(selectedDate);
    newDate.setDate(newDate.getDate() - 1);
    onDateChange(newDate);
  };

  // Переход к следующему дню
  const nextDay = () => {
    const newDate = new Date(selectedDate);
    newDate.setDate(newDate.getDate() + 1);
    onDateChange(newDate);
  };

  // Переход к текущему дню
  const goToToday = () => {
    const today = new Date();
    setCurrentDate(today);
    onDateChange(today);
  };

  // Проверка на текущий день
  const isToday = (date) => {
    const today = new Date();
    return (
      today.getDate() === date.getDate() &&
      today.getMonth() === date.getMonth() &&
      today.getFullYear() === date.getFullYear()
    );
  };

  // Проверка выбранного дня
  const isSelected = (date) => {
    return (
      selectedDate.getDate() === date.getDate() &&
      selectedDate.getMonth() === date.getMonth() &&
      selectedDate.getFullYear() === date.getFullYear()
    );
  };
  // Получение записей для определенного дня
  const getDayBookings = (date) => {
    return allBookings.filter((booking) => {
      // Проверяем наличие разных полей с датой и выбираем подходящее
      let dateField;
      
      if (booking.is_custom) {
        // Для кастомных бронирований используем start_time
        dateField = booking.start_time;
      } else {
        // Для стандартных бронирований проверяем разные поля
        dateField = booking.date || booking.start_time || booking.appointment_datetime || 
                   (booking.original_data && booking.original_data.appointment_datetime);
      }
      
      if (!dateField) return false;
      
      // Преобразуем строку в объект Date
      let bookingDate = new Date(dateField);
      
      // Если это формат "YYYY-MM-DD HH:MM", разберем его вручную
      if (typeof dateField === 'string' && dateField.includes(' ')) {
        const [datePart, timePart] = dateField.split(' ');
        const [year, month, day] = datePart.split('-').map(Number);
        // Учитываем, что месяцы в объекте Date начинаются с 0
        bookingDate = new Date(year, month - 1, day);
      }
      
      return (
        bookingDate.getDate() === date.getDate() &&
        bookingDate.getMonth() === date.getMonth() &&
        bookingDate.getFullYear() === date.getFullYear()
      );
    });
  };

  // Обработчик клика на день
  const handleDayClick = (date) => {
    // Создаем новую дату, сохраняя точно тот же день, месяц и год
    const selectedDay = new Date(
      date.getFullYear(),
      date.getMonth(),
      date.getDate(),
      12,
      0,
      0
    );
    onDateChange(selectedDay);
  };

  // Получаем список дат для отображения (3 дня до, выбранный день и 3 дня после)
  const getDatesForDisplay = () => {
    const dates = [];
    const centerDate = new Date(selectedDate);

    // Добавляем 3 дня до выбранной даты
    for (let i = -3; i <= 3; i++) {
      const dateToAdd = new Date(centerDate);
      dateToAdd.setDate(centerDate.getDate() + i);
      dates.push(dateToAdd);
    }

    return dates;
  };
  // Форматирование времени
  const formatTime = (dateStr) => {
    if (!dateStr) return "—";
    
    // Проверяем формат строки
    if (typeof dateStr === 'string' && dateStr.includes(' ')) {
      // Для строк в формате "YYYY-MM-DD HH:MM" извлекаем время
      const timePart = dateStr.split(' ')[1];
      return timePart;
    }
    
    // Для других форматов используем встроенное форматирование
    const date = new Date(dateStr);
    return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  };

  // Название дней недели
  const weekdayNames = ["ВС", "ПН", "ВТ", "СР", "ЧТ", "ПТ", "СБ"];

  // Название месяцев
  const monthNames = [
    "Января",
    "Февраля",
    "Марта",
    "Апреля",
    "Мая",
    "Июня",
    "Июля",
    "Августа",
    "Сентября",
    "Октября",
    "Ноября",
    "Декабря",
  ];
  // Отрисовка дней
  const renderDays = () => {
    return getDatesForDisplay().map((date, index) => {
      const dayBookings = getDayBookings(date);
      const hasBookings = dayBookings.length > 0;

      return (
        <div
          key={`day-${index}`}
          className={`calendar-day-view ${isToday(date) ? "today" : ""} ${
            isSelected(date) ? "selected" : ""
          }`}
          onClick={() => handleDayClick(date)}
        >
          <div className="day-header">
            <span className="day-name">{weekdayNames[date.getDay()]}</span>
            <span className="day-number">{date.getDate()}</span>
            <span className="day-month">
              {monthNames[date.getMonth()].substring(0, 3)}
            </span>
          </div>

          {hasBookings ? (
            <div className="day-bookings-preview">
              {dayBookings.slice(0, 2).map((booking, idx) => (
                <div
                  key={idx}
                  className={`booking-preview ${
                    booking.is_blocked
                      ? "blocked"
                      : booking.is_personal
                      ? "personal"
                      : booking.is_custom
                      ? "custom"
                      : ""
                  }`}
                >
                  <span className="booking-time">
                    {formatTime(booking.start_time)}
                  </span>
                  <span className="booking-title">
                    {booking.service_name || (booking.is_custom ? "Кастомная запись" : "Личное время")}
                  </span>
                </div>
              ))}
              {dayBookings.length > 2 && (
                <div className="more-bookings">
                  + ещё {dayBookings.length - 2}
                </div>
              )}
            </div>
          ) : (
            <div className="day-bookings-preview empty">
              <span className="no-bookings-indicator">•••</span>
            </div>
          )}
        </div>
      );
    });
  };
  // Отображение расписания на выбранный день
  const renderSelectedDaySchedule = () => {
    const dayBookings = getDayBookings(selectedDate).sort((a, b) => {
      // Получаем временную метку из start_time
      const getTimeValue = (booking) => {
        const timeStr = booking.start_time;
        if (typeof timeStr === 'string' && timeStr.includes(' ')) {
          // Формат "YYYY-MM-DD HH:MM"
          const [datePart, timePart] = timeStr.split(' ');
          const [hours, minutes] = timePart.split(':').map(Number);
          const [year, month, day] = datePart.split('-').map(Number);
          // Создаем объект Date для сравнения (месяцы в Date начинаются с 0)
          return new Date(year, month - 1, day, hours, minutes).getTime();
        }
        // Для стандартного формата
        return timeStr ? new Date(timeStr).getTime() : 0;
      };
      
      return getTimeValue(a) - getTimeValue(b);
    });

    if (dayBookings.length === 0) {
      return (
        <div className="no-bookings">
          <p>На этот день нет записей.</p>
        </div>
      );
    }

    return (
      <div>
        {isLoading && (
          <div className="loading-message">Загрузка бронирований...</div>
        )}
        {error && <div className="error-message">Ошибка: {error}</div>}
        <div className="bookings-list">
          {dayBookings.map((booking) => {
            return (
              <div
                key={booking.id}
                className={`booking-item ${
                  booking.is_blocked
                    ? "blocked"
                    : booking.is_personal
                    ? "personal"
                    : booking.is_custom
                    ? "custom"
                    : ""
                }`}
                onClick={() => onSelectBooking(booking)}
              >
                <div className="booking-time">
                  {formatTime(booking.start_time)}
                  {booking.end_time && ` - ${formatTime(booking.end_time)}`}
                </div>
                <div className="booking-info">
                  <div className="booking-title">
                    {booking.service_name || (booking.is_custom ? "Кастомная запись" : "Личное время")}
                  </div>
                  <div className="booking-client">
                    {booking.client_name ||
                      (booking.is_personal
                        ? "Личная запись"
                        : booking.is_blocked
                        ? "Забронировано"
                        : "Нет данных")}
                  </div>
                  {booking.comment && (
                    <div className="booking-comment">{booking.comment}</div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  return (
    <div className="master-calendar-container">
      <div className="calendar-controls">
        <button onClick={prevDay} className="calendar-nav-btn">
          ←
        </button>
        <button onClick={nextDay} className="calendar-nav-btn">
          →
        </button>
      </div>

      <div className="calendar-days-container">{renderDays()}</div>

      <div className="selected-day-schedule">{renderSelectedDaySchedule()}</div>
    </div>
  );
}

export default MasterCalendar;
