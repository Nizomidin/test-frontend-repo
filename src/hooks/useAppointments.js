/**
 * Кастомный хук для работы с бронированиями
 */
import { useState, useEffect } from 'react';
import bookingService from '../services/bookingService';

/**
 * Хук для получения и управления бронированиями
 * @param {string|number} masterId - ID мастера
 * @param {Object} initialFilters - начальные фильтры (дата, статус и т.д.)
 * @returns {Object} - бронирования и методы управления ими
 */
const useAppointments = (masterId, initialFilters = {}) => {
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filters, setFilters] = useState(initialFilters);

  useEffect(() => {
    if (!masterId) return;
      const fetchAppointments = async () => {
      try {
        setLoading(true);
        const data = await bookingService.getMasterBookings(masterId, filters);
        setAppointments(bookingService.formatBookingData(data));
      } catch (err) {
        setError(err.message || 'Ошибка при загрузке бронирований');
        console.error('useAppointments error:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchAppointments();
  }, [masterId, filters]);

  /**
   * Обновить фильтры бронирований
   * @param {Object} newFilters - новые фильтры
   */
  const updateFilters = (newFilters) => {
    setFilters(prev => ({
      ...prev,
      ...newFilters
    }));
  };

  /**
   * Создать новое бронирование
   * @param {Object} bookingData - данные бронирования
   */  const createBooking = async (bookingData) => {
    try {
      setLoading(true);
      const newBooking = await bookingService.createBooking(bookingData);
      const formattedBooking = bookingService.formatBookingData(newBooking);
      setAppointments(prev => [...prev, formattedBooking]);
      return formattedBooking;
    } catch (err) {
      setError(err.message || 'Ошибка при создании бронирования');
      console.error('createBooking error:', err);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  /**
   * Создать кастомное бронирование
   * @param {Object} bookingData - данные кастомного бронирования
   */  const createCustomBooking = async (bookingData) => {
    try {
      setLoading(true);
      const newBooking = await bookingService.createCustomBooking(masterId, bookingData);
      const formattedBooking = bookingService.formatBookingData(newBooking);
      setAppointments(prev => [...prev, formattedBooking]);
      return formattedBooking;
    } catch (err) {
      setError(err.message || 'Ошибка при создании кастомного бронирования');
      console.error('createCustomBooking error:', err);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  /**
   * Обновить бронирование
   * @param {string} type - тип бронирования (booking, custom, block)
   * @param {string|number} id - ID бронирования
   * @param {Object} data - новые данные
   */  const updateAppointment = async (type, id, data) => {
    try {
      setLoading(true);
      const updatedBooking = await bookingService.updateAppointment(type, id, data);
      const formattedBooking = bookingService.formatBookingData(updatedBooking);
      setAppointments(prev => 
        prev.map(booking => 
          booking.id === id ? formattedBooking : booking
        )
      );
      return formattedBooking;
    } catch (err) {
      setError(err.message || 'Ошибка при обновлении бронирования');
      console.error('updateAppointment error:', err);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  /**
   * Удалить бронирование
   * @param {string} type - тип бронирования (booking, custom, block)
   * @param {string|number} id - ID бронирования
   */  const deleteAppointment = async (type, id) => {
    try {
      setLoading(true);
      await bookingService.deleteAppointment(type, id);
      setAppointments(prev => prev.filter(booking => booking.id !== id));
      return true;
    } catch (err) {
      setError(err.message || 'Ошибка при удалении бронирования');
      console.error('deleteAppointment error:', err);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  /**
   * Блокировать время в календаре
   * @param {Object} blockData - данные блокировки
   */  const blockTime = async (blockData) => {
    try {
      setLoading(true);
      const newBlock = await bookingService.blockTime(masterId, blockData);
      const formattedBlock = bookingService.formatBookingData(newBlock);
      setAppointments(prev => [...prev, formattedBlock]);
      return formattedBlock;
    } catch (err) {
      setError(err.message || 'Ошибка при блокировке времени');
      console.error('blockTime error:', err);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  /**
   * Получить доступные слоты для бронирования
   * @param {string} date - дата в формате YYYY-MM-DD
   * @param {number} duration - продолжительность в минутах
   */  const getAvailableSlots = async (date, duration) => {
    try {
      return await bookingService.getAvailableSlots(masterId, date, duration);
    } catch (err) {
      setError(err.message || 'Ошибка при получении доступных слотов');
      console.error('getAvailableSlots error:', err);
      throw err;
    }
  };

  return {
    appointments,
    loading,
    error,
    updateFilters,
    createBooking,
    createCustomBooking,
    updateAppointment,
    deleteAppointment,
    blockTime,
    getAvailableSlots,    refresh: () => {
      setLoading(true);
      bookingService.getMasterBookings(masterId, filters)
        .then(data => setAppointments(bookingService.formatBookingData(data)))
        .catch(err => setError(err.message))
        .finally(() => setLoading(false));
    }
  };
};

export default useAppointments;
