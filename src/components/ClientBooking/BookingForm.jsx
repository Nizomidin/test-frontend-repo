import React, { useState, useEffect } from 'react';
import './BookingForm.css';
import { useToast } from '../Toast/ToastContext'; // Импортируем хук для тостов

const BookingForm = ({ selectedService, onCancel, onSubmit }) => {
  const [selectedDate, setSelectedDate] = useState('');
  const [selectedTime, setSelectedTime] = useState('');
  const [availableTimes, setAvailableTimes] = useState([]);
  const [contactInfo, setContactInfo] = useState({
    name: '',
    phone: '',
    email: '',
    comment: ''
  });
  const toast = useToast(); // Используем хук для доступа к тостам
  
  // Получение минимальной доступной даты (сегодня)
  const getTodayDate = () => {
    const today = new Date();
    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, '0');
    const day = String(today.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };
  
  // Генерация фиктивного списка доступных временных слотов
  useEffect(() => {
    if (!selectedDate) return;
    
    // В реальном приложении здесь будет запрос к API для получения 
    // свободных временных слотов на выбранную дату
    const generateTimeSlots = () => {
      const slots = [];
      let hour = 9;
      
      while (hour < 20) {
        slots.push(`${String(hour).padStart(2, '0')}:00`);
        slots.push(`${String(hour).padStart(2, '0')}:30`);
        hour++;
      }
      
      // Имитация некоторых занятых слотов
      const random = Math.floor(Math.random() * slots.length);
      const availableSlots = slots.filter((_, index) => index !== random && index !== random + 1);
      
      return availableSlots;
    };
    
    setAvailableTimes(generateTimeSlots());
    setSelectedTime(''); // Сбрасываем выбранное время при изменении даты
  }, [selectedDate]);
  
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setContactInfo(prev => ({
      ...prev,
      [name]: value
    }));
  };
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!selectedDate || !selectedTime) {
      toast.showWarning('Пожалуйста, выберите дату и время'); // Тост вместо алерта
      return;
    }
    
    if (!contactInfo.name || !contactInfo.phone) {
      toast.showWarning('Пожалуйста, заполните обязательные поля'); // Тост вместо алерта
      return;
    }
    
    // Формируем данные для бронирования
    const bookingData = {
      service: selectedService,
      date: selectedDate,
      time: selectedTime,
      contactInfo,
      status: 'pending' // Статус по умолчанию
    };
    
    try {
      onSubmit(bookingData);
      toast.showSuccess('Вы успешно записаны!'); // Показываем уведомление об успехе
    } catch (err) {
      toast.showError(`Ошибка: ${err.message}`); // Показываем уведомление об ошибке
    }
  };
  
  return (
    <div className="booking-form-container">
      <h2>Бронирование услуги</h2>
      <div className="selected-service-summary">
        <h3>{selectedService.name}</h3>
        <p>Категория: {selectedService.category}</p>
        <p>Цена: {selectedService.price} ₽</p>
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
              <label htmlFor="time">Доступное время</label>
              <div className="time-slots">
                {availableTimes.map((time) => (
                  <button
                    type="button"
                    key={time}
                    className={`time-slot ${selectedTime === time ? 'selected' : ''}`}
                    onClick={() => setSelectedTime(time)}
                  >
                    {time}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
        
        <div className="form-section contact-section">
          <h3>Контактная информация</h3>
          
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
            />
          </div>
          
          <div className="form-group">
            <label htmlFor="email">Email</label>
            <input
              type="email"
              id="email"
              name="email"
              value={contactInfo.email}
              onChange={handleInputChange}
              placeholder="Ваш email (необязательно)"
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
          >
            Подтвердить бронирование
          </button>
        </div>
      </form>
    </div>
  );
};

export default BookingForm;