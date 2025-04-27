import React, { useState, useEffect } from 'react';
import './BookingForm.css';
import { useToast } from '../Toast/ToastContext';
import { useParams } from 'react-router-dom';

const BookingForm = ({ selectedService, onCancel, onSubmit, masterId }) => {
  const [selectedDate, setSelectedDate] = useState('');
  const [selectedTime, setSelectedTime] = useState('');
  const [availableTimeSlots, setAvailableTimeSlots] = useState([]);
  const [loading, setLoading] = useState(false);
  const [loadingClientInfo, setLoadingClientInfo] = useState(false);
  const [contactInfo, setContactInfo] = useState({
    name: '',
    phone: '',
    comment: ''
  });
  const { showSuccess, showWarning, showError } = useToast();
  const { clientId } = useParams();
  
  // Загрузка контактной информации клиента из API
  useEffect(() => {
    if (!clientId) return;
    
    const fetchClientInfo = async () => {
      setLoadingClientInfo(true);
      try {
        const response = await fetch(`https://api.kuchizu.online/clients/${clientId}`, {
          headers: { 'accept': 'application/json' }
        });
        
        if (!response.ok) {
          throw new Error('Не удалось загрузить информацию о клиенте');
        }
        
        const clientData = await response.json();
        
        // Заполняем форму данными из API
        setContactInfo({
          name: `${clientData.first_name} ${clientData.last_name}`.trim(),
          phone: clientData.phone_number || '',
          comment: ''
        });
        
        console.log('Загружена информация о клиенте:', clientData);
      } catch (err) {
        console.error('Ошибка при загрузке информации о клиенте:', err);
        showError(`Ошибка при загрузке данных: ${err.message}`);
      } finally {
        setLoadingClientInfo(false);
      }
    };
    
    fetchClientInfo();
  }, [clientId, showError]);
  
  // Получение минимальной доступной даты (сегодня)
  const getTodayDate = () => {
    const today = new Date();
    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, '0');
    const day = String(today.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };
  
  // Загрузка доступных временных слотов для выбранной даты и мастера
  useEffect(() => {
    if (!selectedDate || !masterId || !selectedService) return;
    
    const fetchAvailableTimeSlots = async () => {
      setLoading(true);
      try {
        // Форматируем дату для API
        const formattedDate = selectedDate; // Формат уже YYYY-MM-DD
        
        // Запрос к API для получения доступных временных слотов
        const response = await fetch(`https://api.kuchizu.online/masters/${masterId}/available?date=${formattedDate}`);
        if (!response.ok) {
          throw new Error('Не удалось загрузить доступные временные слоты');
        }
        
        const data = await response.json();
        console.log(selectedService)
        // Фильтруем слоты для выбранной услуги
        const filteredSlots = data.filter(slot => 
          slot.service === selectedService.service_name
        );
        
        setAvailableTimeSlots(filteredSlots);
      } catch (err) {
        console.error('Ошибка при загрузке временных слотов:', err);
        showError(`Ошибка при загрузке временных слотов: ${err.message}`);
        setAvailableTimeSlots([]);
      } finally {
        setLoading(false);
      }
    };
    
    fetchAvailableTimeSlots();
  }, [selectedDate, masterId, selectedService, showError]);
  
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setContactInfo(prev => ({
      ...prev,
      [name]: value
    }));
  };
  
  const handleTimeSlotSelect = (slot) => {
    setSelectedTime(slot.start_time);
  };
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!selectedDate || !selectedTime) {
      showWarning('Пожалуйста, выберите дату и время');
      return;
    }
    
    if (!contactInfo.name || !contactInfo.phone) {
      showWarning('Пожалуйста, заполните обязательные поля');
      return;
    }
    
    try {
      // Формируем данные для бронирования
      const appointmentDateTime = `${selectedDate} ${selectedTime}`; // "YYYY-MM-DD HH:MM"
      
      const bookingData = {
        service_id: selectedService.id,
        master_id: masterId,
        appointment_datetime: appointmentDateTime,
        client_name: contactInfo.name,
        comment: contactInfo.comment || '',
        phone: contactInfo.phone
      };
      
      // Добавляем clientId, если он есть
      if (clientId) {
        bookingData.client_id = clientId;
      }
      
      // Отправка данных на сервер
      const response = await fetch('https://api.kuchizu.online/appointments', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'accept': 'application/json'
        },
        body: JSON.stringify(bookingData)
      });
      
      if (!response.ok) {
        throw new Error('Ошибка при бронировании');
      }
      
      const result = await response.json();
      showSuccess('Вы успешно записаны!');
      
      onSubmit(result);
    } catch (err) {
      console.error('Ошибка при бронировании:', err);
      showError(`Ошибка при бронировании: ${err.message}`);
    }
  };
  
  return (
    <div className="booking-form-container">
      <h2>Бронирование услуги</h2>
      <div className="selected-service-summary">
        <h3>{selectedService.name}</h3>
        {selectedService.category && <p>Категория: {selectedService.category}</p>}
        <p>Название: {selectedService.service_name}</p>
        <p>Продолжительность: {selectedService.duration} мин</p>
      </div>
      
      <form onSubmit={handleSubmit} className="booking-form">
        <div className="form-section date-time-section">
          <h3>Выберите дату и время</h3>
          
          <div className="form-group">
            <label htmlFor="date">Дата</label>
            <input
              type="date"
              id="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              min={getTodayDate()}
              required
            />
          </div>
          
          {selectedDate && (
            <div className="form-group">
              <label>Доступное время</label>
              {loading ? (
                <p>Загрузка доступных интервалов...</p>
              ) : availableTimeSlots.length > 0 ? (
                <div className="time-slots">
                  {availableTimeSlots.map((slot, index) => (
                    <button
                      type="button"
                      key={index}
                      className={`time-slot ${selectedTime === slot.start_time ? 'selected' : ''}`}
                      onClick={() => handleTimeSlotSelect(slot)}
                    >
                      {slot.start_time} – {slot.end_time}
                    </button>
                  ))}
                </div>
              ) : (
                <p>Нет доступных интервалов на выбранную дату</p>
              )}
            </div>
          )}
        </div>
        
        <div className="form-section contact-section">
          <h3>Контактная информация</h3>
          
          {loadingClientInfo ? (
            <p className="loading-message">Загрузка информации о клиенте...</p>
          ) : (
            <>
              <div className="form-group">
                <label htmlFor="name">Имя *</label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  value={contactInfo.name}
                  onChange={handleInputChange}
                  required
                  placeholder="Введите ваше имя"
                  className={clientId ? 'field-autofilled' : ''}
                  readOnly={!!clientId}
                />
              </div>
              
              <div className="form-group">
                <label htmlFor="phone">Телефон *</label>
                <input
                  type="tel"
                  id="phone"
                  name="phone"
                  value={contactInfo.phone}
                  onChange={handleInputChange}
                  required
                  placeholder="+7 (___) ___-__-__"
                  className={clientId ? 'field-autofilled' : ''}
                  readOnly={!!clientId}
                />
              </div>
              
              <div className="form-group">
                <label htmlFor="comment">Комментарий</label>
                <textarea
                  id="comment"
                  name="comment"
                  value={contactInfo.comment}
                  onChange={handleInputChange}
                  placeholder="Дополнительная информация"
                  rows="3"
                />
              </div>
            </>
          )}
        </div>
        
        <div className="form-actions">
          <button 
            type="button" 
            className="btn cancel-btn" 
            onClick={onCancel}
          >
            Отмена
          </button>
          <button 
            type="submit" 
            className="btn submit-btn"
            disabled={loadingClientInfo || loading}
          >
            Подтвердить бронирование
          </button>
        </div>
      </form>
    </div>
  );
};

export default BookingForm;