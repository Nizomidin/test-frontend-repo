/**
 * Утилиты для работы с датами и временем
 * @module dateUtils
 */
import { 
  parseISO, 
  format, 
  addMinutes, 
  addDays, 
  isValid, 
  startOfDay, 
  isAfter, 
  isBefore,
  isEqual,
  addMonths,
  differenceInMinutes
} from 'date-fns';
import { ru } from 'date-fns/locale';

/**
 * Преобразует строку с датой в объект Date
 * @param {string} dateString - строка с датой в любом формате
 * @returns {Date} - распарсенная дата или новый объект Date, если парсинг не удался
 */
export const parseDateTime = (dateString) => {
  // Проверяем, что dateString - строка
  if (typeof dateString !== 'string') {
    return dateString instanceof Date ? dateString : new Date();
  }

  try {
    // Пробуем распарсить ISO формат
    const parsedDate = parseISO(dateString);
    
    // Проверяем валидность даты
    if (isValid(parsedDate)) {
      return parsedDate;
    }
    
    // Если это не ISO формат, пробуем встроенный парсер
    const fallbackDate = new Date(dateString);
    
    return isValid(fallbackDate) ? fallbackDate : new Date();
  } catch (error) {
    console.error('Error parsing date:', error);
    return new Date();
  }
};

/**
 * Форматирует дату в нужный формат
 * @param {Date|string} date - дата для форматирования
 * @param {string} formatStr - строка формата (см. date-fns format)
 * @param {Object} options - дополнительные опции форматирования
 * @returns {string} - отформатированная дата
 */
export const formatDateTime = (date, formatStr = 'dd.MM.yyyy HH:mm', options = {}) => {
  try {
    // Если date не является экземпляром Date, пытаемся преобразовать
    const parsedDate = date instanceof Date ? date : parseDateTime(date);
    
    // Форматируем с локализацией по умолчанию
    return format(parsedDate, formatStr, { 
      locale: ru,
      ...options 
    });
  } catch (error) {
    console.error('Error formatting date:', error);
    return '';
  }
};

/**
 * Форматирует дату в формат "13 марта 2023"
 * @param {Date|string} date - дата для форматирования
 * @returns {string} - отформатированная дата
 */
export const formatDateFull = (date) => {
  return formatDateTime(date, 'd MMMM yyyy');
};

/**
 * Форматирует дату в формат "13.03.2023"
 * @param {Date|string} date - дата для форматирования
 * @returns {string} - отформатированная дата
 */
export const formatDateShort = (date) => {
  return formatDateTime(date, 'dd.MM.yyyy');
};

/**
 * Форматирует время в формат "14:30"
 * @param {Date|string} time - время для форматирования
 * @returns {string} - отформатированное время
 */
export const formatTimeShort = (time) => {
  return formatDateTime(time, 'HH:mm');
};

/**
 * Добавляет указанное количество минут к дате
 * @param {Date|string} date - исходная дата
 * @param {number} minutes - количество минут для добавления
 * @returns {Date} - новая дата
 */
export const addTimeMinutes = (date, minutes) => {
  const parsedDate = date instanceof Date ? date : parseDateTime(date);
  return addMinutes(parsedDate, minutes);
};

/**
 * Получает разницу между датами в минутах
 * @param {Date|string} dateLeft - первая дата
 * @param {Date|string} dateRight - вторая дата
 * @returns {number} - разница в минутах
 */
export const getDurationMinutes = (dateLeft, dateRight) => {
  const parsedLeft = dateLeft instanceof Date ? dateLeft : parseDateTime(dateLeft);
  const parsedRight = dateRight instanceof Date ? dateRight : parseDateTime(dateRight);
  return differenceInMinutes(parsedLeft, parsedRight);
};

/**
 * Проверяет, соответствует ли дата формату "YYYY-MM-DD"
 * @param {string} dateString - строка с датой для проверки
 * @returns {boolean} - результат проверки
 */
export const isValidDateFormat = (dateString) => {
  // Паттерн для проверки формата YYYY-MM-DD
  const datePattern = /^\d{4}-\d{2}-\d{2}$/;
  
  if (!datePattern.test(dateString)) {
    return false;
  }
  
  // Проверяем валидность даты
  const date = parseISO(dateString);
  return isValid(date);
};

/**
 * Проверяет, соответствует ли время формату "HH:MM" (24-часовой формат)
 * @param {string} timeString - строка с временем для проверки
 * @returns {boolean} - результат проверки
 */
export const isValidTimeFormat = (timeString) => {
  // Паттерн для проверки формата HH:MM
  const timePattern = /^([01]\d|2[0-3]):([0-5]\d)$/;
  return timePattern.test(timeString);
};

/**
 * Преобразует массив строк с временем в объекты Date
 * @param {Array<string>} timeStrings - массив строк с временем в формате "HH:MM"
 * @param {Date|string} baseDate - базовая дата для установки времени
 * @returns {Array<Date>} - массив объектов Date
 */
export const parseTimeStringsToDate = (timeStrings, baseDate) => {
  const parsedBaseDate = baseDate instanceof Date ? baseDate : parseDateTime(baseDate);
  const baseDateStart = startOfDay(parsedBaseDate);
  
  return timeStrings
    .filter(timeStr => isValidTimeFormat(timeStr))
    .map(timeStr => {
      const [hours, minutes] = timeStr.split(':').map(Number);
      return addMinutes(addMinutes(baseDateStart, hours * 60), minutes);
    });
};

export default {
  parseDateTime,
  formatDateTime,
  formatDateFull,
  formatDateShort,
  formatTimeShort,
  addTimeMinutes,
  getDurationMinutes,
  isValidDateFormat,
  isValidTimeFormat,
  parseTimeStringsToDate
};
