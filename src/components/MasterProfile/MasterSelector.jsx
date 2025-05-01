import React, { useState } from "react";
import "./MasterSelector.css";

function MasterSelector({ masters, selectedMasterId, onMasterSelect }) {
  const [searchTerm, setSearchTerm] = useState("");
  
  // Фильтрация мастеров по поисковому запросу с проверкой на undefined
  const filteredMasters = masters.filter(master => {
    // Создаем отображаемое имя мастера, используя доступные поля
    const masterName = master.name || `${master.first_name || ''} ${master.last_name || ''}`.trim() || 'Мастер без имени';
    
    return searchTerm === '' || masterName.toLowerCase().includes(searchTerm.toLowerCase());
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
          >
            ×
          </button>
        )}
      </div>
      
      <div className="masters-list">
        {filteredMasters.length > 0 ? (
          filteredMasters.map((master) => {
            // Создаем отображаемое имя мастера для карточки
            const displayName = master.name || `${master.first_name || ''} ${master.last_name || ''}`.trim() || 'Мастер без имени';
            // Получаем первую букву имени для аватара
            const firstLetter = displayName.charAt(0).toUpperCase();
            
            return (
              <div
                key={master.id}
                className={`master-card ${selectedMasterId === master.id ? "selected" : ""}`}
                onClick={() => onMasterSelect(master.id)}
              >
                <div className="master-avatar">
                  {master.avatar ? (
                    <img src={master.avatar} alt={displayName} />
                  ) : (
                    <div className="avatar-placeholder">
                      {firstLetter}
                    </div>
                  )}
                </div>
                <div className="master-info">
                  <h3 className="master-name">{displayName}</h3>
                  <p className="master-specialization">{master.specialization || master.service_category || "Специалист"}</p>
                </div>
              </div>
            );
          })
        ) : (
          <div className="no-masters">
            {searchTerm ? (
              <p>Мастеров по запросу "{searchTerm}" не найдено</p>
            ) : (
              <p>Список мастеров пуст</p>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

export default MasterSelector;