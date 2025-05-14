/**
 * Модальное окно выбора типа бронирования
 */
import React, { useState } from 'react';
import './BookingOptionsModal.css';
import BlockTimeForm from './BlockTimeForm';
import CustomBookingForm from './CustomBookingForm';

/**
 * Модальное окно для выбора типа бронирования
 * @param {Object} props - Свойства компонента 
 * @param {Function} props.onSubmitStandard - Обработчик отправки формы стандартного бронирования
 * @param {Function} props.onSubmitCustom - Обработчик отправки формы кастомного бронирования
 * @param {Function} props.onClose - Функция закрытия модального окна
 * @param {Date} props.selectedDate - Выбранная дата
 * @param {string} props.masterId - ID мастера
 */
const BookingOptionsModal = ({ 
  onSubmitStandard, 
  onSubmitCustom, 
  onClose, 
  selectedDate, 
  masterId 
}) => {
  const [bookingType, setBookingType] = useState("standard"); // standard или custom
  const [isAnimating, setIsAnimating] = useState(false);

  // Обработчик изменения типа бронирования
  const handleBookingTypeChange = (type) => {
    if (type !== bookingType) {
      setIsAnimating(true);
      setTimeout(() => {
        setBookingType(type);
        setIsAnimating(false);
      }, 250); // 250ms - длительность анимации затухания
    }
  };

  // Обработчики отправки форм
  const handleStandardSubmit = (data) => {
    onSubmitStandard(data);
    onClose();
  };

  const handleCustomSubmit = (data) => {
    onSubmitCustom(data);
    onClose();
  };

  return (
    <div className="booking-options-modal-overlay" onClick={onClose}>
      <div 
        className={`booking-options-modal ${isAnimating ? 'switching' : ''}`}
        onClick={(e) => e.stopPropagation()} // Предотвращаем закрытие при клике на модальное окно
      >  
        <div className="booking-type-selector">
          <div className="booking-header">
            <h2>Забронировать время</h2>
            <button className="close-button" onClick={onClose}>×</button>
          </div>
          <div className="booking-tabs">
            <button 
              className={`booking-tab ${bookingType === 'standard' ? 'active' : ''}`} 
              onClick={() => handleBookingTypeChange('standard')}
            >
              Стандартная запись
            </button>
            <button 
              className={`booking-tab ${bookingType === 'custom' ? 'active' : ''}`} 
              onClick={() => handleBookingTypeChange('custom')}
            >
              Кастомная запись
            </button>
          </div>
        </div>

        <div className="booking-form-container">
          {bookingType === 'standard' ? (
            <BlockTimeForm
              onSubmit={handleStandardSubmit}
              onCancel={onClose}
              selectedDate={selectedDate}
              masterId={masterId}
              embedded={true} // Флаг, что форма встроена в другую
            />
          ) : (
            <CustomBookingForm
              onSubmit={handleCustomSubmit}
              onCancel={onClose}
              selectedDate={selectedDate}
              masterId={masterId}
              embedded={true} // Флаг, что форма встроена в другую
            />
          )}
        </div>
      </div>
    </div>
  );
};

export default BookingOptionsModal;
