/**
 * Форма для создания кастомного бронирования
 */
import React, { useState, useEffect } from 'react';
import './CustomBookingForm.css';
import { formatDateToYYYYMMDD } from '../../../utils/dateUtils';

/**
 * Компонент формы для создания кастомного бронирования
 * @param {Object} props - Свойства компонента
 * @param {Function} props.onSubmit - Обработчик отправки формы
 * @param {Function} props.onCancel - Обработчик отмены
 * @param {Date} props.selectedDate - Выбранная дата
 * @param {string} props.masterId - ID мастера
 * @param {boolean} props.embedded - Флаг встроенного режима (внутри другой формы)
 * @param {Array} props.services - Список услуг мастера
 * @param {boolean} props.servicesLoading - Флаг загрузки услуг
 */
const CustomBookingForm = ({ 
  onSubmit, 
  onCancel, 
  selectedDate, 
  masterId, 
  embedded = false,
  services = [],
  servicesLoading = false
}) => {
  const [formData, setFormData] = useState({
    client_name: "",
    phone_number: "",
    service_id: "",
    service_name: "",
    date: formatDateToYYYYMMDD(selectedDate),
    start_time: "",
    end_time: "",
    comment: "",
  });
  const [error, setError] = useState("");

  // При загрузке компонента с существующими услугами, выбираем первую
  useEffect(() => {
    if (services.length > 0 && !formData.service_id) {
      setFormData(prev => ({
        ...prev,
        service_id: services[0].id,
        service_name: services[0].service_name
      }));
    }
  }, [services, formData.service_id]);

  // Обработчик изменения полей формы
  const handleChange = (e) => {
    const { name, value } = e.target;
    
    if (name === "service_id") {
      // При выборе услуги обновляем также её название
      const selectedService = services.find(service => service.id === value);
      if (selectedService) {
        setFormData({
          ...formData,
          service_id: value,
          service_name: selectedService.service_name
        });
        
        // Автоматически установить продолжительность услуги
        if (selectedService.duration && formData.start_time) {
          // Рассчитываем время окончания на основе времени начала и продолжительности услуги
          const [startHour, startMinute] = formData.start_time.split(':').map(Number);
          let endHour = startHour;
          let endMinute = startMinute + parseInt(selectedService.duration, 10);
          
          // Перенос минут в часы
          if (endMinute >= 60) {
            endHour += Math.floor(endMinute / 60);
            endMinute %= 60;
          }
          
          // Форматирование времени окончания
          const endTime = `${String(endHour).padStart(2, '0')}:${String(endMinute).padStart(2, '0')}`;
          
          setFormData(prev => ({
            ...prev,
            end_time: endTime
          }));
        }
      }
      return;
    }
    
    if (name === "start_time" && formData.service_id) {
      // При изменении времени начала пересчитываем время окончания
      const selectedService = services.find(service => service.id === formData.service_id);
      if (selectedService && selectedService.duration) {
        const [startHour, startMinute] = value.split(':').map(Number);
        let endHour = startHour;
        let endMinute = startMinute + parseInt(selectedService.duration, 10);
        
        // Перенос минут в часы
        if (endMinute >= 60) {
          endHour += Math.floor(endMinute / 60);
          endMinute %= 60;
        }
        
        // Форматирование времени окончания
        const endTime = `${String(endHour).padStart(2, '0')}:${String(endMinute).padStart(2, '0')}`;
        
        setFormData(prev => ({
          ...prev,
          start_time: value,
          end_time: endTime
        }));
        return;
      }
    }
    
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  // Валидация формы перед отправкой
  const validateForm = () => {
    if (!formData.client_name.trim()) {
      setError("Пожалуйста, введите имя клиента");
      return false;
    }
    
    if (!formData.service_id) {
      setError("Пожалуйста, выберите услугу");
      return false;
    }
    
    if (!formData.date) {
      setError("Пожалуйста, выберите дату");
      return false;
    }
    
    if (!formData.start_time) {
      setError("Пожалуйста, выберите время начала");
      return false;
    }
    
    if (!formData.end_time) {
      setError("Пожалуйста, выберите время окончания");
      return false;
    }
    
    // Проверяем, что время окончания позже времени начала
    const [startHour, startMinute] = formData.start_time.split(':').map(Number);
    const [endHour, endMinute] = formData.end_time.split(':').map(Number);
    
    const startMinutes = startHour * 60 + startMinute;
    const endMinutes = endHour * 60 + endMinute;
    
    if (endMinutes <= startMinutes) {
      setError("Время окончания должно быть позже времени начала");
      return false;
    }
    
    setError("");
    return true;
  };

  // Обработчик отправки формы
  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }
    
    // Форматируем данные для API
    const bookingData = {
      ...formData,
      master_id: masterId,
      is_custom: true,
      // Добавляем полное время (дата + время)
      start_datetime: `${formData.date} ${formData.start_time}`,
      end_datetime: `${formData.date} ${formData.end_time}`
    };
    
    onSubmit(bookingData);
  };

  return (
    <div className={`custom-booking-form ${embedded ? 'embedded' : ''}`}>
      {!embedded && (
        <div className="form-header">
          <h2>Кастомная запись</h2>
          <button className="close-btn" onClick={onCancel}>×</button>
        </div>
      )}
      
      <form onSubmit={handleSubmit}>
        {error && <div className="form-error">{error}</div>}
        
        <div className="form-group">
          <label htmlFor="client_name">Имя клиента</label>
          <input
            type="text"
            id="client_name"
            name="client_name"
            value={formData.client_name}
            onChange={handleChange}
            placeholder="Введите имя клиента"
            required
          />
        </div>
        
        <div className="form-group">
          <label htmlFor="phone_number">Телефон (необязательно)</label>
          <input
            type="tel"
            id="phone_number"
            name="phone_number"
            value={formData.phone_number}
            onChange={handleChange}
            placeholder="+7 (___) ___-__-__"
          />
        </div>
        
        <div className="form-group">
          <label htmlFor="service_id">Услуга</label>
          <select
            id="service_id"
            name="service_id"
            value={formData.service_id}
            onChange={handleChange}
            required
          >
            <option value="">Выберите услугу</option>
            {servicesLoading ? (
              <option disabled>Загрузка...</option>
            ) : (
              services.map(service => (
                <option key={service.id} value={service.id}>
                  {service.service_name} ({service.duration} мин)
                </option>
              ))
            )}
          </select>
        </div>
        
        <div className="form-row">
          <div className="form-group date-group">
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
          
          <div className="form-group time-group">
            <label htmlFor="start_time">Время начала</label>
            <input
              type="time"
              id="start_time"
              name="start_time"
              value={formData.start_time}
              onChange={handleChange}
              required
            />
          </div>
          
          <div className="form-group time-group">
            <label htmlFor="end_time">Время окончания</label>
            <input
              type="time"
              id="end_time"
              name="end_time"
              value={formData.end_time}
              onChange={handleChange}
              required
            />
          </div>
        </div>
        
        <div className="form-group">
          <label htmlFor="comment">Комментарий</label>
          <textarea
            id="comment"
            name="comment"
            value={formData.comment}
            onChange={handleChange}
            placeholder="Дополнительная информация о бронировании"
            rows="3"
          />
        </div>
        
        <div className="form-actions">
          <button type="button" className="cancel-button" onClick={onCancel}>
            Отмена
          </button>
          <button type="submit" className="submit-button">
            Создать запись
          </button>
        </div>
      </form>
    </div>
  );
};

export default CustomBookingForm;
