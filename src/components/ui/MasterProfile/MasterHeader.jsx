/**
 * Компонент-заголовок с информацией о мастере
 */
import React, { useState } from 'react';
import './MasterHeader.css';
import { API_BASE } from '../../api/apiConfig';

/**
 * Компонент для отображения фото и основной информации о мастере
 * @param {Object} props - свойства компонента
 * @param {Object} props.master - данные мастера
 * @param {Function} props.onPhotoUpload - функция для загрузки нового фото
 */
const MasterHeader = ({ master, onPhotoUpload }) => {
  const [hasError, setHasError] = useState(false);
  const fullPhotoUrl = master?.photoUrl ? `${API_BASE}${master.photoUrl}` : null;

  const handleFileChange = (event) => {
    const file = event.target.files[0];
    if (!file) return;

    // Проверяем тип и размер файла
    if (!file.type.startsWith('image/')) {
      alert('Пожалуйста, выберите изображение');
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      alert('Размер файла не должен превышать 5МБ');
      return;
    }

    // Создаем FormData для отправки на сервер
    const formData = new FormData();
    formData.append('photo', file);
    
    onPhotoUpload(formData);
  };

  return (
    <div className="master-header">
      <div className="master-photo-container">
        {!hasError && fullPhotoUrl ? (
          <img 
            src={fullPhotoUrl} 
            alt={master?.firstName} 
            className="master-photo" 
            onError={() => setHasError(true)}
          />
        ) : (
          <div className="master-photo-placeholder">
            <span>{master?.firstName?.[0] || '?'}</span>
          </div>
        )}
        
        {/* Кнопка для загрузки нового фото */}
        {onPhotoUpload && (
          <div className="photo-upload-overlay">
            <label className="photo-upload-button">
              <input 
                type="file" 
                accept="image/*" 
                onChange={handleFileChange} 
                style={{ display: 'none' }}
              />
              <span>Изменить фото</span>
            </label>
          </div>
        )}
      </div>
      
      <div className="master-info">
        <h1 className="master-name">
          {master?.firstName} {master?.lastName}
        </h1>
        
        <div className="master-contacts">
          {master?.phoneNumber && (
            <div className="contact-item">
              <span className="contact-label">Телефон:</span>
              <a href={`tel:${master.phoneNumber}`} className="contact-value">
                {master.phoneNumber}
              </a>
            </div>
          )}
          
          {master?.telegramHandle && (
            <div className="contact-item">
              <span className="contact-label">Telegram:</span>
              <a 
                href={`https://t.me/${master.telegramHandle.replace('@', '')}`} 
                target="_blank" 
                rel="noopener noreferrer"
                className="contact-value"
              >
                {master.telegramHandle}
              </a>
            </div>
          )}
          
          {master?.address && (
            <div className="contact-item">
              <span className="contact-label">Адрес:</span>
              <span className="contact-value">{master.address}</span>
            </div>
          )}
        </div>
        
        {master?.companyName && (
          <div className="master-company">
            <span className="company-label">Компания:</span>
            <span className="company-name">{master.companyName}</span>
          </div>
        )}
        
        {master?.serviceCategory && (
          <div className="master-category">
            <span className="category-name">{master.serviceCategory}</span>
          </div>
        )}
      </div>
    </div>
  );
};

export default MasterHeader;
