/**
 * Сервис для бизнес-логики, связанной с бронированиями
 */
import bookingApi from '../api/bookingApi';

/**
 * Сервис для работы с бронированиями
 */
const bookingService = {
  /**
   * Получить все бронирования мастера с фильтрацией
   * @param {string|number} masterId - ID мастера
   * @param {Object} filters - параметры фильтрации (дата, статус и т.д.)
   * @returns {Promise<Array>} - отфильтрованные бронирования
   */
  getMasterBookings: async (masterId, filters = {}) => {
    try {
      const bookings = await bookingApi.fetchMasterBookings(masterId, filters);
      return bookings;
    } catch (error) {
      console.error('getMasterBookings error:', error);
      throw error;
    }
  },

  /**
   * Создает новое бронирование
   * @param {Object} bookingData - данные бронирования
   * @returns {Promise<Object>} - созданное бронирование
   */
  createBooking: async (bookingData) => {
    try {
      const newBooking = await bookingApi.createBooking(bookingData);
      return newBooking;
    } catch (error) {
      console.error('createBooking error:', error);
      throw error;
    }
  },

  /**
   * Создает кастомное бронирование (без привязки к услуге)
   * @param {string|number} masterId - ID мастера
   * @param {Object} bookingData - данные бронирования
   * @returns {Promise<Object>} - созданное бронирование
   */
  createCustomBooking: async (masterId, bookingData) => {
    try {
      const newBooking = await bookingApi.createCustomBooking(masterId, bookingData);
      return newBooking;
    } catch (error) {
      console.error('createCustomBooking error:', error);
      throw error;
    }
  },

  /**
   * Обновляет существующее бронирование
   * @param {string} type - тип бронирования (booking, custom, block)
   * @param {string|number} id - ID бронирования
   * @param {Object} data - обновленные данные
   * @returns {Promise<Object>} - обновленное бронирование
   */
  updateAppointment: async (type, id, data) => {
    try {
      const updatedBooking = await bookingApi.updateAppointment(type, id, data);
      return updatedBooking;
    } catch (error) {
      console.error('updateAppointment error:', error);
      throw error;
    }
  },

  /**
   * Удаляет бронирование
   * @param {string} type - тип бронирования (booking, custom, block)
   * @param {string|number} id - ID бронирования
   * @returns {Promise<Object>} - результат удаления
   */
  deleteAppointment: async (type, id) => {
    try {
      const result = await bookingApi.deleteAppointment(type, id);
      return result;
    } catch (error) {
      console.error('deleteAppointment error:', error);
      throw error;
    }
  },

  /**
   * Получает доступные временные слоты для бронирования
   * @param {string|number} masterId - ID мастера
   * @param {string} date - дата в формате YYYY-MM-DD
   * @param {number} duration - продолжительность услуги в минутах
   * @returns {Promise<Array>} - список доступных слотов
   */
  getAvailableSlots: async (masterId, date, duration) => {
    try {
      const slots = await bookingApi.getAvailableSlots(masterId, date, duration);
      return slots;
    } catch (error) {
      console.error('getAvailableSlots error:', error);
      throw error;
    }
  },

  /**
   * Блокирует время в расписании мастера
   * @param {string|number} masterId - ID мастера
   * @param {Object} blockData - данные блокировки (дата, время, длительность)
   * @returns {Promise<Object>} - результат блокировки
   */
  blockTime: async (masterId, blockData) => {
    try {
      const result = await bookingApi.blockTime(masterId, blockData);
      return result;
    } catch (error) {
      console.error('blockTime error:', error);
      throw error;
    }
  },

  /**
   * Форматирует данные бронирования для отображения в UI
   * @param {Object|Array} bookingData - данные бронирования или массив бронирований
   * @returns {Object|Array} - отформатированные данные
   */
  formatBookingData: (bookingData) => {
    // Форматируем массив бронирований
    if (Array.isArray(bookingData)) {
      return bookingData.map(booking => bookingService.formatBookingData(booking));
    }
    
    // Форматируем одно бронирование
    if (!bookingData) return null;
    
    return {
      id: bookingData._id || bookingData.id,
      type: bookingData.type || 'booking',
      startTime: bookingData.start_time,
      endTime: bookingData.end_time,
      date: bookingData.date,
      status: bookingData.status,
      serviceName: bookingData.service_name,
      serviceId: bookingData.service_id,
      clientName: bookingData.client_name,
      clientId: bookingData.client_id,
      clientPhone: bookingData.client_phone,
      comments: bookingData.comments,
      price: bookingData.price
    };
  }
};

export default bookingService;
