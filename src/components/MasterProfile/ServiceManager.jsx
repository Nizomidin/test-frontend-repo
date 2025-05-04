import React, { useState, useEffect } from "react";
import { useToast } from "../Toast/ToastContext";
import "./ServiceManager.css";

const API_BASE = "https://api.kuchizu.online";

function ServiceManager({ masterId }) {
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [editingService, setEditingService] = useState(null);
  const [showAddForm, setShowAddForm] = useState(false);
  const [newService, setNewService] = useState({ service_name: "", duration: 30 });
  const { showSuccess, showError } = useToast();

  // Загрузка услуг мастера
  useEffect(() => {
    if (!masterId) return;
    
    const fetchServices = async () => {
      setLoading(true);
      try {
        const response = await fetch(`${API_BASE}/services?master_id=${masterId}`, {
          headers: {
            accept: "application/json"
          }
        });

        if (!response.ok) {
          throw new Error("Не удалось загрузить список услуг");
        }

        const data = await response.json();
        setServices(data);
      } catch (err) {
        console.error("Ошибка при загрузке услуг:", err);
        setError(err.message);
        showError(`Ошибка при загрузке услуг: ${err.message}`);
      } finally {
        setLoading(false);
      }
    };

    fetchServices();
  }, [masterId, showError]);

  // Обработчик изменения полей формы создания
  const handleNewServiceChange = (e) => {
    const { name, value } = e.target;
    setNewService((prev) => ({
      ...prev,
      [name]: name === "duration" ? Number(value) : value,
    }));
  };

  // Обработчик создания новой услуги
  const handleCreateService = async (e) => {
    e.preventDefault();
    
    if (!newService.service_name.trim()) {
      showError("Название услуги не может быть пустым");
      return;
    }

    try {
      const response = await fetch(`${API_BASE}/services?master_id=${masterId}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          accept: "application/json"
        },
        body: JSON.stringify(newService)
      });

      if (!response.ok) {
        throw new Error("Не удалось создать услугу");
      }

      const createdService = await response.json();
      setServices([...services, createdService]);
      setNewService({ service_name: "", duration: 30 });
      setShowAddForm(false);
      showSuccess("Услуга успешно создана");
    } catch (err) {
      console.error("Ошибка при создании услуги:", err);
      showError(`Ошибка при создании услуги: ${err.message}`);
    }
  };

  // Обработчик изменения полей формы редактирования
  const handleEditChange = (e) => {
    const { name, value } = e.target;
    setEditingService((prev) => ({
      ...prev,
      [name]: name === "duration" ? Number(value) : value,
    }));
  };

  // Обработчик обновления услуги
  const handleUpdateService = async (e) => {
    e.preventDefault();
    
    if (!editingService.service_name.trim()) {
      showError("Название услуги не может быть пустым");
      return;
    }

    try {
      const response = await fetch(`${API_BASE}/services/${editingService.id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          accept: "application/json"
        },
        body: JSON.stringify({
          service_name: editingService.service_name,
          duration: editingService.duration
        })
      });

      if (!response.ok) {
        throw new Error("Не удалось обновить услугу");
      }

      const updatedService = await response.json();
      setServices(services.map(service => 
        service.id === updatedService.id ? updatedService : service
      ));
      setEditingService(null);
      showSuccess("Услуга успешно обновлена");
    } catch (err) {
      console.error("Ошибка при обновлении услуги:", err);
      showError(`Ошибка при обновлении услуги: ${err.message}`);
    }
  };

  // Обработчик удаления услуги
  const handleDeleteService = async (serviceId) => {
    if (!window.confirm("Вы уверены, что хотите удалить эту услугу?")) {
      return;
    }

    try {
      const response = await fetch(`${API_BASE}/services/${serviceId}`, {
        method: "DELETE",
        headers: {
          accept: "/"
        }
      });

      if (!response.ok) {
        throw new Error("Не удалось удалить услугу");
      }

      setServices(services.filter(service => service.id !== serviceId));
      showSuccess("Услуга успешно удалена");
    } catch (err) {
      console.error("Ошибка при удалении услуги:", err);
      showError(`Ошибка при удалении услуги: ${err.message}`);
    }
  };

  // Обработчик начала редактирования
  const handleStartEdit = (service) => {
    setEditingService({ ...service });
  };

  // Обработчик отмены редактирования
  const handleCancelEdit = () => {
    setEditingService(null);
  };

  // Обработчик отмены создания
  const handleCancelAdd = () => {
    setShowAddForm(false);
    setNewService({ service_name: "", duration: 30 });
  };

  if (loading) {
    return <div className="service-manager loading">Загрузка услуг...</div>;
  }

  if (error) {
    return <div className="service-manager error">Ошибка: {error}</div>;
  }

  return (
    <div className="service-manager">
      <div className="service-manager-header">
        <h2>Управление услугами</h2>
        {!showAddForm && (
          <button 
            className="add-service-btn" 
            onClick={() => setShowAddForm(true)}
          >
            Добавить услугу
          </button>
        )}
      </div>

      {showAddForm && (
        <div className="service-form-container">
          <h3>Добавить новую услугу</h3>
          <form className="service-form" onSubmit={handleCreateService}>
            <div className="form-group">
              <label htmlFor="service_name">Название услуги</label>
              <input
                type="text"
                id="service_name"
                name="service_name"
                value={newService.service_name}
                onChange={handleNewServiceChange}
                placeholder="Введите название услуги"
                required
              />
            </div>
            <div className="form-group">
              <label htmlFor="duration">Длительность (минуты)</label>
              <input
                type="number"
                id="duration"
                name="duration"
                value={newService.duration}
                onChange={handleNewServiceChange}
                min="5"
                step="5"
                required
              />
            </div>
            <div className="form-actions">
              <button type="submit" className="save-btn">Сохранить</button>
              <button type="button" className="cancel-btn" onClick={handleCancelAdd}>Отмена</button>
            </div>
          </form>
        </div>
      )}

      {services.length === 0 && !showAddForm ? (
        <div className="no-services-message">
          У мастера пока нет добавленных услуг. Нажмите "Добавить услугу", чтобы создать новую.
        </div>
      ) : (
        <div className="services-list">
          {services.map((service) => (
            <div key={service.id} className="service-card">
              {editingService && editingService.id === service.id ? (
                <form className="edit-form" onSubmit={handleUpdateService}>
                  <div className="form-group">
                    <label htmlFor={`edit_name_${service.id}`}>Название</label>
                    <input
                      type="text"
                      id={`edit_name_${service.id}`}
                      name="service_name"
                      value={editingService.service_name}
                      onChange={handleEditChange}
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label htmlFor={`edit_duration_${service.id}`}>Длительность (мин)</label>
                    <input
                      type="number"
                      id={`edit_duration_${service.id}`}
                      name="duration"
                      value={editingService.duration}
                      onChange={handleEditChange}
                      min="5"
                      step="5"
                      required
                    />
                  </div>
                  <div className="edit-actions">
                    <button type="submit" className="save-btn">Сохранить</button>
                    <button type="button" className="cancel-btn" onClick={handleCancelEdit}>Отмена</button>
                  </div>
                </form>
              ) : (
                <>
                  <h3 className="service-name">{service.service_name}</h3>
                  <div className="service-duration">
                    <span className="duration-label">Длительность:</span> {service.duration} мин
                  </div>
                  <div className="service-actions">
                    <button 
                      className="edit-btn" 
                      onClick={() => handleStartEdit(service)}
                    >
                      Изменить
                    </button>
                    <button 
                      className="delete-btn" 
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
}

export default ServiceManager;