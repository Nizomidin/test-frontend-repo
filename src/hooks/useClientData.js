/**
 * Кастомный хук для работы с данными клиента
 */
import { useState, useEffect } from 'react';
import clientService from '../services/clientService';
import bookingService from '../services/bookingService';

/**
 * Хук для получения и управления данными клиента
 * @param {string|number} clientId - ID клиента
 * @returns {Object} - данные клиента и методы управления
 */
const useClientData = (clientId) => {
  const [clientData, setClientData] = useState(null);
  const [bookingHistory, setBookingHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!clientId) return;
    
    const fetchClientData = async () => {      try {
        setLoading(true);
        
        // Параллельно загружаем данные клиента и историю бронирований
        const [clientInfo, historyData] = await Promise.all([
          clientService.getClientById(clientId),
          bookingService.getMasterBookings(null, { client_id: clientId })
        ]);
        
        setClientData(clientInfo);
        setBookingHistory(bookingService.formatBookingData(historyData));
      } catch (err) {
        setError(err.message || 'Ошибка при загрузке данных клиента');
        console.error('useClientData error:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchClientData();
  }, [clientId]);

  /**
   * Обновить данные клиента
   * @param {Object} newData - новые данные клиента
   */  const updateClient = async (newData) => {
    try {
      setLoading(true);
      const updatedClient = await clientService.updateClient(clientId, newData);
      setClientData(updatedClient);
      return updatedClient;
    } catch (err) {
      setError(err.message || 'Ошибка при обновлении данных клиента');
      console.error('updateClient error:', err);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  /**
   * Загрузить фото клиента
   * @param {FormData} formData - данные формы с фото
   */  const uploadPhoto = async (formData) => {
    try {
      setLoading(true);
      const result = await clientService.uploadPhoto(clientId, formData);
      setClientData(prev => ({
        ...prev,
        photoUrl: result.photoUrl
      }));
      return result;
    } catch (err) {
      setError(err.message || 'Ошибка при загрузке фото');
      console.error('uploadPhoto error:', err);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  /**
   * Создать новое бронирование для клиента
   * @param {Object} bookingData - данные бронирования
   */  const createBooking = async (bookingData) => {
    try {
      setLoading(true);
      const newBooking = await bookingService.createBooking({
        ...bookingData,
        clientId
      });
      const formattedBooking = bookingService.formatBookingData(newBooking);
      setBookingHistory(prev => [...prev, formattedBooking]);
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
   * Обновить бронирование клиента
   * @param {string|number} bookingId - ID бронирования
   * @param {Object} bookingData - новые данные бронирования
   */  const updateBooking = async (bookingId, bookingData) => {
    try {
      setLoading(true);
      const updatedBooking = await bookingService.updateAppointment('booking', bookingId, bookingData);
      const formattedBooking = bookingService.formatBookingData(updatedBooking);
      setBookingHistory(prev => 
        prev.map(booking => 
          booking.id === bookingId ? formattedBooking : booking
        )
      );
      return formattedBooking;
    } catch (err) {
      setError(err.message || 'Ошибка при обновлении бронирования');
      console.error('updateBooking error:', err);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  /**
   * Отменить бронирование
   * @param {string|number} bookingId - ID бронирования
   */  const cancelBooking = async (bookingId) => {
    try {
      setLoading(true);
      await bookingService.deleteAppointment('booking', bookingId);
      setBookingHistory(prev => prev.filter(booking => booking.id !== bookingId));
      return true;
    } catch (err) {
      setError(err.message || 'Ошибка при отмене бронирования');
      console.error('cancelBooking error:', err);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return {
    clientData,
    bookingHistory,
    loading,
    error,
    updateClient,
    uploadPhoto,
    createBooking,
    updateBooking,
    cancelBooking,    refresh: () => {
      setLoading(true);
      Promise.all([
        clientService.getClientById(clientId),
        bookingService.getMasterBookings(null, { clientId })
      ])
        .then(([clientData, history]) => {
          setClientData(clientData);
          setBookingHistory(bookingService.formatBookingData(history));
        })
        .catch(err => setError(err.message))
        .finally(() => setLoading(false));
    }
  };
};

export default useClientData;
