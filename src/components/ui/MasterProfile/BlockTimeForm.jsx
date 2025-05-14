/**
 * Форма бронирования стандартного времени
 */
import React, { useState, useEffect } from 'react';
import './BlockTimeForm.css';
import { formatDateToYYYYMMDD } from '../../../utils/dateUtils';

/**
 * Компонент формы для блокировки времени (стандартная запись)
 * 
 * @param {Object} props - Свойства компонента
 * @param {Function} props.onSubmit - Обработчик отправки формы
 * @param {Function} props.onCancel - Обработчик отмены
 * @param {Date} props.selectedDate - Выбранная дата
 * @param {string} props.masterId - ID мастера
 * @param {boolean} props.embedded - Флаг встроенного режима (внутри другой формы)
 * @param {Array} props.services - Список услуг мастера
 * @param {boolean} props.servicesLoading - Флаг загрузки услуг
 * @param {Function} props.getAvailableSlots - Функция для получения доступных слотов
 */
const BlockTimeForm = ({ 
  onSubmit, 
  onCancel, 
  selectedDate, 
  masterId, 
  embedded = false,
  services = [],
  servicesLoading = false,
  getAvailableSlots 
}) => {
  const [formData, setFormData] = useState({
    clientName: "",
    service: "", // будет хранить id выбранной услуги
    date: formatDateToYYYYMMDD(selectedDate),
    startTime: "",
    notes: "",
  });
  const [timeError, setTimeError] = useState("");
  const [availableTimeSlots, setAvailableTimeSlots] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedTimeSlot, setSelectedTimeSlot] = useState(null);

  // Загрузка доступных слотов при выборе даты или услуги
  const loadAvailableSlots = async () => {
    if (!masterId || !formData.date) return;
    
    setLoading(true);
    try {
      const slots = await getAvailableSlots(formData.date);
      setAvailableTimeSlots(slots || []);
    } catch (error) {
      console.error('Ошибка загрузки слотов:', error);
      setAvailableTimeSlots([]);
    } finally {
      setLoading(false);
    }
  };

  // Загрузка слотов при изменении даты
  useEffect(() => {
    loadAvailableSlots();
  }, [formData.date, masterId]);

  // Определяем, какую услугу выбрали, и фильтруем слоты
  const selectedServiceObj = services.find((s) => s.id === formData.service);
  const timeSlotsToDisplay = formData.service
    ? availableTimeSlots.filter(
        (slot) => slot.service === selectedServiceObj?.service_name
      )
    : [];

  // Обработчик изменения полей
  const handleChange = (e) => {
    const { name, value } = e.target;

    // при смене даты – загружаем слоты на эту дату
    if (name === "date") {
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

  // Выбор тайм-слота
  const handleTimeSlotSelect = (slot) => {
    setSelectedTimeSlot(slot);
    setFormData((prev) => ({
      ...prev,
      startTime: slot.time,
    }));
    setTimeError("");
  };

  // Отправка формы
  const handleSubmit = (e) => {
    e.preventDefault();
    
    // Валидация формы
    if (!formData.service) {
      alert("Пожалуйста, выберите услугу");
      return;
    }

    if (!formData.clientName.trim()) {
      alert("Пожалуйста, введите имя клиента");
      return;
    }

    if (!formData.startTime) {
      setTimeError("Пожалуйста, выберите время");
      return;
    }

    // Создаем объект данных для отправки
    const submitData = {
      client_name: formData.clientName,
      service_id: formData.service,
      date: formData.date,
      time: formData.startTime,
      comment: formData.notes,
      master_id: masterId,
      // Добавляем информацию о выбранной услуге
      service_name: selectedServiceObj?.service_name,
      duration: selectedServiceObj?.duration
    };

    onSubmit(submitData);
  };

  return (
    <div className={`block-time-form ${embedded ? 'embedded' : ''}`}>
      {!embedded && (
        <div className="form-header">
          <h2>Стандартная запись</h2>
          <button className="close-btn" onClick={onCancel} type="button">
            ×
          </button>
        </div>
      )}

      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label htmlFor="clientName">Имя клиента</label>
          <input
            type="text"
            id="clientName"
            name="clientName"
            value={formData.clientName}
            onChange={handleChange}
            placeholder="Введите имя клиента"
            required
          />
        </div>

        <div className="form-group">
          <label htmlFor="service">Услуга</label>
          <select
            id="service"
            name="service"
            value={formData.service}
            onChange={handleChange}
            required
          >
            <option value="">Выберите услугу</option>
            {servicesLoading ? (
              <option disabled>Загрузка...</option>
            ) : (
              services.map((service) => (
                <option key={service.id} value={service.id}>
                  {service.service_name} ({service.duration} мин)
                </option>
              ))
            )}
          </select>
        </div>

        <div className="form-group">
          <label htmlFor="date">Дата</label>
          <input
            type="date"
            id="date"
            name="date"
            value={formData.date}
            onChange={handleChange}
            required
          />
        </div>

        <div className="form-group">
          <label>Время</label>
          {loading ? (
            <div className="loading-indicator">Загрузка доступных слотов...</div>
          ) : formData.service && timeSlotsToDisplay.length > 0 ? (
            <div className="time-slots-container">
              {timeSlotsToDisplay.map((slot, index) => (
                <div
                  key={index}
                  className={`time-slot ${
                    selectedTimeSlot && selectedTimeSlot.time === slot.time
                      ? "selected"
                      : ""
                  }`}
                  onClick={() => handleTimeSlotSelect(slot)}
                >
                  {slot.time.split(' ')[1]}
                </div>
              ))}
            </div>
          ) : formData.service ? (
            <div className="no-slots-message">
              Нет доступных слотов на выбранную дату и услугу
            </div>
          ) : (
            <div className="no-slots-message">
              Выберите услугу, чтобы увидеть доступное время
            </div>
          )}
          {timeError && <div className="error-message">{timeError}</div>}
        </div>

        <div className="form-group">
          <label htmlFor="notes">Комментарий</label>
          <textarea
            id="notes"
            name="notes"
            value={formData.notes}
            onChange={handleChange}
            placeholder="Дополнительная информация (необязательно)"
            rows="3"
          />
        </div>

        <div className="form-actions">
          <button
            type="button"
            className="cancel-button"
            onClick={onCancel}
          >
            Отмена
          </button>
          <button
            type="submit"
            className="submit-button"
            disabled={!formData.service || !formData.clientName || !formData.startTime}
          >
            Создать запись
          </button>
        </div>
      </form>
    </div>
  );
};

export default BlockTimeForm;
