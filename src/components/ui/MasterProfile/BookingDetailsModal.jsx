/**
 * Модальное окно для отображения и редактирования деталей бронирования
 */
import React, { useState, useEffect } from 'react';
import './BookingDetailsModal.css';
import { formatDateFull, formatTimeShort, parseDateTime } from '../../../utils/dateUtils';

/**
 * Модальное окно деталей бронирования
 * @param {Object} props - Свойства компонента
 * @param {Object} props.booking - Объект бронирования для отображения
 * @param {string} props.masterId - ID мастера
 * @param {Function} props.onClose - Функция для закрытия модального окна
 * @param {Function} props.onDelete - Функция для удаления бронирования
 * @param {Function} props.onUpdate - Функция для обновления бронирования
 * @param {Array} props.services - Список услуг мастера
 * @param {Array} props.availableTimeSlots - Список доступных временных слотов
 */
const BookingDetailsModal = ({ 
  booking, 
  masterId, 
  onClose, 
  onDelete, 
  onUpdate,
  services = [],
  availableTimeSlots = [],
  loadingSlots = false,
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editData, setEditData] = useState({
    clientName: '',
    service_id: '',
    service_name: '',
    date: '',
    startTime: '',
    notes: ''
  });
  const [timeError, setTimeError] = useState('');
  const [selectedSlot, setSelectedSlot] = useState(null);
  // Состояния для отображения времени
  const [startDisplay, setStartDisplay] = useState('—');
  const [endDisplay, setEndDisplay] = useState(null);

  // Инициализируем поля при выборе брони
  useEffect(() => {
    if (!booking) return;

    const date = parseDateTime(booking.is_custom ? booking.start_time : booking.appointment_datetime);
    const formattedDate = date ? `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}` : '';
    const formattedTime = date ? `${String(date.getHours()).padStart(2, '0')}:${String(date.getMinutes()).padStart(2, '0')}` : '';

    setEditData({
      clientName: booking.client_name || '',
      service_id: booking.service_id || '',
      service_name: booking.service_name || '',
      date: formattedDate,
      startTime: formattedTime,
      notes: booking.comment || ''
    });
    
    setSelectedSlot(null);
    setTimeError('');
  }, [booking]);

  // Форматирование времени для отображения
  useEffect(() => {
    if (!booking) return;
    
    if (booking.is_custom) {
      // Для кастомных бронирований
      const startDate = parseDateTime(booking.start_time);
      const endDate = parseDateTime(booking.end_time);
      
      setStartDisplay(startDate ? formatTimeShort(startDate) : 'Не указано');
      setEndDisplay(endDate ? formatTimeShort(endDate) : null);
    } else {
      // Для стандартных бронирований
      const date = parseDateTime(booking.appointment_datetime);
      setStartDisplay(date ? formatTimeShort(date) : 'Не указано');
      setEndDisplay(null); // Для стандартных бронирований нет времени окончания
    }
  }, [booking]);

  // Обработка изменений полей
  const handleChange = e => {
    const { name, value } = e.target;
    if (name === 'service_id') {
      const selectedService = services.find(s => s.id === value);
      setEditData(prev => ({
        ...prev,
        service_id: value,
        service_name: selectedService ? selectedService.service_name : '',
        startTime: ''
      }));
      setSelectedSlot(null);
      setTimeError('');
      return;
    }
    setEditData(prev => ({ ...prev, [name]: value }));
    if (name === 'startTime') setTimeError('');
  };

  // Обработка выбора временного слота
  const handleSlotSelect = slot => {
    setSelectedSlot(slot);
    
    // Извлекаем только время из слота
    const timeStr = slot.time.split(' ')[1];
    setEditData(prev => ({ ...prev, startTime: timeStr }));
    setTimeError('');
  };

  // Обработка отправки формы
  const handleSubmit = e => {
    e.preventDefault();
    
    // Простая валидация
    if (!editData.clientName.trim()) {
      alert('Пожалуйста, укажите имя клиента');
      return;
    }
    
    if (!editData.service_id) {
      alert('Пожалуйста, выберите услугу');
      return;
    }
    
    if (!editData.date) {
      alert('Пожалуйста, выберите дату');
      return;
    }
    
    if (!editData.startTime) {
      alert('Пожалуйста, выберите время');
      return;
    }
    
    // Подготовка и отправка данных
    const updatedBooking = {
      id: booking.id,
      client_name: editData.clientName,
      service_id: editData.service_id,
      date: editData.date,
      time: editData.startTime,
      comment: editData.notes,
      is_custom: booking.is_custom
    };
    
    onUpdate(updatedBooking);
    setIsEditing(false);
  };

  // Отмена редактирования
  const handleCancelEdit = () => {
    setIsEditing(false);
    
    // Сбрасываем данные формы к исходным
    if (booking) {
      const date = parseDateTime(booking.is_custom ? booking.start_time : booking.appointment_datetime);
      const formattedDate = date ? `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}` : '';
      const formattedTime = date ? `${String(date.getHours()).padStart(2, '0')}:${String(date.getMinutes()).padStart(2, '0')}` : '';
    
      setEditData({
        clientName: booking.client_name || '',
        service_id: booking.service_id || '',
        service_name: booking.service_name || '',
        date: formattedDate,
        startTime: formattedTime,
        notes: booking.comment || ''
      });
    }
    
    setSelectedSlot(null);
    setTimeError('');
  };

  // Обработка удаления
  const handleDelete = () => {
    if (window.confirm('Вы уверены, что хотите удалить данное бронирование?')) {
      onDelete(booking.id);
    }
  };

  // Если нет брони, не отображаем ничего
  if (!booking) return null;

  return (
    <div className="booking-details-modal-overlay">
      <div className="booking-details-modal">
        <div className="booking-details-header">
          <button className="back-button" onClick={onClose}>&larr; Назад</button>
          <h2>{booking.is_custom ? 'Индивидуальная запись' : 'Бронирование клиента'}</h2>
        </div>
        
        {isEditing ? (
          <form className="booking-edit-form" onSubmit={handleSubmit}>
            <div className="form-group">
              <label htmlFor="clientName">Имя клиента</label>
              <input
                id="clientName"
                name="clientName"
                type="text"
                value={editData.clientName}
                onChange={handleChange}
                required
              />
            </div>
            
            <div className="form-group">
              <label htmlFor="service_id">Услуга</label>
              <select
                id="service_id"
                name="service_id"
                value={editData.service_id}
                onChange={handleChange}
                required
              >
                <option value="">Выберите услугу</option>
                {services.map(service => (
                  <option key={service.id} value={service.id}>
                    {service.service_name} ({service.duration} мин)
                  </option>
                ))}
              </select>
            </div>
            
            <div className="form-group">
              <label htmlFor="date">Дата</label>
              <input
                id="date"
                name="date"
                type="date"
                value={editData.date}
                onChange={handleChange}
                required
              />
            </div>
            
            <div className="form-group time-selection">
              <label>Время</label>
              {loadingSlots ? (
                <div className="loading-slots">Загрузка доступных слотов...</div>
              ) : availableTimeSlots.length > 0 ? (
                <div className="time-slots-grid">
                  {availableTimeSlots.map((slot, index) => {
                    const timeOnly = slot.time.split(' ')[1];
                    const isSelected = selectedSlot && selectedSlot.time === slot.time;
                    return (
                      <div
                        key={index}
                        className={`time-slot ${isSelected ? 'selected' : ''}`}
                        onClick={() => handleSlotSelect(slot)}
                      >
                        {timeOnly}
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="no-slots-message">
                  {editData.service_id && editData.date
                    ? 'Нет доступных слотов на выбранную дату'
                    : 'Выберите услугу и дату, чтобы увидеть доступное время'}
                </div>
              )}
              
              <div className="custom-time-input">
                <input
                  type="time"
                  name="startTime"
                  value={editData.startTime}
                  onChange={handleChange}
                  required
                />
                {timeError && <div className="time-error">{timeError}</div>}
              </div>
            </div>
            
            <div className="form-group">
              <label htmlFor="notes">Комментарий</label>
              <textarea
                id="notes"
                name="notes"
                value={editData.notes}
                onChange={handleChange}
                rows="3"
              />
            </div>
            
            <div className="form-actions">
              <button type="submit" className="save-button">Сохранить</button>
              <button type="button" className="cancel-button" onClick={handleCancelEdit}>Отмена</button>
            </div>
          </form>
        ) : (
          <div className="booking-info-container">
            <div className="booking-info-card">
              <div className="info-row">
                <span className="info-label">Клиент:</span>
                <span className="info-value">{booking.client_name || 'Не указано'}</span>
              </div>
              
              <div className="info-row">
                <span className="info-label">Услуга:</span>
                <span className="info-value">{booking.service_name || 'Не указано'}</span>
              </div>
              
              <div className="info-row">
                <span className="info-label">Дата:</span>
                <span className="info-value">
                  {formatDateFull(parseDateTime(booking.is_custom ? booking.start_time : booking.appointment_datetime)) || 'Не указана'}
                </span>
              </div>
              
              <div className="info-row">
                <span className="info-label">Время:</span>
                <span className="info-value">
                  {startDisplay}
                  {endDisplay && ` - ${endDisplay}`}
                </span>
              </div>
              
              {booking.comment && (
                <div className="info-row notes">
                  <span className="info-label">Комментарий:</span>
                  <span className="info-value">{booking.comment}</span>
                </div>
              )}
            </div>
            
            <div className="booking-actions">
              <button className="edit-button" onClick={() => setIsEditing(true)}>
                Редактировать
              </button>
              <button className="delete-button" onClick={handleDelete}>
                Удалить
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default BookingDetailsModal;
