import React, { useState, useEffect } from 'react';
import { useParams, useLocation } from 'react-router-dom';
import './BookingHistory.css';
import { useToast } from '../Toast/ToastContext';
import EditBookingForm from './EditBookingForm';

const BookingHistory = ({ apiBase = 'https://api.kuchizu.online', clientId }) => {
  const [bookings, setBookings] = useState([]);
  const [services, setServices] = useState({});
  const [masterInfo, setMasterInfo] = useState({});
  const [loading, setLoading] = useState(true);
  const [servicesLoading, setServicesLoading] = useState(true);
  const [mastersLoading, setMastersLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeFilter, setActiveFilter] = useState('all');
  const [editingBooking, setEditingBooking] = useState(null);
  const [availableTimeSlots, setAvailableTimeSlots] = useState([]);
  const [loadingTimeSlots, setLoadingTimeSlots] = useState(false);
  const { showError, showSuccess } = useToast();
  const params = useParams();
  const location = useLocation();

  // Получение client_id из параметров URL или пропсов
  const getClientId = () => {
    if (clientId) return clientId;
    if (params.clientId) return params.clientId;
    
    const searchParams = new URLSearchParams(location.search);
    const urlClientId = searchParams.get('client_id');
    
    return urlClientId || null;
  };
  
  const currentClientId = getClientId();

  // Начать редактирование записи
  const handleStartEditing = async (booking) => {
    // Загружаем доступные временные слоты для этого мастера и даты
    const service = services[booking.service_id];
    
    if (!service) {
      showError("Не удалось получить информацию об услуге");
      return;
    }
    
    try {
      setLoadingTimeSlots(true);
      
      // Получаем дату из строки booking.appointment_time
      const [dateStr] = booking.appointment_time.split(' ');
      
      const response = await fetch(`${apiBase}/masters/${booking.master_id}/available?date=${dateStr}`, {
        headers: { 'accept': 'application/json' }
      });
      
      if (!response.ok) {
        throw new Error(`Ошибка получения данных: ${response.status}`);
      }
      
      const data = await response.json();
      
      // Фильтруем слоты для выбранной услуги
      const filteredSlots = data.filter(slot => 
        slot.service === service.service_name
      );
      
      setAvailableTimeSlots(filteredSlots);
      setEditingBooking(booking);
    } catch (err) {
      console.error('Ошибка при загрузке доступных временных слотов:', err);
      showError('Не удалось загрузить доступные временные слоты');
    } finally {
      setLoadingTimeSlots(false);
    }
  };

  // Сохранить отредактированную запись
  const handleSaveEdit = async (editedBooking) => {
    try {
      const response = await fetch(`${apiBase}/appointments/${editedBooking.id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'accept': 'application/json'
        },
        body: JSON.stringify({
          appointment_time: editedBooking.appointment_time,
          comment: editedBooking.comment
        })
      });
      
      if (!response.ok) {
        throw new Error(`Ошибка при обновлении записи: ${response.status}`);
      }
      
      const updatedData = await response.json();
      
      // Обновляем бронирование локально
      setBookings(prevBookings =>
        prevBookings.map(booking =>
          booking.id === editedBooking.id ? { ...booking, ...updatedData } : booking
        )
      );
      
      setEditingBooking(null);
      showSuccess('Запись успешно обновлена');
    } catch (err) {
      console.error('Ошибка при обновлении записи:', err);
      showError('Не удалось обновить запись');
    }
  };

  // Отмена редактирования
  const handleCancelEdit = () => {
    setEditingBooking(null);
  };

  // Проверка и обновление статусов прошедших записей
  const checkAndUpdatePastAppointments = (bookingsData) => {
    const now = new Date();
    
    return bookingsData.map(booking => {
      if (booking.status !== 'booked') return booking;

      // Парсим дату и время записи
      const [dateStr, timeStr] = booking.appointment_time.split(' ');
      const [year, month, day] = dateStr.split('-').map(Number);
      const [hours, minutes] = timeStr.split(':').map(Number);
      
      // Создаем объект Date для времени записи
      const appointmentDateTime = new Date(year, month - 1, day, hours, minutes);
      
      // Если время записи уже прошло
      if (appointmentDateTime < now) {
        return { ...booking, status: 'finished' };
      }
      
      return booking;
    });
  };

  // Загрузка всех бронирований и фильтрация по client_id
  useEffect(() => {
    const fetchBookings = async () => {
      if (!currentClientId) {
        setLoading(false);
        setBookings([]);
        return;
      }
      
      try {
        setLoading(true);
        
        const response = await fetch(`${apiBase}/appointments`, {
          headers: { 'accept': 'application/json' }
        });
        
        if (!response.ok) {
          throw new Error(`Ошибка получения данных: ${response.status}`);
        }
        
        const allBookings = await response.json();
        
        // Фильтрация по client_id
        const clientBookings = allBookings.filter(booking => 
          booking.client_id === currentClientId
        );
        
        // Проверяем и обновляем статусы прошедших записей
        const updatedBookings = checkAndUpdatePastAppointments(clientBookings);
        
        // Обновляем статусы на сервере для записей, которые закончились
        updatedBookings.forEach(booking => {
          if (booking.status === 'finished' && 
              clientBookings.find(b => b.id === booking.id)?.status === 'booked') {
            fetch(`${apiBase}/appointments/${booking.id}`, {
              method: 'PATCH',
              headers: {
                'Content-Type': 'application/json',
                'accept': 'application/json'
              },
              body: JSON.stringify({ status: 'finished' })
            }).catch(err => console.error(`Ошибка при обновлении статуса записи ${booking.id}:`, err));
          }
        });
        
        setBookings(updatedBookings);
      } catch (err) {
        console.error('Ошибка при загрузке бронирований:', err);
        setError('Не удалось загрузить историю бронирований');
        showError('Не удалось загрузить историю бронирований');
      } finally {
        setLoading(false);
      }
    };

    fetchBookings();
  }, [apiBase, currentClientId, showError]);

  // Загрузка информации об услугах
  useEffect(() => {
    const fetchServices = async () => {
      try {
        setServicesLoading(true);
        
        const response = await fetch(`${apiBase}/services`, {
          headers: { 'accept': 'application/json' }
        });
        
        if (!response.ok) {
          throw new Error(`Ошибка получения данных: ${response.status}`);
        }
        
        const servicesData = await response.json();
        
        // Преобразуем массив услуг в объект для быстрого доступа по ID
        const servicesObject = {};
        servicesData.forEach(service => {
          servicesObject[service.id] = service;
        });
        
        setServices(servicesObject);
      } catch (err) {
        console.error('Ошибка при загрузке услуг:', err);
      } finally {
        setServicesLoading(false);
      }
    };

    fetchServices();
  }, [apiBase]);

  // Загрузка информации о мастерах
  useEffect(() => {
    const fetchMasters = async () => {
      const uniqueMasterIds = [...new Set(bookings.map(booking => booking.master_id))];
      
      if (uniqueMasterIds.length === 0) {
        setMastersLoading(false);
        return;
      }
      
      try {
        setMastersLoading(true);
        
        // Создаем промисы для загрузки информации о каждом мастере
        const masterPromises = uniqueMasterIds.map(masterId =>
          fetch(`${apiBase}/masters/${masterId}`, {
            headers: { 'accept': 'application/json' }
          }).then(res => {
            if (!res.ok) return null;
            return res.json();
          }).catch(() => null)
        );
        
        const mastersData = await Promise.all(masterPromises);
        
        // Создаем объект для быстрого доступа к информации о мастере по ID
        const mastersObject = {};
        mastersData.forEach(master => {
          if (master) {
            mastersObject[master.id] = master;
          }
        });
        
        setMasterInfo(mastersObject);
      } catch (err) {
        console.error('Ошибка при загрузке мастеров:', err);
      } finally {
        setMastersLoading(false);
      }
    };

    if (bookings.length > 0 && !loading) {
      fetchMasters();
    } else {
      setMastersLoading(false);
    }
  }, [apiBase, bookings, loading]);

  // Отмена бронирования
  const handleCancelBooking = async (id) => {
    try {
      const response = await fetch(`${apiBase}/appointments/${id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'accept': 'application/json'
        },
        body: JSON.stringify({
          status: 'cancelled'
        })
      });
      
      if (!response.ok) {
        throw new Error(`Ошибка при отмене записи: ${response.status}`);
      }
      
      // Обновляем статус бронирования локально
      setBookings(prevBookings =>
        prevBookings.map(booking =>
          booking.id === id ? { ...booking, status: 'cancelled' } : booking
        )
      );
      
      showSuccess('Запись успешно отменена');
    } catch (err) {
      console.error('Ошибка при отмене бронирования:', err);
      showError('Не удалось отменить запись');
    }
  };

  // Фильтрация бронирований по активному фильтру
  const filteredBookings = bookings.filter(booking => {
    if (activeFilter === 'all') return true;
    return booking.status === activeFilter;
  });
  
  // Сортировка бронирований по дате (от новых к старым)
  const sortedBookings = [...filteredBookings].sort((a, b) => {
    // Преобразуем строки с датами в объекты Date для сравнения
    const dateA = new Date(a.appointment_time.replace(' ', 'T'));
    const dateB = new Date(b.appointment_time.replace(' ', 'T'));
    
    // Сортируем по убыванию (от новых к старым)
    return dateB - dateA;
  });

  // Преобразование статуса в текстовый формат
  const renderStatusText = (status) => {
    switch (status) {
      case 'booked': return 'Забронировано';
      case 'cancelled': return 'Отменено';
      case 'finished': return 'Завершено';
      default: return 'Неизвестный статус';
    }
  };

  // Форматирование даты и времени
  const formatDateTime = (dateTimeStr) => {
    const [date, time] = dateTimeStr.split(' ');
    const dateObj = new Date(date);
    
    const formattedDate = dateObj.toLocaleDateString('ru-RU', {
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    });
    
    return {
      date: formattedDate,
      time: time
    };
  };

  // Подготовка данных для отображения
  const isLoading = loading || servicesLoading || mastersLoading;

  if (isLoading) {
    return <div className="loading">Загрузка истории бронирований...</div>;
  }

  if (error) {
    return <div className="error-message">{error}</div>;
  }

  if (!currentClientId) {
    return <div className="error-message">Не удалось идентифицировать клиента</div>;
  }
  
  // Если в данный момент открыта форма редактирования
  if (editingBooking) {
    const service = services[editingBooking.service_id];
    const master = masterInfo[editingBooking.master_id];
    
    return (
      <EditBookingForm
        booking={editingBooking}
        service={service}
        master={master}
        availableTimeSlots={availableTimeSlots}
        loadingTimeSlots={loadingTimeSlots}
        onSave={handleSaveEdit}
        onCancel={handleCancelEdit}
      />
    );
  }

  return (
    <div className="booking-history-container">
      <h2>История бронирований</h2>
      
      <div className="filter-tabs">
        <button 
          className={`filter-tab ${activeFilter === 'all' ? 'active' : ''}`}
          onClick={() => setActiveFilter('all')}
        >
          Все записи
        </button>
        <button 
          className={`filter-tab ${activeFilter === 'booked' ? 'active' : ''}`}
          onClick={() => setActiveFilter('booked')}
        >
          Забронированные
        </button>
        <button 
          className={`filter-tab ${activeFilter === 'finished' ? 'active' : ''}`}
          onClick={() => setActiveFilter('finished')}
        >
          Завершенные
        </button>
        <button 
          className={`filter-tab ${activeFilter === 'cancelled' ? 'active' : ''}`}
          onClick={() => setActiveFilter('cancelled')}
        >
          Отмененные
        </button>
      </div>

      {filteredBookings.length === 0 ? (
        <div className="no-bookings">
          {activeFilter === 'all' 
            ? 'У вас пока нет записей на услуги' 
            : `Нет записей со статусом "${renderStatusText(activeFilter)}"`}
        </div>
      ) : (
        <div className="bookings-list">
          {sortedBookings.map(booking => {
            const service = services[booking.service_id];
            const master = masterInfo[booking.master_id] || {};
            const { date, time } = formatDateTime(booking.appointment_time);
            
            return (
              <div key={booking.id} className="booking-card">
                <div className="booking-service">
                  <h3>{service ? service.service_name : 'Услуга не найдена'}</h3>
                  {service && <p className="booking-duration">{service.duration} мин.</p>}
                </div>
                
                <div className="booking-content">
                  <div className="booking-details">
                    <p>
                      <span className="label">Мастер:</span> 
                      {master ? `${master.first_name} ${master.last_name}` : 'Нет данных'}
                    </p>
                    <p><span className="label">Дата:</span> {date}</p>
                    <p><span className="label">Время:</span> {time}</p>
                    
                    {booking.comment && (
                      <p className="booking-comment">
                        <span className="label">Комментарий:</span> {booking.comment}
                      </p>
                    )}
                    
                    <p>
                      <span className="label">Статус:</span> 
                      <span className={`booking-status status-${booking.status}`}>
                        {renderStatusText(booking.status)}
                      </span>
                    </p>
                  </div>
                  
                  {booking.status === 'booked' && (
                    <div className="booking-actions">
                      <button 
                        className="edit-booking-btn"
                        onClick={() => handleStartEditing(booking)}
                      >
                        Изменить
                      </button>
                      <button 
                        className="cancel-booking-btn"
                        onClick={() => handleCancelBooking(booking.id)}
                      >
                        Отменить
                      </button>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default BookingHistory;