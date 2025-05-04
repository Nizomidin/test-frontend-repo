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
  const [newService, setNewService] = useState({
    service_name: "",
    duration: 30,
  });
  const { showSuccess, showError } = useToast();

  // Загрузка услуг мастера
  useEffect(() => {
    if (!masterId) return;

    const fetchServices = async () => {
      setLoading(true);
      try {
        const response = await fetch(
          `${API_BASE}/services?master_id=${masterId}`,
          {
            headers: { accept: "application/json" },
          }
        );
        if (!response.ok) throw new Error("Не удалось загрузить список услуг");
        const data = await response.json();
        setServices(data);
      } catch (err) {
        console.error(err);
        setError(err.message);
        showError(`Ошибка при загрузке услуг: ${err.message}`);
      } finally {
        setLoading(false);
      }
    };

    fetchServices();
  }, [masterId, showError]);

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
      showError("Название услуги не может быть пустым");
      return;
    }
    try {
      const response = await fetch(
        `${API_BASE}/services?master_id=${masterId}`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            accept: "application/json",
          },
          body: JSON.stringify(newService),
        }
      );
      if (!response.ok) throw new Error("Не удалось создать услугу");
      const created = await response.json();
      setServices([...services, created]);
      setNewService({ service_name: "", duration: 30 });
      setShowAddForm(false);
      showSuccess("Услуга успешно создана");
    } catch (err) {
      console.error(err);
      showError(`Ошибка при создании услуги: ${err.message}`);
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
      showError("Название услуги не может быть пустым");
      return;
    }
    try {
      const response = await fetch(
        `${API_BASE}/services/${editingService.id}`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
            accept: "application/json",
          },
          body: JSON.stringify({
            service_name: editingService.service_name,
            duration: editingService.duration,
          }),
        }
      );
      if (!response.ok) throw new Error("Не удалось обновить услугу");
      const updated = await response.json();
      setServices(services.map((s) => (s.id === updated.id ? updated : s)));
      setEditingService(null);
      showSuccess("Услуга успешно обновлена");
    } catch (err) {
      console.error(err);
      showError(`Ошибка при обновлении услуги: ${err.message}`);
    }
  };

  const handleDeleteService = async (id) => {
    if (!window.confirm("Вы уверены, что хотите удалить эту услугу?")) return;
    try {
      const response = await fetch(`${API_BASE}/services/${id}`, {
        method: "DELETE",
        headers: { accept: "/" },
      });
      if (!response.ok) throw new Error("Не удалось удалить услугу");
      setServices(services.filter((s) => s.id !== id));
      showSuccess("Услуга успешно удалена");
    } catch (err) {
      console.error(err);
      showError(`Ошибка при удалении услуги: ${err.message}`);
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
}

export default ServiceManager;
