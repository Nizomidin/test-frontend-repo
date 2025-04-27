import React, { useState, useEffect } from 'react';
import './BookingHistory.css';

// Примерные данные для демонстрации
// В реальном приложении эти данные будут получены через API
const mockBookings = [
  {
    id: 1,
    service: "Маникюр классический",
    category: "Ногти",
    master: "Анна Петрова",
    date: "2025-04-28",
    time: "14:00",
    duration: 60,
    price: 1500,
    status: "confirmed"
  },
  {
    id: 2,
    service: "Стрижка женская",
    category: "Волосы",
    master: "Иван Сергеев",
    date: "2025-04-30",
    time: "12:30",
    duration: 90,
    price: 2000,
    status: "pending"
  },
  {
    id: 3,
    service: "Педикюр",
    category: "Ногти",
    master: "Мария Иванова",
    date: "2025-05-05",
    time: "16:00",
    duration: 90,
    price: 2200,
    status: "confirmed"
  },
  {
    id: 4,
    service: "Окрашивание волос",
    category: "Волосы",
    master: "Елена Кузнецова",
    date: "2025-04-15",
    time: "10:00",
    duration: 120,
    price: 3500,
    status: "completed"
  },
  {
    id: 5,
    service: "Массаж спины",
    category: "Тело",
    master: "Дмитрий Соколов",
    date: "2025-04-10",
    time: "15:30",
    duration: 60,
    price: 2800,
    status: "canceled"
  }
];

const BookingHistory = () => {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeFilter, setActiveFilter] = useState('all');

  useEffect(() => {
    // Имитация загрузки данных с сервера
    const fetchBookings = async () => {
      try {
        setLoading(true);
        // Имитация задержки сети
        await new Promise(resolve => setTimeout(resolve, 800));
        setBookings(mockBookings);
        setLoading(false);
      } catch (err) {
        setError('Не удалось загрузить историю бронирований');
        setLoading(false);
      }
    };

    fetchBookings();
  }, []);

  const handleCancelBooking = (id) => {
    // В реальном приложении здесь будет вызов API для отмены бронирования
    setBookings(prevBookings =>
      prevBookings.map(booking =>
        booking.id === id ? { ...booking, status: 'canceled' } : booking
      )
    );
  };

  const filteredBookings = bookings.filter(booking => {
    if (activeFilter === 'all') return true;
    return booking.status === activeFilter;
  });

  const renderStatusText = (status) => {
    switch (status) {
      case 'confirmed': return 'Подтверждено';
      case 'pending': return 'Ожидает подтверждения';
      case 'canceled': return 'Отменено';
      case 'completed': return 'Завершено';
      default: return status;
    }
  };

  const formatDate = (dateStr) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('ru-RU', {
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    });
  };

  if (loading) {
    return <div className="loading">Загрузка истории бронирований...</div>;
  }

  if (error) {
    return <div className="error-message">{error}</div>;
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
          className={`filter-tab ${activeFilter === 'confirmed' ? 'active' : ''}`}
          onClick={() => setActiveFilter('confirmed')}
        >
          Подтвержденные
        </button>
        <button 
          className={`filter-tab ${activeFilter === 'pending' ? 'active' : ''}`}
          onClick={() => setActiveFilter('pending')}
        >
          Ожидающие
        </button>
        <button 
          className={`filter-tab ${activeFilter === 'completed' ? 'active' : ''}`}
          onClick={() => setActiveFilter('completed')}
        >
          Завершенные
        </button>
        <button 
          className={`filter-tab ${activeFilter === 'canceled' ? 'active' : ''}`}
          onClick={() => setActiveFilter('canceled')}
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
          {filteredBookings.map(booking => (
            <div key={booking.id} className="booking-card">
              <div className="booking-service">
                <h3>{booking.service}</h3>
                <p className="booking-category">{booking.category}</p>
              </div>
              
              <div className="booking-details">
                <p><span className="label">Мастер:</span> {booking.master}</p>
                <p><span className="label">Дата:</span> {formatDate(booking.date)}</p>
                <p><span className="label">Время:</span> {booking.time} ({booking.duration} мин.)</p>
                <p>
                  <span className="label">Статус:</span> 
                  <span className={`booking-status status-${booking.status}`}>
                    {renderStatusText(booking.status)}
                  </span>
                </p>
              </div>
              
              <div className="booking-price">
                {booking.price} ₽
              </div>
              
              {(booking.status === 'confirmed' || booking.status === 'pending') && (
                <button 
                  className="cancel-booking-btn"
                  onClick={() => handleCancelBooking(booking.id)}
                >
                  Отменить
                </button>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default BookingHistory;