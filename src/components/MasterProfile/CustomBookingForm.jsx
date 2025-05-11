import React, { useState, useEffect } from "react";
import "./CustomBookingForm.css";

function CustomBookingForm({ onSubmit, onCancel, selectedDate, masterId, embedded = false }) {
  const [formData, setFormData] = useState({
    client_name: "",
    phone_number: "",
    service_id: "",
    service_name: "",
    date: formatDateForInput(selectedDate),
    start_time: "",
    end_time: "",
    comment: "",
  });
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

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
  // Загрузка списка услуг мастера
  useEffect(() => {
    if (!masterId) return;
    setLoading(true);
    fetch(`https://api.kuchizu.online/services?master_id=${masterId}`, {
      headers: { accept: "application/json" },
    })
      .then((res) => {
        if (!res.ok) throw new Error("Ошибка загрузки услуг");
        return res.json();
      })
      .then((data) => {
        // Фильтруем услуги только для текущего мастера
        const masterServices = data.filter(service => service.master_id === masterId);
        setServices(masterServices);
        
        // Если есть услуги, автоматически выбираем первую
        if (masterServices.length > 0) {
          setFormData(prev => ({
            ...prev,
            service_id: masterServices[0].id,
            service_name: masterServices[0].service_name
          }));
        }
      })
      .catch(err => {
        console.error("Ошибка при загрузке услуг:", err);
        setError("Не удалось загрузить услуги");
      })
      .finally(() => setLoading(false));
  }, [masterId]);
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
        
        // Можно также автоматически установить продолжительность услуги
        if (selectedService.duration) {
          // Рассчитываем время окончания на основе времени начала и продолжительности услуги
          if (formData.start_time) {
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
      }
    } else if (name === "start_time" && formData.service_id) {
      // При изменении времени начала автоматически обновляем время окончания
      const selectedService = services.find(service => service.id === formData.service_id);
      if (selectedService && selectedService.duration && value) {
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
        
        setFormData({
          ...formData,
          start_time: value,
          end_time: endTime
        });
      } else {
        setFormData({
          ...formData,
          start_time: value
        });
      }
    } else {
      setFormData({
        ...formData,
        [name]: value
      });
    }
  };  // Обработчик форматирования номера телефона
  const handlePhoneChange = (e) => {
    let value = e.target.value;
    
    // Удаляем все нецифровые символы
    value = value.replace(/\D/g, '');
    
    // Ограничиваем длину номера телефона (9 цифр без учета префикса +992)
    if (value.length > 9) {
      value = value.slice(0, 9);
    }
    
    // Можно добавить форматирование, например, XXX-XX-XX
    // Для этого раскомментируйте следующие строки:
    // if (value.length >= 3 && value.length <= 5) {
    //   value = value.slice(0, 3) + '-' + value.slice(3);
    // } else if (value.length > 5) {
    //   value = value.slice(0, 3) + '-' + value.slice(3, 5) + '-' + value.slice(5);
    // }
    
    // Обновляем значение в форме
    setFormData({
      ...formData,
      phone_number: value
    });
  };

  // Валидация номера телефона
  const validatePhone = () => {
    if (!formData.phone_number) {
      setError("Пожалуйста, укажите номер телефона");
      return false;
    }

    if (formData.phone_number.length < 9) {
      setError("Номер телефона должен содержать 9 цифр");
      return false;
    }
    
    return true;
  };  // Валидация времени
  const validateTimes = () => {
    if (!formData.start_time || !formData.end_time) {
      setError("Пожалуйста, укажите время начала и окончания");
      return false;
    }

    const [startHour, startMinute] = formData.start_time.split(':').map(Number);
    const [endHour, endMinute] = formData.end_time.split(':').map(Number);
    
    const startTotalMinutes = startHour * 60 + startMinute;
    const endTotalMinutes = endHour * 60 + endMinute;
    
    if (endTotalMinutes <= startTotalMinutes) {
      setError("Время окончания должно быть позже времени начала");
      return false;
    }
    
    setError("");
    return true;
  };// Обработчик отправки формы
  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (!validateTimes() || !validatePhone()) {
      return;
    }    
    // Форматируем данные для API
    const dateStr = formatDateForApi(formData.date);
    
    // Форматирование времени для соответствия требуемому формату "YYYY-MM-DD HH:MM"
    const formatTimeForApi = (timeString) => {
      // Удаляем секунды, если они есть, оставляя только часы и минуты
      return timeString.split(':').slice(0, 2).join(':');
    };
    
    // Отправляем данные в формате, который ожидает API
    const customAppointmentData = {
      master_id: masterId,
      client_name: formData.client_name || "Без имени",
      phone_number: formData.phone_number ? `+992${formData.phone_number}` : "",
      service_name: formData.service_name,
      start_time: `${dateStr} ${formatTimeForApi(formData.start_time)}`,
      end_time: `${dateStr} ${formatTimeForApi(formData.end_time)}`
    };
    
    // Если есть комментарий, добавляем его в данные
    if (formData.comment) {
      customAppointmentData.comment = formData.comment;
    }
    
    onSubmit(customAppointmentData);
  };  return (
    <div className={`custom-booking-form ${embedded ? 'embedded' : ''}`}>
      {!embedded && (
        <div className="form-header">
          <h2>Кастомная запись</h2>
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
      
      {error && <div className="error-message">{error}</div>}
      
      {loading ? (
        <div className="loading-spinner">Загрузка...</div>
      ) : (
        <form onSubmit={handleSubmit}>
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
              {services.map((service) => (
                <option key={service.id} value={service.id}>
                  {service.service_name} ({service.duration} мин, {service.price} руб.)
                </option>
              ))}
            </select>
          </div>

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
        </div>          <div className="form-group">
            <label htmlFor="phone_number">Номер телефона</label>
            <div className="phone-input-container">
              <div className="phone-prefix">+992</div>
              <input
                type="tel"
                id="phone_number"
                name="phone_number"
                value={formData.phone_number}
                onChange={handlePhoneChange}
                placeholder="XXXXXXXXX"
                maxLength="9"
                required
                aria-describedby="phone-hint"
              />
            </div>
            <small id="phone-hint" className="form-hint">Введите 9 цифр номера без кода страны</small>
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

        <div className="time-inputs">
          <div className="form-group">
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

          <div className="form-group">
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
            placeholder="Дополнительная информация"
            rows="3"
          />
        </div>

        <div className="form-actions">
          {!embedded && (
            <button type="button" className="cancel-button" onClick={onCancel}>
              Отмена
            </button>
          )}
          <button type="submit" className="submit-button" disabled={loading}>
            {embedded ? "Забронировать" : "Создать запись"}
          </button>
        </div>
      </form>
      )}
    </div>
  );
}

export default CustomBookingForm;