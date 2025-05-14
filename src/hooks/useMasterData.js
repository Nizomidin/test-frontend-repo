/**
 * Кастомный хук для работы с данными мастера
 */
import { useState, useEffect } from 'react';
import masterApi from '../api/masterApi';

/**
 * Хук для получения и управления данными мастера
 * @param {string|number} masterId - ID мастера
 * @returns {Object} - данные мастера и состояние запроса
 */
const useMasterData = (masterId) => {
  const [masterData, setMasterData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchMasterData = async () => {
      try {
        setLoading(true);
        if (!masterId) {
          // Если masterId не передан, пытаемся взять его из localStorage
          const storedMasterId = localStorage.getItem('masterId');
          if (!storedMasterId) {
            throw new Error('Не указан ID мастера');
          }
          
          const data = await masterApi.fetchMaster(storedMasterId);
          setMasterData(data);
        } else {
          const data = await masterApi.fetchMaster(masterId);
          setMasterData(data);
        }
      } catch (err) {
        setError(err.message || 'Ошибка при загрузке данных мастера');
        console.error('useMasterData error:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchMasterData();
  }, [masterId]);

  /**
   * Обновить данные мастера
   * @param {Object} newData - новые данные мастера
   */
  const updateMaster = async (newData) => {
    try {
      setLoading(true);
      const id = masterId || masterData?._id || localStorage.getItem('masterId');
      if (!id) {
        throw new Error('Не удалось определить ID мастера');
      }
      
      const updatedData = await masterApi.updateMaster(id, newData);
      setMasterData(updatedData);
      return updatedData;
    } catch (err) {
      setError(err.message || 'Ошибка при обновлении данных мастера');
      console.error('updateMaster error:', err);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  /**
   * Обновить рабочее расписание мастера
   * @param {Object} scheduleData - данные расписания
   */
  const updateSchedule = async (scheduleData) => {
    try {
      setLoading(true);
      const id = masterId || masterData?._id || localStorage.getItem('masterId');
      if (!id) {
        throw new Error('Не удалось определить ID мастера');
      }
      
      const updatedData = await masterApi.updateWorkSchedule(id, scheduleData);
      setMasterData(prev => ({
        ...prev,
        workSchedule: updatedData.workSchedule
      }));
      return updatedData;
    } catch (err) {
      setError(err.message || 'Ошибка при обновлении расписания');
      console.error('updateSchedule error:', err);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  /**
   * Загрузить фото мастера
   * @param {FormData} formData - данные формы с фото
   */
  const uploadPhoto = async (formData) => {
    try {
      setLoading(true);
      const id = masterId || masterData?._id || localStorage.getItem('masterId');
      if (!id) {
        throw new Error('Не удалось определить ID мастера');
      }
      
      const result = await masterApi.uploadPhoto(id, formData);
      setMasterData(prev => ({
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
   * Отметить день как выходной
   * @param {string} date - дата в формате YYYY-MM-DD
   */
  const markDayOff = async (date) => {
    try {
      const id = masterId || masterData?._id || localStorage.getItem('masterId');
      if (!id) {
        throw new Error('Не удалось определить ID мастера');
      }
      
      await masterApi.markDayOff(id, date);
      // Обновляем данные мастера, чтобы получить актуальное расписание
      const updatedData = await masterApi.fetchMaster(id);
      setMasterData(updatedData);
      return true;
    } catch (err) {
      setError(err.message || 'Ошибка при отметке выходного дня');
      console.error('markDayOff error:', err);
      throw err;
    }
  };

  /**
   * Убрать отметку выходного дня
   * @param {string} date - дата в формате YYYY-MM-DD
   */
  const removeDayOff = async (date) => {
    try {
      const id = masterId || masterData?._id || localStorage.getItem('masterId');
      if (!id) {
        throw new Error('Не удалось определить ID мастера');
      }
      
      await masterApi.removeDayOff(id, date);
      // Обновляем данные мастера, чтобы получить актуальное расписание
      const updatedData = await masterApi.fetchMaster(id);
      setMasterData(updatedData);
      return true;
    } catch (err) {
      setError(err.message || 'Ошибка при удалении отметки выходного дня');
      console.error('removeDayOff error:', err);
      throw err;
    }
  };

  return {
    masterData,
    loading,
    error,
    updateMaster,
    updateSchedule,
    uploadPhoto,
    markDayOff,
    removeDayOff,
    refresh: () => {
      setLoading(true);
      masterApi.fetchMaster(masterId || masterData?._id || localStorage.getItem('masterId'))
        .then(data => setMasterData(data))
        .catch(err => setError(err.message))
        .finally(() => setLoading(false));
    }
  };
};

export default useMasterData;
