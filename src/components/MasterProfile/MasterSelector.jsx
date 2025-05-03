import React, { useState } from "react";
import "./MasterSelector.css";

function MasterSelector({ masters, selectedMasterId, onMasterSelect }) {
  const [searchTerm, setSearchTerm] = useState("");
  
  
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