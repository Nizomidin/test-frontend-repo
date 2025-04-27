import React from 'react';
import './ServiceList.css';

const ServiceList = ({ services, onSelectService }) => {
  if (!services || services.length === 0) {
    return (
      <div className="empty-services-message">
        <p>Услуги не найдены. Попробуйте изменить параметры фильтра.</p>
      </div>
    );
  }

  return (
    <div className="service-list">
      <h3>Доступные услуги</h3>
      <div className="services-grid">
        {services.map(service => (
          <div 
            key={service.id} 
            className="service-card card" 
            onClick={() => onSelectService(service)}
          >
            {service.imageUrl && (
              <div className="service-image">
                <img src={service.imageUrl} alt={service.name} />
              </div>
            )}
            <div className="service-info">
              <h4>{service.name}</h4>
              <div className="service-meta">
                <span className="service-category">{service.category}</span>
                <span className="service-duration">{service.duration} мин.</span>
              </div>
              <p className="service-description">{service.description}</p>
              <div className="service-price">
                <strong>{service.price} ₽</strong>
              </div>
              <button 
                className="btn btn-primary book-button"
                onClick={(e) => {
                  e.stopPropagation(); // Предотвращаем двойной вызов из-за onClick на родителе
                  onSelectService(service);
                }}
              >
                Забронировать
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ServiceList;