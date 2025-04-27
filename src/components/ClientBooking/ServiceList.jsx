import React from 'react';
import './ServiceList.css';

const ServiceList = ({ services, onSelectService, masterInfo }) => {
  if (!services || services.length === 0) {
    return (
      <div className="empty-services-message">
        <p>Услуги не найдены.</p>
      </div>
    );
  }

  return (
    <div className="service-list">
      {masterInfo && (
        <div className="master-info">
          <div className="master-details">
            <h2>{`${masterInfo.first_name} ${masterInfo.last_name}`}</h2>
          </div>
        </div>
      )}
      
      <h3>Доступные услуги</h3>
      <div className="services-grid">
        {services.map(service => (
          <div 
            key={service.id} 
            className="service-card" 
            onClick={() => onSelectService(service)}
          >
            <div className="service-info">
              <h4>{service.service_name}</h4>
              <div className="service-duration">
                <span>{service.duration} мин.</span>
              </div>
              <button 
                className="btn book-button"
                onClick={(e) => {
                  e.stopPropagation(); // Предотвращаем двойной вызов из-за onClick на родителе
                  onSelectService(service);
                }}
              >
                Выбрать
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ServiceList;