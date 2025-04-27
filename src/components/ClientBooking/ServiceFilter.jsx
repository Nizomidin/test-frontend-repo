import React, { useState, useEffect } from 'react';
import './ServiceFilter.css';

const ServiceFilter = ({ onFilterChange }) => {
  const [filters, setFilters] = useState({
    search: '',
    category: '',
    duration: ''
  });

  const [categories, setCategories] = useState([]);

  // Симуляция загрузки категорий с API
  useEffect(() => {
    // В реальном приложении здесь будет запрос к API
    const fetchedCategories = [
      'Стрижки', 'Окрашивание', 'Маникюр', 'Педикюр', 'Массаж', 'Макияж', 'Уход за лицом'
    ];
    setCategories(fetchedCategories);
  }, []);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    
    setFilters(prev => ({
      ...prev,
      [name]: value
    }));
  };

  useEffect(() => {
    // Применяем фильтры не чаще чем раз в 500 мс
    const timer = setTimeout(() => {
      onFilterChange(filters);
    }, 500);
    
    return () => clearTimeout(timer);
  }, [filters, onFilterChange]);

  const resetFilters = () => {
    setFilters({
      search: '',
      category: '',
      duration: ''
    });
  };

  return (
    <div className="service-filter">
      <h3>Фильтры</h3>
      
      <div className="filter-section">
        <div className="filter-item">
          <label htmlFor="search">Поиск по названию</label>
          <input
            type="text"
            id="search"
            name="search"
            value={filters.search}
            onChange={handleInputChange}
            placeholder="Введите название услуги"
            className="form-control"
          />
        </div>

        <div className="filter-item">
          <label htmlFor="category">Категория</label>
          <select
            id="category"
            name="category"
            value={filters.category}
            onChange={handleInputChange}
            className="form-control"
          >
            <option value="">Все категории</option>
            {categories.map((category, index) => (
              <option key={index} value={category}>{category}</option>
            ))}
          </select>
        </div>
        
        <div className="filter-item">
          <label htmlFor="duration">Длительность (мин)</label>
          <select
            id="duration"
            name="duration"
            value={filters.duration}
            onChange={handleInputChange}
            className="form-control"
          >
            <option value="">Любая</option>
            <option value="30">До 30 минут</option>
            <option value="60">30-60 минут</option>
            <option value="90">60-90 минут</option>
            <option value="120">Более 90 минут</option>
          </select>
        </div>
      </div>
      
      <button className="btn btn-outline-secondary" onClick={resetFilters}>
        Сбросить фильтры
      </button>
    </div>
  );
};

export default ServiceFilter;