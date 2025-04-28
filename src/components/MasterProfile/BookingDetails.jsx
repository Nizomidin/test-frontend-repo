import React, { useState, useEffect } from 'react';
import './BookingDetails.css';

function BookingDetails({ booking, masterId, onBack, onDelete, onUpdate }) {
  const [isEditing, setIsEditing] = useState(false);
  const [services, setServices] = useState([]);
  const [servicesLoading, setServicesLoading] = useState(false);
  const [availableTimeSlots, setAvailableTimeSlots] = useState([]);
  const [slotsLoading, setSlotsLoading] = useState(false);
  const [editData, setEditData] = useState({
    clientName: '',
    service_id: '',
    date: '',
    startTime: '',
    notes: ''
  });
  const [timeError, setTimeError] = useState('');
  const [selectedSlot, setSelectedSlot] = useState(null);

  // Инициализируем поля при выборе брони
  useEffect(() => {
    if (!booking) return;

    const dt = new Date(booking.appointment_datetime || Date.now());
    const yy = dt.getFullYear();
    const mm = String(dt.getMonth() + 1).padStart(2, '0');
    const dd = String(dt.getDate()).padStart(2, '0');
    const hh = String(dt.getHours()).padStart(2, '0');
    const mi = String(dt.getMinutes()).padStart(2, '0');

    setEditData({
      clientName: booking.client_name || '',
      service_id: booking.service_id || '',
      service_name: booking.service_name || '',
      date: `${yy}-${mm}-${dd}`,
      startTime: `${hh}:${mi}`,
      notes: booking.comment || ''
    });    
    setSelectedSlot(null);
    setTimeError('');
  }, [booking]);

  // Загрузка услуг по masterId
  useEffect(() => {
    if (!masterId) return;
    setServicesLoading(true);
    
    // Загружаем все услуги
    fetch('https://api.kuchizu.online/services', {
      headers: { accept: 'application/json' }
    })
      .then(res => {
        if (!res.ok) throw new Error('Ошибка загрузки услуг');
        return res.json();
      })
      .then(data => {
        // Фильтруем услуги для конкретного мастера
        const filteredServices = data.filter(svc => svc.master_id === masterId);
        setServices(filteredServices);
        console.log(`Загружено ${filteredServices.length} услуг мастера ${masterId}`);
        
        // Если есть booking и service_id, но нет соответствующего service_name,
        // найдем его среди загруженных услуг
        if (booking && booking.service_id && !editData.service_name) {
          const matchedService = filteredServices.find(s => s.id === booking.service_id);
          if (matchedService) {
            setEditData(prev => ({
              ...prev,
              service_name: matchedService.service_name
            }));
          }
        }
      })
      .catch(console.error)
      .finally(() => setServicesLoading(false));
  }, [masterId, booking, editData.service_name]);

  // Загрузка слотов после выбора услуги или даты
  useEffect(() => {
    if (!editData.service_id || !editData.date) return;
    setSlotsLoading(true);
    fetch(
      `https://api.kuchizu.online/masters/${masterId}/available?date=${editData.date}`,
      { headers: { accept: 'application/json' } }
    )
      .then(res => {
        if (!res.ok) {
          // Если код ответа 404 и сообщение об ошибке указывает на выходной день
          if (res.status === 404) {
            return res.json().then(errorData => {
              if (errorData.detail && errorData.detail.includes('выходной')) {
                // Возвращаем пустой массив слотов
                return [];
              }
              throw new Error('Ошибка загрузки слотов');
            });
          }
          throw new Error('Ошибка загрузки слотов');
        }
        return res.json();
      })
      .then(data => {
        if (!Array.isArray(data)) {
          setAvailableTimeSlots([]);
          return;
        }
        const svc = services.find(s => s.id === editData.service_id);
        setAvailableTimeSlots(
          svc
            ? data.filter(slot => slot.service === svc.service_name)
            : []
        );
      })
      .catch(error => {
        console.error(error);
        setAvailableTimeSlots([]);
      })
      .finally(() => setSlotsLoading(false));
  }, [editData.service_id, editData.date, masterId, services]);

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

  // Выбор слота
  const handleSlotSelect = slot => {
    setSelectedSlot(slot);
    setEditData(prev => ({
      ...prev,
      startTime: slot.start_time
    }));
    setTimeError('');
  };

  // Сохранение изменений
  const handleSave = e => {
    e.preventDefault();
    if (!editData.service_id) {
      setTimeError('Выберите услугу');
      return;
    }
    if (!editData.startTime) {
      setTimeError('Выберите время');
      return;
    }
    const appointment_datetime = `${editData.date} ${editData.startTime}`;
    onUpdate(booking.id, {
      service_id: editData.service_id,
      appointment_datetime: appointment_datetime,
      comment: editData.notes
    });
    
    // Закрываем диалоговое окно и возвращаемся к календарю
    setIsEditing(false);
    onBack(); // Вызываем функцию возврата к календарю
  };

  if (!booking) return null;

  // Отображение детали
  const fmt = s =>
    new Date(s).toLocaleString('ru-RU', {
      day: 'numeric', month: 'long', year: 'numeric',
      hour: '2-digit', minute: '2-digit'
    });
  const startDisplay = booking.appointment_datetime ? fmt(booking.appointment_datetime) : '—';
  
  return (
    <div className="booking-details">
      <div className="booking-details-header">
        <button className="back-button" onClick={onBack}>← Назад</button>
        <h2>
          {booking.is_blocked
            ? 'Забронированное время'
            : booking.is_personal
            ? 'Личная запись'
            : 'Запись клиента'}
        </h2>
      </div>

      {isEditing ? (
        <form className="block-time-form" onSubmit={handleSave}>
          {/* Имя клиента (неизменяемое) */}
          <div className="form-group">
            <label>Имя клиента</label>
            <input
              name="clientName"
              type="text"
              value={editData.clientName}
              readOnly
              disabled
              className="read-only-field"
            />
          </div>

          {/* Селект услуги */}
          <div className="form-group">
            <label>Услуга</label>
            {servicesLoading ? (
              <p>Загрузка услуг...</p>
            ) : (
              <select
                name="service_id"
                value={editData.service_id}
                onChange={handleChange}
                required
              >
                <option value="">Выберите услугу</option>
                {services.map(s => (
                  <option key={s.id} value={s.id}>
                    {s.service_name}
                  </option>
                ))}
              </select>
            )}
            
          </div>

          {/* Дата */}
          <div className="form-group">
            <label>Дата</label>
            <input
              name="date"
              type="date"
              value={editData.date}
              onChange={handleChange}
            />
          </div>

          {/* Слоты */}
          <div className="form-group">
            <label>Выберите доступное время</label>
            {slotsLoading ? (
              <p>Загрузка слотов...</p>
            ) : !editData.service_id ? (
              <p>Сначала выберите услугу</p>
            ) : availableTimeSlots.length ? (
              <div className="available-time-slots">
                {availableTimeSlots.map((slot, idx) => (
                  <div
                    key={idx}
                    className={
                      'time-slot' +
                      (editData.startTime === slot.start_time
                        ? ' selected'
                        : '')
                    }
                    onClick={() => handleSlotSelect(slot)}
                  >
                    <span className="slot-time">
                      {slot.start_time} – {slot.end_time}
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <p>Нет доступных интервалов</p>
            )}
            {/* Показываем текущее выбранное время */}
            {editData.startTime && (
              <div className="current-time">
                <p>Текущее выбранное время: {editData.startTime}</p>
              </div>
            )}
          </div>

          {/* Примечания */}
          <div className="form-group">
            <label>Примечания</label>
            <textarea
              name="notes"
              value={editData.notes}
              onChange={handleChange}
              rows="3"
              placeholder="Дополнительная информация"
            />
          </div>

          {timeError && <div className="error-message">{timeError}</div>}

          <div className="form-actions">
            <button
              type="button"
              className="cancel-button"
              onClick={() => setIsEditing(false)}
            >
              Отмена
            </button>
            <button type="submit" className="submit-button">
              Сохранить
            </button>
          </div>
        </form>
      ) : (
        <div className="booking-info-container">
          <div className="booking-info-card">
            {!booking.is_blocked && !booking.is_personal && (
              <div className="info-row">
                <span className="info-label">Клиент:</span>
                <span className="info-value">
                  {booking.client_name || '—'}
                </span>
              </div>
            )}
            <div className="info-row">
              <span className="info-label">Услуга:</span>
              <span className="info-value">
                {booking.service_name || 'Личное время'}
              </span>
            </div>
            <div className="info-row">
              <span className="info-label">Начало:</span>
              <span className="info-value">{startDisplay}</span>
            </div>
            {booking.comment && (
              <div className="info-row notes">
                <span className="info-label">Примечания:</span>
                <span className="info-value">{booking.comment}</span>
              </div>
            )}
          </div>
          <div className="booking-actions">
            <button onClick={() => setIsEditing(true)} className="edit-button">
              Изменить
            </button>
            <button
              onClick={() => onDelete(booking.id)}
              className="delete-button"
            >
              Удалить
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default BookingDetails;
