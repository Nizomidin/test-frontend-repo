import React, { useState, useEffect } from "react";
import "./BlockTimeForm.css";

function BlockTimeForm({ onSubmit, onCancel, selectedDate, masterId, embedded = false }) {
  const [formData, setFormData] = useState({
    clientName: "",
    service: "", // будет хранить id выбранной услуги
    date: formatDateForInput(selectedDate),
    startTime: "",
    notes: "",
  });
  const [timeError, setTimeError] = useState("");
  const [availableTimeSlots, setAvailableTimeSlots] = useState([]);
  const [services, setServices] = useState([]);
  const [servicesLoading, setServicesLoading] = useState(false);
  const [loading, setLoading] = useState(false);
  const [selectedTimeSlot, setSelectedTimeSlot] = useState(null);

  function formatDateForInput(date) {
    const d = new Date(date);
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, "0");
    const day = String(d.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
  }

  function formatDateForApi(date) {
    const d = new Date(date);
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, "0");
    const day = String(d.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
  }

  // 1) Загрузка доступных слотов
  useEffect(() => {
    if (!selectedDate || !masterId) return;
    setLoading(true);
    const dateStr = formatDateForApi(selectedDate);

    fetch(
      `https://api.kuchizu.online/masters/${masterId}/available?date=${dateStr}`,
      { headers: { accept: "application/json" } }
    )
      .then((res) => {
        if (res.status === 400) {
          // Если статус 404, значит у мастера выходной день
          setAvailableTimeSlots([]);
          return { slots: [] };
        }
        if (!res.ok) throw new Error("Ошибка загрузки интервалов");
        return res.json();
      })
      .then((data) => setAvailableTimeSlots(data))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [selectedDate, masterId]);

  // 2) Загрузка списка услуг
  useEffect(() => {
    if (!masterId) return;
    setServicesLoading(true);
    fetch("https://api.kuchizu.online/services", {
      headers: { accept: "application/json" },
    })
      .then((res) => {
        if (!res.ok) throw new Error("Ошибка загрузки услуг");
        return res.json();
      })
      .then((data) =>
        setServices(data.filter((svc) => svc.master_id === masterId))
      )
      .catch(console.error)
      .finally(() => setServicesLoading(false));
  }, [masterId]);

  // 3) Определяем, какую услугу выбрали, и фильтруем слоты
  const selectedServiceObj = services.find((s) => s.id === formData.service);
  const timeSlotsToDisplay = formData.service
    ? availableTimeSlots.filter(
        (slot) => slot.service === selectedServiceObj?.service_name
      )
    : [];

  // 4) Обработчик изменения полей
  const handleChange = (e) => {
    const { name, value } = e.target;

    // при смене даты – загружаем слоты на эту дату
    if (name === "date") {
      // Форматируем дату для API
      const formattedDate = formatDateForApi(value);
      
      // Загружаем доступные слоты для новой даты
      setLoading(true);
      fetch(
        `https://api.kuchizu.online/masters/${masterId}/available?date=${formattedDate}`,
        { headers: { accept: "application/json" } }
      )
        .then((res) => {
          if (res.status === 400) {
            setAvailableTimeSlots([]);
            return { slots: [] };
          }
          if (!res.ok) throw new Error("Ошибка загрузки интервалов");
          return res.json();
        })
        .then((data) => setAvailableTimeSlots(data))
        .catch(console.error)
        .finally(() => setLoading(false));
      
      // Сбрасываем выбранный слот при смене даты
      setSelectedTimeSlot(null);
      setFormData((prev) => ({
        ...prev,
        date: value,
        startTime: "",
      }));
      return;
    }

    // при смене услуги — сбрасываем выбор слота и времени
    if (name === "service") {
      setSelectedTimeSlot(null);
      setTimeError("");
      setFormData((prev) => ({
        ...prev,
        service: value,
        startTime: "",
      }));
      return;
    }

    setFormData((prev) => ({ ...prev, [name]: value }));
    if (name === "startTime") setTimeError("");
  };

  // 5) Выбор тайм-слота
  const handleTimeSlotSelect = (slot) => {
    setSelectedTimeSlot(slot);
    setFormData((prev) => ({
      ...prev,
      startTime: slot.start_time,
    }));
    setTimeError("");
  };

  // 6) Отправка формы
  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.service) {
      setTimeError("Пожалуйста, выберите услугу");
      return;
    }
    if (!formData.startTime) {
      setTimeError("Пожалуйста, выберите время");
      return;
    }

    const appointmentDateTime = `${formData.date} ${formData.startTime}`; // "YYYY-MM-DD HH:mm"

    const blockData = {
      title: formData.clientName
        ? `Запись: ${formData.clientName}`
        : "Запись клиента",
      service_id: formData.service,
      appointment_datetime: appointmentDateTime,
      comment: formData.notes,
      client_name: formData.clientName,
    };

    onSubmit(blockData);
  };

  // Основной контейнер с учетом встроенного режима  
  const formContainerClass = `block-time-form-container ${embedded ? 'embedded' : ''}`;
  const formClass = `block-time-form ${embedded ? 'embedded' : ''}`;

  return (
    <div className={formContainerClass}>
      <div className={formClass}>
        {!embedded && (
          <div className="form-header">
            <h2>Стандартная запись</h2>
            <button
              type="button"
              className="close-button"
              onClick={onCancel}
              aria-label="Закрыть"
            >
              &times;
            </button>
          </div>
        )}

        <form onSubmit={handleSubmit}>
          {/* Имя клиента */}
          <div className="form-group">
            <label htmlFor="clientName">Имя клиента</label>
            <input
              id="clientName"
              name="clientName"
              type="text"
              value={formData.clientName}
              onChange={handleChange}
              required
              placeholder="Введите имя клиента"
            />
          </div>

          {/* Селект услуги */}
          <div className="form-group">
            <label htmlFor="service">Услуга</label>
            {servicesLoading ? (
              <p>Загрузка услуг...</p>
            ) : (
              <select
                id="service"
                name="service"
                value={formData.service}
                onChange={handleChange}
                required
              >
                <option value="">Выберите услугу</option>
                {services.map((svc) => (
                  <option key={svc.id} value={svc.id}>
                    {svc.service_name}
                  </option>
                ))}
              </select>
            )}
          </div>

          {/* Дата */}
          <div className="form-group">
            <label htmlFor="date">Дата</label>
            <input
              id="date"
              name="date"
              type="date"
              value={formData.date}
              onChange={handleChange}
              min={new Date().toISOString().split('T')[0]}
            />
          </div>

          {/* Выводим выбранную дату в более дружественном формате */}
          <div className="selected-date">
            Выбрана дата: {new Date(formData.date).toLocaleDateString('ru-RU', {
              day: 'numeric',
              month: 'long',
              year: 'numeric'
            })}
          </div>

          {/* Слоты времени */}
          <div className="form-group">
            <label>Выберите доступное время</label>

            {loading ? (
              <p>Загрузка интервалов...</p>
            ) : !formData.service ? (
              <p>Сначала выберите услугу</p>
            ) : timeSlotsToDisplay.length > 0 ? (
              <div className="available-time-slots">
                {timeSlotsToDisplay.map((slot, idx) => (
                  <div
                    key={idx}
                    className={
                      "time-slot" +
                      (selectedTimeSlot === slot ? " selected" : "")
                    }
                    onClick={() => handleTimeSlotSelect(slot)}
                  >
                    <span className="slot-time">
                      {slot.start_time} – {slot.end_time}
                    </span>
                    <span className="slot-service">{slot.service}</span>
                  </div>
                ))}
              </div>
            ) : (
              <p>Нет доступных интервалов для этой услуги</p>
            )}
          </div>

          {/* Ошибка */}
          {timeError && (
            <div className="error-message" style={{ color: "red" }}>
              {timeError}
            </div>
          )}

          {/* Примечания */}
          <div className="form-group">
            <label htmlFor="notes">Примечания</label>
            <textarea
              id="notes"
              name="notes"
              rows="3"
              value={formData.notes}
              onChange={handleChange}
              placeholder="Дополнительная информация"
            />
          </div>

          {/* Кнопки */}
          <div className="form-actions">
            {!embedded && (
              <button type="button" className="cancel-btn" onClick={onCancel}>
                Отмена
              </button>
            )}
            <button type="submit" className="submit-btn">
              {embedded ? "Забронировать" : "Сохранить"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default BlockTimeForm;
