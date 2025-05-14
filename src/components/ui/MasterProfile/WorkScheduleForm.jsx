/**
 * Форма настройки рабочего расписания мастера
 */
import React, { useState, useEffect } from 'react';
import './WorkScheduleForm.css';

/**
 * Компонент для настройки рабочего расписания мастера
 * @param {Object} props - Свойства компонента
 * @param {string} props.masterId - ID мастера
 * @param {Object} props.initialSchedule - Начальное расписание (если есть)
 * @param {Function} props.onSubmit - Обработчик отправки формы
 * @param {Function} props.onCancel - Обработчик отмены
 */
const WorkScheduleForm = ({ 
  masterId, 
  initialSchedule,
  onSubmit, 
  onCancel 
}) => {
  const dayLabels = {
    mon: "Понедельник",
    tue: "Вторник",
    wed: "Среда",
    thu: "Четверг",
    fri: "Пятница",
    sat: "Суббота",
    sun: "Воскресенье",
  };

  const [schedule, setSchedule] = useState({
    mon: ["08:00", "20:00"],
    tue: ["08:00", "20:00"],
    wed: ["08:00", "20:00"],
    thu: ["08:00", "20:00"],
    fri: ["08:00", "20:00"],
    sat: ["08:00", "21:00"],
    sun: ["09:00", "18:00"],
  });
  
  // Состояние для выходных дней
  const [daysOff, setDaysOff] = useState({
    mon: false,
    tue: false,
    wed: false,
    thu: false,
    fri: false,
    sat: false,
    sun: false,
  });
  
  const [loadingDays, setLoadingDays] = useState({});
  const [errorDays, setErrorDays] = useState({});
  const [globalError, setGlobalError] = useState("");
  const [loading, setLoading] = useState(false);

  // Инициализация начальным расписанием, если оно передано
  useEffect(() => {
    if (initialSchedule) {
      const newSchedule = {};
      const newDaysOff = {
        mon: true,
        tue: true,
        wed: true,
        thu: true,
        fri: true,
        sat: true,
        sun: true,
      };
      
      // Заполняем данными о рабочих днях и снимаем флаг выходного дня
      initialSchedule.forEach(({ day, work_start, work_end }) => {
        newSchedule[day] = [work_start, work_end];
        newDaysOff[day] = false; // Если день в расписании - он не выходной
      });
      
      setSchedule(prev => ({...prev, ...newSchedule}));
      setDaysOff(newDaysOff);
    }
  }, [initialSchedule]);

  // Генерация опций для часов (0-23)
  const generateHoursOptions = () => {
    const options = [];
    for (let hour = 0; hour < 24; hour++) {
      options.push(hour.toString().padStart(2, "0"));
    }
    return options;
  };

  // Генерация опций для минут (0, 5, 10, ..., 55)
  const generateMinutesOptions = () => {
    const options = [];
    for (let minute = 0; minute < 60; minute += 5) {
      options.push(minute.toString().padStart(2, "0"));
    }
    return options;
  };

  const hoursOptions = generateHoursOptions();
  const minutesOptions = generateMinutesOptions();

  // Обработчик изменения времени
  const handleTimeChange = (day, index, value) => {
    setSchedule(prev => {
      const newSchedule = { ...prev };
      // Разделяем строку времени на часы и минуты
      const [hour, minute] = newSchedule[day][index].split(":");
      
      // В зависимости от того, что изменилось (часы или минуты), обновляем соответствующую часть
      const isHourChange = value.length === 2;
      const newTime = isHourChange
        ? `${value}:${minute}`
        : `${hour}:${value}`;
      
      newSchedule[day][index] = newTime;
      return newSchedule;
    });
  };

  // Обработчик изменения статуса выходного дня
  const handleDayOffChange = (day, isOff) => {
    setDaysOff(prev => ({ ...prev, [day]: isOff }));
  };

  // Валидация расписания
  const validateSchedule = () => {
    let isValid = true;
    const newErrorDays = {};
    
    Object.keys(schedule).forEach(day => {
      if (daysOff[day]) return; // Пропускаем выходные дни
      
      const [start, end] = schedule[day];
      const [startHour, startMinute] = start.split(":").map(Number);
      const [endHour, endMinute] = end.split(":").map(Number);
      
      const startMinutes = startHour * 60 + startMinute;
      const endMinutes = endHour * 60 + endMinute;
      
      if (endMinutes <= startMinutes) {
        newErrorDays[day] = "Время окончания должно быть позже времени начала";
        isValid = false;
      }
    });
    
    setErrorDays(newErrorDays);
    return isValid;
  };

  // Обработчик отправки формы
  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (!validateSchedule()) {
      return;
    }
    
    // Готовим данные для отправки
    const scheduleData = [];
    
    Object.keys(schedule).forEach(day => {
      if (!daysOff[day]) {
        scheduleData.push({
          day,
          work_start: schedule[day][0],
          work_end: schedule[day][1]
        });
      }
    });
    
    onSubmit(scheduleData);
  };

  return (
    <div className="work-schedule-form">
      <div className="schedule-form-header">
        <h2>Настройка рабочего расписания</h2>
        <button className="close-btn" onClick={onCancel}>×</button>
      </div>
      
      {globalError && <div className="schedule-error">{globalError}</div>}
      
      <form onSubmit={handleSubmit}>
        <div className="schedule-days">
          {Object.keys(dayLabels).map(day => (
            <div key={day} className="schedule-day-row">
              <div className="day-label">
                <label className="day-label-text">{dayLabels[day]}</label>
                <div className="day-off-toggle">
                  <input
                    type="checkbox"
                    id={`day-off-${day}`}
                    checked={daysOff[day]}
                    onChange={(e) => handleDayOffChange(day, e.target.checked)}
                  />
                  <label htmlFor={`day-off-${day}`}>Выходной</label>
                </div>
              </div>
              
              {!daysOff[day] && (
                <div className="time-selectors">
                  <div className="time-selector">
                    <label>Начало</label>
                    <div className="time-inputs">
                      <select 
                        value={schedule[day][0].split(":")[0]}
                        onChange={(e) => handleTimeChange(day, 0, e.target.value)}
                        disabled={loadingDays[day]}
                      >
                        {hoursOptions.map(hour => (
                          <option key={hour} value={hour}>{hour}</option>
                        ))}
                      </select>
                      <span>:</span>
                      <select 
                        value={schedule[day][0].split(":")[1]}
                        onChange={(e) => handleTimeChange(day, 0, e.target.value)}
                        disabled={loadingDays[day]}
                      >
                        {minutesOptions.map(minute => (
                          <option key={minute} value={minute}>{minute}</option>
                        ))}
                      </select>
                    </div>
                  </div>
                  
                  <div className="time-selector">
                    <label>Конец</label>
                    <div className="time-inputs">
                      <select 
                        value={schedule[day][1].split(":")[0]}
                        onChange={(e) => handleTimeChange(day, 1, e.target.value)}
                        disabled={loadingDays[day]}
                      >
                        {hoursOptions.map(hour => (
                          <option key={hour} value={hour}>{hour}</option>
                        ))}
                      </select>
                      <span>:</span>
                      <select 
                        value={schedule[day][1].split(":")[1]}
                        onChange={(e) => handleTimeChange(day, 1, e.target.value)}
                        disabled={loadingDays[day]}
                      >
                        {minutesOptions.map(minute => (
                          <option key={minute} value={minute}>{minute}</option>
                        ))}
                      </select>
                    </div>
                  </div>
                </div>
              )}
              
              {errorDays[day] && <div className="day-error">{errorDays[day]}</div>}
            </div>
          ))}
        </div>
        
        <div className="schedule-form-actions">
          <button type="button" className="cancel-button" onClick={onCancel}>
            Отмена
          </button>
          <button type="submit" className="save-button" disabled={loading}>
            {loading ? "Сохранение..." : "Сохранить расписание"}
          </button>
        </div>
      </form>
    </div>
  );
};

export default WorkScheduleForm;
