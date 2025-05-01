import React, { useState, useEffect } from "react";
import "./MasterBookingManager.css";
import MasterSelector from "./MasterSelector";

function MasterBookingManager({ currentMasterId }) {
  const [selectedMasterId, setSelectedMasterId] = useState(null);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [bookings, setBookings] = useState([]);
  const [services, setServices] = useState([]);
  const [allMasters, setAllMasters] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [showBookingForm, setShowBookingForm] = useState(false);
  const [formData, setFormData] = useState({
    service_id: "",
    client_name: "",
    appointment_datetime: "",
    comment: "",
  });
  const [availableTimeSlots, setAvailableTimeSlots] = useState([]);
  const [selectedTimeSlot, setSelectedTimeSlot] = useState(null);

  // Загрузка списка всех мастеров компании
  useEffect(() => {
    const fetchMasters = async () => {
      setIsLoading(true);
      try {
        const response = await fetch("https://api.kuchizu.online/masters");
        if (!response.ok) {
          throw new Error("Не удалось загрузить список мастеров");
        }
        const data = await response.json();
        // Фильтруем мастеров - убираем текущего мастера из списка
        const filteredMasters = data.filter(
          (master) => master.id !== currentMasterId
        );
        setAllMasters(filteredMasters);
      } catch (err) {
        console.error("Ошибка при загрузке списка мастеров:", err);
        setError(err.message);
      } finally {
        setIsLoading(false);
      }
    };

    fetchMasters();
  }, [currentMasterId]);

  // Загрузка услуг выбранного мастера
  useEffect(() => {
    if (!selectedMasterId) return;

    const fetchServices = async () => {
      setIsLoading(true);
      try {
        const response = await fetch(
          `https://api.kuchizu.online/services?master_id=${selectedMasterId}`
        );
        if (!response.ok) {
          throw new Error("Не удалось загрузить услуги");
        }
        const data = await response.json();
        setServices(data);
      } catch (err) {
        console.error("Ошибка при загрузке услуг:", err);
        setError(err.message);
      } finally {
        setIsLoading(false);
      }
    };

    fetchServices();
  }, [selectedMasterId]);

  // Загрузка бронирований на выбранную дату для выбранного мастера
  useEffect(() => {
    if (!selectedMasterId) return;

    const fetchBookings = async () => {
      setIsLoading(true);
      try {
        const response = await fetch("https://api.kuchizu.online/appointments");
        if (!response.ok) {
          throw new Error("Не удалось загрузить данные о бронированиях");
        }
        const data = await response.json();
        const filteredData = data.filter(
          (item) => 
            item.master_id === selectedMasterId && 
            new Date(item.appointment_datetime).toDateString() === selectedDate.toDateString()
        );
        setBookings(filteredData);
      } catch (err) {
        console.error("Ошибка при загрузке бронирований:", err);
        setError(err.message);
      } finally {
        setIsLoading(false);
      }
    };

    fetchBookings();
  }, [selectedMasterId, selectedDate]);

  // Загрузка доступных слотов времени
  const fetchAvailableSlots = async () => {
    if (!selectedMasterId || !formData.service_id) return;
    
    const dateStr = formatDateForApi(selectedDate);
    setIsLoading(true);
    
    try {
      const response = await fetch(
        `https://api.kuchizu.online/masters/${selectedMasterId}/available?date=${dateStr}`,
        { headers: { accept: "application/json" } }
      );
      
      if (!response.ok) {
        if (response.status === 404) {
          // Если у мастера выходной
          setAvailableTimeSlots([]);
          return;
        }
        throw new Error("Ошибка загрузки интервалов");
      }
      
      const data = await response.json();
      
      // Фильтрация слотов для выбранной услуги
      const selectedService = services.find(s => s.id === formData.service_id);
      if (selectedService) {
        const filteredSlots = data.filter(
          slot => slot.service === selectedService.service_name
        );
        setAvailableTimeSlots(filteredSlots);
      } else {
        setAvailableTimeSlots([]);
      }
    } catch (err) {
      console.error("Ошибка при загрузке доступных слотов:", err);
    } finally {
      setIsLoading(false);
    }
  };

  // Функция форматирования даты для API
  const formatDateForApi = (date) => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
  };

  // Обработчик изменения выбранного мастера
  const handleMasterChange = (masterId) => {
    setSelectedMasterId(masterId);
    // Сбрасываем форму и выбранные слоты
    setShowBookingForm(false);
    setFormData({
      service_id: "",
      client_name: "",
      appointment_datetime: "",
      comment: "",
    });
    setSelectedTimeSlot(null);
  };

  // Обработчик нажатия кнопки "Записаться"
  const handleBookButtonClick = () => {
    setShowBookingForm(true);
  };

  // Обработчик изменения полей формы
  const handleFormChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
    
    if (name === 'service_id') {
      // При смене услуги сбрасываем выбранный слот
      setSelectedTimeSlot(null);
      setFormData(prev => ({
        ...prev,
        appointment_datetime: ""
      }));
      // И загружаем новые доступные слоты
      setTimeout(fetchAvailableSlots, 0);
    }
  };

  // Обработчик выбора временного слота
  const handleTimeSlotSelect = (slot) => {
    setSelectedTimeSlot(slot);
    const appointmentDateTime = `${formatDateForApi(selectedDate)} ${slot.start_time}`;
    setFormData({
      ...formData,
      appointment_datetime: appointmentDateTime
    });
  };

  // Обработчик отправки формы бронирования
  const handleBookingSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.service_id || !formData.appointment_datetime) {
      setError("Пожалуйста, выберите услугу и время");
      return;
    }
    
    setIsLoading(true);
    try {
      const response = await fetch("https://api.kuchizu.online/appointments", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          accept: "application/json"
        },
        body: JSON.stringify({
          master_id: selectedMasterId,
          client_name: formData.client_name || "Запись от компании",
          service_id: formData.service_id,
          appointment_datetime: formData.appointment_datetime,
          status: "booked",
          comment: formData.comment
        })
      });
      
      if (!response.ok) {
        throw new Error("Ошибка при создании записи");
      }
      
      // Успешно создали запись
      alert("Запись успешно создана");
      // Сбрасываем форму
      setShowBookingForm(false);
      setFormData({
        service_id: "",
        client_name: "",
        appointment_datetime: "",
        comment: "",
      });
      setSelectedTimeSlot(null);
      
      // Обновляем список бронирований
      const bookingsResponse = await fetch("https://api.kuchizu.online/appointments");
      if (bookingsResponse.ok) {
        const data = await bookingsResponse.json();
        const filteredData = data.filter(
          (item) => 
            item.master_id === selectedMasterId && 
            new Date(item.appointment_datetime).toDateString() === selectedDate.toDateString()
        );
        setBookings(filteredData);
      }
    } catch (err) {
      console.error("Ошибка при создании записи:", err);
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  // Обработчик изменения даты
  const handleDateChange = (date) => {
    setSelectedDate(date);
    // Сбрасываем форму при смене даты
    if (showBookingForm) {
      setFormData({
        ...formData,
        appointment_datetime: ""
      });
      setSelectedTimeSlot(null);
      setTimeout(fetchAvailableSlots, 0);
    }
  };

  // Форматирование времени для отображения
  const formatTime = (dateStr) => {
    if (!dateStr) return "—";
    const date = new Date(dateStr);
    return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  };

  // Переход к предыдущему дню
  const prevDay = () => {
    const newDate = new Date(selectedDate);
    newDate.setDate(newDate.getDate() - 1);
    handleDateChange(newDate);
  };

  // Переход к следующему дню
  const nextDay = () => {
    const newDate = new Date(selectedDate);
    newDate.setDate(newDate.getDate() + 1);
    handleDateChange(newDate);
  };

  // Переход к текущему дню
  const goToToday = () => {
    handleDateChange(new Date());
  };

  return (
    <div className="master-booking-manager">
      <h2 className="manager-title">Запись к другим мастерам</h2>
      
      {isLoading && <div className="loading-indicator">Загрузка...</div>}
      {error && <div className="error-message">{error}</div>}
      
      <MasterSelector 
        masters={allMasters}
        selectedMasterId={selectedMasterId}
        onMasterSelect={handleMasterChange}
      />
      
      {selectedMasterId && (
        <>
          <div className="date-selector">
            <button onClick={prevDay} className="nav-button">
              ←
            </button>
            <div className="selected-date">
              {selectedDate.toLocaleDateString("ru-RU", {
                weekday: "long",
                day: "numeric",
                month: "long",
                year: "numeric"
              })}
            </div>
            <button onClick={nextDay} className="nav-button">
              →
            </button>
            <button onClick={goToToday} className="today-button">
              Сегодня
            </button>
          </div>
          
          <div className="bookings-section">
            <div className="section-header">
              <h3>Записи на {selectedDate.toLocaleDateString()}</h3>
              <button 
                onClick={handleBookButtonClick}
                className="book-button"
              >
                Записаться
              </button>
            </div>
            
            {bookings.length > 0 ? (
              <div className="bookings-list">
                {bookings.map((booking) => (
                  <div key={booking.id} className="booking-item">
                    <div className="booking-time">
                      {formatTime(booking.appointment_datetime)}
                    </div>
                    <div className="booking-info">
                      <div className="booking-title">
                        {services.find(s => s.id === booking.service_id)?.service_name || "Услуга"}
                      </div>
                      <div className="booking-client">
                        {booking.client_name || "Без имени"}
                      </div>
                      {booking.comment && (
                        <div className="booking-comment">{booking.comment}</div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="no-bookings">
                <p>На этот день нет записей.</p>
              </div>
            )}
          </div>
          
          {showBookingForm && (
            <div className="booking-form-container">
              <div className="form-header">
                <h3>Новая запись</h3>
                <button
                  onClick={() => setShowBookingForm(false)}
                  className="close-button"
                >
                  ×
                </button>
              </div>
              
              <form onSubmit={handleBookingSubmit} className="booking-form">
                <div className="form-group">
                  <label htmlFor="service">Услуга</label>
                  <select
                    id="service"
                    name="service_id"
                    value={formData.service_id}
                    onChange={handleFormChange}
                    required
                  >
                    <option value="">Выберите услугу</option>
                    {services.map((service) => (
                      <option key={service.id} value={service.id}>
                        {service.service_name} - {service.price} руб.
                      </option>
                    ))}
                  </select>
                </div>
                
                <div className="form-group">
                  <label htmlFor="client_name">Имя клиента</label>
                  <input
                    id="client_name"
                    name="client_name"
                    type="text"
                    value={formData.client_name}
                    onChange={handleFormChange}
                    placeholder="Имя клиента (необязательно)"
                  />
                </div>
                
                {formData.service_id && (
                  <div className="form-group">
                    <label>Доступное время</label>
                    <div className="time-slots-container">
                      {availableTimeSlots.length > 0 ? (
                        availableTimeSlots.map((slot, index) => (
                          <div
                            key={index}
                            className={`time-slot ${
                              selectedTimeSlot === slot ? "selected" : ""
                            }`}
                            onClick={() => handleTimeSlotSelect(slot)}
                          >
                            {slot.start_time} - {slot.end_time}
                          </div>
                        ))
                      ) : (
                        <p>Нет доступных слотов на выбранную дату</p>
                      )}
                    </div>
                  </div>
                )}
                
                <div className="form-group">
                  <label htmlFor="comment">Комментарий</label>
                  <textarea
                    id="comment"
                    name="comment"
                    value={formData.comment}
                    onChange={handleFormChange}
                    placeholder="Дополнительная информация"
                    rows="3"
                  />
                </div>
                
                <div className="form-actions">
                  <button
                    type="button"
                    className="cancel-button"
                    onClick={() => setShowBookingForm(false)}
                  >
                    Отмена
                  </button>
                  <button
                    type="submit"
                    className="submit-button"
                    disabled={!formData.service_id || !formData.appointment_datetime}
                  >
                    Забронировать
                  </button>
                </div>
              </form>
            </div>
          )}
        </>
      )}
    </div>
  );
}

export default MasterBookingManager;