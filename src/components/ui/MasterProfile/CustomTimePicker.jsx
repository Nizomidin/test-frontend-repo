/**
 * Компонент для выбора времени в кастомном формате
 */
import React, { useState, useEffect } from 'react';
import './CustomTimePicker.css';

/**
 * Компонент для выбора времени с разделенными полями часов и минут
 * @param {Object} props - Свойства компонента
 * @param {string} props.value - Текущее значение времени в формате "HH:MM"
 * @param {Function} props.onChange - Обработчик изменения времени
 * @param {number} props.interval - Интервал минут (по умолчанию 5)
 * @param {boolean} props.required - Обязательное ли поле
 * @param {boolean} props.disabled - Отключено ли поле
 */
const CustomTimePicker = ({ 
  value = '', 
  onChange, 
  interval = 5, 
  required = false,
  disabled = false
}) => {
  // Разделяем входное значение на часы и минуты
  const [hours, setHours] = useState('');
  const [minutes, setMinutes] = useState('');
  
  // Обновляем внутреннее состояние при изменении значения извне
  useEffect(() => {
    if (value) {
      const [h, m] = value.split(':');
      setHours(h || '');
      setMinutes(m || '');
    } else {
      setHours('');
      setMinutes('');
    }
  }, [value]);
  
  // Генерация опций для часов (0-23)
  const generateHoursOptions = () => {
    const options = [];
    for (let hour = 0; hour < 24; hour++) {
      options.push(hour.toString().padStart(2, '0'));
    }
    return options;
  };

  // Генерация опций для минут с заданным интервалом
  const generateMinutesOptions = () => {
    const options = [];
    for (let minute = 0; minute < 60; minute += interval) {
      options.push(minute.toString().padStart(2, '0'));
    }
    return options;
  };
  
  // Опции для селектов
  const hoursOptions = generateHoursOptions();
  const minutesOptions = generateMinutesOptions();
  
  // Обработчик изменения часов
  const handleHoursChange = (e) => {
    const newHours = e.target.value;
    setHours(newHours);
    
    // Вызываем onChange только если у нас есть и часы и минуты
    if (newHours && minutes) {
      onChange(`${newHours}:${minutes}`);
    } else if (onChange && !newHours && !minutes) {
      // Если оба поля пустые, передаем пустое значение
      onChange('');
    }
  };
  
  // Обработчик изменения минут
  const handleMinutesChange = (e) => {
    const newMinutes = e.target.value;
    setMinutes(newMinutes);
    
    // Вызываем onChange только если у нас есть и часы и минуты
    if (hours && newMinutes) {
      onChange(`${hours}:${newMinutes}`);
    } else if (onChange && !hours && !newMinutes) {
      // Если оба поля пустые, передаем пустое значение
      onChange('');
    }
  };
  
  return (
    <div className="custom-time-picker">
      <select
        className="time-select hours-select"
        value={hours}
        onChange={handleHoursChange}
        required={required}
        disabled={disabled}
      >
        <option value="">Час</option>
        {hoursOptions.map(hour => (
          <option key={hour} value={hour}>
            {hour}
          </option>
        ))}
      </select>
      
      <span className="time-separator">:</span>
      
      <select
        className="time-select minutes-select"
        value={minutes}
        onChange={handleMinutesChange}
        required={required}
        disabled={disabled}
      >
        <option value="">Мин</option>
        {minutesOptions.map(minute => (
          <option key={minute} value={minute}>
            {minute}
          </option>
        ))}
      </select>
    </div>
  );
};

export default CustomTimePicker;
