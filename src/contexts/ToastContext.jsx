/**
 * Контекст для работы с уведомлениями (Toast)
 */
import React, { createContext, useState, useContext } from 'react';
import Toast from '../components/ui/Toast/Toast';

// Создаем контекст для Toast
const ToastContext = createContext();

/**
 * Кастомный хук для использования Toast в компонентах
 * @returns {Object} - методы для показа уведомлений
 */
export const useToast = () => useContext(ToastContext);

/**
 * Провайдер для системы уведомлений
 * @param {Object} props - свойства компонента
 * @param {React.ReactNode} props.children - дочерние элементы
 */
export const ToastProvider = ({ children }) => {
  const [toasts, setToasts] = useState([]);

  /**
   * Добавляет новое уведомление
   * @param {string} message - текст уведомления
   * @param {string} type - тип уведомления (info, success, error, warning)
   * @param {number} duration - длительность показа в миллисекундах
   * @returns {string} - ID созданного уведомления
   */
  const addToast = (message, type = 'info', duration = 3000) => {
    const id = Math.random().toString(36).substring(2, 9);
    setToasts(prev => [...prev, { id, message, type, duration }]);
    return id;
  };

  /**
   * Удаляет уведомление по ID
   * @param {string} id - ID уведомления для удаления
   */
  const removeToast = (id) => {
    setToasts(prev => prev.filter(toast => toast.id !== id));
  };

  // Методы для различных типов уведомлений
  const showSuccess = (message, duration) => addToast(message, 'success', duration);
  const showError = (message, duration) => addToast(message, 'error', duration);
  const showWarning = (message, duration) => addToast(message, 'warning', duration);
  const showInfo = (message, duration) => addToast(message, 'info', duration);

  return (
    <ToastContext.Provider value={{ showSuccess, showError, showWarning, showInfo }}>
      {children}
      <div className="toast-container">
        {toasts.map(toast => (
          <Toast
            key={toast.id}
            message={toast.message}
            type={toast.type}
            duration={toast.duration}
            onClose={() => removeToast(toast.id)}
          />
        ))}
      </div>
    </ToastContext.Provider>
  );
};

export default ToastContext;
