/**
 * Компонент карточки бронирования для мобильной версии
 */
import React from 'react';
import './MobileBookingCard.css';
import { formatTimeShort } from '../../../utils/dateUtils';

/**
 * Компонент для отображения бронирования в мобильной версии
 * @param {Object} props - Свойства компонента
 * @param {Object} props.booking - Объект бронирования
 * @param {Function} props.onEdit - Обработчик редактирования
 * @param {Function} props.onDelete - Обработчик удаления
 */
const MobileBookingCard = ({ booking, onEdit, onDelete }) => {
  if (!booking) return null;

  // Функция для форматирования времени (если не хотим использовать утилиту)
  const formatTime = (timeString) => {
    if (!timeString) return 'Не указано';
    
    // Если формат "YYYY-MM-DD HH:MM", извлекаем только время
    if (typeof timeString === 'string' && timeString.includes(' ')) {
      return timeString.split(' ')[1];
    }
    
    // Если это объект Date или другой формат строки
    try {
      const dt = new Date(timeString);
      return formatTimeShort(dt);
    } catch (err) {
      return timeString;
    }
  };

  return (
    <div className="mobile-booking-card">
      <div className="mobile-booking-header">
        <span className="mobile-booking-title">
          {booking.service_name || 'Личное время'}
        </span>
        <span 
          className={`mobile-booking-service-type ${booking.is_custom ? 'custom' : ''}`}
        >
          {booking.is_custom ? 'Кастомная' : 'Стандартная'}
        </span>
      </div>

      <div className="mobile-booking-body">
        {!booking.is_blocked && !booking.is_personal && (
          <div className="mobile-booking-client">
            Клиент: <span className="mobile-booking-client-name">{booking.client_name || '—'}</span>
          </div>
        )}

        <div className="mobile-booking-time-info">
          <div className="mobile-booking-time-row">
            <span className="mobile-booking-time-label">Начало:</span>
            <span className="mobile-booking-time-value start">
              {formatTime(booking.start_time || booking.appointment_datetime)}
            </span>
          </div>
          
          {booking.is_custom && booking.end_time && (
            <div className="mobile-booking-time-row">
              <span className="mobile-booking-time-label">Окончание:</span>
              <span className="mobile-booking-time-value end">
                {formatTime(booking.end_time)}
              </span>
            </div>
          )}
        </div>

        {booking.comment && (
          <div className="mobile-booking-comment">
            {booking.comment}
          </div>
        )}
      </div>

      <div className="mobile-booking-actions">
        <button 
          className="mobile-booking-action-btn mobile-booking-edit-btn" 
          onClick={() => onEdit(booking.id)}
          aria-label="Изменить бронирование"
        >
          Изменить
        </button>
        <button 
          className="mobile-booking-action-btn mobile-booking-delete-btn" 
          onClick={() => onDelete(booking.id)}
          aria-label="Удалить бронирование"
        >
          Удалить
        </button>
      </div>
    </div>
  );
};

export default MobileBookingCard;
