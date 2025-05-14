/**
 * Компонент уведомления (Toast)
 */
import React, { useEffect, useState } from 'react';
import './Toast.css';

/**
 * Компонент для отображения всплывающих уведомлений
 * @param {Object} props - свойства компонента
 * @param {string} props.message - сообщение уведомления
 * @param {string} props.type - тип уведомления (info, success, error, warning)
 * @param {number} props.duration - длительность показа в миллисекундах
 * @param {Function} props.onClose - функция, вызываемая при закрытии уведомления
 */
const Toast = ({ message, type = 'info', duration = 3000, onClose }) => {
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setVisible(false);
      setTimeout(() => {
        onClose?.();
      }, 300); // Время анимации исчезновения
    }, duration);

    return () => clearTimeout(timer);
  }, [duration, onClose]);

  return (
    <div className={`toast toast-${type} ${visible ? 'visible' : 'hidden'}`}>
      <div className="toast-content">
        {type === 'success' && <span className="toast-icon">✓</span>}
        {type === 'error' && <span className="toast-icon">✗</span>}
        {type === 'warning' && <span className="toast-icon">⚠</span>}
        {type === 'info' && <span className="toast-icon">ℹ</span>}
        <span className="toast-message">{message}</span>
      </div>
    </div>
  );
};

export default Toast;
