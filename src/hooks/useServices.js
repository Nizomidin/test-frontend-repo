/**
 * Кастомный хук для работы с услугами
 */
import { useState, useEffect } from 'react';
import serviceService from '../services/serviceService';

/**
 * Хук для получения и управления услугами мастера
 * @param {string|number} masterId - ID мастера
 * @returns {Object} - услуги и методы управления ими
 */
const useServices = (masterId) => {
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!masterId) return;
      const fetchServices = async () => {
      try {
        setLoading(true);
        const data = await serviceService.getMasterServices(masterId);
        setServices(data);
      } catch (err) {
        setError(err.message || 'Ошибка при загрузке услуг');
        console.error('useServices error:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchServices();
  }, [masterId]);

  /**
   * Создать новую услугу
   * @param {Object} serviceData - данные услуги
   */  const createService = async (serviceData) => {
    try {
      setLoading(true);
      const newService = await serviceService.createService(masterId, serviceData);
      setServices(prev => [...prev, newService]);
      return newService;
    } catch (err) {
      setError(err.message || 'Ошибка при создании услуги');
      console.error('createService error:', err);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  /**
   * Обновить услугу
   * @param {string|number} serviceId - ID услуги
   * @param {Object} serviceData - новые данные
   */  const updateService = async (serviceId, serviceData) => {
    try {
      setLoading(true);
      const updatedService = await serviceService.updateService(serviceId, serviceData);
      setServices(prev => 
        prev.map(service => 
          service.id === serviceId ? updatedService : service
        )
      );
      return updatedService;
    } catch (err) {
      setError(err.message || 'Ошибка при обновлении услуги');
      console.error('updateService error:', err);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  /**
   * Удалить услугу
   * @param {string|number} serviceId - ID услуги
   */  const deleteService = async (serviceId) => {
    try {
      setLoading(true);
      await serviceService.deleteService(serviceId);
      setServices(prev => prev.filter(service => service.id !== serviceId));
      return true;
    } catch (err) {
      setError(err.message || 'Ошибка при удалении услуги');
      console.error('deleteService error:', err);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return {
    services,
    loading,
    error,
    createService,
    updateService,
    deleteService,    refresh: () => {
      setLoading(true);
      serviceService.getMasterServices(masterId)
        .then(data => setServices(data))
        .catch(err => setError(err.message))
        .finally(() => setLoading(false));
    }
  };
};

export default useServices;
