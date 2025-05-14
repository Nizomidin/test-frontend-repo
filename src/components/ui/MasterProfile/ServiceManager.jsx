/**
 * Компонент управления услугами мастера
 */
import React, { useState } from 'react';
import './ServiceManager.css';

/**
 * Компонент для управления услугами мастера
 * @param {Object} props - Свойства компонента
 * @param {Array} props.services - Список услуг мастера
 * @param {boolean} props.loading - Флаг загрузки данных
 * @param {string|null} props.error - Ошибка, если есть
 * @param {Function} props.onCreateService - Функция создания услуги
 * @param {Function} props.onUpdateService - Функция обновления услуги
 * @param {Function} props.onDeleteService - Функция удаления услуги
 */
const ServiceManager = ({ 
  services = [], 
  loading = false, 
  error = null,
  onCreateService,
  onUpdateService,
  onDeleteService
}) => {
  const [editingService, setEditingService] = useState(null);
  const [showAddForm, setShowAddForm] = useState(false);
  const [newService, setNewService] = useState({
    service_name: "",
    duration: 30,
  });

  // Обработчики форм
  const handleNewServiceChange = (e) => {
    const { name, value } = e.target;
    setNewService((prev) => ({
      ...prev,
      [name]: name === "duration" ? Number(value) : value,
    }));
  };

  const handleCreateService = async (e) => {
    e.preventDefault();
    if (!newService.service_name.trim()) {
      return;
    }
    
    try {
      await onCreateService(newService);
      setNewService({ service_name: "", duration: 30 });
      setShowAddForm(false);
    } catch (err) {
      console.error(err);
    }
  };

  const handleEditChange = (e) => {
    const { name, value } = e.target;
    setEditingService((prev) => ({
      ...prev,
      [name]: name === "duration" ? Number(value) : value,
    }));
  };

  const handleUpdateService = async (e) => {
    e.preventDefault();
    if (!editingService.service_name.trim()) {
      return;
    }
    
    try {
      await onUpdateService(editingService.id, {
        service_name: editingService.service_name,
        duration: editingService.duration,
      });
      setEditingService(null);
    } catch (err) {
      console.error(err);
    }
  };

  const handleDeleteService = async (id) => {
    if (!window.confirm("Вы уверены, что хотите удалить эту услугу?")) return;
    
    try {
      await onDeleteService(id);
    } catch (err) {
      console.error(err);
    }
  };

  const handleStartEdit = (service) => setEditingService({ ...service });
  const handleCancelEdit = () => setEditingService(null);
  const handleCancelAdd = () => {
    setShowAddForm(false);
    setNewService({ service_name: "", duration: 30 });
  };

  if (loading) {
    return (
      <div className="sm-service-manager sm-loading">Загрузка услуг...</div>
    );
  }
  
  if (error) {
    return <div className="sm-service-manager sm-error">Ошибка: {error}</div>;
  }

  return (
    <div className="sm-service-manager">
      <div className="sm-service-manager-header">
        <h2>Управление услугами</h2>
        {!showAddForm && (
          <button
            className="sm-add-service-btn"
            onClick={() => setShowAddForm(true)}
          >
             Добавить услугу
          </button>
        )}
      </div>

      {showAddForm && (
        <div className="sm-service-form-container">
          <h3>Добавить новую услугу</h3>
          <form className="sm-service-form" onSubmit={handleCreateService}>
            <div className="sm-form-group">
              <label htmlFor="service_name">Название услуги</label>
              <input
                id="service_name"
                name="service_name"
                type="text"
                value={newService.service_name}
                onChange={handleNewServiceChange}
                placeholder="Введите название услуги"
                required
              />
            </div>
            <div className="sm-form-group">
              <label htmlFor="duration">Длительность (минуты)</label>
              <input
                id="duration"
                name="duration"
                type="number"
                value={newService.duration}
                onChange={handleNewServiceChange}
                min="5"
                step="5"
                required
              />
            </div>
            <div className="sm-form-actions">
              <button type="submit" className="sm-save-btn">
                Сохранить
              </button>
              <button
                type="button"
                className="sm-cancel-btn"
                onClick={handleCancelAdd}
              >
                Отмена
              </button>
            </div>
          </form>
        </div>
      )}

      {services.length === 0 && !showAddForm ? (
        <div className="sm-no-services-message">
          У мастера пока нет добавленных услуг. Нажмите «Добавить услугу», чтобы
          создать новую.
        </div>
      ) : (
        <div className="sm-services-list">
          {services.map((service) => (
            <div key={service.id} className="sm-service-card">
              {editingService && editingService.id === service.id ? (
                <form className="sm-edit-form" onSubmit={handleUpdateService}>
                  <div className="sm-form-group">
                    <label htmlFor={`edit_name_${service.id}`}>Название</label>
                    <input
                      id={`edit_name_${service.id}`}
                      name="service_name"
                      type="text"
                      value={editingService.service_name}
                      onChange={handleEditChange}
                      required
                    />
                  </div>
                  <div className="sm-form-group">
                    <label htmlFor={`edit_duration_${service.id}`}>
                      Длительность (мин)
                    </label>
                    <input
                      id={`edit_duration_${service.id}`}
                      name="duration"
                      type="number"
                      value={editingService.duration}
                      onChange={handleEditChange}
                      min="5"
                      step="5"
                      required
                    />
                  </div>
                  <div className="sm-edit-actions">
                    <button type="submit" className="sm-save-btn">
                      Сохранить
                    </button>
                    <button
                      type="button"
                      className="sm-cancel-btn"
                      onClick={handleCancelEdit}
                    >
                      Отмена
                    </button>
                  </div>
                </form>
              ) : (
                <>
                  <div className="sm-service-info">
                    <h3 className="sm-service-name">{service.service_name}</h3>
                    <div className="sm-service-duration">
                      <span className="sm-duration-label">Длительность:</span>{" "}
                      {service.duration} мин
                    </div>
                  </div>
                  <div className="sm-service-actions">
                    <button
                      className="sm-edit-btn"
                      onClick={() => handleStartEdit(service)}
                    >
                      Изменить
                    </button>
                    <button
                      className="sm-delete-btn"
                      onClick={() => handleDeleteService(service.id)}
                    >
                      Удалить
                    </button>
                  </div>
                </>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default ServiceManager;
