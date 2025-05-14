/**
 * Страница профиля мастера
 */
import React, { useState } from 'react';
import { useParams } from 'react-router-dom';
import './MasterProfilePage.css';

// Custom hooks
import useMasterData from '../../../hooks/useMasterData';
import useAppointments from '../../../hooks/useAppointments';
import useServices from '../../../hooks/useServices';

// UI Components
import MasterHeader from '../../ui/MasterProfile/MasterHeader';
import MasterCalendar from '../../ui/MasterProfile/MasterCalendar';
import ServiceManager from '../../ui/MasterProfile/ServiceManager';
import BookingDetailsModal from '../../ui/MasterProfile/BookingDetailsModal';
import BookingOptionsModal from '../../ui/MasterProfile/BookingOptionsModal';
import BlockTimeForm from '../../ui/MasterProfile/BlockTimeForm';
import WorkScheduleForm from '../../ui/MasterProfile/WorkScheduleForm';
import CustomBookingForm from '../../ui/MasterProfile/CustomBookingForm';
import MasterBookingManager from '../../ui/MasterProfile/MasterBookingManager';

// Contexts
import { useToast } from '../../../contexts/ToastContext';

/**
 * Компонент страницы профиля мастера
 */
const MasterProfilePage = () => {
  const { masterId } = useParams();
  const { showSuccess, showError } = useToast();
  
  // Загрузка данных через хуки
  const { 
    masterData, 
    loading: masterLoading, 
    error: masterError,
    updateMaster,
    updateSchedule,
    uploadPhoto,
    markDayOff,
    removeDayOff
  } = useMasterData(masterId);
  
  const {
    appointments,
    loading: appointmentsLoading,
    error: appointmentsError,
    createBooking,
    createCustomBooking,
    updateAppointment,
    deleteAppointment,
    blockTime,
    getAvailableSlots
  } = useAppointments(masterId);
  
  const {
    services,
    loading: servicesLoading,
    error: servicesError,
    createService,
    updateService,
    deleteService
  } = useServices(masterId);
  
  // Состояния компонента
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [selectedBooking, setSelectedBooking] = useState(null);
  const [isDayOff, setIsDayOff] = useState(false);
  
  // Состояния модальных окон
  const [showBlockTimeForm, setShowBlockTimeForm] = useState(false);
  const [showCustomBookingForm, setShowCustomBookingForm] = useState(false);
  const [showBookingOptionsForm, setShowBookingOptionsForm] = useState(false);
  const [showWorkScheduleForm, setShowWorkScheduleForm] = useState(false);
  
  // Проверяем, является ли текущий день выходным
  const checkIfDayOff = (date) => {
    if (!masterData?.daysOff) return false;
    
    const dateStr = date.toISOString().split('T')[0];
    return masterData.daysOff.includes(dateStr);
  };
  
  // Обработчики событий
  const handleDateChange = (date) => {
    setSelectedDate(date);
    setIsDayOff(checkIfDayOff(date));
  };
  
  const handleBookingClick = (booking) => {
    setSelectedBooking(booking);
  };
  
  const handleToggleDayOff = async () => {
    try {
      const dateStr = selectedDate.toISOString().split('T')[0];
      
      if (isDayOff) {
        await removeDayOff(dateStr);
        showSuccess('Выходной день отменен');
      } else {
        await markDayOff(dateStr);
        showSuccess('День отмечен как выходной');
      }
      
      setIsDayOff(!isDayOff);
    } catch (error) {
      showError('Ошибка при изменении статуса дня: ' + error.message);
    }
  };
  
  const handleBlockTime = async (blockData) => {
    try {
      await blockTime({
        ...blockData,
        date: selectedDate.toISOString().split('T')[0]
      });
      setShowBlockTimeForm(false);
      showSuccess('Время успешно заблокировано');
    } catch (error) {
      showError('Ошибка при блокировке времени: ' + error.message);
    }
  };
  
  const handleCreateCustomBooking = async (bookingData) => {
    try {
      await createCustomBooking({
        ...bookingData,
        date: selectedDate.toISOString().split('T')[0]
      });
      setShowCustomBookingForm(false);
      showSuccess('Бронирование успешно создано');
    } catch (error) {
      showError('Ошибка при создании бронирования: ' + error.message);
    }
  };
  
  const handleDeleteBooking = async (type, id) => {
    try {
      await deleteAppointment(type, id);
      setSelectedBooking(null);
      showSuccess('Бронирование успешно удалено');
    } catch (error) {
      showError('Ошибка при удалении бронирования: ' + error.message);
    }
  };
  
  const handleUpdateSchedule = async (scheduleData) => {
    try {
      await updateSchedule(scheduleData);
      setShowWorkScheduleForm(false);
      showSuccess('Расписание успешно обновлено');
    } catch (error) {
      showError('Ошибка при обновлении расписания: ' + error.message);
    }
  };
  
  const handlePhotoUpload = async (formData) => {
    try {
      await uploadPhoto(formData);
      showSuccess('Фото успешно обновлено');
    } catch (error) {
      showError('Ошибка при загрузке фото: ' + error.message);
    }
  };
  
  // Индикация загрузки
  if (masterLoading || appointmentsLoading || servicesLoading) {
    return <div className="loading-spinner">Загрузка...</div>;
  }
  
  // Обработка ошибок
  if (masterError || appointmentsError || servicesError) {
    return (
      <div className="error-container">
        <h2>Ошибка при загрузке данных</h2>
        <p>{masterError || appointmentsError || servicesError}</p>
        <button onClick={() => window.location.reload()}>Попробовать снова</button>
      </div>
    );
  }
  
  // Если данные мастера не найдены
  if (!masterData) {
    return (
      <div className="not-found">
        <h2>Мастер не найден</h2>
        <p>Проверьте URL или войдите в систему</p>
      </div>
    );
  }
  
  return (
    <div className="master-profile-page">
      <MasterHeader 
        master={masterData} 
        onPhotoUpload={handlePhotoUpload} 
      />
      
      <div className="profile-actions">
        <button 
          className="action-button" 
          onClick={() => setShowWorkScheduleForm(true)}
        >
          Настроить расписание
        </button>
        
        <button 
          className={`action-button ${isDayOff ? 'day-off-active' : ''}`}
          onClick={handleToggleDayOff}
        >
          {isDayOff ? 'Отменить выходной' : 'Отметить выходной'}
        </button>
        
        <button 
          className="action-button"
          onClick={() => setShowBlockTimeForm(true)}
        >
          Блокировать время
        </button>
        
        <button 
          className="action-button"
          onClick={() => setShowCustomBookingForm(true)}
        >
          Создать бронирование
        </button>
      </div>
      
      <div className="profile-content">
        <div className="calendar-container">
          <MasterCalendar 
            selectedDate={selectedDate}
            onDateChange={handleDateChange}
            appointments={appointments}
            onBookingClick={handleBookingClick}
            isDayOff={isDayOff}
          />
        </div>
        
        <div className="service-manager-container">
          <ServiceManager 
            services={services}
            onCreate={createService}
            onUpdate={updateService}
            onDelete={deleteService}
          />
        </div>
        
        <div className="booking-manager-container">
          <MasterBookingManager 
            appointments={appointments}
            onBookingClick={handleBookingClick}
            selectedDate={selectedDate}
          />
        </div>
      </div>
      
      {/* Модальные окна */}
      {selectedBooking && (
        <BookingDetailsModal 
          booking={selectedBooking}
          onClose={() => setSelectedBooking(null)}
          onDelete={handleDeleteBooking}
          onUpdate={(type, id, data) => updateAppointment(type, id, data)}
          onOptionsClick={() => setShowBookingOptionsForm(true)}
        />
      )}
      
      {showBlockTimeForm && (
        <BlockTimeForm 
          onSubmit={handleBlockTime}
          onClose={() => setShowBlockTimeForm(false)}
          date={selectedDate}
          masterId={masterId}
        />
      )}
      
      {showCustomBookingForm && (
        <CustomBookingForm 
          onSubmit={handleCreateCustomBooking}
          onClose={() => setShowCustomBookingForm(false)}
          date={selectedDate}
          services={services}
          masterId={masterId}
          getAvailableSlots={getAvailableSlots}
        />
      )}
      
      {showBookingOptionsForm && selectedBooking && (
        <BookingOptionsModal 
          booking={selectedBooking}
          onClose={() => setShowBookingOptionsForm(false)}
          onUpdateBooking={(data) => {
            updateAppointment(
              selectedBooking.type || 'booking',
              selectedBooking._id,
              data
            );
            setShowBookingOptionsForm(false);
          }}
        />
      )}
      
      {showWorkScheduleForm && (
        <WorkScheduleForm 
          initialSchedule={masterData.workSchedule || {}}
          onSubmit={handleUpdateSchedule}
          onClose={() => setShowWorkScheduleForm(false)}
        />
      )}
    </div>
  );
};

export default MasterProfilePage;
