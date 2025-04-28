import React, { useState } from 'react';
import './ServiceList.css';

const API_BASE = "https://api.kuchizu.online";

// Компонент фото мастера с запасным вариантом, если фото нет
const MasterPhoto = ({ photoUrl, name }) => {
  const [hasError, setHasError] = useState(false);
  const fullPhotoUrl = photoUrl ? `${API_BASE}${photoUrl}` : null;

  return (
    <div className="master-photo-container">
      {!hasError && fullPhotoUrl ? (
        <img 
          src={fullPhotoUrl} 
          alt={name} 
          className="master-photo" 
          onError={() => setHasError(true)}
        />
      ) : (
        <div className="master-photo-placeholder">
          <span>{name && name[0]}</span>
        </div>
      )}
    </div>
  );
};

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
          <MasterPhoto 
            photoUrl={masterInfo.photo_url}
            name={`${masterInfo.first_name} ${masterInfo.last_name}`}
          />
          <div className="master-details">
            <h2>{`${masterInfo.first_name} ${masterInfo.last_name}`}</h2>
            {masterInfo.service_category && (
              <p className="master-specialty">{masterInfo.service_category}</p>
            )}
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