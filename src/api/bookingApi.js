/**
 * API-модуль для работы с бронированиями
 */
import { fetchAPI, postAPI, putAPI, deleteAPI } from './apiConfig';

/**
 * Модуль для работы с API бронирований
 */
const bookingApi = {
  /**
   * Получить все бронирования мастера
   * @param {string|number} masterId - ID мастера
   * @param {Object} params - параметры запроса (дата, статус и т.д.)
   * @returns {Promise<Array>} - список бронирований
   */
  fetchMasterBookings: (masterId, params = {}) => {
    return fetchAPI(`/masters/${masterId}/bookings`, params);
  },

  /**
   * Получить бронирование по ID
   * @param {string|number} bookingId - ID бронирования
   * @returns {Promise<Object>} - данные бронирования
   */
  fetchBooking: (bookingId) => {
    return fetchAPI(`/bookings/${bookingId}`);
  },

  /**
   * Создать новое бронирование
   * @param {Object} bookingData - данные бронирования
   * @returns {Promise<Object>} - созданное бронирование
   */
  createBooking: (bookingData) => {
    return postAPI('/bookings', bookingData);
  },

  /**
   * Создать кастомное бронирование (без привязки к услуге)
   * @param {string|number} masterId - ID мастера
   * @param {Object} bookingData - данные бронирования
   * @returns {Promise<Object>} - созданное бронирование
   */
  createCustomBooking: (masterId, bookingData) => {
    return postAPI(`/masters/${masterId}/custom-booking`, bookingData);
  },

  /**
   * Обновить бронирование
   * @param {string|number} bookingId - ID бронирования
   * @param {Object} bookingData - обновленные данные
   * @returns {Promise<Object>} - обновленное бронирование
   */
  updateBooking: (bookingId, bookingData) => {
    return putAPI(`/bookings/${bookingId}`, bookingData);
  },

  /**
   * Удалить бронирование
   * @param {string|number} bookingId - ID бронирования
   * @returns {Promise<Object>} - результат удаления
   */
  deleteBooking: (bookingId) => {
    return deleteAPI(`/bookings/${bookingId}`);
  },

  /**
   * Получить доступные временные слоты для бронирования
   * @param {string|number} masterId - ID мастера
   * @param {string} date - дата в формате YYYY-MM-DD
   * @param {number} duration - продолжительность услуги в минутах
   * @returns {Promise<Array>} - список доступных слотов
   */
  getAvailableSlots: (masterId, date, duration) => {
    return fetchAPI(`/masters/${masterId}/available-slots`, { date, duration });
  },

  /**
   * Блокировать время в календаре мастера
   * @param {string|number} masterId - ID мастера
   * @param {Object} blockData - данные блокировки (дата, время, длительность)
   * @returns {Promise<Object>} - результат блокировки
   */
  blockTime: (masterId, blockData) => {
    return postAPI(`/masters/${masterId}/block-time`, blockData);
  },

  /**
   * Разблокировать время в календаре мастера
   * @param {string|number} blockId - ID блокировки
   * @returns {Promise<Object>} - результат разблокировки
   */
  unblockTime: (blockId) => {
    return deleteAPI(`/time-blocks/${blockId}`);
  },

  /**
   * Получить историю бронирований клиента
   * @param {string|number} clientId - ID клиента
   * @returns {Promise<Array>} - список бронирований клиента
   */
  fetchClientBookingHistory: (clientId) => {
    return fetchAPI(`/clients/${clientId}/booking-history`);
  },
  
  /**
   * Обновить бронирование (универсальный метод)
   * @param {string} type - тип бронирования (booking, custom, block)
   * @param {string|number} id - ID бронирования
   * @param {Object} data - данные для обновления
   * @returns {Promise<Object>} - результат операции
   */
  updateAppointment: (type, id, data) => {
    const endpoints = {
      booking: `/bookings/${id}`,
      custom: `/custom-bookings/${id}`,
      block: `/time-blocks/${id}`
    };
    
    return putAPI(endpoints[type], data);
  },
  
  /**
   * Удалить бронирование (универсальный метод)
   * @param {string} type - тип бронирования (booking, custom, block)
   * @param {string|number} id - ID бронирования
   * @returns {Promise<Object>} - результат операции
   */
  deleteAppointment: (type, id) => {
    const endpoints = {
      booking: `/bookings/${id}`,
      custom: `/custom-bookings/${id}`,
      block: `/time-blocks/${id}`
    };
    
    return deleteAPI(endpoints[type]);
  }
};

export default bookingApi;
