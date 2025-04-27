import React, { useState, useEffect } from "react";
import "./WorkScheduleForm.css";

export default function WorkScheduleForm({ masterId, onSubmit, onCancel }) {
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
  const [loadingDays, setLoadingDays] = useState({});
  const [errorDays, setErrorDays] = useState({});
  const [globalError, setGlobalError] = useState("");

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

  useEffect(() => {
    if (!masterId) return;
    (async () => {
      try {
        const res = await fetch(
          `https://api.kuchizu.online/masters/${masterId}/hours`
        );
        if (!res.ok) throw new Error(res.statusText);
        const data = await res.json();
        const obj = {};
        data.forEach(({ day, work_start, work_end }) => {
          obj[day] = [work_start, work_end];
        });
        setSchedule(obj);
      } catch (err) {
        setGlobalError("У вас не установлен график");
        console.error(err);
      }
    })();
  }, [masterId]);

  const updateDay = async (day, times) => {
    setLoadingDays((d) => ({ ...d, [day]: true }));
    setErrorDays((e) => ({ ...e, [day]: "" }));
    try {
      const res = await fetch(
        `https://api.kuchizu.online/masters/${masterId}/hours`,
        {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            [day]: times,
          }),
        }
      );
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.detail?.[0]?.msg || res.statusText);
      }
      // Обновляем расписание локально после успешного сохранения
      setSchedule((s) => ({ ...s, [day]: times }));

      // Перезагружаем страницу для отображения актуальных данных
      window.location.reload();
    } catch (err) {
      setErrorDays((e) => ({ ...e, [day]: err.message }));
    } finally {
      setLoadingDays((d) => ({ ...d, [day]: false }));
    }
  };

  const handleTimeChange = (day, timeIndex, type, value) => {
    const newTimes = [...schedule[day]];
    const [hours, minutes] = newTimes[timeIndex].split(":");

    if (type === "hours") {
      newTimes[timeIndex] = `${value}:${minutes}`;
    } else {
      newTimes[timeIndex] = `${hours}:${value}`;
    }

    setSchedule((s) => ({ ...s, [day]: newTimes }));
    updateDay(day, newTimes);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(schedule);
  };

  return (
    <div className="work-schedule-form">
      <div className="form-header">
        <h2>График работы мастера</h2>
        <button
          type="button"
          className="close-button"
          onClick={onCancel}
          aria-label="Закрыть"
        >
          ×
        </button>
      </div>

      {globalError && <div className="error-message">{globalError}</div>}

      <form onSubmit={handleSubmit}>
        <div className="schedule-grid">
          <div className="schedule-header">
            <div className="day-label">День недели</div>
            <div className="time-label">Начало</div>
            <div className="time-label">Конец</div>
          </div>
          {Object.entries(dayLabels).map(([day, label]) => (
            <React.Fragment key={day}>
              <div className="day-name">{label}</div>
              <div className="time-input-container">
                <div className="time-selects">
                  <select
                    className="time-select hours-select"
                    value={schedule[day]?.[0]?.split(":")[0] || "00"}
                    onChange={(e) =>
                      handleTimeChange(day, 0, "hours", e.target.value)
                    }
                    aria-label="Часы начала"
                  >
                    {hoursOptions.map((hour) => (
                      <option key={`start-${day}-h-${hour}`} value={hour}>
                        {hour}
                      </option>
                    ))}
                  </select>
                  <span className="time-separator">:</span>
                  <select
                    className="time-select minutes-select"
                    value={schedule[day]?.[0]?.split(":")[1] || "00"}
                    onChange={(e) =>
                      handleTimeChange(day, 0, "minutes", e.target.value)
                    }
                    aria-label="Минуты начала"
                  >
                    {minutesOptions.map((minute) => (
                      <option key={`start-${day}-m-${minute}`} value={minute}>
                        {minute}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
              <div className="time-input-container">
                <div className="time-selects">
                  <select
                    className="time-select hours-select"
                    value={schedule[day]?.[1]?.split(":")[0] || "00"}
                    onChange={(e) =>
                      handleTimeChange(day, 1, "hours", e.target.value)
                    }
                    aria-label="Часы окончания"
                  >
                    {hoursOptions.map((hour) => (
                      <option key={`end-${day}-h-${hour}`} value={hour}>
                        {hour}
                      </option>
                    ))}
                  </select>
                  <span className="time-separator">:</span>
                  <select
                    className="time-select minutes-select"
                    value={schedule[day]?.[1]?.split(":")[1] || "00"}
                    onChange={(e) =>
                      handleTimeChange(day, 1, "minutes", e.target.value)
                    }
                    aria-label="Минуты окончания"
                  >
                    {minutesOptions.map((minute) => (
                      <option key={`end-${day}-m-${minute}`} value={minute}>
                        {minute}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
              {loadingDays[day] && (
                <div className="loading-indicator">Сохраняем...</div>
              )}
              {errorDays[day] && (
                <div className="error-message">{errorDays[day]}</div>
              )}
            </React.Fragment>
          ))}
        </div>

        <div className="form-actions">
          <button type="button" className="cancel-button" onClick={onCancel}>
            Закрыть
          </button>
        </div>
      </form>
    </div>
  );
}
