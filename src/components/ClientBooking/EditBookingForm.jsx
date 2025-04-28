import React, { useState } from 'react';
import './BookingForm.css';
import './EditBookingForm.css';
import { useToast } from '../Toast/ToastContext';

const EditBookingForm = ({ booking = {}, service, master, availableTimeSlots, loadingTimeSlots, onSave, onCancel, onDateChange }) => {
  // Извлекаем дату из booking.appointment_datetime (формат: "YYYY-MM-DD HH:MM")
  let originalDateStr = '';
  let timeStr = '';
  
  if (booking && booking.appointment_datetime) {
    const parts = booking.appointment_datetime.split(' ');
    originalDateStr = parts[0] || '';
    timeStr = parts[1] || '';
  }

  const [selectedTime, setSelectedTime] = useState('');
  const [selectedDate, setSelectedDate] = useState(originalDateStr);
  const [comment, setComment] = useState((booking && booking.comment) || '');
  const { showWarning } = useToast();
  
  // Форматирование даты для отображения
  const formatDateForDisplay = (dateStr) => {
    if (!dateStr) return 'Дата не указана';
    
    const date = new Date(dateStr);
    return date.toLocaleDateString('ru-RU', {
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    });
  };

  const handleTimeSlotSelect = (slot) => {
    setSelectedTime(slot.start_time);
  };
  
  const handleDateChange = (e) => {
    const newDate = e.target.value;
    setSelectedDate(newDate);
    // Если дата изменилась, нам нужно запросить новые доступные слоты
    if (onDateChange && newDate !== originalDateStr) {
      onDateChange(newDate);
      // Сбрасываем выбранное время, так как на новую дату будут другие слоты
      setSelectedTime('');
    }
  };
  
  const handleSubmit = (e) => {
    e.preventDefault();
    
    const dateChanged = selectedDate !== originalDateStr;
    const timeChanged = selectedTime !== '';
    const commentChanged = comment !== (booking && booking.comment);
    
    if (!dateChanged && !timeChanged && !commentChanged) {
      showWarning('Вы не внесли никаких изменений');
      return;
    }
    
    // Формируем измененные данные бронирования
    const updatedBooking = {
      ...booking,
      appointment_datetime: `${selectedDate} ${selectedTime || timeStr}`,
      comment: comment
    };
    
    onSave(updatedBooking);
  };
  
  return (
    <div className="edit-booking-container">
      <h2>Редактирование бронирования</h2>
      
      <div className="selected-service-summary">
        <h3>{service ? service.service_name : 'Услуга не найдена'}</h3>
        <p>Дата: {formatDateForDisplay(originalDateStr)}</p>
        {service && <p>Продолжительность: {service.duration} мин</p>}
        {master && <p>Мастер: {master.first_name} {master.last_name}</p>}
      </div>
      
      <form onSubmit={handleSubmit} className="booking-form">
        <div className="form-section">
          <h3>Изменить дату записи</h3>
          
          <div className="form-group">
            <label htmlFor="appointment-date">Дата</label>
            <input
              type="date"
              id="appointment-date"
              name="appointment-date"
              value={selectedDate}
              onChange={handleDateChange}
              min={new Date().toISOString().split('T')[0]}
            />
          </div>
        </div>
        
        <div className="form-section">
          <h3>Изменить время записи</h3>
          
          <p className="current-time">Текущее время: <strong>{timeStr}</strong></p>
          
          <div>
            {loadingTimeSlots ? (
              <p className="loading-message">Загрузка доступных интервалов...</p>
            ) : availableTimeSlots.length > 0 ? (
              <div className="time-slots-container">
                <label>Выберите новое время:</label>
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
              </div>
            ) : (
              <p className="no-slots-message">Нет других доступных интервалов на эту дату</p>
            )}
          </div>
        </div>
        
        <div className="form-section">
          <h3>Изменить комментарий</h3>
          
          <div className="form-group">
            <label htmlFor="comment">Комментарий</label>
            <textarea
              id="comment"
              name="comment"
              value={comment}
              onChange={(e) => setComment(e.target.value)}
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
            disabled={!selectedDate && !selectedTime && comment === booking.comment}
          >
            Сохранить изменения
          </button>
        </div>
      </form>
    </div>
  );
};

export default EditBookingForm;