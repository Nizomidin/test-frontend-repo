/**
 * Компонент для управления бронированиями мастера
 */
import React, { useState, useEffect } from 'react';
import './MasterBookingManager.css';
import { formatDateFull, formatTimeShort } from '../../../utils/dateUtils';
import { useToast } from '../../../contexts/ToastContext';

/**
 * Компонент для управления бронированиями мастеров
 * @param {Object} props - Свойства компонента
 * @param {string} props.currentMasterId - ID текущего мастера
 * @param {Array} props.allMasters - Список всех мастеров
 * @param {Function} props.fetchMastersSchedule - Функция для загрузки расписания мастеров
 * @param {Function} props.fetchMasterAppointments - Функция для загрузки бронирований мастера
 * @param {Function} props.fetchMasterServices - Функция для загрузки услуг мастера
 * @param {Function} props.createBooking - Функция для создания бронирования
 * @param {Function} props.updateBooking - Функция для обновления бронирования
 * @param {Function} props.deleteBooking - Функция для удаления бронирования
 */
const MasterBookingManager = ({ 
  currentMasterId,
  allMasters = [],
  fetchMastersSchedule,
  fetchMasterAppointments,
  fetchMasterServices,
  createBooking,
  updateBooking,
  deleteBooking
}) => {
  const [selectedMasterId, setSelectedMasterId] = useState(null);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [bookings, setBookings] = useState([]);
  const [services, setServices] = useState([]);
  const [mastersSchedule, setMastersSchedule] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [showBookingForm, setShowBookingForm] = useState(false);
  const [viewMode, setViewMode] = useState("scheduler"); // "detailed" или "scheduler"
  const [formData, setFormData] = useState({
    service_id: "",
    client_name: "",
    appointment_datetime: "",
    comment: "",
  });
  const [availableTimeSlots, setAvailableTimeSlots] = useState([]);
  const [selectedTimeSlot, setSelectedTimeSlot] = useState(null);
  const [selectedSchedulerTime, setSelectedSchedulerTime] = useState(null);
  const [selectedSchedulerMaster, setSelectedSchedulerMaster] = useState(null);
  const [allAppointments, setAllAppointments] = useState([]);
  const [editingAppointment, setEditingAppointment] = useState(null);
  const [showEditForm, setShowEditForm] = useState(false);
  const [allServices, setAllServices] = useState({});
  const [editingAvailableTimeSlots, setEditingAvailableTimeSlots] = useState([]);
  const [editingSelectedTimeSlot, setEditingSelectedTimeSlot] = useState(null);
  
  // Используем контекст Toast для сообщений
  const { showSuccess, showError, showWarning, showInfo } = useToast();

  // Загрузка расписания мастеров при изменении даты
  useEffect(() => {
    if (fetchMastersSchedule && allMasters.length > 0) {
      loadMastersSchedule();
    }
  }, [selectedDate, allMasters]);

  // Загрузка данных выбранного мастера при изменении выбранного мастера
  useEffect(() => {
    if (selectedMasterId) {
      loadMasterData();
    }
  }, [selectedMasterId, selectedDate]);

  // Функция загрузки расписания мастеров
  const loadMastersSchedule = async () => {
    setIsLoading(true);
    try {
      const scheduleData = await fetchMastersSchedule(allMasters, selectedDate);
      setMastersSchedule(scheduleData || {});
    } catch (err) {
      console.error("Ошибка при загрузке расписания мастеров:", err);
      setError("Не удалось загрузить расписание мастеров");
    } finally {
      setIsLoading(false);
    }
  };

  // Загрузка данных выбранного мастера
  const loadMasterData = async () => {
    setIsLoading(true);
    try {
      // Загрузка услуг мастера
      const servicesData = await fetchMasterServices(selectedMasterId);
      setServices(servicesData || []);
      
      // Автоматически устанавливаем первую услугу при загрузке списка услуг
      if (servicesData?.length > 0) {
        setFormData(prev => ({
          ...prev,
          service_id: servicesData[0].id,
        }));
      }
      
      // Загрузка бронирований мастера
      const dateString = selectedDate.toISOString().split('T')[0];
      const appointmentsData = await fetchMasterAppointments(selectedMasterId, dateString);
      setBookings(appointmentsData || []);
      
    } catch (err) {
      console.error("Ошибка при загрузке данных мастера:", err);
      setError("Не удалось загрузить данные мастера");
    } finally {
      setIsLoading(false);
    }
  };

  // Обработчик выбора мастера
  const handleMasterSelect = (masterId) => {
    setSelectedMasterId(masterId);
  };

  // Обработчик изменения даты
  const handleDateChange = (date) => {
    setSelectedDate(date);
  };

  // Обработчик изменения полей формы
  const handleFormChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // Обработчик создания бронирования
  const handleCreateBooking = async (e) => {
    e.preventDefault();
    
    if (!formData.service_id || !formData.client_name || !selectedTimeSlot) {
      showWarning("Пожалуйста, заполните все обязательные поля");
      return;
    }
    
    setIsLoading(true);
    try {
      const bookingData = {
        master_id: selectedMasterId,
        service_id: formData.service_id,
        client_name: formData.client_name,
        comment: formData.comment,
        date: selectedDate.toISOString().split('T')[0],
        time: selectedTimeSlot.time
      };
      
      await createBooking(bookingData);
      showSuccess("Бронирование успешно создано");
      
      // Обновляем список бронирований
      loadMasterData();
      
      // Сбрасываем форму
      setFormData({
        service_id: services.length > 0 ? services[0].id : "",
        client_name: "",
        comment: "",
      });
      setSelectedTimeSlot(null);
      setShowBookingForm(false);
      
    } catch (err) {
      console.error("Ошибка при создании бронирования:", err);
      showError("Не удалось создать бронирование");
    } finally {
      setIsLoading(false);
    }
  };

  // Обработчик редактирования бронирования
  const handleUpdateBooking = async (e) => {
    e.preventDefault();
    
    if (!editingAppointment || !formData.service_id || !formData.client_name || !editingSelectedTimeSlot) {
      showWarning("Пожалуйста, заполните все обязательные поля");
      return;
    }
    
    setIsLoading(true);
    try {
      const bookingData = {
        id: editingAppointment.id,
        master_id: selectedMasterId,
        service_id: formData.service_id,
        client_name: formData.client_name,
        comment: formData.comment,
        date: selectedDate.toISOString().split('T')[0],
        time: editingSelectedTimeSlot.time
      };
      
      await updateBooking(bookingData);
      showSuccess("Бронирование успешно обновлено");
      
      // Обновляем список бронирований
      loadMasterData();
      
      // Сбрасываем форму
      setEditingAppointment(null);
      setShowEditForm(false);
      setEditingSelectedTimeSlot(null);
      
    } catch (err) {
      console.error("Ошибка при обновлении бронирования:", err);
      showError("Не удалось обновить бронирование");
    } finally {
      setIsLoading(false);
    }
  };

  // Обработчик удаления бронирования
  const handleDeleteBooking = async (appointmentId) => {
    if (!window.confirm("Вы уверены, что хотите удалить это бронирование?")) {
      return;
    }
    
    setIsLoading(true);
    try {
      await deleteBooking(appointmentId);
      showSuccess("Бронирование успешно удалено");
      
      // Обновляем список бронирований
      loadMasterData();
      
    } catch (err) {
      console.error("Ошибка при удалении бронирования:", err);
      showError("Не удалось удалить бронирование");
    } finally {
      setIsLoading(false);
    }
  };

  // Отображение списка мастеров
  const renderMasterSelector = () => (
    <div className="master-selector">
      <h3>Выберите мастера</h3>
      <div className="masters-list">
        {allMasters.map(master => (
          <div 
            key={master.id}
            className={`master-item ${selectedMasterId === master.id ? 'selected' : ''}`}
            onClick={() => handleMasterSelect(master.id)}
          >
            <div className="master-avatar">
              {master.photo ? (
                <img src={master.photo} alt={master.first_name} />
              ) : (
                <div className="master-initials">
                  {master.first_name?.[0] || '?'}
                </div>
              )}
            </div>
            <div className="master-info">
              <div className="master-name">{master.first_name} {master.last_name}</div>
              <div className="master-services-count">
                {master.services_count || 0} услуг
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  // Отображение формы создания бронирования
  const renderBookingForm = () => (
    <div className="booking-form-wrapper">
      <div className="booking-form-header">
        <h3>Новое бронирование</h3>
        <button className="close-form-btn" onClick={() => setShowBookingForm(false)}>×</button>
      </div>
      
      <form onSubmit={handleCreateBooking} className="booking-form">
        <div className="form-group">
          <label htmlFor="client_name">Имя клиента</label>
          <input
            type="text"
            id="client_name"
            name="client_name"
            value={formData.client_name}
            onChange={handleFormChange}
            placeholder="Введите имя клиента"
            required
          />
        </div>
        
        <div className="form-group">
          <label htmlFor="service_id">Услуга</label>
          <select
            id="service_id"
            name="service_id"
            value={formData.service_id}
            onChange={handleFormChange}
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
          <label>Время</label>
          <div className="time-slots-grid">
            {availableTimeSlots.map((slot, index) => (
              <div
                key={index}
                className={`time-slot ${selectedTimeSlot === slot ? 'selected' : ''}`}
                onClick={() => setSelectedTimeSlot(slot)}
              >
                {slot.time.split(' ')[1]}
              </div>
            ))}
          </div>
        </div>
        
        <div className="form-group">
          <label htmlFor="comment">Комментарий</label>
          <textarea
            id="comment"
            name="comment"
            value={formData.comment}
            onChange={handleFormChange}
            rows="3"
            placeholder="Дополнительная информация (необязательно)"
          />
        </div>
        
        <div className="form-actions">
          <button type="button" className="cancel-btn" onClick={() => setShowBookingForm(false)}>
            Отмена
          </button>
          <button type="submit" className="submit-btn" disabled={isLoading}>
            {isLoading ? 'Создание...' : 'Создать бронирование'}
          </button>
        </div>
      </form>
    </div>
  );

  // Рендеринг расписания в режиме планировщика
  const renderSchedulerView = () => (
    <div className="scheduler-view">
      <div className="scheduler-header">
        <h3>Расписание на {formatDateFull(selectedDate)}</h3>
        <div className="view-mode-toggle">
          <button 
            className={`view-mode-btn ${viewMode === 'scheduler' ? 'active' : ''}`}
            onClick={() => setViewMode('scheduler')}
          >
            Планировщик
          </button>
          <button 
            className={`view-mode-btn ${viewMode === 'detailed' ? 'active' : ''}`}
            onClick={() => setViewMode('detailed')}
          >
            Детально
          </button>
        </div>
      </div>
      
      <div className="scheduler-container">
        {/* Шапка с временем */}
        <div className="time-headers">
          <div className="master-header-cell">Мастер</div>
          {Array.from({ length: 12 }, (_, i) => i + 9).map(hour => (
            <div key={hour} className="time-header-cell">
              {hour}:00
            </div>
          ))}
        </div>
        
        {/* Строки с мастерами */}
        {allMasters.map(master => (
          <div key={master.id} className="master-row">
            <div className="master-cell">
              <div className="master-cell-name">{master.first_name}</div>
            </div>
            
            {/* Ячейки для каждого часа */}
            {Array.from({ length: 12 }, (_, i) => i + 9).map(hour => {
              const bookingsInHour = bookings.filter(booking => {
                const bookingDate = new Date(booking.appointment_datetime);
                return bookingDate.getHours() === hour && booking.master_id === master.id;
              });
              
              return (
                <div key={hour} className="time-cell">
                  {bookingsInHour.map(booking => (
                    <div 
                      key={booking.id} 
                      className="booking-block"
                      style={{ 
                        width: `${(booking.duration || 60) / 60 * 100}%` 
                      }}
                      onClick={() => handleEditBooking(booking)}
                    >
                      <div className="booking-client">{booking.client_name}</div>
                      <div className="booking-time">
                        {formatTimeShort(new Date(booking.appointment_datetime))}
                      </div>
                    </div>
                  ))}
                </div>
              );
            })}
          </div>
        ))}
      </div>
    </div>
  );

  // Рендеринг детального списка бронирований
  const renderDetailedView = () => (
    <div className="detailed-view">
      <div className="detailed-header">
        <h3>Бронирования на {formatDateFull(selectedDate)}</h3>
        <div className="view-mode-toggle">
          <button 
            className={`view-mode-btn ${viewMode === 'scheduler' ? 'active' : ''}`}
            onClick={() => setViewMode('scheduler')}
          >
            Планировщик
          </button>
          <button 
            className={`view-mode-btn ${viewMode === 'detailed' ? 'active' : ''}`}
            onClick={() => setViewMode('detailed')}
          >
            Детально
          </button>
        </div>
      </div>
      
      <div className="bookings-list">
        {bookings.length === 0 ? (
          <div className="no-bookings-message">Нет бронирований на выбранную дату</div>
        ) : (
          bookings.map(booking => (
            <div key={booking.id} className="booking-card">
              <div className="booking-card-header">
                <div className="booking-client-name">{booking.client_name}</div>
                <div className="booking-time">
                  {formatTimeShort(new Date(booking.appointment_datetime))}
                </div>
              </div>
              
              <div className="booking-service">
                {booking.service_name} ({booking.duration} мин)
              </div>
              
              {booking.comment && (
                <div className="booking-comment">{booking.comment}</div>
              )}
              
              <div className="booking-card-actions">
                <button 
                  className="edit-booking-btn"
                  onClick={() => handleEditBooking(booking)}
                >
                  Изменить
                </button>
                <button 
                  className="delete-booking-btn"
                  onClick={() => handleDeleteBooking(booking.id)}
                >
                  Удалить
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );

  // Обработчик начала редактирования бронирования
  const handleEditBooking = (booking) => {
    setEditingAppointment(booking);
    
    // Заполняем форму данными выбранного бронирования
    setFormData({
      service_id: booking.service_id,
      client_name: booking.client_name,
      comment: booking.comment || "",
    });
    
    // Загружаем доступные временные слоты для этой даты и мастера
    // loadAvailableTimeSlots(booking.master_id, booking.appointment_datetime);
    
    setShowEditForm(true);
  };

  return (
    <div className="master-booking-manager">
      <div className="booking-manager-header">
        <h2>Управление бронированиями</h2>
        
        <div className="date-selector">
          <input 
            type="date" 
            value={selectedDate.toISOString().split('T')[0]}
            onChange={(e) => handleDateChange(new Date(e.target.value))}
          />
        </div>
        
        {selectedMasterId && (
          <button 
            className="create-booking-btn"
            onClick={() => setShowBookingForm(true)}
          >
            Создать бронирование
          </button>
        )}
      </div>
      
      {error && <div className="error-message">{error}</div>}
      
      <div className="booking-manager-content">
        <div className="sidebar">
          {renderMasterSelector()}
        </div>
        
        <div className="main-content">
          {!selectedMasterId ? (
            <div className="select-master-prompt">
              Выберите мастера из списка слева, чтобы управлять его бронированиями
            </div>
          ) : isLoading ? (
            <div className="loading-indicator">Загрузка данных...</div>
          ) : (
            <div className="booking-view">
              {viewMode === 'scheduler' ? renderSchedulerView() : renderDetailedView()}
            </div>
          )}
        </div>
      </div>
      
      {showBookingForm && renderBookingForm()}
      
      {/* Форма редактирования бронирования - аналогична форме создания с небольшими изменениями */}
      {showEditForm && editingAppointment && (
        <div className="booking-form-wrapper">
          <div className="booking-form-header">
            <h3>Редактирование бронирования</h3>
            <button className="close-form-btn" onClick={() => setShowEditForm(false)}>×</button>
          </div>
          
          <form onSubmit={handleUpdateBooking} className="booking-form">
            {/* Поля формы аналогичны форме создания */}
            {/* ... */}
          </form>
        </div>
      )}
    </div>
  );
};

export default MasterBookingManager;
