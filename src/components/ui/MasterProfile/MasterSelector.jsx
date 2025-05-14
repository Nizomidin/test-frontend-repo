/**
 * Компонент выбора мастера
 */
import React, { useState } from 'react';
import './MasterSelector.css';

/**
 * Компонент для выбора мастера из списка
 * @param {Object} props - Свойства компонента
 * @param {Array} props.masters - Список мастеров
 * @param {string} props.selectedMasterId - ID выбранного мастера
 * @param {Function} props.onMasterSelect - Обработчик выбора мастера
 */
const MasterSelector = ({ masters = [], selectedMasterId, onMasterSelect }) => {
  const [searchTerm, setSearchTerm] = useState("");
  
  // Фильтруем мастеров по поисковому запросу
  const filteredMasters = masters.filter(master => {
    const fullName = `${master.first_name} ${master.last_name}`.toLowerCase();
    return fullName.includes(searchTerm.toLowerCase());
  });
  
  return (
    <div className="master-selector">
      <div className="search-container">
        <input
          type="text"
          className="search-input"
          placeholder="Поиск мастера..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
        {searchTerm && (
          <button 
            className="clear-search-btn" 
            onClick={() => setSearchTerm("")}
            aria-label="Очистить поиск"
          >
            ×
          </button>
        )}
      </div>
      
      <div className="masters-list">
        {filteredMasters.length > 0 ? (
          filteredMasters.map((master) => (
            <div
              key={master.id}
              className={`master-item ${selectedMasterId === master.id ? 'selected' : ''}`}
              onClick={() => onMasterSelect(master.id)}
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
                <div className="master-services">
                  {master.services_count || 0} услуг
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="no-masters-message">
            {searchTerm 
              ? `Мастеров по запросу "${searchTerm}" не найдено` 
              : "Список мастеров пуст"}
          </div>
        )}
      </div>
    </div>
  );
};

export default MasterSelector;
