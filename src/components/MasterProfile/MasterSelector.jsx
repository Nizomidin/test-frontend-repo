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
      
      
    </div>
  );
}

export default MasterSelector;