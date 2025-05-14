/**
 * Страница клиентского бронирования
 */
import React, { useState, useEffect } from 'react';
import { useNavigate, useParams, useLocation } from 'react-router-dom';
import './ClientBookingPage.css';

// Hooks
import useClientData from '../../hooks/useClientData';
import useMasterData from '../../hooks/useMasterData';
import useServices from '../../hooks/useServices';
import useAppointments from '../../hooks/useAppointments';

// Utils
import { formatDateFull, formatTimeShort, parseDateTime } from '../../utils/dateUtils';

// Contexts
import { useToast } from '../../contexts/ToastContext';

// API
import bookingApi from '../../api/bookingApi';
import { API_BASE } from '../../api/apiConfig';

/**
 * Компонент фото клиента с запасным вариантом
 */
const ClientPhoto = ({ photoUrl, name }) => {
  const [hasError, setHasError] = useState(false);
  const fullPhotoUrl = photoUrl ? `${photoUrl.startsWith('http') ? '' : API_BASE}${photoUrl}` : null;

  return (
    <div className="client-photo-container">
      {!hasError && fullPhotoUrl ? (
        <img 
          src={fullPhotoUrl} 
          alt={name} 
          className="client-photo" 
          onError={() => setHasError(true)}
        />
      ) : (
        <div className="client-photo-placeholder">
          <span>{name?.[0] || '?'}</span>
        </div>
      )}
    </div>
  );
};

/**
 * Компонент для загрузки фотографии клиента
 */
const ClientPhotoUpload = ({ clientId, onPhotoUpdate }) => {
  const [uploading, setUploading] = useState(false);
  const { showSuccess, showError } = useToast();
  const fileInputRef = React.createRef();

  const handleFileChange = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    // Проверяем тип файла
    if (!file.type.startsWith('image/')) {
      showError('Пожалуйста, выберите изображение');
      return;
    }

    // Проверяем размер файла (не более 5МБ)
    if (file.size > 5 * 1024 * 1024) {
      showError('Размер файла не должен превышать 5МБ');
      return;
    }

    // Создаем FormData для отправки
    const formData = new FormData();
    formData.append('photo', file);

    try {
      setUploading(true);
      await onPhotoUpdate(formData);
      showSuccess('Фото успешно загружено');
    } catch (error) {
      showError('Ошибка при загрузке фото: ' + error.message);
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="photo-upload">
      <input
        type="file"
        accept="image/*"
        onChange={handleFileChange}
        ref={fileInputRef}
        disabled={uploading}
        style={{ display: 'none' }}
      />
      <button 
        className="upload-photo-button" 
        onClick={() => fileInputRef.current.click()}
        disabled={uploading}
      >
        {uploading ? 'Загрузка...' : 'Загрузить фото'}
      </button>
    </div>
  );
};

/**
 * Компонент списка услуг мастера
 */
const ServiceList = ({ services, selectedServiceId, onSelectService }) => {
  const [filterValue, setFilterValue] = useState('');
  
  // Фильтрация услуг по названию
  const filteredServices = services.filter(service => 
    service.name.toLowerCase().includes(filterValue.toLowerCase())
  );
  
  return (
    <div className="service-list-container">
      <div className="service-filter">
        <input
          type="text"
          placeholder="Поиск услуги..."
          value={filterValue}
          onChange={(e) => setFilterValue(e.target.value)}
          className="service-filter-input"
        />
      </div>
      
      <div className="services-list">
        {filteredServices.length === 0 ? (
          <div className="no-services">Услуги не найдены</div>
        ) : (
          filteredServices.map(service => (
            <div
              key={service._id}
              className={`service-item ${selectedServiceId === service._id ? 'selected' : ''}`}
              onClick={() => onSelectService(service._id)}
            >
              <div className="service-item-name">{service.name}</div>
              <div className="service-item-details">
                <span className="service-duration">{service.duration} мин</span>
                {service.price && (
                  <span className="service-price">{service.price} ₽</span>
                )}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

/**
 * Компонент формы бронирования
 */
const BookingForm = ({ 
  masterId, 
  selectedServiceId, 
  services, 
  clientId, 
  onBookingCreated,
  getAvailableSlots
}) => {
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [timeSlots, setTimeSlots] = useState([]);
  const [selectedTimeSlot, setSelectedTimeSlot] = useState(null);
  const [loading, setLoading] = useState(false);
  const [comments, setComments] = useState('');
  const { showSuccess, showError } = useToast();
  
  // Получаем информацию о выбранной услуге
  const selectedService = services.find(service => service._id === selectedServiceId);
  
  // Получаем доступные слоты при изменении даты или услуги
  useEffect(() => {
    if (!selectedServiceId || !masterId) return;
    
    const fetchTimeSlots = async () => {
      try {
        setLoading(true);
        const dateStr = selectedDate.toISOString().split('T')[0];
        const duration = selectedService?.duration || 60;
        
        const availableSlots = await getAvailableSlots(dateStr, duration);
        setTimeSlots(availableSlots);
        setSelectedTimeSlot(null); // Сбрасываем выбранный слот при смене даты
      } catch (error) {
        showError('Ошибка при загрузке доступных слотов: ' + error.message);
      } finally {
        setLoading(false);
      }
    };
    
    fetchTimeSlots();
  }, [selectedDate, selectedServiceId, masterId, selectedService, getAvailableSlots, showError]);
  
  // Переход на следующий день
  const navigateToNextDay = () => {
    const nextDay = new Date(selectedDate);
    nextDay.setDate(nextDay.getDate() + 1);
    setSelectedDate(nextDay);
  };
  
  // Переход на предыдущий день
  const navigateToPrevDay = () => {
    const prevDay = new Date(selectedDate);
    prevDay.setDate(prevDay.getDate() - 1);
    setSelectedDate(prevDay);
  };
  
  // Создание бронирования
  const createBooking = async () => {
    if (!selectedTimeSlot || !selectedServiceId || !clientId || !masterId) {
      showError('Пожалуйста, заполните все поля');
      return;
    }
    
    try {
      setLoading(true);
      
      const bookingData = {
        masterId,
        clientId,
        serviceId: selectedServiceId,
        startTime: selectedTimeSlot,
        comments: comments.trim() || undefined
      };
      
      const newBooking = await bookingApi.createBooking(bookingData);
      showSuccess('Бронирование успешно создано');
      
      // Очищаем форму
      setSelectedTimeSlot(null);
      setComments('');
      
      // Оповещаем родительский компонент
      if (onBookingCreated) {
        onBookingCreated(newBooking);
      }
    } catch (error) {
      showError('Ошибка при создании бронирования: ' + error.message);
    } finally {
      setLoading(false);
    }
  };
  
  return (
    <div className="booking-form-container">
      <h3>Записаться на услугу</h3>
      
      {!selectedServiceId ? (
        <div className="no-service-selected">
          Выберите услугу из списка слева
        </div>
      ) : (
        <>
          <div className="selected-service-info">
            <h4>Выбранная услуга:</h4>
            <div className="service-name">{selectedService?.name}</div>
            <div className="service-details">
              <span className="service-duration">{selectedService?.duration} мин</span>
              {selectedService?.price && (
                <span className="service-price">{selectedService.price} ₽</span>
              )}
            </div>
          </div>
          
          <div className="date-selector">
            <button 
              className="date-nav-button"
              onClick={navigateToPrevDay}
              disabled={loading}
            >
              &lt;
            </button>
            <div className="selected-date">
              {formatDateFull(selectedDate)}
            </div>
            <button 
              className="date-nav-button"
              onClick={navigateToNextDay}
              disabled={loading}
            >
              &gt;
            </button>
          </div>
          
          <div className="time-slots-container">
            <h4>Доступное время:</h4>
            
            {loading ? (
              <div className="loading-slots">Загрузка доступных слотов...</div>
            ) : timeSlots.length === 0 ? (
              <div className="no-slots">
                На выбранную дату нет доступных слотов
              </div>
            ) : (
              <div className="time-slots">
                {timeSlots.map(slot => (
                  <button
                    key={slot}
                    className={`time-slot-button ${selectedTimeSlot === slot ? 'selected' : ''}`}
                    onClick={() => setSelectedTimeSlot(slot)}
                  >
                    {formatTimeShort(slot)}
                  </button>
                ))}
              </div>
            )}
          </div>
          
          <div className="booking-comments">
            <label htmlFor="comments">Комментарий к записи (необязательно):</label>
            <textarea
              id="comments"
              value={comments}
              onChange={(e) => setComments(e.target.value)}
              placeholder="Напишите, если у вас есть особые пожелания"
              rows={3}
            />
          </div>
          
          <button
            className="create-booking-button"
            onClick={createBooking}
            disabled={loading || !selectedTimeSlot}
          >
            {loading ? 'Создание бронирования...' : 'Записаться'}
          </button>
        </>
      )}
    </div>
  );
};

/**
 * Компонент истории бронирований клиента
 */
const BookingHistory = ({ bookings, onEditBooking, onCancelBooking }) => {
  const [showPast, setShowPast] = useState(false);
  
  // Разделяем бронирования на предстоящие и прошедшие
  const now = new Date();
  const upcomingBookings = bookings.filter(booking => {
    const bookingDate = parseDateTime(booking.startTime);
    return bookingDate > now;
  });
  
  const pastBookings = bookings.filter(booking => {
    const bookingDate = parseDateTime(booking.startTime);
    return bookingDate <= now;
  });
  
  // Выбираем, какие бронирования показывать
  const displayedBookings = showPast ? pastBookings : upcomingBookings;
  
  return (
    <div className="booking-history-container">
      <div className="booking-history-header">
        <h3>Ваши записи</h3>
        <div className="booking-filter-tabs">
          <button
            className={`filter-tab ${!showPast ? 'active' : ''}`}
            onClick={() => setShowPast(false)}
          >
            Предстоящие ({upcomingBookings.length})
          </button>
          <button
            className={`filter-tab ${showPast ? 'active' : ''}`}
            onClick={() => setShowPast(true)}
          >
            Прошедшие ({pastBookings.length})
          </button>
        </div>
      </div>
      
      <div className="booking-list">
        {displayedBookings.length === 0 ? (
          <div className="no-bookings">
            {showPast ? 'У вас нет прошедших записей' : 'У вас нет предстоящих записей'}
          </div>
        ) : (
          displayedBookings.map(booking => (
            <div key={booking._id} className="booking-item">
              <div className="booking-item-header">
                <div className="booking-service-name">{booking.serviceName}</div>
                <div className="booking-status">{booking.status || 'Подтверждено'}</div>
              </div>
              
              <div className="booking-details">
                <div className="booking-time">
                  <strong>Дата и время:</strong> {formatDateFull(booking.startTime)}, {formatTimeShort(booking.startTime)}
                </div>
                
                <div className="booking-master">
                  <strong>Мастер:</strong> {booking.masterName}
                </div>
                
                {booking.comments && (
                  <div className="booking-comments">
                    <strong>Комментарий:</strong> {booking.comments}
                  </div>
                )}
              </div>
              
              {!showPast && (
                <div className="booking-actions">
                  <button
                    className="edit-booking-button"
                    onClick={() => onEditBooking(booking)}
                  >
                    Изменить
                  </button>
                  <button
                    className="cancel-booking-button"
                    onClick={() => onCancelBooking(booking._id)}
                  >
                    Отменить
                  </button>
                </div>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
};

/**
 * Основной компонент страницы клиентского бронирования
 */
const ClientBookingPage = () => {
  const { clientId } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const searchParams = new URLSearchParams(location.search);
  const masterIdFromUrl = searchParams.get('master_id');
  
  const { showSuccess, showError } = useToast();
  
  // Хуки для получения данных
  const {
    clientData,
    bookingHistory,
    loading: clientLoading,
    error: clientError,
    updateClient,
    uploadPhoto,
    createBooking,
    updateBooking,
    cancelBooking,
    refresh: refreshClientData
  } = useClientData(clientId);
  
  const {
    masterData,
    loading: masterLoading,
    error: masterError
  } = useMasterData(masterIdFromUrl);
  
  const {
    services,
    loading: servicesLoading,
    error: servicesError
  } = useServices(masterIdFromUrl);
  
  const {
    getAvailableSlots
  } = useAppointments(masterIdFromUrl);
  
  // Состояния компонента
  const [selectedServiceId, setSelectedServiceId] = useState(null);
  const [editingBooking, setEditingBooking] = useState(null);
  
  // Действия с бронированиями
  const handleBookingCreated = () => {
    refreshClientData();
    setSelectedServiceId(null);
  };
  
  const handleEditBooking = (booking) => {
    setEditingBooking(booking);
    setSelectedServiceId(booking.serviceId);
  };
  
  const handleCancelBooking = async (bookingId) => {
    if (!window.confirm('Вы уверены, что хотите отменить эту запись?')) {
      return;
    }
    
    try {
      await cancelBooking(bookingId);
      showSuccess('Запись успешно отменена');
      refreshClientData();
    } catch (error) {
      showError('Ошибка при отмене записи: ' + error.message);
    }
  };
  
  const handlePhotoUpload = async (formData) => {
    try {
      await uploadPhoto(formData);
      refreshClientData();
      return true;
    } catch (error) {
      throw error;
    }
  };
  
  // Индикация загрузки
  if (clientLoading || masterLoading || servicesLoading) {
    return <div className="loading-spinner">Загрузка данных...</div>;
  }
  
  // Обработка ошибок
  if (clientError || masterError || servicesError) {
    return (
      <div className="error-container">
        <h2>Ошибка при загрузке данных</h2>
        <p>{clientError || masterError || servicesError}</p>
        <button onClick={() => window.location.reload()}>Попробовать снова</button>
      </div>
    );
  }
  
  // Если данные мастера не найдены
  if (!masterData) {
    return (
      <div className="not-found">
        <h2>Мастер не найден</h2>
        <p>Проверьте ссылку и попробуйте снова</p>
        <button onClick={() => navigate('/')}>На главную</button>
      </div>
    );
  }
  
  // Если данные клиента не найдены
  if (!clientData) {
    return (
      <div className="not-found">
        <h2>Клиент не найден</h2>
        <p>Проверьте ссылку и попробуйте снова</p>
        <button onClick={() => navigate('/')}>На главную</button>
      </div>
    );
  }
  
  return (
    <div className="client-booking-page">
      <div className="client-header">
        <div className="client-info">
          <ClientPhoto 
            photoUrl={clientData.photoUrl} 
            name={clientData.firstName} 
          />
          <div className="client-details">
            <h1 className="client-name">
              {clientData.firstName} {clientData.lastName}
            </h1>
            <ClientPhotoUpload 
              clientId={clientId} 
              onPhotoUpdate={handlePhotoUpload} 
            />
          </div>
        </div>
        
        <div className="master-info">
          <h2>Запись к мастеру</h2>
          <div className="master-name">
            {masterData.firstName} {masterData.lastName}
          </div>
          <div className="master-category">
            {masterData.serviceCategory}
          </div>
          {masterData.address && (
            <div className="master-address">
              Адрес: {masterData.address}
            </div>
          )}
        </div>
      </div>
      
      <div className="client-booking-content">
        <div className="services-section">
          <ServiceList 
            services={services} 
            selectedServiceId={selectedServiceId}
            onSelectService={setSelectedServiceId}
          />
        </div>
        
        <div className="booking-section">
          <BookingForm 
            masterId={masterIdFromUrl}
            selectedServiceId={selectedServiceId}
            services={services}
            clientId={clientId}
            onBookingCreated={handleBookingCreated}
            getAvailableSlots={getAvailableSlots}
          />
        </div>
        
        <div className="history-section">
          <BookingHistory 
            bookings={bookingHistory}
            onEditBooking={handleEditBooking}
            onCancelBooking={handleCancelBooking}
          />
        </div>
      </div>
    </div>
  );
};

export default ClientBookingPage;
